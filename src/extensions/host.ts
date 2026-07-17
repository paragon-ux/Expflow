import {
  createProjectStateSnapshot,
  createRuntime,
  readCommittedReceipt,
  readCommittedTree,
  type ExpflowRuntime,
  type InitInput,
  type RestoreInput,
  type StatusInput,
  type SyncInput,
} from '../operations/runtime.js';
import type {
  OperationReceiptRecord,
  ProjectRecord,
  StatusReportRecord,
  TreeRevisionRecord,
} from '../material/types.js';

export interface ExpflowExtensionHost {
  init(input?: Omit<InitInput, 'root'>): Promise<OperationReceiptRecord>;
  sync(input?: Omit<SyncInput, 'root'>): Promise<OperationReceiptRecord>;
  status(input?: Omit<StatusInput, 'root'>): Promise<StatusReportRecord>;
  restore(input: Omit<RestoreInput, 'root'>): Promise<OperationReceiptRecord>;
  readProjectState(): ProjectRecord;
  readTreeRevision(treeRevisionId: string): TreeRevisionRecord;
  readOperationReceipt(operationId: string): OperationReceiptRecord;
}

export function createExtensionHost(projectRoot: string): ExpflowExtensionHost {
  const runtime: ExpflowRuntime = createRuntime();
  return {
    async init(input = {}) {
      return runtime.init({ ...input, root: projectRoot });
    },
    async restore(input) {
      return runtime.restore({ ...input, root: projectRoot });
    },
    readOperationReceipt(operationId) {
      return readCommittedReceipt(projectRoot, operationId);
    },
    readProjectState() {
      return createProjectStateSnapshot(projectRoot);
    },
    readTreeRevision(treeRevisionId) {
      return readCommittedTree(projectRoot, treeRevisionId);
    },
    async status(input = {}) {
      return runtime.status({ ...input, root: projectRoot });
    },
    async sync(input = {}) {
      return runtime.sync({ ...input, root: projectRoot });
    },
  };
}
