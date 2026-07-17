import type { RequestedBy } from '../material/types.js';

export type SemanticAssertionType =
  | 'role_proposal'
  | 'cluster_proposal'
  | 'workflow_boundary'
  | 'materialization_link'
  | 'semantic_drift'
  | 'source_correspondence'
  | 'completion_declaration'
  | 'reuse_fit'
  | 'custom';

export type SemanticDecisionKind =
  | 'cluster_membership'
  | 'source_correspondence'
  | 'workflow_boundary'
  | 'workflow_completion'
  | 'workflow_verification'
  | 'manifest_acceptance'
  | 'reuse_eligibility'
  | 'conflict_resolution'
  | 'policy_exception'
  | 'custom';

export type SemanticDecisionOutcome =
  'accepted' | 'rejected' | 'modified' | 'deferred' | 'revoked' | 'superseded';

export interface SemanticAssertionRecord {
  readonly schema_version: '2.3';
  readonly assertion_id: string;
  readonly project_id: string;
  readonly tree_revision_id?: string | null;
  readonly workflow_occurrence_id?: string | null;
  readonly issuer: RequestedBy;
  readonly assertion_type: SemanticAssertionType;
  readonly created_at: string;
  readonly subject_refs: readonly string[];
  readonly input_refs?: readonly string[];
  readonly claims: readonly {
    readonly predicate: string;
    readonly value: unknown;
    readonly confidence?: number | null;
    readonly explanation?: string | null;
  }[];
  readonly limitations: readonly string[];
  readonly content_digest?: string;
}

export interface SemanticDecisionRecord {
  readonly schema_version: '2.3';
  readonly decision_id: string;
  readonly decision_kind: SemanticDecisionKind;
  readonly subject_refs: readonly string[];
  readonly proposal_refs: readonly string[];
  readonly outcome: SemanticDecisionOutcome;
  readonly made_by: RequestedBy;
  readonly automated: boolean;
  readonly policy_profile?: string | null;
  readonly rationale: string;
  readonly evidence_refs: readonly string[];
  readonly consequences: readonly string[];
  readonly created_at: string;
  readonly supersedes_decision_ref?: string | null;
  readonly modified_value?: unknown;
}

export interface ConflictRecord {
  readonly schema_version: '2.3';
  readonly conflict_id: string;
  readonly project_id: string;
  readonly subject_refs: readonly string[];
  readonly competing_claim_refs: readonly string[];
  readonly authority_scope: string;
  readonly severity: 'informational' | 'review' | 'blocking';
  readonly declared_at: string;
  readonly review_request_ref?: string | null;
  readonly notes?: string | null;
}

export interface ReviewRequestRecord {
  readonly schema_version: '2.3';
  readonly review_request_id: string;
  readonly project_id: string;
  readonly subject_refs: readonly string[];
  readonly requested_action: string;
  readonly blocking: boolean;
  readonly requested_at: string;
  readonly requested_by?: RequestedBy;
  readonly resolved_by_decision_ref?: string | null;
}

export interface SourceCorrespondenceRecord {
  readonly schema_version: '2.3';
  readonly correspondence_id: string;
  readonly project_id: string;
  readonly source_record_ref: string;
  readonly candidate_entries: readonly SourceCorrespondenceEntry[];
  readonly proposed_selection?: SourceCorrespondenceEntry | null;
  readonly evidence_refs: readonly string[];
  readonly decision_ref?: string | null;
  readonly unresolved_alternatives?: readonly SourceCorrespondenceEntry[];
  readonly created_at: string;
}

export interface SourceCorrespondenceEntry {
  readonly tree_revision_id: string;
  readonly relative_path: string;
  readonly node_id: string;
  readonly node_revision: number;
}

export interface ArtifactClusterRecord {
  readonly schema_version: '2.3';
  readonly cluster_id: string;
  readonly project_id: string;
  readonly proposal_refs: readonly string[];
  readonly member_refs: readonly string[];
  readonly evidence_refs: readonly string[];
  readonly decision_refs: readonly string[];
  readonly derived_state:
    'proposed' | 'accepted' | 'ambiguous' | 'conflicted' | 'rejected' | 'superseded';
  readonly logical_label?: string | null;
  readonly computed_at: string;
  readonly decision_head?: string | null;
}

export interface SemanticAssertionInput {
  readonly treeRevisionId?: string | null;
  readonly workflowOccurrenceId?: string | null;
  readonly issuer: RequestedBy;
  readonly assertionType: SemanticAssertionType;
  readonly subjectRefs: readonly string[];
  readonly inputRefs?: readonly string[];
  readonly claims: SemanticAssertionRecord['claims'];
  readonly limitations?: readonly string[];
  readonly contentDigest?: string;
}

export interface SemanticDecisionInput {
  readonly decisionKind: SemanticDecisionKind;
  readonly subjectRefs: readonly string[];
  readonly proposalRefs?: readonly string[];
  readonly outcome: SemanticDecisionOutcome;
  readonly madeBy: RequestedBy;
  readonly automated: boolean;
  readonly policyProfile?: string | null;
  readonly rationale: string;
  readonly evidenceRefs?: readonly string[];
  readonly consequences?: readonly string[];
  readonly supersedesDecisionRef?: string | null;
  readonly modifiedValue?: unknown;
}

export interface ConflictInput {
  readonly subjectRefs: readonly string[];
  readonly competingClaimRefs: readonly string[];
  readonly authorityScope: string;
  readonly severity: ConflictRecord['severity'];
  readonly reviewRequestRef?: string | null;
  readonly notes?: string | null;
}

export interface ReviewRequestInput {
  readonly subjectRefs: readonly string[];
  readonly requestedAction: string;
  readonly blocking: boolean;
  readonly requestedBy?: RequestedBy;
  readonly resolvedByDecisionRef?: string | null;
}

export interface SourceCorrespondenceInput {
  readonly sourceRecordRef: string;
  readonly candidateEntries: readonly SourceCorrespondenceEntry[];
  readonly proposedSelection?: SourceCorrespondenceEntry | null;
  readonly evidenceRefs?: readonly string[];
  readonly decisionRef?: string | null;
  readonly unresolvedAlternatives?: readonly SourceCorrespondenceEntry[];
}

export interface ArtifactClusterInput {
  readonly proposalRefs?: readonly string[];
  readonly memberRefs: readonly string[];
  readonly evidenceRefs?: readonly string[];
  readonly decisionRefs?: readonly string[];
  readonly derivedState: ArtifactClusterRecord['derived_state'];
  readonly logicalLabel?: string | null;
  readonly decisionHead?: string | null;
}

export interface GateCChangeRecord {
  readonly family: string;
  readonly record_ref: string;
  readonly created_at: string;
}
