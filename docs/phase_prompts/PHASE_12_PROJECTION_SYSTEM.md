# Phase 12 -- Projection System

## Objective

Implement projection manifest records and derived heads without running projectors or making projections authoritative.

## Permitted Scope

- Manifest revisions.
- Projection-root validation.
- Deterministic versus model-assisted projector metadata.
- Manifest-head derivation from accepted manifests.
- Staleness and supersession metadata.

## Prohibited Scope

- Executing projectors or model calls.
- Projection-triggered sync.
- Treating projection output as material authority.
- Hook dispatch, adapters, databases, brokers, or network services.

## Required Sources

- `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`
- `docs/WORKFLOW_AND_PROJECTION_MODEL.md`
- `schemas/manifest-revision.schema.json`

## Expected Files

- `src/projections/`
- `tests/unit/gate-c-runtime.test.ts`
- `docs/completion_reports/PHASE_12_COMPLETION_REPORT.md`

## Locked Invariants

- Projection locators remain under `.expflow/projections/`.
- Model-assisted manifests default to proposed.
- Accepted model-assisted manifests require attribution and prompt evidence.
- Projections do not trigger sync.

## Exit Criteria

- Manifest revisions persist and validate.
- Accepted manifest heads are derived from records.
- Tests show projection-root exclusion and model-assisted proposal defaults.
