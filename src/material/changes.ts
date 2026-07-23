import type { OperationChange, TreeEntryRecord, TreeRevisionRecord } from './types.js';

export type PendingChangeKind = 'added' | 'modified' | 'removed' | 'moved';

export interface PendingChangeDetail {
  readonly relative_path: string;
  readonly kind: PendingChangeKind;
  readonly node_revision_ref: string | null;
  readonly identity: 'provisional' | 'committed' | null;
  readonly from_path?: string | null;
  readonly continuity_basis?: string | null;
}

export interface ChangeKindSummary {
  readonly added: number;
  readonly modified: number;
  readonly removed: number;
  readonly moved: number;
}

export interface SyncPlanChangeInput {
  readonly entries: readonly object[];
  readonly removed_paths: readonly string[];
  readonly new_node_revisions: readonly string[];
}

function comparePaths(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function nodeRevisionRef(entry: TreeEntryRecord): string | null {
  if (entry.node_id === null || entry.node_id === undefined) {
    return null;
  }
  if (entry.node_revision === null || entry.node_revision === undefined) {
    return null;
  }
  return `${entry.node_id}@${String(entry.node_revision)}`;
}

export function classifySyncPlanChanges(
  plan: SyncPlanChangeInput,
  currentTree: TreeRevisionRecord | null,
  changes: readonly OperationChange[] = [],
): PendingChangeDetail[] {
  const entries = plan.entries as readonly TreeEntryRecord[];
  const currentByPath = new Map<string, TreeEntryRecord>();
  for (const entry of currentTree?.entries ?? []) {
    currentByPath.set(entry.relative_path, entry);
  }
  const provisionalRefs = new Set(plan.new_node_revisions);
  const movesByPath = new Map<string, OperationChange>();
  for (const change of changes) {
    if (change.kind === 'move' && change.from_path !== null && change.from_path !== undefined) {
      movesByPath.set(change.path, change);
    }
  }

  const details: PendingChangeDetail[] = [];
  for (const entry of entries) {
    const previous = currentByPath.get(entry.relative_path);
    const move = movesByPath.get(entry.relative_path);
    let kind: PendingChangeKind | null = null;
    if (move !== undefined) {
      kind = 'moved';
    } else if (previous === undefined) {
      kind = 'added';
    } else if (previous.node_content_digest !== entry.node_content_digest) {
      kind = 'modified';
    }
    if (kind === null) {
      continue;
    }
    const ref = nodeRevisionRef(entry);
    details.push({
      continuity_basis:
        kind === 'moved'
          ? move?.identity_directive === 'preserve'
            ? 'preserve_explicit'
            : null
          : null,
      from_path: kind === 'moved' ? (move?.from_path ?? null) : null,
      identity: ref !== null && provisionalRefs.has(ref) ? 'provisional' : 'committed',
      kind,
      node_revision_ref: ref,
      relative_path: entry.relative_path,
    });
  }

  for (const path of plan.removed_paths) {
    details.push({
      continuity_basis: null,
      from_path: null,
      identity: null,
      kind: 'removed',
      node_revision_ref: null,
      relative_path: path,
    });
  }

  return details.sort((left, right) => comparePaths(left.relative_path, right.relative_path));
}

export function summarizeChangeKinds(details: readonly PendingChangeDetail[]): ChangeKindSummary {
  const summary: { added: number; modified: number; removed: number; moved: number } = {
    added: 0,
    modified: 0,
    moved: 0,
    removed: 0,
  };
  for (const detail of details) {
    summary[detail.kind] += 1;
  }
  return summary;
}
