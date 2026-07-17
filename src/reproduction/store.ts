import {
  ensureRecordFamily,
  listImmutableRecords,
  writeImmutableRecord,
} from '../core/immutable-record-store.js';
import type {
  EquivalenceEvaluationRecord,
  RegenerationAttemptRecord,
  ReuseResultRecord,
} from './types.js';

const FAMILIES = {
  equivalenceEvaluations: 'equivalence-evaluations',
  regenerationAttempts: 'regeneration-attempts',
  reuseResults: 'reuse-results',
} as const;

export function ensureReproductionStore(projectRoot: string): void {
  for (const family of Object.values(FAMILIES)) {
    ensureRecordFamily(projectRoot, family);
  }
}

export function writeRegenerationAttempt(
  projectRoot: string,
  record: RegenerationAttemptRecord,
): void {
  writeImmutableRecord(
    projectRoot,
    FAMILIES.regenerationAttempts,
    record.regeneration_attempt_id,
    record,
  );
}

export function writeEquivalenceEvaluation(
  projectRoot: string,
  record: EquivalenceEvaluationRecord,
): void {
  writeImmutableRecord(projectRoot, FAMILIES.equivalenceEvaluations, record.evaluation_id, record);
}

export function writeReuseResult(projectRoot: string, record: ReuseResultRecord): void {
  writeImmutableRecord(projectRoot, FAMILIES.reuseResults, record.reuse_result_id, record);
}

export function listRegenerationAttempts(projectRoot: string): RegenerationAttemptRecord[] {
  return listImmutableRecords<RegenerationAttemptRecord>(
    projectRoot,
    FAMILIES.regenerationAttempts,
    byCreatedThenId('started_at', 'regeneration_attempt_id'),
  );
}

export function listEquivalenceEvaluations(projectRoot: string): EquivalenceEvaluationRecord[] {
  return listImmutableRecords<EquivalenceEvaluationRecord>(
    projectRoot,
    FAMILIES.equivalenceEvaluations,
    byCreatedThenId('created_at', 'evaluation_id'),
  );
}

export function listReuseResults(projectRoot: string): ReuseResultRecord[] {
  return listImmutableRecords<ReuseResultRecord>(
    projectRoot,
    FAMILIES.reuseResults,
    byCreatedThenId('created_at', 'reuse_result_id'),
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
