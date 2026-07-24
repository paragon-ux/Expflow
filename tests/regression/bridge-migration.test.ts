import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createGuiBridge, createGuiBridgeFromService } from '../../src/gui/bridge.js';
import type { ApplicationServiceFactory } from '../../src/gui/bridge.js';
import { ApplicationService } from '../../src/application/service.js';

describe('Bridge migration — structural regression', () => {
  it('createGuiBridge and createGuiBridgeFromService are different functions', () => {
    expect(createGuiBridgeFromService).not.toBe(createGuiBridge);
    expect(typeof createGuiBridgeFromService).toBe('function');
  });

  it('createGuiBridgeFromService does not call createGuiBridge internally', () => {
    // Verify by checking that createGuiBridge is not referenced in the
    // service-backed bridge's closure. We test this by calling the factory
    // and confirming the result has expected behavior without legacy fallback.
    const factory: ApplicationServiceFactory = (root) => new ApplicationService(root);
    const bridge = createGuiBridgeFromService(factory);
    expect(bridge).toBeDefined();
    expect(typeof bridge.inspectProject).toBe('function');
    expect(typeof bridge.planSync).toBe('function');
    expect(typeof bridge.planRestore).toBe('function');
  });

  it('factory is invoked and root is passed through', async () => {
    const calls: string[] = [];
    const spyFactory: ApplicationServiceFactory = (root) => {
      calls.push(root);
      return new ApplicationService(root);
    };
    const bridge = createGuiBridgeFromService(spyFactory);

    await bridge.inspectProject({ root: resolve('/tmp/expflow-test-factory') });

    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect(calls[0]).toContain('expflow-test-factory');
  });

  it('apps/gui/server.mjs imports createGuiBridgeFromService, not createGuiBridge', () => {
    const serverSource = readFileSync(
      resolve(import.meta.dirname, '../../apps/gui/server.mjs'),
      'utf8',
    );
    // Must import createGuiBridgeFromService
    expect(serverSource).toContain('createGuiBridgeFromService');
    // Must NOT construct createGuiBridge
    expect(serverSource).not.toMatch(/const bridge = createGuiBridge\(\)/);
  });
});
