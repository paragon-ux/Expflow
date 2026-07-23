import type { ExpflowError } from '../core/errors.js';
import {
  summarizeChangeKinds,
  type ChangeKindSummary,
  type PendingChangeDetail,
} from '../material/changes.js';
import type { OperationReceiptRecord, StatusReportRecord } from '../material/types.js';
import type { RestorePathEffectKind, RestorePlan } from '../operations/restore-plan.js';
import type { SyncPlan } from '../operations/runtime.js';

export interface RevisionHistoryEntry {
  readonly tree_revision_id: string;
  readonly sequence: number;
  readonly created_at: string;
  readonly source: string;
  readonly operation_status: string | null;
  readonly is_current_head: boolean;
  readonly restore_reference: string;
}

export interface NodeHistoryEntry {
  readonly node_id: string;
  readonly revision: number;
  readonly node_revision_ref: string;
  readonly created_at: string;
  readonly is_current: boolean;
  readonly restore_reference: string;
}

export interface ErrorObject {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly recoverable: boolean;
    readonly recommended_action: string | null;
  };
}

const PATH_LIST_LIMIT = 20;

function capitalize(value: string): string {
  return value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);
}

function formatKindCounts(summary: ChangeKindSummary): string {
  const parts: string[] = [];
  if (summary.added > 0) {
    parts.push(`${String(summary.added)} added`);
  }
  if (summary.modified > 0) {
    parts.push(`${String(summary.modified)} modified`);
  }
  if (summary.removed > 0) {
    parts.push(`${String(summary.removed)} removed`);
  }
  if (summary.moved > 0) {
    parts.push(`${String(summary.moved)} moved`);
  }
  return parts.length > 0 ? parts.join(', ') : 'no changes';
}

function formatChangeLine(detail: PendingChangeDetail): string {
  const from =
    detail.kind === 'moved' && detail.from_path !== null && detail.from_path !== undefined
      ? ` (from ${detail.from_path})`
      : '';
  const provisional =
    detail.identity === 'provisional' && detail.node_revision_ref !== null
      ? ` (provisional: ${detail.node_revision_ref})`
      : '';
  return `  ${detail.kind.padEnd(8)} ${detail.relative_path}${from}${provisional}`;
}

function boundedChangeLines(details: readonly PendingChangeDetail[]): string[] {
  const shown = details.slice(0, PATH_LIST_LIMIT).map(formatChangeLine);
  const remaining = details.length - shown.length;
  if (remaining > 0) {
    shown.push(`  ... +${String(remaining)} more`);
  }
  return shown;
}

export function formatStatusReport(report: StatusReportRecord): string {
  const lines: string[] = [];
  const head = report.head_tree_revision_id ?? 'none';
  switch (report.working_tree_state) {
    case 'uninitialized': {
      lines.push('No Expflow project exists at this root.');
      lines.push('Next action: run `expflow init` to initialize a project.');
      break;
    }
    case 'clean': {
      lines.push(`Project id: ${report.project_id}`);
      lines.push(`Current project version (tree revision): ${head}`);
      lines.push('Working tree: clean - no pending changes.');
      lines.push('Hints: `expflow status --json` for machine-readable output;');
      lines.push('  `expflow status --history` to list project versions;');
      lines.push('  `expflow restore --dry-run tree:<tree_revision_id>` for a restore preview.');
      break;
    }
    case 'drifted': {
      const details = (report.pending_change_details ?? []) as readonly PendingChangeDetail[];
      const summary = summarizeChangeKinds(details);
      lines.push(`Project id: ${report.project_id}`);
      lines.push(`Current project version (tree revision): ${head}`);
      lines.push(
        `Working tree: drifted - ${String(details.length)} pending change(s): ${formatKindCounts(summary)}.`,
      );
      lines.push('Pending changes:');
      lines.push(...boundedChangeLines(details));
      lines.push(
        'Next action: run `expflow sync` to commit these changes (preview: `expflow sync --dry-run`).',
      );
      break;
    }
    case 'invalid': {
      lines.push(`Project id: ${report.project_id}`);
      lines.push(`Current project version (tree revision): ${head}`);
      lines.push('Working tree: needs attention.');
      lines.push(
        `Unresolved items: ${report.unresolved_items.length > 0 ? report.unresolved_items.join(', ') : 'unknown'}`,
      );
      if (report.recommended_action !== null && report.recommended_action !== undefined) {
        lines.push(`Recommended action: ${report.recommended_action}`);
      }
      lines.push(
        'Run `expflow status --json` for machine-readable detail, then follow the recommended action to recover.',
      );
      break;
    }
  }
  return `${lines.join('\n')}\n`;
}

export function formatRevisionHistory(entries: readonly RevisionHistoryEntry[]): string {
  const lines: string[] = ['Project version history (most recent first):'];
  if (entries.length === 0) {
    lines.push('  (no project versions recorded)');
  }
  for (const entry of entries) {
    const marker = entry.is_current_head ? ' (current head)' : '';
    const status = entry.operation_status ?? 'unknown';
    lines.push(
      `  #${String(entry.sequence)} ${entry.created_at} source=${entry.source} status=${status} ${entry.restore_reference}${marker}`,
    );
  }
  lines.push(
    'Restore: `expflow restore tree:<tree_revision_id>`; preview: `expflow restore --dry-run tree:<tree_revision_id>`.',
  );
  return `${lines.join('\n')}\n`;
}

export function formatNodeHistory(entries: readonly NodeHistoryEntry[]): string {
  const lines: string[] = ['Node revision history:'];
  if (entries.length === 0) {
    lines.push('  (no node revisions recorded)');
  }
  for (const entry of entries) {
    const marker = entry.is_current ? ' (current)' : '';
    lines.push(`  ${entry.node_revision_ref} ${entry.created_at}${marker}`);
    lines.push(`    restore reference: ${entry.restore_reference}`);
  }
  lines.push(
    'Restore one file: `expflow restore node:<node_id>@<revision>:<path>`; preview with `--dry-run`.',
  );
  return `${lines.join('\n')}\n`;
}

export function formatSyncPreview(plan: SyncPlan): string {
  const lines: string[] = ['Sync preview - nothing committed.'];
  lines.push(`Project id: ${plan.project_id}`);
  lines.push(`Current head: ${plan.previous_head ?? 'none'}`);
  lines.push(`Candidate digest: ${plan.content_digest}`);
  if (plan.change_details.length === 0) {
    lines.push('Changes: none - the working tree already matches the current project version.');
  } else {
    lines.push(`Changes: ${formatKindCounts(summarizeChangeKinds(plan.change_details))}.`);
    lines.push(...boundedChangeLines(plan.change_details));
  }
  if (plan.identity_proposals.length > 0) {
    lines.push(`Identity proposals: ${String(plan.identity_proposals.length)} noted.`);
  }
  lines.push('Next action: run `expflow sync` to commit.');
  return `${lines.join('\n')}\n`;
}

function driftAnnotation(effect: {
  readonly drift_kind: string | null;
  readonly conflicting: boolean;
}): string {
  if (effect.drift_kind === null) {
    return '';
  }
  return effect.conflicting
    ? ` (unrecorded drift: ${effect.drift_kind} - conflicts)`
    : ` (unrecorded drift: ${effect.drift_kind})`;
}

export function formatRestorePreview(plan: RestorePlan): string {
  const lines: string[] = ['Restore preview - nothing was changed.'];
  lines.push(
    `Selected source reference: ${plan.reference} (${plan.reference_kind}, resolved: ${plan.source_ref})`,
  );
  lines.push(`Current head: ${plan.current_head ?? 'none'}`);
  const groups: { label: string; effect: RestorePathEffectKind }[] = [
    { effect: 'create', label: 'create' },
    { effect: 'update', label: 'update' },
    { effect: 'remove', label: 'remove' },
  ];
  const actionable = plan.path_effects.filter((pathEffect) => pathEffect.effect !== 'unchanged');
  if (actionable.length === 0) {
    lines.push('Affected paths: none - the working tree already matches the selected source.');
  } else {
    lines.push('Affected paths:');
    for (const group of groups) {
      const entries = plan.path_effects.filter((pathEffect) => pathEffect.effect === group.effect);
      if (entries.length === 0) {
        continue;
      }
      lines.push(`  ${group.label}:`);
      for (const entry of entries) {
        lines.push(`    ${entry.relative_path}${driftAnnotation(entry)}`);
      }
    }
  }
  if (plan.conflicting_paths.length > 0) {
    lines.push('CONFLICTING DRIFT:');
    for (const path of plan.conflicting_paths) {
      lines.push(`  ${path}`);
    }
    lines.push('Restore will refuse to overwrite these unrecorded working-tree changes.');
    lines.push(
      'Remediation: run `expflow sync` first to record your changes, or re-run with `--force` to overwrite them.',
    );
  }
  if (plan.preserved_drift_paths.length > 0) {
    lines.push(
      `Preserved unrelated drift (left untouched): ${plan.preserved_drift_paths.join(', ')}`,
    );
  }
  lines.push('This restore creates a new project version (forward commit); history is unchanged.');
  lines.push('Nothing was changed.');
  return `${lines.join('\n')}\n`;
}

export function formatReceipt(
  receipt: OperationReceiptRecord,
  command: 'init' | 'sync' | 'restore',
): string {
  const lines: string[] = [];
  if (receipt.status === 'rejected') {
    lines.push(`${capitalize(command)} rejected - no new project version was committed.`);
    lines.push(`Project id: ${receipt.project_id}`);
    lines.push(`Operation id: ${receipt.operation_id}`);
    if (receipt.error !== null && receipt.error !== undefined) {
      lines.push(`Error [${receipt.error.code}]: ${receipt.error.message}`);
      if (
        receipt.error.recommended_action !== null &&
        receipt.error.recommended_action !== undefined
      ) {
        lines.push(`Recommended action: ${receipt.error.recommended_action}`);
      }
    }
    return `${lines.join('\n')}\n`;
  }
  if (command === 'init') {
    lines.push('Initialized Expflow project.');
  } else if (receipt.status === 'no_change') {
    lines.push('Status: no_change - the working tree already matches the current project version.');
  } else {
    lines.push(`Status: ${receipt.status}`);
  }
  lines.push(`Project id: ${receipt.project_id}`);
  lines.push(`Current project version (tree revision): ${receipt.new_head ?? 'none'}`);
  lines.push(`Previous head: ${receipt.previous_head ?? 'none'}`);
  lines.push(`Operation id: ${receipt.operation_id}`);
  if (command === 'restore') {
    lines.push('Restore created a new project version (forward commit); history is unchanged.');
  }
  if (command === 'init') {
    lines.push('Next action: run `expflow status` to inspect project state.');
  }
  return `${lines.join('\n')}\n`;
}

export function formatErrorBlock(error: ExpflowError): string {
  const lines: string[] = [
    `expflow: ${error.message} [${error.code}]`,
    'No new project version was committed.',
  ];
  if (error.recommendedAction !== null) {
    lines.push(`Recommended action: ${error.recommendedAction}`);
  }
  lines.push('Run `expflow status` for current project state.');
  return `${lines.join('\n')}\n`;
}

export function errorObject(error: ExpflowError): ErrorObject {
  return {
    error: {
      code: error.code,
      message: error.message,
      recoverable: error.recoverable,
      recommended_action: error.recommendedAction ?? null,
    },
  };
}
