# Phase 17 -- End-to-End Proof

## Objective

Automate the full core proof path across material, authority, semantic, workflow, projection, reproduction, security, migration, and adapter-boundary scenarios.

## Permitted Scope

- End-to-end tests that use public/library core surfaces and repository contract helpers.
- Proof that adapter-only behavior remains absent from core.
- Completion reports and final core checklist updates.

## Prohibited Scope

- Adding adapter protocols, generic database APIs, new ordinary commands, network services, or hook dispatch.
- Treating projections as authority.
- Treating material output as completion.
- Silently transferring authority or verification during reuse.

## Required Sources

- `AGENTS.md`
- `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`
- `docs/architecture/EXPFLOW_IMPLEMENTATION_SPEC_V2_3.md`
- `docs/TEST_MATRIX.md`

## Expected Files

- `tests/e2e/gate-d-proof.test.ts`
- `docs/phase_prompts/FINAL_EXPFLOW_CORE_CHECKLIST.md`
- Gate D completion reports.

## Exit Criteria

- The automated proof covers the workflow-required scenarios.
- Old revisions remain inspectable.
- Partial post-commit material success is preserved.
- Unsafe archives are rejected.
- Legacy migration evidence exists.
- Adapter-only idempotency/reconciliation remains absent from core.
