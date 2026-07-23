# Expflow 1.2.0 Command Contract

**ADR ID:** ADR-001
**Status:** Accepted
**Phase:** 3 — Command Contract
**Version:** 1.0
**Date:** 2026-07-23

## 1. Shared Application Command Architecture

```
Domain and Storage Runtimes
        │
        ▼
Application Command Service (src/application/)
   ┌────┼────┬──────────┐
   ▼    ▼    ▼          ▼
  CLI  GUI  HTTP       Library
```

Every durable operation flows through the application command service. Interface adapters translate user intent into command requests and present results. The service layer owns:

- **Input validation** — schema-constrained at the boundary
- **Planning** — deterministic plan generation with a plan token
- **State binding** — resolving plan tokens to current repository state
- **Execution** — atomic or recoverable mutation
- **Actor attribution** — who performed the operation and through which interface
- **Receipt generation** — immutable operation receipts
- **Result envelopes** — typed outcomes with error codes
- **Blockers and recovery state** — explicit when an operation cannot proceed

No interface adapter may bypass the service to call domain or storage runtimes directly for any durable operation.

## 2. Command-Family Taxonomy

| Family     | Commands                                                                 | Mutates? |
|------------|--------------------------------------------------------------------------|----------|
| Project    | `init`, `inspect`                                                        | Yes      |
| Material   | `sync`, `status`, `history`, `restore`, `receipts`, `recover`            | Yes/No   |
| Workflow   | `workflow list`, `workflow inspect`, `workflow state`, `workflow history`| No       |
| Evidence   | `evidence intake`, `evidence inspect`                                    | Yes      |
| Authority  | `source propose`, `source decide`, `artifact propose`, `artifact decide` | Yes      |
| Conflicts  | `conflicts`                                                              | No       |
| Decisions  | `complete`, `verify`, `equivalent`, `reuse`                              | Yes      |
| Package    | `package export`, `package validate`, `package plan-import`, `package import` | Yes |
| Reporting  | `capabilities`, `help`                                                   | No       |

The four existing commands (`init`, `sync`, `status`, `restore`) remain the primary material surface. New families are additive.

## 3. CLI/GUI Parity Rule

> Every durable GUI action must have an equivalent CLI operation. Every GUI state required for a decision must be available through CLI output.

- A GUI mutation that has no CLI equivalent is incomplete.
- A CLI operation must produce deterministic machine-readable output (`--json`) for automation.
- The GUI must not become the only way to operate Expflow.
- Read-only inspection available in the GUI must be available through CLI read models.

## 4. Application Result Envelope

```json
{
  "ok": true,
  "operation": "sync",
  "outcome": "committed",
  "receipt_id": "efo_...",
  "result": {},
  "warnings": [],
  "blockers": []
}
```

On failure:
```json
{
  "ok": false,
  "operation": "sync",
  "outcome": "blocked",
  "error": {
    "code": "STALE_PLAN",
    "message": "Working tree changed after plan generation",
    "remediation": "Re-run sync --dry-run to regenerate the plan"
  },
  "blockers": []
}
```

All fields:
- `ok` — boolean, true if operation completed without error
- `operation` — command family and name
- `outcome` — committed, blocked, cancelled, partial, unknown
- `receipt_id` — present when a durable receipt was created
- `result` — operation-specific payload (typed, nullable)
- `error` — present on failure: code, message, remediation
- `warnings` — non-blocking advisory messages
- `blockers` — reasons the operation cannot proceed
- `plan_token` — present during plan phase
- `actor` — who performed the operation
- `timestamp` — ISO 8601

## 5. Machine-Readable JSON Rules

| Flag               | Behavior                                                |
|--------------------|---------------------------------------------------------|
| `--json`           | Output a single JSON result envelope to stdout          |
| `--non-interactive`| Never prompt; fail with exit 1 if input is required     |
| `--yes`            | Auto-confirm prompts; equivalent to answering "yes"     |

- `--json` output is always to stdout. Human-readable output goes to stderr when `--json` is active.
- No ANSI escape codes in `--json` or `--non-interactive` mode.
- JSON output schema is versioned and additive.

## 6. Exit-Code Policy

| Code | Meaning            | Example                                        |
|------|--------------------|------------------------------------------------|
| 0    | Success            | Operation completed, status queried            |
| 1    | Operational failure| Sync blocked by stale plan, restore refused    |
| 2    | Usage failure      | Unknown command, invalid flag combination      |

Existing behavior preserved:
- Uninitialized `status` exits 0 (query, not mutation)
- Unknown commands exit 2
- Operational mutation failures exit 1

## 7. Plan/Apply/Receipt Behavior

1. **Plan phase** — `--dry-run` or implicit plan:
   - Generates a deterministic plan
   - Returns a `plan_token` (opaque, single-use)
   - Includes expected head, affected paths, and drift classification
   - Does not mutate state

2. **Apply phase** — execute with plan token:
   - Validates plan token matches current state
   - Checks expected head equals actual head (rejects stale plans)
   - Executes the mutation atomically
   - Returns an operation receipt

3. **Receipt** — immutable after commit:
   - Operation ID, timestamp, actor, interface
   - Plan token and resolved state references
   - Outcome and result envelope
   - Causal predecessor reference

## 8. Expected-Head and Stale-Plan Behavior

- `--expected-head <tree-revision-id>` — caller asserts the current head before planning
- If the actual head differs from expected-head, the plan is refused with `STALE_HEAD`
- A plan token is bound to the tree revision at plan time
- If the head changes between plan and apply, the apply is refused with `STALE_PLAN`
- The caller must re-plan when a stale plan is detected

## 9. Actor Metadata Model

```json
{
  "actor": {
    "identifier": "human:alice",
    "class": "human",
    "interface": "cli",
    "tool": null,
    "rationale": "Reviewing artifact correspondence",
    "evidence_refs": ["efv_..."],
    "timestamp": "2026-07-23T14:00:00Z"
  }
}
```

Actor classes: `human`, `agent`, `ci`, `service`, `tool`, `unknown`.

Actor class does not grant authority. Authority is explicit and scoped through registration decisions.

Every durable record preserves: identifier, class, interface, tool, rationale, evidence references, timestamp.

## 10. Capability Discovery

`expflow capabilities --json` returns:

```json
{
  "version": "1.2.0",
  "command_families": ["project", "material", "workflow", "evidence", "authority", "conflicts", "decisions", "package", "reporting"],
  "features": {
    "json_output": true,
    "non_interactive": true,
    "plan_apply": true,
    "actor_attribution": true,
    "capability_discovery": true
  },
  "supported_os": ["windows", "macos", "linux"],
  "node_versions": ["20", "22"]
}
```

Automation consumers use this to discover available operations without hard-coding version assumptions.

## 11. Path and OS Behavior Rules

- All product file I/O uses Node.js `fs` and `path` APIs (no shell-specific commands)
- Repository-relative paths in persisted records
- Explicit UTF-8 encoding for all text I/O
- `path.sep` normalization for cross-platform path handling
- No Bash-only behavior in product code (CI scripts may use shell syntax)
- Line-ending handling: CRLF on Windows, LF elsewhere; product code treats both as valid
- Machine-absolute paths are runtime context, never persisted in portable state

## 12. Compatibility Policy

**Preserved behavior:**
- `expflow init` — identical behavior
- `expflow sync` — identical behavior, plus `--dry-run`, `--expected-head`, `--json`
- `expflow status` — identical behavior, plus `--history`, `--node-history`, `--json`
- `expflow restore` — identical behavior, plus `--dry-run`, `--force`, `--json`

**Additive only:**
- New command families do not alter existing command behavior
- JSON output fields are additive; existing fields retain their names and types
- Exit codes 0, 1, 2 retain their existing meanings
- Machine-readable output is backward-compatible with v1.0.x and v1.1.x

## 13. Parity Test Strategy

For every in-scope durable operation:

1. Execute through the application service (unit test)
2. Execute through CLI (`--json` output) and capture result envelope
3. Execute through GUI bridge and capture result envelope
4. Assert: CLI result envelope == GUI result envelope (semantically equivalent)
5. Assert: both envelopes match the expected application service output

Test matrix:
- Every command family × every supported interface (CLI, GUI)
- Every command family with `--json` and `--non-interactive`
- Error paths: stale plan, missing expected head, invalid input, uninitialized project

## 14. Mixed-Interface Test Strategy

A single end-to-end scenario exercising multiple interfaces:

```
CLI: evidence intake (add partial source A)
GUI: evidence intake (add partial source B)
CLI: inspect evidence (confirm both sources present)
GUI: source propose (register source A)
CLI: source decide (accept source A)
GUI: correspondence decision (link sources A and B)
CLI: completion decision (mark artifact complete)
GUI: package export (export workflow state)
CLI: package import (import into clean project)
GUI: resume inspection (verify imported state)
```

The resulting durable state must be semantically equivalent regardless of which interface performed each step. No interface-specific side effects may leak into persisted records.
