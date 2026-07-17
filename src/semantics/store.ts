import {
  ensureRecordFamily,
  listImmutableRecords,
  writeImmutableRecord,
} from '../core/immutable-record-store.js';
import type {
  ArtifactClusterRecord,
  ConflictRecord,
  ReviewRequestRecord,
  SemanticAssertionRecord,
  SemanticDecisionRecord,
  SourceCorrespondenceRecord,
} from './types.js';

const FAMILIES = {
  artifactClusters: 'artifact-clusters',
  conflicts: 'conflicts',
  reviewRequests: 'review-requests',
  semanticAssertions: 'semantic-assertions',
  semanticDecisions: 'semantic-decisions',
  sourceCorrespondence: 'source-correspondence',
} as const;

export function ensureSemanticStore(projectRoot: string): void {
  for (const family of Object.values(FAMILIES)) {
    ensureRecordFamily(projectRoot, family);
  }
}

export function writeSemanticAssertion(projectRoot: string, record: SemanticAssertionRecord): void {
  writeImmutableRecord(projectRoot, FAMILIES.semanticAssertions, record.assertion_id, record);
}

export function writeSemanticDecision(projectRoot: string, record: SemanticDecisionRecord): void {
  writeImmutableRecord(projectRoot, FAMILIES.semanticDecisions, record.decision_id, record);
}

export function writeConflict(projectRoot: string, record: ConflictRecord): void {
  writeImmutableRecord(projectRoot, FAMILIES.conflicts, record.conflict_id, record);
}

export function writeReviewRequest(projectRoot: string, record: ReviewRequestRecord): void {
  writeImmutableRecord(projectRoot, FAMILIES.reviewRequests, record.review_request_id, record);
}

export function writeSourceCorrespondence(
  projectRoot: string,
  record: SourceCorrespondenceRecord,
): void {
  writeImmutableRecord(
    projectRoot,
    FAMILIES.sourceCorrespondence,
    record.correspondence_id,
    record,
  );
}

export function writeArtifactCluster(projectRoot: string, record: ArtifactClusterRecord): void {
  writeImmutableRecord(projectRoot, FAMILIES.artifactClusters, record.cluster_id, record);
}

export function listSemanticAssertions(projectRoot: string): SemanticAssertionRecord[] {
  return listImmutableRecords<SemanticAssertionRecord>(
    projectRoot,
    FAMILIES.semanticAssertions,
    byCreatedThenId('created_at', 'assertion_id'),
  );
}

export function listSemanticDecisions(projectRoot: string): SemanticDecisionRecord[] {
  return listImmutableRecords<SemanticDecisionRecord>(
    projectRoot,
    FAMILIES.semanticDecisions,
    byCreatedThenId('created_at', 'decision_id'),
  );
}

export function listConflicts(projectRoot: string): ConflictRecord[] {
  return listImmutableRecords<ConflictRecord>(
    projectRoot,
    FAMILIES.conflicts,
    byCreatedThenId('declared_at', 'conflict_id'),
  );
}

export function listReviewRequests(projectRoot: string): ReviewRequestRecord[] {
  return listImmutableRecords<ReviewRequestRecord>(
    projectRoot,
    FAMILIES.reviewRequests,
    byCreatedThenId('requested_at', 'review_request_id'),
  );
}

export function listSourceCorrespondence(projectRoot: string): SourceCorrespondenceRecord[] {
  return listImmutableRecords<SourceCorrespondenceRecord>(
    projectRoot,
    FAMILIES.sourceCorrespondence,
    byCreatedThenId('created_at', 'correspondence_id'),
  );
}

export function listArtifactClusters(projectRoot: string): ArtifactClusterRecord[] {
  return listImmutableRecords<ArtifactClusterRecord>(
    projectRoot,
    FAMILIES.artifactClusters,
    byCreatedThenId('computed_at', 'cluster_id'),
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
