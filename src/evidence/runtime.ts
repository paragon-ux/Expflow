import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { ExpflowError, toExpflowError } from '../core/errors.js';
import { cloneJson } from '../core/json.js';
import { assertSafeRelativePath, normalizeProjectRoot } from '../core/paths.js';
import {
  assertDateTime,
  assertEnum,
  assertExpflowId,
  assertNonEmptyString,
  assertRequestedBy,
  assertRequiredSha256Digest,
  assertStringArray,
  schemaInvalid,
} from '../core/record-validation.js';
import { readProject } from '../material/store.js';
import { createSecurityRuntime } from '../security/runtime.js';
import { createAuthorityRuntime, sourceRef } from '../authority/runtime.js';
import { createSemanticRuntime } from '../semantics/runtime.js';
import { assertionRef, semanticDecisionRef } from '../semantics/runtime.js';
import { ensureEvidenceStore, listEvidenceIntake, writeEvidenceIntake } from './store.js';
import type {
  EvidenceCaptureMethod,
  EvidenceDecisionAction,
  EvidenceDisclosurePolicy,
  EvidenceEncoding,
  EvidenceIntakeInput,
  EvidenceIntakeRecord,
  EvidenceIntakeState,
  EvidenceMediaType,
  EvidenceRelation,
  EvidenceRuntime,
} from './types.js';
import type { SemanticDecisionOutcome } from '../semantics/types.js';

const CAPTURE_METHODS = [
  'file',
  'archive',
  'transcript',
  'manifest',
  'external_reference',
] as const satisfies readonly EvidenceCaptureMethod[];
const MEDIA_TYPES = [
  'text/plain',
  'text/markdown',
  'application/json',
  'application/zip',
  'application/x-tar',
  'external/reference',
] as const satisfies readonly EvidenceMediaType[];
const ENCODINGS = [
  'utf-8',
  'base64',
  'binary',
  'external',
] as const satisfies readonly EvidenceEncoding[];
const DISCLOSURE_POLICIES = [
  'local_only',
  'remote_allowed_with_redaction',
] as const satisfies readonly EvidenceDisclosurePolicy[];
const DECISION_ACTIONS = [
  'accept',
  'reject',
  'split',
  'merge',
  'defer',
  'revoke',
  'supersede',
] as const satisfies readonly EvidenceDecisionAction[];
const RELATIONS = [
  'same',
  'derived',
  'copied',
  'transformed',
  'superseded',
  'unrelated',
] as const satisfies readonly EvidenceRelation[];
const CROCKFORD_NO_ILOU = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function digestBytes(bytes: Buffer): string {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function deterministicIntakeId(digest: string, origin: string): string {
  const bytes = createHash('sha256').update(`${digest}\0${origin}`).digest();
  let suffix = '';
  for (const byte of bytes.subarray(0, 26)) {
    suffix += CROCKFORD_NO_ILOU[byte % CROCKFORD_NO_ILOU.length] ?? '0';
  }
  return `efi_${suffix}`;
}

function contentBytes(input: EvidenceIntakeInput): Buffer {
  if (input.captureMethod === 'external_reference') {
    if (input.externalReference === null || input.externalReference === undefined) {
      throw new ExpflowError(
        'evidence_external_reference_missing',
        'External reference is required.',
        {
          recoverable: true,
        },
      );
    }
    return Buffer.from(input.externalReference, 'utf-8');
  }
  if (input.content === undefined) {
    throw new ExpflowError('evidence_content_missing', 'Evidence content is required.', {
      recoverable: true,
    });
  }
  if (input.encoding === 'base64') {
    return Buffer.from(input.content, 'base64');
  }
  if (input.encoding === 'utf-8') {
    return Buffer.from(input.content, 'utf-8');
  }
  if (input.encoding === 'binary') {
    return Buffer.from(input.content, 'binary');
  }
  throw new ExpflowError(
    'evidence_invalid_encoding',
    'External encoding requires an external reference.',
    {
      recoverable: true,
    },
  );
}

function assertIntakeInput(input: EvidenceIntakeInput): void {
  assertNonEmptyString(input.sourceType, 'sourceType');
  assertNonEmptyString(input.origin, 'origin');
  assertRequestedBy(input.actor, 'actor');
  assertEnum(input.captureMethod, CAPTURE_METHODS, 'captureMethod');
  assertEnum(input.mediaType, MEDIA_TYPES, 'mediaType');
  assertEnum(input.encoding, ENCODINGS, 'encoding');
  assertEnum(input.disclosurePolicy ?? 'local_only', DISCLOSURE_POLICIES, 'disclosurePolicy');
  assertDateTime(input.capturedAt, 'capturedAt');
  if (input.originalLocator !== null && input.originalLocator !== undefined) {
    assertSafeRelativePath(input.originalLocator);
  }
  if (input.captureMethod === 'external_reference') {
    if (input.mediaType !== 'external/reference' || input.encoding !== 'external') {
      throw new ExpflowError(
        'evidence_external_reference_invalid',
        'External references must use external/reference media type and external encoding.',
        { recoverable: true },
      );
    }
    return;
  }
  if (input.encoding === 'external') {
    throw new ExpflowError(
      'evidence_invalid_encoding',
      'External encoding is only valid for external references.',
      { recoverable: true },
    );
  }
  if (
    input.captureMethod === 'archive' &&
    input.mediaType !== 'application/zip' &&
    input.mediaType !== 'application/x-tar'
  ) {
    throw new ExpflowError(
      'evidence_unsupported_media',
      'Archive intake requires archive media type.',
      {
        recoverable: true,
      },
    );
  }
}

function normalizeContent(
  input: EvidenceIntakeInput,
  bytes: Buffer,
): {
  readonly content_digest: string;
  readonly text?: string;
  readonly warnings: readonly string[];
} {
  if (input.mediaType === 'application/zip' || input.mediaType === 'application/x-tar') {
    return {
      content_digest: digestBytes(bytes),
      warnings: [
        'Archive bytes were preserved; entries are represented through quarantine metadata.',
      ],
    };
  }
  if (input.mediaType === 'external/reference') {
    return {
      content_digest: digestBytes(bytes),
      text: input.externalReference ?? '',
      warnings: ['External reference was recorded without dereferencing.'],
    };
  }
  const text = bytes.toString('utf-8').replace(/\r\n/g, '\n');
  const warnings: string[] = [];
  if (input.mediaType === 'application/json') {
    try {
      JSON.parse(text);
    } catch {
      warnings.push(
        'JSON parse failed; original bytes remain preserved and normalized text is partial.',
      );
    }
  }
  return { content_digest: digestBytes(Buffer.from(text, 'utf-8')), text, warnings };
}

function existingByDigest(
  records: readonly EvidenceIntakeRecord[],
  digest: string,
  origin: string,
): { readonly exact?: EvidenceIntakeRecord; readonly duplicate?: EvidenceIntakeRecord } {
  const digestMatches = records.filter((record) => record.digest === digest);
  return {
    duplicate: digestMatches[0],
    exact: digestMatches.find((record) => record.origin === origin),
  };
}

function assertEvidenceRecord(record: EvidenceIntakeRecord): void {
  assertExpflowId(record.intake_id, 'efi', 'intake_id');
  assertExpflowId(record.project_id, 'efp', 'project_id');
  assertNonEmptyString(record.source_type, 'source_type');
  assertEnum(record.capture_method, CAPTURE_METHODS, 'capture_method');
  assertNonEmptyString(record.origin, 'origin');
  assertDateTime(record.captured_at, 'captured_at');
  assertRequestedBy(record.actor, 'actor');
  assertRequiredSha256Digest(record.digest, 'digest');
  assertEnum(record.media_type, MEDIA_TYPES, 'media_type');
  assertEnum(record.encoding, ENCODINGS, 'encoding');
  assertEnum(record.disclosure_policy, DISCLOSURE_POLICIES, 'disclosure_policy');
  assertEnum(
    record.state,
    ['normalized', 'quarantined'] as const satisfies readonly EvidenceIntakeState[],
    'state',
  );
  if (!Number.isInteger(record.byte_length) || record.byte_length < 0) {
    throw schemaInvalid('byte_length must be a non-negative integer.');
  }
  if (record.original_locator !== null && record.original_locator !== undefined) {
    assertSafeRelativePath(record.original_locator);
  }
  if (record.authority_source_ref !== null && record.authority_source_ref !== undefined) {
    assertNonEmptyString(record.authority_source_ref, 'authority_source_ref');
  }
  if (record.duplicate_of !== null && record.duplicate_of !== undefined) {
    assertExpflowId(record.duplicate_of, 'efi', 'duplicate_of');
  }
  assertStringArray(record.audit.evidence_refs, 'audit.evidence_refs');
}

async function authorityProposal(
  projectRoot: string,
  input: EvidenceIntakeInput,
): Promise<string | null> {
  if (input.authoritySource === undefined) {
    return null;
  }
  const authority = createAuthorityRuntime(projectRoot);
  const source = await authority.createSourceRevision({
    ...input.authoritySource,
    issuer: input.actor,
    limitations: input.authoritySource.limitations ?? [
      'Proposed by evidence intake; not authoritative until accepted.',
    ],
    origin: input.origin,
    readableRepresentation:
      input.authoritySource.readableRepresentation ?? input.originalLocator ?? input.origin,
    sourceType: input.sourceType,
  });
  return sourceRef(source);
}

function decisionOutcome(action: EvidenceDecisionAction): SemanticDecisionOutcome {
  switch (action) {
    case 'accept':
      return 'accepted';
    case 'reject':
      return 'rejected';
    case 'defer':
      return 'deferred';
    case 'revoke':
      return 'revoked';
    case 'supersede':
      return 'superseded';
    case 'split':
    case 'merge':
      return 'modified';
  }
}

function withEvidenceError(error: unknown): never {
  throw toExpflowError(error);
}

export function createEvidenceRuntime(root?: string): EvidenceRuntime {
  const defaultRoot = root;
  return {
    async intake(input): Promise<EvidenceIntakeRecord> {
      await Promise.resolve();
      try {
        const projectRoot = normalizeProjectRoot(input.root ?? defaultRoot);
        assertIntakeInput(input);
        const bytes = contentBytes(input);
        const digest = digestBytes(bytes);
        const existing = existingByDigest(listEvidenceIntake(projectRoot), digest, input.origin);
        if (existing.exact !== undefined) {
          return cloneJson(existing.exact);
        }
        const capturedAt = input.capturedAt ?? new Date().toISOString();
        const now = new Date().toISOString();
        const security = createSecurityRuntime();
        const normalized = normalizeContent(input, bytes);
        const duplicateOf = existing.duplicate?.intake_id ?? null;
        let state: EvidenceIntakeState = 'normalized';
        let quarantine: EvidenceIntakeRecord['quarantine'] = null;
        if (input.captureMethod === 'archive') {
          try {
            const report = await security.quarantineArchive({
              entries: input.archiveEntries ?? [],
              root: projectRoot,
            });
            quarantine = {
              quarantine_ref: report.quarantine_id,
              reason: 'Archive accepted into bounded quarantine; contents remain untrusted data.',
              reason_code: 'archive_quarantined',
            };
            state = 'quarantined';
          } catch (error) {
            quarantine = {
              reason: toExpflowError(error).message,
              reason_code: toExpflowError(error).code,
            };
            state = 'quarantined';
          }
        }
        const prepared = await security.prepareSourceContent({
          content: normalized.text ?? input.content ?? input.externalReference ?? '',
          remoteProcessingRequested: input.disclosurePolicy === 'remote_allowed_with_redaction',
          sourceRef: digest,
          policy: {
            remoteProcessing:
              input.disclosurePolicy === 'remote_allowed_with_redaction'
                ? 'remote_allowed_with_redaction'
                : 'local_only',
          },
        });
        const authoritySourceRef =
          state === 'normalized' ? await authorityProposal(projectRoot, input) : null;
        const record: EvidenceIntakeRecord = {
          schema_version: '2.4',
          actor: input.actor,
          audit: {
            action: state,
            evidence_refs: duplicateOf === null ? [] : [duplicateOf],
            rationale:
              state === 'quarantined'
                ? 'Unsafe or archive evidence is quarantined and not authoritative.'
                : 'Evidence normalized as attributed input without authority acceptance.',
          },
          authority_source_ref: authoritySourceRef,
          byte_length: bytes.byteLength,
          capture_method: input.captureMethod,
          captured_at: capturedAt,
          created_at: now,
          digest,
          disclosure_policy: input.disclosurePolicy ?? 'local_only',
          duplicate_of: duplicateOf,
          encoding: input.encoding,
          external_reference: input.externalReference ?? null,
          intake_id: deterministicIntakeId(digest, input.origin),
          media_type: input.mediaType,
          normalized: state === 'normalized' ? normalized : null,
          origin: input.origin,
          original_locator: input.originalLocator ?? null,
          project_id: readProject(projectRoot).project_id,
          quarantine,
          secret_finding_count: prepared.secret_findings.length,
          source_type: input.sourceType,
          state,
          tool: input.tool ?? null,
        };
        assertEvidenceRecord(record);
        ensureEvidenceStore(projectRoot);
        try {
          writeEvidenceIntake(projectRoot, record);
        } catch (error) {
          const raced = existingByDigest(
            listEvidenceIntake(projectRoot),
            digest,
            input.origin,
          ).exact;
          if (raced !== undefined) {
            return cloneJson(raced);
          }
          throw error;
        }
        return cloneJson(record);
      } catch (error) {
        withEvidenceError(error);
      }
    },

    async listIntake(input = {}): Promise<readonly EvidenceIntakeRecord[]> {
      await Promise.resolve();
      try {
        return cloneJson(listEvidenceIntake(normalizeProjectRoot(input.root ?? defaultRoot)));
      } catch (error) {
        withEvidenceError(error);
      }
    },

    async proposeCorrespondence(input): Promise<{
      readonly assertion_ref: string;
      readonly correspondence_ref: string;
    }> {
      await Promise.resolve();
      try {
        if (input.confidence < 0 || input.confidence > 1) {
          throw schemaInvalid('confidence must be between 0 and 1.');
        }
        assertEnum(input.relation, RELATIONS, 'relation');
        const projectRoot = normalizeProjectRoot(input.root ?? defaultRoot);
        const semantics = createSemanticRuntime(projectRoot);
        const assertion = await semantics.recordAssertion({
          assertionType: 'source_correspondence',
          claims: [{ confidence: input.confidence, predicate: 'relation', value: input.relation }],
          inputRefs: input.evidenceRefs ?? [input.intakeRef],
          issuer: { kind: 'policy', name: 'evidence-intake' },
          limitations: [
            'Correspondence is a proposal and does not establish identity or authority.',
          ],
          subjectRefs: [input.intakeRef],
        });
        const correspondence = await semantics.recordSourceCorrespondence({
          candidateEntries: input.candidateEntries,
          evidenceRefs: [assertionRef(assertion), ...(input.evidenceRefs ?? [])],
          proposedSelection: input.proposedSelection ?? null,
          sourceRecordRef: input.intakeRef,
          unresolvedAlternatives: input.candidateEntries.filter(
            (entry) => entry !== input.proposedSelection,
          ),
        });
        return {
          assertion_ref: assertionRef(assertion),
          correspondence_ref: correspondence.correspondence_id,
        };
      } catch (error) {
        withEvidenceError(error);
      }
    },

    async declareConflict(input): Promise<{ readonly conflict_ref: string }> {
      await Promise.resolve();
      try {
        const conflict = await createSemanticRuntime(
          normalizeProjectRoot(input.root ?? defaultRoot),
        ).declareConflict({
          authorityScope: input.authorityScope,
          competingClaimRefs: input.competingClaimRefs,
          notes: input.notes ?? null,
          severity: input.severity,
          subjectRefs: input.subjectRefs,
        });
        return { conflict_ref: conflict.conflict_id };
      } catch (error) {
        withEvidenceError(error);
      }
    },

    async recordDecision(input): Promise<{ readonly decision_ref: string }> {
      await Promise.resolve();
      try {
        assertEnum(input.action, DECISION_ACTIONS, 'action');
        const decision = await createSemanticRuntime(
          normalizeProjectRoot(input.root ?? defaultRoot),
        ).recordSemanticDecision({
          automated: false,
          decisionKind: 'custom',
          evidenceRefs: input.evidenceRefs ?? [],
          madeBy: input.madeBy,
          outcome: decisionOutcome(input.action),
          proposalRefs: input.proposalRefs ?? [],
          rationale: input.rationale,
          subjectRefs: input.subjectRefs,
          supersedesDecisionRef: input.supersedesDecisionRef ?? null,
        });
        return { decision_ref: semanticDecisionRef(decision) };
      } catch (error) {
        withEvidenceError(error);
      }
    },

    async recordArtifactCandidate(input): Promise<{ readonly assertion_ref: string }> {
      await Promise.resolve();
      try {
        const assertion = await createSemanticRuntime(
          normalizeProjectRoot(input.root ?? defaultRoot),
        ).recordAssertion({
          assertionType: 'cluster_proposal',
          claims: [
            { predicate: 'artifact_ref', value: input.artifactRef },
            { predicate: 'path', value: input.path ?? null },
            { predicate: 'version', value: input.version ?? null },
            { confidence: input.confidence ?? 0.5, predicate: 'artifact_candidate', value: true },
          ],
          inputRefs: [input.intakeRef, ...(input.materialRefs ?? [])],
          issuer: { kind: 'policy', name: 'evidence-intake' },
          limitations: ['Artifact candidate extraction does not establish identity.'],
          subjectRefs: [input.artifactRef],
        });
        return { assertion_ref: assertionRef(assertion) };
      } catch (error) {
        withEvidenceError(error);
      }
    },
  };
}
