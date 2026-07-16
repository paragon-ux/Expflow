/**
 * Core registry verification for Gate A.
 *
 * Verifies machine-readable registries against immutable architecture schema
 * inventory and the current workflow gate model. This is contract validation,
 * not runtime configuration loading.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { isRecord } from './architecture-controls.js';
import { ARCHITECTURE_DIR, REPO_ROOT } from '../../src/schemas/discovery.js';

const registryPath = resolve(REPO_ROOT, 'registries/core-contracts.json');
const decisionsPath = resolve(REPO_ROOT, 'registries/decision-vectors.json');
const expectedCommands = ['init', 'sync', 'status', 'restore'];
const expectedGateAPhases = [1, 2, 3, 4];
const expectedFutureDecisionSlots = [
  'DS-B-IDENTIFIERS',
  'DS-B-STORAGE-ATOMICITY',
  'DS-C-SEMANTIC-TRUST',
  'DS-D-SECURITY-PROFILES',
];
const requiredDeferredContracts = [
  'external_inspection_protocol',
  'composite_project_revision_tokens',
  'incremental_change_cursors',
  'adapter_request_canonicalization',
  'adapter_idempotency',
  'lost_response_reconciliation',
  'capability_policy',
  'writer_partitioning',
  'adapter_operation_attempts',
  'adapter_operation_outcomes',
];
const requiredErrorCodes = [
  'project_not_initialized',
  'project_already_initialized',
  'project_locked',
  'stale_head',
  'unsafe_relative_path',
  'duplicate_path',
  'symlink_rejected',
  'archive_rejected',
  'object_integrity_failed',
  'node_revision_missing',
  'tree_revision_missing',
  'object_missing',
  'schema_invalid',
  'validation_failed',
  'hook_failed',
  'hook_timeout',
  'hook_output_invalid',
  'authority_source_unaccepted',
  'authority_scope_conflict',
  'semantic_conflict',
  'review_required',
  'projection_self_observation',
  'manifest_projection_failed',
  'manifest_acceptance_required',
  'restore_conflict',
  'idempotency_conflict',
  'license_restriction',
  'privacy_policy_violation',
  'operation_recovery_required',
  'internal_error',
];

function fail(message: string): never {
  throw new Error(message);
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf-8')) as unknown;
}

function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    fail(`${label} must be an array of strings`);
  }
  return value;
}

function numberArray(value: unknown, label: string): number[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'number')) {
    fail(`${label} must be an array of numbers`);
  }
  return value;
}

function assertSameSet(actual: string[], expected: string[], label: string): void {
  const actualSorted = [...actual].sort();
  const expectedSorted = [...expected].sort();
  if (actualSorted.join('\0') !== expectedSorted.join('\0')) {
    fail(
      `${label} mismatch: expected ${expectedSorted.join(', ')}, got ${actualSorted.join(', ')}`,
    );
  }
}

const errors: string[] = [];

try {
  if (!existsSync(registryPath)) {
    fail('Missing registries/core-contracts.json');
  }
  if (!existsSync(decisionsPath)) {
    fail('Missing registries/decision-vectors.json');
  }

  const registry = readJson(registryPath);
  if (!isRecord(registry)) {
    fail('core-contracts registry must be an object');
  }

  if (registry.schema_version !== '2.3') {
    fail('core-contracts schema_version must be 2.3');
  }
  if (registry.workflow_ssot !== 'docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md') {
    fail('core-contracts workflow_ssot must reference EXPFLOW_WORKFLOW_CURRENT.md');
  }

  assertSameSet(
    stringArray(registry.ordinary_commands, 'ordinary_commands'),
    expectedCommands,
    'ordinary commands',
  );
  const gateAPhases = numberArray(registry.gate_a_phases, 'gate_a_phases');
  if (gateAPhases.join(',') !== expectedGateAPhases.join(',')) {
    fail(`gate_a_phases must be ${expectedGateAPhases.join(',')}`);
  }

  const schemaFiles = readdirSync(resolve(ARCHITECTURE_DIR, 'schemas'))
    .filter((file) => file.endsWith('.schema.json'))
    .sort()
    .map((file) => `docs/architecture/schemas/${file}`);
  assertSameSet(
    stringArray(registry.core_schema_files, 'core_schema_files'),
    schemaFiles,
    'core schema files',
  );
  assertSameSet(
    stringArray(registry.deferred_adapter_contracts, 'deferred_adapter_contracts'),
    requiredDeferredContracts,
    'deferred adapter contracts',
  );
  assertSameSet(
    stringArray(registry.error_codes, 'error_codes'),
    requiredErrorCodes,
    'error codes',
  );

  const decisions = readJson(decisionsPath);
  if (!isRecord(decisions) || !Array.isArray(decisions.decisions)) {
    fail('decision-vectors registry must contain a decisions array');
  }
  const ids = decisions.decisions.map((decision: unknown) => {
    if (!isRecord(decision) || typeof decision.id !== 'string') {
      fail('each decision vector must contain a string id');
    }
    return decision.id;
  });
  const expectedIds = Array.from(
    { length: 20 },
    (_, index) => `AD-${String(index + 1).padStart(3, '0')}`,
  );
  assertSameSet(ids, expectedIds, 'decision vector IDs');

  if (!Array.isArray(decisions.future_decision_slots)) {
    fail('decision-vectors registry must contain a future_decision_slots array');
  }
  const slotIds = decisions.future_decision_slots.map((slot: unknown) => {
    if (!isRecord(slot) || typeof slot.id !== 'string') {
      fail('each future decision slot must contain a string id');
    }
    if (typeof slot.owning_gate !== 'string' || !['B', 'C', 'D'].includes(slot.owning_gate)) {
      fail(`future decision slot ${slot.id} must identify owning_gate B, C, or D`);
    }
    if (typeof slot.summary !== 'string' || slot.summary.length === 0) {
      fail(`future decision slot ${slot.id} must contain a summary`);
    }
    const constraints = stringArray(
      slot.constraints,
      `future decision slot ${slot.id} constraints`,
    );
    if (constraints.length === 0) {
      fail(`future decision slot ${slot.id} must contain at least one constraint`);
    }
    return slot.id;
  });
  assertSameSet(slotIds, expectedFutureDecisionSlots, 'future decision slot IDs');
} catch (error) {
  errors.push(String(error instanceof Error ? error.message : error));
}

if (errors.length > 0) {
  console.error(`FAIL - ${String(errors.length)} registry error(s):`);
  for (const error of errors) {
    console.error(`  ${error}`);
  }
  process.exit(1);
}

console.log('PASS - Core registries match Gate A workflow and schema inventory');
process.exit(0);
