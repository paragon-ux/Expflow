import {
  ensureRecordFamily,
  listImmutableRecords,
  writeImmutableRecord,
} from '../core/immutable-record-store.js';
import type { EvidenceIntakeRecord } from './types.js';

const FAMILIES = {
  evidenceIntake: 'evidence-intake',
} as const;

export function ensureEvidenceStore(projectRoot: string): void {
  ensureRecordFamily(projectRoot, FAMILIES.evidenceIntake);
}

export function writeEvidenceIntake(projectRoot: string, record: EvidenceIntakeRecord): void {
  writeImmutableRecord(projectRoot, FAMILIES.evidenceIntake, record.intake_id, record);
}

export function listEvidenceIntake(projectRoot: string): EvidenceIntakeRecord[] {
  return listImmutableRecords<EvidenceIntakeRecord>(
    projectRoot,
    FAMILIES.evidenceIntake,
    (left, right) => {
      const created = left.created_at.localeCompare(right.created_at);
      return created === 0 ? left.intake_id.localeCompare(right.intake_id) : created;
    },
  );
}
