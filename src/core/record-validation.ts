import { ExpflowError } from './errors.js';
import type { ExpflowIdPrefix } from './ids.js';
import { assertSafeRelativePath } from './paths.js';
import type { PathSelectorRecord, RequestedBy } from '../material/types.js';

const ID_SUFFIX = '[0-9A-HJKMNP-TV-Z]{26}';
const SOURCE_REVISION_REF = new RegExp(`^efs_${ID_SUFFIX}@[1-9][0-9]*$`);
const SHA256_DIGEST = /^sha256:[a-f0-9]{64}$/;
const REQUESTED_BY_KINDS = ['user', 'agent', 'policy', 'integration', 'model', 'system'] as const;

export function expflowIdPattern(prefix: ExpflowIdPrefix): RegExp {
  return new RegExp(`^${prefix}_${ID_SUFFIX}$`);
}

export function assertExpflowId(value: string, prefix: ExpflowIdPrefix, field: string): void {
  assertPattern(value, expflowIdPattern(prefix), field);
}

export function assertSourceRevisionRef(value: string, field: string): void {
  assertPattern(value, SOURCE_REVISION_REF, field);
}

export function assertSha256Digest(value: unknown, field: string): void {
  if (value !== undefined) {
    assertRequiredSha256Digest(value, field);
  }
}

export function assertRequiredSha256Digest(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !SHA256_DIGEST.test(value)) {
    throw schemaInvalid(`${field} must be a sha256 digest.`);
  }
}

export function assertNonEmptyString(value: string, field: string): void {
  if (typeof value !== 'string' || value.length === 0) {
    throw schemaInvalid(`${field} must be a non-empty string.`);
  }
}

export function assertStringArray(
  value: unknown,
  field: string,
  options: { readonly minItems?: number } = {},
): asserts value is readonly string[] {
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== 'string') ||
    value.length < (options.minItems ?? 0)
  ) {
    throw schemaInvalid(`${field} must be a string array.`);
  }
}

export function assertDateTime(value: string | null | undefined, field: string): void {
  if (value === null || value === undefined) {
    return;
  }
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw schemaInvalid(`${field} must be a date-time string.`);
  }
}

export function assertEnum<T extends string>(
  value: string,
  allowed: readonly T[],
  field: string,
): asserts value is T {
  if (!allowed.includes(value as T)) {
    throw schemaInvalid(`${field} is not an allowed value.`);
  }
}

export function assertRequestedBy(value: unknown, field: string): asserts value is RequestedBy {
  assertNoAdditionalProperties(value, ['kind', 'name', 'version', 'model'], field);
  const record = value as Partial<RequestedBy>;
  if (typeof record.kind !== 'string') {
    throw schemaInvalid(`${field}.kind is required.`);
  }
  if (typeof record.name !== 'string') {
    throw schemaInvalid(`${field}.name is required.`);
  }
  assertEnum(record.kind, REQUESTED_BY_KINDS, `${field}.kind`);
  assertNonEmptyString(record.name, `${field}.name`);
  assertOptionalStringOrNull(record.version, `${field}.version`);
  assertOptionalStringOrNull(record.model, `${field}.model`);
}

export function assertNoAdditionalProperties(
  value: unknown,
  allowedKeys: readonly string[],
  field: string,
): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw schemaInvalid(`${field} must be an object.`);
  }
  const allowed = new Set(allowedKeys);
  const extraKeys = Object.keys(value).filter((key) => !allowed.has(key));
  if (extraKeys.length > 0) {
    throw schemaInvalid(
      `${field} must not contain additional properties: ${extraKeys.join(', ')}.`,
    );
  }
}

export function assertPathSelectorShape(
  value: unknown,
  field: string,
): asserts value is PathSelectorRecord {
  assertNoAdditionalProperties(value, ['include', 'exclude', 'root', 'description'], field);
  const record = value as Partial<PathSelectorRecord>;
  assertStringArray(record.include, `${field}.include`);
  assertStringArray(record.exclude, `${field}.exclude`);
  assertOptionalStringOrNull(record.description, `${field}.description`);
  if (record.root !== undefined) {
    if (typeof record.root !== 'string') {
      throw schemaInvalid(`${field}.root must be a string.`);
    }
    if (record.root !== '.') {
      assertSafeRelativePath(record.root);
    }
  }
}

export function schemaInvalid(message: string): ExpflowError {
  return new ExpflowError('schema_invalid', message);
}

function assertPattern(value: string, pattern: RegExp, field: string): void {
  if (typeof value !== 'string' || !pattern.test(value)) {
    throw schemaInvalid(`${field} does not match the required pattern.`);
  }
}

function assertOptionalStringOrNull(value: unknown, field: string): void {
  if (value !== undefined && value !== null && typeof value !== 'string') {
    throw schemaInvalid(`${field} must be a string or null.`);
  }
}
