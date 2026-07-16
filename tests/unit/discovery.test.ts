import { describe, it, expect } from 'vitest';
import {
  REPO_ROOT,
  ARCHITECTURE_DIR,
  SOURCE_MANIFEST_PATH,
  requiredArchitectureBasenames,
} from '../../src/schemas/discovery.js';
import { existsSync } from 'node:fs';

describe('Architecture source discovery', () => {
  it('REPO_ROOT points to an existing directory', () => {
    expect(existsSync(REPO_ROOT)).toBe(true);
  });

  it('ARCHITECTURE_DIR points to an existing directory', () => {
    expect(existsSync(ARCHITECTURE_DIR)).toBe(true);
  });

  it('SOURCE_MANIFEST_PATH points to an existing file', () => {
    expect(existsSync(SOURCE_MANIFEST_PATH)).toBe(true);
  });

  it('requiredArchitectureBasenames returns 9 sources', () => {
    const names = requiredArchitectureBasenames();
    expect(names).toHaveLength(9);
    expect(names).toContain('EXPFLOW_WORKFLOW_CURRENT.md');
    expect(names).toContain('EXPFLOW_CONCEPT_PAPER_V2_3.md');
    expect(names).toContain('Note-On-Architecture.md');
    expect(names).toContain('V2_3_REVIEW_RESOLUTION.md');
  });
});
