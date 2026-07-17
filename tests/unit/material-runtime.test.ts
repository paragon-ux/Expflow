import { describe, expect, it } from 'vitest';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { hostname, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRuntime } from '../../src/operations/runtime.js';
import { ExpflowError } from '../../src/core/errors.js';
import {
  objectPathForDigest,
  readHead,
  readNodeRevision,
  readProject,
  readTreeRevision,
  storePaths,
  updateProjectHead,
  writeHead,
} from '../../src/material/store.js';

function tempProject(): string {
  return mkdtempSync(join(tmpdir(), 'expflow-gate-b-'));
}

function cleanup(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

function writeProjectFile(root: string, relativePath: string, content: string): void {
  const target = resolve(root, ...relativePath.split('/'));
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, content, 'utf-8');
}

describe('Gate B material runtime', () => {
  it('initializes immutable object, node, tree, head, and receipt stores', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'docs/a.txt', 'alpha');
      const runtime = createRuntime();

      const initReceipt = await runtime.init({ root });
      expect(initReceipt.status).toBe('committed');
      expect(initReceipt.new_head).toBe(readHead(root));

      const tree = readTreeRevision(root, initReceipt.new_head ?? '');
      expect(tree.entries).toHaveLength(1);
      expect(tree.entries[0]?.relative_path).toBe('docs/a.txt');

      const entry = tree.entries[0];
      expect(entry?.node_id).toBeTruthy();
      expect(entry?.node_revision).toBe(1);
      const node = readNodeRevision(root, entry?.node_id ?? '', entry?.node_revision ?? 0);
      expect(node.content_digest).toBe(entry?.node_content_digest);
      expect(readFileSync(objectPathForDigest(root, node.content_digest), 'utf-8')).toBe('alpha');

      const verify = await runtime.verify({ root });
      expect(verify.status).toBe('pass');
      const status = await runtime.status({ root });
      expect(status.working_tree_state).toBe('clean');
    } finally {
      cleanup(root);
    }
  });

  it('detects object corruption during material verification', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'alpha');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });
      const tree = readTreeRevision(root, initReceipt.new_head ?? '');
      const entry = tree.entries[0];
      const node = readNodeRevision(root, entry?.node_id ?? '', entry?.node_revision ?? 0);
      writeFileSync(objectPathForDigest(root, node.content_digest), 'corrupt', 'utf-8');

      const verify = await runtime.verify({ root });
      expect(verify.status).toBe('fail');
      expect(verify.findings[0]?.code).toBe('object_integrity_failed');
    } finally {
      cleanup(root);
    }
  });

  it('preserves same-path identity and supports explicit new-node override', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });
      const initialTree = readTreeRevision(root, initReceipt.new_head ?? '');
      const initialEntry = initialTree.entries[0];

      writeProjectFile(root, 'a.txt', 'two');
      const syncReceipt = await runtime.sync({ root });
      const samePathTree = readTreeRevision(root, syncReceipt.new_head ?? '');
      const samePathEntry = samePathTree.entries[0];
      expect(samePathEntry?.node_id).toBe(initialEntry?.node_id);
      expect(samePathEntry?.node_revision).toBe(2);

      writeProjectFile(root, 'a.txt', 'three');
      const newNodeReceipt = await runtime.sync({
        changes: [{ identity_directive: 'new', kind: 'modify', path: 'a.txt' }],
        root,
      });
      const newNodeTree = readTreeRevision(root, newNodeReceipt.new_head ?? '');
      const newNodeEntry = newNodeTree.entries[0];
      expect(newNodeEntry?.node_id).not.toBe(samePathEntry?.node_id);
      expect(newNodeEntry?.node_revision).toBe(1);
    } finally {
      cleanup(root);
    }
  });

  it('preserves identity only for explicit move directives and reports digest similarity otherwise', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'same');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });
      const initialTree = readTreeRevision(root, initReceipt.new_head ?? '');
      const initialNodeId = initialTree.entries[0]?.node_id;

      renameSync(resolve(root, 'a.txt'), resolve(root, 'b.txt'));
      const plan = await runtime.planSync({ root });
      expect(plan.identity_proposals).toHaveLength(1);
      const automaticMoveReceipt = await runtime.sync({ root });
      const automaticMoveTree = readTreeRevision(root, automaticMoveReceipt.new_head ?? '');
      expect(automaticMoveTree.entries[0]?.node_id).not.toBe(initialNodeId);

      renameSync(resolve(root, 'b.txt'), resolve(root, 'c.txt'));
      const explicitMoveReceipt = await runtime.sync({
        changes: [
          {
            from_path: 'b.txt',
            identity_directive: 'preserve',
            kind: 'move',
            path: 'c.txt',
          },
        ],
        root,
      });
      const explicitMoveTree = readTreeRevision(root, explicitMoveReceipt.new_head ?? '');
      expect(explicitMoveTree.entries[0]?.node_id).toBe(automaticMoveTree.entries[0]?.node_id);
      expect(explicitMoveTree.entries[0]?.node_revision).toBe(
        automaticMoveTree.entries[0]?.node_revision,
      );
    } finally {
      cleanup(root);
    }
  });

  it('rejects stale expected heads and preserves material success on partial post-commit failure', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });

      writeProjectFile(root, 'a.txt', 'two');
      await expect(
        runtime.sync({ expectedHead: 'eft_00000000000000000000000000', root }),
      ).rejects.toThrow(ExpflowError);

      const partialReceipt = await runtime.sync({
        expectedHead: initReceipt.new_head,
        root,
        simulatePostCommitFailure: true,
      });
      expect(partialReceipt.status).toBe('partial_post_commit');
      expect(readHead(root)).toBe(partialReceipt.new_head);
    } finally {
      cleanup(root);
    }
  });

  it('restores old tree revisions as new committed heads and cleans uncommitted staging', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });

      writeProjectFile(root, 'a.txt', 'two');
      writeProjectFile(root, 'b.txt', 'added later');
      await runtime.sync({ root });
      const restoreReceipt = await runtime.restore({
        reference: `tree:${initReceipt.new_head ?? ''}`,
        root,
      });

      expect(restoreReceipt.status).toBe('committed');
      expect(readFileSync(resolve(root, 'a.txt'), 'utf-8')).toBe('one');
      expect(existsSync(resolve(root, 'b.txt'))).toBe(false);
      expect(readHead(root)).toBe(restoreReceipt.new_head);
      const status = await runtime.status({ root });
      expect(status.working_tree_state).toBe('clean');

      mkdirSync(resolve(storePaths(root).staging, 'orphan'), { recursive: true });
      const recovery = await runtime.recover({ root });
      expect(recovery.findings[0]?.recovery_class).toBe('uncommitted_stage');
      expect(recovery.findings[0]?.repaired).toBe(true);
    } finally {
      cleanup(root);
    }
  });

  it('recovers a committed receipt when head advancement was interrupted', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });

      writeProjectFile(root, 'a.txt', 'two');
      const syncReceipt = await runtime.sync({ root });
      writeHead(root, initReceipt.new_head);
      updateProjectHead(root, initReceipt.new_head);

      const recovery = await runtime.recover({ root });
      expect(recovery.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            recovery_class: 'tree_committed_head_not_advanced',
            repaired: true,
          }),
        ]),
      );
      expect(readHead(root)).toBe(syncReceipt.new_head);
    } finally {
      cleanup(root);
    }
  });

  it('recovers sync from a real interruption after immutable material records commit', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });

      writeProjectFile(root, 'a.txt', 'two');
      await expect(
        runtime.sync({ root, simulateFailureAt: 'after_material_records' }),
      ).rejects.toThrow(ExpflowError);
      expect(readHead(root)).toBe(initReceipt.new_head);

      const recovery = await runtime.recover({ root });
      expect(recovery.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            recovery_class: 'tree_committed_head_not_advanced',
            repaired: true,
          }),
        ]),
      );
      expect(readHead(root)).not.toBe(initReceipt.new_head);
      expect((await runtime.status({ root })).working_tree_state).toBe('clean');
    } finally {
      cleanup(root);
    }
  });

  it('recovers interrupted init publication after material records commit', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();

      await expect(
        runtime.init({ root, simulateFailureAt: 'after_material_records' }),
      ).rejects.toThrow(ExpflowError);
      expect(existsSync(storePaths(root).project)).toBe(false);

      const recovery = await runtime.recover({ root });
      expect(recovery.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            recovery_class: 'init_publication_incomplete',
            repaired: true,
          }),
        ]),
      );
      expect(readProject(root).head_tree_revision_id).toBe(readHead(root));
      expect((await runtime.status({ root })).working_tree_state).toBe('clean');
    } finally {
      cleanup(root);
    }
  });

  it('recovers interrupted restore working-tree installation', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });

      writeProjectFile(root, 'a.txt', 'two');
      writeProjectFile(root, 'b.txt', 'added later');
      const laterReceipt = await runtime.sync({ root });

      await expect(
        runtime.restore({
          reference: `tree:${initReceipt.new_head ?? ''}`,
          root,
          simulateFailureAt: 'after_restore_delete',
        }),
      ).rejects.toThrow(ExpflowError);
      expect(readHead(root)).toBe(laterReceipt.new_head);
      expect(readFileSync(resolve(root, 'a.txt'), 'utf-8')).toBe('two');
      expect(existsSync(resolve(root, 'b.txt'))).toBe(false);

      const recovery = await runtime.recover({ root });
      expect(recovery.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            recovery_class: 'restore_working_tree_incomplete',
            repaired: true,
          }),
        ]),
      );
      expect(readFileSync(resolve(root, 'a.txt'), 'utf-8')).toBe('one');
      expect(existsSync(resolve(root, 'b.txt'))).toBe(false);
      expect((await runtime.status({ root })).working_tree_state).toBe('clean');
    } finally {
      cleanup(root);
    }
  });

  it('repairs project metadata when it diverges from HEAD', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });

      writeProjectFile(root, 'a.txt', 'two');
      const syncReceipt = await runtime.sync({ root });
      updateProjectHead(root, initReceipt.new_head);
      expect(readHead(root)).toBe(syncReceipt.new_head);
      expect(readProject(root).head_tree_revision_id).toBe(initReceipt.new_head);

      const recovery = await runtime.recover({ root });
      expect(recovery.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            recovery_class: 'material_head_diverged',
            repaired: true,
          }),
        ]),
      );
      expect(readProject(root).head_tree_revision_id).toBe(syncReceipt.new_head);
    } finally {
      cleanup(root);
    }
  });

  it('classifies stale and live project locks without age-based deletion', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();
      await runtime.init({ root });

      writeFileSync(
        storePaths(root).lock,
        JSON.stringify({
          acquired_at: new Date().toISOString(),
          host: hostname(),
          pid: 99999999,
          runtime: 'expflow-core',
        }),
        'utf-8',
      );
      const stale = await runtime.recover({ root });
      expect(stale.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ recovery_class: 'stale_lock', repaired: true }),
        ]),
      );
      expect(existsSync(storePaths(root).lock)).toBe(false);

      writeFileSync(
        storePaths(root).lock,
        JSON.stringify({
          acquired_at: new Date().toISOString(),
          host: hostname(),
          pid: process.pid,
          runtime: 'expflow-core',
        }),
        'utf-8',
      );
      const live = await runtime.recover({ root });
      expect(live.findings).toEqual([
        expect.objectContaining({ recovery_class: 'live_lock', repaired: false }),
      ]);
      expect(existsSync(storePaths(root).lock)).toBe(true);
    } finally {
      rmSync(storePaths(root).lock, { force: true });
      cleanup(root);
    }
  });

  it('limits scoped sync to selector roots while retaining out-of-scope entries', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'docs/a.txt', 'one');
      writeProjectFile(root, 'root.txt', 'one');
      const runtime = createRuntime();
      await runtime.init({ root });

      writeProjectFile(root, 'docs/a.txt', 'two');
      writeProjectFile(root, 'root.txt', 'two');
      const scope = { exclude: [], include: ['**/*'], root: 'docs' };
      const plan = await runtime.planSync({ root, scope });
      expect(plan.entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ relative_path: 'docs/a.txt' }),
          expect.objectContaining({ relative_path: 'root.txt' }),
        ]),
      );
      expect(plan.removed_paths).toEqual([]);
      expect(plan.new_node_revisions).toHaveLength(1);

      const scopedReceipt = await runtime.sync({ root, scope });
      const scopedTree = readTreeRevision(root, scopedReceipt.new_head ?? '');
      const docsEntry = scopedTree.entries.find((entry) => entry.relative_path === 'docs/a.txt');
      const rootEntry = scopedTree.entries.find((entry) => entry.relative_path === 'root.txt');
      expect(docsEntry?.node_revision).toBe(2);
      expect(rootEntry?.node_revision).toBe(1);

      const status = await runtime.status({ root });
      expect(status.working_tree_state).toBe('drifted');
    } finally {
      cleanup(root);
    }
  });
});
