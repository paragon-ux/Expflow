# Protocol Core Specification

**Status:** Gate A Phase 2 baseline

The ordinary command surface is fixed:

```text
expflow init
expflow sync
expflow status
expflow restore
```

## Native Operations

| Ordinary command  | Protocol operation | Gate A status  |
| ----------------- | ------------------ | -------------- |
| `expflow init`    | `project.init`     | Help text only |
| `expflow sync`    | `project.sync`     | Help text only |
| `expflow status`  | `project.status`   | Help text only |
| `expflow restore` | `revision.restore` | Help text only |

## Core Messages

Core message and record shapes are supplied as JSON Schemas in `docs/architecture/schemas/` and mirrored under `schemas/`. Gate A validates those schemas and examples but does not dispatch operations.

## Deferred Adapter Contracts

The core protocol does not define external inspection, composite project revision tokens, incremental change cursors, adapter request canonicalization, external idempotency, lost-response reconciliation, capability policy, writer partitioning, adapter attempts, or adapter outcomes.
