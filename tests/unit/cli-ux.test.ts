import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const CLI = resolve(process.cwd(), 'src/cli/index.ts');
const TSX = resolve(process.cwd(), 'node_modules/tsx/dist/cli.mjs');

interface CliResult {
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
}

function tempProject(): string {
  return mkdtempSync(join(tmpdir(), 'expflow-cli-ux-'));
}

function cleanup(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

function writeProjectFile(root: string, relativePath: string, content: string): void {
  const target = resolve(root, ...relativePath.split('/'));
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, content, 'utf-8');
}

function runCli(args: readonly string[], cwd = process.cwd()): CliResult {
  const result = spawnSync(process.execPath, [TSX, CLI, ...args], {
    cwd,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error !== undefined) {
    throw result.error;
  }
  return {
    status: result.status,
    stderr: typeof result.stderr === 'string' ? result.stderr : '',
    stdout: typeof result.stdout === 'string' ? result.stdout : '',
  };
}

function expectExit(result: CliResult, status: number): void {
  expect(result.status, `stdout:\n${result.stdout}\nstderr:\n${result.stderr}`).toBe(status);
}

function parseStdout(result: CliResult): Record<string, unknown> {
  return JSON.parse(result.stdout) as Record<string, unknown>;
}

describe('ordinary CLI UX', () => {
  it('keeps uninitialized status exit 0 with actionable human guidance', () => {
    const root = tempProject();
    try {
      const result = runCli(['status', '--root', root]);
      expectExit(result, 0);
      expect(result.stdout).toContain('No Expflow project exists at this root.');
      expect(result.stdout).toContain('Next action: run `expflow init`');
      expect(result.stderr).toBe('');
    } finally {
      cleanup(root);
    }
  });

  it('provides command-specific help without executing the command', () => {
    const root = tempProject();
    try {
      const result = runCli(['init', '--root', root, '--help']);
      expectExit(result, 0);
      expect(result.stdout).toContain('expflow init');
      expect(result.stdout).toContain('commits the first project version');
      expect(runCli(['status', '--root', root, '--json']).stdout).toContain(
        '"working_tree_state": "uninitialized"',
      );
    } finally {
      cleanup(root);
    }
  });

  it('returns exit 2 for unknown commands and unsupported command options', () => {
    const unknown = runCli(['inspect']);
    expectExit(unknown, 2);
    expect(unknown.stderr).toContain("unknown command 'inspect'");

    const unsupported = runCli(['status', '--dry-run']);
    expectExit(unsupported, 2);
    expect(unsupported.stderr).toContain('status does not support --dry-run');
  });

  it('formats init, status, sync preview, and provisional identity labels', () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const init = runCli(['init', '--root', root]);
      expectExit(init, 0);
      expect(init.stdout).toContain('Initialized Expflow project.');
      expect(init.stdout).toContain('Current project version');

      writeProjectFile(root, 'a.txt', 'two');
      writeProjectFile(root, 'b.txt', 'new');

      const status = runCli(['status', '--root', root]);
      expectExit(status, 0);
      expect(status.stdout).toContain('Working tree: drifted');
      expect(status.stdout).toContain('Pending changes:');
      expect(status.stdout).toContain('Next action: run `expflow sync`');

      const preview = runCli(['sync', '--root', root, '--dry-run']);
      expectExit(preview, 0);
      expect(preview.stdout).toContain('Sync preview - nothing committed.');
      expect(preview.stdout).toContain('provisional:');

      const jsonStatus = parseStdout(runCli(['status', '--root', root, '--json']));
      const details = jsonStatus.pending_change_details as Array<Record<string, unknown>>;
      expect(details.some((detail) => detail.identity === 'provisional')).toBe(true);
    } finally {
      cleanup(root);
    }
  });

  it('lists restore references through history and node-history status views', () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      expectExit(runCli(['init', '--root', root]), 0);
      writeProjectFile(root, 'a.txt', 'two');
      expectExit(runCli(['sync', '--root', root]), 0);

      const history = runCli(['status', '--root', root, '--history']);
      expectExit(history, 0);
      expect(history.stdout).toContain('Project version history');
      expect(history.stdout).toContain('tree:');
      expect(history.stdout).toContain('(current head)');

      const nodeHistory = runCli(['status', '--root', root, '--node-history', 'a.txt']);
      expectExit(nodeHistory, 0);
      expect(nodeHistory.stdout).toContain('Node revision history');
      expect(nodeHistory.stdout).toContain('restore reference: node:');
    } finally {
      cleanup(root);
    }
  });

  it('previews restore effects and refuses conflicting drift before mutation', () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'a.txt', 'one');
      const init = parseStdout(runCli(['init', '--root', root, '--json']));
      const initialHead = String(init.new_head);

      writeProjectFile(root, 'a.txt', 'two');
      expectExit(runCli(['sync', '--root', root]), 0);
      writeProjectFile(root, 'a.txt', 'local');

      const preview = runCli(['restore', `tree:${initialHead}`, '--root', root, '--dry-run']);
      expectExit(preview, 0);
      expect(preview.stdout).toContain('Restore preview - nothing was changed.');
      expect(preview.stdout).toContain('CONFLICTING DRIFT');
      expect(preview.stdout).toContain('Remediation: run `expflow sync` first');
      expect(readFileSync(resolve(root, 'a.txt'), 'utf-8')).toBe('local');

      const refused = runCli(['restore', `tree:${initialHead}`, '--root', root]);
      expectExit(refused, 1);
      expect(refused.stderr).toContain('Restore would overwrite unrecorded working-tree changes');
      expect(refused.stderr).toContain('Recommended action: Run `expflow sync`');
      expect(readFileSync(resolve(root, 'a.txt'), 'utf-8')).toBe('local');

      const jsonError = runCli(['restore', `tree:${initialHead}`, '--root', root, '--json']);
      expectExit(jsonError, 1);
      expect(parseStdout(jsonError).error).toMatchObject({
        code: 'restore_conflict',
        recoverable: true,
      });
    } finally {
      cleanup(root);
    }
  });
});
