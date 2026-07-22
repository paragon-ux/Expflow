import { Buffer } from 'node:buffer';
import { ExpflowError, toExpflowError } from '../core/errors.js';
import { cloneJson, type JsonValue } from '../core/json.js';
import { normalizeProjectRoot } from '../core/paths.js';
import { sourceRef } from '../authority/runtime.js';
import {
  listAuthorityDocuments,
  listAuthoritySources,
  listSourceRegistrationDecisions,
} from '../authority/store.js';
import {
  listArtifactClusters,
  listConflicts,
  listReviewRequests,
  listSemanticAssertions,
  listSemanticDecisions,
  listSourceCorrespondence,
} from '../semantics/store.js';
import {
  listMaterializationEvents,
  listVirtualArtifacts,
  listWorkflowOccurrences,
} from '../workflows/store.js';
import { listManifestRevisions } from '../projections/store.js';
import {
  listEquivalenceEvaluations,
  listRegenerationAttempts,
  listReuseResults,
} from '../reproduction/store.js';
import {
  listOperationReceipts,
  readHead,
  readProject,
  readTreeRevision,
} from '../material/store.js';
import {
  READ_MODEL_VERSION,
  type ListReadModelInput,
  type ReadModelCollection,
  type ReadModelCollectionSummary,
  type ReadModelEnvelope,
  type ReadModelItem,
  type ReadModelMaterialRef,
  type ReadModelOverview,
  type ReadModelPage,
  type ReadModelRuntime,
  type ReadModelState,
} from './types.js';
import type {
  AuthorityDocumentRecord,
  AuthoritySourceRecord,
  AuthorityStatusProjection,
  SourceRegistrationDecisionRecord,
} from '../authority/types.js';
import type {
  ArtifactClusterRecord,
  ConflictRecord,
  ReviewRequestRecord,
  SemanticAssertionRecord,
  SemanticDecisionRecord,
  SourceCorrespondenceRecord,
} from '../semantics/types.js';
import type {
  MaterializationEventRecord,
  VirtualArtifactRecord,
  WorkflowOccurrenceRecord,
} from '../workflows/types.js';
import type { ManifestHeadRecord, ManifestRevisionRecord } from '../projections/types.js';
import type {
  EquivalenceEvaluationRecord,
  RegenerationAttemptRecord,
  ReuseResultRecord,
} from '../reproduction/types.js';
import type { OperationReceiptRecord, TreeEntryRecord } from '../material/types.js';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

const COLLECTIONS = [
  'authority_sources',
  'authority_documents',
  'authority_decisions',
  'semantic_assertions',
  'semantic_decisions',
  'semantic_conflicts',
  'semantic_review_requests',
  'source_correspondence',
  'artifact_clusters',
  'workflow_occurrences',
  'virtual_artifacts',
  'materialization_events',
  'manifest_revisions',
  'manifest_heads',
  'regeneration_attempts',
  'equivalence_evaluations',
  'reuse_results',
  'material_tree_entries',
  'material_operation_receipts',
] as const satisfies readonly ReadModelCollection[];

interface CursorPayload {
  readonly collection: ReadModelCollection;
  readonly sort_key: string;
}

interface ProjectContext {
  readonly projectRoot: string;
  readonly projectId: string;
  readonly materialHead: string | null;
  readonly generatedAt: string;
}

type JsonRecord = Record<string, JsonValue>;

function normalizeLimit(limit: number | undefined): number {
  if (limit === undefined) {
    return DEFAULT_LIMIT;
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new ExpflowError(
      'read_model_invalid_limit',
      `Read model limit must be an integer between 1 and ${String(MAX_LIMIT)}.`,
      { recoverable: true },
    );
  }
  return limit;
}

function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
}

function decodeCursor(cursor: string | undefined, collection: ReadModelCollection): string | null {
  if (cursor === undefined) {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8')) as unknown;
    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      (decoded as CursorPayload).collection !== collection ||
      typeof (decoded as CursorPayload).sort_key !== 'string'
    ) {
      throw new Error('invalid cursor');
    }
    return (decoded as CursorPayload).sort_key;
  } catch {
    throw new ExpflowError('read_model_invalid_cursor', 'Read model cursor is invalid.', {
      recoverable: true,
    });
  }
}

function asJsonRecord(record: unknown): JsonRecord {
  return cloneJson(record) as JsonRecord;
}

function sortKey(item: ReadModelItem): string {
  return `${item.created_at}\u0000${item.record_ref}`;
}

function sortItems(items: readonly ReadModelItem[]): ReadModelItem[] {
  return [...items].sort((left, right) => {
    const created = left.created_at.localeCompare(right.created_at);
    return created === 0 ? left.record_ref.localeCompare(right.record_ref) : created;
  });
}

function collectionItem(
  collection: ReadModelCollection,
  recordRef: string,
  state: ReadModelState,
  createdAt: string,
  record: unknown,
  materialRefs: readonly ReadModelMaterialRef[] = [],
): ReadModelItem {
  return {
    collection,
    created_at: createdAt,
    material_refs: materialRefs,
    record: asJsonRecord(record),
    record_ref: recordRef,
    state,
  };
}

function context(projectRoot: string): ProjectContext {
  const project = readProject(projectRoot);
  const materialHead = readHead(projectRoot);
  const generatedAt =
    materialHead === null
      ? project.created_at
      : readTreeRevision(projectRoot, materialHead).created_at;
  return {
    generatedAt,
    materialHead,
    projectId: project.project_id,
    projectRoot,
  };
}

function envelope(ctx: ProjectContext): ReadModelEnvelope {
  return {
    completeness: { reason: null, status: 'complete' },
    generated_at: ctx.generatedAt,
    material_head_tree_revision_id: ctx.materialHead,
    model: 'expflow.advanced-records',
    project_id: ctx.projectId,
    read_model_version: READ_MODEL_VERSION,
    warnings: [],
  };
}

function sourceIsEffective(source: AuthoritySourceRecord, generatedAt: string): boolean {
  const interval = source.effective_interval;
  if (interval === null || interval === undefined) {
    return true;
  }
  const generatedAtMs = Date.parse(generatedAt);
  if (
    interval.start !== null &&
    interval.start !== undefined &&
    Date.parse(interval.start) > generatedAtMs
  ) {
    return false;
  }
  if (
    interval.end !== null &&
    interval.end !== undefined &&
    Date.parse(interval.end) < generatedAtMs
  ) {
    return false;
  }
  return true;
}

function refsSupersededBySource(
  source: AuthoritySourceRecord,
  sourcesByRef: ReadonlyMap<string, AuthoritySourceRecord>,
): string[] {
  const refs = new Set<string>();
  for (let current: AuthoritySourceRecord | undefined = source; current !== undefined;) {
    const supersededRef = current.supersedes_source_revision_ref;
    if (supersededRef === null || supersededRef === undefined) {
      break;
    }
    refs.add(supersededRef);
    current = sourcesByRef.get(supersededRef);
  }
  const sourcePrefix = `${source.source_id}@`;
  for (const ref of sourcesByRef.keys()) {
    if (ref.startsWith(sourcePrefix) && ref !== sourceRef(source)) {
      refs.add(ref);
    }
  }
  return [...refs];
}

function sourceStates(
  status: AuthorityStatusProjection,
  sourcesByRef: ReadonlyMap<string, AuthoritySourceRecord>,
): Map<string, ReadModelState> {
  const states = new Map<string, ReadModelState>();
  const acceptedRefs = new Set(status.accepted_source_refs);
  for (const decision of status.decisions) {
    states.set(
      decision.source_revision_ref,
      decision.outcome === 'revoked' ? 'revoked' : decision.outcome,
    );
  }
  for (const [ref, source] of sourcesByRef) {
    if (
      states.get(ref) === 'accepted' &&
      !acceptedRefs.has(ref) &&
      !sourceIsEffective(source, status.generated_at)
    ) {
      states.set(ref, 'stale');
    }
  }
  for (const source of status.accepted_sources) {
    for (const ref of refsSupersededBySource(source, sourcesByRef)) {
      states.set(ref, 'superseded');
    }
  }
  for (const source of status.accepted_sources) {
    states.set(sourceRef(source), 'accepted');
  }
  return states;
}

function authorityStatus(projectRoot: string): AuthorityStatusProjection {
  const decisions = listSourceRegistrationDecisions(projectRoot);
  const sources = listAuthoritySources(projectRoot);
  const sourcesByRef = new Map(sources.map((source) => [sourceRef(source), source]));
  const acceptedRefs = new Set<string>();
  const decisionsById = new Map(decisions.map((decision) => [decision.decision_id, decision]));
  for (const decision of decisions) {
    if (
      decision.supersedes_decision_ref !== null &&
      decision.supersedes_decision_ref !== undefined
    ) {
      const superseded = decisionsById.get(decision.supersedes_decision_ref);
      if (superseded !== undefined) {
        acceptedRefs.delete(superseded.source_revision_ref);
      }
    }
    if (decision.outcome === 'accepted') {
      const source = sourcesByRef.get(decision.source_revision_ref);
      if (source === undefined) {
        continue;
      }
      for (const ref of refsSupersededBySource(source, sourcesByRef)) {
        acceptedRefs.delete(ref);
      }
      acceptedRefs.add(decision.source_revision_ref);
    }
    if (
      decision.outcome === 'rejected' ||
      decision.outcome === 'revoked' ||
      decision.outcome === 'superseded'
    ) {
      acceptedRefs.delete(decision.source_revision_ref);
    }
  }
  const generatedAt = context(projectRoot).generatedAt;
  for (const ref of [...acceptedRefs]) {
    const source = sourcesByRef.get(ref);
    if (source === undefined || !sourceIsEffective(source, generatedAt)) {
      acceptedRefs.delete(ref);
    }
  }
  const acceptedSources = sources
    .filter((source) => acceptedRefs.has(sourceRef(source)))
    .sort((left, right) => sourceRef(left).localeCompare(sourceRef(right)));
  return {
    accepted_source_refs: acceptedSources.map(sourceRef),
    accepted_sources: acceptedSources,
    decisions,
    generated_at: generatedAt,
  };
}

function authoritySourceItem(
  record: AuthoritySourceRecord,
  states: Map<string, ReadModelState>,
): ReadModelItem {
  const ref = sourceRef(record);
  return collectionItem(
    'authority_sources',
    ref,
    states.get(ref) ?? 'proposed',
    record.created_at,
    record,
  );
}

function authorityDecisionItem(record: SourceRegistrationDecisionRecord): ReadModelItem {
  return collectionItem(
    'authority_decisions',
    record.decision_id,
    record.outcome === 'revoked' ? 'revoked' : record.outcome,
    record.created_at,
    record,
  );
}

function authorityDocumentItem(record: AuthorityDocumentRecord): ReadModelItem {
  return collectionItem(
    'authority_documents',
    record.document_id,
    'current',
    record.created_at,
    record,
  );
}

function semanticAssertionItem(record: SemanticAssertionRecord): ReadModelItem {
  const refs =
    record.tree_revision_id == null
      ? []
      : [{ kind: 'tree_revision', ref: record.tree_revision_id } satisfies ReadModelMaterialRef];
  return collectionItem(
    'semantic_assertions',
    record.assertion_id,
    'proposed',
    record.created_at,
    record,
    refs,
  );
}

function semanticDecisionItem(record: SemanticDecisionRecord): ReadModelItem {
  return collectionItem(
    'semantic_decisions',
    record.decision_id,
    record.outcome === 'revoked' ? 'revoked' : record.outcome,
    record.created_at,
    record,
  );
}

function conflictItem(record: ConflictRecord): ReadModelItem {
  return collectionItem(
    'semantic_conflicts',
    record.conflict_id,
    'conflicted',
    record.declared_at,
    record,
  );
}

function reviewRequestItem(record: ReviewRequestRecord): ReadModelItem {
  return collectionItem(
    'semantic_review_requests',
    record.review_request_id,
    record.resolved_by_decision_ref == null
      ? record.blocking
        ? 'blocked'
        : 'pending'
      : 'complete',
    record.requested_at,
    record,
  );
}

function sourceCorrespondenceItem(record: SourceCorrespondenceRecord): ReadModelItem {
  return collectionItem(
    'source_correspondence',
    record.correspondence_id,
    record.decision_ref == null ? 'proposed' : 'accepted',
    record.created_at,
    record,
    record.candidate_entries.map((entry) => ({
      kind: 'path',
      ref: `${entry.tree_revision_id}:${entry.relative_path}`,
    })),
  );
}

function artifactClusterItem(record: ArtifactClusterRecord): ReadModelItem {
  return collectionItem(
    'artifact_clusters',
    record.cluster_id,
    record.derived_state === 'ambiguous' ? 'unknown' : record.derived_state,
    record.computed_at,
    record,
  );
}

function workflowItem(record: WorkflowOccurrenceRecord): ReadModelItem {
  const state: ReadModelState =
    record.completion_status === 'accepted'
      ? 'complete'
      : record.completion_status === 'conflicted'
        ? 'conflicted'
        : record.verification_status === 'partial' ||
            record.material_status === 'outputs_incomplete'
          ? 'partial'
          : record.completion_status === 'rejected'
            ? 'rejected'
            : 'pending';
  return collectionItem(
    'workflow_occurrences',
    record.workflow_occurrence_id,
    state,
    record.created_at,
    record,
    [
      { kind: 'tree_revision', ref: record.input_tree_revision_id },
      ...(record.output_tree_revision_id == null
        ? []
        : [
            {
              kind: 'tree_revision',
              ref: record.output_tree_revision_id,
            } satisfies ReadModelMaterialRef,
          ]),
      { kind: 'operation', ref: record.start_operation_id },
      ...(record.completion_operation_id == null
        ? []
        : [
            {
              kind: 'operation',
              ref: record.completion_operation_id,
            } satisfies ReadModelMaterialRef,
          ]),
    ],
  );
}

function virtualArtifactItem(record: VirtualArtifactRecord): ReadModelItem {
  return collectionItem(
    'virtual_artifacts',
    record.virtual_artifact_id,
    record.availability === 'unavailable'
      ? 'unknown'
      : record.availability === 'materialized' || record.availability === 'regenerated'
        ? 'complete'
        : 'pending',
    record.created_at,
    record,
  );
}

function materializationItem(record: MaterializationEventRecord): ReadModelItem {
  return collectionItem(
    'materialization_events',
    record.materialization_event_id,
    'complete',
    record.occurred_at,
    record,
    [{ kind: 'node', ref: record.material_node_ref }],
  );
}

function manifestItem(record: ManifestRevisionRecord): ReadModelItem {
  return collectionItem(
    'manifest_revisions',
    record.manifest_revision_id,
    record.status,
    record.created_at,
    record,
    [{ kind: 'tree_revision', ref: record.tree_revision_id }],
  );
}

function manifestHeadItem(ctx: ProjectContext, record: ManifestHeadRecord): ReadModelItem {
  return collectionItem(
    'manifest_heads',
    record.key,
    record.status === 'none' ? 'unknown' : record.status,
    ctx.generatedAt,
    record,
  );
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

function regenerationItem(record: RegenerationAttemptRecord): ReadModelItem {
  const state: ReadModelState =
    record.status === 'completed'
      ? 'complete'
      : record.status === 'queued' || record.status === 'running'
        ? 'pending'
        : record.status === 'cancelled'
          ? 'failed'
          : record.status;
  return collectionItem(
    'regeneration_attempts',
    record.regeneration_attempt_id,
    state,
    record.started_at,
    record,
    [{ kind: 'tree_revision', ref: record.input_tree_revision_id }],
  );
}

function equivalenceItem(record: EquivalenceEvaluationRecord): ReadModelItem {
  const state: ReadModelState =
    record.classification === 'failed'
      ? 'failed'
      : record.classification === 'incomplete'
        ? 'partial'
        : 'complete';
  return collectionItem(
    'equivalence_evaluations',
    record.evaluation_id,
    state,
    record.created_at,
    record,
  );
}

function reuseItem(record: ReuseResultRecord): ReadModelItem {
  const state: ReadModelState =
    record.status === 'completed'
      ? 'complete'
      : record.status === 'running'
        ? 'pending'
        : record.status;
  return collectionItem('reuse_results', record.reuse_result_id, state, record.created_at, record, [
    { kind: 'tree_revision', ref: record.new_input_tree_revision_id },
  ]);
}

function treeEntryItem(
  treeRevisionId: string,
  createdAt: string,
  record: TreeEntryRecord,
): ReadModelItem {
  return collectionItem(
    'material_tree_entries',
    `${treeRevisionId}:${record.relative_path}`,
    'current',
    createdAt,
    record,
    [
      { kind: 'tree_revision', ref: treeRevisionId },
      { kind: 'path', ref: record.relative_path },
      ...(record.node_id == null
        ? []
        : [{ kind: 'node', ref: record.node_id } satisfies ReadModelMaterialRef]),
      ...(record.node_id == null || record.node_revision == null
        ? []
        : [
            {
              kind: 'node_revision',
              ref: `${record.node_id}@${String(record.node_revision)}`,
            } satisfies ReadModelMaterialRef,
          ]),
    ],
  );
}

function receiptItem(record: OperationReceiptRecord): ReadModelItem {
  return collectionItem(
    'material_operation_receipts',
    record.operation_id,
    record.status === 'partial_post_commit'
      ? 'partial'
      : record.status === 'committed' || record.status === 'no_change'
        ? 'complete'
        : record.status === 'rejected'
          ? 'rejected'
          : 'unknown',
    record.finished_at,
    record,
    [
      { kind: 'operation', ref: record.operation_id },
      ...(record.previous_head == null
        ? []
        : [{ kind: 'tree_revision', ref: record.previous_head } satisfies ReadModelMaterialRef]),
      ...(record.new_head == null
        ? []
        : [{ kind: 'tree_revision', ref: record.new_head } satisfies ReadModelMaterialRef]),
    ],
  );
}

function collectionItems(
  ctx: ProjectContext,
  collection: ReadModelCollection,
): readonly ReadModelItem[] {
  switch (collection) {
    case 'authority_sources': {
      const status = authorityStatus(ctx.projectRoot);
      const sources = listAuthoritySources(ctx.projectRoot);
      const states = sourceStates(
        status,
        new Map(sources.map((source) => [sourceRef(source), source])),
      );
      return sources.map((record) => authoritySourceItem(record, states));
    }
    case 'authority_documents':
      return listAuthorityDocuments(ctx.projectRoot).map(authorityDocumentItem);
    case 'authority_decisions':
      return authorityStatus(ctx.projectRoot).decisions.map(authorityDecisionItem);
    case 'semantic_assertions':
      return listSemanticAssertions(ctx.projectRoot).map(semanticAssertionItem);
    case 'semantic_decisions':
      return listSemanticDecisions(ctx.projectRoot).map(semanticDecisionItem);
    case 'semantic_conflicts':
      return listConflicts(ctx.projectRoot).map(conflictItem);
    case 'semantic_review_requests':
      return listReviewRequests(ctx.projectRoot).map(reviewRequestItem);
    case 'source_correspondence':
      return listSourceCorrespondence(ctx.projectRoot).map(sourceCorrespondenceItem);
    case 'artifact_clusters':
      return listArtifactClusters(ctx.projectRoot).map(artifactClusterItem);
    case 'workflow_occurrences':
      return listWorkflowOccurrences(ctx.projectRoot).map(workflowItem);
    case 'virtual_artifacts':
      return listVirtualArtifacts(ctx.projectRoot).map(virtualArtifactItem);
    case 'materialization_events':
      return listMaterializationEvents(ctx.projectRoot).map(materializationItem);
    case 'manifest_revisions':
      return listManifestRevisions(ctx.projectRoot).map(manifestItem);
    case 'manifest_heads':
      return manifestHeads(ctx.projectRoot).map((record) => manifestHeadItem(ctx, record));
    case 'regeneration_attempts':
      return listRegenerationAttempts(ctx.projectRoot).map(regenerationItem);
    case 'equivalence_evaluations':
      return listEquivalenceEvaluations(ctx.projectRoot).map(equivalenceItem);
    case 'reuse_results':
      return listReuseResults(ctx.projectRoot).map(reuseItem);
    case 'material_tree_entries': {
      if (ctx.materialHead === null) {
        return [];
      }
      const tree = readTreeRevision(ctx.projectRoot, ctx.materialHead);
      return tree.entries.map((entry) =>
        treeEntryItem(tree.tree_revision_id, tree.created_at, entry),
      );
    }
    case 'material_operation_receipts':
      return listOperationReceipts(ctx.projectRoot).map(receiptItem);
  }
}

function pageItems(
  items: readonly ReadModelItem[],
  collection: ReadModelCollection,
  state: ReadModelState | undefined,
  cursor: string | undefined,
  limit: number,
): {
  readonly items: readonly ReadModelItem[];
  readonly nextCursor: string | null;
  readonly totalCount: number;
} {
  const cursorSortKey = decodeCursor(cursor, collection);
  const filtered = sortItems(
    state === undefined ? items : items.filter((item) => item.state === state),
  );
  const afterCursor =
    cursorSortKey === null ? filtered : filtered.filter((item) => sortKey(item) > cursorSortKey);
  const page = afterCursor.slice(0, limit);
  const last = page.at(-1);
  const nextCursor =
    page.length < afterCursor.length && last !== undefined
      ? encodeCursor({ collection, sort_key: sortKey(last) })
      : null;
  return { items: page, nextCursor, totalCount: filtered.length };
}

function validateCollection(collection: ReadModelCollection): void {
  if (!COLLECTIONS.includes(collection)) {
    throw new ExpflowError(
      'read_model_unknown_collection',
      `Unknown read model collection: ${collection}`,
      { recoverable: true },
    );
  }
}

function withReadModelError(error: unknown): never {
  throw toExpflowError(error);
}

export function createReadModelRuntime(root?: string): ReadModelRuntime {
  const defaultRoot = root;
  return {
    async overview(input = {}): Promise<ReadModelOverview> {
      await Promise.resolve();
      try {
        const ctx = context(normalizeProjectRoot(input.root ?? defaultRoot));
        const collections: ReadModelCollectionSummary[] = [];
        for (const collection of COLLECTIONS) {
          const items = collectionItems(ctx, collection);
          collections.push({
            collection,
            states: [...new Set(items.map((item) => item.state))].sort(),
            total_count: items.length,
          });
        }
        return { collections, envelope: envelope(ctx) };
      } catch (error) {
        withReadModelError(error);
      }
    },

    async list(input: ListReadModelInput): Promise<ReadModelPage> {
      await Promise.resolve();
      try {
        validateCollection(input.collection);
        const limit = normalizeLimit(input.limit);
        const ctx = context(normalizeProjectRoot(input.root ?? defaultRoot));
        const items = collectionItems(ctx, input.collection);
        const page = pageItems(items, input.collection, input.state, input.cursor, limit);
        return {
          collection: input.collection,
          envelope: envelope(ctx),
          items: page.items,
          page: {
            limit,
            next_cursor: page.nextCursor,
            order: 'collection:created_at:record_ref',
            total_count: page.totalCount,
          },
        };
      } catch (error) {
        withReadModelError(error);
      }
    },
  };
}
