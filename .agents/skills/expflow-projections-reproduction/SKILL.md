---
name: expflow-projections-reproduction
description: Govern Expflow deterministic and model-assisted projections, manifest acceptance, materialization, regeneration attempts, equivalence evaluations, and structural reuse. Use when implementing or evaluating Expflow projectors, manifests, projection materialization, regeneration tracking, equivalence classification, or structural reuse during Gate C phases 12–14.
---

# Expflow Projections and Reproduction

## Purpose

- Defines: the governance responsibility for deterministic and model-assisted projections, manifest acceptance, materialization, regeneration attempts, equivalence evaluations, and structural reuse
- Phase boundary: Gate C (Phases 12–14); this skill may guide work related to manifest projections, regeneration, equivalence classification, and reuse evaluation

## Required Reading Roles

1. `repository_governance`
2. `active_workflow`
3. `active_status`
4. `glossary`
5. `historical_workflow`
6. `concept_paper`
7. `implementation_spec`
8. `protocol_spec`
9. `project_snapshot`
10. `architecture_note`
11. `architecture_delta`

## Supporting References

- docs/architecture/schemas/manifest-revision.schema.json, docs/architecture/schemas/regeneration-attempt.schema.json, docs/architecture/schemas/equivalence-evaluation.schema.json, docs/architecture/schemas/reuse-result.schema.json, docs/architecture/schemas/status-report.schema.json, docs/releases/v1.0.1/files/docs/WORKFLOW_AND_PROJECTION_MODEL.md

## Invariants

- Preserve: scanner-excluded projection storage under .expflow/projections/; the distinction between deterministic projectors (auto-acceptable under policy) and model-assisted projectors (proposed by default); immutable regeneration attempts with unknown-outcome preservation; attributed equivalence evaluations; structural reuse records with semantic-leakage evaluation
- Maintain: the rule that projections never trigger sync (no self-observation); the rule that model-assisted output is never mislabeled as deterministic; the rule that materialization requires an explicit sync change; the rule that reuse never silently transfers authority, completion, or verification
- Phase 1 limit: Governance and control documentation only.

## Procedure

1. Read the controlling sources in the stated order.
2. Confirm the active phase, gate, inputs, and repository state.
3. Perform only work authorized for that phase and this skill.
4. Run the tests and checks named below.
5. Record artifacts, evidence, blockers, and deferred decisions.

## Tests

- Required checks: npm test (projection/reproduction-scoped contract tests when implemented), repository-contract tests verifying no premature runtime exists
- Passing evidence: deterministic projectors produce identical content digests for same inputs; model-assisted projectors record model profile and prompt digest; projections never trigger sync; regeneration attempts preserve unknown outcomes; equivalence evaluations are attributed; reuse results include leakage evaluation

## Stop Conditions

- Stop when: a projection would trigger sync or self-observe; model-assisted output would be labeled deterministic; regeneration unknown outcomes would be silently dropped; equivalence classification would lack attribution; reuse would silently inherit acceptance from the source occurrence; projection materialization would bypass explicit sync
- Record: in the active phase completion report under Blockers and Contradictions

## Completion Evidence

- Artifacts: src/projections/, src/workflows/ (regeneration, evaluation, reuse modules when implemented); tests covering deterministic projection, model-assisted projection, manifest heads, projection materialization, regeneration, equivalence evaluation, and structural reuse
- Validation: npm test (projection/reproduction-scoped), projection self-observation tests, regeneration outcome preservation tests, reuse leakage evaluation tests
- Completion condition: projections are managed and attributable; regeneration outcomes are explicit; equivalence is an attributed evaluation; reuse is evaluated and accepted separately

## Phase 1 Status

- Status: Control document only.
- Runtime implementation: None.
- Required declaration: This skill is a Phase 1 control document and contains no Expflow product runtime implementation.
