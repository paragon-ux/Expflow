import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTRACT_PATH = '.config-reference-reconciliation.yaml';

export type ProtectedSurfaceMode = 'staged' | 'commit-range';

export interface ProtectedSurfaceOptions {
  mode?: ProtectedSurfaceMode;
  base?: string;
  head?: string;
}

interface ProtectedSurfaceStats {
  protectedTargets: number;
  stagedViolations: number;
  unstagedViolations: number;
  untrackedViolations: number;
  commitRangeViolations: number;
}

export interface ProtectedSurfaceResult {
  ok: boolean;
  output: string;
  failures: string[];
  stats: ProtectedSurfaceStats;
  evaluatedState: string;
}

function toRepoPath(pathValue: string): string {
  return pathValue.replace(/\\/g, '/').replace(/^\.\//, '');
}

function stripInlineComment(value: string): string {
  return value
    .replace(/\s+#.*$/, '')
    .trim()
    .replace(/^["']|["']$/g, '');
}

function runGit(repoRoot: string, args: string[]): string {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function tryRunGit(repoRoot: string, args: string[]): string | null {
  try {
    return runGit(repoRoot, args);
  } catch {
    return null;
  }
}

function resolveRepoRoot(repoRootInput?: string): string {
  return repoRootInput
    ? resolve(repoRootInput)
    : runGit(process.cwd(), ['rev-parse', '--show-toplevel']).trim();
}

function parseGitPaths(output: string): string[] {
  return [...new Set(output.split('\0').filter(Boolean).map(toRepoPath))].sort((left, right) =>
    left.localeCompare(right),
  );
}

function loadProtectedTargets(repoRoot: string): { targets: string[]; error: string | null } {
  let content: string;
  try {
    content = readFileSync(resolve(repoRoot, CONTRACT_PATH), 'utf8');
  } catch (error) {
    return {
      targets: [],
      error: `${CONTRACT_PATH}: could not read repository config-reference contract: ${
        error instanceof Error ? error.message : 'unknown read error'
      }`,
    };
  }

  const targets: string[] = [];
  let section = '';
  for (const line of content.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) {
      continue;
    }
    const topLevel = /^([A-Za-z][A-Za-z0-9_]*):(?:\s*(.*))?$/.exec(line);
    if (topLevel) {
      section = topLevel[1] ?? '';
      continue;
    }
    if (section === 'protected_targets') {
      const entry = /^  -\s*(.+?)\s*$/.exec(line);
      if (entry?.[1]) {
        targets.push(toRepoPath(stripInlineComment(entry[1])));
      }
    }
  }
  return { targets, error: null };
}

function emptyStats(): ProtectedSurfaceStats {
  return {
    protectedTargets: 0,
    stagedViolations: 0,
    unstagedViolations: 0,
    untrackedViolations: 0,
    commitRangeViolations: 0,
  };
}

function formatResult(
  failures: string[],
  stats: ProtectedSurfaceStats,
  evaluatedState: string,
  rerunCommand: string,
): ProtectedSurfaceResult {
  const outputLines =
    failures.length === 0
      ? [
          'Protected-surface immutability check',
          `Evaluated Git state: ${evaluatedState}`,
          `Protected targets: ${stats.protectedTargets}`,
          `Staged protected changes: ${stats.stagedViolations}`,
          `Unstaged protected changes: ${stats.unstagedViolations}`,
          `Untracked protected files: ${stats.untrackedViolations}`,
          `Commit-range protected changes: ${stats.commitRangeViolations}`,
          'Protected-surface violations: 0',
          'PASS',
        ]
      : [
          'Protected-surface immutability check failed',
          `Evaluated Git state: ${evaluatedState}`,
          '',
          ...failures,
          '',
          'Protected bodies are immutable; restore them or move the change, then rerun:',
          `  ${rerunCommand}`,
        ];

  return {
    ok: failures.length === 0,
    output: outputLines.join('\n'),
    failures,
    stats,
    evaluatedState,
  };
}

function checkStaged(
  repoRoot: string,
  targets: string[],
): { failures: string[]; stats: ProtectedSurfaceStats; evaluatedState: string } {
  const stats = emptyStats();
  stats.protectedTargets = targets.length;
  const failures: string[] = [];

  const staged = parseGitPaths(
    runGit(repoRoot, ['diff', '--cached', '--name-only', '-z', '--', ...targets]),
  );
  const unstaged = parseGitPaths(runGit(repoRoot, ['diff', '--name-only', '-z', '--', ...targets]));
  const untracked = parseGitPaths(
    runGit(repoRoot, ['ls-files', '--others', '--exclude-standard', '-z', '--', ...targets]),
  );

  stats.stagedViolations = staged.length;
  stats.unstagedViolations = unstaged.length;
  stats.untrackedViolations = untracked.length;

  for (const pathValue of staged) {
    failures.push(`Staged change to protected surface (HEAD vs index): ${pathValue}`);
  }
  for (const pathValue of unstaged) {
    failures.push(`Unstaged worktree modification of protected surface: ${pathValue}`);
  }
  for (const pathValue of untracked) {
    failures.push(`Untracked new file inside protected surface: ${pathValue}`);
  }

  return {
    failures,
    stats,
    evaluatedState: 'HEAD vs staged index vs worktree (staged mode)',
  };
}

function checkCommitRange(
  repoRoot: string,
  targets: string[],
  baseInput: string,
  headInput: string,
): { failures: string[]; stats: ProtectedSurfaceStats; evaluatedState: string } {
  const stats = emptyStats();
  stats.protectedTargets = targets.length;
  const failures: string[] = [];

  const base = tryRunGit(repoRoot, ['rev-parse', '--verify', `${baseInput}^{commit}`])?.trim();
  if (!base || tryRunGit(repoRoot, ['cat-file', '-e', `${baseInput}^{commit}`]) === null) {
    failures.push(`Invalid Git revision for --base: ${baseInput}`);
  }
  const head = tryRunGit(repoRoot, ['rev-parse', '--verify', `${headInput}^{commit}`])?.trim();
  if (!head || tryRunGit(repoRoot, ['cat-file', '-e', `${headInput}^{commit}`]) === null) {
    failures.push(`Invalid Git revision for --head: ${headInput}`);
  }

  const evaluatedState =
    base && head
      ? `git diff ${base}..${head} over protected targets (commit-range mode)`
      : 'commit-range mode (revision resolution failed)';

  if (!base || !head) {
    return { failures, stats, evaluatedState };
  }

  const changed = parseGitPaths(
    runGit(repoRoot, ['diff', '--name-only', '-z', base, head, '--', ...targets]),
  );
  stats.commitRangeViolations = changed.length;
  for (const pathValue of changed) {
    failures.push(`Protected surface changed between ${base} and ${head}: ${pathValue}`);
  }

  return { failures, stats, evaluatedState };
}

export function checkProtectedSurfaces(
  repoRootInput?: string,
  options: ProtectedSurfaceOptions = {},
): ProtectedSurfaceResult {
  const repoRoot = resolveRepoRoot(repoRootInput);
  const mode = options.mode ?? 'staged';
  const rerunCommand =
    mode === 'commit-range' && options.base && options.head
      ? `npm run check:protected-surfaces -- --base ${options.base} --head ${options.head}`
      : 'npm run check:protected-surfaces';

  const { targets, error } = loadProtectedTargets(repoRoot);
  if (error !== null) {
    return formatResult([error], emptyStats(), 'none (contract load failed)', rerunCommand);
  }
  if (targets.length === 0) {
    return formatResult(
      [`${CONTRACT_PATH}: protected_targets declares no targets`],
      emptyStats(),
      'none (contract load failed)',
      rerunCommand,
    );
  }

  if (mode === 'staged') {
    const { failures, stats, evaluatedState } = checkStaged(repoRoot, targets);
    return formatResult(failures, stats, evaluatedState, rerunCommand);
  }

  if (!options.base || !options.head) {
    return formatResult(
      ['Commit-range mode requires both --base <base-sha> and --head <head-sha>.'],
      emptyStats(),
      'none (usage error)',
      'npm run check:protected-surfaces -- --base <base-sha> --head <head-sha>',
    );
  }

  const { failures, stats, evaluatedState } = checkCommitRange(
    repoRoot,
    targets,
    options.base,
    options.head,
  );
  return formatResult(failures, stats, evaluatedState, rerunCommand);
}

const USAGE = `Usage:
  npm run check:protected-surfaces
  npm run check:protected-surfaces -- --staged
  npm run check:protected-surfaces -- --base <base-sha> --head <head-sha>

Options:
  --staged        Check HEAD vs index vs worktree for protected-surface changes. This is the default.
  --base <sha>    Base commit for commit-range mode.
  --head <sha>    Head commit for commit-range mode.
  --help          Show this help text.`;

type ParsedCli =
  | { kind: 'run'; options: ProtectedSurfaceOptions }
  | { kind: 'help'; output: string }
  | { kind: 'error'; output: string };

export function parseProtectedSurfaceCliArgs(args: string[]): ParsedCli {
  let staged = false;
  let base: string | undefined;
  let head: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--help') {
      return { kind: 'help', output: USAGE };
    }
    if (arg === '--staged') {
      staged = true;
      continue;
    }
    if (arg === '--base') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) {
        return { kind: 'error', output: `Missing value for --base.\n\n${USAGE}` };
      }
      base = value;
      index += 1;
      continue;
    }
    if (arg === '--head') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) {
        return { kind: 'error', output: `Missing value for --head.\n\n${USAGE}` };
      }
      head = value;
      index += 1;
      continue;
    }
    return { kind: 'error', output: `Unknown argument: ${arg}\n\n${USAGE}` };
  }

  if (staged && (base || head)) {
    return {
      kind: 'error',
      output: `--staged cannot be combined with --base or --head.\n\n${USAGE}`,
    };
  }
  if ((base && !head) || (head && !base)) {
    return {
      kind: 'error',
      output: `Commit-range mode requires both --base and --head.\n\n${USAGE}`,
    };
  }

  if (base && head) {
    return { kind: 'run', options: { mode: 'commit-range', base, head } };
  }
  return { kind: 'run', options: { mode: 'staged' } };
}

function main(): void {
  const parsed = parseProtectedSurfaceCliArgs(process.argv.slice(2));
  if (parsed.kind === 'help') {
    console.log(parsed.output);
    return;
  }
  if (parsed.kind === 'error') {
    console.error(parsed.output);
    process.exitCode = 2;
    return;
  }

  const result = checkProtectedSurfaces(undefined, parsed.options);
  console.log(result.output);
  if (!result.ok) {
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main();
}
