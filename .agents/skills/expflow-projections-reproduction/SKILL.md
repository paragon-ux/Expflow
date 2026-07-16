# Expflow Projections and Reproduction

## Purpose

- Defines: the governance responsibility for deterministic and model-assisted projections, manifest acceptance, materialization, regeneration attempts, equivalence evaluations, and structural reuse
- Phase boundary: Gate C (Phases 12–14); this skill may guide work related to manifest projections, regeneration, equivalence classification, and reuse evaluation

## Activation Criteria

- Activate when: deterministic or model-assisted projector implementation, manifest management, projection materialization, regeneration attempt tracking, equivalence evaluation, or structural reuse is needed
- Route elsewhere when: work involves machine contracts (route to expflow-contracts-protocol), material storage (route to expflow-material-storage-sync), authority or workflow records (route to expflow-authority-semantics-workflows), or testing/security (route to expflow-testing-security-migration)

## Required Reading

- Read in order: AGENTS.md, EXPFLOW_WORKFLOW_CURRENT.md, EXPFLOW_CONCEPT_PAPER_V2_3.md, EXPFLOW_IMPLEMENTATION_SPEC_V2_3.md, EXPFLOW_PROTOCOL_SPEC_V2_3.md, EXPFLOW_PROJECT_SNAPSHOT_V2_3.md, Note-On-Architecture.md, V2_3_ARCHITECTURE_DELTA.md
- Supporting references: docs/architecture/schemas/manifest-revision.schema.json, docs/architecture/schemas/regeneration-attempt.schema.json, docs/architecture/schemas/equivalence-evaluation.schema.json, docs/architecture/schemas/reuse-result.schema.json, docs/architecture/schemas/status-report.schema.json, docs/WORKFLOW_AND_PROJECTION_MODEL.md

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
