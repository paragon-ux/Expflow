import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

describe('Expflow GUI shell contract', () => {
  test('exposes the required workflow controls with accessible labels', () => {
    const html = read('apps/gui/index.html');

    for (const expected of [
      'Expflow GUI',
      'Project root',
      'Current State',
      'Sync',
      'History',
      'Restore',
      'Receipts And Technical Details',
      'aria-label="Project controls"',
      'id="project-root"',
      'id="restore-reference"',
      'id="restore-force"',
      'id="technical-panel"',
    ]) {
      expect(html).toContain(expected);
    }
  });

  test('requires confirmation before GUI-triggered mutations', () => {
    const app = read('apps/gui/src/app.js');

    expect(app).toContain('Commit the current sync plan');
    expect(app).toContain('Restore will create a forward commit');
    expect(app).toContain('/api/sync/plan');
    expect(app).toContain('/api/restore/plan');
  });

  test('server uses the GUI bridge without shell command construction or raw storage coupling', () => {
    const server = read('apps/gui/server.mjs');
    const app = read('apps/gui/src/app.js');

    expect(server).toContain('createGuiBridge');
    expect(server).not.toContain('child_process');
    expect(server).not.toContain('.expflow');
    expect(app).not.toContain('.expflow');
    for (const route of [
      '/api/status',
      '/api/init',
      '/api/sync/plan',
      '/api/sync',
      '/api/history',
      '/api/node-history',
      '/api/restore/plan',
      '/api/restore',
      '/api/recover',
      '/api/verify',
      '/api/receipt',
    ]) {
      expect(server).toContain(route);
    }
  });
});
