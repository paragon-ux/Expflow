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
): void {
  const receipt = receiptForOperation(projectRoot, intent.operation_id);
  if (receipt === null || !isMaterialSuccessReceipt(receipt)) {
    removeRecoveryIntent(projectRoot, intent.operation_id);
    removeOperationStaging(projectRoot, intent.operation_id);
    findings.push({
      message: `Removed init intent ${intent.operation_id} before material commit.`,
      recovery_class: 'init_publication_incomplete',
      repaired: true,
    });
    return;
  }
  if (receipt.new_head !== intent.target_head) {
    findings.push({
      message: `Init intent ${intent.operation_id} does not match committed receipt.`,
      recovery_class: 'init_publication_incomplete',
      repaired: false,
    });
    return;
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
}

function recoverRestoreIntent(
  projectRoot: string,
  intent: RestoreRecoveryIntentRecord,
  findings: RecoveryFinding[],
): void {
  const receipt = receiptForOperation(projectRoot, intent.operation_id);
  if (receipt === null || !isMaterialSuccessReceipt(receipt)) {
    removeRecoveryIntent(projectRoot, intent.operation_id);
    removeOperationStaging(projectRoot, intent.operation_id);
    findings.push({
      message: `Removed restore intent ${intent.operation_id} before material commit.`,
      recovery_class: 'restore_working_tree_incomplete',
      repaired: true,
    });
    return;
  }
  if (receipt.new_head !== intent.target_head) {
    findings.push({
      message: `Restore intent ${intent.operation_id} does not match committed receipt.`,
      recovery_class: 'restore_working_tree_incomplete',
      repaired: false,
    });
    return;
  }
  verifyTreeRevision(projectRoot, readTreeRevision(projectRoot, intent.target_head));
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
}

function recoverIntents(projectRoot: string, findings: RecoveryFinding[]): void {
  for (const path of listRecoveryIntentPaths(projectRoot)) {
    const intent = readJsonFile(path) as { readonly intent_type?: string };
    if (intent.intent_type === 'init_project') {
      recoverInitIntent(projectRoot, intent as InitRecoveryIntentRecord, findings);
    } else if (intent.intent_type === 'restore_working_tree') {
      recoverRestoreIntent(projectRoot, intent as RestoreRecoveryIntentRecord, findings);
    } else {
      findings.push({
        message: `Unknown recovery intent ${basename(path)} was not removed.`,
        recovery_class: 'objects_committed_records_incomplete',
        repaired: false,
      });
    }
  }
}

function latestVerifiedMaterialReceipt(
  projectRoot: string,
  findings: RecoveryFinding[],
): OperationReceiptRecord | null {
  let latest: OperationReceiptRecord | null = null;
  for (const operationReceipt of listOperationReceipts(projectRoot).filter(
    isMaterialSuccessReceipt,
  )) {
    const newHead = operationReceipt.new_head ?? null;
    if (newHead === null) {
      continue;
    }
    try {
      verifyTreeRevision(projectRoot, readTreeRevision(projectRoot, newHead));
      latest = operationReceipt;
    } catch (error) {
      if (error instanceof ExpflowError) {
        findings.push({
          message: error.message,
          recovery_class: 'tree_committed_head_not_advanced',
          repaired: false,
        });
      } else {
        throw error;
      }
    }
  }
  return latest;
}

function reconcileMutableHeads(projectRoot: string, findings: RecoveryFinding[]): string | null {
  const latestReceipt = latestVerifiedMaterialReceipt(projectRoot, findings);
  const latestHead = latestReceipt?.new_head ?? null;
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
      message: `Repaired material head/project metadata from receipt ${latestReceipt?.operation_id ?? 'unknown'}.`,
      recovery_class:
        latestReceipt?.previous_head === previousHead && projectHead === previousHead
          ? 'tree_committed_head_not_advanced'
          : 'material_head_diverged',
      repaired: true,
    });
  } else if (head !== projectHead && isProjectInitialized(projectRoot)) {
    updateProjectHead(projectRoot, head);
    findings.push({
      message: 'Repaired project metadata to match material HEAD.',
      recovery_class: 'material_head_diverged',
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

  recoverIntents(projectRoot, findings);

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
