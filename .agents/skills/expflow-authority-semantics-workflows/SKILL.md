# Expflow Authority, Semantics, and Workflows

## Purpose

- Defines: the governance responsibility for authority registration, readable authority documents, semantic assertions, immutable decisions, conflicts, review requests, source correspondence, workflow occurrences, virtual artifacts, materialization events, and completion states
- Phase boundary: Gate C (Phases 9–11); this skill may guide work related to authority sources, semantic records, workflow boundaries, and virtual artifacts

## Activation Criteria

- Activate when: authority source registration, readable document profiles, semantic assertion or decision stores, conflict management, review workflows, or workflow occurrence management is needed
- Route elsewhere when: work involves machine contracts (route to expflow-contracts-protocol), material storage (route to expflow-material-storage-sync), projections or reproduction (route to expflow-projections-reproduction), or testing/security (route to expflow-testing-security-migration)

## Required Reading

- Read in order: AGENTS.md, EXPFLOW_WORKFLOW_CURRENT.md, EXPFLOW_CONCEPT_PAPER_V2_3.md, EXPFLOW_IMPLEMENTATION_SPEC_V2_3.md, EXPFLOW_PROTOCOL_SPEC_V2_3.md, EXPFLOW_PROJECT_SNAPSHOT_V2_3.md, Note-On-Architecture.md, V2_3_ARCHITECTURE_DELTA.md
- Supporting references: docs/architecture/schemas/authority-source.schema.json, docs/architecture/schemas/authority-document.schema.json, docs/architecture/schemas/source-registration-decision.schema.json, docs/architecture/schemas/semantic-assertion.schema.json, docs/architecture/schemas/semantic-decision.schema.json, docs/architecture/schemas/conflict.schema.json, docs/architecture/schemas/review-request.schema.json, docs/architecture/schemas/source-correspondence.schema.json, docs/architecture/schemas/artifact-cluster.schema.json, docs/architecture/schemas/workflow-occurrence.schema.json, docs/architecture/schemas/virtual-artifact.schema.json, docs/architecture/schemas/materialization-event.schema.json, docs/AUTHORITY_AND_SEMANTIC_MODEL.md, docs/WORKFLOW_AND_PROJECTION_MODEL.md

## Invariants

- Preserve: extensible authority-source registration governed by immutable decisions; split and unified readable authority document profiles; the distinction between assertions (proposals/claims) and decisions (acceptance/rejection); immutable conflict records with visible original claims; explicit workflow input/output tree selectors; separated material, completion, verification, and reuse states
- Maintain: the rule that a descriptor without an acceptance decision is not an accepted authority source; the rule that no source becomes authoritative without an attributed immutable decision; the rule that path presence does not prove workflow completion; the separation of source correspondence from tree inventory
- Phase 1 limit: Governance and control documentation only.

## Procedure

1. Read the controlling sources in the stated order.
2. Confirm the active phase, gate, inputs, and repository state.
3. Perform only work authorized for that phase and this skill.
4. Run the tests and checks named below.
5. Record artifacts, evidence, blockers, and deferred decisions.

## Tests

- Required checks: npm test (authority/semantic/workflow-scoped contract tests when implemented), repository-contract tests verifying no premature runtime exists
- Passing evidence: authority sources register with decisions; assertions and decisions remain distinct and immutable; conflicts remain visible after resolution; source correspondence maps candidates without altering tree inventory; workflow occurrences pin exact input/output scopes; completion states are multi-stage and non-collapsing

## Stop Conditions

- Stop when: a descriptor could become authoritative without a decision; assertions and decisions cannot be distinguished in storage; conflicts would be hidden after resolution; source correspondence would alter material tree inventory; completion would be inferred from path presence alone; workflow input/output scopes would be conflated with project state
- Record: in the active phase completion report under Blockers and Contradictions

## Completion Evidence

- Artifacts: src/authority/, src/semantics/, src/workflows/ (when implemented); tests covering authority registration, readable documents, assertions, decisions, conflicts, reviews, correspondence, workflow occurrences, virtual artifacts, and materializations
- Validation: npm test (authority/semantic/workflow-scoped), decision immutability tests, conflict visibility tests, workflow boundary tests
- Completion condition: authority requires decisions; assertions remain distinct from decisions; conflicts remain inspectable; workflow boundaries are explicit; completion states are separated

## Phase 1 Status

- Status: Control document only.
- Runtime implementation: None.
- Required declaration: This skill is a Phase 1 control document and contains no Expflow product runtime implementation.
