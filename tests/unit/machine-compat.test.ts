import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRuntime } from '../../src/operations/runtime.js';

function tempProject(): string {
  return mkdtempSync(join(tmpdir(), 'expflow-machine-compat-'));
}

function cleanup(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

function writeProjectFile(root: string, relativePath: string, content: string): void {
  const target = resolve(root, ...relativePath.split('/'));
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, content, 'utf-8');
}

const STATUS_V1_KEYS = new Set([
  'schema_version',
  'project_id',
  'head_tree_revision_id',
  'working_tree_state',
  'generated_at',
  'pending_changes',
  'unresolved_items',
  'open_conflict_refs',
  'review_request_refs',
  'workflow_occurrence_refs',
  'manifest_heads',
  'automation_state',
  'recommended_action',
]);

const RECEIPT_V1_KEYS = [
  'error',
  'finished_at',
  'new_head',
  'node_revision_refs',
  'operation_id',
  'previous_head',
  'project_id',
  'schema_version',
  'started_at',
  'status',
  'validation_refs',
  'warnings',
];

describe('machine output v1 compatibility', () => {
  it('keeps every v1 status field and shape with only additive extensions', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });

      const clean = await runtime.status({ root });
      expect(clean.schema_version).toBe('2.3');
      expect(clean.project_id).toMatch(/^efp_/);
      expect(clean.head_tree_revision_id).toBe(initReceipt.new_head);
      expect(clean.working_tree_state).toBe('clean');
      expect(Number.isNaN(Date.parse(clean.generated_at))).toBe(false);
      expect(clean.unresolved_items).toEqual([]);
      expect(clean.manifest_heads).toEqual({});
      expect(clean.automation_state).toEqual({ failed_hooks: [], pending_hooks: [] });
      expect(clean.pending_changes).toEqual([]);
      expect(clean.recommended_action).toBeNull();
      expect(
        Object.keys(clean)
          .filter((key) => !STATUS_V1_KEYS.has(key))
          .sort(),
      ).toEqual(['pending_change_details']);
      expect(clean.pending_change_details).toEqual([]);
      expect(clean.revision_history).toBeUndefined();
      expect(clean.node_history).toBeUndefined();

      writeProjectFile(root, 'a.txt', 'two');
      rmSync(resolve(root, 'b.txt'), { force: true });
      writeProjectFile(root, 'b.txt', 'added');
      const drifted = await runtime.status({ root });
      expect(drifted.working_tree_state).toBe('drifted');
      expect(drifted.recommended_action).toBe('Run expflow sync to commit drift.');
      const pendingChanges = (drifted.pending_changes ?? []) as readonly Record<string, unknown>[];
      for (const entry of pendingChanges) {
        expect(Object.keys(entry).sort()).toHaveLength(2);
        if (entry.kind === 'node_revision') {
          expect(typeof entry.revision).toBe('string');
        } else if (entry.kind === 'removed_path') {
          expect(typeof entry.path).toBe('string');
        } else {
          expect(entry.kind).toBe('identity_proposal');
          expect(typeof entry.proposal).toBe('object');
        }
      }
      expect(
        Object.keys(drifted)
          .filter((key) => !STATUS_V1_KEYS.has(key))
          .sort(),
      ).toEqual(['pending_change_details']);
    } finally {
      cleanup(root);
    }
  });

  it('omits history fields unless requested and reports uninitialized status unchanged', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();

      const uninitialized = await runtime.status({ root });
      expect(uninitialized.working_tree_state).toBe('uninitialized');
      expect(uninitialized.recommended_action).toBe('Run expflow init.');
      expect(Object.keys(uninitialized).filter((key) => !STATUS_V1_KEYS.has(key))).toEqual([]);

      await runtime.init({ root });
      writeProjectFile(root, 'a.txt', 'two');
      await runtime.sync({ root });

      const plain = await runtime.status({ root });
      expect(plain.revision_history).toBeUndefined();
      expect(plain.node_history).toBeUndefined();

      const withHistory = await runtime.status({ history: true, root });
      expect(Array.isArray(withHistory.revision_history)).toBe(true);
      expect(withHistory.revision_history).toHaveLength(2);
      expect(withHistory.node_history).toBeUndefined();

      const withNodeHistory = await runtime.status({ nodeHistoryPath: 'a.txt', root });
      expect(Array.isArray(withNodeHistory.node_history)).toBe(true);
      expect(withNodeHistory.node_history).toHaveLength(2);
      expect(withNodeHistory.revision_history).toBeUndefined();
      expect(
        Object.keys(withNodeHistory)
          .filter((key) => !STATUS_V1_KEYS.has(key))
          .sort(),
      ).toEqual(['node_history', 'pending_change_details']);
    } finally {
      cleanup(root);
    }
  });

  it('keeps every v1 planSync field with change_details additive', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();
      const initReceipt = await runtime.init({ root });

      writeProjectFile(root, 'a.txt', 'two');
      const plan = await runtime.planSync({ root });
      expect(plan.operation_id).toMatch(/^efo_/);
      expect(plan.project_id).toMatch(/^efp_/);
      expect(plan.previous_head).toBe(initReceipt.new_head);
      expect(typeof plan.candidate_head).toBe('string');
      expect(plan.entries).toHaveLength(1);
      expect(plan.removed_paths).toEqual([]);
      expect(plan.new_node_revisions).toHaveLength(1);
      expect(plan.identity_proposals).toEqual([]);
      expect(plan.content_digest).toBe(plan.candidate_head);
      expect(Array.isArray(plan.change_details)).toBe(true);
      expect(plan.change_details.map((detail) => detail.kind)).toEqual(['modified']);
    } finally {
      cleanup(root);
    }
  });

  it('keeps the exact v1 receipt field set for init, sync, and restore', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const runtime = createRuntime();

      const initReceipt = await runtime.init({ root });
      expect(Object.keys(initReceipt).sort()).toEqual(RECEIPT_V1_KEYS);
      expect(initReceipt.schema_version).toBe('2.3');
      expect(initReceipt.status).toBe('committed');
      expect(initReceipt.error).toBeNull();
      expect(initReceipt.previous_head).toBeNull();
      expect(initReceipt.validation_refs).toHaveLength(1);
      expect(initReceipt.warnings).toEqual([]);

      writeProjectFile(root, 'a.txt', 'two');
      const syncReceipt = await runtime.sync({ root });
      expect(Object.keys(syncReceipt).sort()).toEqual(RECEIPT_V1_KEYS);
      expect(syncReceipt.status).toBe('committed');
      expect(syncReceipt.previous_head).toBe(initReceipt.new_head);
      expect(syncReceipt.node_revision_refs).toHaveLength(1);

      const restoreReceipt = await runtime.restore({
        reference: `tree:${initReceipt.new_head ?? ''}`,
        root,
      });
      expect(Object.keys(restoreReceipt).sort()).toEqual(RECEIPT_V1_KEYS);
      expect(restoreReceipt.status).toBe('committed');
      expect(restoreReceipt.previous_head).toBe(syncReceipt.new_head);
      expect(restoreReceipt.new_head).not.toBe(syncReceipt.new_head);

      for (const receipt of [initReceipt, syncReceipt, restoreReceipt]) {
        expect(Number.isNaN(Date.parse(receipt.started_at))).toBe(false);
        expect(Number.isNaN(Date.parse(receipt.finished_at))).toBe(false);
      }
    } finally {
      cleanup(root);
    }
  });
});
