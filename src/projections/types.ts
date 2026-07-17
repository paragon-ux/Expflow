import type { RequestedBy } from '../material/types.js';

export type ManifestKind = 'import_tree' | 'workflow_time_import_export' | 'source_correspondence';
export type ManifestStatus =
  'generated' | 'proposed' | 'accepted' | 'rejected' | 'stale' | 'superseded' | 'conflicted';
export type ProjectorClass = 'deterministic_template' | 'model_assisted';

export interface ManifestRevisionRecord {
  readonly schema_version: '2.3';
  readonly manifest_revision_id: string;
  readonly manifest_kind: ManifestKind;
  readonly project_id: string;
  readonly tree_revision_id: string;
  readonly workflow_occurrence_id?: string | null;
  readonly readable_locator: string;
  readonly content_digest: string;
  readonly status: ManifestStatus;
  readonly projector_class: ProjectorClass;
  readonly projector_name: string;
  readonly projector_version: string;
  readonly model?: string | null;
  readonly prompt_digest?: string | null;
  readonly source_refs: readonly string[];
  readonly source_decision_refs: readonly string[];
  readonly accepted_by?: RequestedBy | null;
  readonly accepted_at?: string | null;
  readonly superseded_by?: string | null;
  readonly stale_reason?: string | null;
  readonly created_at: string;
}

export interface ManifestRevisionInput {
  readonly manifestKind: ManifestKind;
  readonly treeRevisionId: string;
  readonly workflowOccurrenceId?: string | null;
  readonly readableLocator: string;
  readonly contentDigest: string;
  readonly status?: ManifestStatus;
  readonly projectorClass: ProjectorClass;
  readonly projectorName: string;
  readonly projectorVersion: string;
  readonly model?: string | null;
  readonly promptDigest?: string | null;
  readonly sourceRefs?: readonly string[];
  readonly sourceDecisionRefs?: readonly string[];
  readonly acceptedBy?: RequestedBy | null;
  readonly supersededBy?: string | null;
  readonly staleReason?: string | null;
}

export interface ManifestHeadRecord {
  readonly key: string;
  readonly manifest_revision_ref: string | null;
  readonly status: ManifestStatus | 'none';
}
