# Extension Boundary

**Status:** Gate A Phase 2 baseline

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

## Gate A Constraint

Gate A may document extension types and verify that adapter-only contracts remain absent. It must not implement an adapter package or adapter runtime.
