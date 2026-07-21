import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  checkProtectedSurfaces,
  parseProtectedSurfaceCliArgs,
} from '../../tools/check-protected-surfaces.js';

const tempRepos: string[] = [];
const GIT_TEST_TIMEOUT_MS = 45_000;

function git(cwd: string, args: string[]): string {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function write(repo: string, pathValue: string, content: string): void {
  const absolute = resolve(repo, pathValue);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, content, 'utf8');
}

function contract(): string {
  return `version: 1

protected_targets:
  - docs/architecture/**
  - docs/releases/**

protected_sidecar: docs/internal/PROTECTED_CONFIG_REFERENCE_INDEX.md
`;
}

function createRepo(): string {
  const repo = join(
    tmpdir(),
    `expflow-protected-surfaces-${String(Date.now())}-${Math.random().toString(16).slice(2)}`,
  );
  mkdirSync(repo, { recursive: true });
  tempRepos.push(repo);
  git(repo, ['init']);
  git(repo, ['config', 'user.email', 'tests@example.invalid']);
  git(repo, ['config', 'user.name', 'Protected Surface Tests']);
  write(repo, '.config-reference-reconciliation.yaml', contract());
  write(repo, 'docs/architecture/ARCHITECTURE.md', '# Architecture\n');
  write(repo, 'docs/releases/v1.0.1/NOTE.md', '# Release\n');
  write(repo, 'docs/internal/PROTECTED_CONFIG_REFERENCE_INDEX.md', '# Sidecar\n');
  git(repo, ['add', '.']);
  git(repo, ['commit', '-m', 'initial']);
  return repo;
}

function commitAll(repo: string, message: string): void {
  git(repo, ['add', '.']);
  git(repo, ['commit', '-m', message]);
}

function head(repo: string): string {
  return git(repo, ['rev-parse', 'HEAD']).trim();
}

afterEach(() => {
  for (const repo of tempRepos.splice(0)) {
    rmSync(repo, { recursive: true, force: true });
  }
});

describe('protected surface checker', () => {
  it(
    'passes a clean staged state with declared protected targets',
    () => {
      const repo = createRepo();

      const result = checkProtectedSurfaces(repo);
      expect(result.ok).toBe(true);
      expect(result.output).toContain('PASS');
      expect(result.output).toContain('HEAD vs staged index vs worktree');
      expect(result.stats.protectedTargets).toBe(2);
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it(
    'fails when a protected file is staged against HEAD',
    () => {
      const repo = createRepo();
      write(repo, 'docs/architecture/ARCHITECTURE.md', '# Mutated\n');
      git(repo, ['add', 'docs/architecture/ARCHITECTURE.md']);

      const result = checkProtectedSurfaces(repo);
      expect(result.ok).toBe(false);
      expect(result.output).toContain(
        'Staged change to protected surface (HEAD vs index): docs/architecture/ARCHITECTURE.md',
      );
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it(
    'fails when a protected file has unstaged worktree modifications',
    () => {
      const repo = createRepo();
      write(repo, 'docs/releases/v1.0.1/NOTE.md', '# Mutated\n');

      const result = checkProtectedSurfaces(repo);
      expect(result.ok).toBe(false);
      expect(result.output).toContain(
        'Unstaged worktree modification of protected surface: docs/releases/v1.0.1/NOTE.md',
      );
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it(
    'fails when an untracked file appears inside a protected path',
    () => {
      const repo = createRepo();
      write(repo, 'docs/architecture/PROBE.md', 'probe\n');

      const result = checkProtectedSurfaces(repo);
      expect(result.ok).toBe(false);
      expect(result.output).toContain(
        'Untracked new file inside protected surface: docs/architecture/PROBE.md',
      );
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it(
    'fails a commit range that touches a protected surface and passes one that does not',
    () => {
      const repo = createRepo();
      const base = head(repo);

      write(repo, 'docs/internal/NOTES.md', '# Mutable notes\n');
      commitAll(repo, 'mutable change only');
      const cleanHead = head(repo);

      write(repo, 'docs/architecture/ARCHITECTURE.md', '# Mutated\n');
      commitAll(repo, 'protected change');
      const dirtyHead = head(repo);

      const cleanRange = checkProtectedSurfaces(repo, {
        mode: 'commit-range',
        base,
        head: cleanHead,
      });
      expect(cleanRange.ok).toBe(true);
      expect(cleanRange.output).toContain('PASS');

      const dirtyRange = checkProtectedSurfaces(repo, {
        mode: 'commit-range',
        base: cleanHead,
        head: dirtyHead,
      });
      expect(dirtyRange.ok).toBe(false);
      expect(dirtyRange.output).toContain(
        `Protected surface changed between ${cleanHead} and ${dirtyHead}: docs/architecture/ARCHITECTURE.md`,
      );

      const invalid = checkProtectedSurfaces(repo, {
        mode: 'commit-range',
        base: 'not-a-revision',
        head: dirtyHead,
      });
      expect(invalid.ok).toBe(false);
      expect(invalid.output).toContain('Invalid Git revision for --base: not-a-revision');
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it(
    'fails when the contract declares no protected targets',
    () => {
      const repo = createRepo();
      write(repo, '.config-reference-reconciliation.yaml', 'version: 1\n');

      const result = checkProtectedSurfaces(repo);
      expect(result.ok).toBe(false);
      expect(result.output).toContain('protected_targets declares no targets');
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it('rejects unsupported CLI arguments', () => {
    expect(parseProtectedSurfaceCliArgs([])).toMatchObject({
      kind: 'run',
      options: { mode: 'staged' },
    });
    expect(parseProtectedSurfaceCliArgs(['--help']).kind).toBe('help');
    expect(parseProtectedSurfaceCliArgs(['--unknown']).kind).toBe('error');
    expect(parseProtectedSurfaceCliArgs(['--base', 'abc']).kind).toBe('error');
    expect(parseProtectedSurfaceCliArgs(['--head', 'abc']).kind).toBe('error');
    expect(parseProtectedSurfaceCliArgs(['--staged', '--base', 'a', '--head', 'b']).kind).toBe(
      'error',
    );
    expect(parseProtectedSurfaceCliArgs(['--base', 'a', '--head', 'b'])).toMatchObject({
      kind: 'run',
      options: { mode: 'commit-range', base: 'a', head: 'b' },
    });
  });
});
