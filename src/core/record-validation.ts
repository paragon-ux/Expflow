import { ExpflowError } from './errors.js';
import type { ExpflowIdPrefix } from './ids.js';
import { assertSafeRelativePath } from './paths.js';
import type { RequestedBy } from '../material/types.js';

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

export function assertSha256Digest(value: string | undefined, field: string): void {
  if (value !== undefined && !SHA256_DIGEST.test(value)) {
    throw schemaInvalid(`${field} must be a sha256 digest.`);
  }
}

export function assertNonEmptyString(value: string, field: string): void {
  if (typeof value !== 'string' || value.length === 0) {
    throw schemaInvalid(`${field} must be a non-empty string.`);
  }
}

export function assertStringArray(
  value: readonly string[],
  field: string,
  options: { readonly minItems?: number } = {},
): void {
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
  if (typeof value !== 'object' || value === null) {
    throw schemaInvalid(`${field} must be an attribution object.`);
  }
  const record = value as Partial<RequestedBy>;
  if (typeof record.kind !== 'string') {
    throw schemaInvalid(`${field}.kind is required.`);
  }
  if (typeof record.name !== 'string') {
    throw schemaInvalid(`${field}.name is required.`);
  }
  assertEnum(record.kind, REQUESTED_BY_KINDS, `${field}.kind`);
  assertNonEmptyString(record.name, `${field}.name`);
}

export function assertPathSelectorShape(
  value: {
    readonly root?: string;
    readonly include: readonly string[];
    readonly exclude: readonly string[];
  },
  field: string,
): void {
  assertStringArray(value.include, `${field}.include`);
  assertStringArray(value.exclude, `${field}.exclude`);
  if (value.root !== undefined && value.root !== '.') {
    assertSafeRelativePath(value.root);
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
