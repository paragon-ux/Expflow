import { relative, resolve, sep } from 'node:path';
import { ExpflowError } from './errors.js';

export const EXPFLOW_STATE_DIR = '.expflow';
export const PROJECTION_ROOT = '.expflow/projections';

export function normalizeProjectRoot(root: string = process.cwd()): string {
  return resolve(root);
}

export function toPortablePath(path: string): string {
  return path.split(sep).join('/');
}

export function assertSafeRelativePath(path: string): string {
  if (path.length === 0 || path === '.') {
    throw new ExpflowError('unsafe_relative_path', 'Relative path must not be empty.');
  }
  if (path.includes('\\')) {
    throw new ExpflowError('unsafe_relative_path', `Backslashes are not allowed: ${path}`);
  }
  if (path.startsWith('/') || /^[A-Za-z]:/.test(path)) {
    throw new ExpflowError('unsafe_relative_path', `Absolute paths are not allowed: ${path}`);
  }

  const parts = path.split('/');
  if (parts.some((part) => part === '' || part === '..')) {
    throw new ExpflowError('unsafe_relative_path', `Traversal paths are not allowed: ${path}`);
  }
  if (parts[0] === EXPFLOW_STATE_DIR) {
    throw new ExpflowError('unsafe_relative_path', `.expflow paths are internal: ${path}`);
  }
  return parts.join('/');
}

export function relativeProjectPath(projectRoot: string, absolutePath: string): string {
  const rel = toPortablePath(relative(projectRoot, absolutePath));
  return assertSafeRelativePath(rel);
}

export function resolveProjectPath(projectRoot: string, relativePath: string): string {
  const safeRelativePath = assertSafeRelativePath(relativePath);
  const absolutePath = resolve(projectRoot, ...safeRelativePath.split('/'));
  const rel = relative(projectRoot, absolutePath);
  if (rel.startsWith('..') || rel === '' || /^[A-Za-z]:/.test(rel)) {
    throw new ExpflowError('unsafe_relative_path', `Path escapes project root: ${relativePath}`);
  }
  return absolutePath;
}
