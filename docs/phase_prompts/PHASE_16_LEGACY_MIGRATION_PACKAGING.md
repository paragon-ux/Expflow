# Phase 16 -- Legacy Migration and Packaging

## Objective

Provide representative legacy-project migration evidence and preserve clean package verification outside the checkout.

## Permitted Scope

- In-place migration evidence for typed-folder projects.
- Inventory, identity map, ambiguity report, unsupported-feature report, limitations, and rollback guidance.
- Material initialization through existing core runtime.
- Package version and package-verification updates.

## Prohibited Scope

- Moving user-managed paths during migration.
- Fabricating authority, semantic acceptance, workflow completion, verification, or reuse decisions.
- Adapter migration, external inspection, change cursors, idempotency, or reconciliation.
- Editing immutable architecture sources.

## Required Sources

- `AGENTS.md`
- `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`
- `docs/architecture/EXPFLOW_IMPLEMENTATION_SPEC_V2_3.md`
- `docs/TEST_MATRIX.md`

## Expected Files

- `src/migration/`
- `tests/unit/security-migration-runtime.test.ts`
- Package metadata and mutable evidence docs.

## Exit Criteria

- A representative legacy typed-folder project migrates in place.
- User paths remain intact.
- Migration records material evidence and limitations.
- No authority or semantic decisions are invented.
- npm and Python package verification remain green.
