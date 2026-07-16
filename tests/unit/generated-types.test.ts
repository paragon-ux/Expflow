import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { CORE_SCHEMA_DESCRIPTORS } from '../../src/generated/schema-types.js';
import { ARCHITECTURE_DIR } from '../../src/schemas/discovery.js';

describe('generated schema descriptors', () => {
  it('cover every architecture schema file exactly once', () => {
    const schemaFiles = readdirSync(resolve(ARCHITECTURE_DIR, 'schemas'))
      .filter((file) => file.endsWith('.schema.json'))
      .sort();
    const descriptorFiles = CORE_SCHEMA_DESCRIPTORS.map((descriptor) => descriptor.file).sort();

    expect(descriptorFiles).toEqual(schemaFiles);
    expect(new Set(descriptorFiles).size).toBe(descriptorFiles.length);
  });

  it('use the Expflow 2.3 schema ID namespace', () => {
    for (const descriptor of CORE_SCHEMA_DESCRIPTORS) {
      expect(descriptor.id).toBe(`https://expflow.dev/schemas/2.3/${descriptor.file}`);
      expect(descriptor.typeName).toMatch(/^[A-Z][A-Za-z0-9]+$/);
    }
  });
});
