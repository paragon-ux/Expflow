import type { PathSelectorRecord, RequestedBy } from '../material/types.js';

export type SourceRegistrationOutcome =
  'accepted' | 'rejected' | 'revoked' | 'superseded' | 'deferred';

export interface AuthoritySourceRecord {
  readonly schema_version: '2.3';
  readonly source_id: string;
  readonly source_revision: number;
  readonly source_type: string;
  readonly issuer: RequestedBy;
  readonly origin: string;
  readonly schema_uri: string;
  readonly schema_version_declared: string;
  readonly subject_scope: PathSelectorRecord;
  readonly fact_scope: readonly string[];
  readonly effective_interval?: {
    readonly start?: string | null;
    readonly end?: string | null;
  } | null;
  readonly readable_representation: string;
  readonly machine_representation?: string | null;
  readonly content_digest?: string;
  readonly limitations: readonly string[];
  readonly handling_labels?: readonly string[];
  readonly license_expression?: string | null;
  readonly reuse_restrictions?: readonly string[];
  readonly created_at: string;
  readonly supersedes_source_revision_ref?: string | null;
}

export interface SourceRegistrationDecisionRecord {
  readonly schema_version: '2.3';
  readonly decision_id: string;
  readonly source_revision_ref: string;
  readonly outcome: SourceRegistrationOutcome;
  readonly made_by: RequestedBy;
  readonly automated: boolean;
  readonly policy_profile?: string | null;
  readonly rationale: string;
  readonly evidence_refs: readonly string[];
  readonly consequences: readonly string[];
  readonly created_at: string;
  readonly supersedes_decision_ref?: string | null;
}

export interface AuthorityDocumentRecord {
  readonly schema_version: '2.3';
  readonly document_id: string;
  readonly project_id: string;
  readonly profile: 'split' | 'unified';
  readonly readable_locator: string;
  readonly content_digest: string;
  readonly machine_sidecar_locator?: string | null;
  readonly sections: readonly {
    readonly anchor: string;
    readonly authority_role:
      | 'chat_actual_artifact_history'
      | 'llm_artifact_assertion'
      | 'user_provided_event_history'
      | 'registered_authority_source';
    readonly source_revision_refs: readonly string[];
    readonly description?: string | null;
  }[];
  readonly created_at: string;
}

export interface AuthorityStatusProjection {
  readonly generated_at: string;
  readonly accepted_source_refs: readonly string[];
  readonly accepted_sources: readonly AuthoritySourceRecord[];
  readonly decisions: readonly SourceRegistrationDecisionRecord[];
}

export interface AuthoritySourceInput {
  readonly sourceId?: string;
  readonly sourceType: string;
  readonly issuer: RequestedBy;
  readonly origin: string;
  readonly schemaUri: string;
  readonly schemaVersionDeclared: string;
  readonly subjectScope: PathSelectorRecord;
  readonly factScope: readonly string[];
  readonly effectiveInterval?: {
    readonly start?: string | null;
    readonly end?: string | null;
  } | null;
  readonly readableRepresentation: string;
  readonly machineRepresentation?: string | null;
  readonly contentDigest?: string;
  readonly limitations?: readonly string[];
  readonly handlingLabels?: readonly string[];
  readonly licenseExpression?: string | null;
  readonly reuseRestrictions?: readonly string[];
  readonly supersedesSourceRevisionRef?: string | null;
}

export interface SourceRegistrationDecisionInput {
  readonly sourceRevisionRef: string;
  readonly outcome: SourceRegistrationOutcome;
  readonly madeBy: RequestedBy;
  readonly automated: boolean;
  readonly policyProfile?: string | null;
  readonly rationale: string;
  readonly evidenceRefs?: readonly string[];
  readonly consequences?: readonly string[];
  readonly supersedesDecisionRef?: string | null;
  readonly allowScopeConflict?: boolean;
}

export interface AuthorityDocumentInput {
  readonly profile: 'split' | 'unified';
  readonly readableLocator: string;
  readonly contentDigest: string;
  readonly machineSidecarLocator?: string | null;
  readonly sections: AuthorityDocumentRecord['sections'];
}
