import { ExpflowError } from '../core/errors.js';
import { createExpflowId } from '../core/ids.js';
import { cloneJson } from '../core/json.js';
import { normalizeProjectRoot } from '../core/paths.js';
import {
  assertDateTime,
  assertEnum,
  assertExpflowId,
  assertNonEmptyString,
  assertPathSelectorShape,
  assertRequestedBy,
  assertRequiredSha256Digest,
  assertSha256Digest,
  assertSourceRevisionRef,
  assertStringArray,
  schemaInvalid,
} from '../core/record-validation.js';
import { readProject } from '../material/store.js';
import { defaultPathSelector } from '../material/selectors.js';
import type { PathSelectorRecord } from '../material/types.js';
import {
  ensureAuthorityStore,
  listAuthorityDocuments,
  listSourceRegistrationDecisions,
  nextSourceRevision,
  readAuthoritySourceByRef,
  sourceRevisionRef,
  writeAuthorityDocument,
  writeAuthoritySource,
  writeSourceRegistrationDecision,
} from './store.js';
import type {
  AuthorityDocumentInput,
  AuthorityDocumentRecord,
  AuthoritySourceInput,
  AuthoritySourceRecord,
  AuthorityStatusProjection,
  SourceRegistrationDecisionInput,
  SourceRegistrationDecisionRecord,
} from './types.js';

const SOURCE_REGISTRATION_OUTCOMES = [
  'accepted',
  'rejected',
  'revoked',
  'superseded',
  'deferred',
] as const;
const AUTHORITY_DOCUMENT_PROFILES = ['split', 'unified'] as const;
const AUTHORITY_DOCUMENT_ROLES = [
  'chat_actual_artifact_history',
  'llm_artifact_assertion',
  'user_provided_event_history',
  'registered_authority_source',
] as const;

export interface AuthorityRuntime {
  createSourceRevision(input: AuthoritySourceInput): Promise<AuthoritySourceRecord>;
  recordSourceRegistrationDecision(
    input: SourceRegistrationDecisionInput,
  ): Promise<SourceRegistrationDecisionRecord>;
  recordAuthorityDocument(input: AuthorityDocumentInput): Promise<AuthorityDocumentRecord>;
  listCurrentAuthoritySources(): Promise<AuthorityStatusProjection>;
  listAuthorityDocuments(): Promise<readonly AuthorityDocumentRecord[]>;
}

function sourceRecord(
  projectRoot: string,
  input: AuthoritySourceInput,
  createdAt: string,
): AuthoritySourceRecord {
  const sourceId = input.sourceId ?? createExpflowId('efs');
  assertExpflowId(sourceId, 'efs', 'source_id');
  const record: AuthoritySourceRecord = {
    schema_version: '2.3',
    content_digest: input.contentDigest,
    created_at: createdAt,
    effective_interval: input.effectiveInterval ?? null,
    fact_scope: input.factScope,
    handling_labels: input.handlingLabels ?? [],
    issuer: input.issuer,
    license_expression: input.licenseExpression ?? null,
    limitations: input.limitations ?? [],
    machine_representation: input.machineRepresentation ?? null,
    origin: input.origin,
    readable_representation: input.readableRepresentation,
    reuse_restrictions: input.reuseRestrictions ?? [],
    schema_uri: input.schemaUri,
    schema_version_declared: input.schemaVersionDeclared,
    source_id: sourceId,
    source_revision: nextSourceRevision(projectRoot, sourceId),
    source_type: input.sourceType,
    subject_scope: input.subjectScope,
    supersedes_source_revision_ref: input.supersedesSourceRevisionRef ?? null,
  };
  assertAuthoritySourceRecord(record);
  return record;
}

function sourceRegistrationDecision(
  input: SourceRegistrationDecisionInput,
  createdAt: string,
): SourceRegistrationDecisionRecord {
  const record: SourceRegistrationDecisionRecord = {
    schema_version: '2.3',
    automated: input.automated,
    consequences: input.consequences ?? [],
    created_at: createdAt,
    decision_id: createExpflowId('efrd'),
    evidence_refs: input.evidenceRefs ?? [],
    made_by: input.madeBy,
    outcome: input.outcome,
    policy_profile: input.policyProfile ?? null,
    rationale: input.rationale,
    source_revision_ref: input.sourceRevisionRef,
    supersedes_decision_ref: input.supersedesDecisionRef ?? null,
  };
  assertSourceRegistrationDecisionRecord(record);
  return record;
}

function documentRecord(
  projectRoot: string,
  input: AuthorityDocumentInput,
  createdAt: string,
): AuthorityDocumentRecord {
  const record: AuthorityDocumentRecord = {
    schema_version: '2.3',
    content_digest: input.contentDigest,
    created_at: createdAt,
    document_id: createExpflowId('efad'),
    machine_sidecar_locator: input.machineSidecarLocator ?? null,
    profile: input.profile,
    project_id: readProject(projectRoot).project_id,
    readable_locator: input.readableLocator,
    sections: input.sections,
  };
  assertAuthorityDocumentRecord(record);
  return record;
}

function assertAuthoritySourceRecord(record: AuthoritySourceRecord): void {
  assertExpflowId(record.source_id, 'efs', 'source_id');
  if (!Number.isInteger(record.source_revision) || record.source_revision < 1) {
    throw schemaInvalid('source_revision must be a positive integer.');
  }
  assertNonEmptyString(record.source_type, 'source_type');
  assertRequestedBy(record.issuer, 'issuer');
  assertNonEmptyString(record.origin, 'origin');
  assertNonEmptyString(record.schema_uri, 'schema_uri');
  assertNonEmptyString(record.schema_version_declared, 'schema_version_declared');
  assertPathSelectorShape(record.subject_scope, 'subject_scope');
  assertStringArray(record.fact_scope, 'fact_scope', { minItems: 1 });
  assertNonEmptyString(record.readable_representation, 'readable_representation');
  assertSha256Digest(record.content_digest, 'content_digest');
  assertStringArray(record.limitations, 'limitations');
  assertStringArray(record.handling_labels ?? [], 'handling_labels');
  assertStringArray(record.reuse_restrictions ?? [], 'reuse_restrictions');
  assertDateTime(record.created_at, 'created_at');
  if (record.effective_interval !== null && record.effective_interval !== undefined) {
    assertDateTime(record.effective_interval.start, 'effective_interval.start');
    assertDateTime(record.effective_interval.end, 'effective_interval.end');
    if (
      record.effective_interval.start !== null &&
      record.effective_interval.start !== undefined &&
      record.effective_interval.end !== null &&
      record.effective_interval.end !== undefined &&
      Date.parse(record.effective_interval.start) > Date.parse(record.effective_interval.end)
    ) {
      throw schemaInvalid('effective_interval.start must not be after effective_interval.end.');
    }
  }
  if (
    record.supersedes_source_revision_ref !== null &&
    record.supersedes_source_revision_ref !== undefined
  ) {
    assertSourceRevisionRef(
      record.supersedes_source_revision_ref,
      'supersedes_source_revision_ref',
    );
  }
}

function assertSourceRegistrationDecisionRecord(record: SourceRegistrationDecisionRecord): void {
  assertExpflowId(record.decision_id, 'efrd', 'decision_id');
  assertSourceRevisionRef(record.source_revision_ref, 'source_revision_ref');
  assertEnum(record.outcome, SOURCE_REGISTRATION_OUTCOMES, 'outcome');
  assertRequestedBy(record.made_by, 'made_by');
  assertNonEmptyString(record.rationale, 'rationale');
  assertStringArray(record.evidence_refs, 'evidence_refs');
  assertStringArray(record.consequences, 'consequences');
  assertDateTime(record.created_at, 'created_at');
}

function assertAuthorityDocumentRecord(record: AuthorityDocumentRecord): void {
  assertExpflowId(record.document_id, 'efad', 'document_id');
  assertExpflowId(record.project_id, 'efp', 'project_id');
  assertEnum(record.profile, AUTHORITY_DOCUMENT_PROFILES, 'profile');
  assertNonEmptyString(record.readable_locator, 'readable_locator');
  assertRequiredSha256Digest(record.content_digest, 'content_digest');
  assertDateTime(record.created_at, 'created_at');
  if (record.sections.length === 0) {
    throw schemaInvalid('sections must contain at least one section.');
  }
  if (record.profile === 'split' && record.sections.length !== 1) {
    throw schemaInvalid('Split authority documents must contain exactly one section.');
  }
  for (const section of record.sections) {
    assertNonEmptyString(section.anchor, 'sections.anchor');
    assertEnum(section.authority_role, AUTHORITY_DOCUMENT_ROLES, 'sections.authority_role');
    assertStringArray(section.source_revision_refs, 'sections.source_revision_refs', {
      minItems: 1,
    });
  }
}

function currentAcceptedRefs(
  projectRoot: string,
  decisions: readonly SourceRegistrationDecisionRecord[],
  now: Date,
): Set<string> {
  const accepted = new Set<string>();
  const decisionsById = new Map(decisions.map((decision) => [decision.decision_id, decision]));
  for (const decision of decisions) {
    if (
      decision.supersedes_decision_ref !== null &&
      decision.supersedes_decision_ref !== undefined
    ) {
      const superseded = decisionsById.get(decision.supersedes_decision_ref);
      if (superseded !== undefined) {
        accepted.delete(superseded.source_revision_ref);
      }
    }
    if (decision.outcome === 'accepted') {
      const source = readAuthoritySourceByRef(projectRoot, decision.source_revision_ref);
      if (source !== null) {
        for (const ref of refsSupersededBySource(projectRoot, source)) {
          accepted.delete(ref);
        }
        accepted.add(decision.source_revision_ref);
      }
    } else if (
      decision.outcome === 'revoked' ||
      decision.outcome === 'rejected' ||
      decision.outcome === 'superseded'
    ) {
      accepted.delete(decision.source_revision_ref);
    }
  }
  for (const ref of [...accepted]) {
    const source = readAuthoritySourceByRef(projectRoot, ref);
    if (source === null || !isSourceEffective(source, now)) {
      accepted.delete(ref);
    }
  }
  return accepted;
}

function refsSupersededBySource(projectRoot: string, source: AuthoritySourceRecord): string[] {
  const refs = new Set<string>();
  for (let current: AuthoritySourceRecord | null = source; current !== null;) {
    const supersededRef = current.supersedes_source_revision_ref;
    if (supersededRef === null || supersededRef === undefined) {
      break;
    }
    refs.add(supersededRef);
    current = readAuthoritySourceByRef(projectRoot, supersededRef);
  }
  const sourcePrefix = `${source.source_id}@`;
  for (const candidate of listAcceptedSourceRecords(projectRoot)) {
    const candidateRef = sourceRevisionRef(candidate);
    if (candidateRef.startsWith(sourcePrefix) && candidateRef !== sourceRevisionRef(source)) {
      refs.add(candidateRef);
    }
  }
  return [...refs];
}

function listAcceptedSourceRecords(projectRoot: string): AuthoritySourceRecord[] {
  return listSourceRegistrationDecisions(projectRoot)
    .filter((decision) => decision.outcome === 'accepted')
    .map((decision) => readAuthoritySourceByRef(projectRoot, decision.source_revision_ref))
    .filter((source): source is AuthoritySourceRecord => source !== null);
}

function isSourceEffective(source: AuthoritySourceRecord, now: Date): boolean {
  const interval = source.effective_interval;
  if (interval === null || interval === undefined) {
    return true;
  }
  const nowMs = now.getTime();
  if (
    interval.start !== null &&
    interval.start !== undefined &&
    Date.parse(interval.start) > nowMs
  ) {
    return false;
  }
  if (interval.end !== null && interval.end !== undefined && Date.parse(interval.end) < nowMs) {
    return false;
  }
  return true;
}

function scopesOverlap(left: PathSelectorRecord, right: PathSelectorRecord): boolean {
  const leftRoot = left.root ?? '.';
  const rightRoot = right.root ?? '.';
  return (
    leftRoot === '.' ||
    rightRoot === '.' ||
    leftRoot === rightRoot ||
    leftRoot.startsWith(`${rightRoot}/`) ||
    rightRoot.startsWith(`${leftRoot}/`)
  );
}

function factScopesOverlap(left: readonly string[], right: readonly string[]): boolean {
  const normalizedRight = new Set(right.map((scope) => scope.toLowerCase()));
  return left.some(
    (scope) =>
      scope === '*' || normalizedRight.has('*') || normalizedRight.has(scope.toLowerCase()),
  );
}

function assertNoAuthorityScopeConflict(
  projectRoot: string,
  source: AuthoritySourceRecord,
  currentSources: readonly AuthoritySourceRecord[],
): void {
  const supersededRefs = new Set(refsSupersededBySource(projectRoot, source));
  const conflicting = currentSources.find(
    (current) =>
      current.source_id !== source.source_id &&
      !supersededRefs.has(sourceRevisionRef(current)) &&
      scopesOverlap(current.subject_scope, source.subject_scope) &&
      factScopesOverlap(current.fact_scope, source.fact_scope),
  );
  if (conflicting !== undefined) {
    throw new ExpflowError(
      'authority_scope_conflict',
      `Authority source ${sourceRevisionRef(source)} conflicts with accepted source ${sourceRevisionRef(conflicting)}.`,
    );
  }
}

function assertKnownSource(
  projectRoot: string,
  sourceRevisionReference: string,
): AuthoritySourceRecord {
  let source: AuthoritySourceRecord | null;
  try {
    source = readAuthoritySourceByRef(projectRoot, sourceRevisionReference);
  } catch {
    throw schemaInvalid(`Invalid source revision reference: ${sourceRevisionReference}`);
  }
  if (source === null) {
    throw new ExpflowError(
      'authority_source_unaccepted',
      `Authority source revision is not registered: ${sourceRevisionReference}`,
    );
  }
  return source;
}

function deriveAuthorityStatus(projectRoot: string): AuthorityStatusProjection {
  const decisions = listSourceRegistrationDecisions(projectRoot);
  const acceptedRefs = currentAcceptedRefs(projectRoot, decisions, new Date());
  const acceptedSources = [...acceptedRefs]
    .map((ref) => readAuthoritySourceByRef(projectRoot, ref))
    .filter((source): source is AuthoritySourceRecord => source !== null)
    .sort((left, right) => sourceRevisionRef(left).localeCompare(sourceRevisionRef(right)));
  return {
    accepted_source_refs: acceptedSources.map(sourceRevisionRef),
    accepted_sources: acceptedSources,
    decisions,
    generated_at: new Date().toISOString(),
  };
}

export function createAuthorityRuntime(root?: string): AuthorityRuntime {
  const projectRoot = normalizeProjectRoot(root);
  return {
    async createSourceRevision(input): Promise<AuthoritySourceRecord> {
      await Promise.resolve();
      ensureAuthorityStore(projectRoot);
      const record = sourceRecord(projectRoot, input, new Date().toISOString());
      if (
        record.supersedes_source_revision_ref !== null &&
        record.supersedes_source_revision_ref !== undefined
      ) {
        assertKnownSource(projectRoot, record.supersedes_source_revision_ref);
      }
      writeAuthoritySource(projectRoot, record);
      return cloneJson(record);
    },

    async recordSourceRegistrationDecision(input): Promise<SourceRegistrationDecisionRecord> {
      await Promise.resolve();
      ensureAuthorityStore(projectRoot);
      const source = assertKnownSource(projectRoot, input.sourceRevisionRef);
      if (input.outcome === 'accepted' && input.allowScopeConflict !== true) {
        assertNoAuthorityScopeConflict(
          projectRoot,
          source,
          deriveAuthorityStatus(projectRoot).accepted_sources,
        );
      }
      const record = sourceRegistrationDecision(input, new Date().toISOString());
      writeSourceRegistrationDecision(projectRoot, record);
      return cloneJson(record);
    },

    async recordAuthorityDocument(input): Promise<AuthorityDocumentRecord> {
      await Promise.resolve();
      ensureAuthorityStore(projectRoot);
      const record = documentRecord(projectRoot, input, new Date().toISOString());
      for (const section of input.sections) {
        for (const ref of section.source_revision_refs) {
          assertKnownSource(projectRoot, ref);
        }
      }
      writeAuthorityDocument(projectRoot, record);
      return cloneJson(record);
    },

    async listCurrentAuthoritySources(): Promise<AuthorityStatusProjection> {
      await Promise.resolve();
      ensureAuthorityStore(projectRoot);
      return cloneJson(deriveAuthorityStatus(projectRoot));
    },

    async listAuthorityDocuments(): Promise<readonly AuthorityDocumentRecord[]> {
      await Promise.resolve();
      ensureAuthorityStore(projectRoot);
      return cloneJson(listAuthorityDocuments(projectRoot));
    },
  };
}

export function defaultAuthoritySourceScope(): PathSelectorRecord {
  return defaultPathSelector();
}

export function sourceRef(source: AuthoritySourceRecord): string {
  return sourceRevisionRef(source);
}
