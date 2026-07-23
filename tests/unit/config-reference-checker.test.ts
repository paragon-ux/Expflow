import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  checkConfigReferences,
  parseCliArgs,
  parseMarkedReferences,
} from '../../tools/check-config-references.js';

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

function removePath(repo: string, pathValue: string): void {
  const absolute = resolve(repo, pathValue);
  if (existsSync(absolute)) {
    rmSync(absolute, { recursive: true, force: true });
  }
}

function createRepo(): string {
  const repo = join(
    tmpdir(),
    `expflow-docrefs-${String(Date.now())}-${Math.random().toString(16).slice(2)}`,
  );
  mkdirSync(repo, { recursive: true });
  tempRepos.push(repo);
  git(repo, ['init']);
  git(repo, ['config', 'user.email', 'tests@example.invalid']);
  git(repo, ['config', 'user.name', 'Config Reference Tests']);
  write(repo, 'README.md', '# Test repo\n');
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

function mutableTarget(entries: string[]): string {
  const entryLines = entries.map((entry) => `- \`${entry}\` - governed reference`).join('\n');
  return `# Target

## Config Reference Index

<!-- config-reference-index:start -->

${entryLines}

<!-- config-reference-index:end -->
`;
}

afterEach(() => {
  for (const repo of tempRepos.splice(0)) {
    removePath(dirname(repo), repo);
  }
});

describe('config reference marker parsing', () => {
  const repo = 'C:/repo';

  it('binds an inline marker only to a same-line reference', () => {
    const parsed = parseMarkedReferences(
      repo,
      'AGENTS.md',
      '[Workflow](docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md) <!-- config-docref -->\n',
    );

    expect(parsed.problems).toEqual([]);
    expect(parsed.references).toMatchObject([
      {
        sourcePath: 'AGENTS.md',
        line: 1,
        targetPath: 'docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md',
      },
    ]);
  });

  it('binds a standalone marker only to the next non-empty line', () => {
    const parsed = parseMarkedReferences(
      repo,
      'AGENTS.md',
      '<!-- config-docref -->\n\n[Workflow](docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md)\n',
    );

    expect(parsed.problems).toEqual([]);
    expect(parsed.references).toHaveLength(1);
  });

  it('does not bind a standalone marker across headings or code fences', () => {
    const heading = parseMarkedReferences(
      repo,
      'AGENTS.md',
      '<!-- config-docref -->\n\n## Heading\n[Workflow](docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md)\n',
    );
    const fence = parseMarkedReferences(
      repo,
      'AGENTS.md',
      '<!-- config-docref -->\n\n```\ndocs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md\n```\n',
    );

    expect(heading.problems[0]?.message).toContain('structural boundary');
    expect(fence.problems[0]?.message).toContain('structural boundary');
  });

  it('fails clearly when one marker binds multiple candidate paths', () => {
    const parsed = parseMarkedReferences(
      repo,
      'AGENTS.md',
      '`docs/internal/A.md` and `docs/internal/B.md` <!-- config-docref -->\n',
    );

    expect(parsed.references).toEqual([]);
    expect(parsed.problems[0]?.message).toContain('multiple file references');
  });

  it('ignores unmarked references and supports plain JSON marked objects', () => {
    const unmarked = parseMarkedReferences(
      repo,
      'AGENTS.md',
      'Mention `config-docref` in prose and `docs/internal/A.md` without a comment marker.\n',
    );
    const markedJson = parseMarkedReferences(
      repo,
      'config.json',
      JSON.stringify({
        workflowDocument: {
          path: 'docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md',
          configDocref: true,
        },
        ignored: {
          path: 'docs/internal/CURRENT_STATUS_MATRIX.md',
        },
      }),
    );

    expect(unmarked.references).toEqual([]);
    expect(markedJson.problems).toEqual([]);
    expect(markedJson.references.map((reference) => reference.targetPath)).toEqual([
      'docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md',
    ]);
  });

  it('rejects invalid JSON configDocref objects', () => {
    const missingPath = parseMarkedReferences(
      repo,
      'config.json',
      JSON.stringify({ workflowDocument: { configDocref: true } }),
    );
    const nonStringPath = parseMarkedReferences(
      repo,
      'config.json',
      JSON.stringify({ workflowDocument: { configDocref: true, path: 3 } }),
    );
    const emptyPath = parseMarkedReferences(
      repo,
      'config.json',
      JSON.stringify({ workflowDocument: { configDocref: true, path: '' } }),
    );
    const urlPath = parseMarkedReferences(
      repo,
      'config.json',
      JSON.stringify({
        workflowDocument: { configDocref: true, path: 'https://example.test/a.md' },
      }),
    );
    const outsidePath = parseMarkedReferences(
      repo,
      'config.json',
      JSON.stringify({ workflowDocument: { configDocref: true, path: '../outside/A.md' } }),
    );
    const malformed = parseMarkedReferences(repo, 'config.json', '{');

    expect(missingPath.problems[0]?.message).toContain('must contain exactly one string path');
    expect(nonStringPath.problems[0]?.message).toContain('path must be a string');
    expect(emptyPath.problems[0]?.message).toContain('path must not be empty');
    expect(urlPath.problems[0]?.message).toContain('not a repository-local file reference');
    expect(outsidePath.problems[0]?.message).toContain('not a repository-local file reference');
    expect(malformed.problems[0]?.message).toContain('JSON source could not be parsed');
  });
});

describe('staged config reference checker', () => {
  it(
    'detects marker removal when the same target path remains unmarked',
    () => {
      const repo = createRepo();
      write(
        repo,
        'AGENTS.md',
        '[Workflow](docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md) <!-- config-docref -->\n',
      );
      write(repo, 'docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md', mutableTarget(['AGENTS.md']));
      commitAll(repo, 'baseline marked reference');

      write(
        repo,
        'AGENTS.md',
        'See `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md` for the workflow.\n',
      );
      write(repo, 'docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md', mutableTarget([]));
      git(repo, ['add', 'AGENTS.md', 'docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md']);
      const bypass = checkConfigReferences(repo);
      expect(bypass.ok).toBe(false);
      expect(bypass.output).toContain(
        'Previously governed reference remains present without config-docref marker',
      );
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it(
    'requires both sides of a retargeted reference',
    () => {
      const repo = createRepo();
      write(repo, 'AGENTS.md', '`docs/internal/OLD_WORKFLOW.md` <!-- config-docref -->\n');
      write(repo, 'docs/internal/OLD_WORKFLOW.md', mutableTarget(['AGENTS.md']));
      write(repo, 'docs/internal/NEW_WORKFLOW.md', mutableTarget([]));
      commitAll(repo, 'baseline old target');

      write(repo, 'AGENTS.md', '`docs/internal/NEW_WORKFLOW.md` <!-- config-docref -->\n');
      write(repo, 'docs/internal/NEW_WORKFLOW.md', mutableTarget(['AGENTS.md']));
      git(repo, ['add', 'AGENTS.md', 'docs/internal/NEW_WORKFLOW.md']);
      const missingOldCleanup = checkConfigReferences(repo);
      expect(missingOldCleanup.ok).toBe(false);
      expect(missingOldCleanup.output).toContain('Missing staged reverse-index update');

      git(repo, ['reset', '--hard', 'HEAD']);
      write(repo, 'AGENTS.md', '`docs/internal/NEW_WORKFLOW.md` <!-- config-docref -->\n');
      write(repo, 'docs/internal/OLD_WORKFLOW.md', mutableTarget([]));
      write(repo, 'docs/internal/NEW_WORKFLOW.md', mutableTarget(['AGENTS.md']));
      git(repo, [
        'add',
        'AGENTS.md',
        'docs/internal/OLD_WORKFLOW.md',
        'docs/internal/NEW_WORKFLOW.md',
      ]);

      expect(checkConfigReferences(repo).ok).toBe(true);
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it(
    'ignores managed-index examples inside fenced code blocks',
    () => {
      const repo = createRepo();
      write(repo, 'AGENTS.md', '`docs/internal/POLICY.md` <!-- config-docref -->\n');
      write(
        repo,
        'docs/internal/POLICY.md',
        `# Policy

\`\`\`markdown
<!-- config-reference-index:start -->

- \`example.md\` - example

<!-- config-reference-index:end -->
\`\`\`

## Config Reference Index

<!-- config-reference-index:start -->

- \`AGENTS.md\` - policy role

<!-- config-reference-index:end -->
`,
      );
      git(repo, ['add', '.']);

      expect(checkConfigReferences(repo).ok).toBe(true);
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it(
    'allows newly installed protected targets when the sidecar is reconciled',
    () => {
      const repo = createRepo();
      write(
        repo,
        '.github/workflows/release.yml',
        'env:\n  RELEASE_NOTES_FILE: docs/releases/v1.0.1/files/docs/release_notes/NOTE.md # config-docref\n',
      );
      write(repo, 'docs/releases/v1.0.1/files/docs/release_notes/NOTE.md', '# Notes\n');
      write(
        repo,
        'docs/internal/PROTECTED_CONFIG_REFERENCE_INDEX.md',
        `# Protected

## \`docs/releases/v1.0.1/files/docs/release_notes/NOTE.md\`

<!-- config-reference-index:start -->

- \`.github/workflows/release.yml\` - release notes input

<!-- config-reference-index:end -->
`,
      );
      git(repo, ['add', '.']);

      expect(checkConfigReferences(repo).ok).toBe(true);
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it(
    'fails target rename when indexed inbound sources still reference the old target',
    () => {
      const repo = createRepo();
      write(repo, 'AGENTS.md', '`docs/internal/OLD_WORKFLOW.md` <!-- config-docref -->\n');
      write(repo, 'docs/internal/OLD_WORKFLOW.md', mutableTarget(['AGENTS.md']));
      commitAll(repo, 'baseline target');

      git(repo, ['mv', 'docs/internal/OLD_WORKFLOW.md', 'docs/internal/NEW_WORKFLOW.md']);
      const staleRename = checkConfigReferences(repo);
      expect(staleRename.ok).toBe(false);
      expect(staleRename.output).toContain('Stale inbound marked reference after target rename');
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it(
    'supports commit-range mode for the same reconciliation invariants',
    () => {
      const repo = createRepo();
      write(repo, 'AGENTS.md', '# Agents\n');
      write(repo, 'docs/internal/OLD_WORKFLOW.md', mutableTarget([]));
      write(repo, 'docs/internal/NEW_WORKFLOW.md', mutableTarget([]));
      commitAll(repo, 'baseline target');
      const base = head(repo);
      write(repo, 'AGENTS.md', '`docs/internal/OLD_WORKFLOW.md` <!-- config-docref -->\n');
      write(repo, 'docs/internal/OLD_WORKFLOW.md', mutableTarget(['AGENTS.md']));
      commitAll(repo, 'complete addition');
      const completeHead = head(repo);

      expect(
        checkConfigReferences(repo, {
          mode: 'commit-range',
          base,
          head: completeHead,
        }).ok,
      ).toBe(true);

      git(repo, ['checkout', '-B', 'partial-retarget', completeHead]);
      write(repo, 'AGENTS.md', '`docs/internal/NEW_WORKFLOW.md` <!-- config-docref -->\n');
      write(repo, 'docs/internal/NEW_WORKFLOW.md', mutableTarget(['AGENTS.md']));
      commitAll(repo, 'partial retarget');
      const partialHead = head(repo);

      const partialResult = checkConfigReferences(repo, {
        mode: 'commit-range',
        base: completeHead,
        head: partialHead,
      });
      expect(partialResult.ok).toBe(false);
      expect(partialResult.output).toContain('Missing staged reverse-index update');

      const invalidRevision = checkConfigReferences(repo, {
        mode: 'commit-range',
        base: 'not-a-revision',
        head: 'HEAD',
      });
      expect(invalidRevision.ok).toBe(false);
      expect(invalidRevision.output).toContain('Invalid Git revision for --base');
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it('rejects unsupported CLI mode combinations and invalid revisions', () => {
    expect(parseCliArgs([])).toMatchObject({ kind: 'run', options: { mode: 'staged' } });
    expect(parseCliArgs(['--staged'])).toMatchObject({
      kind: 'run',
      options: { mode: 'staged' },
    });
    expect(parseCliArgs(['--help']).kind).toBe('help');
    expect(parseCliArgs(['--ci']).kind).toBe('error');
    expect(parseCliArgs(['--unknown']).kind).toBe('error');
    expect(parseCliArgs(['--base', 'abc']).kind).toBe('error');
    expect(parseCliArgs(['--head', 'abc']).kind).toBe('error');
    expect(parseCliArgs(['--staged', '--base', 'a', '--head', 'b']).kind).toBe('error');
  });
});
