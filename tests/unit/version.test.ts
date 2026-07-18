import { describe, it, expect } from 'vitest';
import { VERSION } from '../../src/core/version.js';

describe('Package version', () => {
  it('exports the v1 release runtime version', () => {
    expect(VERSION).toBe('1.0.1');
  });
});
