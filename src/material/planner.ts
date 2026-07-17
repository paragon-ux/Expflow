import { basename, dirname } from 'node:path';
import { createExpflowId } from '../core/ids.js';
import { assertSafeRelativePath } from '../core/paths.js';
import { treeContentDigest } from './digest.js';
import { selectorIncludesPath } from './selectors.js';
import type {
  CandidateNodeRevision,
  CandidateTree,
  ContinuityBasis,
  IdentityProposal,
  NodeRevisionRecord,
  OperationChange,
  PathSelectorRecord,
  ScannedFile,
  TreeEntryRecord,
  TreeRevisionRecord,
} from './types.js';

function changeKey(change: OperationChange): string {
  return assertSafeRelativePath(change.path);
}

function currentEntryByPath(currentTree: TreeRevisionRecord | null): Map<string, TreeEntryRecord> {
  const entries = new Map<string, TreeEntryRecord>();
  if (currentTree === null) {
    return entries;
  }
  for (const entry of currentTree.entries) {
    entries.set(entry.relative_path, entry);
  }
  return entries;
}

function fileByPath(scannedFiles: readonly ScannedFile[]): Map<string, ScannedFile> {
  const files = new Map<string, ScannedFile>();
  for (const file of scannedFiles) {
    files.set(file.relative_path, file);
  }
  return files;
}

function newFileEntry(file: ScannedFile, node: NodeRevisionRecord): TreeEntryRecord {
  return {
    entry_kind: 'file',
    external_locator: null,
    filename: file.filename,
    folder_name: file.folder_name,
    node_content_digest: node.content_digest,
    node_id: node.node_id,
    node_revision: node.revision,
    occupancy_status: 'present',
    relative_path: file.relative_path,
  };
}

function retainedFileEntry(file: ScannedFile, previous: TreeEntryRecord): TreeEntryRecord {
  return {
    entry_kind: 'file',
    external_locator: null,
    filename: file.filename,
    folder_name: file.folder_name,
    node_content_digest: previous.node_content_digest ?? null,
    node_id: previous.node_id ?? null,
    node_revision: previous.node_revision ?? null,
    occupancy_status: 'present',
    relative_path: file.relative_path,
  };
}

function makeNodeRevision(input: {
  readonly file: ScannedFile;
  readonly nodeId: string;
  readonly revision: number;
  readonly previousRevision: number | null;
  readonly operationId: string;
  readonly continuityBasis: ContinuityBasis;
  readonly objectLocator: string;
  readonly createdAt: string;
}): NodeRevisionRecord {
  return {
    schema_version: '2.3',
    byte_size: input.file.byte_size,
    content_digest: input.file.content_digest,
    continuity_basis: input.continuityBasis,
    created_at: input.createdAt,
    created_by_operation: input.operationId,
    media_type: null,
    node_id: input.nodeId,
    object_locator: input.objectLocator,
    original_filename: input.file.filename,
    previous_revision: input.previousRevision,
    revision: input.revision,
    source_kind: 'working_tree',
    storage_method: 'copy',
  };
}

function objectLocatorForDigest(digest: string): string {
  const hash = digest.replace(/^sha256:/, '');
  return `objects/sha256/${hash.slice(0, 2)}/${hash}`;
}

function findDigestSimilarityProposal(
  file: ScannedFile,
  currentEntries: Map<string, TreeEntryRecord>,
  scannedFiles: Map<string, ScannedFile>,
): IdentityProposal | null {
  for (const [oldPath, oldEntry] of currentEntries.entries()) {
    if (scannedFiles.has(oldPath)) {
      continue;
    }
    if (
      oldEntry.entry_kind === 'file' &&
      oldEntry.node_content_digest === file.content_digest &&
      oldEntry.node_id !== null &&
      oldEntry.node_id !== undefined
    ) {
      return {
        content_digest: file.content_digest,
        from_path: oldPath,
        kind: 'digest_similarity_without_identity_preservation',
        path: file.relative_path,
        previous_node_id: oldEntry.node_id,
      };
    }
  }
  return null;
}

function previousRevisionNumber(entry: TreeEntryRecord): number {
  return typeof entry.node_revision === 'number' ? entry.node_revision : 0;
}

export function planCandidateTree(input: {
  readonly operationId: string;
  readonly projectId: string;
  readonly currentTree: TreeRevisionRecord | null;
  readonly scannedFiles: readonly ScannedFile[];
  readonly changes: readonly OperationChange[];
  readonly scope: PathSelectorRecord;
  readonly source: TreeRevisionRecord['source'];
  readonly createdAt: string;
}): CandidateTree {
  const currentEntries = currentEntryByPath(input.currentTree);
  const scannedByPath = fileByPath(input.scannedFiles);
  const changesByPath = new Map(input.changes.map((change) => [changeKey(change), change]));
  const entries: TreeEntryRecord[] = [];
  const newNodeRevisions: CandidateNodeRevision[] = [];
  const identityProposals: IdentityProposal[] = [];

  for (const entry of currentEntries.values()) {
    if (!selectorIncludesPath(input.scope, entry.relative_path)) {
      entries.push({ ...entry });
    }
  }

  for (const file of input.scannedFiles) {
    const change = changesByPath.get(file.relative_path);
    const currentEntry = currentEntries.get(file.relative_path);
    const preserveFromEntry =
      change?.identity_directive === 'preserve' && change.from_path
        ? currentEntries.get(assertSafeRelativePath(change.from_path))
        : null;
    const restoreEntry =
      change?.kind === 'restore' && change.node_id && change.node_revision
        ? {
            node_id: change.node_id,
            node_revision: change.node_revision,
            node_content_digest: file.content_digest,
          }
        : null;

    if (restoreEntry !== null) {
      entries.push({
        entry_kind: 'file',
        external_locator: null,
        filename: basename(file.relative_path),
        folder_name: dirname(file.relative_path) === '.' ? null : dirname(file.relative_path),
        node_content_digest: restoreEntry.node_content_digest,
        node_id: restoreEntry.node_id,
        node_revision: restoreEntry.node_revision,
        occupancy_status: 'present',
        relative_path: file.relative_path,
      });
      continue;
    }

    if (
      preserveFromEntry !== null &&
      preserveFromEntry !== undefined &&
      preserveFromEntry.node_id !== null &&
      preserveFromEntry.node_id !== undefined
    ) {
      if (preserveFromEntry.node_content_digest === file.content_digest) {
        entries.push({
          ...retainedFileEntry(file, preserveFromEntry),
          node_revision: preserveFromEntry.node_revision ?? null,
        });
        continue;
      }
      const revision = previousRevisionNumber(preserveFromEntry) + 1;
      const node = makeNodeRevision({
        continuityBasis: 'preserve_explicit',
        createdAt: input.createdAt,
        file,
        nodeId: preserveFromEntry.node_id,
        objectLocator: objectLocatorForDigest(file.content_digest),
        operationId: input.operationId,
        previousRevision: preserveFromEntry.node_revision ?? null,
        revision,
      });
      newNodeRevisions.push({ record: node, source_path: file.absolute_path });
      entries.push(newFileEntry(file, node));
      continue;
    }

    if (change?.identity_directive === 'new' || currentEntry === undefined) {
      const basis: ContinuityBasis =
        change?.identity_directive === 'new' ? 'new_explicit' : 'new_explicit';
      const node = makeNodeRevision({
        continuityBasis: basis,
        createdAt: input.createdAt,
        file,
        nodeId: createExpflowId('efn'),
        objectLocator: objectLocatorForDigest(file.content_digest),
        operationId: input.operationId,
        previousRevision: null,
        revision: 1,
      });
      newNodeRevisions.push({ record: node, source_path: file.absolute_path });
      entries.push(newFileEntry(file, node));

      if (currentEntry === undefined && change?.identity_directive !== 'preserve') {
        const proposal = findDigestSimilarityProposal(file, currentEntries, scannedByPath);
        if (proposal !== null) {
          identityProposals.push(proposal);
        }
      }
      continue;
    }

    if (change?.identity_directive === 'replace') {
      const node = makeNodeRevision({
        continuityBasis: 'replace_explicit',
        createdAt: input.createdAt,
        file,
        nodeId: createExpflowId('efn'),
        objectLocator: objectLocatorForDigest(file.content_digest),
        operationId: input.operationId,
        previousRevision: null,
        revision: 1,
      });
      newNodeRevisions.push({ record: node, source_path: file.absolute_path });
      entries.push(newFileEntry(file, node));
      continue;
    }

    if (currentEntry.node_content_digest === file.content_digest) {
      entries.push(retainedFileEntry(file, currentEntry));
      continue;
    }

    const nodeId = currentEntry.node_id ?? createExpflowId('efn');
    const node = makeNodeRevision({
      continuityBasis: 'same_path_default',
      createdAt: input.createdAt,
      file,
      nodeId,
      objectLocator: objectLocatorForDigest(file.content_digest),
      operationId: input.operationId,
      previousRevision: currentEntry.node_revision ?? null,
      revision: previousRevisionNumber(currentEntry) + 1,
    });
    newNodeRevisions.push({ record: node, source_path: file.absolute_path });
    entries.push(newFileEntry(file, node));
  }

  const removedPaths = [...currentEntries.keys()]
    .filter((path) => selectorIncludesPath(input.scope, path) && !scannedByPath.has(path))
    .sort();
  const contentDigest = treeContentDigest(entries, removedPaths, input.scope);

  return {
    content_digest: contentDigest,
    entries: entries.sort((left, right) => left.relative_path.localeCompare(right.relative_path)),
    identity_proposals: identityProposals,
    new_node_revisions: newNodeRevisions,
    operation_id: input.operationId,
    parent_tree_revision_id: input.currentTree?.tree_revision_id ?? null,
    project_id: input.projectId,
    removed_paths: removedPaths,
    scope: input.scope,
    sequence: (input.currentTree?.sequence ?? 0) + 1,
    source: input.source,
  };
}
