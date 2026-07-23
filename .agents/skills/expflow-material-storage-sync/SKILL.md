---
name: expflow-material-storage-sync
description: Govern Expflow object, node, tree, project, and head stores; working-tree scanning; identity directives; change detection; candidate trees; dry-run plans; and material integrity. Use when implementing Expflow immutable material stores, scanners, sync operations, identity resolution, transactions, recovery, candidate trees, or material-integrity checks in Gate B phases 5–8.
---

# Expflow Material, Storage, and Sync

## Purpose

- Defines: the governance responsibility for object, node, tree, project, and head stores; working-tree scanning; identity directives; change detection; candidate trees; dry-run plans; and material integrity
- Phase boundary: Gate B (Phases 5–8); this skill may guide work related to immutable material stores, sync operations, identity resolution, and material recovery

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

## Supporting References

- docs/architecture/schemas/node-revision.schema.json, docs/architecture/schemas/tree-entry.schema.json, docs/architecture/schemas/tree-revision.schema.json, docs/architecture/schemas/operation-plan.schema.json, docs/architecture/schemas/operation-receipt.schema.json, docs/architecture/schemas/path-selector.schema.json, docs/architecture/schemas/project.schema.json, docs/releases/v1.0.1/files/docs/DATA_MODEL.md, docs/releases/v1.0.1/files/docs/IDENTITY_AND_REVISION_MODEL.md, docs/releases/v1.0.1/files/docs/MATERIAL_RECORD_FORMAT.md, docs/releases/v1.0.1/files/docs/STORAGE_AND_RECOVERY.md

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
