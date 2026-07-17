import { createExpflowId } from '../core/ids.js';
import { cloneJson } from '../core/json.js';
import { normalizeProjectRoot, PROJECTION_ROOT } from '../core/paths.js';
import {
  assertDateTime,
  assertEnum,
  assertExpflowId,
  assertNonEmptyString,
  assertRequestedBy,
  assertRequiredSha256Digest,
  assertSha256Digest,
  assertStringArray,
  schemaInvalid,
} from '../core/record-validation.js';
import { readProject, readTreeRevision } from '../material/store.js';
import { ensureProjectionStore, listManifestRevisions, writeManifestRevision } from './store.js';
import type { ManifestHeadRecord, ManifestRevisionInput, ManifestRevisionRecord } from './types.js';

const MANIFEST_KINDS = [
  'import_tree',
  'workflow_time_import_export',
  'source_correspondence',
] as const;
const MANIFEST_STATUSES = [
  'generated',
  'proposed',
  'accepted',
  'rejected',
  'stale',
  'superseded',
  'conflicted',
] as const;
const PROJECTOR_CLASSES = ['deterministic_template', 'model_assisted'] as const;

export interface ProjectionRuntime {
  recordManifestRevision(input: ManifestRevisionInput): Promise<ManifestRevisionRecord>;
  listManifestRevisions(): Promise<readonly ManifestRevisionRecord[]>;
  listManifestHeads(): Promise<readonly ManifestHeadRecord[]>;
}

function manifestRecord(
  projectRoot: string,
  input: ManifestRevisionInput,
  createdAt: string,
): ManifestRevisionRecord {
  readTreeRevision(projectRoot, input.treeRevisionId);
  const status =
    input.status ?? (input.projectorClass === 'model_assisted' ? 'proposed' : 'generated');
  const record: ManifestRevisionRecord = {
    schema_version: '2.3',
    accepted_at: status === 'accepted' ? createdAt : null,
    accepted_by: input.acceptedBy ?? null,
    content_digest: input.contentDigest,
    created_at: createdAt,
    manifest_kind: input.manifestKind,
    manifest_revision_id: createExpflowId('efm'),
    model: input.model ?? null,
    project_id: readProject(projectRoot).project_id,
    projector_class: input.projectorClass,
    projector_name: input.projectorName,
    projector_version: input.projectorVersion,
    prompt_digest: input.promptDigest ?? null,
    readable_locator: input.readableLocator,
    source_decision_refs: input.sourceDecisionRefs ?? [],
    source_refs: input.sourceRefs ?? [],
    stale_reason: input.staleReason ?? null,
    status,
    superseded_by: input.supersededBy ?? null,
    tree_revision_id: input.treeRevisionId,
    workflow_occurrence_id: input.workflowOccurrenceId ?? null,
  };
  assertManifestRevision(record);
  return record;
}

function assertManifestRevision(record: ManifestRevisionRecord): void {
  assertExpflowId(record.manifest_revision_id, 'efm', 'manifest_revision_id');
  assertEnum(record.manifest_kind, MANIFEST_KINDS, 'manifest_kind');
  assertExpflowId(record.project_id, 'efp', 'project_id');
  assertExpflowId(record.tree_revision_id, 'eft', 'tree_revision_id');
  if (record.workflow_occurrence_id !== null && record.workflow_occurrence_id !== undefined) {
    assertExpflowId(record.workflow_occurrence_id, 'efw', 'workflow_occurrence_id');
  }
  if (!record.readable_locator.startsWith(`${PROJECTION_ROOT}/`)) {
    throw schemaInvalid(`readable_locator must be under ${PROJECTION_ROOT}/.`);
  }
  assertRequiredSha256Digest(record.content_digest, 'content_digest');
  assertEnum(record.status, MANIFEST_STATUSES, 'status');
  assertEnum(record.projector_class, PROJECTOR_CLASSES, 'projector_class');
  assertNonEmptyString(record.projector_name, 'projector_name');
  assertNonEmptyString(record.projector_version, 'projector_version');
  if (record.prompt_digest !== null && record.prompt_digest !== undefined) {
    assertSha256Digest(record.prompt_digest, 'prompt_digest');
  }
  assertStringArray(record.source_refs, 'source_refs');
  assertStringArray(record.source_decision_refs, 'source_decision_refs');
  if (record.status === 'accepted') {
    if (record.accepted_by === null || record.accepted_by === undefined) {
      throw schemaInvalid('Accepted manifests require accepted_by attribution.');
    }
    assertRequestedBy(record.accepted_by, 'accepted_by');
    assertDateTime(record.accepted_at, 'accepted_at');
  }
  if (record.projector_class === 'model_assisted' && record.status === 'accepted') {
    assertNonEmptyString(record.model ?? '', 'model');
    if (record.prompt_digest === null || record.prompt_digest === undefined) {
      throw schemaInvalid('Accepted model-assisted manifests require prompt_digest.');
    }
  }
  assertDateTime(record.created_at, 'created_at');
}

function manifestHeads(projectRoot: string): ManifestHeadRecord[] {
  const heads = new Map<string, ManifestRevisionRecord>();
  for (const record of listManifestRevisions(projectRoot)) {
    const key = `${record.manifest_kind}:${record.workflow_occurrence_id ?? 'project'}`;
    if (record.status === 'accepted') {
      heads.set(key, record);
    }
  }
  return [...heads.entries()]
    .map(([key, record]) => ({
      key,
      manifest_revision_ref: record.manifest_revision_id,
      status: record.status,
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
}

export function createProjectionRuntime(root?: string): ProjectionRuntime {
  const projectRoot = normalizeProjectRoot(root);
  return {
    async recordManifestRevision(input): Promise<ManifestRevisionRecord> {
      await Promise.resolve();
      ensureProjectionStore(projectRoot);
      const record = manifestRecord(projectRoot, input, new Date().toISOString());
      writeManifestRevision(projectRoot, record);
      return cloneJson(record);
    },

    async listManifestRevisions(): Promise<readonly ManifestRevisionRecord[]> {
      await Promise.resolve();
      ensureProjectionStore(projectRoot);
      return cloneJson(listManifestRevisions(projectRoot));
    },

    async listManifestHeads(): Promise<readonly ManifestHeadRecord[]> {
      await Promise.resolve();
      ensureProjectionStore(projectRoot);
      return cloneJson(manifestHeads(projectRoot));
    },
  };
}

export function manifestRevisionRef(record: ManifestRevisionRecord): string {
  return record.manifest_revision_id;
}
