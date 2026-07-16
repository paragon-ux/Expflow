/**
 * Source-integrity verification - repository-contract test (V06).
 *
 * Verifies the Phase 1 SOURCE_MANIFEST.json contract shape, byte-for-byte
 * immutable architecture source integrity, generated index coverage, and
 * working mirror parity.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import {
  compareRepoPath,
  collectImmutableSourceEntries,
  GENERATED_CONTROL_PATHS,
  isRecord,
  listFilesRecursively,
  readJsonFile,
  sha256File,
  type ImmutableSourceEntry,
  type SourceManifest,
} from './architecture-controls.js';
import {
  ARCHITECTURE_DIR,
  EXAMPLES_DIR,
  REPO_ROOT,
  SCHEMAS_DIR,
  SOURCE_MANIFEST_PATH,
  requiredArchitectureBasenames,
} from '../../src/schemas/discovery.js';

function fail(message: string): never {
  throw new Error(message);
}

function toRepoPath(absPath: string): string {
  return relative(REPO_ROOT, absPath).split(sep).join('/');
}

function repoBasename(repoPath: string): string {
  const parts = repoPath.split('/');
  return parts[parts.length - 1] ?? repoPath;
}

function exactKeys(value: Record<string, unknown>, expected: string[], label: string): void {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  if (actual.join('\0') !== sortedExpected.join('\0')) {
    fail(`${label} keys mismatch: expected ${sortedExpected.join(', ')}, got ${actual.join(', ')}`);
  }
}

function parseManifest(): SourceManifest {
  const parsed = readJsonFile(SOURCE_MANIFEST_PATH);
  if (!isRecord(parsed)) {
    fail('SOURCE_MANIFEST.json must be a JSON object');
  }
  exactKeys(parsed, ['algorithm', 'generated_by', 'entries'], 'SOURCE_MANIFEST.json');
  if (parsed.algorithm !== 'sha256') {
    fail("SOURCE_MANIFEST.json algorithm must be 'sha256'");
  }
  if (parsed.generated_by !== 'Expflow Phase 1 repository-contract tooling') {
    fail('SOURCE_MANIFEST.json generated_by has the wrong value');
  }
  if (!Array.isArray(parsed.entries)) {
    fail('SOURCE_MANIFEST.json entries must be an array');
  }

  const entries: ImmutableSourceEntry[] = parsed.entries.map((entry, index) => {
    if (!isRecord(entry)) {
      fail(`Manifest entry ${String(index)} must be an object`);
    }
    exactKeys(entry, ['path', 'bytes', 'sha256'], `Manifest entry ${String(index)}`);
    if (typeof entry.path !== 'string') {
      fail(`Manifest entry ${String(index)} path must be a string`);
    }
    if (typeof entry.bytes !== 'number' || !Number.isInteger(entry.bytes) || entry.bytes < 0) {
      fail(`Manifest entry ${entry.path} bytes must be a non-negative integer`);
    }
    const bytes = entry.bytes;
    if (typeof entry.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(entry.sha256)) {
      fail(`Manifest entry ${entry.path} sha256 must be lowercase SHA-256`);
    }
    if (!entry.path.startsWith('docs/architecture/') || entry.path.includes('\\')) {
      fail(
        `Manifest entry path must be repository-relative under docs/architecture: ${entry.path}`,
      );
    }
    if (GENERATED_CONTROL_PATHS.has(entry.path)) {
      fail(`Generated control file must not be listed as immutable source: ${entry.path}`);
    }
    return {
      path: entry.path,
      bytes,
      sha256: entry.sha256,
    };
  });

  return {
    algorithm: parsed.algorithm,
    generated_by: parsed.generated_by,
    entries,
  };
}

function verifyManifestEntries(manifestEntries: ImmutableSourceEntry[]): string[] {
  const errors: string[] = [];
  const expectedEntries = collectImmutableSourceEntries();

  const manifestPaths = manifestEntries.map((entry) => entry.path);
  const sortedManifestPaths = [...manifestPaths].sort(compareRepoPath);
  if (manifestPaths.join('\0') !== sortedManifestPaths.join('\0')) {
    errors.push('Manifest entries are not sorted lexicographically by path');
  }

  const expectedPaths = expectedEntries.map((entry) => entry.path);
  if (manifestPaths.join('\0') !== expectedPaths.join('\0')) {
    const missing = expectedPaths.filter((path) => !manifestPaths.includes(path));
    const extra = manifestPaths.filter((path) => !expectedPaths.includes(path));
    if (missing.length > 0) {
      errors.push(`Manifest missing immutable source(s): ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
      errors.push(`Manifest contains unexpected source(s): ${extra.join(', ')}`);
    }
  }

  const expectedByPath = new Map(expectedEntries.map((entry) => [entry.path, entry]));
  for (const entry of manifestEntries) {
    const expected = expectedByPath.get(entry.path);
    if (!expected) {
      continue;
    }
    if (entry.bytes !== expected.bytes) {
      errors.push(
        `${entry.path}: bytes mismatch manifest=${String(entry.bytes)} actual=${String(expected.bytes)}`,
      );
    }
    if (entry.sha256 !== expected.sha256) {
      errors.push(
        `${entry.path}: sha256 mismatch manifest=${entry.sha256} actual=${expected.sha256}`,
      );
    }
  }

  return errors;
}

function verifyRequiredArchitectureDuplicateConflicts(
  manifestEntries: ImmutableSourceEntry[],
): string[] {
  const errors: string[] = [];
  const requiredNames = new Set(requiredArchitectureBasenames());
  const authoritativeByName = new Map(
    manifestEntries
      .filter((entry) => requiredNames.has(repoBasename(entry.path)))
      .map((entry) => [repoBasename(entry.path), entry]),
  );

  const duplicatePaths = listFilesRecursively(resolve(REPO_ROOT, 'docs'))
    .map(toRepoPath)
    .filter((repoPath) => !repoPath.startsWith('docs/architecture/'))
    .filter((repoPath) => requiredNames.has(repoBasename(repoPath)))
    .sort(compareRepoPath);

  for (const duplicatePath of duplicatePaths) {
    const name = repoBasename(duplicatePath);
    const authoritative = authoritativeByName.get(name);
    if (!authoritative) {
      continue;
    }
    const duplicateSha = sha256File(resolve(REPO_ROOT, duplicatePath));
    if (duplicateSha !== authoritative.sha256) {
      errors.push(
        `Conflicting duplicate architecture source: ${duplicatePath} sha256=${duplicateSha} differs from ${authoritative.path} sha256=${authoritative.sha256}`,
      );
    }
  }

  return errors;
}

function verifyWorkingMirror(immutableDir: string, mirrorDir: string, label: string): string[] {
  const errors: string[] = [];
  const immutableFiles = listFilesRecursively(immutableDir)
    .filter((file) => file.endsWith('.json'))
    .sort(compareRepoPath);

  for (const immutablePath of immutableFiles) {
    const rel = relative(immutableDir, immutablePath);
    const mirrorPath = resolve(mirrorDir, rel);

    if (!existsSync(mirrorPath)) {
      errors.push(`Missing ${label} mirror: ${rel}`);
      continue;
    }

    const immutableContent = readFileSync(immutablePath);
    const mirrorContent = readFileSync(mirrorPath);
    if (!immutableContent.equals(mirrorContent)) {
      errors.push(`Byte mismatch ${label}: ${rel}`);
    }
  }

  return errors;
}

function verifyIndexCoverage(indexPath: string, expectedPaths: string[], label: string): string[] {
  const errors: string[] = [];
  if (!existsSync(indexPath)) {
    return [`Missing ${label} index: ${toRepoPath(indexPath)}`];
  }
  const content = readFileSync(indexPath, 'utf-8');
  for (const expectedPath of expectedPaths) {
    if (!content.includes(`\`${expectedPath}\``)) {
      errors.push(`${label} index missing path: ${expectedPath}`);
    }
  }
  return errors;
}

const manifest = parseManifest();
const allErrors: string[] = [];

allErrors.push(...verifyManifestEntries(manifest.entries));

for (const name of requiredArchitectureBasenames()) {
  const expectedPath = `docs/architecture/${name}`;
  if (!manifest.entries.some((entry) => entry.path === expectedPath)) {
    allErrors.push(`Missing required architecture source from manifest: ${expectedPath}`);
  }
}
allErrors.push(...verifyRequiredArchitectureDuplicateConflicts(manifest.entries));

allErrors.push(...verifyWorkingMirror(resolve(ARCHITECTURE_DIR, 'schemas'), SCHEMAS_DIR, 'schema'));
allErrors.push(
  ...verifyWorkingMirror(resolve(ARCHITECTURE_DIR, 'examples'), EXAMPLES_DIR, 'example'),
);

const schemaPaths = manifest.entries
  .map((entry) => entry.path)
  .filter((path) => path.startsWith('docs/architecture/schemas/'));
const examplePaths = manifest.entries
  .map((entry) => entry.path)
  .filter((path) => path.startsWith('docs/architecture/examples/'));

allErrors.push(
  ...verifyIndexCoverage(resolve(ARCHITECTURE_DIR, 'SCHEMA_INDEX.md'), schemaPaths, 'Schema'),
);
allErrors.push(
  ...verifyIndexCoverage(resolve(ARCHITECTURE_DIR, 'EXAMPLE_INDEX.md'), examplePaths, 'Example'),
);

for (const generatedPath of GENERATED_CONTROL_PATHS) {
  const absPath = resolve(REPO_ROOT, generatedPath);
  if (!existsSync(absPath)) {
    allErrors.push(`Missing generated control file: ${generatedPath}`);
  }
  if (dirname(absPath) !== ARCHITECTURE_DIR) {
    allErrors.push(
      `Generated control file must stay directly under docs/architecture: ${generatedPath}`,
    );
  }
}

if (allErrors.length === 0) {
  console.log(
    `PASS - Source integrity verified (${String(manifest.entries.length)} immutable files)`,
  );
  process.exit(0);
}

console.error(`FAIL - ${String(allErrors.length)} error(s):`);
for (const err of allErrors) {
  console.error(`  ${err}`);
}
process.exit(1);
