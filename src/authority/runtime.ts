import { ExpflowError } from '../core/errors.js';
import { createExpflowId } from '../core/ids.js';
import { cloneJson } from '../core/json.js';
import { normalizeProjectRoot } from '../core/paths.js';
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
  return {
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
}

function sourceRegistrationDecision(
  input: SourceRegistrationDecisionInput,
  createdAt: string,
): SourceRegistrationDecisionRecord {
  return {
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
}

function documentRecord(
  projectRoot: string,
  input: AuthorityDocumentInput,
  createdAt: string,
): AuthorityDocumentRecord {
  return {
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
}

function currentAcceptedRefs(decisions: readonly SourceRegistrationDecisionRecord[]): Set<string> {
  const accepted = new Set<string>();
  for (const decision of decisions) {
    if (decision.outcome === 'accepted') {
      accepted.add(decision.source_revision_ref);
    } else if (
      decision.outcome === 'revoked' ||
      decision.outcome === 'rejected' ||
      decision.outcome === 'superseded'
    ) {
      accepted.delete(decision.source_revision_ref);
    }
  }
  return accepted;
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
  source: AuthoritySourceRecord,
  currentSources: readonly AuthoritySourceRecord[],
): void {
  const conflicting = currentSources.find(
    (current) =>
      current.source_id !== source.source_id &&
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
  const source = readAuthoritySourceByRef(projectRoot, sourceRevisionReference);
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
  const acceptedRefs = currentAcceptedRefs(decisions);
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
      writeAuthoritySource(projectRoot, record);
      return cloneJson(record);
    },

    async recordSourceRegistrationDecision(input): Promise<SourceRegistrationDecisionRecord> {
      await Promise.resolve();
      ensureAuthorityStore(projectRoot);
      const source = assertKnownSource(projectRoot, input.sourceRevisionRef);
      if (input.outcome === 'accepted' && input.allowScopeConflict !== true) {
        assertNoAuthorityScopeConflict(source, deriveAuthorityStatus(projectRoot).accepted_sources);
      }
      const record = sourceRegistrationDecision(input, new Date().toISOString());
      writeSourceRegistrationDecision(projectRoot, record);
      return cloneJson(record);
    },

    async recordAuthorityDocument(input): Promise<AuthorityDocumentRecord> {
      await Promise.resolve();
      ensureAuthorityStore(projectRoot);
      if (input.profile === 'split' && input.sections.length !== 1) {
        throw new ExpflowError(
          'schema_invalid',
          'Split authority documents must contain exactly one section.',
        );
      }
      for (const section of input.sections) {
        for (const ref of section.source_revision_refs) {
          assertKnownSource(projectRoot, ref);
        }
      }
      const record = documentRecord(projectRoot, input, new Date().toISOString());
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
