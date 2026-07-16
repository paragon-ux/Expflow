/**
 * Schema/example validation parity for Gate A.
 *
 * Validates supplied architecture examples and contract fixtures with AJV.
 */

import { Ajv2020 } from 'ajv/dist/2020.js';
import type { FormatsPlugin } from 'ajv-formats';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, resolve } from 'node:path';
import { listFilesRecursively, toRepoPath } from './architecture-controls.js';
import { ARCHITECTURE_DIR, REPO_ROOT } from '../../src/schemas/discovery.js';

const loadModule = createRequire(import.meta.url);
const addFormats = loadModule('ajv-formats') as FormatsPlugin;

const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf-8')) as unknown;
}

function schemaFileForExample(exampleName: string): string {
  return exampleName
    .replace(/-unified\.example\.json$/, '.schema.json')
    .replace(/-deterministic\.example\.json$/, '.schema.json')
    .replace(/-model\.example\.json$/, '.schema.json')
    .replace(/\.example\.json$/, '.schema.json');
}

function schemaId(schemaFile: string): string {
  return `https://expflow.dev/schemas/2.3/${schemaFile}`;
}

const schemasDir = resolve(ARCHITECTURE_DIR, 'schemas');
for (const file of readdirSync(schemasDir).filter((file) => file.endsWith('.schema.json'))) {
  const schema = readJson(resolve(schemasDir, file));
  ajv.addSchema(schema);
}

const errors: string[] = [];
let validated = 0;

const exampleFiles = listFilesRecursively(resolve(ARCHITECTURE_DIR, 'examples')).filter((file) =>
  file.endsWith('.example.json'),
);
for (const examplePath of exampleFiles) {
  const schema = ajv.getSchema(schemaId(schemaFileForExample(basename(examplePath))));
  if (!schema) {
    errors.push(`No schema found for example ${toRepoPath(examplePath)}`);
    continue;
  }
  const valid = schema(readJson(examplePath));
  if (!valid) {
    errors.push(
      `${toRepoPath(examplePath)} failed schema validation: ${ajv.errorsText(schema.errors)}`,
    );
  } else {
    validated++;
  }
}

const validFixtureDir = resolve(REPO_ROOT, 'tests/fixtures/contracts/valid');
if (existsSync(validFixtureDir)) {
  for (const fixturePath of listFilesRecursively(validFixtureDir).filter((file) =>
    file.endsWith('.json'),
  )) {
    const parsed = readJson(fixturePath);
    const schemaFile = `${basename(fixturePath).replace(/\.valid\.json$/, '')}.schema.json`;
    const schema = ajv.getSchema(schemaId(schemaFile));
    if (!schema) {
      errors.push(`No schema found for valid fixture ${toRepoPath(fixturePath)}`);
      continue;
    }
    if (!schema(parsed)) {
      errors.push(
        `${toRepoPath(fixturePath)} failed schema validation: ${ajv.errorsText(schema.errors)}`,
      );
    } else {
      validated++;
    }
  }
}

const invalidFixtureDir = resolve(REPO_ROOT, 'tests/fixtures/contracts/invalid');
if (existsSync(invalidFixtureDir)) {
  for (const fixturePath of listFilesRecursively(invalidFixtureDir).filter((file) =>
    file.endsWith('.json'),
  )) {
    const parsed = readJson(fixturePath);
    const schemaFile = `${basename(fixturePath).replace(/\.invalid\.json$/, '')}.schema.json`;
    const schema = ajv.getSchema(schemaId(schemaFile));
    if (!schema) {
      errors.push(`No schema found for invalid fixture ${toRepoPath(fixturePath)}`);
      continue;
    }
    if (schema(parsed)) {
      errors.push(`${toRepoPath(fixturePath)} unexpectedly passed schema validation`);
    } else {
      validated++;
    }
  }
}

if (errors.length > 0) {
  console.error(`FAIL - ${String(errors.length)} schema example validation error(s):`);
  for (const error of errors) {
    console.error(`  ${error}`);
  }
  process.exit(1);
}

console.log(`PASS - ${String(validated)} examples and fixtures matched expected schema outcomes`);
process.exit(0);
