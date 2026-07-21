import { describe, expect, it } from 'vitest';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRuntime } from '../../src/operations/runtime.js';
import { buildRestorePlan } from '../../src/operations/restore-plan.js';
import { readHead, readTreeRevision, storePaths } from '../../src/material/store.js';

function tempProject(): string {
  return mkdtempSync(join(tmpdir(), 'expflow-restore-safety-'));
}

function cleanup(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

function writeProjectFile(root: string, relativePath: string, content: string): void {
  const target = resolve(root, ...relativePath.split('/'));
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, content, 'utf-8');
}

describe('restore planning and safety', () => {
  it('classifies tree restore path effects against a clean working tree', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      writeProjectFile(root, 'b.txt', 'two');
      writeProjectFile(root, 'c.txt', 'three');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });

      writeProjectFile(root, 'a.txt', 'one-v2');
      rmSync(resolve(root, 'b.txt'));
      writeProjectFile(root, 'd.txt', 'added later');
      await runtime.sync({ root });
      rmSync(resolve(root, 'd.txt'));

      const plan = buildRestorePlan(root, `tree:${initReceipt.new_head ?? ''}`);
      expect(plan.reference_kind).toBe('tree');
      expect(plan.source_ref).toBe(initReceipt.new_head);
      expect(plan.forward_commit).toBe(true);
      expect(plan.requires_force).toBe(false);
      expect(plan.conflicting_paths).toEqual([]);

      const effects = new Map(plan.path_effects.map((effect) => [effect.relative_path, effect]));
      expect(effects.get('a.txt')?.effect).toBe('update');
      expect(effects.get('a.txt')?.drift_kind).toBeNull();
      expect(effects.get('b.txt')?.effect).toBe('create');
      expect(effects.get('b.txt')?.drift_kind).toBeNull();
      expect(effects.get('d.txt')?.effect).toBe('remove');
      expect(effects.get('d.txt')?.drift_kind).toBe('removed');
      expect(effects.get('d.txt')?.conflicting).toBe(false);
      expect(effects.has('c.txt')).toBe(false);
    } finally {
      cleanup(root);
    }
  });

  it('flags conflicting drift and lists preserved unrelated local work', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      writeProjectFile(root, 'keep.txt', 'keep');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });

      writeProjectFile(root, 'a.txt', 'two');
      await runtime.sync({ root });
      writeProjectFile(root, 'a.txt', 'local');
      writeProjectFile(root, 'keep.txt', 'keep-local');
      writeProjectFile(root, 'scratch.txt', 'scratch');

      const plan = buildRestorePlan(root, `tree:${initReceipt.new_head ?? ''}`);
      expect(plan.requires_force).toBe(true);
      expect(plan.conflicting_paths).toEqual(['a.txt']);
      expect(plan.preserved_drift_paths).toEqual(['keep.txt', 'scratch.txt']);

      const effects = new Map(plan.path_effects.map((effect) => [effect.relative_path, effect]));
      expect(effects.get('a.txt')?.effect).toBe('update');
      expect(effects.get('a.txt')?.drift_kind).toBe('modified');
      expect(effects.get('a.txt')?.conflicting).toBe(true);
      expect(effects.get('keep.txt')?.effect).toBe('unchanged');
      expect(effects.get('keep.txt')?.drift_kind).toBe('modified');
      expect(effects.get('keep.txt')?.conflicting).toBe(false);
      expect(effects.has('scratch.txt')).toBe(false);
    } finally {
      cleanup(root);
    }
  });

  it('flags an unrecorded working file at a restore create path only when bytes differ', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'g.txt', 'orig');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });

      rmSync(resolve(root, 'g.txt'));
      await runtime.sync({ root });

      writeProjectFile(root, 'g.txt', 'orig');
      const noConflict = buildRestorePlan(root, `tree:${initReceipt.new_head ?? ''}`);
      expect(noConflict.path_effects[0]?.effect).toBe('create');
      expect(noConflict.requires_force).toBe(false);

      writeProjectFile(root, 'g.txt', 'unrecorded');
      const conflict = buildRestorePlan(root, `tree:${initReceipt.new_head ?? ''}`);
      expect(conflict.conflicting_paths).toEqual(['g.txt']);
      expect(conflict.requires_force).toBe(true);
    } finally {
      cleanup(root);
    }
  });

  it('rejects invalid restore references with a remediation message', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();
      await runtime.init({ root });

      expect(() => buildRestorePlan(root, 'node:not-a-reference')).toThrow(/Valid syntax/);
      expect(() => buildRestorePlan(root, 'bogus:xyz')).toThrow(/Unsupported restore reference/);
    } finally {
      cleanup(root);
    }
  });

  it('refuses restore over conflicting drift without mutating working tree, head, or store', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      writeProjectFile(root, 'keep.txt', 'keep');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });

      writeProjectFile(root, 'a.txt', 'two');
      const syncReceipt = await runtime.sync({ root });
      writeProjectFile(root, 'a.txt', 'local');
      writeProjectFile(root, 'keep.txt', 'keep-local');
      writeProjectFile(root, 'scratch.txt', 'scratch');
      const headBefore = readHead(root);

      await expect(
        runtime.restore({ reference: `tree:${initReceipt.new_head ?? ''}`, root }),
      ).rejects.toMatchObject({ code: 'restore_conflict', recoverable: true });

      expect(readFileSync(resolve(root, 'a.txt'), 'utf-8')).toBe('local');
      expect(readFileSync(resolve(root, 'keep.txt'), 'utf-8')).toBe('keep-local');
      expect(readFileSync(resolve(root, 'scratch.txt'), 'utf-8')).toBe('scratch');
      expect(readHead(root)).toBe(headBefore);
      expect(readHead(root)).toBe(syncReceipt.new_head);
      expect(existsSync(storePaths(root).lock)).toBe(false);
      expect(
        readdirSync(storePaths(root).recovery).filter((file) => file.endsWith('.json')),
      ).toEqual([]);
      expect(
        readdirSync(storePaths(root).treeRevisions).filter((file) => file.endsWith('.json')),
      ).toHaveLength(2);
    } finally {
      cleanup(root);
    }
  });

  it('overwrites conflicting drift only with overwrite and stays append-only', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      writeProjectFile(root, 'keep.txt', 'keep');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });

      writeProjectFile(root, 'a.txt', 'two');
      const syncReceipt = await runtime.sync({ root });
      writeProjectFile(root, 'a.txt', 'local');
      writeProjectFile(root, 'keep.txt', 'keep-local');
      writeProjectFile(root, 'scratch.txt', 'scratch');

      const receipt = await runtime.restore({
        overwrite: true,
        reference: `tree:${initReceipt.new_head ?? ''}`,
        root,
      });
      expect(receipt.status).toBe('committed');
      expect(receipt.warnings).toContain('overwrote_unrecorded_changes');
      expect(receipt.previous_head).toBe(syncReceipt.new_head);

      expect(readFileSync(resolve(root, 'a.txt'), 'utf-8')).toBe('one');
      expect(readFileSync(resolve(root, 'keep.txt'), 'utf-8')).toBe('keep-local');
      expect(readFileSync(resolve(root, 'scratch.txt'), 'utf-8')).toBe('scratch');

      expect(readHead(root)).toBe(receipt.new_head);
      expect(receipt.new_head).not.toBe(syncReceipt.new_head);
      const restoredTree = readTreeRevision(root, receipt.new_head ?? '');
      expect(restoredTree.parent_tree_revision_id).toBe(syncReceipt.new_head);
      expect(restoredTree.source).toBe('restore');
      expect(readTreeRevision(root, syncReceipt.new_head ?? '').tree_revision_id).toBe(
        syncReceipt.new_head,
      );
    } finally {
      cleanup(root);
    }
  });

  it('preserves unrelated drift byte-for-byte across a default tree restore', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      writeProjectFile(root, 'keep.txt', 'keep');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });

      writeProjectFile(root, 'a.txt', 'two');
      await runtime.sync({ root });
      writeProjectFile(root, 'keep.txt', 'keep-local');

      const receipt = await runtime.restore({
        reference: `tree:${initReceipt.new_head ?? ''}`,
        root,
      });
      expect(receipt.status).toBe('committed');
      expect(receipt.warnings).not.toContain('overwrote_unrecorded_changes');
      expect(readFileSync(resolve(root, 'a.txt'), 'utf-8')).toBe('one');
      expect(readFileSync(resolve(root, 'keep.txt'), 'utf-8')).toBe('keep-local');
    } finally {
      cleanup(root);
    }
  });

  it('previews, refuses, overwrites, and recreates files for node restores', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();
      await runtime.init({ root });

      writeProjectFile(root, 'a.txt', 'two');
      const syncReceipt = await runtime.sync({ root });
      const headTree = readTreeRevision(root, syncReceipt.new_head ?? '');
      const entry = headTree.entries.find((candidate) => candidate.relative_path === 'a.txt');
      const nodeId = entry?.node_id ?? '';
      const reference = `node:${nodeId}@1:a.txt`;

      const preview = buildRestorePlan(root, reference);
      expect(preview.reference_kind).toBe('node');
      expect(preview.source_ref).toBe(`${nodeId}@1`);
      expect(preview.path_effects).toEqual([
        {
          conflicting: false,
          drift_kind: null,
          effect: 'update',
          relative_path: 'a.txt',
        },
      ]);
      expect(preview.requires_force).toBe(false);

      writeProjectFile(root, 'a.txt', 'local');
      const conflicted = buildRestorePlan(root, reference);
      expect(conflicted.requires_force).toBe(true);
      expect(conflicted.conflicting_paths).toEqual(['a.txt']);
      expect(conflicted.path_effects[0]?.drift_kind).toBe('modified');
      const headBefore = readHead(root);
      await expect(runtime.restore({ reference, root })).rejects.toMatchObject({
        code: 'restore_conflict',
      });
      expect(readFileSync(resolve(root, 'a.txt'), 'utf-8')).toBe('local');
      expect(readHead(root)).toBe(headBefore);

      const overwritten = await runtime.restore({ overwrite: true, reference, root });
      expect(overwritten.warnings).toContain('overwrote_unrecorded_changes');
      expect(readFileSync(resolve(root, 'a.txt'), 'utf-8')).toBe('one');

      rmSync(resolve(root, 'a.txt'));
      const recreated = buildRestorePlan(root, reference);
      expect(recreated.path_effects[0]?.drift_kind).toBe('removed');
      expect(recreated.requires_force).toBe(false);
      const receipt = await runtime.restore({ reference, root });
      expect(receipt.status).toBe('committed');
      expect(receipt.warnings).not.toContain('overwrote_unrecorded_changes');
      expect(readFileSync(resolve(root, 'a.txt'), 'utf-8')).toBe('one');
    } finally {
      cleanup(root);
    }
  });
});
