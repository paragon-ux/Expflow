import { writeFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import {
  collectImmutableSourceEntries,
  isRecord,
  readJsonFile,
  type SourceManifest,
} from './architecture-controls.js';
import { ARCHITECTURE_DIR, REPO_ROOT } from '../../src/schemas/discovery.js';

const manifest: SourceManifest = {
  algorithm: 'sha256',
  generated_by: 'Expflow Phase 1 repository-contract tooling',
  entries: collectImmutableSourceEntries(),
};

writeFileSync(
  resolve(ARCHITECTURE_DIR, 'SOURCE_MANIFEST.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf-8',
);

function declaredJsonField(repoPath: string, field: '$schema' | '$id'): string {
  const parsed = readJsonFile(resolve(REPO_ROOT, repoPath));
  if (!isRecord(parsed) || typeof parsed[field] !== 'string') {
    return 'not declared';
  }
  return parsed[field];
}

const schemaRows = manifest.entries.filter((entry) =>
  entry.path.startsWith('docs/architecture/schemas/'),
);
const exampleRows = manifest.entries.filter((entry) =>
  entry.path.startsWith('docs/architecture/examples/'),
);

const schemaIndex = [
  '# Schema Index',
  '',
  '**Generated:** Phase 1 repository-contract tooling',
  '**Status:** This index is a generated contract-control file, not an architecture source.',
  '',
  '## Schema Inventory',
  '',
  '| Path | Declared `$schema` | Declared `$id` | Bytes | SHA-256 |',
  '|---|---|---|---:|---|',
  ...schemaRows.map((entry) => {
    const declaredSchema = declaredJsonField(entry.path, '$schema');
    const declaredId = declaredJsonField(entry.path, '$id');
    return `| \`${entry.path}\` | \`${declaredSchema}\` | \`${declaredId}\` | ${String(entry.bytes)} | \`${entry.sha256}\` |`;
  }),
  '',
  '## Notes',
  '',
  '- Entries are sorted by repository-relative path.',
  '- This file contains no interpretation of schema semantics.',
  '',
].join('\n');

writeFileSync(resolve(ARCHITECTURE_DIR, 'SCHEMA_INDEX.md'), schemaIndex, 'utf-8');

const exampleIndex =
  exampleRows.length === 0
    ? [
        '# Example Index',
        '',
        '**Generated:** Phase 1 repository-contract tooling',
        '**Status:** This index is a generated contract-control file, not an architecture source.',
        '',
        'No supplied examples were discovered.',
        '',
      ].join('\n')
    : [
        '# Example Index',
        '',
        '**Generated:** Phase 1 repository-contract tooling',
        '**Status:** This index is a generated contract-control file, not an architecture source.',
        '',
        '## Example Inventory',
        '',
        '| Path | File type | Bytes | SHA-256 |',
        '|---|---|---:|---|',
        ...exampleRows.map(
          (entry) =>
            `| \`${entry.path}\` | \`${extname(entry.path) || 'not declared'}\` | ${String(entry.bytes)} | \`${entry.sha256}\` |`,
        ),
        '',
        '## Notes',
        '',
        '- Entries are sorted by repository-relative path.',
        '- This file does not claim that examples conform to schemas.',
        '',
      ].join('\n');

writeFileSync(resolve(ARCHITECTURE_DIR, 'EXAMPLE_INDEX.md'), exampleIndex, 'utf-8');

console.log(`Generated SOURCE_MANIFEST.json with ${String(manifest.entries.length)} entries`);
console.log(`Generated SCHEMA_INDEX.md with ${String(schemaRows.length)} entries`);
console.log(`Generated EXAMPLE_INDEX.md with ${String(exampleRows.length)} entries`);
