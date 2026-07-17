# Extension Boundary

**Status:** Gate B implemented baseline

The core extension host is narrow and separately packaged adapters must stay outside the core repository.

## Allowed Extension Exports

- Schema-valid immutable records.
- Invocation of the four native operations.
- Operation receipts.
- Read-only project state.

## Prohibited Extension Exports

- Raw `.expflow` storage paths.
- Internal store implementations.
- Undocumented records.
- Adapter idempotency, cursors, reconciliation, capability policy, or writer partitioning.

## Gate B Implementation

Gate B implements `createExtensionHost(projectRoot)`.

The host exposes:

- `init`, `sync`, `status`, and `restore` native operation invokers;
- `readProjectState`;
- `readTreeRevision`;
- `readOperationReceipt`.

The host does not expose raw `.expflow` paths, store classes, adapter inspection, change cursors, idempotency, lost-response reconciliation, capability policy, or writer partitioning.
