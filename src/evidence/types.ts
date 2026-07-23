import type { RequestedBy } from '../material/types.js';
import type { ArchiveEntryInput } from '../security/types.js';
import type { AuthoritySourceInput } from '../authority/types.js';
import type { SourceCorrespondenceEntry } from '../semantics/types.js';

export type EvidenceCaptureMethod =
  'file' | 'archive' | 'transcript' | 'manifest' | 'external_reference';

export type EvidenceMediaType =
  | 'text/plain'
  | 'text/markdown'
  | 'application/json'
  | 'application/zip'
  | 'application/x-tar'
  | 'external/reference';

export type EvidenceEncoding = 'utf-8' | 'base64' | 'binary' | 'external';
export type EvidenceDisclosurePolicy = 'local_only' | 'remote_allowed_with_redaction';
export type EvidenceIntakeState = 'normalized' | 'quarantined';
export type EvidenceRelation =
  'same' | 'derived' | 'copied' | 'transformed' | 'superseded' | 'unrelated';
export type EvidenceDecisionAction =
  'accept' | 'reject' | 'split' | 'merge' | 'defer' | 'revoke' | 'supersede';

export interface EvidenceNormalizedContent {
  readonly content_digest: string;
  readonly text?: string;
  readonly warnings: readonly string[];
}

export interface EvidenceQuarantine {
  readonly reason_code: string;
  readonly reason: string;
  readonly quarantine_ref?: string | null;
}

export interface EvidenceIntakeRecord {
  readonly schema_version: '2.4';
  readonly intake_id: string;
  readonly project_id: string;
  readonly source_type: string;
  readonly capture_method: EvidenceCaptureMethod;
  readonly origin: string;
  readonly captured_at: string;
  readonly actor: RequestedBy;
  readonly tool?: string | null;
  readonly digest: string;
  readonly media_type: EvidenceMediaType;
  readonly encoding: EvidenceEncoding;
  readonly disclosure_policy: EvidenceDisclosurePolicy;
  readonly byte_length: number;
  readonly state: EvidenceIntakeState;
  readonly original_locator?: string | null;
  readonly external_reference?: string | null;
  readonly duplicate_of?: string | null;
  readonly normalized?: EvidenceNormalizedContent | null;
  readonly quarantine?: EvidenceQuarantine | null;
  readonly authority_source_ref?: string | null;
  readonly secret_finding_count: number;
  readonly audit: {
    readonly action: 'normalized' | 'quarantined';
    readonly rationale: string;
    readonly evidence_refs: readonly string[];
  };
  readonly created_at: string;
}

export interface EvidenceIntakeInput {
  readonly root?: string;
  readonly sourceType: string;
  readonly captureMethod: EvidenceCaptureMethod;
  readonly origin: string;
  readonly capturedAt?: string;
  readonly actor: RequestedBy;
  readonly tool?: string | null;
  readonly mediaType: EvidenceMediaType;
  readonly encoding: EvidenceEncoding;
  readonly disclosurePolicy?: EvidenceDisclosurePolicy;
  readonly content?: string;
  readonly externalReference?: string | null;
  readonly originalLocator?: string | null;
  readonly archiveEntries?: readonly ArchiveEntryInput[];
  readonly authoritySource?: Omit<
    AuthoritySourceInput,
    'sourceType' | 'issuer' | 'origin' | 'readableRepresentation' | 'limitations'
  > & {
    readonly readableRepresentation?: string;
    readonly limitations?: readonly string[];
  };
}

export interface EvidenceCorrespondenceInput {
  readonly root?: string;
  readonly intakeRef: string;
  readonly relation: EvidenceRelation;
  readonly confidence: number;
  readonly candidateEntries: readonly SourceCorrespondenceEntry[];
  readonly proposedSelection?: SourceCorrespondenceEntry | null;
  readonly evidenceRefs?: readonly string[];
}

export interface EvidenceConflictInput {
  readonly root?: string;
  readonly subjectRefs: readonly string[];
  readonly competingClaimRefs: readonly string[];
  readonly authorityScope: string;
  readonly severity: 'informational' | 'review' | 'blocking';
  readonly notes?: string | null;
}

export interface EvidenceDecisionInput {
  readonly root?: string;
  readonly action: EvidenceDecisionAction;
  readonly subjectRefs: readonly string[];
  readonly proposalRefs?: readonly string[];
  readonly madeBy: RequestedBy;
  readonly rationale: string;
  readonly evidenceRefs?: readonly string[];
  readonly supersedesDecisionRef?: string | null;
}

export interface EvidenceArtifactInput {
  readonly root?: string;
  readonly intakeRef: string;
  readonly artifactRef: string;
  readonly path?: string | null;
  readonly version?: string | null;
  readonly materialRefs?: readonly string[];
  readonly confidence?: number;
}

export interface EvidenceRuntime {
  intake(input: EvidenceIntakeInput): Promise<EvidenceIntakeRecord>;
  listIntake(input?: { readonly root?: string }): Promise<readonly EvidenceIntakeRecord[]>;
  proposeCorrespondence(input: EvidenceCorrespondenceInput): Promise<{
    readonly assertion_ref: string;
    readonly correspondence_ref: string;
  }>;
  declareConflict(input: EvidenceConflictInput): Promise<{ readonly conflict_ref: string }>;
  recordDecision(input: EvidenceDecisionInput): Promise<{ readonly decision_ref: string }>;
  recordArtifactCandidate(
    input: EvidenceArtifactInput,
  ): Promise<{ readonly assertion_ref: string }>;
}
