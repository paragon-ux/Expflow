import { describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createExtensionHost } from '../../src/extensions/host.js';

function tempProject(): string {
  return mkdtempSync(join(tmpdir(), 'expflow-extension-'));
}

describe('Gate B extension host', () => {
  it('exposes operation invokers and read-only committed state without raw store access', async () => {
    const root = tempProject();
    try {
      writeFileSync(resolve(root, 'a.txt'), 'alpha', 'utf-8');
      const host = createExtensionHost(root);
      const receipt = await host.init();

      const state = host.readProjectState();
      expect(state.project_id).toBe(receipt.project_id);
      expect(state.head_tree_revision_id).toBe(receipt.new_head);

      const tree = host.readTreeRevision(receipt.new_head ?? '');
      expect(tree.entries[0]?.relative_path).toBe('a.txt');

      const storedReceipt = host.readOperationReceipt(receipt.operation_id);
      expect(storedReceipt.status).toBe('committed');

      expect(Object.keys(host)).not.toContain('storePaths');
      expect(Object.keys(host)).not.toContain('objects');
      expect(Object.keys(host)).not.toContain('records');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
