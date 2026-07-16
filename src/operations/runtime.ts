import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { ExpflowError, toExpflowError } from '../core/errors.js';
import { createExpflowId } from '../core/ids.js';
import { cloneJson } from '../core/json.js';
import { normalizeProjectRoot, PROJECTION_ROOT, resolveProjectPath } from '../core/paths.js';
import { scanWorkingTree, defaultPathSelector } from '../scan/scanner.js';
import { treeContentDigest } from '../material/digest.js';
import { planCandidateTree } from '../material/planner.js';
import {
  createLock,
  ensureStoreDirectories,
  isProjectInitialized,
  publicProjectState,
  readHead,
  readNodeRevision,
  readObjectBytes,
  readOperationReceipt,
  readProject,
  readTreeRevision,
  storeObjectFromFile,
  updateProjectHead,
  verifyTreeRevision,
  writeChangeSet,
  writeHead,
  writeNodeRevision,
  writeOperationReceipt,
  writeProject,
  writeTreeRevision,
  writeValidationResult,
} from '../material/store.js';
import { recoverProject, type RecoveryReport } from '../transactions/recovery.js';
import type {
  AutomationOptions,
  CandidateTree,
  OperationChange,
  OperationPlanRecord,
  OperationReceiptRecord,
  PathSelectorRecord,
  ProjectRecord,
  RequestedBy,
  StatusReportRecord,
  TreeRevisionRecord,
  ValidationResultRecord,
} from '../material/types.js';

export interface RuntimeOptions {
  readonly requestedBy?: RequestedBy;
  readonly simulatePostCommitFailure?: boolean;
}

export interface InitInput extends RuntimeOptions {
  readonly root?: string;
  readonly policyProfile?: string;
  readonly hookProfile?: string | null;
  readonly authorityDocumentProfile?: 'split' | 'unified' | 'mixed';
}

export interface SyncInput extends RuntimeOptions {
  readonly root?: string;
  readonly expectedHead?: string | null;
  readonly scope?: PathSelectorRecord;
  readonly changedPathHints?: readonly string[];
  readonly changes?: readonly OperationChange[];
  readonly dryRun?: boolean;
}

export interface StatusInput {
  readonly root?: string;
}

export interface RestoreInput extends RuntimeOptions {
  readonly root?: string;
  readonly reference: string;
  readonly targetPath?: string;
}

export interface SyncPlan {
  readonly operation_id: string;
  readonly project_id: string;
  readonly previous_head: string | null;
  readonly candidate_head: string;
  readonly entries: readonly object[];
  readonly removed_paths: readonly string[];
  readonly new_node_revisions: readonly string[];
  readonly identity_proposals: readonly object[];
  readonly content_digest: string;
}

export interface ExpflowRuntime {
  init(input?: InitInput): Promise<OperationReceiptRecord>;
  sync(input?: SyncInput): Promise<OperationReceiptRecord>;
  planSync(input?: SyncInput): Promise<SyncPlan>;
  status(input?: StatusInput): Promise<StatusReportRecord>;
  restore(input: RestoreInput): Promise<OperationReceiptRecord>;
  recover(input?: StatusInput): Promise<RecoveryReport>;
  verify(input?: StatusInput): Promise<ValidationResultRecord>;
}

function requestedBy(input?: RuntimeOptions): RequestedBy {
  return input?.requestedBy ?? { kind: 'user', name: 'local' };
}

function defaultAutomation(): AutomationOptions {
  return {
    detect_workflows: false,
    project_manifests: false,
    run_semantic_assertions: false,
    run_structural_validation: true,
    semantic_refresh_on_no_change: false,
  };
}

function operationPlan(input: {
  readonly operationId: string;
  readonly projectId: string;
  readonly operationType: 'init' | 'sync' | 'restore';
  readonly expectedHead: string | null;
  readonly scope: PathSelectorRecord;
  readonly changes: readonly OperationChange[];
  readonly startedAt: string;
  readonly requestedBy: RequestedBy;
  readonly changedPathHints?: readonly string[];
}): OperationPlanRecord {
  return {
    schema_version: '2.3',
    automation: defaultAutomation(),
    changed_path_hints: input.changedPathHints ?? [],
    changes: input.changes,
    expected_head: input.expectedHead,
    operation_id: input.operationId,
    operation_type: input.operationType,
    project_id: input.projectId,
    requested_at: input.startedAt,
    requested_by: input.requestedBy,
    scope: input.scope,
  };
}

function validationResult(
  operationId: string,
  status: 'pass' | 'fail',
  findings: ValidationResultRecord['findings'],
): ValidationResultRecord {
  return {
    schema_version: '2.3',
    blocking: status !== 'pass',
    checked_at: new Date().toISOString(),
    findings,
    operation_id: operationId,
    status,
    validation_id: createExpflowId('efv'),
    validator: 'expflow-core-material',
    validator_version: '0.0.0-gate-b',
  };
}

function receipt(input: {
  readonly operationId: string;
  readonly projectId: string;
  readonly status: OperationReceiptRecord['status'];
  readonly startedAt: string;
  readonly previousHead: string | null;
  readonly newHead: string | null;
  readonly validationRefs: readonly string[];
  readonly nodeRevisionRefs?: readonly string[];
  readonly warnings?: readonly string[];
  readonly error?: OperationReceiptRecord['error'];
}): OperationReceiptRecord {
  return {
    schema_version: '2.3',
    error: input.error ?? null,
    finished_at: new Date().toISOString(),
    new_head: input.newHead,
    node_revision_refs: input.nodeRevisionRefs ?? [],
    operation_id: input.operationId,
    previous_head: input.previousHead,
    project_id: input.projectId,
    status: input.status,
    started_at: input.startedAt,
    validation_refs: input.validationRefs,
    warnings: input.warnings ?? [],
  };
}

function commitCandidateTree(
  projectRoot: string,
  candidate: CandidateTree,
  createdAt: string,
): TreeRevisionRecord {
  for (const node of candidate.new_node_revisions) {
    storeObjectFromFile(projectRoot, node.source_path, node.record.content_digest);
    writeNodeRevision(projectRoot, node.record);
  }

  const tree: TreeRevisionRecord = {
    schema_version: '2.3',
    content_digest: candidate.content_digest,
    created_at: createdAt,
    created_by_operation: candidate.operation_id,
    entries: candidate.entries,
    parent_tree_revision_id: candidate.parent_tree_revision_id,
    project_id: candidate.project_id,
    removed_paths: candidate.removed_paths,
    scope: candidate.scope,
    sequence: candidate.sequence,
    source: candidate.source,
    tree_revision_id: createExpflowId('eft'),
  };
  writeTreeRevision(projectRoot, tree);
  verifyTreeRevision(projectRoot, tree);
  return tree;
}

function validateCandidate(candidate: CandidateTree): ValidationResultRecord['findings'] {
  const findings: {
    code: string;
    message: string;
    relative_path?: string | null;
    details?: object | null;
  }[] = [];
  const paths = new Set<string>();
  for (const entry of candidate.entries) {
    if (paths.has(entry.relative_path)) {
      findings.push({
        code: 'duplicate_path',
        message: `Duplicate tree path: ${entry.relative_path}`,
        relative_path: entry.relative_path,
      });
    }
    paths.add(entry.relative_path);
    if (entry.relative_path.startsWith('.expflow/')) {
      findings.push({
        code: 'unsafe_relative_path',
        message: `.expflow paths are scanner-excluded: ${entry.relative_path}`,
        relative_path: entry.relative_path,
      });
    }
  }
  return findings;
}

function makeProject(
  projectRoot: string,
  projectId: string,
  createdAt: string,
  input: InitInput,
): ProjectRecord {
  return {
    schema_version: '2.3',
    authority_document_profile: input.authorityDocumentProfile ?? 'mixed',
    created_at: createdAt,
    current_manifest_heads: {},
    head_tree_revision_id: null,
    hook_profile: input.hookProfile ?? 'default',
    managed_exclusions: ['.expflow/**'],
    policy_profile: input.policyProfile ?? 'default',
    project_id: projectId,
    projection_root: PROJECTION_ROOT,
    root_path: projectRoot,
  };
}

function treeFromHead(projectRoot: string): TreeRevisionRecord | null {
  const head = readHead(projectRoot);
  return head === null ? null : readTreeRevision(projectRoot, head);
}

function treeFilePaths(tree: TreeRevisionRecord): Set<string> {
  return new Set(
    tree.entries.filter((entry) => entry.entry_kind === 'file').map((entry) => entry.relative_path),
  );
}

function reconcileWorkingTreeToRestoredTree(
  projectRoot: string,
  sourceTree: TreeRevisionRecord,
): void {
  const restoredPaths = treeFilePaths(sourceTree);
  for (const file of scanWorkingTree(projectRoot, defaultPathSelector())) {
    if (!restoredPaths.has(file.relative_path)) {
      rmSync(file.absolute_path, { force: true });
    }
  }
}

function materialStatusFromPlan(plan: SyncPlan): StatusReportRecord['working_tree_state'] {
  return plan.removed_paths.length === 0 && plan.new_node_revisions.length === 0
    ? 'clean'
    : 'drifted';
}

function buildSyncPlan(projectRoot: string, input: SyncInput = {}): SyncPlan {
  const project = readProject(projectRoot);
  const currentTree = treeFromHead(projectRoot);
  const operationId = createExpflowId('efo');
  const scope = input.scope ?? defaultPathSelector();
  const candidate = planCandidateTree({
    changes: input.changes ?? [],
    createdAt: new Date().toISOString(),
    currentTree,
    operationId,
    projectId: project.project_id,
    scannedFiles: scanWorkingTree(projectRoot, scope),
    scope,
    source: 'sync',
  });
  return {
    candidate_head: candidate.content_digest,
    content_digest: candidate.content_digest,
    entries: candidate.entries,
    identity_proposals: candidate.identity_proposals,
    new_node_revisions: candidate.new_node_revisions.map(
      (node) => `${node.record.node_id}@${String(node.record.revision)}`,
    ),
    operation_id: operationId,
    previous_head: currentTree?.tree_revision_id ?? null,
    project_id: project.project_id,
    removed_paths: candidate.removed_paths,
  };
}

export function createRuntime(): ExpflowRuntime {
  return {
    async init(input: InitInput = {}): Promise<OperationReceiptRecord> {
      await Promise.resolve();
      const projectRoot = normalizeProjectRoot(input.root);
      if (isProjectInitialized(projectRoot)) {
        throw new ExpflowError('project_already_initialized', 'Expflow project already exists.');
      }
      ensureStoreDirectories(projectRoot);
      const release = createLock(projectRoot);
      try {
        const startedAt = new Date().toISOString();
        const operationId = createExpflowId('efo');
        const projectId = createExpflowId('efp');
        const project = makeProject(projectRoot, projectId, startedAt, input);
        writeProject(projectRoot, project);
        writeHead(projectRoot, null);

        const scope = defaultPathSelector();
        const candidate = planCandidateTree({
          changes: [],
          createdAt: startedAt,
          currentTree: null,
          operationId,
          projectId,
          scannedFiles: scanWorkingTree(projectRoot, scope),
          scope,
          source: 'initialization',
        });
        const findings = validateCandidate(candidate);
        const validation = validationResult(
          operationId,
          findings.length === 0 ? 'pass' : 'fail',
          findings,
        );
        writeValidationResult(projectRoot, validation);
        if (findings.length > 0) {
          const rejected = receipt({
            error: {
              code: 'validation_failed',
              message: 'Material validation failed.',
              recoverable: false,
            },
            newHead: null,
            operationId,
            previousHead: null,
            projectId,
            startedAt,
            status: 'rejected',
            validationRefs: [validation.validation_id],
          });
          writeOperationReceipt(projectRoot, rejected);
          return rejected;
        }

        const tree = commitCandidateTree(projectRoot, candidate, startedAt);
        const operationReceipt = receipt({
          newHead: tree.tree_revision_id,
          nodeRevisionRefs: candidate.new_node_revisions.map(
            (node) => `${node.record.node_id}@${String(node.record.revision)}`,
          ),
          operationId,
          previousHead: null,
          projectId,
          startedAt,
          status: input.simulatePostCommitFailure === true ? 'partial_post_commit' : 'committed',
          validationRefs: [validation.validation_id],
          warnings:
            input.simulatePostCommitFailure === true ? ['post_commit_automation_incomplete'] : [],
        });
        writeOperationReceipt(projectRoot, operationReceipt);
        writeHead(projectRoot, tree.tree_revision_id);
        updateProjectHead(projectRoot, tree.tree_revision_id);
        return operationReceipt;
      } finally {
        release();
      }
    },

    async sync(input: SyncInput = {}): Promise<OperationReceiptRecord> {
      await Promise.resolve();
      const projectRoot = normalizeProjectRoot(input.root);
      const project = readProject(projectRoot);
      const release = createLock(projectRoot);
      try {
        const previousHead = readHead(projectRoot);
        if (input.expectedHead !== undefined && input.expectedHead !== previousHead) {
          throw new ExpflowError(
            'stale_head',
            'Expected material head does not match current head.',
            {
              recoverable: true,
            },
          );
        }

        const startedAt = new Date().toISOString();
        const operationId = createExpflowId('efo');
        const scope = input.scope ?? defaultPathSelector();
        const currentTree =
          previousHead === null ? null : readTreeRevision(projectRoot, previousHead);
        const candidate = planCandidateTree({
          changes: input.changes ?? [],
          createdAt: startedAt,
          currentTree,
          operationId,
          projectId: project.project_id,
          scannedFiles: scanWorkingTree(projectRoot, scope),
          scope,
          source: 'sync',
        });
        const findings = validateCandidate(candidate);
        const validation = validationResult(
          operationId,
          findings.length === 0 ? 'pass' : 'fail',
          findings,
        );
        writeValidationResult(projectRoot, validation);
        if (findings.length > 0) {
          const rejected = receipt({
            error: {
              code: 'validation_failed',
              message: 'Material validation failed.',
              recoverable: false,
            },
            newHead: previousHead,
            operationId,
            previousHead,
            projectId: project.project_id,
            startedAt,
            status: 'rejected',
            validationRefs: [validation.validation_id],
          });
          writeOperationReceipt(projectRoot, rejected);
          return rejected;
        }

        if (candidate.content_digest === currentTree?.content_digest) {
          const noChange = receipt({
            newHead: previousHead,
            operationId,
            previousHead,
            projectId: project.project_id,
            startedAt,
            status: 'no_change',
            validationRefs: [validation.validation_id],
          });
          writeOperationReceipt(projectRoot, noChange);
          return noChange;
        }

        const tree = commitCandidateTree(projectRoot, candidate, startedAt);
        const plan = operationPlan({
          changedPathHints: input.changedPathHints,
          changes: input.changes ?? [],
          expectedHead: input.expectedHead ?? null,
          operationId,
          operationType: 'sync',
          projectId: project.project_id,
          requestedBy: requestedBy(input),
          scope,
          startedAt,
        });
        writeChangeSet(projectRoot, operationId, {
          identity_proposals: candidate.identity_proposals,
          operation_plan: plan,
          removed_paths: candidate.removed_paths,
        });
        const operationReceipt = receipt({
          newHead: tree.tree_revision_id,
          nodeRevisionRefs: candidate.new_node_revisions.map(
            (node) => `${node.record.node_id}@${String(node.record.revision)}`,
          ),
          operationId,
          previousHead,
          projectId: project.project_id,
          startedAt,
          status: input.simulatePostCommitFailure === true ? 'partial_post_commit' : 'committed',
          validationRefs: [validation.validation_id],
          warnings:
            input.simulatePostCommitFailure === true ? ['post_commit_automation_incomplete'] : [],
        });
        writeOperationReceipt(projectRoot, operationReceipt);
        writeHead(projectRoot, tree.tree_revision_id);
        updateProjectHead(projectRoot, tree.tree_revision_id);
        return operationReceipt;
      } catch (error) {
        const expflowError = toExpflowError(error);
        if (expflowError.code === 'stale_head' || expflowError.code === 'project_locked') {
          throw expflowError;
        }
        throw error;
      } finally {
        release();
      }
    },

    async planSync(input: SyncInput = {}): Promise<SyncPlan> {
      await Promise.resolve();
      return buildSyncPlan(normalizeProjectRoot(input.root), input);
    },

    async status(input: StatusInput = {}): Promise<StatusReportRecord> {
      await Promise.resolve();
      const projectRoot = normalizeProjectRoot(input.root);
      if (!isProjectInitialized(projectRoot)) {
        return {
          schema_version: '2.3',
          automation_state: { failed_hooks: [], pending_hooks: [] },
          generated_at: new Date().toISOString(),
          head_tree_revision_id: null,
          manifest_heads: {},
          project_id: 'efp_00000000000000000000000000',
          recommended_action: 'Run expflow init.',
          unresolved_items: [],
          working_tree_state: 'uninitialized',
        };
      }
      const project = readProject(projectRoot);
      try {
        const plan = buildSyncPlan(projectRoot, {});
        return {
          schema_version: '2.3',
          automation_state: { failed_hooks: [], pending_hooks: [] },
          generated_at: new Date().toISOString(),
          head_tree_revision_id: readHead(projectRoot),
          manifest_heads: {},
          pending_changes: [
            ...plan.new_node_revisions.map((revision) => ({ kind: 'node_revision', revision })),
            ...plan.removed_paths.map((path) => ({ kind: 'removed_path', path })),
            ...plan.identity_proposals.map((proposal) => ({ kind: 'identity_proposal', proposal })),
          ],
          project_id: project.project_id,
          recommended_action:
            materialStatusFromPlan(plan) === 'clean' ? null : 'Run expflow sync to commit drift.',
          unresolved_items: [],
          working_tree_state: materialStatusFromPlan(plan),
        };
      } catch (error) {
        const expflowError = toExpflowError(error);
        return {
          schema_version: '2.3',
          automation_state: { failed_hooks: [], pending_hooks: [] },
          generated_at: new Date().toISOString(),
          head_tree_revision_id: readHead(projectRoot),
          manifest_heads: {},
          project_id: project.project_id,
          recommended_action: expflowError.recommendedAction,
          unresolved_items: [expflowError.code],
          working_tree_state: 'invalid',
        };
      }
    },

    async restore(input: RestoreInput): Promise<OperationReceiptRecord> {
      await Promise.resolve();
      const projectRoot = normalizeProjectRoot(input.root);
      const project = readProject(projectRoot);
      const release = createLock(projectRoot);
      try {
        const previousHead = readHead(projectRoot);
        const startedAt = new Date().toISOString();
        const operationId = createExpflowId('efo');
        let restoredTree: TreeRevisionRecord;
        if (input.reference.startsWith('tree:')) {
          const sourceTree = readTreeRevision(projectRoot, input.reference.slice('tree:'.length));
          const currentTree =
            previousHead === null ? null : readTreeRevision(projectRoot, previousHead);
          const restoredPaths = treeFilePaths(sourceTree);
          const removedPaths =
            currentTree === null
              ? []
              : currentTree.entries
                  .filter((entry) => !restoredPaths.has(entry.relative_path))
                  .map((entry) => entry.relative_path)
                  .sort();
          reconcileWorkingTreeToRestoredTree(projectRoot, sourceTree);
          for (const entry of sourceTree.entries) {
            if (
              entry.entry_kind !== 'file' ||
              entry.node_id === null ||
              entry.node_id === undefined
            ) {
              continue;
            }
            if (entry.node_revision === null || entry.node_revision === undefined) {
              continue;
            }
            const node = readNodeRevision(projectRoot, entry.node_id, entry.node_revision);
            const bytes = readObjectBytes(projectRoot, node.content_digest);
            const target = resolveProjectPath(projectRoot, entry.relative_path);
            mkdirSync(dirname(target), { recursive: true });
            writeFileSync(target, bytes);
          }
          const entries = sourceTree.entries.map((entry) => ({ ...entry }));
          const contentDigest = treeContentDigest(
            entries,
            removedPaths,
            sourceTree.scope ?? defaultPathSelector(),
          );
          restoredTree = {
            ...sourceTree,
            content_digest: contentDigest,
            created_at: startedAt,
            created_by_operation: operationId,
            parent_tree_revision_id: previousHead,
            sequence: (currentTree?.sequence ?? 0) + 1,
            source: 'restore',
            tree_revision_id: createExpflowId('eft'),
          };
          writeTreeRevision(projectRoot, restoredTree);
        } else if (input.reference.startsWith('node:')) {
          const match = /^node:([^@]+)@([0-9]+):(.+)$/.exec(input.reference);
          if (match === null) {
            throw new ExpflowError(
              'restore_conflict',
              `Invalid restore reference: ${input.reference}`,
            );
          }
          const nodeId = match[1] ?? '';
          const revision = Number(match[2] ?? '0');
          const targetPath = input.targetPath ?? match[3] ?? '';
          const node = readNodeRevision(projectRoot, nodeId, revision);
          const bytes = readObjectBytes(projectRoot, node.content_digest);
          const target = resolveProjectPath(projectRoot, targetPath);
          mkdirSync(dirname(target), { recursive: true });
          writeFileSync(target, bytes);
          const scope = defaultPathSelector();
          const currentTree =
            previousHead === null ? null : readTreeRevision(projectRoot, previousHead);
          const candidate = planCandidateTree({
            changes: [
              {
                identity_directive: 'preserve',
                kind: 'restore',
                node_id: nodeId,
                node_revision: revision,
                path: targetPath,
              },
            ],
            createdAt: startedAt,
            currentTree,
            operationId,
            projectId: project.project_id,
            scannedFiles: scanWorkingTree(projectRoot, scope),
            scope,
            source: 'restore',
          });
          restoredTree = commitCandidateTree(projectRoot, candidate, startedAt);
        } else {
          throw new ExpflowError(
            'restore_conflict',
            `Unsupported restore reference: ${input.reference}`,
          );
        }

        const validation = validationResult(operationId, 'pass', []);
        writeValidationResult(projectRoot, validation);
        verifyTreeRevision(projectRoot, restoredTree);
        const operationReceipt = receipt({
          newHead: restoredTree.tree_revision_id,
          operationId,
          previousHead,
          projectId: project.project_id,
          startedAt,
          status: input.simulatePostCommitFailure === true ? 'partial_post_commit' : 'committed',
          validationRefs: [validation.validation_id],
          warnings:
            input.simulatePostCommitFailure === true ? ['post_commit_automation_incomplete'] : [],
        });
        writeOperationReceipt(projectRoot, operationReceipt);
        writeHead(projectRoot, restoredTree.tree_revision_id);
        updateProjectHead(projectRoot, restoredTree.tree_revision_id);
        return operationReceipt;
      } finally {
        release();
      }
    },

    async recover(input: StatusInput = {}): Promise<RecoveryReport> {
      await Promise.resolve();
      return recoverProject(normalizeProjectRoot(input.root));
    },

    async verify(input: StatusInput = {}): Promise<ValidationResultRecord> {
      await Promise.resolve();
      const projectRoot = normalizeProjectRoot(input.root);
      const operationId = createExpflowId('efo');
      try {
        const head = readHead(projectRoot);
        if (head !== null) {
          verifyTreeRevision(projectRoot, readTreeRevision(projectRoot, head));
        }
        return validationResult(operationId, 'pass', []);
      } catch (error) {
        const expflowError = toExpflowError(error);
        return validationResult(operationId, 'fail', [
          { code: expflowError.code, message: expflowError.message },
        ]);
      }
    },
  };
}

export function createProjectStateSnapshot(root?: string): ProjectRecord {
  return publicProjectState(normalizeProjectRoot(root));
}

export function readCommittedTree(
  root: string | undefined,
  treeRevisionId: string,
): TreeRevisionRecord {
  return cloneJson(readTreeRevision(normalizeProjectRoot(root), treeRevisionId));
}

export function readCommittedReceipt(
  root: string | undefined,
  operationId: string,
): OperationReceiptRecord {
  return cloneJson(readOperationReceipt(normalizeProjectRoot(root), operationId));
}
