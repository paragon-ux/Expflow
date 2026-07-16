export { VERSION } from './core/version.js';
export { createRuntime } from './operations/runtime.js';
export { createExtensionHost } from './extensions/host.js';
export type {
  ExpflowRuntime,
  InitInput,
  RestoreInput,
  StatusInput,
  SyncInput,
  SyncPlan,
} from './operations/runtime.js';
export type { ExpflowExtensionHost } from './extensions/host.js';
export type {
  OperationReceiptRecord,
  ProjectRecord,
  StatusReportRecord,
  TreeRevisionRecord,
} from './material/types.js';
