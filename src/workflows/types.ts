import type { PathSelectorRecord, RequestedBy } from '../material/types.js';

export type MaterialStatus = 'inputs_pinned' | 'outputs_present' | 'outputs_incomplete';
export type CompletionStatus = 'none' | 'asserted' | 'accepted' | 'rejected' | 'conflicted';
export type VerificationStatus = 'not_evaluated' | 'passed' | 'failed' | 'partial';
export type ReuseStatus = 'not_evaluated' | 'eligible' | 'approved' | 'rejected';

export interface WorkflowOccurrenceRecord {
  readonly schema_version: '2.3';
  readonly workflow_occurrence_id: string;
  readonly project_id: string;
  readonly input_tree_revision_id: string;
  readonly input_path_selector: PathSelectorRecord;
  readonly output_tree_revision_id?: string | null;
  readonly output_path_selector?: PathSelectorRecord | null;
  readonly start_operation_id: string;
  readonly completion_operation_id?: string | null;
  readonly authority_source_revision_refs: readonly string[];
  readonly authority_document_refs?: readonly string[];
  readonly virtual_artifact_refs?: readonly string[];
  readonly material_status: MaterialStatus;
  readonly completion_status: CompletionStatus;
  readonly verification_status: VerificationStatus;
  readonly reuse_status: ReuseStatus;
  readonly completion_assertion_ref?: string | null;
  readonly completion_decision_ref?: string | null;
  readonly verification_decision_ref?: string | null;
  readonly reuse_decision_ref?: string | null;
  readonly created_at: string;
  readonly supersedes_occurrence_ref?: string | null;
}

export interface VirtualArtifactRecord {
  readonly schema_version: '2.3';
  readonly virtual_artifact_id: string;
  readonly project_id: string;
  readonly workflow_occurrence_id: string;
  readonly generation_event_ref: string;
  readonly display_name: string;
  readonly media_type?: string | null;
  readonly parent_refs?: readonly string[];
  readonly availability:
    'virtual' | 'externally_referenced' | 'unavailable' | 'materialized' | 'regenerated';
  readonly materialization_event_refs?: readonly string[];
  readonly created_at: string;
}

export interface MaterializationEventRecord {
  readonly schema_version: '2.3';
  readonly materialization_event_id: string;
  readonly project_id: string;
  readonly virtual_artifact_id: string;
  readonly material_node_ref: string;
  readonly event_kind: 'download' | 'copy' | 'convert' | 'external_save' | 'regenerate' | 'import';
  readonly asserted_by: RequestedBy;
  readonly authority_source_refs?: readonly string[];
  readonly occurred_at: string;
  readonly notes?: string | null;
}

export interface StartWorkflowInput {
  readonly inputTreeRevisionId: string;
  readonly inputPathSelector: PathSelectorRecord;
  readonly startOperationId: string;
  readonly authoritySourceRevisionRefs?: readonly string[];
  readonly authorityDocumentRefs?: readonly string[];
}

export interface AttachWorkflowOutputInput {
  readonly workflowOccurrenceId: string;
  readonly outputTreeRevisionId: string;
  readonly outputPathSelector: PathSelectorRecord;
  readonly completionOperationId?: string | null;
}

export interface WorkflowStateTransitionInput {
  readonly workflowOccurrenceId: string;
  readonly materialStatus?: MaterialStatus;
  readonly completionStatus?: CompletionStatus;
  readonly verificationStatus?: VerificationStatus;
  readonly reuseStatus?: ReuseStatus;
  readonly completionAssertionRef?: string | null;
  readonly completionDecisionRef?: string | null;
  readonly verificationDecisionRef?: string | null;
  readonly reuseDecisionRef?: string | null;
}

export interface VirtualArtifactInput {
  readonly workflowOccurrenceId: string;
  readonly generationEventRef: string;
  readonly displayName: string;
  readonly mediaType?: string | null;
  readonly parentRefs?: readonly string[];
  readonly availability?: VirtualArtifactRecord['availability'];
  readonly materializationEventRefs?: readonly string[];
}

export interface MaterializationEventInput {
  readonly virtualArtifactId: string;
  readonly materialNodeRef: string;
  readonly eventKind: MaterializationEventRecord['event_kind'];
  readonly assertedBy: RequestedBy;
  readonly authoritySourceRefs?: readonly string[];
  readonly notes?: string | null;
}
