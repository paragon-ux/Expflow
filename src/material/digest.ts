import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { canonicalJson, type JsonValue } from '../core/json.js';
import type { PathSelectorRecord, TreeEntryRecord } from './types.js';
import type { RestorePathEffect } from '../operations/restore-plan.js';

export function sha256Bytes(bytes: Buffer | string): string {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

export function sha256File(path: string): string {
  return sha256Bytes(readFileSync(path));
}

function treeEntryPreimage(entry: TreeEntryRecord): JsonValue {
  return {
    entry_kind: entry.entry_kind,
    external_locator: entry.external_locator ?? null,
    filename: entry.filename ?? null,
    folder_name: entry.folder_name ?? null,
    node_content_digest: entry.node_content_digest ?? null,
    node_id: entry.node_id ?? null,
    node_revision: entry.node_revision ?? null,
    occupancy_status: entry.occupancy_status,
    relative_path: entry.relative_path,
  };
}

export function treeContentDigest(
  entries: readonly TreeEntryRecord[],
  removedPaths: readonly string[],
  scope: PathSelectorRecord,
): string {
  const sortedEntries = [...entries].sort((left, right) => {
    const pathCompare = left.relative_path.localeCompare(right.relative_path);
    return pathCompare === 0 ? left.entry_kind.localeCompare(right.entry_kind) : pathCompare;
  });
  const preimage: JsonValue = {
    entries: sortedEntries.map(treeEntryPreimage),
    removed_paths: [...removedPaths].sort(),
    schema_version: '2.3',
    scope: {
      description: scope.description ?? null,
      exclude: [...scope.exclude],
      include: [...scope.include],
      root: scope.root ?? '.',
    },
  };
  return sha256Bytes(canonicalJson(preimage));
}

/** Shared restore path-effects canonical digest. Bridge and runtime must use the same logic. */
export function restorePathEffectsDigest(effects: readonly RestorePathEffect[]): string {
  return createHash('sha256')
    .update(
      effects
        .map(
          (e) =>
            `${e.relative_path}\x00${e.effect}\x00${e.drift_kind ?? ''}\x00${e.conflicting ? '1' : '0'}`,
        )
        .sort()
        .join('\x00'),
    )
    .digest('hex');
}
