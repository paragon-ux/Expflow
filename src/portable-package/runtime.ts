import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { VERSION } from '../core/version.js';
import { ExpflowError, toExpflowError } from '../core/errors.js';
import { canonicalJson, cloneJson, prettyJson, readJsonFile } from '../core/json.js';
import { assertSafeRelativePath, normalizeProjectRoot, toPortablePath } from '../core/paths.js';
import {
  assertEnum,
  assertExpflowId,
  assertNoAdditionalProperties,
  assertNonEmptyString,
  assertDateTime,
  assertPathSelectorShape,
  assertRequestedBy,
  assertRequiredSha256Digest,
  assertSourceRevisionRef,
  assertStringArray,
  schemaInvalid,
} from '../core/record-validation.js';
import {
  listOperationReceipts,
  objectPathForDigest,
  readHead,
  readNodeRevision,
  readProject,
  readTreeRevision,
  storeObjectFromFile,
  storePaths,
  writeNodeRevision,
  writeOperationReceipt,
  writeTreeRevision,
} from '../material/store.js';
import {
  listAuthorityDocuments,
  listAuthoritySources,
  listSourceRegistrationDecisions,
  sourceRevisionRef,
  writeAuthorityDocument,
  writeAuthoritySource,
  writeSourceRegistrationDecision,
} from '../authority/store.js';
import {
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
} from '../semantics/store.js';
import {
  listMaterializationEvents,
  listVirtualArtifacts,
  listWorkflowOccurrences,
  writeMaterializationEvent,
  writeVirtualArtifact,
  writeWorkflowOccurrence,
} from '../workflows/store.js';
import { listEvidenceIntake, writeEvidenceIntake } from '../evidence/store.js';
import type {
  NodeRevisionRecord,
  OperationReceiptRecord,
  TreeRevisionRecord,
} from '../material/types.js';
import type {
  PortableImportEffectRecord,
  PortableImportPlan,
  PortableImportResult,
  PortablePackageManifest,
  PortablePackagePayload,
  PortablePackageRuntime,
  ExportPortablePackageInput,
  ValidatePortablePackageInput,
  PlanPortableImportInput,
  ExecutePortableImportInput,
} from './types.js';
import { PORTABLE_PACKAGE_VERSION } from './types.js';
import type {
  AuthorityDocumentRecord,
  AuthoritySourceRecord,
  SourceRegistrationDecisionRecord,
} from '../authority/types.js';
import type {
  ArtifactClusterRecord,
  ConflictRecord,
  ReviewRequestRecord,
  SemanticAssertionRecord,
  SemanticDecisionRecord,
  SourceCorrespondenceRecord,
} from '../semantics/types.js';
import type {
  MaterializationEventRecord,
  VirtualArtifactRecord,
  WorkflowOccurrenceRecord,
} from '../workflows/types.js';
import type { EvidenceIntakeRecord } from '../evidence/types.js';

type PackageRecord =
  | TreeRevisionRecord
  | NodeRevisionRecord
  | OperationReceiptRecord
  | AuthoritySourceRecord
  | SourceRegistrationDecisionRecord
  | AuthorityDocumentRecord
  | SemanticAssertionRecord
  | SemanticDecisionRecord
  | ConflictRecord
  | ReviewRequestRecord
  | SourceCorrespondenceRecord
  | ArtifactClusterRecord
  | WorkflowOccurrenceRecord
  | VirtualArtifactRecord
  | MaterializationEventRecord
  | EvidenceIntakeRecord;

const EVIDENCE_POLICIES = ['include_normalized', 'external_reference_only'] as const;
const CROCKFORD_NO_ILOU = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function digestBytes(bytes: Buffer | string): string {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function digestToCrockfordSuffix(value: string): string {
  const bytes = createHash('sha256').update(value).digest();
  let suffix = '';
  for (const byte of bytes.subarray(0, 26)) {
    suffix += CROCKFORD_NO_ILOU[byte % CROCKFORD_NO_ILOU.length] ?? '0';
  }
  return suffix;
}

function deterministicPackageId(sourceProjectId: string, workflowOccurrenceId: string): string {
  return `efwp_${digestToCrockfordSuffix(`${sourceProjectId}:${workflowOccurrenceId}`)}`;
}

function writePayload(
  outputDirectory: string,
  kind: PortablePackagePayload['kind'],
  ref: string,
  relativePath: string,
  value: unknown,
): PortablePackagePayload {
  assertSafeRelativePath(relativePath);
  const bytes = prettyJson(value);
  const path = resolve(outputDirectory, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes, 'utf-8');
  return {
    byte_size: Buffer.byteLength(bytes),
    digest: digestBytes(bytes),
    kind,
    path: relativePath,
    ref,
  };
}

function writeObjectPayload(
  projectRoot: string,
  outputDirectory: string,
  digest: string,
): PortablePackagePayload {
  const hash = digest.replace(/^sha256:/, '');
  const relativePath = `objects/sha256/${hash.slice(0, 2)}/${hash}`;
  assertSafeRelativePath(relativePath);
  const targetPath = resolve(outputDirectory, relativePath);
  mkdirSync(dirname(targetPath), { recursive: true });
  copyFileSync(objectPathForDigest(projectRoot, digest), targetPath);
  const bytes = readFileSync(targetPath);
  return {
    byte_size: bytes.byteLength,
    digest: digestBytes(bytes),
    kind: 'object',
    path: relativePath,
    ref: digest,
  };
}

function readPayload(packageDirectory: string, payload: PortablePackagePayload): unknown {
  const path = resolvePackagePath(packageDirectory, payload.path);
  const bytes = readFileSync(path);
  if (digestBytes(bytes) !== payload.digest || bytes.byteLength !== payload.byte_size) {
    throw new ExpflowError(
      'portable_package_integrity_failed',
      `Portable package payload integrity failed: ${payload.path}`,
      { recoverable: true },
    );
  }
  return payload.kind === 'object' ? bytes : JSON.parse(bytes.toString('utf-8'));
}

function resolvePackagePath(packageDirectory: string, relativePath: string): string {
  assertSafeRelativePath(relativePath);
  const root = resolve(packageDirectory);
  const path = resolve(root, relativePath);
  if (relative(root, path).startsWith('..')) {
    throw new ExpflowError('portable_package_unsafe_path', `Unsafe package path: ${relativePath}`, {
      recoverable: true,
    });
  }
  return path;
}

function effectPath(projectRoot: string, absolutePath: string): string {
  const relativePath = toPortablePath(relative(projectRoot, absolutePath));
  if (
    relativePath.length === 0 ||
    relativePath === '.' ||
    relativePath.startsWith('../') ||
    /^[A-Za-z]:/.test(relativePath)
  ) {
    throw new ExpflowError(
      'portable_import_target_outside_project',
      'Import target escapes root.',
      {
        recoverable: true,
      },
    );
  }
  return relativePath;
}

function treeRefs(workflow: WorkflowOccurrenceRecord): string[] {
  return [
    workflow.input_tree_revision_id,
    ...(workflow.output_tree_revision_id === null || workflow.output_tree_revision_id === undefined
      ? []
      : [workflow.output_tree_revision_id]),
  ];
}

function nodeRefsFromTree(tree: TreeRevisionRecord): readonly {
  readonly nodeId: string;
  readonly revision: number;
  readonly digest: string;
}[] {
  return tree.entries
    .filter(
      (entry) =>
        entry.entry_kind === 'file' &&
        entry.node_id !== null &&
        entry.node_id !== undefined &&
        entry.node_revision !== null &&
        entry.node_revision !== undefined &&
        entry.node_content_digest !== null &&
        entry.node_content_digest !== undefined,
    )
    .map((entry) => ({
      digest: entry.node_content_digest ?? '',
      nodeId: entry.node_id ?? '',
      revision: entry.node_revision ?? 0,
    }));
}

function payloadRecordRef(kind: PortablePackagePayload['kind'], record: PackageRecord): string {
  switch (kind) {
    case 'tree_revision':
      return (record as TreeRevisionRecord).tree_revision_id;
    case 'node_revision': {
      const node = record as NodeRevisionRecord;
      return `${node.node_id}@${String(node.revision)}`;
    }
    case 'operation_receipt':
      return (record as OperationReceiptRecord).operation_id;
    case 'authority_source':
      return sourceRevisionRef(record as AuthoritySourceRecord);
    case 'authority_decision':
      return (record as SourceRegistrationDecisionRecord).decision_id;
    case 'authority_document':
      return (record as AuthorityDocumentRecord).document_id;
    case 'semantic_assertion':
      return (record as SemanticAssertionRecord).assertion_id;
    case 'semantic_decision':
      return (record as SemanticDecisionRecord).decision_id;
    case 'semantic_conflict':
      return (record as ConflictRecord).conflict_id;
    case 'semantic_review_request':
      return (record as ReviewRequestRecord).review_request_id;
    case 'source_correspondence':
      return (record as SourceCorrespondenceRecord).correspondence_id;
    case 'artifact_cluster':
      return (record as ArtifactClusterRecord).cluster_id;
    case 'workflow_occurrence':
      return (record as WorkflowOccurrenceRecord).workflow_occurrence_id;
    case 'virtual_artifact':
      return (record as VirtualArtifactRecord).virtual_artifact_id;
    case 'materialization_event':
      return (record as MaterializationEventRecord).materialization_event_id;
    case 'evidence_intake':
      return (record as EvidenceIntakeRecord).intake_id;
    case 'object':
      throw new Error('object payloads do not have records');
  }
}

function recordPath(kind: PortablePackagePayload['kind'], ref: string): string {
  return `records/${kind}/${ref.replace(/[^A-Za-z0-9_.-]/g, '_')}.json`;
}

function matchingExisting(path: string, value: unknown): boolean {
  return (
    existsSync(path) && canonicalJson(readJsonFile(path) as never) === canonicalJson(value as never)
  );
}

function refSetIncludesAny(refs: Iterable<string>, selectedRefs: ReadonlySet<string>): boolean {
  for (const ref of refs) {
    if (selectedRefs.has(ref)) {
      return true;
    }
  }
  return false;
}

function evidenceRefsFromRecords(records: readonly PackageRecord[]): Set<string> {
  const refs = new Set<string>();
  for (const record of records) {
    if ('evidence_refs' in record) {
      for (const ref of record.evidence_refs) {
        if (ref.startsWith('efi_')) {
          refs.add(ref);
        }
      }
    }
    if ('input_refs' in record) {
      for (const ref of record.input_refs ?? []) {
        if (ref.startsWith('efi_')) {
          refs.add(ref);
        }
      }
    }
    if ('audit' in record) {
      for (const ref of record.audit.evidence_refs) {
        if (ref.startsWith('efi_')) {
          refs.add(ref);
        }
      }
    }
  }
  return refs;
}

function assertRecordObject(
  value: unknown,
  field: string,
): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw schemaInvalid(`${field} must be an object.`);
  }
}

function assertVersion(value: Record<string, unknown>, expected: string, field: string): void {
  if (value.schema_version !== expected) {
    throw schemaInvalid(`${field}.schema_version must be ${expected}.`);
  }
}

function assertOptionalExpflowId(
  value: unknown,
  prefix: Parameters<typeof assertExpflowId>[1],
  field: string,
): void {
  if (value !== null && value !== undefined) {
    assertExpflowId(value as string, prefix, field);
  }
}

function assertNonNegativeInteger(value: unknown, field: string): void {
  if (!Number.isInteger(value) || Number(value) < 0) {
    throw schemaInvalid(`${field} must be a non-negative integer.`);
  }
}

function assertProjectRecordFields(record: Record<string, unknown>, field: string): void {
  assertExpflowId(record.project_id as string, 'efp', `${field}.project_id`);
}

function assertPayloadRecord(payload: PortablePackagePayload, record: unknown): PackageRecord {
  assertRecordObject(record, payload.kind);
  switch (payload.kind) {
    case 'tree_revision':
      assertVersion(record, '2.3', payload.kind);
      assertExpflowId(record.tree_revision_id as string, 'eft', 'tree_revision_id');
      assertProjectRecordFields(record, payload.kind);
      assertExpflowId(record.created_by_operation as string, 'efo', 'created_by_operation');
      assertDateTime(record.created_at as string, 'created_at');
      assertRequiredSha256Digest(record.content_digest, 'content_digest');
      if (!Array.isArray(record.entries)) {
        throw schemaInvalid('entries must be an array.');
      }
      break;
    case 'node_revision':
      assertVersion(record, '2.3', payload.kind);
      assertExpflowId(record.node_id as string, 'efn', 'node_id');
      assertNonNegativeInteger(record.revision, 'revision');
      assertRequiredSha256Digest(record.content_digest, 'content_digest');
      assertNonNegativeInteger(record.byte_size, 'byte_size');
      assertDateTime(record.created_at as string, 'created_at');
      break;
    case 'operation_receipt':
      assertVersion(record, '2.3', payload.kind);
      assertExpflowId(record.operation_id as string, 'efo', 'operation_id');
      assertProjectRecordFields(record, payload.kind);
      assertDateTime(record.started_at as string, 'started_at');
      assertDateTime(record.finished_at as string, 'finished_at');
      break;
    case 'authority_source':
      assertVersion(record, '2.3', payload.kind);
      assertExpflowId(record.source_id as string, 'efs', 'source_id');
      assertNonNegativeInteger(record.source_revision, 'source_revision');
      assertRequestedBy(record.issuer, 'issuer');
      assertPathSelectorShape(record.subject_scope, 'subject_scope');
      assertStringArray(record.fact_scope, 'fact_scope');
      assertStringArray(record.limitations, 'limitations');
      assertDateTime(record.created_at as string, 'created_at');
      break;
    case 'authority_decision':
      assertVersion(record, '2.3', payload.kind);
      assertExpflowId(record.decision_id as string, 'efrd', 'decision_id');
      assertSourceRevisionRef(record.source_revision_ref as string, 'source_revision_ref');
      assertRequestedBy(record.made_by, 'made_by');
      assertStringArray(record.evidence_refs, 'evidence_refs');
      assertStringArray(record.consequences, 'consequences');
      assertDateTime(record.created_at as string, 'created_at');
      break;
    case 'authority_document':
      assertVersion(record, '2.3', payload.kind);
      assertExpflowId(record.document_id as string, 'efad', 'document_id');
      assertProjectRecordFields(record, payload.kind);
      assertRequiredSha256Digest(record.content_digest, 'content_digest');
      assertDateTime(record.created_at as string, 'created_at');
      break;
    case 'semantic_assertion':
      assertVersion(record, '2.3', payload.kind);
      assertExpflowId(record.assertion_id as string, 'efa', 'assertion_id');
      assertProjectRecordFields(record, payload.kind);
      assertOptionalExpflowId(record.tree_revision_id, 'eft', 'tree_revision_id');
      assertOptionalExpflowId(record.workflow_occurrence_id, 'efw', 'workflow_occurrence_id');
      assertRequestedBy(record.issuer, 'issuer');
      assertStringArray(record.subject_refs, 'subject_refs');
      assertStringArray(record.input_refs ?? [], 'input_refs');
      assertStringArray(record.limitations, 'limitations');
      assertDateTime(record.created_at as string, 'created_at');
      break;
    case 'semantic_decision':
      assertVersion(record, '2.3', payload.kind);
      assertExpflowId(record.decision_id as string, 'efsd', 'decision_id');
      assertStringArray(record.subject_refs, 'subject_refs');
      assertStringArray(record.proposal_refs, 'proposal_refs');
      assertRequestedBy(record.made_by, 'made_by');
      assertStringArray(record.evidence_refs, 'evidence_refs');
      assertStringArray(record.consequences, 'consequences');
      assertDateTime(record.created_at as string, 'created_at');
      break;
    case 'semantic_conflict':
      assertVersion(record, '2.3', payload.kind);
      assertExpflowId(record.conflict_id as string, 'efc', 'conflict_id');
      assertProjectRecordFields(record, payload.kind);
      assertStringArray(record.subject_refs, 'subject_refs');
      assertStringArray(record.competing_claim_refs, 'competing_claim_refs');
      assertDateTime(record.declared_at as string, 'declared_at');
      break;
    case 'semantic_review_request':
      assertVersion(record, '2.3', payload.kind);
      assertExpflowId(record.review_request_id as string, 'efrr', 'review_request_id');
      assertProjectRecordFields(record, payload.kind);
      assertStringArray(record.subject_refs, 'subject_refs');
      assertDateTime(record.requested_at as string, 'requested_at');
      break;
    case 'source_correspondence':
      assertVersion(record, '2.3', payload.kind);
      assertExpflowId(record.correspondence_id as string, 'efsc', 'correspondence_id');
      assertProjectRecordFields(record, payload.kind);
      assertStringArray(record.evidence_refs, 'evidence_refs');
      assertDateTime(record.created_at as string, 'created_at');
      break;
    case 'artifact_cluster':
      assertVersion(record, '2.3', payload.kind);
      assertExpflowId(record.cluster_id as string, 'efcl', 'cluster_id');
      assertProjectRecordFields(record, payload.kind);
      assertStringArray(record.proposal_refs, 'proposal_refs');
      assertStringArray(record.member_refs, 'member_refs');
      assertStringArray(record.evidence_refs, 'evidence_refs');
      assertStringArray(record.decision_refs, 'decision_refs');
      assertDateTime(record.computed_at as string, 'computed_at');
      break;
    case 'workflow_occurrence':
      assertVersion(record, '2.3', payload.kind);
      assertExpflowId(record.workflow_occurrence_id as string, 'efw', 'workflow_occurrence_id');
      assertProjectRecordFields(record, payload.kind);
      assertExpflowId(record.input_tree_revision_id as string, 'eft', 'input_tree_revision_id');
      assertPathSelectorShape(record.input_path_selector, 'input_path_selector');
      assertOptionalExpflowId(record.output_tree_revision_id, 'eft', 'output_tree_revision_id');
      if (record.output_path_selector !== null && record.output_path_selector !== undefined) {
        assertPathSelectorShape(record.output_path_selector, 'output_path_selector');
      }
      assertExpflowId(record.start_operation_id as string, 'efo', 'start_operation_id');
      assertOptionalExpflowId(record.completion_operation_id, 'efo', 'completion_operation_id');
      assertStringArray(record.authority_source_revision_refs, 'authority_source_revision_refs');
      assertStringArray(record.authority_document_refs ?? [], 'authority_document_refs');
      assertStringArray(record.virtual_artifact_refs ?? [], 'virtual_artifact_refs');
      assertDateTime(record.created_at as string, 'created_at');
      break;
    case 'virtual_artifact':
      assertVersion(record, '2.3', payload.kind);
      assertExpflowId(record.virtual_artifact_id as string, 'efva', 'virtual_artifact_id');
      assertProjectRecordFields(record, payload.kind);
      assertExpflowId(record.workflow_occurrence_id as string, 'efw', 'workflow_occurrence_id');
      assertStringArray(record.parent_refs ?? [], 'parent_refs');
      assertStringArray(record.materialization_event_refs ?? [], 'materialization_event_refs');
      assertDateTime(record.created_at as string, 'created_at');
      break;
    case 'materialization_event':
      assertVersion(record, '2.3', payload.kind);
      assertExpflowId(
        record.materialization_event_id as string,
        'efme',
        'materialization_event_id',
      );
      assertProjectRecordFields(record, payload.kind);
      assertExpflowId(record.virtual_artifact_id as string, 'efva', 'virtual_artifact_id');
      assertRequestedBy(record.asserted_by, 'asserted_by');
      assertStringArray(record.authority_source_refs ?? [], 'authority_source_refs');
      assertDateTime(record.occurred_at as string, 'occurred_at');
      break;
    case 'evidence_intake':
      assertVersion(record, '2.4', payload.kind);
      assertExpflowId(record.intake_id as string, 'efi', 'intake_id');
      assertProjectRecordFields(record, payload.kind);
      assertRequestedBy(record.actor, 'actor');
      assertRequiredSha256Digest(record.digest, 'digest');
      assertNonNegativeInteger(record.byte_length, 'byte_length');
      assertRecordObject(record.audit, 'audit');
      assertStringArray(record.audit.evidence_refs, 'audit.evidence_refs');
      assertDateTime(record.captured_at as string, 'captured_at');
      assertDateTime(record.created_at as string, 'created_at');
      break;
    case 'object':
      throw schemaInvalid('object payloads do not contain JSON records.');
  }
  const typedRecord = record as unknown as PackageRecord;
  const actualRef = payloadRecordRef(payload.kind, typedRecord);
  if (actualRef !== payload.ref) {
    throw schemaInvalid(`${payload.kind} payload ref does not match record identity.`);
  }
  assertNonEmptyString(payload.ref, `${payload.kind}.ref`);
  return typedRecord;
}

function payloadTargetPath(
  projectRoot: string,
  payload: PortablePackagePayload,
  record: unknown,
): string {
  const paths = storePaths(projectRoot);
  switch (payload.kind) {
    case 'object':
      return objectPathForDigest(projectRoot, payload.ref);
    case 'tree_revision':
      return resolve(paths.treeRevisions, `${payload.ref}.json`);
    case 'node_revision': {
      const node = record as NodeRevisionRecord;
      return resolve(paths.nodeRevisions, node.node_id, `${String(node.revision)}.json`);
    }
    case 'operation_receipt':
      return resolve(paths.receipts, `${payload.ref}.json`);
    case 'authority_source': {
      const source = record as AuthoritySourceRecord;
      return resolve(
        paths.stateDir,
        'records',
        'authority-sources',
        source.source_id,
        `${String(source.source_revision)}.json`,
      );
    }
    case 'authority_decision':
      return resolve(
        paths.stateDir,
        'records',
        'source-registration-decisions',
        `${payload.ref}.json`,
      );
    case 'authority_document':
      return resolve(paths.stateDir, 'records', 'authority-documents', `${payload.ref}.json`);
    case 'semantic_assertion':
      return resolve(paths.stateDir, 'records', 'semantic-assertions', `${payload.ref}.json`);
    case 'semantic_decision':
      return resolve(paths.stateDir, 'records', 'semantic-decisions', `${payload.ref}.json`);
    case 'semantic_conflict':
      return resolve(paths.stateDir, 'records', 'conflicts', `${payload.ref}.json`);
    case 'semantic_review_request':
      return resolve(paths.stateDir, 'records', 'review-requests', `${payload.ref}.json`);
    case 'source_correspondence':
      return resolve(paths.stateDir, 'records', 'source-correspondence', `${payload.ref}.json`);
    case 'artifact_cluster':
      return resolve(paths.stateDir, 'records', 'artifact-clusters', `${payload.ref}.json`);
    case 'workflow_occurrence':
      return resolve(paths.stateDir, 'records', 'workflow-occurrences', `${payload.ref}.json`);
    case 'virtual_artifact':
      return resolve(paths.stateDir, 'records', 'virtual-artifacts', `${payload.ref}.json`);
    case 'materialization_event':
      return resolve(paths.stateDir, 'records', 'materialization-events', `${payload.ref}.json`);
    case 'evidence_intake':
      return resolve(paths.stateDir, 'records', 'evidence-intake', `${payload.ref}.json`);
  }
}

function writeRecord(projectRoot: string, payload: PortablePackagePayload, record: unknown): void {
  switch (payload.kind) {
    case 'object':
      throw new Error('Object payloads are imported from package bytes directly.');
    case 'tree_revision':
      writeTreeRevision(projectRoot, record as TreeRevisionRecord);
      return;
    case 'node_revision':
      writeNodeRevision(projectRoot, record as NodeRevisionRecord);
      return;
    case 'operation_receipt':
      writeOperationReceipt(projectRoot, record as OperationReceiptRecord);
      return;
    case 'authority_source':
      writeAuthoritySource(projectRoot, record as AuthoritySourceRecord);
      return;
    case 'authority_decision':
      writeSourceRegistrationDecision(projectRoot, record as SourceRegistrationDecisionRecord);
      return;
    case 'authority_document':
      writeAuthorityDocument(projectRoot, record as AuthorityDocumentRecord);
      return;
    case 'semantic_assertion':
      writeSemanticAssertion(projectRoot, record as SemanticAssertionRecord);
      return;
    case 'semantic_decision':
      writeSemanticDecision(projectRoot, record as SemanticDecisionRecord);
      return;
    case 'semantic_conflict':
      writeConflict(projectRoot, record as ConflictRecord);
      return;
    case 'semantic_review_request':
      writeReviewRequest(projectRoot, record as ReviewRequestRecord);
      return;
    case 'source_correspondence':
      writeSourceCorrespondence(projectRoot, record as SourceCorrespondenceRecord);
      return;
    case 'artifact_cluster':
      writeArtifactCluster(projectRoot, record as ArtifactClusterRecord);
      return;
    case 'workflow_occurrence':
      writeWorkflowOccurrence(projectRoot, record as WorkflowOccurrenceRecord);
      return;
    case 'virtual_artifact':
      writeVirtualArtifact(projectRoot, record as VirtualArtifactRecord);
      return;
    case 'materialization_event':
      writeMaterializationEvent(projectRoot, record as MaterializationEventRecord);
      return;
    case 'evidence_intake':
      writeEvidenceIntake(projectRoot, record as EvidenceIntakeRecord);
      return;
  }
}

function validateManifestShape(manifest: PortablePackageManifest): void {
  assertNoAdditionalProperties(
    manifest,
    [
      'schema_version',
      'package_format_version',
      'package_id',
      'producer',
      'source_project_id',
      'selected_workflow_occurrence_id',
      'selected_tree_revision_ids',
      'selected_material_head',
      'evidence_policy',
      'created_at',
      'created_by',
      'payloads',
      'external_references',
      'warnings',
      'readiness',
    ],
    'manifest',
  );
  const schemaVersion: string = manifest.schema_version;
  const packageFormatVersion: string = manifest.package_format_version;
  if (schemaVersion !== '2.5') {
    throw schemaInvalid('manifest.schema_version must be 2.5.');
  }
  if (packageFormatVersion !== PORTABLE_PACKAGE_VERSION) {
    throw new ExpflowError(
      'portable_package_version_unsupported',
      `Unsupported portable package version: ${packageFormatVersion}`,
      { recoverable: true },
    );
  }
  assertExpflowId(manifest.package_id, 'efwp', 'package_id');
  assertExpflowId(manifest.source_project_id, 'efp', 'source_project_id');
  assertExpflowId(
    manifest.selected_workflow_occurrence_id,
    'efw',
    'selected_workflow_occurrence_id',
  );
  assertEnum(manifest.evidence_policy, EVIDENCE_POLICIES, 'evidence_policy');
  assertRequestedBy(manifest.created_by, 'created_by');
  assertStringArray(manifest.selected_tree_revision_ids, 'selected_tree_revision_ids', {
    minItems: 1,
  });
  const producerRecord = manifest.producer as Record<string, unknown>;
  assertNoAdditionalProperties(producerRecord, ['name', 'package_version'], 'manifest.producer');
  if (
    producerRecord.name !== 'expflow' ||
    typeof producerRecord.package_version !== 'string' ||
    producerRecord.package_version.length === 0
  ) {
    throw schemaInvalid('manifest.producer is invalid.');
  }
  if (manifest.selected_material_head !== null) {
    assertExpflowId(manifest.selected_material_head, 'eft', 'selected_material_head');
  }
  if (typeof manifest.created_at !== 'string' || Number.isNaN(Date.parse(manifest.created_at))) {
    throw schemaInvalid('manifest.created_at must be a date-time string.');
  }
  if (!Array.isArray(manifest.payloads)) {
    throw schemaInvalid('manifest.payloads must be an array.');
  }
  for (const [index, payload] of manifest.payloads.entries()) {
    const payloadRecord = payload as Record<string, unknown>;
    assertNoAdditionalProperties(
      payloadRecord,
      ['kind', 'ref', 'path', 'digest', 'byte_size'],
      `manifest.payloads[${String(index)}]`,
    );
    if (typeof payloadRecord.kind !== 'string') {
      throw schemaInvalid(`manifest.payloads[${String(index)}].kind must be a string.`);
    }
    assertEnum(
      payloadRecord.kind,
      [
        'object',
        'tree_revision',
        'node_revision',
        'operation_receipt',
        'authority_source',
        'authority_decision',
        'authority_document',
        'semantic_assertion',
        'semantic_decision',
        'semantic_conflict',
        'semantic_review_request',
        'source_correspondence',
        'artifact_cluster',
        'workflow_occurrence',
        'virtual_artifact',
        'materialization_event',
        'evidence_intake',
      ],
      `manifest.payloads[${String(index)}].kind`,
    );
    if (typeof payloadRecord.ref !== 'string' || payloadRecord.ref.length === 0) {
      throw schemaInvalid(`manifest.payloads[${String(index)}].ref must be a non-empty string.`);
    }
    if (typeof payloadRecord.path !== 'string') {
      throw schemaInvalid(`manifest.payloads[${String(index)}].path must be a string.`);
    }
    assertSafeRelativePath(payloadRecord.path);
    assertRequiredSha256Digest(payloadRecord.digest, `manifest.payloads[${String(index)}].digest`);
    if (!Number.isInteger(payloadRecord.byte_size) || Number(payloadRecord.byte_size) < 0) {
      throw schemaInvalid(`manifest.payloads[${String(index)}].byte_size must be non-negative.`);
    }
  }
  if (!Array.isArray(manifest.external_references)) {
    throw schemaInvalid('manifest.external_references must be an array.');
  }
  for (const [index, external] of manifest.external_references.entries()) {
    assertNoAdditionalProperties(
      external,
      ['ref', 'locator', 'reason'],
      `manifest.external_references[${String(index)}]`,
    );
    for (const field of ['ref', 'locator', 'reason'] as const) {
      if (typeof external[field] !== 'string' || external[field].length === 0) {
        throw schemaInvalid(
          `manifest.external_references[${String(index)}].${field} must be a non-empty string.`,
        );
      }
    }
  }
  assertStringArray(manifest.warnings, 'manifest.warnings');
  assertNoAdditionalProperties(
    manifest.readiness,
    ['status', 'unresolved_dependency_refs'],
    'manifest.readiness',
  );
  assertEnum(
    manifest.readiness.status,
    ['ready', 'blocked', 'partial'],
    'manifest.readiness.status',
  );
  assertStringArray(
    manifest.readiness.unresolved_dependency_refs,
    'manifest.readiness.unresolved_dependency_refs',
  );
}

function withPackageError(error: unknown): never {
  throw toExpflowError(error);
}

export function createPortablePackageRuntime(root?: string): PortablePackageRuntime {
  const defaultRoot = root;
  return {
    async exportPackage(input: ExportPortablePackageInput): Promise<PortablePackageManifest> {
      await Promise.resolve();
      try {
        const projectRoot = normalizeProjectRoot(input.root ?? defaultRoot);
        const project = readProject(projectRoot);
        const workflow = listWorkflowOccurrences(projectRoot).find(
          (record) => record.workflow_occurrence_id === input.workflowOccurrenceId,
        );
        if (workflow === undefined) {
          throw new ExpflowError(
            'portable_workflow_missing',
            `Workflow occurrence not found: ${input.workflowOccurrenceId}`,
            { recoverable: true },
          );
        }
        assertRequestedBy(input.requestedBy, 'requestedBy');
        const outputDirectory = resolve(input.outputDirectory);
        rmSync(outputDirectory, { recursive: true, force: true });
        mkdirSync(outputDirectory, { recursive: true });
        const payloads: PortablePackagePayload[] = [];
        const externalReferences: {
          readonly ref: string;
          readonly locator: string;
          readonly reason: string;
        }[] = [];
        const selectedTreeIds = treeRefs(workflow);
        for (const treeId of selectedTreeIds) {
          const tree = readTreeRevision(projectRoot, treeId);
          payloads.push(
            writePayload(
              outputDirectory,
              'tree_revision',
              treeId,
              recordPath('tree_revision', treeId),
              tree,
            ),
          );
          for (const nodeRef of nodeRefsFromTree(tree)) {
            const node = readNodeRevision(projectRoot, nodeRef.nodeId, nodeRef.revision);
            payloads.push(
              writePayload(
                outputDirectory,
                'node_revision',
                `${node.node_id}@${String(node.revision)}`,
                recordPath('node_revision', `${node.node_id}@${String(node.revision)}`),
                node,
              ),
            );
            payloads.push(writeObjectPayload(projectRoot, outputDirectory, nodeRef.digest));
          }
        }
        for (const receipt of listOperationReceipts(projectRoot).filter(
          (record) =>
            record.workflow_occurrence_refs?.includes(workflow.workflow_occurrence_id) ||
            record.operation_id === workflow.start_operation_id ||
            record.operation_id === workflow.completion_operation_id,
        )) {
          payloads.push(
            writePayload(
              outputDirectory,
              'operation_receipt',
              receipt.operation_id,
              recordPath('operation_receipt', receipt.operation_id),
              receipt,
            ),
          );
        }
        const selectedRefs = new Set<string>([
          workflow.workflow_occurrence_id,
          ...selectedTreeIds,
          workflow.start_operation_id,
          ...(workflow.completion_operation_id === null ||
          workflow.completion_operation_id === undefined
            ? []
            : [workflow.completion_operation_id]),
          ...workflow.authority_source_revision_refs,
          ...(workflow.authority_document_refs ?? []),
          ...(workflow.virtual_artifact_refs ?? []),
        ]);
        const authoritySourceRefs = new Set(workflow.authority_source_revision_refs);
        const authorityDocumentRefs = new Set(workflow.authority_document_refs ?? []);
        const selectedAssertions = listSemanticAssertions(projectRoot).filter(
          (record) =>
            record.workflow_occurrence_id === workflow.workflow_occurrence_id ||
            refSetIncludesAny(record.subject_refs, selectedRefs) ||
            refSetIncludesAny(record.input_refs ?? [], selectedRefs),
        );
        for (const assertion of selectedAssertions) {
          selectedRefs.add(assertion.assertion_id);
        }
        const selectedDecisions = listSemanticDecisions(projectRoot).filter(
          (record) =>
            refSetIncludesAny(record.subject_refs, selectedRefs) ||
            refSetIncludesAny(record.proposal_refs, selectedRefs),
        );
        for (const decision of selectedDecisions) {
          selectedRefs.add(decision.decision_id);
        }
        const selectedConflicts = listConflicts(projectRoot).filter(
          (record) =>
            refSetIncludesAny(record.subject_refs, selectedRefs) ||
            refSetIncludesAny(record.competing_claim_refs, selectedRefs),
        );
        for (const conflict of selectedConflicts) {
          selectedRefs.add(conflict.conflict_id);
        }
        const selectedReviewRequests = listReviewRequests(projectRoot).filter(
          (record) =>
            refSetIncludesAny(record.subject_refs, selectedRefs) ||
            selectedRefs.has(record.resolved_by_decision_ref ?? ''),
        );
        for (const request of selectedReviewRequests) {
          selectedRefs.add(request.review_request_id);
        }
        const selectedCorrespondence = listSourceCorrespondence(projectRoot).filter(
          (record) =>
            selectedRefs.has(record.source_record_ref) ||
            selectedRefs.has(record.decision_ref ?? '') ||
            refSetIncludesAny(record.evidence_refs, selectedRefs),
        );
        for (const correspondence of selectedCorrespondence) {
          selectedRefs.add(correspondence.correspondence_id);
        }
        const selectedClusters = listArtifactClusters(projectRoot).filter(
          (record) =>
            refSetIncludesAny(record.proposal_refs, selectedRefs) ||
            refSetIncludesAny(record.member_refs, selectedRefs) ||
            refSetIncludesAny(record.decision_refs, selectedRefs),
        );
        for (const cluster of selectedClusters) {
          selectedRefs.add(cluster.cluster_id);
        }
        const selectedVirtualArtifacts = listVirtualArtifacts(projectRoot).filter(
          (record) =>
            record.workflow_occurrence_id === workflow.workflow_occurrence_id ||
            selectedRefs.has(record.virtual_artifact_id),
        );
        for (const artifact of selectedVirtualArtifacts) {
          selectedRefs.add(artifact.virtual_artifact_id);
        }
        const selectedMaterializationEvents = listMaterializationEvents(projectRoot).filter(
          (record) => selectedRefs.has(record.virtual_artifact_id),
        );
        for (const event of selectedMaterializationEvents) {
          selectedRefs.add(event.materialization_event_id);
        }
        const evidenceRefs = evidenceRefsFromRecords([
          ...selectedAssertions,
          ...selectedDecisions,
          ...selectedCorrespondence,
          ...selectedClusters,
        ]);
        const allEvidence = listEvidenceIntake(projectRoot);
        const selectedEvidence: EvidenceIntakeRecord[] = [];
        const pendingEvidenceRefs = [...evidenceRefs];
        while (pendingEvidenceRefs.length > 0) {
          const ref = pendingEvidenceRefs.shift() ?? '';
          if (selectedRefs.has(ref)) {
            continue;
          }
          const evidence = allEvidence.find((record) => record.intake_id === ref);
          if (evidence === undefined) {
            continue;
          }
          selectedRefs.add(ref);
          selectedEvidence.push(evidence);
          for (const nestedRef of evidence.audit.evidence_refs) {
            if (nestedRef.startsWith('efi_')) {
              pendingEvidenceRefs.push(nestedRef);
            }
          }
        }
        const selectedAuthorityDecisions = listSourceRegistrationDecisions(projectRoot).filter(
          (record) =>
            authoritySourceRefs.has(record.source_revision_ref) ||
            refSetIncludesAny(record.evidence_refs, selectedRefs),
        );
        for (const decision of selectedAuthorityDecisions) {
          selectedRefs.add(decision.decision_id);
        }
        const recordGroups: readonly [PortablePackagePayload['kind'], readonly PackageRecord[]][] =
          [
            [
              'authority_source',
              listAuthoritySources(projectRoot).filter((record) =>
                authoritySourceRefs.has(sourceRevisionRef(record)),
              ),
            ],
            ['authority_decision', selectedAuthorityDecisions],
            [
              'authority_document',
              listAuthorityDocuments(projectRoot).filter((record) =>
                authorityDocumentRefs.has(record.document_id),
              ),
            ],
            ['semantic_assertion', selectedAssertions],
            ['semantic_decision', selectedDecisions],
            ['semantic_conflict', selectedConflicts],
            ['semantic_review_request', selectedReviewRequests],
            ['source_correspondence', selectedCorrespondence],
            ['artifact_cluster', selectedClusters],
            ['workflow_occurrence', [workflow]],
            ['virtual_artifact', selectedVirtualArtifacts],
            ['materialization_event', selectedMaterializationEvents],
            ['evidence_intake', selectedEvidence],
          ];
        for (const [kind, records] of recordGroups) {
          for (const record of records) {
            const ref = payloadRecordRef(kind, record);
            payloads.push(writePayload(outputDirectory, kind, ref, recordPath(kind, ref), record));
          }
        }
        for (const record of selectedEvidence) {
          if (record.external_reference !== null && record.external_reference !== undefined) {
            externalReferences.push({
              locator: record.external_reference,
              reason: 'Evidence was recorded as an external reference and was not dereferenced.',
              ref: record.intake_id,
            });
          }
        }
        const uniquePayloads = [
          ...new Map(payloads.map((payload) => [payload.path, payload])).values(),
        ].sort((left, right) => left.path.localeCompare(right.path));
        const manifest: PortablePackageManifest = {
          schema_version: '2.5',
          created_at: workflow.created_at,
          created_by: input.requestedBy,
          evidence_policy: input.evidencePolicy ?? 'include_normalized',
          external_references: [...externalReferences].sort((left, right) =>
            left.ref.localeCompare(right.ref),
          ),
          package_format_version: PORTABLE_PACKAGE_VERSION,
          package_id: deterministicPackageId(project.project_id, workflow.workflow_occurrence_id),
          payloads: uniquePayloads,
          producer: { name: 'expflow', package_version: VERSION },
          readiness: {
            status:
              workflow.output_tree_revision_id === null ||
              workflow.output_tree_revision_id === undefined
                ? 'partial'
                : 'ready',
            unresolved_dependency_refs: externalReferences.map((record) => record.ref),
          },
          selected_material_head: readHead(projectRoot),
          selected_tree_revision_ids: selectedTreeIds,
          selected_workflow_occurrence_id: workflow.workflow_occurrence_id,
          source_project_id: project.project_id,
          warnings:
            externalReferences.length === 0
              ? []
              : ['External evidence references are declared but not included.'],
        };
        validateManifestShape(manifest);
        writeFileSync(resolve(outputDirectory, 'manifest.json'), prettyJson(manifest), 'utf-8');
        return cloneJson(manifest);
      } catch (error) {
        withPackageError(error);
      }
    },

    async validatePackage(input: ValidatePortablePackageInput): Promise<PortablePackageManifest> {
      await Promise.resolve();
      try {
        const manifest = readJsonFile(
          resolve(input.packageDirectory, 'manifest.json'),
        ) as PortablePackageManifest;
        validateManifestShape(manifest);
        const seenPaths = new Set<string>();
        for (const payload of manifest.payloads) {
          if (seenPaths.has(payload.path)) {
            throw new ExpflowError(
              'portable_package_duplicate_path',
              `Duplicate package path: ${payload.path}`,
              { recoverable: true },
            );
          }
          seenPaths.add(payload.path);
          const record = readPayload(input.packageDirectory, payload);
          if (payload.kind !== 'object') {
            assertPayloadRecord(payload, record);
          } else {
            assertRequiredSha256Digest(payload.ref, 'object.ref');
          }
        }
        return cloneJson(manifest);
      } catch (error) {
        withPackageError(error);
      }
    },

    async planImport(input: PlanPortableImportInput): Promise<PortableImportPlan> {
      await Promise.resolve();
      try {
        const projectRoot = normalizeProjectRoot(input.root ?? defaultRoot);
        const project = readProject(projectRoot);
        const manifest = await this.validatePackage({ packageDirectory: input.packageDirectory });
        const effects: PortableImportEffectRecord[] = [];
        for (const external of manifest.external_references) {
          effects.push({
            effect: 'missing_external',
            kind: 'external_reference',
            reason: external.reason,
            ref: external.ref,
          });
        }
        for (const payload of manifest.payloads) {
          const record =
            payload.kind === 'object' ? null : readPayload(input.packageDirectory, payload);
          const target =
            payload.kind === 'object'
              ? objectPathForDigest(projectRoot, payload.ref)
              : payloadTargetPath(projectRoot, payload, record);
          if (!existsSync(target)) {
            effects.push({
              effect: 'create',
              kind: payload.kind,
              path: effectPath(projectRoot, target),
              ref: payload.ref,
            });
            continue;
          }
          if (payload.kind === 'object') {
            const bytes = readFileSync(target);
            effects.push({
              effect: digestBytes(bytes) === payload.digest ? 'exists_same' : 'collision',
              kind: payload.kind,
              path: effectPath(projectRoot, target),
              ref: payload.ref,
            });
            continue;
          }
          effects.push({
            effect: matchingExisting(target, record) ? 'exists_same' : 'collision',
            kind: payload.kind,
            path: effectPath(projectRoot, target),
            ref: payload.ref,
          });
        }
        const blocking = effects.some(
          (effect) => effect.effect === 'collision' || effect.effect === 'missing_external',
        );
        return {
          blocking,
          effects,
          package_format_version: manifest.package_format_version,
          package_id: manifest.package_id,
          selected_workflow_occurrence_id: manifest.selected_workflow_occurrence_id,
          source_project_id: manifest.source_project_id,
          target_project_id: project.project_id,
          resume: {
            can_resume_materialization: !blocking,
            can_resume_reuse: !blocking && manifest.readiness.status === 'ready',
            can_resume_verification: !blocking && manifest.readiness.status === 'ready',
            state: blocking ? 'blocked' : manifest.readiness.status,
            unresolved_dependency_refs: manifest.readiness.unresolved_dependency_refs,
            workflow_occurrence_id: manifest.selected_workflow_occurrence_id,
          },
        };
      } catch (error) {
        withPackageError(error);
      }
    },

    async importPackage(input: ExecutePortableImportInput): Promise<PortableImportResult> {
      await Promise.resolve();
      try {
        const projectRoot = normalizeProjectRoot(input.root ?? defaultRoot);
        const manifest = await this.validatePackage({ packageDirectory: input.packageDirectory });
        const plan = await this.planImport(input);
        if (plan.blocking) {
          throw new ExpflowError(
            'portable_import_blocked',
            'Portable package import is blocked by collisions or missing external dependencies.',
            { recoverable: true },
          );
        }
        const imported: string[] = [];
        const skipped: string[] = [];
        for (const payload of manifest.payloads) {
          const record =
            payload.kind === 'object' ? null : readPayload(input.packageDirectory, payload);
          const effect = plan.effects.find(
            (candidate) => candidate.kind === payload.kind && candidate.ref === payload.ref,
          );
          if (effect?.effect === 'exists_same') {
            skipped.push(payload.ref);
            continue;
          }
          if (payload.kind === 'object') {
            storeObjectFromFile(
              projectRoot,
              resolvePackagePath(input.packageDirectory, payload.path),
              payload.ref,
            );
          } else {
            writeRecord(projectRoot, payload, record);
          }
          imported.push(payload.ref);
        }
        return {
          imported_payloads: imported,
          package_id: manifest.package_id,
          resume: plan.resume,
          skipped_payloads: skipped,
        };
      } catch (error) {
        withPackageError(error);
      }
    },
  };
}
