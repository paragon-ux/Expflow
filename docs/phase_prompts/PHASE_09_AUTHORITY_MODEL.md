# Phase 9 -- Authority Model

## Objective

Implement the Gate C authority model without adding semantic assertions, workflow runtime, projections, hooks, adapters, or new ordinary commands.

## Permitted Scope

- Authority-source revision store.
- Immutable source-registration decision store.
- Split and unified readable authority document records.
- Derived current-source projection from durable decisions.
- Source policy defaults and scope-conflict checks.
- Unit tests and completion evidence for Phase 9 behavior.

## Prohibited Scope

- Semantic assertion and semantic decision runtime beyond source-registration decisions.
- Conflict, review-request, source-correspondence, workflow, projection, regeneration, equivalence, reuse, hook-dispatch, adapter, database, broker, or network behavior.
- New public ordinary commands beyond `init`, `sync`, `status`, and `restore`.

## Required Sources

- `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`
- `docs/architecture/EXPFLOW_IMPLEMENTATION_SPEC_V2_3.md`
- `docs/architecture/EXPFLOW_PROTOCOL_SPEC_V2_3.md`
- `docs/architecture/EXPFLOW_PROJECT_SNAPSHOT_V2_3.md`
- `docs/AUTHORITY_AND_SEMANTIC_MODEL.md`
- `schemas/authority-source.schema.json`
- `schemas/authority-document.schema.json`
- `schemas/source-registration-decision.schema.json`

## Exit Criteria

- A source descriptor alone is never treated as accepted authority.
- An immutable accepted source-registration decision makes the referenced source current.
- Rejection, revocation, and supersession are derived from decisions without mutating source records.
- Split authority documents contain one section; unified documents may contain multiple sections.
- Scope conflicts between accepted sources are detected unless explicitly allowed by policy.
- Local tests, typecheck, formatting, lint, build, package verification, and contract checks pass or any blocker is recorded.
