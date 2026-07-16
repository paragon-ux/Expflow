import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { readJsonFile, writeJsonFileExclusive } from '../core/json.js';
import { readProject, storePaths } from '../material/store.js';
import type {
  AuthorityDocumentRecord,
  AuthoritySourceRecord,
  SourceRegistrationDecisionRecord,
} from './types.js';

export interface AuthorityStorePaths {
  readonly authoritySources: string;
  readonly sourceRegistrationDecisions: string;
  readonly authorityDocuments: string;
}

export function authorityStorePaths(projectRoot: string): AuthorityStorePaths {
  const records = resolve(storePaths(projectRoot).stateDir, 'records');
  return {
    authorityDocuments: resolve(records, 'authority-documents'),
    authoritySources: resolve(records, 'authority-sources'),
    sourceRegistrationDecisions: resolve(records, 'source-registration-decisions'),
  };
}

export function ensureAuthorityStore(projectRoot: string): void {
  readProject(projectRoot);
  const paths = authorityStorePaths(projectRoot);
  for (const dir of [
    paths.authoritySources,
    paths.sourceRegistrationDecisions,
    paths.authorityDocuments,
  ]) {
    mkdirSync(dir, { recursive: true });
  }
}

export function sourceRevisionRef(source: AuthoritySourceRecord): string {
  return `${source.source_id}@${String(source.source_revision)}`;
}

export function parseSourceRevisionRef(ref: string): {
  readonly sourceId: string;
  readonly revision: number;
} {
  const match = /^(efs_[0-9A-HJKMNP-TV-Z]{26})@([1-9][0-9]*)$/.exec(ref);
  if (match === null) {
    throw new Error(`Invalid source revision ref: ${ref}`);
  }
  return { revision: Number(match[2]), sourceId: match[1] ?? '' };
}

export function writeAuthoritySource(projectRoot: string, record: AuthoritySourceRecord): void {
  writeJsonFileExclusive(
    resolve(
      authorityStorePaths(projectRoot).authoritySources,
      record.source_id,
      `${String(record.source_revision)}.json`,
    ),
    record,
  );
}

export function readAuthoritySource(
  projectRoot: string,
  sourceId: string,
  revision: number,
): AuthoritySourceRecord | null {
  const path = resolve(
    authorityStorePaths(projectRoot).authoritySources,
    sourceId,
    `${String(revision)}.json`,
  );
  return existsSync(path) ? (readJsonFile(path) as AuthoritySourceRecord) : null;
}

export function readAuthoritySourceByRef(
  projectRoot: string,
  ref: string,
): AuthoritySourceRecord | null {
  const parsed = parseSourceRevisionRef(ref);
  return readAuthoritySource(projectRoot, parsed.sourceId, parsed.revision);
}

export function listAuthoritySources(projectRoot: string): AuthoritySourceRecord[] {
  const root = authorityStorePaths(projectRoot).authoritySources;
  if (!existsSync(root)) {
    return [];
  }
  const records: AuthoritySourceRecord[] = [];
  for (const sourceId of readdirSync(root)) {
    const sourceDir = resolve(root, sourceId);
    for (const file of readdirSync(sourceDir).filter((entry) => entry.endsWith('.json'))) {
      records.push(readJsonFile(resolve(sourceDir, file)) as AuthoritySourceRecord);
    }
  }
  return records.sort((left, right) =>
    sourceRevisionRef(left).localeCompare(sourceRevisionRef(right)),
  );
}

export function nextSourceRevision(projectRoot: string, sourceId: string): number {
  const revisions = listAuthoritySources(projectRoot)
    .filter((source) => source.source_id === sourceId)
    .map((source) => source.source_revision);
  return revisions.length === 0 ? 1 : Math.max(...revisions) + 1;
}

export function writeSourceRegistrationDecision(
  projectRoot: string,
  record: SourceRegistrationDecisionRecord,
): void {
  writeJsonFileExclusive(
    resolve(
      authorityStorePaths(projectRoot).sourceRegistrationDecisions,
      `${record.decision_id}.json`,
    ),
    record,
  );
}

export function listSourceRegistrationDecisions(
  projectRoot: string,
): SourceRegistrationDecisionRecord[] {
  const root = authorityStorePaths(projectRoot).sourceRegistrationDecisions;
  if (!existsSync(root)) {
    return [];
  }
  return readdirSync(root)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readJsonFile(resolve(root, file)) as SourceRegistrationDecisionRecord)
    .sort((left, right) => {
      const created = left.created_at.localeCompare(right.created_at);
      return created === 0 ? left.decision_id.localeCompare(right.decision_id) : created;
    });
}

export function writeAuthorityDocument(projectRoot: string, record: AuthorityDocumentRecord): void {
  writeJsonFileExclusive(
    resolve(authorityStorePaths(projectRoot).authorityDocuments, `${record.document_id}.json`),
    record,
  );
}

export function listAuthorityDocuments(projectRoot: string): AuthorityDocumentRecord[] {
  const root = authorityStorePaths(projectRoot).authorityDocuments;
  if (!existsSync(root)) {
    return [];
  }
  return readdirSync(root)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readJsonFile(resolve(root, file)) as AuthorityDocumentRecord)
    .sort((left, right) => left.document_id.localeCompare(right.document_id));
}
