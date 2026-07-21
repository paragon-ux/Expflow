---
name: expflow-contracts-protocol
description: Govern Expflow schemas, registries, canonicalization, project revisions, cursors, operation stages, envelopes, error codes, generated types, and compatibility contracts. Use when proposing Expflow schema changes, creating machine contracts, regenerating types, evaluating contract compatibility, or working with contract fixtures during Gates A and B, phases 1–8.
---

# Expflow Contracts and Protocol

## Purpose

- Defines: the governance responsibility for schemas, registries, canonicalization, project revisions, cursors, operation stages, envelopes, error codes, generated types, and compatibility contracts
- Phase boundary: Gates A and B (Phases 1–8); this skill may guide work related to machine contracts, fixtures, and generated types

## Required Reading Roles

1. `repository_governance`
2. `active_workflow`
3. `active_status`
4. `glossary`
5. `historical_workflow`
6. `implementation_spec`
7. `protocol_spec`
8. `project_snapshot`
9. `architecture_note`
10. `architecture_delta`

## Supporting References

- docs/architecture/schemas/schema-index.json, docs/architecture/SOURCE_MANIFEST.json, docs/architecture/EXAMPLE_INDEX.md, docs/releases/v1.0.1/files/docs/ARCHITECTURE_DECISIONS.md

## Invariants

- Preserve: the 26 normative core schemas as the single source of machine-contract truth; JSON Schema Draft 2020-12 as the schema dialect; TypeScript and Python contract parity
- Maintain: the boundary between core schemas and adapter-owned schemas; the separation of normative schemas from generated control files; the rule that no adapter-only schema enters the core repository
- Phase 1 limit: Governance and control documentation only.

## Procedure

1. Read the controlling sources in the stated order.
2. Confirm the active phase, gate, inputs, and repository state.
3. Perform only work authorized for that phase and this skill.
4. Run the tests and checks named below.
5. Record artifacts, evidence, blockers, and deferred decisions.

## Tests

- Required checks: npm run schemas:meta-validate, npm run examples:index-check, npm run contracts:verify
- Passing evidence: all 26 schemas meta-validate against Draft 2020-12; all 18 examples parse as valid JSON; source manifest integrity verified; working mirrors match immutable copies byte-for-byte

## Stop Conditions

- Stop when: a normative schema is missing or unreadable; schema meta-validation fails and cannot be corrected; a contract ambiguity prevents type generation; a proposed schema change would break compatibility without a version advance
- Record: in the active phase completion report under Blockers and Contradictions

## Completion Evidence

- Artifacts: docs/architecture/schemas/ (26 schemas), docs/architecture/examples/ (18 examples), docs/architecture/SOURCE_MANIFEST.json, docs/architecture/SCHEMA_INDEX.md, docs/architecture/EXAMPLE_INDEX.md, schemas/ (working mirror), examples/ (working mirror)
- Validation: npm run schemas:meta-validate exit 0, npm run examples:index-check exit 0, npm run contracts:verify exit 0
- Completion condition: all schemas meta-validate, all examples parse, source integrity verified, working mirrors match, no adapter schemas in core

## Phase 1 Status

- Status: Control document only.
- Runtime implementation: None.
- Required declaration: This skill is a Phase 1 control document and contains no Expflow product runtime implementation.
