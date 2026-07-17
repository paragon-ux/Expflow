import type { RequestedBy } from '../material/types.js';

export interface RegenerationAttemptRecord {
  readonly schema_version: '2.3';
  readonly regeneration_attempt_id: string;
  readonly project_id: string;
  readonly target_kind: 'artifact' | 'workflow';
  readonly target_ref?: string | null;
  readonly source_workflow_occurrence_id: string;
  readonly input_tree_revision_id: string;
  readonly model_profile: string;
  readonly prompt_digest: string;
  readonly tool_profile: string;
  readonly security_profile?: string;
  readonly status: 'queued' | 'running' | 'completed' | 'failed' | 'unknown' | 'cancelled';
  readonly output_refs?: readonly string[];
  readonly started_at: string;
  readonly completed_at?: string | null;
  readonly failure?: object | null;
}

export interface EquivalenceEvaluationRecord {
  readonly schema_version: '2.3';
  readonly evaluation_id: string;
  readonly project_id: string;
  readonly subject_ref: string;
  readonly reference_refs?: readonly string[];
  readonly evaluator: RequestedBy;
  readonly classification:
    | 'exact'
    | 'representation_equivalent'
    | 'workflow_equivalent'
    | 'divergent'
    | 'incomplete'
    | 'failed';
  readonly metrics?: object;
  readonly evidence_refs: readonly string[];
  readonly limitations?: readonly string[];
  readonly created_at: string;
  readonly acceptance_decision_ref?: string | null;
}

export interface ReuseResultRecord {
  readonly schema_version: '2.3';
  readonly reuse_result_id: string;
  readonly project_id: string;
  readonly reference_workflow_occurrence_id: string;
  readonly reference_manifest_revision_id: string;
  readonly new_input_tree_revision_id: string;
  readonly output_workflow_occurrence_id?: string | null;
  readonly status: 'proposed' | 'running' | 'completed' | 'failed' | 'rejected';
  readonly deviation_summary?: string | null;
  readonly semantic_leakage_evaluation_ref?: string | null;
  readonly equivalence_evaluation_refs?: readonly string[];
  readonly acceptance_decision_ref?: string | null;
  readonly created_at: string;
}

export interface RegenerationAttemptInput {
  readonly targetKind: RegenerationAttemptRecord['target_kind'];
  readonly targetRef?: string | null;
  readonly sourceWorkflowOccurrenceId: string;
  readonly inputTreeRevisionId: string;
  readonly modelProfile: string;
  readonly promptDigest: string;
  readonly toolProfile: string;
  readonly securityProfile?: string;
  readonly status?: RegenerationAttemptRecord['status'];
  readonly outputRefs?: readonly string[];
  readonly completedAt?: string | null;
  readonly failure?: object | null;
}

export interface EquivalenceEvaluationInput {
  readonly subjectRef: string;
  readonly referenceRefs?: readonly string[];
  readonly evaluator: RequestedBy;
  readonly classification: EquivalenceEvaluationRecord['classification'];
  readonly metrics?: object;
  readonly evidenceRefs?: readonly string[];
  readonly limitations?: readonly string[];
  readonly acceptanceDecisionRef?: string | null;
}

export interface ReusePolicyGateInput {
  readonly licenseAccepted: boolean;
  readonly authorityAccepted: boolean;
}

export interface ReuseResultInput {
  readonly referenceWorkflowOccurrenceId: string;
  readonly referenceManifestRevisionId: string;
  readonly newInputTreeRevisionId: string;
  readonly outputWorkflowOccurrenceId?: string | null;
  readonly status?: ReuseResultRecord['status'];
  readonly deviationSummary?: string | null;
  readonly semanticLeakageEvaluationRef?: string | null;
  readonly equivalenceEvaluationRefs?: readonly string[];
  readonly acceptanceDecisionRef?: string | null;
  readonly policyGate?: ReusePolicyGateInput;
}
