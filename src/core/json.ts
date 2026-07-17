import {
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { dirname } from 'node:path';

export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { readonly [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];

function normalizeForCanonicalJson(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    const arrayValue = value as readonly JsonValue[];
    return arrayValue.map((item) => normalizeForCanonicalJson(item));
  }

  if (typeof value === 'object' && value !== null) {
    const result: Record<string, JsonValue> = {};
    const record = value as JsonObject;
    for (const key of Object.keys(value).sort()) {
      result[key] = normalizeForCanonicalJson(record[key] ?? null);
    }
    return result;
  }

  return value;
}

export function canonicalJson(value: JsonValue): string {
  return JSON.stringify(normalizeForCanonicalJson(value));
}

export function prettyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function readJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf-8')) as unknown;
}

export function syncDirectory(path: string): void {
  try {
    const fd = openSync(path, 'r');
    try {
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
  } catch {
    // Directory fsync is not supported consistently on every filesystem/OS.
  }
}

export function writeJsonFileExclusive(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  const fd = openSync(path, 'wx');
  try {
    writeFileSync(fd, prettyJson(value), 'utf-8');
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  syncDirectory(dirname(path));
}

export function writeJsonFileAtomic(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  const tempPath = `${path}.${String(process.pid)}.${String(Date.now())}.tmp`;
  const fd = openSync(tempPath, 'w');
  try {
    writeFileSync(fd, prettyJson(value), 'utf-8');
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  renameSync(tempPath, path);
  syncDirectory(dirname(path));
}

export function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
