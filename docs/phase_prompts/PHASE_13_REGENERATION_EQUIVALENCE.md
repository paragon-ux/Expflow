# Phase 13 -- Regeneration and Equivalence Evaluation

## Objective

Implement regeneration-attempt and equivalence-evaluation records without executing tools, models, or generated content.

## Permitted Scope

- Regeneration attempt records.
- Unknown-outcome preservation.
- Equivalence evaluation records.
- Model/tool profile and prompt digest metadata.
- Safe retry identity through new attempt records.

## Prohibited Scope

- Tool execution.
- Model calls.
- Lost-response reconciliation.
- Adapter inspection.
- Generated-code execution.

## Required Sources

- `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`
- `docs/WORKFLOW_AND_PROJECTION_MODEL.md`
- `schemas/regeneration-attempt.schema.json`
- `schemas/equivalence-evaluation.schema.json`

## Expected Files

- `src/reproduction/`
- `tests/unit/gate-c-runtime.test.ts`
- `docs/completion_reports/PHASE_13_COMPLETION_REPORT.md`

## Locked Invariants

- Unknown regeneration outcomes remain explicit records.
- Retry attempts receive distinct identities.
- Equivalence is attributed evaluation, not inferred fact.

## Exit Criteria

- Regeneration attempts and equivalence evaluations persist immutably.
- Tests show unknown attempts remain after retry and equivalence is separately recorded.
