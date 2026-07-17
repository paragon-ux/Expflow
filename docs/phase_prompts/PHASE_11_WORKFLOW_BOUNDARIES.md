# Phase 11 -- Workflow Boundaries

## Objective

Implement explicit workflow-boundary records without inferring completion from material output.

## Permitted Scope

- Workflow occurrences with input/output tree selectors.
- Virtual artifacts.
- Materialization events.
- Immutable workflow state transitions.
- Completion, verification, and reuse status fields.

## Prohibited Scope

- Workflow execution engines.
- Projection generation.
- Hook dispatch.
- Adapter inspection or external cursors.
- New ordinary commands.

## Required Sources

- `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`
- `docs/WORKFLOW_AND_PROJECTION_MODEL.md`
- `schemas/workflow-occurrence.schema.json`
- `schemas/virtual-artifact.schema.json`
- `schemas/materialization-event.schema.json`

## Expected Files

- `src/workflows/`
- `tests/unit/gate-c-runtime.test.ts`
- `docs/completion_reports/PHASE_11_COMPLETION_REPORT.md`

## Locked Invariants

- Material output does not imply accepted completion.
- Completion, verification, and reuse remain separate workflow states.
- Transitions create new immutable records instead of mutating old ones.

## Exit Criteria

- Workflow input and output tree selectors are persisted.
- Virtual artifacts and materialization events are persisted.
- Tests show output attachment leaves completion status unaccepted.
