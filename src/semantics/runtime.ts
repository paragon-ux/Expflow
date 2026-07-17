import { ExpflowError } from '../core/errors.js';
import { createExpflowId } from '../core/ids.js';
import { cloneJson } from '../core/json.js';
import { normalizeProjectRoot, assertSafeRelativePath } from '../core/paths.js';
import {
  assertDateTime,
  assertEnum,
  assertExpflowId,
  assertNoAdditionalProperties,
  assertNonEmptyString,
  assertRequestedBy,
  assertSha256Digest,
  assertStringArray,
  schemaInvalid,
} from '../core/record-validation.js';
import { readProject } from '../material/store.js';
import {
  ensureSemanticStore,
  listArtifactClusters,
  listConflicts,
  listReviewRequests,
  listSemanticAssertions,
  listSemanticDecisions,
  listSourceCorrespondence,
  writeArtifactCluster,
  writeConflict,
  writeReviewRequest,
  writeSemanticAssertion,
  writeSemanticDecision,
  writeSourceCorrespondence,
} from './store.js';
import type {
  ArtifactClusterInput,
  ArtifactClusterRecord,
  ConflictInput,
  ConflictRecord,
  GateCChangeRecord,
  ReviewRequestInput,
  ReviewRequestRecord,
  SemanticAssertionInput,
  SemanticAssertionRecord,
  SemanticDecisionInput,
  SemanticDecisionRecord,
  SourceCorrespondenceEntry,
  SourceCorrespondenceInput,
  SourceCorrespondenceRecord,
} from './types.js';

const ASSERTION_TYPES = [
  'role_proposal',
  'cluster_proposal',
  'workflow_boundary',
  'materialization_link',
  'semantic_drift',
  'source_correspondence',
  'completion_declaration',
  'reuse_fit',
  'custom',
] as const;
const DECISION_KINDS = [
  'cluster_membership',
  'source_correspondence',
  'workflow_boundary',
  'workflow_completion',
  'workflow_verification',
  'manifest_acceptance',
  'reuse_eligibility',
  'conflict_resolution',
  'policy_exception',
  'custom',
] as const;
const DECISION_OUTCOMES = [
  'accepted',
  'rejected',
  'modified',
  'deferred',
  'revoked',
  'superseded',
] as const;
const CONFLICT_SEVERITIES = ['informational', 'review', 'blocking'] as const;
const CLUSTER_STATES = [
  'proposed',
  'accepted',
  'ambiguous',
  'conflicted',
  'rejected',
  'superseded',
] as const;

export interface SemanticRuntime {
  recordAssertion(input: SemanticAssertionInput): Promise<SemanticAssertionRecord>;
  recordSemanticDecision(input: SemanticDecisionInput): Promise<SemanticDecisionRecord>;
  declareConflict(input: ConflictInput): Promise<ConflictRecord>;
  requestReview(input: ReviewRequestInput): Promise<ReviewRequestRecord>;
  recordSourceCorrespondence(input: SourceCorrespondenceInput): Promise<SourceCorrespondenceRecord>;
  deriveArtifactCluster(input: ArtifactClusterInput): Promise<ArtifactClusterRecord>;
  listAssertions(): Promise<readonly SemanticAssertionRecord[]>;
  listDecisions(): Promise<readonly SemanticDecisionRecord[]>;
  listConflicts(): Promise<readonly ConflictRecord[]>;
  listReviewRequests(): Promise<readonly ReviewRequestRecord[]>;
  listSourceCorrespondence(): Promise<readonly SourceCorrespondenceRecord[]>;
  listArtifactClusters(): Promise<readonly ArtifactClusterRecord[]>;
  listSemanticChanges(): Promise<readonly GateCChangeRecord[]>;
}

function assertionRecord(
  projectRoot: string,
  input: SemanticAssertionInput,
  createdAt: string,
): SemanticAssertionRecord {
  const record: SemanticAssertionRecord = {
    schema_version: '2.3',
    assertion_id: createExpflowId('efa'),
    assertion_type: input.assertionType,
    claims: input.claims,
    content_digest: input.contentDigest,
    created_at: createdAt,
    input_refs: input.inputRefs ?? [],
    issuer: input.issuer,
    limitations: input.limitations ?? [],
    project_id: readProject(projectRoot).project_id,
    subject_refs: input.subjectRefs,
    tree_revision_id: input.treeRevisionId ?? null,
    workflow_occurrence_id: input.workflowOccurrenceId ?? null,
  };
  assertSemanticAssertion(record);
  return record;
}

function decisionRecord(input: SemanticDecisionInput, createdAt: string): SemanticDecisionRecord {
  const record: SemanticDecisionRecord = {
    schema_version: '2.3',
    automated: input.automated,
    consequences: input.consequences ?? [],
    created_at: createdAt,
    decision_id: createExpflowId('efsd'),
    decision_kind: input.decisionKind,
    evidence_refs: input.evidenceRefs ?? [],
    made_by: input.madeBy,
    modified_value: input.modifiedValue,
    outcome: input.outcome,
    policy_profile: input.policyProfile ?? null,
    proposal_refs: input.proposalRefs ?? [],
    rationale: input.rationale,
    subject_refs: input.subjectRefs,
    supersedes_decision_ref: input.supersedesDecisionRef ?? null,
  };
  assertSemanticDecision(record);
  return record;
}

function conflictRecord(
  projectRoot: string,
  input: ConflictInput,
  declaredAt: string,
): ConflictRecord {
  const record: ConflictRecord = {
    schema_version: '2.3',
    authority_scope: input.authorityScope,
    competing_claim_refs: input.competingClaimRefs,
    conflict_id: createExpflowId('efc'),
    declared_at: declaredAt,
    notes: input.notes ?? null,
    project_id: readProject(projectRoot).project_id,
    review_request_ref: input.reviewRequestRef ?? null,
    severity: input.severity,
    subject_refs: input.subjectRefs,
  };
  assertConflict(record);
  return record;
}

function reviewRequestRecord(
  projectRoot: string,
  input: ReviewRequestInput,
  requestedAt: string,
): ReviewRequestRecord {
  const record: ReviewRequestRecord = {
    schema_version: '2.3',
    blocking: input.blocking,
    project_id: readProject(projectRoot).project_id,
    requested_action: input.requestedAction,
    requested_at: requestedAt,
    requested_by: input.requestedBy,
    resolved_by_decision_ref: input.resolvedByDecisionRef ?? null,
    review_request_id: createExpflowId('efrr'),
    subject_refs: input.subjectRefs,
  };
  assertReviewRequest(record);
  return record;
}

function sourceCorrespondenceRecord(
  projectRoot: string,
  input: SourceCorrespondenceInput,
  createdAt: string,
): SourceCorrespondenceRecord {
  const record: SourceCorrespondenceRecord = {
    schema_version: '2.3',
    candidate_entries: input.candidateEntries,
    correspondence_id: createExpflowId('efsc'),
    created_at: createdAt,
    decision_ref: input.decisionRef ?? null,
    evidence_refs: input.evidenceRefs ?? [],
    project_id: readProject(projectRoot).project_id,
    proposed_selection: input.proposedSelection ?? null,
    source_record_ref: input.sourceRecordRef,
    unresolved_alternatives: input.unresolvedAlternatives ?? [],
  };
  assertSourceCorrespondence(record);
  return record;
}

function artifactClusterRecord(
  projectRoot: string,
  input: ArtifactClusterInput,
  computedAt: string,
): ArtifactClusterRecord {
  const record: ArtifactClusterRecord = {
    schema_version: '2.3',
    cluster_id: createExpflowId('efcl'),
    computed_at: computedAt,
    decision_head: input.decisionHead ?? null,
    decision_refs: input.decisionRefs ?? [],
    derived_state: input.derivedState,
    evidence_refs: input.evidenceRefs ?? [],
    logical_label: input.logicalLabel ?? null,
    member_refs: input.memberRefs,
    project_id: readProject(projectRoot).project_id,
    proposal_refs: input.proposalRefs ?? [],
  };
  assertArtifactCluster(record);
  return record;
}

function assertSemanticAssertion(record: SemanticAssertionRecord): void {
  assertExpflowId(record.assertion_id, 'efa', 'assertion_id');
  assertExpflowId(record.project_id, 'efp', 'project_id');
  assertEnum(record.assertion_type, ASSERTION_TYPES, 'assertion_type');
  assertRequestedBy(record.issuer, 'issuer');
  assertDateTime(record.created_at, 'created_at');
  assertStringArray(record.subject_refs, 'subject_refs', { minItems: 1 });
  assertStringArray(record.input_refs ?? [], 'input_refs');
  assertStringArray(record.limitations, 'limitations');
  assertSha256Digest(record.content_digest, 'content_digest');
  if (record.tree_revision_id !== null && record.tree_revision_id !== undefined) {
    assertExpflowId(record.tree_revision_id, 'eft', 'tree_revision_id');
  }
  if (record.workflow_occurrence_id !== null && record.workflow_occurrence_id !== undefined) {
    assertExpflowId(record.workflow_occurrence_id, 'efw', 'workflow_occurrence_id');
  }
  if (record.claims.length === 0) {
    throw schemaInvalid('claims must contain at least one claim.');
  }
  for (const claim of record.claims) {
    assertNoAdditionalProperties(
      claim,
      ['predicate', 'value', 'confidence', 'explanation'],
      'claims',
    );
    assertNonEmptyString(claim.predicate, 'claims.predicate');
    if (!Object.hasOwn(claim, 'value')) {
      throw schemaInvalid('claims.value is required.');
    }
    if (
      claim.confidence !== null &&
      claim.confidence !== undefined &&
      (claim.confidence < 0 || claim.confidence > 1)
    ) {
      throw schemaInvalid('claims.confidence must be between 0 and 1.');
    }
    if (
      claim.explanation !== null &&
      claim.explanation !== undefined &&
      typeof claim.explanation !== 'string'
    ) {
      throw schemaInvalid('claims.explanation must be a string or null.');
    }
  }
}

function assertSemanticDecision(record: SemanticDecisionRecord): void {
  assertExpflowId(record.decision_id, 'efsd', 'decision_id');
  assertEnum(record.decision_kind, DECISION_KINDS, 'decision_kind');
  assertStringArray(record.subject_refs, 'subject_refs', { minItems: 1 });
  assertStringArray(record.proposal_refs, 'proposal_refs');
  assertEnum(record.outcome, DECISION_OUTCOMES, 'outcome');
  assertRequestedBy(record.made_by, 'made_by');
  assertNonEmptyString(record.rationale, 'rationale');
  assertStringArray(record.evidence_refs, 'evidence_refs');
  assertStringArray(record.consequences, 'consequences');
  assertDateTime(record.created_at, 'created_at');
}

function assertConflict(record: ConflictRecord): void {
  assertExpflowId(record.conflict_id, 'efc', 'conflict_id');
  assertExpflowId(record.project_id, 'efp', 'project_id');
  assertStringArray(record.subject_refs, 'subject_refs', { minItems: 1 });
  assertStringArray(record.competing_claim_refs, 'competing_claim_refs', { minItems: 2 });
  assertNonEmptyString(record.authority_scope, 'authority_scope');
  assertEnum(record.severity, CONFLICT_SEVERITIES, 'severity');
  assertDateTime(record.declared_at, 'declared_at');
}

function assertReviewRequest(record: ReviewRequestRecord): void {
  assertExpflowId(record.review_request_id, 'efrr', 'review_request_id');
  assertExpflowId(record.project_id, 'efp', 'project_id');
  assertStringArray(record.subject_refs, 'subject_refs', { minItems: 1 });
  assertNonEmptyString(record.requested_action, 'requested_action');
  assertDateTime(record.requested_at, 'requested_at');
  if (record.requested_by !== undefined) {
    assertRequestedBy(record.requested_by, 'requested_by');
  }
}

function assertSourceCorrespondence(record: SourceCorrespondenceRecord): void {
  assertExpflowId(record.correspondence_id, 'efsc', 'correspondence_id');
  assertExpflowId(record.project_id, 'efp', 'project_id');
  assertNonEmptyString(record.source_record_ref, 'source_record_ref');
  if (record.candidate_entries.length === 0) {
    throw schemaInvalid('candidate_entries must contain at least one entry.');
  }
  for (const entry of [
    ...record.candidate_entries,
    ...(record.proposed_selection === null || record.proposed_selection === undefined
      ? []
      : [record.proposed_selection]),
    ...(record.unresolved_alternatives ?? []),
  ]) {
    assertSourceCorrespondenceEntry(entry);
  }
  assertStringArray(record.evidence_refs, 'evidence_refs');
  assertDateTime(record.created_at, 'created_at');
}

function assertSourceCorrespondenceEntry(entry: SourceCorrespondenceEntry): void {
  assertExpflowId(entry.tree_revision_id, 'eft', 'candidate_entries.tree_revision_id');
  assertSafeRelativePath(entry.relative_path);
  assertExpflowId(entry.node_id, 'efn', 'candidate_entries.node_id');
  if (!Number.isInteger(entry.node_revision) || entry.node_revision < 1) {
    throw schemaInvalid('candidate_entries.node_revision must be a positive integer.');
  }
}

function assertArtifactCluster(record: ArtifactClusterRecord): void {
  assertExpflowId(record.cluster_id, 'efcl', 'cluster_id');
  assertExpflowId(record.project_id, 'efp', 'project_id');
  assertStringArray(record.proposal_refs, 'proposal_refs');
  assertStringArray(record.member_refs, 'member_refs', { minItems: 1 });
  assertStringArray(record.evidence_refs, 'evidence_refs');
  assertStringArray(record.decision_refs, 'decision_refs');
  assertEnum(record.derived_state, CLUSTER_STATES, 'derived_state');
  assertDateTime(record.computed_at, 'computed_at');
}

function semanticChanges(projectRoot: string): GateCChangeRecord[] {
  return [
    ...listSemanticAssertions(projectRoot).map((record) => ({
      created_at: record.created_at,
      family: 'semantic-assertions',
      record_ref: record.assertion_id,
    })),
    ...listSemanticDecisions(projectRoot).map((record) => ({
      created_at: record.created_at,
      family: 'semantic-decisions',
      record_ref: record.decision_id,
    })),
    ...listConflicts(projectRoot).map((record) => ({
      created_at: record.declared_at,
      family: 'conflicts',
      record_ref: record.conflict_id,
    })),
    ...listReviewRequests(projectRoot).map((record) => ({
      created_at: record.requested_at,
      family: 'review-requests',
      record_ref: record.review_request_id,
    })),
    ...listSourceCorrespondence(projectRoot).map((record) => ({
      created_at: record.created_at,
      family: 'source-correspondence',
      record_ref: record.correspondence_id,
    })),
    ...listArtifactClusters(projectRoot).map((record) => ({
      created_at: record.computed_at,
      family: 'artifact-clusters',
      record_ref: record.cluster_id,
    })),
  ].sort((left, right) => {
    const created = left.created_at.localeCompare(right.created_at);
    return created === 0 ? left.record_ref.localeCompare(right.record_ref) : created;
  });
}

export function createSemanticRuntime(root?: string): SemanticRuntime {
  const projectRoot = normalizeProjectRoot(root);
  return {
    async recordAssertion(input): Promise<SemanticAssertionRecord> {
      await Promise.resolve();
      ensureSemanticStore(projectRoot);
      const record = assertionRecord(projectRoot, input, new Date().toISOString());
      writeSemanticAssertion(projectRoot, record);
      return cloneJson(record);
    },

    async recordSemanticDecision(input): Promise<SemanticDecisionRecord> {
      await Promise.resolve();
      ensureSemanticStore(projectRoot);
      if (
        input.supersedesDecisionRef !== null &&
        input.supersedesDecisionRef !== undefined &&
        !listSemanticDecisions(projectRoot).some(
          (decision) => decision.decision_id === input.supersedesDecisionRef,
        )
      ) {
        throw new ExpflowError(
          'semantic_decision_missing',
          `Superseded decision not found: ${input.supersedesDecisionRef}`,
        );
      }
      const record = decisionRecord(input, new Date().toISOString());
      writeSemanticDecision(projectRoot, record);
      return cloneJson(record);
    },

    async declareConflict(input): Promise<ConflictRecord> {
      await Promise.resolve();
      ensureSemanticStore(projectRoot);
      const record = conflictRecord(projectRoot, input, new Date().toISOString());
      writeConflict(projectRoot, record);
      return cloneJson(record);
    },

    async requestReview(input): Promise<ReviewRequestRecord> {
      await Promise.resolve();
      ensureSemanticStore(projectRoot);
      const record = reviewRequestRecord(projectRoot, input, new Date().toISOString());
      writeReviewRequest(projectRoot, record);
      return cloneJson(record);
    },

    async recordSourceCorrespondence(input): Promise<SourceCorrespondenceRecord> {
      await Promise.resolve();
      ensureSemanticStore(projectRoot);
      const record = sourceCorrespondenceRecord(projectRoot, input, new Date().toISOString());
      writeSourceCorrespondence(projectRoot, record);
      return cloneJson(record);
    },

    async deriveArtifactCluster(input): Promise<ArtifactClusterRecord> {
      await Promise.resolve();
      ensureSemanticStore(projectRoot);
      const record = artifactClusterRecord(projectRoot, input, new Date().toISOString());
      writeArtifactCluster(projectRoot, record);
      return cloneJson(record);
    },

    async listAssertions(): Promise<readonly SemanticAssertionRecord[]> {
      await Promise.resolve();
      ensureSemanticStore(projectRoot);
      return cloneJson(listSemanticAssertions(projectRoot));
    },

    async listDecisions(): Promise<readonly SemanticDecisionRecord[]> {
      await Promise.resolve();
      ensureSemanticStore(projectRoot);
      return cloneJson(listSemanticDecisions(projectRoot));
    },

    async listConflicts(): Promise<readonly ConflictRecord[]> {
      await Promise.resolve();
      ensureSemanticStore(projectRoot);
      return cloneJson(listConflicts(projectRoot));
    },

    async listReviewRequests(): Promise<readonly ReviewRequestRecord[]> {
      await Promise.resolve();
      ensureSemanticStore(projectRoot);
      return cloneJson(listReviewRequests(projectRoot));
    },

    async listSourceCorrespondence(): Promise<readonly SourceCorrespondenceRecord[]> {
      await Promise.resolve();
      ensureSemanticStore(projectRoot);
      return cloneJson(listSourceCorrespondence(projectRoot));
    },

    async listArtifactClusters(): Promise<readonly ArtifactClusterRecord[]> {
      await Promise.resolve();
      ensureSemanticStore(projectRoot);
      return cloneJson(listArtifactClusters(projectRoot));
    },

    async listSemanticChanges(): Promise<readonly GateCChangeRecord[]> {
      await Promise.resolve();
      ensureSemanticStore(projectRoot);
      return cloneJson(semanticChanges(projectRoot));
    },
  };
}

export function assertionRef(record: SemanticAssertionRecord): string {
  return record.assertion_id;
}

export function semanticDecisionRef(record: SemanticDecisionRecord): string {
  return record.decision_id;
}
