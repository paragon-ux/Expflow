import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { readJsonFile, writeJsonFileExclusive } from './json.js';
import { readProject, storePaths } from '../material/store.js';

export function recordFamilyDirectory(projectRoot: string, family: string): string {
  return resolve(storePaths(projectRoot).stateDir, 'records', family);
}

export function ensureRecordFamily(projectRoot: string, family: string): void {
  readProject(projectRoot);
  mkdirSync(recordFamilyDirectory(projectRoot, family), { recursive: true });
}

export function writeImmutableRecord(
  projectRoot: string,
  family: string,
  recordId: string,
  record: unknown,
): void {
  ensureRecordFamily(projectRoot, family);
  writeJsonFileExclusive(
    resolve(recordFamilyDirectory(projectRoot, family), `${recordId}.json`),
    record,
  );
}

export function listImmutableRecords<T>(
  projectRoot: string,
  family: string,
  compare: (left: T, right: T) => number,
): T[] {
  const dir = recordFamilyDirectory(projectRoot, family);
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readJsonFile(resolve(dir, file)) as T)
    .sort(compare);
}
