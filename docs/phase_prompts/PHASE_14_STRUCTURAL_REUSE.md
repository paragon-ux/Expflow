# Phase 14 -- Structural Reuse

## Objective

Implement structural reuse result records and gates without transferring authority, completion, or verification from the source workflow.

## Permitted Scope

- Reuse result records.
- Reference workflow and manifest validation.
- New workflow occurrence references.
- License and authority-policy gate checks.
- Reuse acceptance decision references.

## Prohibited Scope

- Executing reused workflows.
- Automatically accepting reused output.
- Transferring source authority, completion, or verification state.
- Adapter inspection, external cursors, hooks, databases, brokers, or network services.

## Required Sources

- `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`
- `docs/WORKFLOW_AND_PROJECTION_MODEL.md`
- `schemas/reuse-result.schema.json`

## Expected Files

- `src/reproduction/`
- `tests/unit/gate-c-runtime.test.ts`
- `docs/completion_reports/PHASE_14_COMPLETION_REPORT.md`

## Locked Invariants

- Reuse does not silently transfer authority.
- Reuse does not silently transfer completion or verification.
- Completed reuse requires explicit policy gates and output occurrence reference.

## Exit Criteria

- Reuse results persist immutably.
- Policy gates reject premature completed reuse.
- Tests show reuse completion does not change workflow reuse status.
