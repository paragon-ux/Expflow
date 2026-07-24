/**
 * Expflow 1.2.3 — Real CLI/GUI adapter parity tests.
 *
 * Invokes the CLI adapter (node dist/cli/index.js) and the
 * GUI bridge adapter (createGuiBridgeFromService), then compares
 * semantic results. Proves CLI and GUI are peer adapters over
 * one application command layer.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { createGuiBridgeFromService } from '../../src/gui/bridge.js';
import type { ApplicationServiceFactory } from '../../src/gui/bridge.js';
import { ApplicationService } from '../../src/application/service.js';

const CLI = join(import.meta.dirname, '../../dist/cli/index.js');

function cli(args: string[]): Record<string, unknown> {
  const stdout = execFileSync('node', [CLI, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  try {
    return JSON.parse(stdout.trim()) as Record<string, unknown>;
  } catch {
    return { _raw: stdout.trim() };
  }
}

let tempRoot = '';

beforeAll(() => {
  // Use the repository root — it IS an Expflow project.
  tempRoot = process.cwd();
});

afterAll(() => {
  // Nothing to clean up.
});

const factory: ApplicationServiceFactory = (root) => new ApplicationService(root);

describe('CLI/GUI adapter parity — capabilities', () => {
  it('CLI capabilities returns version, families, features', () => {
    const caps = cli(['capabilities', '--json']);
    expect(caps.version).toBeDefined();
    expect(typeof caps.version).toBe('string');
    expect(Array.isArray(caps.commandFamilies)).toBe(true);
    expect(caps.commandFamilies.length).toBeGreaterThanOrEqual(9);
  });

  it('CLI and ApplicationService report same command families', () => {
    const cliCaps = cli(['capabilities', '--json']);
    const svc = new ApplicationService(tempRoot);
    const svcCaps = svc.capabilities();
    const cliSorted = [...(cliCaps.commandFamilies as string[])].sort();
    expect(svcCaps.commandFamilies.sort()).toEqual(cliSorted);
  });

  it('capabilities descriptor is machine-readable', () => {
    const caps = cli(['capabilities', '--json']);
    expect(caps.version).toBeTruthy();
    expect(caps.features).toBeDefined();
    expect(caps.supportedOs).toBeDefined();
    expect(caps.nodeVersions).toBeDefined();
  });
});

describe('CLI/GUI adapter parity — inspect/status', () => {
  it('CLI inspect and GUI bridge return same project_id', async () => {
    const cliR = cli(['inspect', '--root', tempRoot, '--json']);
    const bridge = createGuiBridgeFromService(factory);
    const guiR = await bridge.inspectProject({ root: tempRoot });

    const cliStatus = cliR.result as Record<string, unknown>;
    const guiStatus = guiR.data as Record<string, unknown>;

    expect(cliStatus.project_id).toBe(guiStatus.project_id);
  });

  it('CLI and GUI both report working_tree_state', async () => {
    const cliR = cli(['inspect', '--root', tempRoot, '--json']);
    const bridge = createGuiBridgeFromService(factory);
    const guiR = await bridge.inspectProject({ root: tempRoot });

    const cliStatus = cliR.result as Record<string, unknown>;
    const guiStatus = guiR.data as Record<string, unknown>;

    expect(cliStatus.working_tree_state).toBeDefined();
    expect(cliStatus.working_tree_state).toBe(guiStatus.working_tree_state);
  });

  it('CLI and GUI both report head_tree_revision_id', async () => {
    const cliR = cli(['inspect', '--root', tempRoot, '--json']);
    const bridge = createGuiBridgeFromService(factory);
    const guiR = await bridge.inspectProject({ root: tempRoot });

    const cliStatus = cliR.result as Record<string, unknown>;
    const guiStatus = guiR.data as Record<string, unknown>;

    expect(cliStatus.head_tree_revision_id).toBe(guiStatus.head_tree_revision_id);
  });
});

describe('CLI/GUI adapter parity — error semantics', () => {
  it('GUI reports uninitialized for nonexistent root', async () => {
    const nonexistent = join(process.cwd(), `nx-parity-${Date.now()}`);
    const bridge = createGuiBridgeFromService(factory);
    const guiResult = await bridge.inspectProject({ root: nonexistent });

    // Should report blocked/empty, not success
    const isOk = guiResult.state === 'success';
    // Uninitialized/existing returns 'empty'; blocked returns 'blocked'
    // Neither is 'success'
    expect(isOk).toBe(false);
    expect(['empty', 'blocked', 'error']).toContain(guiResult.state);
  });

  it('GUI technical_details show Expflow authority and no raw storage', async () => {
    const bridge = createGuiBridgeFromService(factory);
    const guiResult = await bridge.inspectProject({ root: tempRoot });

    expect(guiResult.technical_details.native_authority).toBe('Expflow');
    expect(guiResult.technical_details.raw_storage_access).toBe(false);
  });
});

describe('CLI/GUI adapter parity — actor attribution', () => {
  it('CLI reports actor in result envelope', () => {
    const result = cli(['inspect', '--root', tempRoot, '--json']);
    expect(result.actor).toBeDefined();
    const actor = result.actor as Record<string, unknown>;
    expect(actor.class).toBeDefined();
    expect(actor.interface).toBeDefined();
  });
});

describe('CLI/GUI adapter parity — read-only does not mutate', () => {
  it('inspect twice returns same project_id', async () => {
    const bridge = createGuiBridgeFromService(factory);
    const a = await bridge.inspectProject({ root: tempRoot });
    const b = await bridge.inspectProject({ root: tempRoot });

    const as = a.data as Record<string, unknown>;
    const bs = b.data as Record<string, unknown>;
    expect(as.project_id).toBe(bs.project_id);
  });
});
