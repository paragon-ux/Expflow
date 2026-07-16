/**
 * Example index check - repository-contract test (V08).
 *
 * Verifies every supplied example JSON file parses and every example path is
 * accounted for in EXAMPLE_INDEX.md. This does not claim schema conformance.
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { listFilesRecursively, toRepoPath } from './architecture-controls.js';
import { ARCHITECTURE_DIR } from '../../src/schemas/discovery.js';

const examplesDir = resolve(ARCHITECTURE_DIR, 'examples');
const exampleIndexPath = resolve(ARCHITECTURE_DIR, 'EXAMPLE_INDEX.md');

const exampleFiles = listFilesRecursively(examplesDir)
  .filter((file) => file.endsWith('.json'))
  .sort();

const errors: string[] = [];

if (exampleFiles.length === 0) {
  if (!existsSync(exampleIndexPath)) {
    errors.push('EXAMPLE_INDEX.md missing for empty example set');
  } else {
    const content = readFileSync(exampleIndexPath, 'utf-8');
    if (!content.includes('No supplied examples were discovered')) {
      errors.push('EXAMPLE_INDEX.md must state that no supplied examples were discovered');
    }
  }
} else {
  if (!existsSync(exampleIndexPath)) {
    errors.push('MISSING: docs/architecture/EXAMPLE_INDEX.md');
  } else {
    const content = readFileSync(exampleIndexPath, 'utf-8');
    for (const file of exampleFiles) {
      const repoPath = toRepoPath(file);
      if (!content.includes(`\`${repoPath}\``)) {
        errors.push(`EXAMPLE_INDEX.md missing path: ${repoPath}`);
      }
    }
  }
}

let parsed = 0;
for (const file of exampleFiles) {
  try {
    JSON.parse(readFileSync(file, 'utf-8'));
    parsed++;
  } catch (error) {
    errors.push(`PARSE ERROR: ${toRepoPath(file)} - ${String(error)}`);
  }
}

if (errors.length > 0) {
  console.error(`FAIL - ${String(errors.length)} error(s):`);
  for (const err of errors) {
    console.error(`  ${err}`);
  }
  process.exit(1);
}

console.log(
  `PASS - ${String(parsed)}/${String(exampleFiles.length)} examples parse and are indexed`,
);
process.exit(0);
