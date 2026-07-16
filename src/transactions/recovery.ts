import { existsSync, readdirSync, rmSync } from 'node:fs';
import { ExpflowError } from '../core/errors.js';
import { storePaths, readHead, readTreeRevision, verifyTreeRevision } from '../material/store.js';

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

  const head = readHead(projectRoot);
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

  return {
    checked_at: new Date().toISOString(),
    findings,
  };
}
