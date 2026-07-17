import { describe, it, expect } from 'vitest';
import { VERSION } from '../../src/core/version.js';

describe('Package version', () => {
  it('exports the Gate B runtime version', () => {
    expect(VERSION).toBe('0.0.0-gate-b');
  });
});
