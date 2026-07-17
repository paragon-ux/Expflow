import { existsSync, readdirSync, rmSync } from 'node:fs';
import { ExpflowError } from '../core/errors.js';
import {
  listOperationReceipts,
  listTreeRevisionIds,
  readHead,
  readTreeRevision,
  storePaths,
  updateProjectHead,
  verifyTreeRevision,
  writeHead,
} from '../material/store.js';
import type { OperationReceiptRecord } from '../material/types.js';

export type RecoveryClass =
  | 'uncommitted_stage'
  | 'objects_committed_records_incomplete'
  | 'tree_committed_head_not_advanced'
  | 'head_advanced_receipt_incomplete'
  | 'post_commit_automation_incomplete';

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

export function recoverProject(projectRoot: string): RecoveryReport {
  const paths = storePaths(projectRoot);
  const findings: RecoveryFinding[] = [];

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

  let head = readHead(projectRoot);
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

  const receipts = listOperationReceipts(projectRoot);
  for (const operationReceipt of receipts.filter(isMaterialSuccessReceipt)) {
    if (operationReceipt.status === 'partial_post_commit') {
      findings.push({
        message: `Post-commit automation incomplete for operation ${operationReceipt.operation_id}.`,
        recovery_class: 'post_commit_automation_incomplete',
        repaired: false,
      });
    }

    const newHead = operationReceipt.new_head ?? null;
    if (newHead === null || newHead === head || operationReceipt.previous_head !== head) {
      continue;
    }

    try {
      verifyTreeRevision(projectRoot, readTreeRevision(projectRoot, newHead));
      writeHead(projectRoot, newHead);
      updateProjectHead(projectRoot, newHead);
      head = newHead;
      findings.push({
        message: `Advanced material head to committed receipt ${operationReceipt.operation_id}.`,
        recovery_class: 'tree_committed_head_not_advanced',
        repaired: true,
      });
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
