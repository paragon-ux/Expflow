# Codex Build Plan

**Status:** Gate B material-core implementation
**Workflow SSOT:** `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`

## Current Path

1. Gate A -- Contract Ready: complete and merged to `origin/main`.
2. Phase 5 -- Immutable Material Stores: implement local object, node-revision, tree-revision, project, material-head, receipt, validation, and change stores.
3. Phase 6 -- Sync, Scanning, and Identity: implement scanner exclusion, deterministic candidate trees, same-path continuity, explicit identity directives, and digest-similarity proposals.
4. Phase 7 -- Transactions and Core Recovery: implement lock, validation, immutable receipts, partial post-commit status, and local recovery checks.
5. Phase 8 -- Four Commands and Extension Host: implement native runtime operations, CLI handlers, package verification, and narrow extension host.
6. Gate B Exit: confirm local validation, commit, push, PR review, and hosted CI.

## Execution Rules

- Do not modify immutable `docs/architecture/**` sources.
- In Gate B, implement only material-core runtime. Do not implement authority runtime, semantic stores, workflow detection, projections, hooks, adapters, migration runtime, network services, databases, brokers, external inspection, change cursors, idempotency, or reconciliation.
- Keep `docs/CURRENT_STATUS_MATRIX.md` mutable and outside validation.
- Update completion evidence with actual command results only.
