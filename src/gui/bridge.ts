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

export interface GuiBridge {
  inspectProject(input: StatusInput): Promise<GuiOperationResult<GuiProjectSnapshot>>;
  initializeProject(input?: {
    readonly root?: string;
  }): Promise<GuiOperationResult<OperationReceiptRecord>>;
  planSync(
    input?: SyncInput,
  ): Promise<GuiOperationResult<Awaited<ReturnType<ExpflowRuntime['planSync']>>>>;
  executeSync(input?: SyncInput): Promise<GuiOperationResult<OperationReceiptRecord>>;
  getHistory(input: StatusInput): Promise<GuiOperationResult<GuiProjectSnapshot>>;
  getNodeHistory(input: StatusInput): Promise<GuiOperationResult<GuiProjectSnapshot>>;
  planRestore(input: RestoreInput): Promise<GuiOperationResult<RestorePlan>>;
  executeRestore(input: RestoreInput): Promise<GuiOperationResult<OperationReceiptRecord>>;
  recover(
    input?: StatusInput,
  ): Promise<GuiOperationResult<Awaited<ReturnType<ExpflowRuntime['recover']>>>>;
  verify(input?: StatusInput): Promise<GuiOperationResult<ValidationResultRecord>>;
  readReceipt(input: {
    readonly root?: string;
    readonly operationId: string;
  }): Promise<GuiOperationResult<OperationReceiptRecord>>;
}

function resolvedRoot(root?: string): string {
  if (root === undefined || root.trim().length === 0) {
    return resolve(process.cwd());
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
      root: resolve(process.cwd()),
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
    ): Promise<GuiOperationResult<Awaited<ReturnType<ExpflowRuntime['planSync']>>>> {
      return guarded('sync.preview', input.root, async (root) => {
        const plan = await runtime.planSync({ ...input, dryRun: true, root });
        return result({
          data: plan,
          operation: 'sync.preview',
          root,
          state: plan.change_details.length === 0 ? 'empty' : 'success',
        });
      });
    },

    executeSync(input: SyncInput = {}): Promise<GuiOperationResult<OperationReceiptRecord>> {
      return guarded('sync.execute', input.root, async (root) => {
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

    planRestore(input: RestoreInput): Promise<GuiOperationResult<RestorePlan>> {
      return guarded('restore.preview', input.root, async (root) => {
        const plan = await runtime.planRestore({ ...input, root });
        return result({
          data: plan,
          operation: 'restore.preview',
          root,
          state: plan.requires_force ? 'blocked' : 'success',
        });
      });
    },

    executeRestore(input: RestoreInput): Promise<GuiOperationResult<OperationReceiptRecord>> {
      return guarded('restore.execute', input.root, async (root) => {
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
