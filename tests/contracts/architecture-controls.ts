import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { ARCHITECTURE_DIR, REPO_ROOT } from '../../src/schemas/discovery.js';

export const GENERATED_CONTROL_PATHS = new Set([
  'docs/architecture/SOURCE_MANIFEST.json',
  'docs/architecture/SCHEMA_INDEX.md',
  'docs/architecture/EXAMPLE_INDEX.md',
]);

export interface ImmutableSourceEntry {
  path: string;
  bytes: number;
  sha256: string;
}

export interface SourceManifest {
  algorithm: 'sha256';
  generated_by: 'Expflow Phase 1 repository-contract tooling';
  entries: ImmutableSourceEntry[];
}

export function toRepoPath(absPath: string): string {
  return relative(REPO_ROOT, absPath).split(sep).join('/');
}

export function compareRepoPath(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

export function sha256File(absPath: string): string {
  return createHash('sha256').update(readFileSync(absPath)).digest('hex');
}

export function listFilesRecursively(absDir: string): string[] {
  if (!existsSync(absDir)) {
    return [];
  }

  const files: string[] = [];
  const entries = readdirSync(absDir, { withFileTypes: true }).sort((a, b) =>
    compareRepoPath(a.name, b.name),
  );

  for (const entry of entries) {
    const fullPath = resolve(absDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursively(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

export function collectImmutableSourceEntries(): ImmutableSourceEntry[] {
  return listFilesRecursively(ARCHITECTURE_DIR)
    .map((absPath) => ({ absPath, repoPath: toRepoPath(absPath) }))
    .filter(({ repoPath }) => !GENERATED_CONTROL_PATHS.has(repoPath))
    .map(({ absPath, repoPath }) => ({
      path: repoPath,
      bytes: statSync(absPath).size,
      sha256: sha256File(absPath),
    }))
    .sort((a, b) => compareRepoPath(a.path, b.path));
}

export function readJsonFile(absPath: string): unknown {
  return JSON.parse(readFileSync(absPath, 'utf-8')) as unknown;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
