# Protocol Core Specification

**Status:** Gate B implemented baseline

The ordinary command surface is fixed:

```text
expflow init
expflow sync
expflow status
expflow restore
```

## Native Operations

| Ordinary command  | Protocol operation | Gate B status               |
| ----------------- | ------------------ | --------------------------- |
| `expflow init`    | `project.init`     | Local material core handler |
| `expflow sync`    | `project.sync`     | Local material core handler |
| `expflow status`  | `project.status`   | Local material core handler |
| `expflow restore` | `revision.restore` | Local material core handler |

## Core Messages

Core message and record shapes are supplied as JSON Schemas in `docs/architecture/schemas/` and mirrored under `schemas/`. Gate B emits schema-shaped material records and validates the local material transaction path.

## Deferred Adapter Contracts

The core protocol does not define external inspection, composite project revision tokens, incremental change cursors, adapter request canonicalization, external idempotency, lost-response reconciliation, capability policy, writer partitioning, adapter attempts, or adapter outcomes.
