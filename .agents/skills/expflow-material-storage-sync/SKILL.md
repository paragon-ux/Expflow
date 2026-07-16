# Expflow Material, Storage, and Sync

## Purpose

- Defines: the governance responsibility for object, node, tree, project, and head stores; working-tree scanning; identity directives; change detection; candidate trees; dry-run plans; and material integrity
- Phase boundary: Gate B (Phases 5–8); this skill may guide work related to immutable material stores, sync operations, identity resolution, and material recovery

## Activation Criteria

- Activate when: implementation of object stores, node stores, tree stores, head stores, scanner exclusions, identity directives, candidate trees, or material integrity checks is needed
- Route elsewhere when: work involves schema or contract definition (route to expflow-contracts-protocol), authority or semantic records (route to expflow-authority-semantics-workflows), projection or reproduction (route to expflow-projections-reproduction), or testing/security concerns (route to expflow-testing-security-migration)

## Required Reading

- Read in order: AGENTS.md, EXPFLOW_WORKFLOW_CURRENT.md, EXPFLOW_CONCEPT_PAPER_V2_3.md, EXPFLOW_IMPLEMENTATION_SPEC_V2_3.md, EXPFLOW_PROTOCOL_SPEC_V2_3.md, EXPFLOW_PROJECT_SNAPSHOT_V2_3.md, Note-On-Architecture.md
- Supporting references: docs/architecture/schemas/node-revision.schema.json, docs/architecture/schemas/tree-entry.schema.json, docs/architecture/schemas/tree-revision.schema.json, docs/architecture/schemas/operation-plan.schema.json, docs/architecture/schemas/operation-receipt.schema.json, docs/architecture/schemas/path-selector.schema.json, docs/architecture/schemas/project.schema.json, docs/DATA_MODEL.md, docs/IDENTITY_AND_REVISION_MODEL.md, docs/MATERIAL_RECORD_FORMAT.md, docs/STORAGE_AND_RECOVERY.md

## Invariants

- Preserve: write-isolated object storage with mandatory SHA-256 digests; opaque node identities; immutable node and tree revisions; scanner exclusions for .expflow/ and projections/; the four-command ordinary surface
- Maintain: the prohibition on hard links for immutable history; the rule that digest similarity never silently preserves identity; the separation of material facts from semantic proposals; the prohibition on observational sync mutating user paths
- Phase 1 limit: Governance and control documentation only.

## Procedure

1. Read the controlling sources in the stated order.
2. Confirm the active phase, gate, inputs, and repository state.
3. Perform only work authorized for that phase and this skill.
4. Run the tests and checks named below.
5. Record artifacts, evidence, blockers, and deferred decisions.

## Tests

- Required checks: npm test (material-scope contract tests when implemented), repository-contract tests verifying no premature material runtime exists
- Passing evidence: all store tests pass; identity directives produce correct node revisions; tree-content digests match canonical preimages; recovery repairs every specified interruption class without mutation

## Stop Conditions

- Stop when: a required material schema is ambiguous; hard links would be needed for immutable history; digest similarity would silently preserve identity; observational sync would mutate user paths; recovery would need to invent semantic acceptance; a tree-content digest preimage cannot be deterministically reproduced
- Record: in the active phase completion report under Blockers and Contradictions

## Completion Evidence

- Artifacts: src/material/, src/scan/, src/transactions/ (when implemented); tests covering object integrity, node revisions, tree revisions, identity directives, candidate trees, transactions, and recovery
- Validation: npm test (material-scoped), property-based identity and transaction tests, crash-recovery tests for every specified interruption class
- Completion condition: object stores verify integrity; identity rules produce deterministic results; transactions recover correctly; operation receipts distinguish material and automation outcomes

## Phase 1 Status

- Status: Control document only.
- Runtime implementation: None.
- Required declaration: This skill is a Phase 1 control document and contains no Expflow product runtime implementation.
