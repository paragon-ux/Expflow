/**
 * Schema meta-validation - repository-contract test (V07).
 *
 * Meta-validates every supplied Draft 2020-12 JSON Schema using Ajv's real
 * Draft 2020-12 implementation. Unsupported or missing dialects fail loudly.
 */

import { Ajv2020 } from 'ajv/dist/2020.js';
import type { FormatsPlugin } from 'ajv-formats';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { isRecord } from './architecture-controls.js';
import { ARCHITECTURE_DIR } from '../../src/schemas/discovery.js';

const DRAFT_2020_12 = 'https://json-schema.org/draft/2020-12/schema';
const loadModule = createRequire(import.meta.url);
const addFormats = loadModule('ajv-formats') as FormatsPlugin;
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);

const schemasDir = resolve(ARCHITECTURE_DIR, 'schemas');
const schemaFiles = readdirSync(schemasDir)
  .filter((file) => file.endsWith('.schema.json'))
  .sort();

if (schemaFiles.length === 0) {
  console.error('FAIL - No schema files found');
  process.exit(1);
}

const errors: string[] = [];
let passed = 0;

for (const file of schemaFiles) {
  const path = resolve(schemasDir, file);
  let schema: unknown;

  try {
    schema = JSON.parse(readFileSync(path, 'utf-8')) as unknown;
  } catch (error) {
    errors.push(`PARSE ERROR: ${file} - ${String(error)}`);
    continue;
  }

  if (!isRecord(schema)) {
    errors.push(`INVALID SCHEMA: ${file} - top-level schema must be an object`);
    continue;
  }

  if (schema.$schema !== DRAFT_2020_12) {
    const declared = typeof schema.$schema === 'string' ? schema.$schema : 'not declared';
    errors.push(`UNSUPPORTED DIALECT: ${file} - ${declared}`);
    continue;
  }

  if (!ajv.validateSchema(schema)) {
    errors.push(`META-VALIDATION FAILED: ${file} - ${ajv.errorsText(ajv.errors)}`);
  } else {
    passed++;
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
  `PASS - ${String(passed)}/${String(schemaFiles.length)} schemas meta-validate as Draft 2020-12`,
);
process.exit(0);
