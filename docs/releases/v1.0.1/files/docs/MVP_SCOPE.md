# MVP Scope

**Status:** Gate A Phase 2 baseline
**Workflow SSOT:** `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`

## In Scope For Gate A

- Immutable preservation of architecture sources.
- Source manifest, schema index, and example index controls.
- Mutable architecture-decision documents derived from immutable sources.
- Core schema and registry discovery.
- Valid, invalid, compatibility, recovery, tree-digest, and example fixture structure.
- TypeScript and Python schema validation parity.
- Generated or derived type descriptors.
- Documentation of adapter deferral and extension boundaries.

## Out Of Scope For Gate A

- Material scanning, object storage, locks, staging, transactions, recovery, and receipts.
- Operational handlers for `init`, `sync`, `status`, or `restore`.
- Authority registration runtime, decision stores, conflict resolution runtime, or derived semantic state.
- Workflow occurrence runtime, projection engines, regeneration, equivalence evaluation, and structural reuse algorithms.
- Hook registration, dispatch, subprocess execution, model-provider calls, network behavior, databases, or brokers.
- Adapter packages, external inspection protocol, external cursors, idempotency, reconciliation, and capability policy.

## MVP Boundary

The MVP begins with a local core that can eventually version complete project trees through a small ordinary command surface. Gate A only freezes the contract needed to start that work safely.
