import { readdirSync, statSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { ExpflowError } from '../core/errors.js';
import { assertSafeRelativePath, relativeProjectPath } from '../core/paths.js';
import { sha256File } from '../material/digest.js';
import type { PathSelectorRecord, ScannedFile } from '../material/types.js';

const DEFAULT_EXCLUDED_NAMES = new Set([
  '.expflow',
  '.git',
  'node_modules',
  'dist',
  'build',
  '.pytest_cache',
]);

function isTemporaryEditorFile(name: string): boolean {
  return name.endsWith('~') || name.endsWith('.swp') || name.endsWith('.tmp');
}

function selectorIncludesPath(selector: PathSelectorRecord, relativePath: string): boolean {
  const include = selector.include.length === 0 ? ['**/*'] : selector.include;
  const excluded = selector.exclude.some((pattern) => matchesSimplePattern(pattern, relativePath));
  if (excluded) {
    return false;
  }
  return include.some((pattern) => matchesSimplePattern(pattern, relativePath));
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

export function defaultPathSelector(): PathSelectorRecord {
  return { root: '.', include: ['**/*'], exclude: ['.expflow/**'] };
}

export function scanWorkingTree(
  projectRoot: string,
  selector: PathSelectorRecord = defaultPathSelector(),
): ScannedFile[] {
  const results: ScannedFile[] = [];

  function visit(absDir: string): void {
    const entries = readdirSync(absDir, { withFileTypes: true }).sort((left, right) =>
      left.name.localeCompare(right.name),
    );

    for (const entry of entries) {
      if (DEFAULT_EXCLUDED_NAMES.has(entry.name) || isTemporaryEditorFile(entry.name)) {
        continue;
      }

      const absPath = resolve(absDir, entry.name);
      const relativePath = relativeProjectPath(projectRoot, absPath);
      if (!selectorIncludesPath(selector, relativePath)) {
        if (entry.isDirectory()) {
          visit(absPath);
        }
        continue;
      }

      if (entry.isSymbolicLink()) {
        throw new ExpflowError('symlink_rejected', `Symlinks are not accepted: ${relativePath}`);
      }
      if (entry.isDirectory()) {
        visit(absPath);
      } else if (entry.isFile()) {
        const stat = statSync(absPath);
        results.push({
          absolute_path: absPath,
          byte_size: stat.size,
          content_digest: sha256File(absPath),
          filename: basename(relativePath),
          folder_name:
            dirname(relativePath) === '.' ? null : dirname(relativePath).split('\\').join('/'),
          relative_path: assertSafeRelativePath(relativePath),
        });
      }
    }
  }

  visit(projectRoot);
  return results.sort((left, right) => left.relative_path.localeCompare(right.relative_path));
}
