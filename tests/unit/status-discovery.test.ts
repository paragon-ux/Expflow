import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRuntime } from '../../src/operations/runtime.js';
import { summarizeChangeKinds } from '../../src/material/changes.js';
import { readHead, readTreeRevision, storePaths } from '../../src/material/store.js';

function tempProject(): string {
  return mkdtempSync(join(tmpdir(), 'expflow-status-discovery-'));
}

function cleanup(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

function writeProjectFile(root: string, relativePath: string, content: string): void {
  const target = resolve(root, ...relativePath.split('/'));
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, content, 'utf-8');
}

interface ChangeDetailView {
  readonly relative_path: string;
  readonly kind: string;
  readonly node_revision_ref: string | null;
  readonly identity: string | null;
  readonly from_path?: string | null;
}

interface RevisionHistoryView {
  readonly tree_revision_id: string;
  readonly sequence: number;
  readonly source: string;
  readonly operation_status: string | null;
  readonly is_current_head: boolean;
  readonly restore_reference: string;
}

interface NodeHistoryView {
  readonly node_id: string;
  readonly revision: number;
  readonly node_revision_ref: string;
  readonly is_current: boolean;
  readonly restore_reference: string;
}

describe('status discovery and sync plan change details', () => {
  it('classifies pending change details deterministically without mutating state', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'same');
      writeProjectFile(root, 'b.txt', 'gone');
      writeProjectFile(root, 'e.txt', 'before');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });
      const initialTree = readTreeRevision(root, initReceipt.new_head ?? '');
      const initialNodeId =
        initialTree.entries.find((entry) => entry.relative_path === 'a.txt')?.node_id ?? '';

      renameSync(resolve(root, 'a.txt'), resolve(root, 'c.txt'));
      rmSync(resolve(root, 'b.txt'));
      writeProjectFile(root, 'd.txt', 'new');
      writeProjectFile(root, 'e.txt', 'after');

      const plan = await runtime.planSync({
        changes: [
          {
            from_path: 'a.txt',
            identity_directive: 'preserve',
            kind: 'move',
            path: 'c.txt',
          },
        ],
        root,
      });
      expect(plan.change_details.map((detail) => [detail.relative_path, detail.kind])).toEqual([
        ['a.txt', 'removed'],
        ['b.txt', 'removed'],
        ['c.txt', 'moved'],
        ['d.txt', 'added'],
        ['e.txt', 'modified'],
      ]);
      expect(summarizeChangeKinds(plan.change_details)).toEqual({
        added: 1,
        modified: 1,
        moved: 1,
        removed: 2,
      });

      const moved = plan.change_details.find((detail) => detail.kind === 'moved');
      expect(moved?.from_path).toBe('a.txt');
      expect(moved?.continuity_basis).toBe('preserve_explicit');
      expect(moved?.identity).toBe('committed');
      expect(moved?.node_revision_ref).toBe(`${initialNodeId}@1`);

      const added = plan.change_details.find((detail) => detail.relative_path === 'd.txt');
      expect(added?.identity).toBe('provisional');
      expect(plan.new_node_revisions).toContain(added?.node_revision_ref);

      const modified = plan.change_details.find((detail) => detail.relative_path === 'e.txt');
      expect(modified?.identity).toBe('provisional');
      expect(plan.new_node_revisions).toContain(modified?.node_revision_ref);

      const removed = plan.change_details.filter((detail) => detail.kind === 'removed');
      for (const detail of removed) {
        expect(detail.identity).toBeNull();
        expect(detail.node_revision_ref).toBeNull();
      }

      expect(readHead(root)).toBe(initReceipt.new_head);
      expect(
        readdirSync(storePaths(root).treeRevisions).filter((file) => file.endsWith('.json')),
      ).toHaveLength(1);

      const status = await runtime.status({ root });
      expect(status.working_tree_state).toBe('drifted');
      const statusDetails = (status.pending_change_details ?? []) as readonly ChangeDetailView[];
      expect(statusDetails.map((detail) => [detail.relative_path, detail.kind])).toEqual([
        ['a.txt', 'removed'],
        ['b.txt', 'removed'],
        ['c.txt', 'added'],
        ['d.txt', 'added'],
        ['e.txt', 'modified'],
      ]);
    } finally {
      cleanup(root);
    }
  });

  it('reports empty pending change details for a clean working tree', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();
      await runtime.init({ root });

      const status = await runtime.status({ root });
      expect(status.working_tree_state).toBe('clean');
      expect(status.pending_change_details).toEqual([]);
    } finally {
      cleanup(root);
    }
  });

  it('lists bounded revision history with restore references', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });

      writeProjectFile(root, 'a.txt', 'two');
      await runtime.sync({ root });
      const restoreReceipt = await runtime.restore({
        reference: `tree:${initReceipt.new_head ?? ''}`,
        root,
      });

      const status = await runtime.status({ history: true, root });
      const history = (status.revision_history ?? []) as readonly RevisionHistoryView[];
      expect(history).toHaveLength(3);
      expect(history.map((entry) => entry.sequence)).toEqual([3, 2, 1]);
      expect(history[0]?.tree_revision_id).toBe(restoreReceipt.new_head);
      expect(history[0]?.is_current_head).toBe(true);
      expect(history[1]?.is_current_head).toBe(false);
      expect(history[0]?.source).toBe('restore');
      expect(history[0]?.operation_status).toBe('committed');
      expect(history[0]?.restore_reference).toBe(`tree:${restoreReceipt.new_head ?? ''}`);

      const limited = await runtime.status({ history: true, historyLimit: 2, root });
      const limitedHistory = (limited.revision_history ?? []) as readonly RevisionHistoryView[];
      expect(limitedHistory.map((entry) => entry.sequence)).toEqual([3, 2]);

      const clamped = await runtime.status({ history: true, historyLimit: 0, root });
      expect(clamped.revision_history ?? []).toHaveLength(1);
    } finally {
      cleanup(root);
    }
  });

  it('lists node history for a tracked path and rejects untracked paths', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();
      await runtime.init({ root });

      writeProjectFile(root, 'a.txt', 'two');
      const syncReceipt = await runtime.sync({ root });
      const headTree = readTreeRevision(root, syncReceipt.new_head ?? '');
      const nodeId =
        headTree.entries.find((entry) => entry.relative_path === 'a.txt')?.node_id ?? '';

      const status = await runtime.status({ nodeHistoryPath: 'a.txt', root });
      const nodeHistory = (status.node_history ?? []) as readonly NodeHistoryView[];
      expect(nodeHistory).toHaveLength(2);
      expect(nodeHistory.map((entry) => entry.revision)).toEqual([1, 2]);
      expect(nodeHistory[0]?.node_id).toBe(nodeId);
      expect(nodeHistory[0]?.node_revision_ref).toBe(`${nodeId}@1`);
      expect(nodeHistory[0]?.is_current).toBe(false);
      expect(nodeHistory[0]?.restore_reference).toBe(`node:${nodeId}@1:a.txt`);
      expect(nodeHistory[1]?.is_current).toBe(true);
      expect(nodeHistory[1]?.restore_reference).toBe(`node:${nodeId}@2:a.txt`);

      await expect(runtime.status({ nodeHistoryPath: 'missing.txt', root })).rejects.toMatchObject({
        code: 'node_revision_missing',
        recoverable: true,
      });
    } finally {
      cleanup(root);
    }
  });
});
