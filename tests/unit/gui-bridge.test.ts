import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { createGuiBridge } from '../../src/gui/bridge.js';

function tempProject(): string {
  return mkdtempSync(join(tmpdir(), 'expflow-gui-bridge-'));
}

function cleanup(root: string): void {
  rmSync(root, { force: true, recursive: true });
}

function requireValue(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    throw new Error('Expected value to be present.');
  }
  expect(value).toMatch(/^ef/);
  return value;
}

describe('Expflow GUI bridge', () => {
  test('reports uninitialized roots as empty without raw storage access', async () => {
    const root = tempProject();
    try {
      const bridge = createGuiBridge();
      const result = await bridge.inspectProject({ root });

      expect(result.root).toBe(resolve(root));
      expect(result.state).toBe('empty');
      expect(result.data?.status.working_tree_state).toBe('uninitialized');
      expect(result.technical_details.raw_storage_access).toBe(false);
      expect(result.technical_details.native_authority).toBe('Expflow');
    } finally {
      cleanup(root);
    }
  });

  test('initializes, previews drift, commits sync, and exposes history', async () => {
    const root = tempProject();
    try {
      const bridge = createGuiBridge();
      const initialized = await bridge.initializeProject({ root });
      expect(initialized.state).toBe('success');
      expect(initialized.data?.status).toBe('committed');

      writeFileSync(join(root, 'note.txt'), 'hello\n');
      const plan = await bridge.planSync({ root });
      expect(plan.state).toBe('success');
      expect(plan.data?.change_details.map((detail) => detail.relative_path)).toEqual(['note.txt']);
      const planHead = plan.data?.previous_head;
      const planToken = plan.data?.planToken;
      expect(planToken).toBeDefined();

      const synced = await bridge.executeSync({ expectedHead: planHead, planToken, root });
      expect(synced.state).toBe('success');
      const syncedHead = requireValue(synced.data?.new_head);

      const history = await bridge.getHistory({ root });
      expect(history.data?.revision_history?.length).toBeGreaterThanOrEqual(2);
      expect(history.data?.revision_history?.[0]).toMatchObject({
        is_current_head: true,
        restore_reference: `tree:${syncedHead}`,
      });
    } finally {
      cleanup(root);
    }
  });

  test('keeps restore preview and execution separated by explicit confirmation', async () => {
    const root = tempProject();
    try {
      const bridge = createGuiBridge();
      await bridge.initializeProject({ root });
      writeFileSync(join(root, 'note.txt'), 'one\n');
      const firstPreview = await bridge.planSync({ root });
      const firstToken = firstPreview.data?.planToken;
      const first = await bridge.executeSync({
        expectedHead: firstPreview.data?.previous_head,
        planToken: firstToken,
        root,
      });
      const firstHead = requireValue(first.data?.new_head);
      writeFileSync(join(root, 'note.txt'), 'two\n');
      const secondPreview = await bridge.planSync({ root });
      const secondToken = secondPreview.data?.planToken;
      await bridge.executeSync({
        expectedHead: secondPreview.data?.previous_head,
        planToken: secondToken,
        root,
      });
      writeFileSync(join(root, 'note.txt'), 'local drift\n');

      const reference = `tree:${firstHead}`;
      const preview = await bridge.planRestore({ overwrite: true, reference, root });
      expect(preview.state).toBe('blocked');
      expect(preview.data?.requires_force).toBe(true);
      expect(preview.data?.conflicting_paths).toEqual(['note.txt']);

      // Restore without preview token should be refused
      const refused = await bridge.executeRestore({ reference, root });
      expect(refused.state).toBe('blocked');
      expect(refused.error?.code).toBe('restore_preview_required');

      // Restore with valid plan token should succeed with force
      const planToken = preview.data?.planToken;
      const restored = await bridge.executeRestore({ overwrite: true, reference, planToken, root });
      expect(restored.state).toBe('success');
      expect(restored.data?.warnings).toContain('overwrote_unrecorded_changes');
    } finally {
      cleanup(root);
    }
  });

  test('blocks sync execution when the previewed head is missing or stale', async () => {
    const root = tempProject();
    try {
      const bridge = createGuiBridge();
      await bridge.initializeProject({ root });
      writeFileSync(join(root, 'a.txt'), 'one\n');
      const preview = await bridge.planSync({ root });
      const previewHead = preview.data?.previous_head;
      const planToken = preview.data?.planToken;

      // Missing preview token
      const missingPreview = await bridge.executeSync({ root });
      expect(missingPreview.state).toBe('blocked');
      expect(missingPreview.error?.code).toBe('sync_preview_required');

      // Successful first commit
      await bridge.executeSync({ expectedHead: previewHead, planToken, root });

      // Write change, then try stale commit
      writeFileSync(join(root, 'a.txt'), 'two\n');
      const staleExecution = await bridge.executeSync({
        expectedHead: previewHead,
        planToken,
        root,
      });
      expect(staleExecution.state).toBe('blocked');
      expect(staleExecution.error?.code).toBe('sync_plan_expired');
    } finally {
      cleanup(root);
    }
  });

  test('loads committed operation receipts through the bridge', async () => {
    const root = tempProject();
    try {
      const bridge = createGuiBridge();
      const initialized = await bridge.initializeProject({ root });
      const receipt = await bridge.readReceipt({
        operationId: initialized.data?.operation_id ?? '',
        root,
      });

      expect(receipt.state).toBe('success');
      expect(receipt.data?.operation_id).toBe(initialized.data?.operation_id);
      expect(receipt.technical_details.surface).toBe('Expflow GUI bridge');
    } finally {
      cleanup(root);
    }
  });

  test('exposes stable read models through the GUI bridge without raw storage access', async () => {
    const root = tempProject();
    try {
      const bridge = createGuiBridge();
      await bridge.initializeProject({ root });

      const page = await bridge.listReadModelRecords({
        collection: 'material_operation_receipts',
        root,
      });

      expect(page.state).toBe('success');
      expect(page.data?.envelope.read_model_version).toBe('1.0.0');
      expect(page.data?.items[0]?.collection).toBe('material_operation_receipts');
      expect(page.technical_details.raw_storage_access).toBe(false);
    } finally {
      cleanup(root);
    }
  });

  test('refuses sync commit when working tree changes after preview', async () => {
    const root = tempProject();
    try {
      const bridge = createGuiBridge();
      await bridge.initializeProject({ root });
      writeFileSync(join(root, 'a.txt'), 'one\n');
      const preview = await bridge.planSync({ root });
      const planToken = preview.data?.planToken;
      const previewHead = preview.data?.previous_head;

      // Change working tree after preview — should be detected via changeDigest
      writeFileSync(join(root, 'a.txt'), 'changed after preview\n');

      const result = await bridge.executeSync({ expectedHead: previewHead, planToken, root });
      expect(result.state).toBe('blocked');
      expect(result.error?.code).toBe('sync_candidate_changed');
    } finally {
      cleanup(root);
    }
  });

  test('refuses restore when head changes after preview', async () => {
    const root = tempProject();
    try {
      const bridge = createGuiBridge();
      await bridge.initializeProject({ root });
      writeFileSync(join(root, 'a.txt'), 'v1\n');
      const p1 = await bridge.planSync({ root });
      const r1 = await bridge.executeSync({
        expectedHead: p1.data?.previous_head,
        planToken: p1.data?.planToken,
        root,
      });
      const head1 = requireValue(r1.data?.new_head);

      writeFileSync(join(root, 'a.txt'), 'v2\n');
      const p2 = await bridge.planSync({ root });
      await bridge.executeSync({
        expectedHead: p2.data?.previous_head,
        planToken: p2.data?.planToken,
        root,
      });

      // Preview restore
      const preview = await bridge.planRestore({ reference: `tree:${head1}`, root });
      const planToken = preview.data?.planToken;

      // Head changes after preview: sync again
      writeFileSync(join(root, 'a.txt'), 'v3\n');
      const p3 = await bridge.planSync({ root });
      await bridge.executeSync({
        expectedHead: p3.data?.previous_head,
        planToken: p3.data?.planToken,
        root,
      });

      const result = await bridge.executeRestore({ reference: `tree:${head1}`, planToken, root });
      expect(result.state).toBe('blocked');
      expect(result.error?.code).toBe('restore_head_changed');
    } finally {
      cleanup(root);
    }
  });

  test('rejects blank root on inspect and init', async () => {
    const bridge = createGuiBridge();

    const blank = await bridge.inspectProject({ root: '' });
    expect(blank.state).toBe('error');
    expect(blank.error?.code).toBe('root_required');

    const whitespace = await bridge.initializeProject({ root: '   ' });
    expect(whitespace.state).toBe('error');
    expect(whitespace.error?.code).toBe('root_required');
  });
});
