import { describe, it, expect } from 'vitest';
import { VERSION } from '../../src/core/version.js';

describe('Package scaffolding', () => {
  it('exports the correct Phase 1 version', () => {
    expect(VERSION).toBe('0.0.0-phase.1');
  });
});
