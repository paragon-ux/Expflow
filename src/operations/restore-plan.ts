import { ExpflowError } from '../core/errors.js';
import { defaultPathSelector, scanWorkingTree } from '../scan/scanner.js';
import { readHead, readNodeRevision, readProject, readTreeRevision } from '../material/store.js';
import type { TreeRevisionRecord } from '../material/types.js';

export type RestorePathEffectKind = 'create' | 'update' | 'remove' | 'unchanged';
export type RestoreDriftKind = 'added' | 'modified' | 'removed';

export interface RestorePathEffect {
  readonly relative_path: string;
  readonly effect: RestorePathEffectKind;
  readonly drift_kind: RestoreDriftKind | null;
  readonly conflicting: boolean;
}

export interface RestorePlan {
  readonly project_id: string;
  readonly reference: string;
  readonly reference_kind: 'tree' | 'node';
  readonly source_ref: string;
  readonly current_head: string | null;
  readonly path_effects: readonly RestorePathEffect[];
  readonly conflicting_paths: readonly string[];
  readonly preserved_drift_paths: readonly string[];
  readonly requires_force: boolean;
  readonly forward_commit: true;
}

const NODE_REFERENCE_PATTERN = /^node:([^@]+)@([0-9]+):(.+)$/;

function comparePaths(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function fileDigestsByPath(tree: TreeRevisionRecord | null): Map<string, string | null> {
  const digests = new Map<string, string | null>();
  for (const entry of tree?.entries ?? []) {
    if (entry.entry_kind === 'file') {
      digests.set(entry.relative_path, entry.node_content_digest ?? null);
    }
  }
  return digests;
}

function driftKind(
  path: string,
  headDigests: Map<string, string | null>,
  scanDigests: Map<string, string>,
): RestoreDriftKind | null {
  const headDigest = headDigests.get(path);
  const scanDigest = scanDigests.get(path);
  if (scanDigest === undefined) {
    return headDigest === undefined ? null : 'removed';
  }
  if (headDigest === undefined) {
    return 'added';
  }
  return scanDigest === headDigest ? null : 'modified';
}

function sortedUnionPaths(left: Map<string, unknown>, right: Map<string, unknown>): string[] {
  return [...new Set([...left.keys(), ...right.keys()])].sort(comparePaths);
}

function buildTreeRestorePlan(input: {
  readonly projectRoot: string;
  readonly projectId: string;
  readonly reference: string;
  readonly currentHead: string | null;
  readonly currentTree: TreeRevisionRecord | null;
  readonly scanDigests: Map<string, string>;
}): RestorePlan {
  const sourceTree = readTreeRevision(input.projectRoot, input.reference.slice('tree:'.length));
  const targetDigests = fileDigestsByPath(sourceTree);
  const headDigests = fileDigestsByPath(input.currentTree);

  const pathEffects: RestorePathEffect[] = [];
  const conflictingPaths: string[] = [];
  const preservedDriftPaths: string[] = [];

  for (const path of sortedUnionPaths(headDigests, targetDigests)) {
    const headDigest = headDigests.get(path);
    const targetDigest = targetDigests.get(path);
    let effect: RestorePathEffectKind;
    if (targetDigest === undefined) {
      effect = 'remove';
    } else if (headDigest === undefined) {
      effect = 'create';
    } else {
      effect = headDigest === targetDigest ? 'unchanged' : 'update';
    }
    const drift = driftKind(path, headDigests, input.scanDigests);
    let conflicting = false;
    if (effect === 'update' || effect === 'remove') {
      conflicting = drift !== null && !(effect === 'remove' && drift === 'removed');
    } else if (effect === 'create') {
      const scanDigest = input.scanDigests.get(path);
      conflicting = scanDigest !== undefined && scanDigest !== targetDigest;
    }
    if (effect !== 'unchanged' || drift !== null) {
      pathEffects.push({
        conflicting,
        drift_kind: drift,
        effect,
        relative_path: path,
      });
    }
    if (conflicting) {
      conflictingPaths.push(path);
    } else if (effect === 'unchanged' && drift !== null) {
      preservedDriftPaths.push(path);
    }
  }

  for (const path of input.scanDigests.keys()) {
    if (!headDigests.has(path) && !targetDigests.has(path)) {
      preservedDriftPaths.push(path);
    }
  }
  preservedDriftPaths.sort(comparePaths);

  return {
    conflicting_paths: conflictingPaths,
    current_head: input.currentHead,
    forward_commit: true,
    path_effects: pathEffects,
    preserved_drift_paths: preservedDriftPaths,
    project_id: input.projectId,
    reference: input.reference,
    reference_kind: 'tree',
    requires_force: conflictingPaths.length > 0,
    source_ref: sourceTree.tree_revision_id,
  };
}

function buildNodeRestorePlan(input: {
  readonly projectRoot: string;
  readonly projectId: string;
  readonly reference: string;
  readonly targetPath?: string | undefined;
  readonly currentHead: string | null;
  readonly currentTree: TreeRevisionRecord | null;
  readonly scanDigests: Map<string, string>;
}): RestorePlan {
  const match = NODE_REFERENCE_PATTERN.exec(input.reference);
  if (match === null) {
    throw new ExpflowError(
      'restore_conflict',
      `Invalid restore reference: ${input.reference}. Valid syntax: tree:<tree_revision_id> or node:<node_id>@<revision>:<path>.`,
      {
        recoverable: true,
        recommendedAction:
          'Use `tree:<tree_revision_id>` or `node:<node_id>@<revision>:<path>` as the restore reference.',
      },
    );
  }
  const nodeId = match[1] ?? '';
  const revision = Number(match[2] ?? '0');
  const path = input.targetPath ?? match[3] ?? '';
  const node = readNodeRevision(input.projectRoot, nodeId, revision);
  const headDigests = fileDigestsByPath(input.currentTree);

  const headDigest = headDigests.get(path);
  const scanDigest = input.scanDigests.get(path);
  let effect: RestorePathEffectKind;
  if (headDigest === undefined) {
    effect = 'create';
  } else {
    effect = headDigest === node.content_digest ? 'unchanged' : 'update';
  }
  const drift = driftKind(path, headDigests, input.scanDigests);
  const conflicting =
    scanDigest !== undefined && scanDigest !== node.content_digest && scanDigest !== headDigest;

  const pathEffects: RestorePathEffect[] =
    effect !== 'unchanged' || drift !== null
      ? [{ conflicting, drift_kind: drift, effect, relative_path: path }]
      : [];

  const preservedDriftPaths: string[] = [];
  for (const otherPath of sortedUnionPaths(headDigests, input.scanDigests)) {
    if (otherPath === path) {
      continue;
    }
    if (driftKind(otherPath, headDigests, input.scanDigests) !== null) {
      preservedDriftPaths.push(otherPath);
    }
  }

  return {
    conflicting_paths: conflicting ? [path] : [],
    current_head: input.currentHead,
    forward_commit: true,
    path_effects: pathEffects,
    preserved_drift_paths: preservedDriftPaths,
    project_id: input.projectId,
    reference: input.reference,
    reference_kind: 'node',
    requires_force: conflicting,
    source_ref: `${nodeId}@${String(revision)}`,
  };
}

export function buildRestorePlan(
  projectRoot: string,
  reference: string,
  targetPath?: string,
): RestorePlan {
  const project = readProject(projectRoot);
  const currentHead = readHead(projectRoot);
  const currentTree = currentHead === null ? null : readTreeRevision(projectRoot, currentHead);
  const scanDigests = new Map<string, string>();
  for (const file of scanWorkingTree(projectRoot, defaultPathSelector())) {
    scanDigests.set(file.relative_path, file.content_digest);
  }

  if (reference.startsWith('tree:')) {
    return buildTreeRestorePlan({
      currentHead,
      currentTree,
      projectId: project.project_id,
      projectRoot,
      reference,
      scanDigests,
    });
  }
  if (reference.startsWith('node:')) {
    return buildNodeRestorePlan({
      currentHead,
      currentTree,
      projectId: project.project_id,
      projectRoot,
      reference,
      scanDigests,
      targetPath,
    });
  }
  throw new ExpflowError('restore_conflict', `Unsupported restore reference: ${reference}`);
}
