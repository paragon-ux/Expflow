import { ExpflowError } from '../core/errors.js';
import { createExpflowId } from '../core/ids.js';
import { cloneJson } from '../core/json.js';
import { normalizeProjectRoot } from '../core/paths.js';
import {
  assertDateTime,
  assertEnum,
  assertExpflowId,
  assertNonEmptyString,
  assertRequestedBy,
  assertSha256Digest,
  assertStringArray,
  schemaInvalid,
} from '../core/record-validation.js';
import { readProject, readTreeRevision } from '../material/store.js';
import { listManifestRevisions } from '../projections/store.js';
import { listWorkflowOccurrences } from '../workflows/store.js';
import {
  ensureReproductionStore,
  listEquivalenceEvaluations,
  listRegenerationAttempts,
  listReuseResults,
  writeEquivalenceEvaluation,
  writeRegenerationAttempt,
  writeReuseResult,
} from './store.js';
import type {
  EquivalenceEvaluationInput,
  EquivalenceEvaluationRecord,
  RegenerationAttemptInput,
  RegenerationAttemptRecord,
  ReuseResultInput,
  ReuseResultRecord,
} from './types.js';

const TARGET_KINDS = ['artifact', 'workflow'] as const;
const REGENERATION_STATUSES = [
  'queued',
  'running',
  'completed',
  'failed',
  'unknown',
  'cancelled',
] as const;
const EQUIVALENCE_CLASSIFICATIONS = [
  'exact',
  'representation_equivalent',
  'workflow_equivalent',
  'divergent',
  'incomplete',
  'failed',
] as const;
const REUSE_STATUSES = ['proposed', 'running', 'completed', 'failed', 'rejected'] as const;

export interface ReproductionRuntime {
  recordRegenerationAttempt(input: RegenerationAttemptInput): Promise<RegenerationAttemptRecord>;
  recordEquivalenceEvaluation(
    input: EquivalenceEvaluationInput,
  ): Promise<EquivalenceEvaluationRecord>;
  recordReuseResult(input: ReuseResultInput): Promise<ReuseResultRecord>;
  listRegenerationAttempts(): Promise<readonly RegenerationAttemptRecord[]>;
  listEquivalenceEvaluations(): Promise<readonly EquivalenceEvaluationRecord[]>;
  listReuseResults(): Promise<readonly ReuseResultRecord[]>;
}

function regenerationAttemptRecord(
  projectRoot: string,
  input: RegenerationAttemptInput,
  startedAt: string,
): RegenerationAttemptRecord {
  assertKnownWorkflow(projectRoot, input.sourceWorkflowOccurrenceId);
  readTreeRevision(projectRoot, input.inputTreeRevisionId);
  const record: RegenerationAttemptRecord = {
    schema_version: '2.3',
    completed_at: input.completedAt ?? null,
    failure: input.failure ?? null,
    input_tree_revision_id: input.inputTreeRevisionId,
    model_profile: input.modelProfile,
    output_refs: input.outputRefs ?? [],
    project_id: readProject(projectRoot).project_id,
    prompt_digest: input.promptDigest,
    regeneration_attempt_id: createExpflowId('efra'),
    security_profile: input.securityProfile,
    source_workflow_occurrence_id: input.sourceWorkflowOccurrenceId,
    started_at: startedAt,
    status: input.status ?? 'queued',
    target_kind: input.targetKind,
    target_ref: input.targetRef ?? null,
    tool_profile: input.toolProfile,
  };
  assertRegenerationAttempt(record);
  return record;
}

function equivalenceEvaluationRecord(
  projectRoot: string,
  input: EquivalenceEvaluationInput,
  createdAt: string,
): EquivalenceEvaluationRecord {
  const record: EquivalenceEvaluationRecord = {
    schema_version: '2.3',
    acceptance_decision_ref: input.acceptanceDecisionRef ?? null,
    classification: input.classification,
    created_at: createdAt,
    evaluation_id: createExpflowId('efee'),
    evaluator: input.evaluator,
    evidence_refs: input.evidenceRefs ?? [],
    limitations: input.limitations ?? [],
    metrics: input.metrics ?? {},
    project_id: readProject(projectRoot).project_id,
    reference_refs: input.referenceRefs ?? [],
    subject_ref: input.subjectRef,
  };
  assertEquivalenceEvaluation(record);
  return record;
}

function reuseResultRecord(
  projectRoot: string,
  input: ReuseResultInput,
  createdAt: string,
): ReuseResultRecord {
  assertKnownWorkflow(projectRoot, input.referenceWorkflowOccurrenceId);
  assertKnownManifest(projectRoot, input.referenceManifestRevisionId);
  readTreeRevision(projectRoot, input.newInputTreeRevisionId);
  const status = input.status ?? 'proposed';
  if ((status === 'running' || status === 'completed') && !policyGatePassed(input)) {
    throw new ExpflowError(
      'reuse_policy_gate_failed',
      'Reuse requires accepted license and authority policy gates before execution.',
    );
  }
  if (input.outputWorkflowOccurrenceId !== null && input.outputWorkflowOccurrenceId !== undefined) {
    assertKnownWorkflow(projectRoot, input.outputWorkflowOccurrenceId);
  }
  if (
    status === 'completed' &&
    (input.outputWorkflowOccurrenceId === null || input.outputWorkflowOccurrenceId === undefined)
  ) {
    throw schemaInvalid('Completed reuse results require output_workflow_occurrence_id.');
  }
  const record: ReuseResultRecord = {
    schema_version: '2.3',
    acceptance_decision_ref: input.acceptanceDecisionRef ?? null,
    created_at: createdAt,
    deviation_summary: input.deviationSummary ?? null,
    equivalence_evaluation_refs: input.equivalenceEvaluationRefs ?? [],
    new_input_tree_revision_id: input.newInputTreeRevisionId,
    output_workflow_occurrence_id: input.outputWorkflowOccurrenceId ?? null,
    project_id: readProject(projectRoot).project_id,
    reference_manifest_revision_id: input.referenceManifestRevisionId,
    reference_workflow_occurrence_id: input.referenceWorkflowOccurrenceId,
    reuse_result_id: createExpflowId('efru'),
    semantic_leakage_evaluation_ref: input.semanticLeakageEvaluationRef ?? null,
    status,
  };
  assertReuseResult(record);
  return record;
}

function assertRegenerationAttempt(record: RegenerationAttemptRecord): void {
  assertExpflowId(record.regeneration_attempt_id, 'efra', 'regeneration_attempt_id');
  assertExpflowId(record.project_id, 'efp', 'project_id');
  assertEnum(record.target_kind, TARGET_KINDS, 'target_kind');
  assertExpflowId(record.source_workflow_occurrence_id, 'efw', 'source_workflow_occurrence_id');
  assertExpflowId(record.input_tree_revision_id, 'eft', 'input_tree_revision_id');
  assertNonEmptyString(record.model_profile, 'model_profile');
  assertSha256Digest(record.prompt_digest, 'prompt_digest');
  assertNonEmptyString(record.tool_profile, 'tool_profile');
  assertEnum(record.status, REGENERATION_STATUSES, 'status');
  assertStringArray(record.output_refs ?? [], 'output_refs');
  assertDateTime(record.started_at, 'started_at');
  assertDateTime(record.completed_at, 'completed_at');
}

function assertEquivalenceEvaluation(record: EquivalenceEvaluationRecord): void {
  assertExpflowId(record.evaluation_id, 'efee', 'evaluation_id');
  assertExpflowId(record.project_id, 'efp', 'project_id');
  assertNonEmptyString(record.subject_ref, 'subject_ref');
  assertStringArray(record.reference_refs ?? [], 'reference_refs');
  assertRequestedBy(record.evaluator, 'evaluator');
  assertEnum(record.classification, EQUIVALENCE_CLASSIFICATIONS, 'classification');
  assertStringArray(record.evidence_refs, 'evidence_refs');
  assertStringArray(record.limitations ?? [], 'limitations');
  assertDateTime(record.created_at, 'created_at');
}

function assertReuseResult(record: ReuseResultRecord): void {
  assertExpflowId(record.reuse_result_id, 'efru', 'reuse_result_id');
  assertExpflowId(record.project_id, 'efp', 'project_id');
  assertExpflowId(
    record.reference_workflow_occurrence_id,
    'efw',
    'reference_workflow_occurrence_id',
  );
  assertExpflowId(record.reference_manifest_revision_id, 'efm', 'reference_manifest_revision_id');
  assertExpflowId(record.new_input_tree_revision_id, 'eft', 'new_input_tree_revision_id');
  if (
    record.output_workflow_occurrence_id !== null &&
    record.output_workflow_occurrence_id !== undefined
  ) {
    assertExpflowId(record.output_workflow_occurrence_id, 'efw', 'output_workflow_occurrence_id');
  }
  assertEnum(record.status, REUSE_STATUSES, 'status');
  assertStringArray(record.equivalence_evaluation_refs ?? [], 'equivalence_evaluation_refs');
  assertDateTime(record.created_at, 'created_at');
}

function assertKnownWorkflow(projectRoot: string, workflowOccurrenceId: string): void {
  if (
    !listWorkflowOccurrences(projectRoot).some(
      (record) => record.workflow_occurrence_id === workflowOccurrenceId,
    )
  ) {
    throw new ExpflowError(
      'workflow_occurrence_missing',
      `Workflow occurrence not found: ${workflowOccurrenceId}`,
    );
  }
}

function assertKnownManifest(projectRoot: string, manifestRevisionId: string): void {
  if (
    !listManifestRevisions(projectRoot).some(
      (record) => record.manifest_revision_id === manifestRevisionId,
    )
  ) {
    throw new ExpflowError(
      'manifest_revision_missing',
      `Manifest revision not found: ${manifestRevisionId}`,
    );
  }
}

function policyGatePassed(input: ReuseResultInput): boolean {
  return (
    input.policyGate !== undefined &&
    input.policyGate.licenseAccepted &&
    input.policyGate.authorityAccepted
  );
}

export function createReproductionRuntime(root?: string): ReproductionRuntime {
  const projectRoot = normalizeProjectRoot(root);
  return {
    async recordRegenerationAttempt(input): Promise<RegenerationAttemptRecord> {
      await Promise.resolve();
      ensureReproductionStore(projectRoot);
      const record = regenerationAttemptRecord(projectRoot, input, new Date().toISOString());
      writeRegenerationAttempt(projectRoot, record);
      return cloneJson(record);
    },

    async recordEquivalenceEvaluation(input): Promise<EquivalenceEvaluationRecord> {
      await Promise.resolve();
      ensureReproductionStore(projectRoot);
      const record = equivalenceEvaluationRecord(projectRoot, input, new Date().toISOString());
      writeEquivalenceEvaluation(projectRoot, record);
      return cloneJson(record);
    },

    async recordReuseResult(input): Promise<ReuseResultRecord> {
      await Promise.resolve();
      ensureReproductionStore(projectRoot);
      const record = reuseResultRecord(projectRoot, input, new Date().toISOString());
      writeReuseResult(projectRoot, record);
      return cloneJson(record);
    },

    async listRegenerationAttempts(): Promise<readonly RegenerationAttemptRecord[]> {
      await Promise.resolve();
      ensureReproductionStore(projectRoot);
      return cloneJson(listRegenerationAttempts(projectRoot));
    },

    async listEquivalenceEvaluations(): Promise<readonly EquivalenceEvaluationRecord[]> {
      await Promise.resolve();
      ensureReproductionStore(projectRoot);
      return cloneJson(listEquivalenceEvaluations(projectRoot));
    },

    async listReuseResults(): Promise<readonly ReuseResultRecord[]> {
      await Promise.resolve();
      ensureReproductionStore(projectRoot);
      return cloneJson(listReuseResults(projectRoot));
    },
  };
}

export function regenerationAttemptRef(record: RegenerationAttemptRecord): string {
  return record.regeneration_attempt_id;
}

export function equivalenceEvaluationRef(record: EquivalenceEvaluationRecord): string {
  return record.evaluation_id;
}

export function reuseResultRef(record: ReuseResultRecord): string {
  return record.reuse_result_id;
}
