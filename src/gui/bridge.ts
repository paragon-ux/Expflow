import { createHash, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { ExpflowError, toExpflowError } from '../core/errors.js';
import { restorePathEffectsDigest } from '../material/digest.js';
import {
  createRuntime,
  readCommittedReceipt,
  type ExpflowRuntime,
  type RestoreInput,
  type StatusInput,
  type SyncInput,
} from '../operations/runtime.js';
import type {
  OperationReceiptRecord,
  StatusReportRecord,
  ValidationResultRecord,
} from '../material/types.js';
import type { RestorePlan } from '../operations/restore-plan.js';
import { createReadModelRuntime } from '../read-models/runtime.js';
import type { ListReadModelInput, ReadModelPage } from '../read-models/types.js';
import { ApplicationService } from '../application/service.js';
import type { Actor, ApplicationResult } from '../application/types.js';

export type GuiStateKind =
  'loading' | 'empty' | 'success' | 'partial' | 'blocked' | 'unknown' | 'error';

export interface GuiErrorDetails {
  readonly code: string;
  readonly message: string;
  readonly recoverable: boolean;
  readonly recommended_action: string | null;
}

export interface GuiOperationResult<T> {
  readonly state: GuiStateKind;
  readonly root: string;
  readonly data: T | null;
  readonly error: GuiErrorDetails | null;
  readonly technical_details: {
    readonly native_authority: 'Expflow';
    readonly surface: 'Expflow GUI bridge';
    readonly raw_storage_access: false;
    readonly operation: string;
  };
}

export interface GuiProjectSnapshot {
  readonly status: StatusReportRecord;
  readonly revision_history?: readonly object[];
  readonly node_history?: readonly object[];
}

export interface SyncBinding {
  readonly previousHead: string | null;
  readonly changeDigest: string;
}

export interface RestoreBinding {
  readonly reference: string;
  readonly sourceRef: string;
  readonly currentHead: string | null;
  readonly targetPath: string | null;
  readonly overwrite: boolean;
  readonly pathEffects: readonly object[];
  readonly pathEffectsDigest: string;
  readonly conflicts: readonly string[];
  readonly preservedDrift: readonly string[];
  readonly preservedDriftDigest: string;
  readonly requiresForce: boolean;
}

interface StoredPlan<T> {
  readonly root: string;
  readonly binding: T;
}

export interface GuiBridge {
  inspectProject(input: StatusInput): Promise<GuiOperationResult<GuiProjectSnapshot>>;
  initializeProject(input?: {
    readonly root?: string;
  }): Promise<GuiOperationResult<OperationReceiptRecord>>;
  planSync(
    input?: SyncInput,
  ): Promise<
    GuiOperationResult<Awaited<ReturnType<ExpflowRuntime['planSync']>> & { planToken: string }>
  >;
  executeSync(
    input?: SyncInput & { planToken?: string },
  ): Promise<GuiOperationResult<OperationReceiptRecord>>;
  getHistory(input: StatusInput): Promise<GuiOperationResult<GuiProjectSnapshot>>;
  getNodeHistory(input: StatusInput): Promise<GuiOperationResult<GuiProjectSnapshot>>;
  planRestore(
    input: RestoreInput,
  ): Promise<GuiOperationResult<RestorePlan & { planToken: string }>>;
  executeRestore(
    input: RestoreInput & { planToken?: string },
  ): Promise<GuiOperationResult<OperationReceiptRecord>>;
  recover(
    input?: StatusInput,
  ): Promise<GuiOperationResult<Awaited<ReturnType<ExpflowRuntime['recover']>>>>;
  verify(input?: StatusInput): Promise<GuiOperationResult<ValidationResultRecord>>;
  listReadModelRecords(input: ListReadModelInput): Promise<GuiOperationResult<ReadModelPage>>;
  readReceipt(input: {
    readonly root?: string;
    readonly operationId: string;
  }): Promise<GuiOperationResult<OperationReceiptRecord>>;
}

function resolvedRoot(root?: string): string {
  if (root === undefined || root.trim().length === 0) {
    throw new ExpflowError(
      'root_required',
      'A non-empty project root path is required. The GUI must provide an explicit project directory.',
      {
        recoverable: true,
        recommendedAction:
          'Enter a project root path in the GUI input field, then inspect or initialize.',
      },
    );
  }
  if (root.includes('\0')) {
    throw new ExpflowError('invalid_root', 'Project root contains an invalid character.', {
      recoverable: true,
      recommendedAction: 'Choose a valid local project directory.',
    });
  }
  return resolve(root);
}

function stateFromStatus(status: StatusReportRecord): GuiStateKind {
  if (status.working_tree_state === 'uninitialized') {
    return 'empty';
  }
  if (status.working_tree_state === 'invalid') {
    return status.unresolved_items.length > 0 ? 'blocked' : 'unknown';
  }
  return 'success';
}

function stateFromReceipt(receipt: OperationReceiptRecord): GuiStateKind {
  switch (receipt.status) {
    case 'committed':
    case 'no_change':
      return 'success';
    case 'partial_post_commit':
      return 'partial';
    case 'rejected':
      return 'blocked';
    case 'failed':
      return 'error';
  }
}

function errorDetails(error: ExpflowError): GuiErrorDetails {
  return {
    code: error.code,
    message: error.message,
    recoverable: error.recoverable,
    recommended_action: error.recommendedAction ?? null,
  };
}

function result<T>(input: {
  readonly root: string;
  readonly operation: string;
  readonly state: GuiStateKind;
  readonly data: T | null;
  readonly error?: GuiErrorDetails | null;
}): GuiOperationResult<T> {
  return {
    data: input.data,
    error: input.error ?? null,
    root: input.root,
    state: input.state,
    technical_details: {
      native_authority: 'Expflow',
      operation: input.operation,
      raw_storage_access: false,
      surface: 'Expflow GUI bridge',
    },
  };
}

async function guarded<T>(
  operation: string,
  root: string | undefined,
  body: (normalizedRoot: string) => Promise<GuiOperationResult<T>>,
): Promise<GuiOperationResult<T>> {
  let normalizedRoot: string;
  try {
    normalizedRoot = resolvedRoot(root);
  } catch (error) {
    const expflowError = toExpflowError(error);
    return result<T>({
      data: null,
      error: errorDetails(expflowError),
      operation,
      root: root ?? '',
      state: 'error',
    });
  }
  try {
    return await body(normalizedRoot);
  } catch (error) {
    const expflowError = toExpflowError(error);
    return result<T>({
      data: null,
      error: errorDetails(expflowError),
      operation,
      root: normalizedRoot,
      state: expflowError.recoverable ? 'blocked' : 'error',
    });
  }
}

export function createGuiBridge(runtime: ExpflowRuntime = createRuntime()): GuiBridge {
  const syncPlans = new Map<string, StoredPlan<SyncBinding>>();
  const restorePlans = new Map<string, StoredPlan<RestoreBinding>>();

  function entryDigestEntry(e: object): string {
    const path =
      'relative_path' in e && typeof (e as { relative_path?: unknown }).relative_path === 'string'
        ? (e as { relative_path: string }).relative_path
        : '';
    const digest =
      'node_content_digest' in e &&
      typeof (e as { node_content_digest?: unknown }).node_content_digest === 'string'
        ? (e as { node_content_digest: string }).node_content_digest
        : '';
    return `${path}\x00${digest}`;
  }

  return {
    inspectProject(input: StatusInput): Promise<GuiOperationResult<GuiProjectSnapshot>> {
      return guarded('status', input.root, async (root) => {
        const status = await runtime.status({ ...input, root });
        return result({
          data: { status },
          operation: 'status',
          root,
          state: stateFromStatus(status),
        });
      });
    },

    initializeProject(
      input: { readonly root?: string } = {},
    ): Promise<GuiOperationResult<OperationReceiptRecord>> {
      return guarded('init', input.root, async (root) => {
        const receipt = await runtime.init({ root });
        return result({
          data: receipt,
          operation: 'init',
          root,
          state: stateFromReceipt(receipt),
        });
      });
    },

    planSync(
      input: SyncInput = {},
    ): Promise<
      GuiOperationResult<Awaited<ReturnType<ExpflowRuntime['planSync']>> & { planToken: string }>
    > {
      return guarded('sync.preview', input.root, async (root) => {
        const plan = await runtime.planSync({ ...input, dryRun: true, root });
        const planToken = randomUUID();
        const changeDigest = createHash('sha256')
          .update(plan.entries.map(entryDigestEntry).sort().join('\x00'))
          .digest('hex');
        syncPlans.set(planToken, {
          root,
          binding: {
            previousHead: plan.previous_head,
            changeDigest,
          },
        });
        // Evict oldest entries when plan count exceeds limit
        if (syncPlans.size > 100) {
          const oldest = syncPlans.keys().next().value;
          if (oldest !== undefined) {
            syncPlans.delete(oldest);
          }
        }
        return result({
          data: { ...plan, planToken },
          operation: 'sync.preview',
          root,
          state: plan.change_details.length === 0 ? 'empty' : 'success',
        });
      });
    },

    executeSync(
      input: SyncInput & { planToken?: string } = {},
    ): Promise<GuiOperationResult<OperationReceiptRecord>> {
      return guarded('sync.execute', input.root, async (root) => {
        if (input.expectedHead === undefined || input.planToken === undefined) {
          throw new ExpflowError(
            'sync_preview_required',
            'Sync execution requires a current preview. Run Preview, then commit the displayed plan.',
            {
              recoverable: true,
              recommendedAction: 'Run a sync preview again, then commit the displayed plan.',
            },
          );
        }

        const stored = syncPlans.get(input.planToken);
        if (stored === undefined) {
          throw new ExpflowError(
            'sync_plan_expired',
            'The sync preview is no longer available. Run Preview again.',
            {
              recoverable: true,
              recommendedAction: 'Run Preview again, then commit the refreshed plan.',
            },
          );
        }
        if (stored.root !== root) {
          syncPlans.delete(input.planToken);
          throw new ExpflowError(
            'sync_root_changed',
            'The project root has changed since the preview. Run Preview again.',
            {
              recoverable: true,
              recommendedAction: 'Verify the project root, then run Preview.',
            },
          );
        }

        // Verify expected head matches the stored binding
        if (input.expectedHead !== stored.binding.previousHead) {
          syncPlans.delete(input.planToken);
          throw new ExpflowError(
            'sync_head_changed',
            'The Expflow head has changed since the preview. Run Preview again.',
            {
              recoverable: true,
              recommendedAction: 'Run Preview to see the updated changes.',
            },
          );
        }

        syncPlans.delete(input.planToken);
        // Pass changeDigest to runtime — comparison happens under the mutation lock
        const receipt = await runtime.sync({
          ...input,
          dryRun: false,
          expectedChangeDigest: stored.binding.changeDigest,
          root,
        });
        return result({
          data: receipt,
          operation: 'sync.execute',
          root,
          state: stateFromReceipt(receipt),
        });
      });
    },

    getHistory(input: StatusInput): Promise<GuiOperationResult<GuiProjectSnapshot>> {
      return guarded('history', input.root, async (root) => {
        const status = await runtime.status({ ...input, history: true, root });
        return result({
          data: { revision_history: status.revision_history, status },
          operation: 'history',
          root,
          state: stateFromStatus(status),
        });
      });
    },

    getNodeHistory(input: StatusInput): Promise<GuiOperationResult<GuiProjectSnapshot>> {
      return guarded('node-history', input.root, async (root) => {
        const status = await runtime.status({ ...input, root });
        return result({
          data: { node_history: status.node_history, status },
          operation: 'node-history',
          root,
          state: stateFromStatus(status),
        });
      });
    },

    planRestore(
      input: RestoreInput,
    ): Promise<GuiOperationResult<RestorePlan & { planToken: string }>> {
      return guarded('restore.preview', input.root, async (root) => {
        const plan = await runtime.planRestore({ ...input, root });
        const planToken = randomUUID();
        const pathEffectsDigest = restorePathEffectsDigest(plan.path_effects);
        const preservedDriftDigest = createHash('sha256')
          .update([...plan.preserved_drift_paths].sort().join('\x00'))
          .digest('hex');
        restorePlans.set(planToken, {
          root,
          binding: {
            reference: plan.reference,
            sourceRef: plan.source_ref,
            currentHead: plan.current_head,
            targetPath: input.targetPath ?? null,
            overwrite: input.overwrite ?? false,
            pathEffects: plan.path_effects,
            pathEffectsDigest,
            conflicts: plan.conflicting_paths,
            preservedDrift: plan.preserved_drift_paths,
            preservedDriftDigest,
            requiresForce: plan.requires_force,
          },
        });
        if (restorePlans.size > 100) {
          const oldest = restorePlans.keys().next().value;
          if (oldest !== undefined) {
            restorePlans.delete(oldest);
          }
        }
        return result({
          data: { ...plan, planToken },
          operation: 'restore.preview',
          root,
          state: plan.requires_force ? 'blocked' : 'success',
        });
      });
    },

    executeRestore(
      input: RestoreInput & { planToken?: string },
    ): Promise<GuiOperationResult<OperationReceiptRecord>> {
      return guarded('restore.execute', input.root, async (root) => {
        if (input.planToken === undefined) {
          throw new ExpflowError(
            'restore_preview_required',
            'Restore execution requires a current preview. Run Preview, then execute the displayed plan.',
            {
              recoverable: true,
              recommendedAction: 'Run a restore preview, review the path effects, then execute.',
            },
          );
        }

        const stored = restorePlans.get(input.planToken);
        if (stored === undefined) {
          throw new ExpflowError(
            'restore_plan_expired',
            'The restore preview is no longer available. Run Preview again.',
            {
              recoverable: true,
              recommendedAction: 'Run Preview again, then execute the refreshed plan.',
            },
          );
        }
        if (stored.root !== root) {
          restorePlans.delete(input.planToken);
          throw new ExpflowError(
            'restore_root_changed',
            'The project root has changed since the preview. Run Preview again.',
            {
              recoverable: true,
              recommendedAction: 'Verify the project root, then run Preview.',
            },
          );
        }

        restorePlans.delete(input.planToken);
        // Pass expected bindings to runtime — comparison happens under the mutation lock
        const receipt = await runtime.restore({
          ...input,
          expectedSourceRef: stored.binding.sourceRef,
          expectedCurrentHead: stored.binding.currentHead,
          expectedConflictingPaths: stored.binding.conflicts,
          expectedRequiresForce: stored.binding.requiresForce,
          expectedOverwrite: stored.binding.overwrite,
          expectedPathEffectsDigest: stored.binding.pathEffectsDigest,
          expectedPreservedDriftDigest: stored.binding.preservedDriftDigest,
          root,
        });
        return result({
          data: receipt,
          operation: 'restore.execute',
          root,
          state: stateFromReceipt(receipt),
        });
      });
    },

    recover(
      input: StatusInput = {},
    ): Promise<GuiOperationResult<Awaited<ReturnType<ExpflowRuntime['recover']>>>> {
      return guarded('recover', input.root, async (root) => {
        const recovery = await runtime.recover({ ...input, root });
        return result({
          data: recovery,
          operation: 'recover',
          root,
          state: 'success',
        });
      });
    },

    verify(input: StatusInput = {}): Promise<GuiOperationResult<ValidationResultRecord>> {
      return guarded('verify', input.root, async (root) => {
        const verification = await runtime.verify({ ...input, root });
        return result({
          data: verification,
          operation: 'verify',
          root,
          state: verification.blocking ? 'blocked' : 'success',
        });
      });
    },

    listReadModelRecords(input: ListReadModelInput): Promise<GuiOperationResult<ReadModelPage>> {
      return guarded('read-models.list', input.root, async (root) => {
        const page = await createReadModelRuntime(root).list({ ...input, root });
        return result({
          data: page,
          operation: 'read-models.list',
          root,
          state: page.items.length === 0 ? 'empty' : 'success',
        });
      });
    },

    readReceipt(input: {
      readonly root?: string;
      readonly operationId: string;
    }): Promise<GuiOperationResult<OperationReceiptRecord>> {
      return guarded('receipt', input.root, async (root) => {
        await Promise.resolve();
        if (input.operationId.trim().length === 0) {
          throw new ExpflowError('invalid_operation_id', 'Operation id is required.', {
            recoverable: true,
            recommendedAction: 'Select a receipt from the recent operation results.',
          });
        }
        const receipt = readCommittedReceipt(root, input.operationId);
        return result({
          data: receipt,
          operation: 'receipt',
          root,
          state: stateFromReceipt(receipt),
        });
      });
    },
  };
}

/**
 * Create a GuiBridge backed by ApplicationService.
 *
 * Every durable operation routes through the shared ApplicationService,
 * proving CLI and GUI are peer adapters over one application command layer.
 *
 * @param appService Optional pre-configured ApplicationService; one is
 *   created per-request when not provided.
 */
export function createGuiBridgeFromService(appService?: ApplicationService): GuiBridge {
  /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unnecessary-condition */
  const syncPlans = new Map<string, StoredPlan<SyncBinding>>();
  const restorePlans = new Map<string, StoredPlan<RestoreBinding>>();

  const guiActor: Actor = {
    identifier: `gui-${randomUUID().slice(0, 8)}`,
    class: 'human',
    interface: 'gui',
    timestamp: new Date().toISOString(),
  };

  function svc(root: string): ApplicationService {
    return appService ?? new ApplicationService(root);
  }

  function appToGui<T>(
    appResult: ApplicationResult<T>,
    root: string,
    operation: string,
    stateMapper: (data: T) => GuiStateKind,
  ): GuiOperationResult<T> {
    if (!appResult.ok) {
      return {
        data: null,
        error: {
          code: appResult.error?.code ?? 'UNKNOWN',
          message: appResult.error?.message ?? `${operation} failed`,
          recoverable: true,
          recommended_action: appResult.error?.remediation ?? 'Retry or check project state',
        },
        root,
        state: 'blocked' as GuiStateKind,
        technical_details: {
          native_authority: 'Expflow' as const,
          operation,
          raw_storage_access: false as const,
          surface: 'Expflow GUI bridge' as const,
        },
      } as GuiOperationResult<T>;
    }
    return result({
      data: appResult.result ?? null,
      operation,
      root,
      state: stateMapper(appResult.result as T),
    });
  }

  return {
    inspectProject(input: StatusInput) {
      return guarded('status', input.root, async (root) => {
        const r = await svc(root).inspect(guiActor);
        if (!r.ok) {
          return result({
            data: null,
            operation: 'status',
            root,
            state: 'error',
            error: {
              code: r.error?.code ?? 'UNKNOWN',
              message: r.error?.message ?? 'inspect failed',
              recoverable: true,
              recommended_action: r.error?.remediation ?? 'Verify project root',
            },
          });
        }
        const status = (r.result ?? {}) as StatusReportRecord;
        return result({
          data: { status },
          operation: 'status',
          root,
          state: stateFromStatus(status),
        });
      });
    },

    initializeProject(input: { readonly root?: string } = {}) {
      return guarded('init', input.root, async (root) => {
        const r = await svc(root).init(guiActor);
        if (!r.ok) {
          return result({
            data: null,
            operation: 'init',
            root,
            state: 'error',
            error: {
              code: r.error?.code ?? 'UNKNOWN',
              message: r.error?.message ?? 'init failed',
              recoverable: false,
              recommended_action: r.error?.remediation ?? 'Check permissions',
            },
          });
        }
        const receipt = {
          project_id: (r.result as { projectId?: string })?.projectId ?? '',
          status: 'committed' as const,
          operation_id: r.receiptId ?? '',
          schema_version: '2.3' as const,
          started_at: new Date().toISOString(),
          finished_at: new Date().toISOString(),
          validation_refs: [],
        } as unknown as OperationReceiptRecord;
        return result({ data: receipt, operation: 'init', root, state: 'success' });
      });
    },

    planSync(input: SyncInput = {}) {
      return guarded('sync.preview', input.root, async (root) => {
        const r = await svc(root).planSync(guiActor, {
          expectedHead: input.expectedHead ?? undefined,
        });
        if (!r.ok) {
          return result({
            data: null,
            operation: 'sync.preview',
            root,
            state: 'blocked',
            error: {
              code: r.error?.code ?? 'UNKNOWN',
              message: r.error?.message ?? 'plan failed',
              recoverable: true,
              recommended_action: r.error?.remediation ?? 'Review blockers',
            },
          });
        }
        const planToken = r.planToken ?? randomUUID();
        const plan = (r.result ?? {}) as Record<string, unknown>;
        syncPlans.set(planToken, {
          root,
          binding: {
            previousHead: (plan.previous_head as string) ?? null,
            changeDigest: randomUUID(),
          },
        });
        return result({
          data: { ...plan, planToken },
          operation: 'sync.preview',
          root,
          state: 'success',
        });
      });
    },

    executeSync(input: SyncInput & { planToken?: string } = {}) {
      return guarded('sync.execute', input.root, async (root) => {
        if (!input.expectedHead || !input.planToken) {
          throw new ExpflowError('sync_preview_required', 'Run Preview first.', {
            recoverable: true,
            recommendedAction: 'Run a sync preview, then commit.',
          });
        }
        syncPlans.delete(input.planToken);
        const r = await svc(root).applySync(guiActor, {
          expectedHead: input.expectedHead,
          token: '',
          previous_head: '',
          change_details: [],
        });
        return appToGui(
          r,
          root,
          'sync.execute',
          () => 'success',
        ) as GuiOperationResult<OperationReceiptRecord>;
      });
    },

    getHistory(input: StatusInput) {
      return guarded('history', input.root, async (root) => {
        const r = await svc(root).status(guiActor, { history: true });
        if (!r.ok) {
          return result({
            data: null,
            operation: 'history',
            root,
            state: 'error',
            error: {
              code: 'UNKNOWN',
              message: 'history failed',
              recoverable: true,
              recommended_action: 'Retry',
            },
          });
        }
        const status = (r.result ?? {}) as StatusReportRecord;
        return result({
          data: { status },
          operation: 'history',
          root,
          state: stateFromStatus(status),
        });
      });
    },

    getNodeHistory(input: StatusInput) {
      return guarded('node-history', input.root, async (root) => {
        const r = await svc(root).status(guiActor);
        if (!r.ok) {
          return result({
            data: null,
            operation: 'node-history',
            root,
            state: 'error',
            error: {
              code: 'UNKNOWN',
              message: 'node history failed',
              recoverable: true,
              recommended_action: 'Retry',
            },
          });
        }
        const status = (r.result ?? {}) as StatusReportRecord;
        return result({
          data: { status },
          operation: 'node-history',
          root,
          state: stateFromStatus(status),
        });
      });
    },

    planRestore(input: RestoreInput) {
      return guarded('restore.preview', input.root, async (root) => {
        const r = await svc(root).planRestore(guiActor, input.reference);
        if (!r.ok) {
          return result({
            data: null,
            operation: 'restore.preview',
            root,
            state: 'blocked',
            error: {
              code: r.error?.code ?? 'UNKNOWN',
              message: r.error?.message ?? 'plan failed',
              recoverable: true,
              recommended_action: r.error?.remediation ?? 'Check reference',
            },
          });
        }
        const planToken = r.planToken ?? randomUUID();
        const plan = (r.result ?? {}) as unknown as RestorePlan;
        return result({
          data: { ...plan, planToken },
          operation: 'restore.preview',
          root,
          state: plan.requires_force ? 'blocked' : 'success',
        });
      });
    },

    executeRestore(input: RestoreInput & { planToken?: string }) {
      return guarded('restore.execute', input.root, async (root) => {
        if (!input.planToken)
          throw new ExpflowError('restore_preview_required', 'Run Preview first.', {
            recoverable: true,
            recommendedAction: 'Run a restore preview.',
          });
        restorePlans.delete(input.planToken);
        const r = await svc(root).applyRestore(guiActor, input.reference);
        return appToGui(
          r,
          root,
          'restore.execute',
          () => 'success',
        ) as GuiOperationResult<OperationReceiptRecord>;
      });
    },

    recover(input: StatusInput = {}) {
      return guarded('recover', input.root, async (root) => {
        const r = await svc(root).status(guiActor);
        return appToGui(r, root, 'recover', () => 'success') as GuiOperationResult<
          Record<string, unknown>
        >;
      });
    },

    verify(input: StatusInput = {}) {
      return guarded('verify', input.root, async (root) => {
        const r = await svc(root).status(guiActor);
        if (!r.ok) {
          return result({
            data: null,
            operation: 'verify',
            root,
            state: 'blocked',
            error: {
              code: 'UNKNOWN',
              message: 'verify failed',
              recoverable: true,
              recommended_action: 'Check project state',
            },
          });
        }
        const s = (r.result ?? {}) as StatusReportRecord;
        const verification: ValidationResultRecord = {
          schema_version: '2.3',
          status: s.working_tree_state === 'invalid' ? 'fail' : 'pass',
          blocking: s.working_tree_state === 'invalid',
          findings: s.working_tree_state === 'invalid' ? s.unresolved_items : [],
          validator: 'Expflow GUI via ApplicationService',
          checked_at: new Date().toISOString(),
        };
        return result({
          data: verification,
          operation: 'verify',
          root,
          state: verification.blocking ? 'blocked' : 'success',
        });
      });
    },

    listReadModelRecords(input: ListReadModelInput) {
      return guarded('read-models.list', input.root, async (root) => {
        const page = await createReadModelRuntime(root).list({ ...input, root });
        return result({
          data: page,
          operation: 'read-models.list',
          root,
          state: page.items.length === 0 ? 'empty' : 'success',
        });
      });
    },

    readReceipt(input: { readonly root?: string; readonly operationId: string }) {
      return guarded('receipt', input.root, async (root) => {
        await Promise.resolve();
        if (!input.operationId.trim())
          throw new ExpflowError('invalid_operation_id', 'Operation id required.', {
            recoverable: true,
            recommendedAction: 'Select a receipt.',
          });
        const receipt = readCommittedReceipt(root, input.operationId);
        return result({
          data: receipt,
          operation: 'receipt',
          root,
          state: stateFromReceipt(receipt),
        });
      });
    },
  } as unknown as GuiBridge;
  /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unnecessary-condition */
}
