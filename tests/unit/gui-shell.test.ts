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
      'Command Families',
      'plan',
      'apply',
      'receipt',
      'sidebar',
      'workspace',
      'id="project-root"',
      'id="status-pill"',
      'id="family-list"',
      'id="command-list"',
      'id="plan-panel"',
      'id="result-panel"',
      'id="receipt-content"',
    ]) {
      expect(html).toContain(expected);
    }
  });

  test('requires plan-before-apply workflow with confirmation', () => {
    const app = read('apps/gui/src/app.js');

    expect(app).toContain('planToken');
    expect(app).toContain('doPrimaryAction');
    expect(app).toContain('doApply');
    expect(app).toContain('/api/sync/plan');
    expect(app).toContain('/api/restore/plan');
    expect(app).toContain('lastPlanToken');
    expect(app).toContain('applyBtn.disabled = true');
  });

  test('server uses the GUI bridge without shell command construction or raw storage coupling', () => {
    const server = read('apps/gui/server.mjs');

    expect(server).toContain('createGuiBridgeFromService');
    expect(server).not.toContain('child_process');
    expect(server).not.toContain('.expflow');
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
      '/api/read-models/list',
      '/api/capabilities',
    ]) {
      expect(server).toContain(route);
    }
  });
});
