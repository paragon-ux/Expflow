# Phase 10 -- Semantic Ownership

## Objective

Implement semantic ownership records without adding workflow execution, projections, hooks, adapters, databases, brokers, network services, or new ordinary commands.

## Permitted Scope

- Semantic assertions.
- Semantic decisions.
- Conflicts and review requests.
- Source correspondence records.
- Artifact clusters as derived projection records.
- Decision supersession by reference.
- Family-specific listing/change evidence.

## Prohibited Scope

- Workflow occurrence transitions beyond semantic references.
- Projection generation or materialization.
- Adapter inspection, change cursors, reconciliation, or idempotency.
- Hook dispatch or source-content execution.

## Required Sources

- `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`
- `docs/architecture/EXPFLOW_IMPLEMENTATION_SPEC_V2_3.md`
- `docs/AUTHORITY_AND_SEMANTIC_MODEL.md`
- `schemas/semantic-assertion.schema.json`
- `schemas/semantic-decision.schema.json`
- `schemas/conflict.schema.json`
- `schemas/review-request.schema.json`
- `schemas/source-correspondence.schema.json`
- `schemas/artifact-cluster.schema.json`

## Expected Files

- `src/semantics/`
- `tests/unit/gate-c-runtime.test.ts`
- `docs/completion_reports/PHASE_10_COMPLETION_REPORT.md`

## Locked Invariants

- Assertions remain proposals until decisions are recorded.
- Decisions supersede prior decisions without mutating them.
- Conflicts remain visible after resolution.
- Semantic records do not imply workflow completion or material acceptance.

## Exit Criteria

- Semantic record families persist immutable records.
- Invalid required fields are rejected before durable writes.
- Listing/change evidence covers every semantic record family.
- Tests show assertion/decision separation and conflict retention.
