import { execFileSync } from 'node:child_process';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CONFIG_DOCREF_MARKER = 'config-docref';
export const INDEX_START = '<!-- config-reference-index:start -->';
export const INDEX_END = '<!-- config-reference-index:end -->';
export const PROTECTED_SIDECAR = 'docs/internal/PROTECTED_CONFIG_REFERENCE_INDEX.md';

export interface ConfigReference {
  sourcePath: string;
  line: number;
  rawTarget: string;
  targetPath: string;
}

export interface ParseProblem {
  sourcePath: string;
  line: number;
  message: string;
}

export interface ParseResult {
  references: ConfigReference[];
  problems: ParseProblem[];
}

interface GitChange {
  status: string;
  oldPath: string | null;
  newPath: string | null;
}

interface ReferenceDelta {
  sourcePath: string;
  line: number;
  targetPath: string;
  kind: 'added' | 'removed';
}

interface CheckStats {
  changedGovernedSourceFiles: number;
  addedReferences: number;
  removedReferences: number;
  mutableTargetIndexesChecked: number;
  protectedSidecarSectionsChecked: number;
}

export type CheckMode = 'staged' | 'commit-range';

export interface CheckOptions {
  mode?: CheckMode;
  base?: string;
  head?: string;
}

export interface CheckResult {
  ok: boolean;
  output: string;
  failures: string[];
  stats: CheckStats;
}

interface ManagedIndex {
  entries: Set<string>;
  problems: string[];
}

interface CheckContext {
  repoRoot: string;
  changedPaths: Set<string>;
  changes: GitChange[];
  mode: CheckMode;
  rerunCommand: string;
  readOld(pathValue: string): string | null;
  readNew(pathValue: string): string | null;
}

function toRepoPath(pathValue: string): string {
  return pathValue.replace(/\\/g, '/').replace(/^\.\//, '');
}

function toNativePath(pathValue: string): string {
  return pathValue.split('/').join(sep);
}

function stripFragment(pathValue: string): string {
  const hashIndex = pathValue.indexOf('#');
  return hashIndex === -1 ? pathValue : pathValue.slice(0, hashIndex);
}

function isUrl(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(value) && !/^[a-z]:[\\/]/i.test(value);
}

function looksLikeLocalFileReference(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('#') || isUrl(trimmed) || trimmed.includes('*')) {
    return false;
  }
  return /\.(md|json|jsonc|ya?ml|toml|txt|ps1|sh|bash|cmd|bat)$/i.test(stripFragment(trimmed));
}

function normalizeTargetPath(
  repoRoot: string,
  sourcePath: string,
  rawTarget: string,
): string | null {
  const cleaned = stripFragment(rawTarget.trim().replace(/^<|>$/g, ''));
  if (!looksLikeLocalFileReference(cleaned)) {
    return null;
  }

  const sourceDir = dirname(toNativePath(sourcePath));
  const nativeTarget = cleaned.replace(/\//g, sep).replace(/\\/g, sep);
  const absoluteTarget = isAbsolute(nativeTarget)
    ? resolve(nativeTarget)
    : cleaned.startsWith('docs/') ||
        cleaned.startsWith('.agents/') ||
        cleaned.startsWith('tools/') ||
        cleaned === 'AGENTS.md'
      ? resolve(repoRoot, nativeTarget)
      : resolve(repoRoot, sourceDir, nativeTarget);
  const relativeTarget = toRepoPath(relative(repoRoot, absoluteTarget));
  if (relativeTarget.startsWith('..') || isAbsolute(relativeTarget)) {
    return null;
  }
  return relativeTarget;
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

function extractCandidateTargets(line: string): string[] {
  const cleaned = line.replaceAll(CONFIG_DOCREF_MARKER, '');
  const candidates: string[] = [];

  const markdownLinks = cleaned.matchAll(/\[[^\]]*]\(([^)]+)\)/g);
  for (const match of markdownLinks) {
    const target = match[1];
    if (target && looksLikeLocalFileReference(target)) {
      candidates.push(target);
    }
  }

  const quoted = cleaned.matchAll(/[`"']([^`"']+)[`"']/g);
  for (const match of quoted) {
    const target = match[1];
    if (target && looksLikeLocalFileReference(target)) {
      candidates.push(target);
    }
  }

  const unquoted = cleaned.matchAll(
    /(?:[A-Za-z]:[\\/][^\s)]+|(?:\.{1,2}[\\/])?(?:[A-Za-z0-9_. -]+[\\/])+[A-Za-z0-9_. -]+\.(?:md|json|jsonc|ya?ml|toml|txt|ps1|sh|bash|cmd|bat))/g,
  );
  for (const match of unquoted) {
    const target = match[0];
    if (looksLikeLocalFileReference(target)) {
      candidates.push(target);
    }
  }

  return dedupe(candidates);
}

function isStandaloneMarker(trimmedLine: string): boolean {
  return (
    trimmedLine === `<!-- ${CONFIG_DOCREF_MARKER} -->` ||
    trimmedLine === `# ${CONFIG_DOCREF_MARKER}` ||
    trimmedLine === `// ${CONFIG_DOCREF_MARKER}`
  );
}

function hasRecognizedMarker(line: string): boolean {
  return (
    line.includes(`<!-- ${CONFIG_DOCREF_MARKER} -->`) ||
    line.includes(`# ${CONFIG_DOCREF_MARKER}`) ||
    line.includes(`// ${CONFIG_DOCREF_MARKER}`)
  );
}

function addReferenceFromLine(
  repoRoot: string,
  sourcePath: string,
  lineNumber: number,
  line: string,
  references: ConfigReference[],
  problems: ParseProblem[],
): void {
  const rawCandidates = extractCandidateTargets(line);
  const normalized = rawCandidates
    .map((candidate) => ({
      raw: candidate,
      normalized: normalizeTargetPath(repoRoot, sourcePath, candidate),
    }))
    .filter(
      (candidate): candidate is { raw: string; normalized: string } =>
        candidate.normalized !== null,
    );

  const targetPaths = dedupe(normalized.map((candidate) => candidate.normalized));
  if (targetPaths.length === 0) {
    problems.push({
      sourcePath,
      line: lineNumber,
      message: 'config-docref marker did not bind to a repository-local file reference',
    });
    return;
  }
  if (targetPaths.length > 1) {
    problems.push({
      sourcePath,
      line: lineNumber,
      message: `config-docref marker binds to multiple file references: ${targetPaths.join(', ')}`,
    });
    return;
  }

  const targetPath = targetPaths[0];
  if (!targetPath) {
    problems.push({
      sourcePath,
      line: lineNumber,
      message: 'config-docref marker did not bind to a repository-local file reference',
    });
    return;
  }

  references.push({
    sourcePath,
    line: lineNumber,
    rawTarget: normalized[0]?.raw ?? targetPath,
    targetPath,
  });
}

function lineForText(content: string, text: string): number {
  const index = content.indexOf(text);
  if (index === -1) {
    return 1;
  }
  return content.slice(0, index).split(/\r?\n/).length;
}

function parseJsonObjects(
  repoRoot: string,
  sourcePath: string,
  content: string,
  references: ConfigReference[],
  problems: ParseProblem[],
): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    problems.push({
      sourcePath,
      line: 1,
      message: `JSON source could not be parsed: ${error instanceof Error ? error.message : 'invalid JSON'}`,
    });
    return;
  }

  const visit = (value: unknown, location: string): void => {
    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1) {
        visit(value[index], `${location}[${index}]`);
      }
      return;
    }
    if (!value || typeof value !== 'object') {
      return;
    }

    const record = value as Record<string, unknown>;
    if (record.configDocref === true) {
      const pathValue = record.path;
      const markerLine = lineForText(content, '"configDocref"');
      if (!Object.hasOwn(record, 'path')) {
        problems.push({
          sourcePath,
          line: markerLine,
          message: `configDocref object at ${location} must contain exactly one string path field`,
        });
      } else if (typeof pathValue !== 'string') {
        problems.push({
          sourcePath,
          line: markerLine,
          message: `configDocref object at ${location} path must be a string`,
        });
      } else if (pathValue.trim().length === 0) {
        problems.push({
          sourcePath,
          line: markerLine,
          message: `configDocref object at ${location} path must not be empty`,
        });
      } else {
        const targetPath = normalizeTargetPath(repoRoot, sourcePath, pathValue);
        const targetLine = lineForText(content, pathValue);
        if (targetPath === null) {
          problems.push({
            sourcePath,
            line: targetLine,
            message: `configDocref object path is not a repository-local file reference: ${pathValue}`,
          });
        } else {
          references.push({
            sourcePath,
            line: targetLine,
            rawTarget: pathValue,
            targetPath,
          });
        }
      }
    }

    for (const [key, item] of Object.entries(record)) {
      visit(item, `${location}.${key}`);
    }
  };

  visit(parsed, '$');
}

function findUnmarkedTargetOccurrence(
  repoRoot: string,
  sourcePath: string,
  content: string,
  targetPath: string,
  governedRefs: ConfigReference[],
): number | null {
  const governedLines = new Set(
    governedRefs
      .filter((reference) => reference.targetPath === targetPath)
      .map((reference) => reference.line),
  );
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    const lineNumber = index + 1;
    if (governedLines.has(lineNumber)) {
      continue;
    }
    const candidates = extractCandidateTargets(line)
      .map((candidate) => normalizeTargetPath(repoRoot, sourcePath, candidate))
      .filter((candidate): candidate is string => candidate !== null);
    if (candidates.includes(targetPath)) {
      return lineNumber;
    }
  }

  return null;
}

function detectMarkerRemovalBypass(
  context: CheckContext,
  oldRefs: ConfigReference[],
  newRefs: ConfigReference[],
  newPath: string | null,
  newContent: string | null,
  failures: string[],
): void {
  if (!newPath || newContent === null) {
    return;
  }

  const newTargets = new Set(newRefs.map((reference) => reference.targetPath));
  for (const oldReference of oldRefs) {
    if (newTargets.has(oldReference.targetPath)) {
      continue;
    }
    const line = findUnmarkedTargetOccurrence(
      context.repoRoot,
      newPath,
      newContent,
      oldReference.targetPath,
      newRefs,
    );
    if (line !== null) {
      failures.push(
        `${newPath}:${line}: Previously governed reference remains present without config-docref marker.\n  Target: ${oldReference.targetPath}\n  Removing a marker is not a valid reconciliation repair.`,
      );
    }
  }
}

export function parseMarkedReferences(
  repoRoot: string,
  sourcePath: string,
  content: string,
): ParseResult {
  const references: ConfigReference[] = [];
  const problems: ParseProblem[] = [];
  const lines = content.split(/\r?\n/);
  let inFence = false;

  if (sourcePath.endsWith('.json')) {
    parseJsonObjects(repoRoot, sourcePath, content, references, problems);
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence || !hasRecognizedMarker(line)) {
      continue;
    }

    const sameLineCandidates = extractCandidateTargets(line);
    if (sameLineCandidates.length > 0) {
      addReferenceFromLine(repoRoot, sourcePath, index + 1, line, references, problems);
      continue;
    }

    if (!isStandaloneMarker(trimmed)) {
      problems.push({
        sourcePath,
        line: index + 1,
        message:
          'config-docref marker must be inline with a reference or standalone on its own comment line',
      });
      continue;
    }

    let bound = false;
    for (let next = index + 1; next < lines.length; next += 1) {
      const nextLine = lines[next] ?? '';
      const nextTrimmed = nextLine.trim();
      if (!nextTrimmed) {
        continue;
      }
      if (
        nextTrimmed.includes(CONFIG_DOCREF_MARKER) ||
        nextTrimmed.startsWith('#') ||
        nextTrimmed.startsWith('```')
      ) {
        problems.push({
          sourcePath,
          line: index + 1,
          message: 'standalone config-docref marker does not bind across a structural boundary',
        });
        bound = true;
        break;
      }
      addReferenceFromLine(repoRoot, sourcePath, next + 1, nextLine, references, problems);
      bound = true;
      break;
    }

    if (!bound) {
      problems.push({
        sourcePath,
        line: index + 1,
        message: 'standalone config-docref marker has no following reference line',
      });
    }
  }

  return { references, problems };
}

function isExcluded(pathValue: string): boolean {
  return (
    pathValue.startsWith('.git/') ||
    pathValue.startsWith('node_modules/') ||
    pathValue.startsWith('dist/') ||
    pathValue.startsWith('build/') ||
    pathValue.startsWith('coverage/') ||
    pathValue.startsWith('docs/releases/') ||
    pathValue.startsWith('docs/architecture/') ||
    pathValue.startsWith('vendor/')
  );
}

function hasAllowedMarkedExtension(pathValue: string): boolean {
  return /\.(md|ya?ml|json|jsonc|toml|sh|bash|ps1|cmd|bat)$/i.test(pathValue);
}

function isGovernedSourceCandidate(pathValue: string): boolean {
  if (isExcluded(pathValue)) {
    return false;
  }
  if (pathValue === 'AGENTS.md' || pathValue.endsWith('/AGENTS.md')) {
    return true;
  }
  if (/^\.agents\/skills\/[^/]+\/SKILL\.md$/.test(pathValue)) {
    return true;
  }
  if (/^docs\/internal\/phase_prompts\/.+\.md$/.test(pathValue)) {
    return true;
  }
  if (/^docs\/internal\/.*WORKFLOW.*\.md$/.test(pathValue)) {
    return true;
  }
  return hasAllowedMarkedExtension(pathValue);
}

function isProtectedTarget(pathValue: string): boolean {
  return pathValue.startsWith('docs/architecture/') || pathValue.startsWith('docs/releases/');
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

function readRevision(repoRoot: string, revision: string, pathValue: string): string | null {
  return tryRunGit(repoRoot, ['show', `${revision}:${pathValue}`]);
}

function readIndex(repoRoot: string, pathValue: string): string | null {
  return tryRunGit(repoRoot, ['show', `:${pathValue}`]);
}

function resolveCommit(repoRoot: string, revision: string): string | null {
  return tryRunGit(repoRoot, ['rev-parse', '--verify', `${revision}^{commit}`])?.trim() ?? null;
}

function parseNameStatus(output: string): GitChange[] {
  const parts = output.split('\0').filter((part) => part.length > 0);
  const changes: GitChange[] = [];
  for (let index = 0; index < parts.length;) {
    const status = parts[index];
    if (!status) {
      break;
    }
    index += 1;
    if (status.startsWith('R') || status.startsWith('C')) {
      const oldPath = parts[index] ?? null;
      const newPath = parts[index + 1] ?? null;
      index += 2;
      changes.push({ status, oldPath, newPath });
    } else {
      const changedPath = parts[index] ?? null;
      index += 1;
      const normalizedStatus = status.slice(0, 1);
      changes.push({
        status,
        oldPath: normalizedStatus === 'A' ? null : changedPath,
        newPath: normalizedStatus === 'D' ? null : changedPath,
      });
    }
  }
  return changes;
}

function referenceKey(sourcePath: string, targetPath: string): string {
  return `${sourcePath}\u0000${targetPath}`;
}

function parseReferencesForSnapshot(
  repoRoot: string,
  sourcePath: string,
  content: string | null,
  failures: string[],
): ConfigReference[] {
  if (content === null) {
    return [];
  }
  const parsed = parseMarkedReferences(repoRoot, sourcePath, content);
  for (const problem of parsed.problems) {
    failures.push(`${problem.sourcePath}:${problem.line}: ${problem.message}`);
  }
  return parsed.references;
}

function parseManagedIndex(content: string, targetLabel: string): ManagedIndex {
  const lines = content.split(/\r?\n/);
  const startIndexes: number[] = [];
  const endIndexes: number[] = [];
  let inFence = false;
  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = (lines[index] ?? '').trim();
    if (trimmed.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }
    if (trimmed === INDEX_START) {
      startIndexes.push(index);
    }
    if (trimmed === INDEX_END) {
      endIndexes.push(index);
    }
  }

  const problems: string[] = [];
  if (startIndexes.length !== 1 || endIndexes.length !== 1) {
    return {
      entries: new Set(),
      problems: [`${targetLabel}: expected exactly one config-reference-index marker pair`],
    };
  }

  const start = startIndexes[0];
  const end = endIndexes[0];
  if (start === undefined || end === undefined || start >= end) {
    return {
      entries: new Set(),
      problems: [`${targetLabel}: config-reference-index markers are out of order`],
    };
  }

  const entries: string[] = [];
  for (const line of lines.slice(start + 1, end)) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    const match = /^- `([^`]+)`(?:\s+.*)?$/.exec(trimmed);
    if (!match?.[1]) {
      problems.push(`${targetLabel}: malformed index entry "${trimmed}"`);
      continue;
    }
    entries.push(toRepoPath(match[1]));
  }

  const sortedEntries = [...entries].sort((left, right) => left.localeCompare(right));
  if (entries.join('\n') !== sortedEntries.join('\n')) {
    problems.push(`${targetLabel}: index entries must be sorted lexicographically`);
  }
  if (new Set(entries).size !== entries.length) {
    problems.push(`${targetLabel}: duplicate source path in config reference index`);
  }

  return { entries: new Set(entries), problems };
}

function parseProtectedIndex(content: string, targetPath: string): ManagedIndex {
  const lines = content.split(/\r?\n/);
  const heading = `## \`${targetPath}\``;
  const headingIndex = lines.findIndex((line) => line.trim() === heading);
  if (headingIndex === -1) {
    return {
      entries: new Set(),
      problems: [`${PROTECTED_SIDECAR}: missing protected target section for ${targetPath}`],
    };
  }
  let endIndex = lines.length;
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const trimmed = (lines[index] ?? '').trim();
    if (trimmed.startsWith('## `')) {
      endIndex = index;
      break;
    }
  }
  return parseManagedIndex(
    lines.slice(headingIndex + 1, endIndex).join('\n'),
    `${PROTECTED_SIDECAR} ${heading}`,
  );
}

function parseOptionalManagedIndex(content: string, targetLabel: string): ManagedIndex | null {
  if (!content.includes(INDEX_START) && !content.includes(INDEX_END)) {
    return null;
  }
  return parseManagedIndex(content, targetLabel);
}

function parseOptionalProtectedIndex(content: string, targetPath: string): ManagedIndex | null {
  if (!content.split(/\r?\n/).some((line) => line.trim() === `## \`${targetPath}\``)) {
    return null;
  }
  return parseProtectedIndex(content, targetPath);
}

function formatDelta(delta: ReferenceDelta): string {
  const label = delta.kind === 'added' ? 'Added' : 'Removed';
  return `${label} marked reference:\n  Source: ${delta.sourcePath}:${delta.line}\n  Target: ${delta.targetPath}`;
}

function checkMutableTarget(
  context: CheckContext,
  delta: ReferenceDelta,
  failures: string[],
  stats: CheckStats,
): void {
  const targetContent = context.readNew(delta.targetPath);
  if (targetContent === null) {
    if (delta.kind === 'removed') {
      return;
    }
    failures.push(`${formatDelta(delta)}\n  Missing target file: ${delta.targetPath}`);
    return;
  }
  if (!context.changedPaths.has(delta.targetPath)) {
    failures.push(
      `${formatDelta(delta)}\n  Missing staged reverse-index update in mutable target: ${delta.targetPath}`,
    );
    return;
  }

  const index = parseManagedIndex(targetContent, delta.targetPath);
  stats.mutableTargetIndexesChecked += 1;
  failures.push(...index.problems);
  const hasEntry = index.entries.has(delta.sourcePath);
  if (delta.kind === 'added' && !hasEntry) {
    failures.push(`${formatDelta(delta)}\n  Missing reverse-index entry for ${delta.sourcePath}`);
  }
  if (delta.kind === 'removed' && hasEntry) {
    failures.push(
      `${formatDelta(delta)}\n  Stale reverse-index entry remains for ${delta.sourcePath}`,
    );
  }
}

function checkProtectedTarget(
  context: CheckContext,
  delta: ReferenceDelta,
  failures: string[],
  stats: CheckStats,
): void {
  if (context.changedPaths.has(delta.targetPath)) {
    const oldContent = context.readOld(delta.targetPath);
    if (oldContent !== null) {
      failures.push(
        `${formatDelta(delta)}\n  Protected target bodies must not be modified for reconciliation: ${delta.targetPath}`,
      );
      return;
    }
  }
  if (!context.changedPaths.has(PROTECTED_SIDECAR)) {
    failures.push(
      `${formatDelta(delta)}\n  Missing staged protected sidecar update: ${PROTECTED_SIDECAR}`,
    );
    return;
  }

  const sidecarContent = context.readNew(PROTECTED_SIDECAR);
  if (sidecarContent === null) {
    failures.push(`${formatDelta(delta)}\n  Missing protected sidecar: ${PROTECTED_SIDECAR}`);
    return;
  }

  const index = parseProtectedIndex(sidecarContent, delta.targetPath);
  stats.protectedSidecarSectionsChecked += 1;
  failures.push(...index.problems);
  const hasEntry = index.entries.has(delta.sourcePath);
  if (delta.kind === 'added' && !hasEntry) {
    failures.push(
      `${formatDelta(delta)}\n  Missing protected sidecar entry for ${delta.sourcePath}`,
    );
  }
  if (delta.kind === 'removed' && hasEntry) {
    failures.push(
      `${formatDelta(delta)}\n  Stale protected sidecar entry remains for ${delta.sourcePath}`,
    );
  }
}

function sourceRenameMap(changes: GitChange[]): Map<string, string> {
  const renamed = new Map<string, string>();
  for (const change of changes) {
    if (change.status.startsWith('R') && change.oldPath && change.newPath) {
      renamed.set(toRepoPath(change.oldPath), toRepoPath(change.newPath));
    }
  }
  return renamed;
}

function isDeletedSource(changes: GitChange[], sourcePath: string): boolean {
  return changes.some(
    (change) =>
      change.oldPath !== null &&
      toRepoPath(change.oldPath) === sourcePath &&
      change.newPath === null &&
      change.status.startsWith('D'),
  );
}

function oldInboundIndexForTarget(context: CheckContext, targetPath: string): ManagedIndex | null {
  if (isProtectedTarget(targetPath)) {
    const oldSidecar = context.readOld(PROTECTED_SIDECAR);
    return oldSidecar === null ? null : parseOptionalProtectedIndex(oldSidecar, targetPath);
  }
  const oldTargetContent = context.readOld(targetPath);
  return oldTargetContent === null ? null : parseOptionalManagedIndex(oldTargetContent, targetPath);
}

function newInboundIndexForTarget(context: CheckContext, targetPath: string): ManagedIndex | null {
  if (isProtectedTarget(targetPath)) {
    const newSidecar = context.readNew(PROTECTED_SIDECAR);
    return newSidecar === null ? null : parseOptionalProtectedIndex(newSidecar, targetPath);
  }
  const newTargetContent = context.readNew(targetPath);
  return newTargetContent === null ? null : parseOptionalManagedIndex(newTargetContent, targetPath);
}

function checkTargetRenameOrDeletion(
  context: CheckContext,
  change: GitChange,
  failures: string[],
  stats: CheckStats,
  renamedSources: Map<string, string>,
): void {
  const oldTargetPath = change.oldPath ? toRepoPath(change.oldPath) : null;
  const newTargetPath = change.newPath ? toRepoPath(change.newPath) : null;
  if (!oldTargetPath || oldTargetPath === newTargetPath) {
    return;
  }
  if (!(change.status.startsWith('R') || change.status.startsWith('D'))) {
    return;
  }

  const oldIndex = oldInboundIndexForTarget(context, oldTargetPath);
  if (oldIndex === null) {
    return;
  }
  if (isProtectedTarget(oldTargetPath)) {
    stats.protectedSidecarSectionsChecked += 1;
  } else {
    stats.mutableTargetIndexesChecked += 1;
  }
  failures.push(...oldIndex.problems);
  if (oldIndex.entries.size === 0) {
    return;
  }

  if (isProtectedTarget(oldTargetPath)) {
    failures.push(
      `Protected target rename/delete is not a supported reconciliation repair: ${oldTargetPath}`,
    );
    return;
  }

  const newIndex = newTargetPath ? newInboundIndexForTarget(context, newTargetPath) : null;
  if (newTargetPath) {
    if (newIndex === null) {
      failures.push(
        `Target rename missing Config Reference Index in new target: ${oldTargetPath} -> ${newTargetPath}`,
      );
    } else {
      stats.mutableTargetIndexesChecked += 1;
      failures.push(...newIndex.problems);
    }
  }

  for (const oldSourcePath of oldIndex.entries) {
    const newSourcePath = renamedSources.get(oldSourcePath) ?? oldSourcePath;
    const newSourceContent = context.readNew(newSourcePath);
    if (newSourceContent === null) {
      if (newTargetPath === null && isDeletedSource(context.changes, oldSourcePath)) {
        continue;
      }
      failures.push(
        `Indexed source for moved/deleted target is missing: ${oldSourcePath} -> ${oldTargetPath}`,
      );
      continue;
    }

    const newRefs = parseReferencesForSnapshot(
      context.repoRoot,
      newSourcePath,
      newSourceContent,
      failures,
    );
    if (newRefs.some((reference) => reference.targetPath === oldTargetPath)) {
      failures.push(
        `Stale inbound marked reference after target ${newTargetPath ? 'rename' : 'deletion'}:\n  Source: ${newSourcePath}\n  Old target: ${oldTargetPath}`,
      );
      continue;
    }

    if (!newTargetPath) {
      continue;
    }

    if (!newRefs.some((reference) => reference.targetPath === newTargetPath)) {
      failures.push(
        `Target rename missing inbound source update:\n  Source: ${newSourcePath}\n  Old target: ${oldTargetPath}\n  New target: ${newTargetPath}`,
      );
      continue;
    }

    if (newIndex !== null && !newIndex.entries.has(newSourcePath)) {
      failures.push(
        `Target rename missing reverse-index source continuity:\n  Source: ${newSourcePath}\n  New target: ${newTargetPath}`,
      );
    }
  }
}

function checkTargetRenamesAndDeletions(
  context: CheckContext,
  failures: string[],
  stats: CheckStats,
): void {
  const renamedSources = sourceRenameMap(context.changes);
  for (const change of context.changes) {
    checkTargetRenameOrDeletion(context, change, failures, stats, renamedSources);
  }
}

function buildDeltas(
  oldRefs: ConfigReference[],
  newRefs: ConfigReference[],
): { added: ReferenceDelta[]; removed: ReferenceDelta[] } {
  const oldByKey = new Map(
    oldRefs.map((ref) => [referenceKey(ref.sourcePath, ref.targetPath), ref]),
  );
  const newByKey = new Map(
    newRefs.map((ref) => [referenceKey(ref.sourcePath, ref.targetPath), ref]),
  );
  const added: ReferenceDelta[] = [];
  const removed: ReferenceDelta[] = [];

  for (const [key, ref] of newByKey) {
    if (!oldByKey.has(key)) {
      added.push({
        sourcePath: ref.sourcePath,
        line: ref.line,
        targetPath: ref.targetPath,
        kind: 'added',
      });
    }
  }

  for (const [key, ref] of oldByKey) {
    if (!newByKey.has(key)) {
      removed.push({
        sourcePath: ref.sourcePath,
        line: ref.line,
        targetPath: ref.targetPath,
        kind: 'removed',
      });
    }
  }

  return { added, removed };
}

function emptyStats(): CheckStats {
  return {
    changedGovernedSourceFiles: 0,
    addedReferences: 0,
    removedReferences: 0,
    mutableTargetIndexesChecked: 0,
    protectedSidecarSectionsChecked: 0,
  };
}

function formatCheckResult(
  failures: string[],
  stats: CheckStats,
  rerunCommand: string,
): CheckResult {
  const outputLines =
    failures.length === 0
      ? [
          'Config-reference reconciliation',
          `Changed governed source files: ${stats.changedGovernedSourceFiles}`,
          `Added references: ${stats.addedReferences}`,
          `Removed references: ${stats.removedReferences}`,
          `Mutable target indexes checked: ${stats.mutableTargetIndexesChecked}`,
          `Protected sidecar sections checked: ${stats.protectedSidecarSectionsChecked}`,
          'Unreconciled references: 0',
          'PASS',
        ]
      : [
          'Config-reference reconciliation failed',
          '',
          ...failures,
          '',
          'Update the affected Config Reference Index or protected sidecar, then rerun:',
          `  ${rerunCommand}`,
        ];

  return {
    ok: failures.length === 0,
    output: outputLines.join('\n'),
    failures,
    stats,
  };
}

function resolveRepoRoot(repoRootInput?: string): string {
  return repoRootInput
    ? resolve(repoRootInput)
    : runGit(process.cwd(), ['rev-parse', '--show-toplevel']).trim();
}

function buildContext(repoRoot: string, options: CheckOptions): CheckContext | CheckResult {
  const mode = options.mode ?? 'staged';
  if (mode === 'staged') {
    const changes = parseNameStatus(
      runGit(repoRoot, ['diff', '--cached', '--name-status', '-M', '-z']),
    );
    return {
      repoRoot,
      changes,
      changedPaths: changedPathsForChanges(changes),
      mode,
      rerunCommand: 'npm run check:config-references',
      readOld: (pathValue: string) => readRevision(repoRoot, 'HEAD', pathValue),
      readNew: (pathValue: string) => readIndex(repoRoot, pathValue),
    };
  }

  if (!options.base || !options.head) {
    return formatCheckResult(
      ['Commit-range mode requires both --base <base-sha> and --head <head-sha>.'],
      emptyStats(),
      'npm run check:config-references -- --base <base-sha> --head <head-sha>',
    );
  }

  const base = resolveCommit(repoRoot, options.base);
  const head = resolveCommit(repoRoot, options.head);
  if (base === null) {
    return formatCheckResult(
      [`Invalid Git revision for --base: ${options.base}`],
      emptyStats(),
      'npm run check:config-references -- --base <base-sha> --head <head-sha>',
    );
  }
  if (head === null) {
    return formatCheckResult(
      [`Invalid Git revision for --head: ${options.head}`],
      emptyStats(),
      'npm run check:config-references -- --base <base-sha> --head <head-sha>',
    );
  }

  const changes = parseNameStatus(
    runGit(repoRoot, ['diff', '--name-status', '-M', '-z', base, head]),
  );
  return {
    repoRoot,
    changes,
    changedPaths: changedPathsForChanges(changes),
    mode,
    rerunCommand: `npm run check:config-references -- --base ${base} --head ${head}`,
    readOld: (pathValue: string) => readRevision(repoRoot, base, pathValue),
    readNew: (pathValue: string) => readRevision(repoRoot, head, pathValue),
  };
}

function changedPathsForChanges(changes: GitChange[]): Set<string> {
  const changedPaths = new Set<string>();
  for (const change of changes) {
    if (change.oldPath) {
      changedPaths.add(toRepoPath(change.oldPath));
    }
    if (change.newPath) {
      changedPaths.add(toRepoPath(change.newPath));
    }
  }
  return changedPaths;
}

export function checkConfigReferences(
  repoRootInput?: string,
  options: CheckOptions = {},
): CheckResult {
  const repoRoot = resolveRepoRoot(repoRootInput);
  const contextOrResult = buildContext(repoRoot, options);
  if ('ok' in contextOrResult) {
    return contextOrResult;
  }
  const context = contextOrResult;

  const failures: string[] = [];
  const stats: CheckStats = emptyStats();

  for (const change of context.changes) {
    const oldPath = change.oldPath ? toRepoPath(change.oldPath) : null;
    const newPath = change.newPath ? toRepoPath(change.newPath) : null;
    const candidatePath = newPath ?? oldPath;
    if (!candidatePath || !isGovernedSourceCandidate(candidatePath)) {
      continue;
    }

    stats.changedGovernedSourceFiles += 1;
    const oldRefs = oldPath
      ? parseReferencesForSnapshot(context.repoRoot, oldPath, context.readOld(oldPath), failures)
      : [];
    const newContent = newPath && !change.status.startsWith('D') ? context.readNew(newPath) : null;
    const newRefs =
      newPath && !change.status.startsWith('D')
        ? parseReferencesForSnapshot(context.repoRoot, newPath, newContent, failures)
        : [];

    const { added, removed } = buildDeltas(oldRefs, newRefs);
    detectMarkerRemovalBypass(context, oldRefs, newRefs, newPath, newContent, failures);
    stats.addedReferences += added.length;
    stats.removedReferences += removed.length;

    for (const delta of [...added, ...removed]) {
      if (isProtectedTarget(delta.targetPath)) {
        checkProtectedTarget(context, delta, failures, stats);
      } else {
        checkMutableTarget(context, delta, failures, stats);
      }
    }
  }

  checkTargetRenamesAndDeletions(context, failures, stats);

  return formatCheckResult(failures, stats, context.rerunCommand);
}

const USAGE = `Usage:
  npm run check:config-references
  npm run check:config-references -- --staged
  npm run check:config-references -- --base <base-sha> --head <head-sha>

Options:
  --staged        Compare the staged index against HEAD. This is the default.
  --base <sha>    Base commit for commit-range mode.
  --head <sha>    Head commit for commit-range mode.
  --help          Show this help text.`;

type ParsedCli =
  | { kind: 'run'; options: CheckOptions }
  | { kind: 'help'; output: string }
  | { kind: 'error'; output: string };

export function parseCliArgs(args: string[]): ParsedCli {
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
  const parsed = parseCliArgs(process.argv.slice(2));
  if (parsed.kind === 'help') {
    console.log(parsed.output);
    return;
  }
  if (parsed.kind === 'error') {
    console.error(parsed.output);
    process.exitCode = 2;
    return;
  }

  const result = checkConfigReferences(undefined, parsed.options);
  console.log(result.output);
  if (!result.ok) {
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main();
}
