import {
  closeSync,
  copyFileSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { hostname } from 'node:os';
import { dirname, relative, resolve } from 'node:path';
import { ExpflowError } from '../core/errors.js';
import {
  canonicalJson,
  cloneJson,
  prettyJson,
  readJsonFile,
  syncDirectory,
  writeJsonFileAtomic,
  writeJsonFileExclusive,
  type JsonValue,
} from '../core/json.js';
import { EXPFLOW_STATE_DIR, PROJECTION_ROOT } from '../core/paths.js';
import { sha256Bytes, treeContentDigest } from './digest.js';
import { defaultPathSelector } from './selectors.js';
import type {
  NodeRevisionRecord,
  OperationReceiptRecord,
  ProjectRecord,
  TreeRevisionRecord,
  ValidationResultRecord,
} from './types.js';

export interface StorePaths {
  readonly stateDir: string;
  readonly project: string;
  readonly head: string;
  readonly lock: string;
  readonly objects: string;
  readonly nodeRevisions: string;
  readonly treeRevisions: string;
  readonly receipts: string;
  readonly validations: string;
  readonly changes: string;
  readonly recovery: string;
  readonly staging: string;
  readonly projections: string;
}

export function storePaths(projectRoot: string): StorePaths {
  const stateDir = resolve(projectRoot, EXPFLOW_STATE_DIR);
  const records = resolve(stateDir, 'records');
  return {
    stateDir,
    project: resolve(stateDir, 'project.json'),
    head: resolve(stateDir, 'HEAD'),
    lock: resolve(stateDir, 'LOCK'),
    objects: resolve(stateDir, 'objects', 'sha256'),
    nodeRevisions: resolve(records, 'node-revisions'),
    treeRevisions: resolve(records, 'tree-revisions'),
    receipts: resolve(records, 'operation-receipts'),
    validations: resolve(records, 'validations'),
    changes: resolve(stateDir, 'changes'),
    recovery: resolve(stateDir, 'recovery'),
    staging: resolve(stateDir, 'staging'),
    projections: resolve(projectRoot, PROJECTION_ROOT),
  };
}

export function ensureStoreDirectories(projectRoot: string): void {
  const paths = storePaths(projectRoot);
  for (const dir of [
    paths.stateDir,
    paths.objects,
    paths.nodeRevisions,
    paths.treeRevisions,
    paths.receipts,
    paths.validations,
    paths.changes,
    paths.recovery,
    paths.staging,
    paths.projections,
  ]) {
    mkdirSync(dir, { recursive: true });
  }
}

export function isProjectInitialized(projectRoot: string): boolean {
  return existsSync(storePaths(projectRoot).project);
}

export function readProject(projectRoot: string): ProjectRecord {
  const path = storePaths(projectRoot).project;
  if (!existsSync(path)) {
    throw new ExpflowError('project_not_initialized', 'Expflow project is not initialized.', {
      recoverable: false,
    });
  }
  return readJsonFile(path) as ProjectRecord;
}

export function writeProject(projectRoot: string, project: ProjectRecord): void {
  const path = storePaths(projectRoot).project;
  if (existsSync(path)) {
    throw new ExpflowError('project_already_initialized', 'Expflow project already exists.');
  }
  writeJsonFileExclusive(path, project);
}

export function updateProjectHead(projectRoot: string, headTreeRevisionId: string | null): void {
  const project = readProject(projectRoot);
  writeJsonFileAtomic(storePaths(projectRoot).project, {
    ...project,
    head_tree_revision_id: headTreeRevisionId,
  });
}

export function readHead(projectRoot: string): string | null {
  const path = storePaths(projectRoot).head;
  if (!existsSync(path)) {
    return null;
  }
  const value = readFileSync(path, 'utf-8').trim();
  return value.length === 0 ? null : value;
}

export function writeHead(projectRoot: string, treeRevisionId: string | null): void {
  const path = storePaths(projectRoot).head;
  mkdirSync(dirname(path), { recursive: true });
  const tempPath = `${path}.${String(process.pid)}.${String(Date.now())}.tmp`;
  const fd = openSync(tempPath, 'w');
  try {
    writeFileSync(fd, treeRevisionId === null ? '\n' : `${treeRevisionId}\n`, 'utf-8');
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  renameWithinVolume(tempPath, path);
}

function renameWithinVolume(from: string, to: string): void {
  renameSync(from, to);
  syncDirectory(dirname(to));
}

export function operationStagingDir(projectRoot: string, operationId: string): string {
  return resolve(storePaths(projectRoot).staging, operationId);
}

export function prepareOperationStaging(projectRoot: string, operationId: string): string {
  const dir = operationStagingDir(projectRoot, operationId);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  syncDirectory(dirname(dir));
  return dir;
}

export function removeOperationStaging(projectRoot: string, operationId: string): void {
  rmSync(operationStagingDir(projectRoot, operationId), { recursive: true, force: true });
}

function stagedPathForFinal(projectRoot: string, operationId: string, finalPath: string): string {
  const paths = storePaths(projectRoot);
  const relativeFinal = relative(paths.stateDir, finalPath);
  if (relativeFinal.startsWith('..')) {
    throw new ExpflowError('unsafe_relative_path', `Cannot stage outside .expflow: ${finalPath}`);
  }
  return resolve(operationStagingDir(projectRoot, operationId), 'promote', relativeFinal);
}

function writeBytesExclusiveDurable(path: string, bytes: Buffer | string): void {
  mkdirSync(dirname(path), { recursive: true });
  const fd = openSync(path, 'wx');
  try {
    writeFileSync(fd, bytes);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  syncDirectory(dirname(path));
}

function syncFile(path: string): void {
  const fd = openSync(path, 'r+');
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function jsonMatches(path: string, value: unknown): boolean {
  return canonicalJson(readJsonFile(path) as JsonValue) === canonicalJson(value as JsonValue);
}

function verifyExistingImmutableJson(path: string, record: unknown): void {
  if (!jsonMatches(path, record)) {
    throw new ExpflowError(
      'immutable_record_conflict',
      `Immutable record path is already occupied by different bytes: ${path}`,
      { recoverable: true },
    );
  }
}

function writeImmutableJsonRecord(
  projectRoot: string,
  operationId: string,
  finalPath: string,
  record: unknown,
): void {
  if (existsSync(finalPath)) {
    verifyExistingImmutableJson(finalPath, record);
    return;
  }

  const stagedPath = stagedPathForFinal(projectRoot, operationId, finalPath);
  writeBytesExclusiveDurable(stagedPath, prettyJson(record));
  if (existsSync(finalPath)) {
    verifyExistingImmutableJson(finalPath, record);
    rmSync(stagedPath, { force: true });
    return;
  }
  mkdirSync(dirname(finalPath), { recursive: true });
  renameWithinVolume(stagedPath, finalPath);
  verifyExistingImmutableJson(finalPath, record);
}

function digestLocator(digest: string): {
  readonly hash: string;
  readonly objectPath: string;
  readonly locator: string;
} {
  const hash = digest.replace(/^sha256:/, '');
  const locator = `objects/sha256/${hash.slice(0, 2)}/${hash}`;
  return { hash, objectPath: locator, locator };
}

export function objectPathForDigest(projectRoot: string, digest: string): string {
  const { hash } = digestLocator(digest);
  return resolve(storePaths(projectRoot).objects, hash.slice(0, 2), hash);
}

export function storeObjectFromFile(
  projectRoot: string,
  sourcePath: string,
  expectedDigest: string,
  operationId = `adhoc-${String(process.pid)}-${String(Date.now())}`,
): string {
  const actualDigest = sha256Bytes(readFileSync(sourcePath));
  if (actualDigest !== expectedDigest) {
    throw new ExpflowError(
      'object_integrity_failed',
      `Source digest changed while staging object: ${sourcePath}`,
    );
  }

  const targetPath = objectPathForDigest(projectRoot, expectedDigest);
  const locator = digestLocator(expectedDigest).locator;
  if (existsSync(targetPath)) {
    verifyObject(projectRoot, expectedDigest);
    return locator;
  }

  const stagedPath = stagedPathForFinal(projectRoot, operationId, targetPath);
  mkdirSync(dirname(stagedPath), { recursive: true });
  copyFileSync(sourcePath, stagedPath);
  syncFile(stagedPath);
  syncDirectory(dirname(stagedPath));
  rejectHardLinkedObject(sourcePath, stagedPath);
  if (sha256Bytes(readFileSync(stagedPath)) !== expectedDigest) {
    rmSync(stagedPath, { force: true });
    throw new ExpflowError(
      'object_integrity_failed',
      `Staged object digest mismatch: ${expectedDigest}`,
      { recoverable: true },
    );
  }
  if (existsSync(targetPath)) {
    verifyObject(projectRoot, expectedDigest);
    rmSync(stagedPath, { force: true });
    return locator;
  }
  mkdirSync(dirname(targetPath), { recursive: true });
  renameWithinVolume(stagedPath, targetPath);
  verifyObject(projectRoot, expectedDigest);
  return locator;
}

function rejectHardLinkedObject(sourcePath: string, objectPath: string): void {
  const source = statSync(sourcePath);
  const target = statSync(objectPath);
  if (source.dev === target.dev && source.ino === target.ino) {
    rmSync(objectPath, { force: true });
    throw new ExpflowError('hard_link_rejected', 'Stored objects must be write-isolated.');
  }
  if (target.nlink > 1) {
    rmSync(objectPath, { force: true });
    throw new ExpflowError('hard_link_rejected', 'Stored objects must not be hard-linked.');
  }
}

export function readObjectBytes(projectRoot: string, digest: string): Buffer {
  verifyObject(projectRoot, digest);
  return readFileSync(objectPathForDigest(projectRoot, digest));
}

export function verifyObject(projectRoot: string, digest: string): void {
  const path = objectPathForDigest(projectRoot, digest);
  if (!existsSync(path)) {
    throw new ExpflowError('object_missing', `Stored object is missing: ${digest}`, {
      recoverable: true,
    });
  }
  const actual = sha256Bytes(readFileSync(path));
  if (actual !== digest) {
    throw new ExpflowError('object_integrity_failed', `Stored object digest mismatch: ${digest}`, {
      recoverable: true,
    });
  }
}

export function writeNodeRevision(projectRoot: string, record: NodeRevisionRecord): void {
  writeImmutableJsonRecord(
    projectRoot,
    record.created_by_operation,
    nodeRevisionPath(projectRoot, record.node_id, record.revision),
    record,
  );
}

export function readNodeRevision(
  projectRoot: string,
  nodeId: string,
  revision: number,
): NodeRevisionRecord {
  const path = nodeRevisionPath(projectRoot, nodeId, revision);
  if (!existsSync(path)) {
    throw new ExpflowError(
      'node_revision_missing',
      `Node revision not found: ${nodeId}@${String(revision)}`,
      {
        recoverable: true,
      },
    );
  }
  return readJsonFile(path) as NodeRevisionRecord;
}

export function nodeRevisionPath(projectRoot: string, nodeId: string, revision: number): string {
  return resolve(storePaths(projectRoot).nodeRevisions, nodeId, `${String(revision)}.json`);
}

export function nextNodeRevisionNumber(projectRoot: string, nodeId: string): number {
  const dir = resolve(storePaths(projectRoot).nodeRevisions, nodeId);
  if (!existsSync(dir)) {
    return 1;
  }
  const revisions = readdirSync(dir)
    .map((file) => /^([0-9]+)\.json$/.exec(file))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => Number(match[1]));
  return revisions.length === 0 ? 1 : Math.max(...revisions) + 1;
}

export function listNodeRevisions(projectRoot: string, nodeId: string): NodeRevisionRecord[] {
  const dir = resolve(storePaths(projectRoot).nodeRevisions, nodeId);
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((file) => /^([0-9]+)\.json$/.test(file))
    .map((file) => readJsonFile(resolve(dir, file)) as NodeRevisionRecord)
    .sort((left, right) => left.revision - right.revision);
}

export function writeTreeRevision(projectRoot: string, record: TreeRevisionRecord): void {
  verifyTreeContentDigest(record);
  writeImmutableJsonRecord(
    projectRoot,
    record.created_by_operation,
    treeRevisionPath(projectRoot, record.tree_revision_id),
    record,
  );
}

export function readTreeRevision(projectRoot: string, treeRevisionId: string): TreeRevisionRecord {
  const path = treeRevisionPath(projectRoot, treeRevisionId);
  if (!existsSync(path)) {
    throw new ExpflowError('tree_revision_missing', `Tree revision not found: ${treeRevisionId}`, {
      recoverable: true,
    });
  }
  return readJsonFile(path) as TreeRevisionRecord;
}

export function treeRevisionPath(projectRoot: string, treeRevisionId: string): string {
  return resolve(storePaths(projectRoot).treeRevisions, `${treeRevisionId}.json`);
}

export function writeOperationReceipt(projectRoot: string, record: OperationReceiptRecord): void {
  writeImmutableJsonRecord(
    projectRoot,
    record.operation_id,
    operationReceiptPath(projectRoot, record.operation_id),
    record,
  );
}

export function readOperationReceipt(
  projectRoot: string,
  operationId: string,
): OperationReceiptRecord {
  const path = operationReceiptPath(projectRoot, operationId);
  if (!existsSync(path)) {
    throw new ExpflowError(
      'operation_receipt_missing',
      `Operation receipt not found: ${operationId}`,
      {
        recoverable: true,
      },
    );
  }
  return readJsonFile(path) as OperationReceiptRecord;
}

export function operationReceiptPath(projectRoot: string, operationId: string): string {
  return resolve(storePaths(projectRoot).receipts, `${operationId}.json`);
}

export function listOperationReceipts(projectRoot: string): OperationReceiptRecord[] {
  const dir = storePaths(projectRoot).receipts;
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readJsonFile(resolve(dir, file)) as OperationReceiptRecord)
    .sort((left, right) => {
      const finished = left.finished_at.localeCompare(right.finished_at);
      return finished === 0 ? left.operation_id.localeCompare(right.operation_id) : finished;
    });
}

export function writeValidationResult(projectRoot: string, record: ValidationResultRecord): void {
  writeImmutableJsonRecord(
    projectRoot,
    record.operation_id,
    resolve(storePaths(projectRoot).validations, `${record.validation_id}.json`),
    record,
  );
}

export function writeChangeSet(projectRoot: string, operationId: string, changeSet: unknown): void {
  writeImmutableJsonRecord(
    projectRoot,
    operationId,
    resolve(storePaths(projectRoot).changes, `${operationId}.json`),
    changeSet,
  );
}

export function listTreeRevisionIds(projectRoot: string): string[] {
  const dir = storePaths(projectRoot).treeRevisions;
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.slice(0, -'.json'.length))
    .sort();
}

export function createLock(projectRoot: string): () => void {
  ensureStoreDirectories(projectRoot);
  const path = storePaths(projectRoot).lock;
  try {
    writeJsonFileExclusive(path, {
      acquired_at: new Date().toISOString(),
      host: hostname(),
      pid: process.pid,
      runtime: 'expflow-core',
    });
  } catch (error) {
    if (existsSync(path)) {
      throw new ExpflowError('project_locked', 'Expflow project is already locked.', {
        recoverable: true,
        recommendedAction: 'Run recovery if the previous process ended unexpectedly.',
      });
    }
    throw error;
  }
  return () => {
    try {
      unlinkSync(path);
    } catch {
      // Lock cleanup is best-effort after the transaction has already ended.
    }
  };
}

export interface ProjectLockRecord {
  readonly acquired_at: string;
  readonly host?: string;
  readonly pid: number;
  readonly runtime?: string;
}

export function readProjectLock(projectRoot: string): ProjectLockRecord | null {
  const path = storePaths(projectRoot).lock;
  if (!existsSync(path)) {
    return null;
  }
  return readJsonFile(path) as ProjectLockRecord;
}

export function removeProjectLock(projectRoot: string): void {
  rmSync(storePaths(projectRoot).lock, { force: true });
  syncDirectory(storePaths(projectRoot).stateDir);
}

export function recoveryIntentPath(projectRoot: string, operationId: string): string {
  return resolve(storePaths(projectRoot).recovery, `${operationId}.json`);
}

export function writeRecoveryIntent(
  projectRoot: string,
  operationId: string,
  intent: unknown,
): void {
  writeJsonFileAtomic(recoveryIntentPath(projectRoot, operationId), intent);
}

export function removeRecoveryIntent(projectRoot: string, operationId: string): void {
  rmSync(recoveryIntentPath(projectRoot, operationId), { force: true });
  syncDirectory(storePaths(projectRoot).recovery);
}

export function listRecoveryIntentPaths(projectRoot: string): string[] {
  const dir = storePaths(projectRoot).recovery;
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => resolve(dir, file));
}

export function verifyTreeRevision(projectRoot: string, tree: TreeRevisionRecord): void {
  verifyTreeContentDigest(tree);
  for (const entry of tree.entries) {
    if (entry.entry_kind !== 'file' || entry.node_id === null || entry.node_id === undefined) {
      continue;
    }
    if (entry.node_revision === null || entry.node_revision === undefined) {
      throw new ExpflowError(
        'node_revision_missing',
        `Missing revision for ${entry.relative_path}`,
        {
          recoverable: true,
        },
      );
    }
    const node = readNodeRevision(projectRoot, entry.node_id, entry.node_revision);
    if (node.content_digest !== entry.node_content_digest) {
      throw new ExpflowError(
        'object_integrity_failed',
        `Tree entry digest does not match node revision: ${entry.relative_path}`,
        { recoverable: true },
      );
    }
    verifyObject(projectRoot, node.content_digest);
  }
}

function verifyTreeContentDigest(tree: TreeRevisionRecord): void {
  const actualDigest = treeContentDigest(
    tree.entries,
    tree.removed_paths ?? [],
    tree.scope ?? defaultPathSelector(),
  );
  if (actualDigest !== tree.content_digest) {
    throw new ExpflowError(
      'object_integrity_failed',
      `Tree content digest mismatch: ${tree.tree_revision_id}`,
      { recoverable: true },
    );
  }
}

export function publicProjectState(projectRoot: string): ProjectRecord {
  return cloneJson(readProject(projectRoot));
}
