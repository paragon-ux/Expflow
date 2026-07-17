import { closeSync, fsyncSync, mkdirSync, openSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { assertSafeRelativePath, resolveProjectPath } from '../core/paths.js';
import { readObjectBytes } from '../material/store.js';
import type { RestoreRecoveryIntentRecord } from '../material/types.js';
import { operationStagingDir } from '../material/store.js';
import { syncDirectory } from '../core/json.js';

function writeBytesDurable(path: string, bytes: Buffer): void {
  mkdirSync(dirname(path), { recursive: true });
  const fd = openSync(path, 'w');
  try {
    writeFileSync(fd, bytes);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  syncDirectory(dirname(path));
}

export function stageRestoreFile(
  projectRoot: string,
  operationId: string,
  relativePath: string,
  bytes: Buffer,
): string {
  const safePath = assertSafeRelativePath(relativePath);
  const stagedPath = resolve(
    operationStagingDir(projectRoot, operationId),
    'restore-files',
    ...safePath.split('/'),
  );
  writeBytesDurable(stagedPath, bytes);
  return stagedPath;
}

export function installRestoreWorkingTree(
  projectRoot: string,
  intent: RestoreRecoveryIntentRecord,
): void {
  deleteRestorePaths(projectRoot, intent);
  writeRestoreFiles(projectRoot, intent);
}

export function deleteRestorePaths(projectRoot: string, intent: RestoreRecoveryIntentRecord): void {
  for (const relativePath of intent.delete_paths) {
    rmSync(resolveProjectPath(projectRoot, relativePath), { force: true });
  }
}

export function writeRestoreFiles(projectRoot: string, intent: RestoreRecoveryIntentRecord): void {
  for (const file of intent.write_files) {
    const bytes = readObjectBytes(projectRoot, file.content_digest);
    writeBytesDurable(resolveProjectPath(projectRoot, file.relative_path), bytes);
  }
}
