import { createHash, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { ExpflowError, toExpflowError } from '../core/errors.js';
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
  readonly pathEffects: readonly object[];
  readonly conflicts: readonly string[];
  readonly preservedDrift: readonly string[];
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
          .update(
            plan.entries
              .map(
                (e) =>
                  `${String((e as Record<string, unknown>).relative_path ?? '')}\x00${String((e as Record<string, unknown>).node_content_digest ?? '')}`,
              )
              .sort()
              .join('\x00'),
          )
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

        // Recompute and compare stable file digest to detect working-tree changes
        const currentPlan = await runtime.planSync({ root, dryRun: true });
        const currentDigest = createHash('sha256')
          .update(
            currentPlan.entries
              .map(
                (e) =>
                  `${String((e as Record<string, unknown>).relative_path ?? '')}\x00${String((e as Record<string, unknown>).node_content_digest ?? '')}`,
              )
              .sort()
              .join('\x00'),
          )
          .digest('hex');
        if (currentDigest !== stored.binding.changeDigest) {
          syncPlans.delete(input.planToken);
          throw new ExpflowError(
            'sync_candidate_changed',
            'The working tree has changed since the preview. Run Preview again.',
            {
              recoverable: true,
              recommendedAction: 'Run Preview to review the updated changes.',
            },
          );
        }

        syncPlans.delete(input.planToken);
        const receipt = await runtime.sync({ ...input, dryRun: false, root });
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
        restorePlans.set(planToken, {
          root,
          binding: {
            reference: plan.reference,
            sourceRef: plan.source_ref,
            currentHead: plan.current_head,
            pathEffects: plan.path_effects,
            conflicts: plan.conflicting_paths ?? [],
            preservedDrift: plan.preserved_drift_paths ?? [],
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

        // Recompute the restore plan and compare
        const currentPlan = await runtime.planRestore({ ...input, root });

        if (currentPlan.reference !== stored.binding.reference) {
          restorePlans.delete(input.planToken);
          throw new ExpflowError(
            'restore_reference_changed',
            'The restore reference has changed since the preview. Run Preview again.',
            {
              recoverable: true,
              recommendedAction: 'Run Preview to see the updated path effects.',
            },
          );
        }
        if (currentPlan.source_ref !== stored.binding.sourceRef) {
          restorePlans.delete(input.planToken);
          throw new ExpflowError(
            'restore_source_changed',
            'The resolved source has changed since the preview. Run Preview again.',
            {
              recoverable: true,
              recommendedAction: 'Run Preview to review the updated source.',
            },
          );
        }
        if (currentPlan.current_head !== stored.binding.currentHead) {
          restorePlans.delete(input.planToken);
          throw new ExpflowError(
            'restore_head_changed',
            'The Expflow head has changed since the preview. Run Preview again.',
            {
              recoverable: true,
              recommendedAction: 'Run Preview to see the updated effects.',
            },
          );
        }
        if (currentPlan.requires_force !== stored.binding.requiresForce) {
          restorePlans.delete(input.planToken);
          throw new ExpflowError(
            'restore_force_changed',
            'The force requirement has changed since the preview. Run Preview again.',
            {
              recoverable: true,
              recommendedAction: 'Run Preview to determine the current force status.',
            },
          );
        }
        // Compare path effects, conflicts, and preserved drift
        const currentConflicts = JSON.stringify([...(currentPlan.conflicting_paths ?? [])].sort());
        const storedConflicts = JSON.stringify([...stored.binding.conflicts].sort());
        if (currentConflicts !== storedConflicts) {
          restorePlans.delete(input.planToken);
          throw new ExpflowError(
            'restore_conflicts_changed',
            'The conflicting paths have changed since the preview. Run Preview again.',
            {
              recoverable: true,
              recommendedAction: 'Run Preview to review the updated conflicts.',
            },
          );
        }

        restorePlans.delete(input.planToken);
        const receipt = await runtime.restore({ ...input, root });
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
