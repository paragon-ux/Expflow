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
  assertStringArray,
  schemaInvalid,
} from '../core/record-validation.js';
import { readProject, readTreeRevision } from '../material/store.js';
import {
  ensureWorkflowStore,
  listMaterializationEvents,
  listVirtualArtifacts,
  listWorkflowOccurrences,
  readVirtualArtifact,
  readWorkflowOccurrence,
  writeMaterializationEvent,
  writeVirtualArtifact,
  writeWorkflowOccurrence,
} from './store.js';
import type {
  AttachWorkflowOutputInput,
  MaterializationEventInput,
  MaterializationEventRecord,
  StartWorkflowInput,
  VirtualArtifactInput,
  VirtualArtifactRecord,
  WorkflowOccurrenceRecord,
  WorkflowStateTransitionInput,
} from './types.js';

const MATERIAL_STATUSES = ['inputs_pinned', 'outputs_present', 'outputs_incomplete'] as const;
const COMPLETION_STATUSES = ['none', 'asserted', 'accepted', 'rejected', 'conflicted'] as const;
const VERIFICATION_STATUSES = ['not_evaluated', 'passed', 'failed', 'partial'] as const;
const REUSE_STATUSES = ['not_evaluated', 'eligible', 'approved', 'rejected'] as const;
const VIRTUAL_AVAILABILITY = [
  'virtual',
  'externally_referenced',
  'unavailable',
  'materialized',
  'regenerated',
] as const;
const MATERIALIZATION_KINDS = [
  'download',
  'copy',
  'convert',
  'external_save',
  'regenerate',
  'import',
] as const;

export interface WorkflowRuntime {
  startWorkflowOccurrence(input: StartWorkflowInput): Promise<WorkflowOccurrenceRecord>;
  attachWorkflowOutput(input: AttachWorkflowOutputInput): Promise<WorkflowOccurrenceRecord>;
  transitionWorkflowState(input: WorkflowStateTransitionInput): Promise<WorkflowOccurrenceRecord>;
  recordVirtualArtifact(input: VirtualArtifactInput): Promise<VirtualArtifactRecord>;
  recordMaterializationEvent(input: MaterializationEventInput): Promise<MaterializationEventRecord>;
  listWorkflowOccurrences(): Promise<readonly WorkflowOccurrenceRecord[]>;
  listVirtualArtifacts(): Promise<readonly VirtualArtifactRecord[]>;
  listMaterializationEvents(): Promise<readonly MaterializationEventRecord[]>;
}

function workflowRecord(
  projectRoot: string,
  input: StartWorkflowInput,
  createdAt: string,
): WorkflowOccurrenceRecord {
  readTreeRevision(projectRoot, input.inputTreeRevisionId);
  const record: WorkflowOccurrenceRecord = {
    schema_version: '2.3',
    authority_document_refs: input.authorityDocumentRefs ?? [],
    authority_source_revision_refs: input.authoritySourceRevisionRefs ?? [],
    completion_assertion_ref: null,
    completion_decision_ref: null,
    completion_operation_id: null,
    completion_status: 'none',
    created_at: createdAt,
    input_path_selector: input.inputPathSelector,
    input_tree_revision_id: input.inputTreeRevisionId,
    material_status: 'inputs_pinned',
    output_path_selector: null,
    output_tree_revision_id: null,
    project_id: readProject(projectRoot).project_id,
    reuse_decision_ref: null,
    reuse_status: 'not_evaluated',
    start_operation_id: input.startOperationId,
    supersedes_occurrence_ref: null,
    verification_decision_ref: null,
    verification_status: 'not_evaluated',
    virtual_artifact_refs: [],
    workflow_occurrence_id: createExpflowId('efw'),
  };
  assertWorkflowOccurrence(record);
  return record;
}

function outputTransitionRecord(
  projectRoot: string,
  previous: WorkflowOccurrenceRecord,
  input: AttachWorkflowOutputInput,
  createdAt: string,
): WorkflowOccurrenceRecord {
  readTreeRevision(projectRoot, input.outputTreeRevisionId);
  const record: WorkflowOccurrenceRecord = {
    ...previous,
    completion_operation_id: input.completionOperationId ?? null,
    created_at: createdAt,
    material_status: 'outputs_present',
    output_path_selector: input.outputPathSelector,
    output_tree_revision_id: input.outputTreeRevisionId,
    supersedes_occurrence_ref: previous.workflow_occurrence_id,
    workflow_occurrence_id: createExpflowId('efw'),
  };
  assertWorkflowOccurrence(record);
  return record;
}

function stateTransitionRecord(
  previous: WorkflowOccurrenceRecord,
  input: WorkflowStateTransitionInput,
  createdAt: string,
): WorkflowOccurrenceRecord {
  const record: WorkflowOccurrenceRecord = {
    ...previous,
    completion_assertion_ref: input.completionAssertionRef ?? previous.completion_assertion_ref,
    completion_decision_ref: input.completionDecisionRef ?? previous.completion_decision_ref,
    completion_status: input.completionStatus ?? previous.completion_status,
    created_at: createdAt,
    material_status: input.materialStatus ?? previous.material_status,
    reuse_decision_ref: input.reuseDecisionRef ?? previous.reuse_decision_ref,
    reuse_status: input.reuseStatus ?? previous.reuse_status,
    supersedes_occurrence_ref: previous.workflow_occurrence_id,
    verification_decision_ref: input.verificationDecisionRef ?? previous.verification_decision_ref,
    verification_status: input.verificationStatus ?? previous.verification_status,
    workflow_occurrence_id: createExpflowId('efw'),
  };
  assertWorkflowOccurrence(record);
  return record;
}

function virtualArtifactRecord(
  projectRoot: string,
  input: VirtualArtifactInput,
  createdAt: string,
): VirtualArtifactRecord {
  assertKnownWorkflow(projectRoot, input.workflowOccurrenceId);
  const record: VirtualArtifactRecord = {
    schema_version: '2.3',
    availability: input.availability ?? 'virtual',
    created_at: createdAt,
    display_name: input.displayName,
    generation_event_ref: input.generationEventRef,
    materialization_event_refs: input.materializationEventRefs ?? [],
    media_type: input.mediaType ?? null,
    parent_refs: input.parentRefs ?? [],
    project_id: readProject(projectRoot).project_id,
    virtual_artifact_id: createExpflowId('efva'),
    workflow_occurrence_id: input.workflowOccurrenceId,
  };
  assertVirtualArtifact(record);
  return record;
}

function materializationEventRecord(
  projectRoot: string,
  input: MaterializationEventInput,
  occurredAt: string,
): MaterializationEventRecord {
  assertKnownVirtualArtifact(projectRoot, input.virtualArtifactId);
  const record: MaterializationEventRecord = {
    schema_version: '2.3',
    asserted_by: input.assertedBy,
    authority_source_refs: input.authoritySourceRefs ?? [],
    event_kind: input.eventKind,
    material_node_ref: input.materialNodeRef,
    materialization_event_id: createExpflowId('efme'),
    notes: input.notes ?? null,
    occurred_at: occurredAt,
    project_id: readProject(projectRoot).project_id,
    virtual_artifact_id: input.virtualArtifactId,
  };
  assertMaterializationEvent(record);
  return record;
}

function assertWorkflowOccurrence(record: WorkflowOccurrenceRecord): void {
  assertExpflowId(record.workflow_occurrence_id, 'efw', 'workflow_occurrence_id');
  assertExpflowId(record.project_id, 'efp', 'project_id');
  assertExpflowId(record.input_tree_revision_id, 'eft', 'input_tree_revision_id');
  assertPathSelectorShape(record.input_path_selector, 'input_path_selector');
  if (record.output_tree_revision_id !== null && record.output_tree_revision_id !== undefined) {
    assertExpflowId(record.output_tree_revision_id, 'eft', 'output_tree_revision_id');
  }
  if (record.output_path_selector !== null && record.output_path_selector !== undefined) {
    assertPathSelectorShape(record.output_path_selector, 'output_path_selector');
  }
  assertExpflowId(record.start_operation_id, 'efo', 'start_operation_id');
  if (record.completion_operation_id !== null && record.completion_operation_id !== undefined) {
    assertExpflowId(record.completion_operation_id, 'efo', 'completion_operation_id');
  }
  assertStringArray(record.authority_source_revision_refs, 'authority_source_revision_refs');
  assertStringArray(record.authority_document_refs ?? [], 'authority_document_refs');
  assertStringArray(record.virtual_artifact_refs ?? [], 'virtual_artifact_refs');
  assertEnum(record.material_status, MATERIAL_STATUSES, 'material_status');
  assertEnum(record.completion_status, COMPLETION_STATUSES, 'completion_status');
  assertEnum(record.verification_status, VERIFICATION_STATUSES, 'verification_status');
  assertEnum(record.reuse_status, REUSE_STATUSES, 'reuse_status');
  assertDateTime(record.created_at, 'created_at');
}

function assertVirtualArtifact(record: VirtualArtifactRecord): void {
  assertExpflowId(record.virtual_artifact_id, 'efva', 'virtual_artifact_id');
  assertExpflowId(record.project_id, 'efp', 'project_id');
  assertExpflowId(record.workflow_occurrence_id, 'efw', 'workflow_occurrence_id');
  assertNonEmptyString(record.generation_event_ref, 'generation_event_ref');
  assertNonEmptyString(record.display_name, 'display_name');
  assertEnum(record.availability, VIRTUAL_AVAILABILITY, 'availability');
  assertStringArray(record.parent_refs ?? [], 'parent_refs');
  assertStringArray(record.materialization_event_refs ?? [], 'materialization_event_refs');
  assertDateTime(record.created_at, 'created_at');
}

function assertMaterializationEvent(record: MaterializationEventRecord): void {
  assertExpflowId(record.materialization_event_id, 'efme', 'materialization_event_id');
  assertExpflowId(record.project_id, 'efp', 'project_id');
  assertExpflowId(record.virtual_artifact_id, 'efva', 'virtual_artifact_id');
  assertNonEmptyString(record.material_node_ref, 'material_node_ref');
  assertEnum(record.event_kind, MATERIALIZATION_KINDS, 'event_kind');
  assertRequestedBy(record.asserted_by, 'asserted_by');
  assertStringArray(record.authority_source_refs ?? [], 'authority_source_refs');
  assertDateTime(record.occurred_at, 'occurred_at');
}

function assertKnownWorkflow(
  projectRoot: string,
  workflowOccurrenceId: string,
): WorkflowOccurrenceRecord {
  const workflow = readWorkflowOccurrence(projectRoot, workflowOccurrenceId);
  if (workflow === null) {
    throw new ExpflowError(
      'workflow_occurrence_missing',
      `Workflow occurrence not found: ${workflowOccurrenceId}`,
    );
  }
  return workflow;
}

function assertKnownVirtualArtifact(
  projectRoot: string,
  virtualArtifactId: string,
): VirtualArtifactRecord {
  const artifact = readVirtualArtifact(projectRoot, virtualArtifactId);
  if (artifact === null) {
    throw new ExpflowError(
      'virtual_artifact_missing',
      `Virtual artifact not found: ${virtualArtifactId}`,
    );
  }
  return artifact;
}

export function createWorkflowRuntime(root?: string): WorkflowRuntime {
  const projectRoot = normalizeProjectRoot(root);
  return {
    async startWorkflowOccurrence(input): Promise<WorkflowOccurrenceRecord> {
      await Promise.resolve();
      ensureWorkflowStore(projectRoot);
      const record = workflowRecord(projectRoot, input, new Date().toISOString());
      writeWorkflowOccurrence(projectRoot, record);
      return cloneJson(record);
    },

    async attachWorkflowOutput(input): Promise<WorkflowOccurrenceRecord> {
      await Promise.resolve();
      ensureWorkflowStore(projectRoot);
      const previous = assertKnownWorkflow(projectRoot, input.workflowOccurrenceId);
      const record = outputTransitionRecord(projectRoot, previous, input, new Date().toISOString());
      writeWorkflowOccurrence(projectRoot, record);
      return cloneJson(record);
    },

    async transitionWorkflowState(input): Promise<WorkflowOccurrenceRecord> {
      await Promise.resolve();
      ensureWorkflowStore(projectRoot);
      const previous = assertKnownWorkflow(projectRoot, input.workflowOccurrenceId);
      if (input.completionStatus === 'accepted' && input.completionDecisionRef === undefined) {
        throw schemaInvalid('Accepted workflow completion requires a completion decision ref.');
      }
      const record = stateTransitionRecord(previous, input, new Date().toISOString());
      writeWorkflowOccurrence(projectRoot, record);
      return cloneJson(record);
    },

    async recordVirtualArtifact(input): Promise<VirtualArtifactRecord> {
      await Promise.resolve();
      ensureWorkflowStore(projectRoot);
      const record = virtualArtifactRecord(projectRoot, input, new Date().toISOString());
      writeVirtualArtifact(projectRoot, record);
      return cloneJson(record);
    },

    async recordMaterializationEvent(input): Promise<MaterializationEventRecord> {
      await Promise.resolve();
      ensureWorkflowStore(projectRoot);
      const record = materializationEventRecord(projectRoot, input, new Date().toISOString());
      writeMaterializationEvent(projectRoot, record);
      return cloneJson(record);
    },

    async listWorkflowOccurrences(): Promise<readonly WorkflowOccurrenceRecord[]> {
      await Promise.resolve();
      ensureWorkflowStore(projectRoot);
      return cloneJson(listWorkflowOccurrences(projectRoot));
    },

    async listVirtualArtifacts(): Promise<readonly VirtualArtifactRecord[]> {
      await Promise.resolve();
      ensureWorkflowStore(projectRoot);
      return cloneJson(listVirtualArtifacts(projectRoot));
    },

    async listMaterializationEvents(): Promise<readonly MaterializationEventRecord[]> {
      await Promise.resolve();
      ensureWorkflowStore(projectRoot);
      return cloneJson(listMaterializationEvents(projectRoot));
    },
  };
}

export function workflowOccurrenceRef(record: WorkflowOccurrenceRecord): string {
  return record.workflow_occurrence_id;
}

export function virtualArtifactRef(record: VirtualArtifactRecord): string {
  return record.virtual_artifact_id;
}
