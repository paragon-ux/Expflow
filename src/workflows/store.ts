import {
  ensureRecordFamily,
  listImmutableRecords,
  writeImmutableRecord,
} from '../core/immutable-record-store.js';
import type {
  MaterializationEventRecord,
  VirtualArtifactRecord,
  WorkflowOccurrenceRecord,
} from './types.js';

const FAMILIES = {
  materializationEvents: 'materialization-events',
  virtualArtifacts: 'virtual-artifacts',
  workflowOccurrences: 'workflow-occurrences',
} as const;

export function ensureWorkflowStore(projectRoot: string): void {
  for (const family of Object.values(FAMILIES)) {
    ensureRecordFamily(projectRoot, family);
  }
}

export function writeWorkflowOccurrence(
  projectRoot: string,
  record: WorkflowOccurrenceRecord,
): void {
  writeImmutableRecord(
    projectRoot,
    FAMILIES.workflowOccurrences,
    record.workflow_occurrence_id,
    record,
  );
}

export function writeVirtualArtifact(projectRoot: string, record: VirtualArtifactRecord): void {
  writeImmutableRecord(projectRoot, FAMILIES.virtualArtifacts, record.virtual_artifact_id, record);
}

export function writeMaterializationEvent(
  projectRoot: string,
  record: MaterializationEventRecord,
): void {
  writeImmutableRecord(
    projectRoot,
    FAMILIES.materializationEvents,
    record.materialization_event_id,
    record,
  );
}

export function listWorkflowOccurrences(projectRoot: string): WorkflowOccurrenceRecord[] {
  return listImmutableRecords<WorkflowOccurrenceRecord>(
    projectRoot,
    FAMILIES.workflowOccurrences,
    byCreatedThenId('created_at', 'workflow_occurrence_id'),
  );
}

export function listVirtualArtifacts(projectRoot: string): VirtualArtifactRecord[] {
  return listImmutableRecords<VirtualArtifactRecord>(
    projectRoot,
    FAMILIES.virtualArtifacts,
    byCreatedThenId('created_at', 'virtual_artifact_id'),
  );
}

export function listMaterializationEvents(projectRoot: string): MaterializationEventRecord[] {
  return listImmutableRecords<MaterializationEventRecord>(
    projectRoot,
    FAMILIES.materializationEvents,
    byCreatedThenId('occurred_at', 'materialization_event_id'),
  );
}

export function readWorkflowOccurrence(
  projectRoot: string,
  workflowOccurrenceId: string,
): WorkflowOccurrenceRecord | null {
  return (
    listWorkflowOccurrences(projectRoot).find(
      (record) => record.workflow_occurrence_id === workflowOccurrenceId,
    ) ?? null
  );
}

export function readVirtualArtifact(
  projectRoot: string,
  virtualArtifactId: string,
): VirtualArtifactRecord | null {
  return (
    listVirtualArtifacts(projectRoot).find(
      (record) => record.virtual_artifact_id === virtualArtifactId,
    ) ?? null
  );
}

function byCreatedThenId<T>(createdField: string, idField: string): (left: T, right: T) => number {
  return (left, right) => {
    const leftRecord = left as Record<string, unknown>;
    const rightRecord = right as Record<string, unknown>;
    const created = String(leftRecord[createdField]).localeCompare(
      String(rightRecord[createdField]),
    );
    return created === 0
      ? String(leftRecord[idField]).localeCompare(String(rightRecord[idField]))
      : created;
  };
}
