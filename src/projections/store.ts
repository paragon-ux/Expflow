import {
  ensureRecordFamily,
  listImmutableRecords,
  writeImmutableRecord,
} from '../core/immutable-record-store.js';
import type { ManifestRevisionRecord } from './types.js';

const MANIFEST_REVISIONS = 'manifest-revisions';

export function ensureProjectionStore(projectRoot: string): void {
  ensureRecordFamily(projectRoot, MANIFEST_REVISIONS);
}

export function writeManifestRevision(projectRoot: string, record: ManifestRevisionRecord): void {
  writeImmutableRecord(projectRoot, MANIFEST_REVISIONS, record.manifest_revision_id, record);
}

export function listManifestRevisions(projectRoot: string): ManifestRevisionRecord[] {
  return listImmutableRecords<ManifestRevisionRecord>(
    projectRoot,
    MANIFEST_REVISIONS,
    (left, right) => {
      const created = left.created_at.localeCompare(right.created_at);
      return created === 0
        ? left.manifest_revision_id.localeCompare(right.manifest_revision_id)
        : created;
    },
  );
}
