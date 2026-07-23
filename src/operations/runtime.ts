import { basename, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { ExpflowError, toExpflowError } from '../core/errors.js';
import { createExpflowId } from '../core/ids.js';
import { cloneJson } from '../core/json.js';
import { normalizeProjectRoot, PROJECTION_ROOT } from '../core/paths.js';
import { VERSION } from '../core/version.js';
import { scanWorkingTree, defaultPathSelector } from '../scan/scanner.js';
import { classifySyncPlanChanges, type PendingChangeDetail } from '../material/changes.js';
import { treeContentDigest } from '../material/digest.js';
import { planCandidateTree } from '../material/planner.js';
import {
  createLock,
  ensureStoreDirectories,
  isProjectInitialized,
  listNodeRevisions,
  listOperationReceipts,
  listTreeRevisionIds,
  nextNodeRevisionNumber,
  prepareOperationStaging,
  publicProjectState,
  readHead,
  readNodeRevision,
  readObjectBytes,
  readOperationReceipt,
  readProject,
  readTreeRevision,
  removeOperationStaging,
  removeRecoveryIntent,
  storeObjectFromFile,
  updateProjectHead,
  verifyTreeRevision,
  writeChangeSet,
  writeHead,
  writeNodeRevision,
  writeOperationReceipt,
  writeProject,
  writeRecoveryIntent,
  writeTreeRevision,
  writeValidationResult,
} from '../material/store.js';
import { buildRestorePlan, type RestorePlan } from './restore-plan.js';
import { recoverProject, type RecoveryReport } from '../transactions/recovery.js';
import {
  deleteRestorePaths,
  stageRestoreFile,
  writeRestoreFiles,
} from '../transactions/working-tree-restore.js';
import type {
  AutomationOptions,
  CandidateTree,
  InitRecoveryIntentRecord,
  OperationChange,
  OperationPlanRecord,
  OperationReceiptRecord,
  PathSelectorRecord,
  ProjectRecord,
  RequestedBy,
  RestoreRecoveryIntentRecord,
  ScannedFile,
  StatusReportRecord,
  TreeRevisionRecord,
  ValidationResultRecord,
} from '../material/types.js';

export type MaterialFaultPoint =
  | 'after_init_intent'
  | 'after_material_records'
  | 'after_restore_intent'
  | 'after_restore_delete'
  | 'after_restore_write'
  | 'after_head_write';

export interface RuntimeOptions {
  readonly requestedBy?: RequestedBy;
  readonly simulatePostCommitFailure?: boolean;
  readonly simulateFailureAt?: MaterialFaultPoint;
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
  readonly expectedChangeDigest?: string;
  readonly scope?: PathSelectorRecord;
  readonly changedPathHints?: readonly string[];
  readonly changes?: readonly OperationChange[];
  readonly dryRun?: boolean;
}

export interface StatusInput {
  readonly root?: string;
  readonly history?: boolean;
  readonly nodeHistoryPath?: string;
  readonly historyLimit?: number;
}

export interface RestoreInput extends RuntimeOptions {
  readonly root?: string;
  readonly reference: string;
  readonly targetPath?: string;
  readonly overwrite?: boolean;
  readonly expectedSourceRef?: string;
  readonly expectedCurrentHead?: string | null;
  readonly expectedConflictingPaths?: readonly string[];
  readonly expectedRequiresForce?: boolean;
  readonly expectedOverwrite?: boolean;
  readonly expectedPathEffectsDigest?: string;
  readonly expectedPreservedDriftDigest?: string;
}

export interface SyncPlan {
  readonly operation_id: string;
  readonly project_id: string;
  readonly previous_head: string | null;
  readonly candidate_head: string;
  readonly entries: readonly object[];
  readonly removed_paths: readonly string[];
  readonly new_node_revisions: readonly string[];
  readonly change_details: readonly PendingChangeDetail[];
  readonly identity_proposals: readonly object[];
  readonly content_digest: string;
}

export interface ExpflowRuntime {
  init(input?: InitInput): Promise<OperationReceiptRecord>;
  sync(input?: SyncInput): Promise<OperationReceiptRecord>;
  planSync(input?: SyncInput): Promise<SyncPlan>;
  status(input?: StatusInput): Promise<StatusReportRecord>;
  restore(input: RestoreInput): Promise<OperationReceiptRecord>;
  planRestore(input: RestoreInput): Promise<RestorePlan>;
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
    validator_version: VERSION,
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
  treeRevisionId = createExpflowId('eft'),
): TreeRevisionRecord {
  for (const node of candidate.new_node_revisions) {
    storeObjectFromFile(
      projectRoot,
      node.source_path,
      node.record.content_digest,
      candidate.operation_id,
    );
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
    tree_revision_id: treeRevisionId,
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
  _projectRoot: string,
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
    root_path: '.',
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
    nextRevisionForNode: (nodeId) => nextNodeRevisionNumber(projectRoot, nodeId),
    scannedFiles: scanWorkingTree(projectRoot, scope),
    scope,
    source: 'sync',
  });
  const newNodeRevisionRefs = candidate.new_node_revisions.map(
    (node) => `${node.record.node_id}@${String(node.record.revision)}`,
  );
  return {
    candidate_head: candidate.content_digest,
    change_details: classifySyncPlanChanges(
      {
        entries: candidate.entries,
        new_node_revisions: newNodeRevisionRefs,
        removed_paths: candidate.removed_paths,
      },
      currentTree,
      input.changes ?? [],
    ),
    content_digest: candidate.content_digest,
    entries: candidate.entries,
    identity_proposals: candidate.identity_proposals,
    new_node_revisions: newNodeRevisionRefs,
    operation_id: operationId,
    previous_head: currentTree?.tree_revision_id ?? null,
    project_id: project.project_id,
    removed_paths: candidate.removed_paths,
  };
}

function revisionHistory(
  projectRoot: string,
  head: string | null,
  historyLimit: number | undefined,
): readonly object[] {
  const limit = Math.min(Math.max(historyLimit ?? 10, 1), 100);
  const statusByOperation = new Map<string, OperationReceiptRecord['status']>();
  for (const operationReceipt of listOperationReceipts(projectRoot)) {
    statusByOperation.set(operationReceipt.operation_id, operationReceipt.status);
  }
  return listTreeRevisionIds(projectRoot)
    .map((treeRevisionId) => readTreeRevision(projectRoot, treeRevisionId))
    .sort((left, right) => right.sequence - left.sequence)
    .slice(0, limit)
    .map((tree) => ({
      created_at: tree.created_at,
      created_by_operation: tree.created_by_operation,
      is_current_head: tree.tree_revision_id === head,
      operation_status: statusByOperation.get(tree.created_by_operation) ?? null,
      restore_reference: `tree:${tree.tree_revision_id}`,
      sequence: tree.sequence,
      source: tree.source,
      tree_revision_id: tree.tree_revision_id,
    }));
}

function nodeHistory(projectRoot: string, head: string | null, path: string): readonly object[] {
  const currentTree = head === null ? null : readTreeRevision(projectRoot, head);
  const entry = currentTree?.entries.find((candidate) => candidate.relative_path === path);
  if (entry === undefined || entry.node_id === null || entry.node_id === undefined) {
    throw new ExpflowError('node_revision_missing', `No tracked node at path: ${path}`, {
      recoverable: true,
      recommendedAction: 'Run `expflow status --history` to list restorable project versions.',
    });
  }
  const nodeId = entry.node_id;
  return listNodeRevisions(projectRoot, nodeId).map((record) => ({
    created_at: record.created_at,
    created_by_operation: record.created_by_operation,
    is_current: record.revision === entry.node_revision,
    node_id: record.node_id,
    node_revision_ref: `${record.node_id}@${String(record.revision)}`,
    restore_reference: `node:${record.node_id}@${String(record.revision)}:${path}`,
    revision: record.revision,
  }));
}

function failIfRequested(input: RuntimeOptions, point: MaterialFaultPoint): void {
  if (input.simulateFailureAt === point) {
    throw new ExpflowError('operation_recovery_required', `Simulated interruption at ${point}.`, {
      recoverable: true,
    });
  }
}

function scannedFileForStagedRestore(
  relativePath: string,
  absolutePath: string,
  bytes: Buffer,
  contentDigest: string,
): ScannedFile {
  return {
    absolute_path: absolutePath,
    byte_size: bytes.byteLength,
    content_digest: contentDigest,
    filename: basename(relativePath),
    folder_name: dirname(relativePath) === '.' ? null : dirname(relativePath),
    relative_path: relativePath,
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
        prepareOperationStaging(projectRoot, operationId);
        const projectId = createExpflowId('efp');
        const project = makeProject(projectRoot, projectId, startedAt, input);

        const scope = defaultPathSelector();
        const targetTreeRevisionId = createExpflowId('eft');
        const candidate = planCandidateTree({
          changes: [],
          createdAt: startedAt,
          currentTree: null,
          operationId,
          projectId,
          nextRevisionForNode: (nodeId) => nextNodeRevisionNumber(projectRoot, nodeId),
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
          removeOperationStaging(projectRoot, operationId);
          return rejected;
        }

        const initializedProject = {
          ...project,
          head_tree_revision_id: targetTreeRevisionId,
        };
        const initIntent: InitRecoveryIntentRecord = {
          schema_version: '2.3',
          created_at: startedAt,
          intent_type: 'init_project',
          operation_id: operationId,
          project: initializedProject,
          target_head: targetTreeRevisionId,
        };
        writeRecoveryIntent(projectRoot, operationId, initIntent);
        failIfRequested(input, 'after_init_intent');

        const tree = commitCandidateTree(projectRoot, candidate, startedAt, targetTreeRevisionId);
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
        failIfRequested(input, 'after_material_records');
        writeProject(projectRoot, initializedProject);
        writeHead(projectRoot, tree.tree_revision_id);
        failIfRequested(input, 'after_head_write');
        removeRecoveryIntent(projectRoot, operationId);
        removeOperationStaging(projectRoot, operationId);
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
        prepareOperationStaging(projectRoot, operationId);
        const scope = input.scope ?? defaultPathSelector();
        const currentTree =
          previousHead === null ? null : readTreeRevision(projectRoot, previousHead);
        const scannedFiles = scanWorkingTree(projectRoot, scope);

        // Compare working-tree stable digest against preview binding (under lock)
        if (input.expectedChangeDigest !== undefined) {
          const actualDigest = createHash('sha256')
            .update(
              scannedFiles
                .map((f) => `${f.relative_path}\x00${f.content_digest}`)
                .sort()
                .join('\x00'),
            )
            .digest('hex');
          if (actualDigest !== input.expectedChangeDigest) {
            throw new ExpflowError(
              'sync_candidate_changed',
              'The working tree has changed since the preview. Run Preview again.',
              {
                recoverable: true,
                recommendedAction: 'Run Preview to review the updated changes.',
              },
            );
          }
        }

        const candidate = planCandidateTree({
          changes: input.changes ?? [],
          createdAt: startedAt,
          currentTree,
          operationId,
          projectId: project.project_id,
          nextRevisionForNode: (nodeId) => nextNodeRevisionNumber(projectRoot, nodeId),
          scannedFiles,
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
          removeOperationStaging(projectRoot, operationId);
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
          removeOperationStaging(projectRoot, operationId);
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
        failIfRequested(input, 'after_material_records');
        writeHead(projectRoot, tree.tree_revision_id);
        updateProjectHead(projectRoot, tree.tree_revision_id);
        failIfRequested(input, 'after_head_write');
        removeOperationStaging(projectRoot, operationId);
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
      let report: StatusReportRecord;
      try {
        const plan = buildSyncPlan(projectRoot, {});
        report = {
          schema_version: '2.3',
          automation_state: { failed_hooks: [], pending_hooks: [] },
          generated_at: new Date().toISOString(),
          head_tree_revision_id: readHead(projectRoot),
          manifest_heads: {},
          pending_change_details: plan.change_details,
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
      if (report.working_tree_state !== 'clean' && report.working_tree_state !== 'drifted') {
        return report;
      }
      const head = report.head_tree_revision_id;
      return {
        ...report,
        ...(input.history === true
          ? { revision_history: revisionHistory(projectRoot, head, input.historyLimit) }
          : {}),
        ...(input.nodeHistoryPath !== undefined
          ? { node_history: nodeHistory(projectRoot, head, input.nodeHistoryPath) }
          : {}),
      };
    },

    async restore(input: RestoreInput): Promise<OperationReceiptRecord> {
      await Promise.resolve();
      const projectRoot = normalizeProjectRoot(input.root);
      const project = readProject(projectRoot);
      const release = createLock(projectRoot);
      try {
        const previousHead = readHead(projectRoot);

        // Build restore plan under the lock and compare with preview binding
        const plan = buildRestorePlan(projectRoot, input.reference, input.targetPath);
        if (input.expectedSourceRef !== undefined && plan.source_ref !== input.expectedSourceRef) {
          throw new ExpflowError(
            'restore_source_changed',
            'The resolved source has changed since the preview. Run Preview again.',
            { recoverable: true, recommendedAction: 'Run Preview to review the updated source.' },
          );
        }
        if (
          input.expectedCurrentHead !== undefined &&
          plan.current_head !== input.expectedCurrentHead
        ) {
          throw new ExpflowError(
            'restore_head_changed',
            'The Expflow head has changed since the preview. Run Preview again.',
            { recoverable: true, recommendedAction: 'Run Preview to see the updated effects.' },
          );
        }
        if (
          input.expectedConflictingPaths !== undefined &&
          JSON.stringify([...plan.conflicting_paths].sort()) !==
            JSON.stringify([...input.expectedConflictingPaths].sort())
        ) {
          throw new ExpflowError(
            'restore_conflicts_changed',
            'The conflicting paths have changed since the preview. Run Preview again.',
            {
              recoverable: true,
              recommendedAction: 'Run Preview to review the updated conflicts.',
            },
          );
        }
        if (
          input.expectedRequiresForce !== undefined &&
          plan.requires_force !== input.expectedRequiresForce
        ) {
          throw new ExpflowError(
            'restore_force_changed',
            'The force requirement has changed since the preview. Run Preview again.',
            {
              recoverable: true,
              recommendedAction: 'Run Preview to determine the current force status.',
            },
          );
        }
        // Compare overwrite choice
        if (input.expectedOverwrite !== undefined && input.overwrite !== input.expectedOverwrite) {
          throw new ExpflowError(
            'restore_overwrite_changed',
            'The force/overwrite choice has changed since the preview. Run Preview again.',
            {
              recoverable: true,
              recommendedAction: 'Run Preview with the intended overwrite setting.',
            },
          );
        }
        // Compare path effects digest
        if (input.expectedPathEffectsDigest !== undefined) {
          const actualDigest = createHash('sha256')
            .update(
              plan.path_effects
                .map((e) => `${e.relative_path}\x00${e.effect}\x00${e.conflicting ? '1' : '0'}`)
                .sort()
                .join('\x00'),
            )
            .digest('hex');
          if (actualDigest !== input.expectedPathEffectsDigest) {
            throw new ExpflowError(
              'restore_path_effects_changed',
              'The path effects have changed since the preview. Run Preview again.',
              {
                recoverable: true,
                recommendedAction: 'Run Preview to review the updated path effects.',
              },
            );
          }
        }
        // Compare preserved drift digest
        if (input.expectedPreservedDriftDigest !== undefined) {
          const actualDigest = createHash('sha256')
            .update([...plan.preserved_drift_paths].sort().join('\x00'))
            .digest('hex');
          if (actualDigest !== input.expectedPreservedDriftDigest) {
            throw new ExpflowError(
              'restore_drift_changed',
              'The preserved drift paths have changed since the preview. Run Preview again.',
              {
                recoverable: true,
                recommendedAction: 'Run Preview to review the updated preserved drift.',
              },
            );
          }
        }

        if (plan.requires_force && input.overwrite !== true) {
          const named = plan.conflicting_paths.slice(0, 20);
          const remaining = plan.conflicting_paths.length - named.length;
          throw new ExpflowError(
            'restore_conflict',
            `Restore would overwrite unrecorded working-tree changes at: ${named.join(', ')}${
              remaining > 0 ? ` +${String(remaining)} more` : ''
            }`,
            {
              recoverable: true,
              recommendedAction:
                'Run `expflow sync` to record your working-tree changes first, or re-run with --force to overwrite them.',
            },
          );
        }

        const startedAt = new Date().toISOString();
        const operationId = createExpflowId('efo');
        prepareOperationStaging(projectRoot, operationId);
        const targetTreeRevisionId = createExpflowId('eft');
        const effectByPath = new Map(
          plan.path_effects.map((pathEffect) => [pathEffect.relative_path, pathEffect.effect]),
        );
        const scannedFiles = scanWorkingTree(projectRoot, defaultPathSelector());
        const scanDigestByPath = new Map(
          scannedFiles.map((file) => [file.relative_path, file.content_digest]),
        );
        let restoredTree: TreeRevisionRecord;
        let restoreIntent: RestoreRecoveryIntentRecord;
        if (plan.reference_kind === 'tree') {
          const sourceTree = readTreeRevision(projectRoot, plan.source_ref);
          const currentTree =
            previousHead === null ? null : readTreeRevision(projectRoot, previousHead);
          const headDigestByPath = new Map<string, string | null>();
          for (const entry of currentTree?.entries ?? []) {
            if (entry.entry_kind === 'file') {
              headDigestByPath.set(entry.relative_path, entry.node_content_digest ?? null);
            }
          }
          const restoredPaths = treeFilePaths(sourceTree);
          const removedPaths =
            currentTree === null
              ? []
              : currentTree.entries
                  .filter((entry) => !restoredPaths.has(entry.relative_path))
                  .map((entry) => entry.relative_path)
                  .sort();
          const deletePaths = removedPaths.filter((path) => {
            const workingDigest = scanDigestByPath.get(path);
            return workingDigest === undefined || workingDigest === headDigestByPath.get(path);
          });
          if (input.overwrite === true) {
            for (const path of plan.conflicting_paths) {
              if (effectByPath.get(path) === 'remove' && !deletePaths.includes(path)) {
                deletePaths.push(path);
              }
            }
            deletePaths.sort();
          }
          const writeFiles: { content_digest: string; relative_path: string }[] = [];
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
            const effect = effectByPath.get(entry.relative_path);
            if (effect !== 'create' && effect !== 'update') {
              continue;
            }
            const workingDigest = scanDigestByPath.get(entry.relative_path);
            if (workingDigest !== undefined && workingDigest === entry.node_content_digest) {
              continue;
            }
            const node = readNodeRevision(projectRoot, entry.node_id, entry.node_revision);
            const bytes = readObjectBytes(projectRoot, node.content_digest);
            stageRestoreFile(projectRoot, operationId, entry.relative_path, bytes);
            writeFiles.push({
              content_digest: node.content_digest,
              relative_path: entry.relative_path,
            });
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
            removed_paths: removedPaths,
            parent_tree_revision_id: previousHead,
            sequence: (currentTree?.sequence ?? 0) + 1,
            source: 'restore',
            tree_revision_id: targetTreeRevisionId,
          };
          restoreIntent = {
            schema_version: '2.3',
            created_at: startedAt,
            delete_paths: deletePaths,
            intent_type: 'restore_working_tree',
            operation_id: operationId,
            previous_head: previousHead,
            target_head: targetTreeRevisionId,
            write_files: writeFiles,
          };
          writeRecoveryIntent(projectRoot, operationId, restoreIntent);
          failIfRequested(input, 'after_restore_intent');
          writeTreeRevision(projectRoot, restoredTree);
        } else {
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
          const scope = defaultPathSelector();
          const currentTree =
            previousHead === null ? null : readTreeRevision(projectRoot, previousHead);
          const needsWrite = scanDigestByPath.get(targetPath) !== node.content_digest;
          const writeFiles: { content_digest: string; relative_path: string }[] = [];
          let candidateScannedFiles = scannedFiles;
          if (needsWrite) {
            const bytes = readObjectBytes(projectRoot, node.content_digest);
            const stagedPath = stageRestoreFile(projectRoot, operationId, targetPath, bytes);
            candidateScannedFiles = [
              ...scannedFiles.filter((file) => file.relative_path !== targetPath),
              scannedFileForStagedRestore(targetPath, stagedPath, bytes, node.content_digest),
            ];
            writeFiles.push({ content_digest: node.content_digest, relative_path: targetPath });
          }
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
            nextRevisionForNode: (nodeId) => nextNodeRevisionNumber(projectRoot, nodeId),
            scannedFiles: candidateScannedFiles,
            scope,
            source: 'restore',
          });
          restoreIntent = {
            schema_version: '2.3',
            created_at: startedAt,
            delete_paths: [],
            intent_type: 'restore_working_tree',
            operation_id: operationId,
            previous_head: previousHead,
            target_head: targetTreeRevisionId,
            write_files: writeFiles,
          };
          writeRecoveryIntent(projectRoot, operationId, restoreIntent);
          failIfRequested(input, 'after_restore_intent');
          restoredTree = commitCandidateTree(
            projectRoot,
            candidate,
            startedAt,
            targetTreeRevisionId,
          );
        }

        const validation = validationResult(operationId, 'pass', []);
        writeValidationResult(projectRoot, validation);
        verifyTreeRevision(projectRoot, restoredTree);
        const warnings = [
          ...(input.overwrite === true && plan.requires_force
            ? ['overwrote_unrecorded_changes']
            : []),
          ...(input.simulatePostCommitFailure === true
            ? ['post_commit_automation_incomplete']
            : []),
        ];
        const operationReceipt = receipt({
          newHead: restoredTree.tree_revision_id,
          operationId,
          previousHead,
          projectId: project.project_id,
          startedAt,
          status: input.simulatePostCommitFailure === true ? 'partial_post_commit' : 'committed',
          validationRefs: [validation.validation_id],
          warnings,
        });
        writeOperationReceipt(projectRoot, operationReceipt);
        failIfRequested(input, 'after_material_records');
        deleteRestorePaths(projectRoot, restoreIntent);
        failIfRequested(input, 'after_restore_delete');
        writeRestoreFiles(projectRoot, restoreIntent);
        failIfRequested(input, 'after_restore_write');
        writeHead(projectRoot, restoredTree.tree_revision_id);
        updateProjectHead(projectRoot, restoredTree.tree_revision_id);
        failIfRequested(input, 'after_head_write');
        removeRecoveryIntent(projectRoot, operationId);
        removeOperationStaging(projectRoot, operationId);
        return operationReceipt;
      } finally {
        release();
      }
    },

    async planRestore(input: RestoreInput): Promise<RestorePlan> {
      await Promise.resolve();
      return buildRestorePlan(normalizeProjectRoot(input.root), input.reference, input.targetPath);
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
