/**
 * Gate A contract fixture corpus verification.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isRecord, listFilesRecursively, toRepoPath } from './architecture-controls.js';
import { REPO_ROOT } from '../../src/schemas/discovery.js';

const fixtureRoot = resolve(REPO_ROOT, 'tests/fixtures/contracts');
const manifestPath = resolve(fixtureRoot, 'manifest.json');
const requiredCategories = [
  'valid',
  'invalid',
  'compatibility',
  'recovery',
  'tree-digests',
  'examples',
];

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf-8')) as unknown;
}

const errors: string[] = [];

if (!existsSync(manifestPath)) {
  errors.push('Missing tests/fixtures/contracts/manifest.json');
} else {
  const manifest = readJson(manifestPath);
  if (!isRecord(manifest)) {
    errors.push('Fixture manifest must be an object');
  } else {
    if (manifest.schema_version !== '2.3') {
      errors.push('Fixture manifest schema_version must be 2.3');
    }
    if (!Array.isArray(manifest.categories)) {
      errors.push('Fixture manifest categories must be an array');
    } else {
      const categories = manifest.categories.map((category) => {
        if (!isRecord(category) || typeof category.name !== 'string') {
          errors.push('Each fixture category must contain a name');
          return '';
        }
        return category.name;
      });
      for (const required of requiredCategories) {
        if (!categories.includes(required)) {
          errors.push(`Fixture manifest missing category: ${required}`);
        }
        const categoryPath = resolve(fixtureRoot, required);
        if (!existsSync(categoryPath)) {
          errors.push(`Missing fixture category directory: tests/fixtures/contracts/${required}`);
        }
      }
    }
  }
}

for (const file of listFilesRecursively(fixtureRoot).filter((file) => file.endsWith('.json'))) {
  try {
    readJson(file);
  } catch (error) {
    errors.push(`JSON parse failure in ${toRepoPath(file)}: ${String(error)}`);
  }
}

for (const file of listFilesRecursively(resolve(fixtureRoot, 'tree-digests')).filter((file) =>
  file.endsWith('.json'),
)) {
  const vector = readJson(file);
  if (!isRecord(vector)) {
    errors.push(`${toRepoPath(file)} must be an object`);
    continue;
  }
  if (typeof vector.canonical_json !== 'string' || typeof vector.expected_sha256 !== 'string') {
    errors.push(`${toRepoPath(file)} must contain canonical_json and expected_sha256 strings`);
    continue;
  }
  const actual = createHash('sha256').update(vector.canonical_json, 'utf-8').digest('hex');
  if (actual !== vector.expected_sha256) {
    errors.push(
      `${toRepoPath(file)} expected_sha256 mismatch: expected ${vector.expected_sha256}, got ${actual}`,
    );
  }
}

if (errors.length > 0) {
  console.error(`FAIL - ${String(errors.length)} fixture error(s):`);
  for (const error of errors) {
    console.error(`  ${error}`);
  }
  process.exit(1);
}

console.log('PASS - Gate A fixture corpus is present, parseable, and internally consistent');
process.exit(0);
