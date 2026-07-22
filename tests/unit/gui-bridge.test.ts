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

      const synced = await bridge.executeSync({ expectedHead: planHead, root });
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
      const first = await bridge.executeSync({
        expectedHead: firstPreview.data?.previous_head,
        root,
      });
      const firstHead = requireValue(first.data?.new_head);
      writeFileSync(join(root, 'note.txt'), 'two\n');
      const secondPreview = await bridge.planSync({ root });
      await bridge.executeSync({ expectedHead: secondPreview.data?.previous_head, root });
      writeFileSync(join(root, 'note.txt'), 'local drift\n');

      const reference = `tree:${firstHead}`;
      const preview = await bridge.planRestore({ reference, root });
      expect(preview.state).toBe('blocked');
      expect(preview.data?.requires_force).toBe(true);
      expect(preview.data?.conflicting_paths).toEqual(['note.txt']);

      const refused = await bridge.executeRestore({ reference, root });
      expect(refused.state).toBe('blocked');
      expect(refused.error?.code).toBe('restore_conflict');

      const restored = await bridge.executeRestore({ overwrite: true, reference, root });
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

      const missingPreview = await bridge.executeSync({ root });
      expect(missingPreview.state).toBe('blocked');
      expect(missingPreview.error?.code).toBe('sync_preview_required');

      await bridge.executeSync({ expectedHead: previewHead, root });
      writeFileSync(join(root, 'a.txt'), 'two\n');

      const staleExecution = await bridge.executeSync({ expectedHead: previewHead, root });
      expect(staleExecution.state).toBe('blocked');
      expect(staleExecution.error?.code).toBe('stale_head');
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
});
