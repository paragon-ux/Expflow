# Codex Build Plan

**Status:** Gate D complete locally on `codex/gate-d-hardening`
**Workflow SSOT:** `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`

## Current Path

1. Gate A -- Contract Ready: complete and merged to `origin/main`.
2. Gate B -- Material Core Ready: complete and merged to `main` through PR #4.
3. Phase 9 -- Authority Model: authority-source records, registration decisions, current-source projection, readable documents, and authority policy behavior.
4. Phase 10 -- Semantic Ownership: assertions, decisions, conflicts, review requests, source correspondence, artifact clusters, and semantic change listing.
5. Phase 11 -- Workflow Boundaries: workflow occurrences, virtual artifacts, materialization events, and immutable workflow transitions.
6. Phase 12 -- Projection System: manifest revisions, scanner-excluded projection locators, model-assisted proposal defaults, and accepted manifest-head derivation.
7. Phase 13 -- Regeneration and Equivalence Evaluation: regeneration attempts, unknown-outcome preservation, and equivalence evaluations.
8. Phase 14 -- Structural Reuse: reuse results, policy gates, output workflow references, and no-transfer behavior.
9. Gate C Exit: complete and merged to `main` through PR #5.
10. Gate D -- Security, migration, packaging hardening, and end-to-end proof.
11. Next step after validation: PR review and hosted checks for Gate D.

## Execution Rules

- Do not modify immutable `docs/architecture/**` sources.
- Gate C record families are library runtimes, not new ordinary commands.
- Do not add adapter inspection, change cursors, idempotency, lost-response reconciliation, hook dispatch, network services, databases, or brokers.
- Keep `docs/CURRENT_STATUS_MATRIX.md` mutable and outside validation.
- Update completion evidence with actual command results only.
