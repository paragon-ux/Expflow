import { existsSync, readdirSync, rmSync } from 'node:fs';
import { hostname } from 'node:os';
import { basename } from 'node:path';
import { ExpflowError } from '../core/errors.js';
import { readJsonFile } from '../core/json.js';
import {
  isProjectInitialized,
  listRecoveryIntentPaths,
  listOperationReceipts,
  listTreeRevisionIds,
  readHead,
  readOperationReceipt,
  readProject,
  readProjectLock,
  readTreeRevision,
  removeOperationStaging,
  removeProjectLock,
  removeRecoveryIntent,
  storePaths,
  updateProjectHead,
  verifyTreeRevision,
  writeHead,
  writeProject,
} from '../material/store.js';
import { installRestoreWorkingTree } from './working-tree-restore.js';
import type {
  InitRecoveryIntentRecord,
  OperationReceiptRecord,
  RestoreRecoveryIntentRecord,
  TreeRevisionRecord,
} from '../material/types.js';

export type RecoveryClass =
  | 'uncommitted_stage'
  | 'objects_committed_records_incomplete'
  | 'tree_committed_head_not_advanced'
  | 'head_advanced_receipt_incomplete'
  | 'post_commit_automation_incomplete'
  | 'stale_lock'
  | 'live_lock'
  | 'malformed_lock'
  | 'init_publication_incomplete'
  | 'restore_working_tree_incomplete'
  | 'material_head_diverged';

export interface RecoveryFinding {
  readonly recovery_class: RecoveryClass;
  readonly repaired: boolean;
  readonly message: string;
}

export interface RecoveryReport {
  readonly checked_at: string;
  readonly findings: readonly RecoveryFinding[];
}

function isMaterialSuccessReceipt(receipt: OperationReceiptRecord): boolean {
  return (
    (receipt.status === 'committed' || receipt.status === 'partial_post_commit') &&
    receipt.new_head !== null &&
    receipt.new_head !== undefined
  );
}

function isPidLive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 'EPERM'
    );
  }
}

function receiptForOperation(
  projectRoot: string,
  operationId: string,
): OperationReceiptRecord | null {
  try {
    return readOperationReceipt(projectRoot, operationId);
  } catch (error) {
    if (error instanceof ExpflowError && error.code === 'operation_receipt_missing') {
      return null;
    }
    throw error;
  }
}

function recoverLock(projectRoot: string, findings: RecoveryFinding[]): boolean {
  try {
    const lock = readProjectLock(projectRoot);
    if (lock === null) {
      return true;
    }
    if (typeof lock.pid !== 'number') {
      findings.push({
        message: 'Lock file is malformed and was not removed.',
        recovery_class: 'malformed_lock',
        repaired: false,
      });
      return false;
    }
    if (lock.host !== undefined && lock.host !== hostname()) {
      findings.push({
        message: `Lock is owned by another host (${lock.host}) and was not removed.`,
        recovery_class: 'live_lock',
        repaired: false,
      });
      return false;
    }
    if (isPidLive(lock.pid)) {
      findings.push({
        message: `Lock owner pid ${String(lock.pid)} is still live and was not removed.`,
        recovery_class: 'live_lock',
        repaired: false,
      });
      return false;
    }
    removeProjectLock(projectRoot);
    findings.push({
      message: `Removed stale lock for non-live pid ${String(lock.pid)}.`,
      recovery_class: 'stale_lock',
      repaired: true,
    });
    return true;
  } catch (error) {
    if (error instanceof SyntaxError) {
      findings.push({
        message: 'Lock file is not valid JSON and was not removed.',
        recovery_class: 'malformed_lock',
        repaired: false,
      });
      return false;
    }
    throw error;
  }
}

function recoverInitIntent(
  projectRoot: string,
  intent: InitRecoveryIntentRecord,
  findings: RecoveryFinding[],
): boolean {
  const receipt = receiptForOperation(projectRoot, intent.operation_id);
  if (receipt === null || !isMaterialSuccessReceipt(receipt)) {
    removeRecoveryIntent(projectRoot, intent.operation_id);
    removeOperationStaging(projectRoot, intent.operation_id);
    findings.push({
      message: `Removed init intent ${intent.operation_id} before material commit.`,
      recovery_class: 'init_publication_incomplete',
      repaired: true,
    });
    return true;
  }
  if (receipt.new_head !== intent.target_head) {
    findings.push({
      message: `Init intent ${intent.operation_id} does not match committed receipt.`,
      recovery_class: 'init_publication_incomplete',
      repaired: false,
    });
    return false;
  }
  verifyTreeRevision(projectRoot, readTreeRevision(projectRoot, intent.target_head));
  if (!isProjectInitialized(projectRoot)) {
    writeProject(projectRoot, intent.project);
  } else if (readProject(projectRoot).head_tree_revision_id !== intent.target_head) {
    updateProjectHead(projectRoot, intent.target_head);
  }
  writeHead(projectRoot, intent.target_head);
  removeRecoveryIntent(projectRoot, intent.operation_id);
  removeOperationStaging(projectRoot, intent.operation_id);
  findings.push({
    message: `Completed interrupted project initialization ${intent.operation_id}.`,
    recovery_class: 'init_publication_incomplete',
    repaired: true,
  });
  return true;
}

function recoverRestoreIntent(
  projectRoot: string,
  intent: RestoreRecoveryIntentRecord,
  findings: RecoveryFinding[],
): boolean {
  const receipt = receiptForOperation(projectRoot, intent.operation_id);
  if (receipt === null || !isMaterialSuccessReceipt(receipt)) {
    removeRecoveryIntent(projectRoot, intent.operation_id);
    removeOperationStaging(projectRoot, intent.operation_id);
    findings.push({
      message: `Removed restore intent ${intent.operation_id} before material commit.`,
      recovery_class: 'restore_working_tree_incomplete',
      repaired: true,
    });
    return true;
  }
  if (receipt.new_head !== intent.target_head) {
    findings.push({
      message: `Restore intent ${intent.operation_id} does not match committed receipt.`,
      recovery_class: 'restore_working_tree_incomplete',
      repaired: false,
    });
    return false;
  }
  const targetTree = readTreeRevision(projectRoot, intent.target_head);
  verifyTreeRevision(projectRoot, targetTree);
  if (!restoreIntentMatchesTree(intent, targetTree)) {
    findings.push({
      message: `Restore intent ${intent.operation_id} does not match committed tree ${intent.target_head}.`,
      recovery_class: 'restore_working_tree_incomplete',
      repaired: false,
    });
    return false;
  }
  installRestoreWorkingTree(projectRoot, intent);
  writeHead(projectRoot, intent.target_head);
  updateProjectHead(projectRoot, intent.target_head);
  removeRecoveryIntent(projectRoot, intent.operation_id);
  removeOperationStaging(projectRoot, intent.operation_id);
  findings.push({
    message: `Completed interrupted restore ${intent.operation_id}.`,
    recovery_class: 'restore_working_tree_incomplete',
    repaired: true,
  });
  return true;
}

function recoverIntents(projectRoot: string, findings: RecoveryFinding[]): boolean {
  let allRecovered = true;
  for (const path of listRecoveryIntentPaths(projectRoot)) {
    const intent = readJsonFile(path) as { readonly intent_type?: string };
    if (intent.intent_type === 'init_project') {
      allRecovered =
        recoverInitIntent(projectRoot, intent as InitRecoveryIntentRecord, findings) &&
        allRecovered;
    } else if (intent.intent_type === 'restore_working_tree') {
      allRecovered =
        recoverRestoreIntent(projectRoot, intent as RestoreRecoveryIntentRecord, findings) &&
        allRecovered;
    } else {
      findings.push({
        message: `Unknown recovery intent ${basename(path)} was not removed.`,
        recovery_class: 'objects_committed_records_incomplete',
        repaired: false,
      });
      allRecovered = false;
    }
  }
  return allRecovered;
}

function restoreIntentMatchesTree(
  intent: RestoreRecoveryIntentRecord,
  tree: TreeRevisionRecord,
): boolean {
  const treeFiles = new Map(
    tree.entries
      .filter((entry) => entry.entry_kind === 'file')
      .map((entry) => [entry.relative_path, entry.node_content_digest ?? null]),
  );
  for (const file of intent.write_files) {
    if (treeFiles.get(file.relative_path) !== file.content_digest) {
      return false;
    }
  }
  for (const path of intent.delete_paths) {
    if (treeFiles.has(path)) {
      return false;
    }
  }
  return true;
}

interface VerifiedMaterialCandidate {
  readonly receipt: OperationReceiptRecord;
  readonly tree: TreeRevisionRecord;
}

function headValue(value: string | null | undefined): string | null {
  return value ?? null;
}

function verifiedCandidateForReceipt(
  projectRoot: string,
  receipt: OperationReceiptRecord,
  findings: RecoveryFinding[],
): VerifiedMaterialCandidate | null {
  const newHead = headValue(receipt.new_head);
  if (newHead === null) {
    return null;
  }
  try {
    const tree = readTreeRevision(projectRoot, newHead);
    verifyTreeRevision(projectRoot, tree);
    const expectedParent = headValue(receipt.previous_head);
    const actualParent = headValue(tree.parent_tree_revision_id);
    if (
      tree.tree_revision_id !== newHead ||
      tree.created_by_operation !== receipt.operation_id ||
      tree.project_id !== receipt.project_id ||
      actualParent !== expectedParent
    ) {
      findings.push({
        message: `Receipt ${receipt.operation_id} does not causally match tree ${newHead}.`,
        recovery_class: 'material_head_diverged',
        repaired: false,
      });
      return null;
    }
    return { receipt, tree };
  } catch (error) {
    if (error instanceof ExpflowError) {
      findings.push({
        message: error.message,
        recovery_class: 'tree_committed_head_not_advanced',
        repaired: false,
      });
      return null;
    }
    throw error;
  }
}

function chainIsValid(
  candidate: VerifiedMaterialCandidate,
  candidatesByHead: ReadonlyMap<string, VerifiedMaterialCandidate>,
  findings: RecoveryFinding[],
  memo: Map<string, boolean>,
  visiting: Set<string>,
): boolean {
  const head = candidate.tree.tree_revision_id;
  const cached = memo.get(head);
  if (cached !== undefined) {
    return cached;
  }
  if (visiting.has(head)) {
    findings.push({
      message: `Material tree chain contains a cycle at ${head}.`,
      recovery_class: 'material_head_diverged',
      repaired: false,
    });
    memo.set(head, false);
    return false;
  }
  visiting.add(head);
  const parentHead = headValue(candidate.tree.parent_tree_revision_id);
  if (parentHead === null) {
    const validRoot =
      candidate.tree.sequence === 1 && headValue(candidate.receipt.previous_head) === null;
    if (!validRoot) {
      findings.push({
        message: `Material root candidate ${head} has invalid sequence or previous head.`,
        recovery_class: 'material_head_diverged',
        repaired: false,
      });
    }
    visiting.delete(head);
    memo.set(head, validRoot);
    return validRoot;
  }

  const parent = candidatesByHead.get(parentHead);
  if (parent === undefined) {
    findings.push({
      message: `Material tree ${head} references parent ${parentHead} without a committed material-success receipt.`,
      recovery_class: 'material_head_diverged',
      repaired: false,
    });
    visiting.delete(head);
    memo.set(head, false);
    return false;
  }
  if (parent.tree.sequence + 1 !== candidate.tree.sequence) {
    findings.push({
      message: `Material tree ${head} sequence does not follow parent ${parentHead}.`,
      recovery_class: 'material_head_diverged',
      repaired: false,
    });
    visiting.delete(head);
    memo.set(head, false);
    return false;
  }
  const result = chainIsValid(parent, candidatesByHead, findings, memo, visiting);
  visiting.delete(head);
  memo.set(head, result);
  return result;
}

function latestCausalMaterialCandidate(
  projectRoot: string,
  findings: RecoveryFinding[],
): VerifiedMaterialCandidate | null {
  const candidates = listOperationReceipts(projectRoot)
    .filter(isMaterialSuccessReceipt)
    .map((operationReceipt) => verifiedCandidateForReceipt(projectRoot, operationReceipt, findings))
    .filter((candidate): candidate is VerifiedMaterialCandidate => candidate !== null);

  const candidatesByHead = new Map<string, VerifiedMaterialCandidate>();
  for (const candidate of candidates) {
    if (candidatesByHead.has(candidate.tree.tree_revision_id)) {
      findings.push({
        message: `Material tree ${candidate.tree.tree_revision_id} has multiple committed material-success receipts.`,
        recovery_class: 'material_head_diverged',
        repaired: false,
      });
      return null;
    }
    candidatesByHead.set(candidate.tree.tree_revision_id, candidate);
  }

  const chainMemo = new Map<string, boolean>();
  const chainValidCandidates = candidates.filter((candidate) =>
    chainIsValid(candidate, candidatesByHead, findings, chainMemo, new Set()),
  );
  const childrenByParent = new Map<string, VerifiedMaterialCandidate[]>();
  for (const candidate of chainValidCandidates) {
    const parent = headValue(candidate.tree.parent_tree_revision_id) ?? '<root>';
    const siblings = childrenByParent.get(parent) ?? [];
    siblings.push(candidate);
    childrenByParent.set(parent, siblings);
  }
  for (const [parent, children] of childrenByParent.entries()) {
    if (children.length > 1) {
      findings.push({
        message: `Material tree chain is forked after ${parent}.`,
        recovery_class: 'material_head_diverged',
        repaired: false,
      });
      return null;
    }
  }

  const highestSequence = Math.max(
    ...chainValidCandidates.map((candidate) => candidate.tree.sequence),
  );
  if (!Number.isFinite(highestSequence)) {
    return null;
  }
  const highest = chainValidCandidates.filter(
    (candidate) => candidate.tree.sequence === highestSequence,
  );
  if (highest.length !== 1) {
    findings.push({
      message: 'Material head repair is causally ambiguous.',
      recovery_class: 'material_head_diverged',
      repaired: false,
    });
    return null;
  }
  return highest[0] ?? null;
}

function reconcileMutableHeads(projectRoot: string, findings: RecoveryFinding[]): string | null {
  const latestCandidate = latestCausalMaterialCandidate(projectRoot, findings);
  const latestHead = latestCandidate?.tree.tree_revision_id ?? null;
  let head = readHead(projectRoot);
  const projectHead = isProjectInitialized(projectRoot)
    ? readProject(projectRoot).head_tree_revision_id
    : null;

  if (head !== null) {
    try {
      verifyTreeRevision(projectRoot, readTreeRevision(projectRoot, head));
    } catch (error) {
      if (error instanceof ExpflowError) {
        findings.push({
          message: error.message,
          recovery_class: 'objects_committed_records_incomplete',
          repaired: false,
        });
      } else {
        throw error;
      }
    }
  }

  if (latestHead !== null && (head !== latestHead || projectHead !== latestHead)) {
    const previousHead = head;
    writeHead(projectRoot, latestHead);
    if (isProjectInitialized(projectRoot)) {
      updateProjectHead(projectRoot, latestHead);
    }
    head = latestHead;
    findings.push({
      message: `Repaired material head/project metadata from causal tree ${latestHead}.`,
      recovery_class:
        latestCandidate?.receipt.previous_head === previousHead && projectHead === previousHead
          ? 'tree_committed_head_not_advanced'
          : 'material_head_diverged',
      repaired: true,
    });
  }

  return head;
}

export function recoverProject(projectRoot: string): RecoveryReport {
  const paths = storePaths(projectRoot);
  const findings: RecoveryFinding[] = [];

  if (!recoverLock(projectRoot, findings)) {
    return {
      checked_at: new Date().toISOString(),
      findings,
    };
  }

  if (!recoverIntents(projectRoot, findings)) {
    return {
      checked_at: new Date().toISOString(),
      findings,
    };
  }

  if (existsSync(paths.staging)) {
    const entries = readdirSync(paths.staging);
    for (const entry of entries) {
      rmSync(`${paths.staging}/${entry}`, { recursive: true, force: true });
      findings.push({
        message: `Removed uncommitted staging directory ${entry}.`,
        recovery_class: 'uncommitted_stage',
        repaired: true,
      });
    }
  }

  const head = reconcileMutableHeads(projectRoot, findings);

  const receipts = listOperationReceipts(projectRoot);
  for (const operationReceipt of receipts.filter(isMaterialSuccessReceipt)) {
    if (operationReceipt.status === 'partial_post_commit') {
      findings.push({
        message: `Post-commit automation incomplete for operation ${operationReceipt.operation_id}.`,
        recovery_class: 'post_commit_automation_incomplete',
        repaired: false,
      });
    }
  }

  const receiptsByOperation = new Set(receipts.map((receipt) => receipt.operation_id));
  const materialSuccessHeads = new Set(
    receipts.filter(isMaterialSuccessReceipt).map((receipt) => receipt.new_head),
  );
  if (head !== null) {
    const headTree = readTreeRevision(projectRoot, head);
    const receipt = receipts.find(
      (candidate) =>
        candidate.operation_id === headTree.created_by_operation && candidate.new_head === head,
    );
    if (receipt === undefined) {
      findings.push({
        message: `Material head ${head} has no committed operation receipt.`,
        recovery_class: 'head_advanced_receipt_incomplete',
        repaired: false,
      });
    }
  }

  for (const treeRevisionId of listTreeRevisionIds(projectRoot)) {
    if (treeRevisionId === head || materialSuccessHeads.has(treeRevisionId)) {
      continue;
    }
    const tree = readTreeRevision(projectRoot, treeRevisionId);
    if (!receiptsByOperation.has(tree.created_by_operation)) {
      findings.push({
        message: `Tree revision ${treeRevisionId} is committed without a receipt or head advance.`,
        recovery_class: 'tree_committed_head_not_advanced',
        repaired: false,
      });
    }
  }

  return {
    checked_at: new Date().toISOString(),
    findings,
  };
}
