import { resolveProjectPath, assertSafeRelativePath } from '../core/paths.js';
import type { PathSelectorRecord } from './types.js';

export function defaultPathSelector(): PathSelectorRecord {
  return { root: '.', include: ['**/*'], exclude: ['.expflow/**'] };
}

export function normalizedSelectorRoot(selector: PathSelectorRecord): string {
  const root = selector.root ?? '.';
  return root === '.' ? '.' : assertSafeRelativePath(root);
}

export function selectorRootPath(projectRoot: string, selector: PathSelectorRecord): string {
  const root = normalizedSelectorRoot(selector);
  return root === '.' ? projectRoot : resolveProjectPath(projectRoot, root);
}

export function selectorIncludesPath(
  selector: PathSelectorRecord,
  projectRelativePath: string,
): boolean {
  const root = normalizedSelectorRoot(selector);
  const rootRelativePath = pathRelativeToSelectorRoot(root, projectRelativePath);
  if (rootRelativePath === null) {
    return false;
  }

  const candidates =
    rootRelativePath.length === 0 ? [projectRelativePath] : [projectRelativePath, rootRelativePath];
  const include = selector.include.length === 0 ? ['**/*'] : selector.include;
  const excluded = selector.exclude.some((pattern) =>
    candidates.some((candidate) => matchesSimplePattern(pattern, candidate)),
  );
  if (excluded) {
    return false;
  }
  return include.some((pattern) =>
    candidates.some((candidate) => matchesSimplePattern(pattern, candidate)),
  );
}

function pathRelativeToSelectorRoot(root: string, projectRelativePath: string): string | null {
  if (root === '.') {
    return projectRelativePath;
  }
  if (projectRelativePath === root) {
    return '';
  }
  const prefix = `${root}/`;
  return projectRelativePath.startsWith(prefix) ? projectRelativePath.slice(prefix.length) : null;
}

function matchesSimplePattern(pattern: string, relativePath: string): boolean {
  if (pattern === '**/*' || pattern === '**') {
    return true;
  }
  const normalizedPattern = pattern.endsWith('/') ? pattern.slice(0, -1) : pattern;
  if (normalizedPattern.endsWith('/**')) {
    const prefix = normalizedPattern.slice(0, -'/**'.length);
    return relativePath === prefix || relativePath.startsWith(`${prefix}/`);
  }
  return relativePath === normalizedPattern || relativePath.startsWith(`${normalizedPattern}/`);
}
