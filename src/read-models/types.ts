import type { JsonValue } from '../core/json.js';

export const READ_MODEL_VERSION = '1.0.0';

export type ReadModelCompleteness = 'complete' | 'partial' | 'unknown';

export type ReadModelState =
  | 'accepted'
  | 'proposed'
  | 'rejected'
  | 'modified'
  | 'revoked'
  | 'superseded'
  | 'deferred'
  | 'generated'
  | 'conflicted'
  | 'partial'
  | 'stale'
  | 'blocked'
  | 'pending'
  | 'unknown'
  | 'complete'
  | 'failed'
  | 'current'
  | 'not_evaluated';

export type ReadModelCollection =
  | 'authority_sources'
  | 'authority_documents'
  | 'authority_decisions'
  | 'semantic_assertions'
  | 'semantic_decisions'
  | 'semantic_conflicts'
  | 'semantic_review_requests'
  | 'source_correspondence'
  | 'artifact_clusters'
  | 'workflow_occurrences'
  | 'virtual_artifacts'
  | 'materialization_events'
  | 'manifest_revisions'
  | 'manifest_heads'
  | 'regeneration_attempts'
  | 'equivalence_evaluations'
  | 'reuse_results'
  | 'material_tree_entries'
  | 'material_operation_receipts'
  | 'evidence_intake';

export interface ReadModelWarning {
  readonly code: string;
  readonly message: string;
}

export interface ReadModelMaterialRef {
  readonly kind: 'tree_revision' | 'node_revision' | 'node' | 'path' | 'operation';
  readonly ref: string;
}

export interface ReadModelItem {
  readonly collection: ReadModelCollection;
  readonly record_ref: string;
  readonly state: ReadModelState;
  readonly created_at: string;
  readonly material_refs: readonly ReadModelMaterialRef[];
  readonly record: JsonValue;
}

export interface ReadModelPageInfo {
  readonly limit: number;
  readonly next_cursor: string | null;
  readonly order: 'collection:created_at:record_ref';
  readonly total_count: number;
}

export interface ReadModelEnvelope {
  readonly read_model_version: typeof READ_MODEL_VERSION;
  readonly model: 'expflow.advanced-records';
  readonly project_id: string;
  readonly material_head_tree_revision_id: string | null;
  readonly generated_at: string;
  readonly completeness: {
    readonly status: ReadModelCompleteness;
    readonly reason: string | null;
  };
  readonly warnings: readonly ReadModelWarning[];
}

export interface ReadModelPage {
  readonly envelope: ReadModelEnvelope;
  readonly collection: ReadModelCollection;
  readonly page: ReadModelPageInfo;
  readonly items: readonly ReadModelItem[];
}

export interface ReadModelCollectionSummary {
  readonly collection: ReadModelCollection;
  readonly states: readonly ReadModelState[];
  readonly total_count: number;
}

export interface ReadModelOverview {
  readonly envelope: ReadModelEnvelope;
  readonly collections: readonly ReadModelCollectionSummary[];
}

export interface ListReadModelInput {
  readonly root?: string;
  readonly collection: ReadModelCollection;
  readonly state?: ReadModelState;
  readonly limit?: number;
  readonly cursor?: string;
}

export interface ReadModelRuntime {
  overview(input?: { readonly root?: string }): Promise<ReadModelOverview>;
  list(input: ListReadModelInput): Promise<ReadModelPage>;
}
