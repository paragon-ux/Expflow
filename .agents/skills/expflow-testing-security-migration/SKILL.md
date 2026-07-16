# Expflow Testing, Security, and Migration

## Purpose

- Defines: the governance responsibility for contract parity, crash tests, archive quarantine, prompt-injection isolation, secret handling, licensing, sandbox profiles, legacy migration, packaging, and end-to-end evidence
- Phase boundary: Gates B, C, and D (Phases 5–17); this skill may guide work related to testing strategy, security controls, migration tooling, and packaging

## Activation Criteria

- Activate when: test strategy definition, security profile implementation, archive handling, secret detection, prompt-injection isolation, legacy project migration, package verification, or end-to-end scenario automation is needed
- Route elsewhere when: work involves schema or contract definition (route to expflow-contracts-protocol), material storage (route to expflow-material-storage-sync), authority or workflow records (route to expflow-authority-semantics-workflows), or projection/reproduction (route to expflow-projections-reproduction)

## Required Reading

- Read in order: AGENTS.md, EXPFLOW_WORKFLOW_CURRENT.md, EXPFLOW_CONCEPT_PAPER_V2_3.md, EXPFLOW_IMPLEMENTATION_SPEC_V2_3.md, EXPFLOW_PROTOCOL_SPEC_V2_3.md, EXPFLOW_PROJECT_SNAPSHOT_V2_3.md, Note-On-Architecture.md, V2_3_ARCHITECTURE_DELTA.md
- Supporting references: docs/architecture/schemas/hook-envelope.schema.json, docs/architecture/schemas/validation-result.schema.json, docs/architecture/schemas/status-report.schema.json, docs/SECURITY_MODEL.md, docs/ERROR_REGISTRY.md, docs/TEST_MATRIX.md, docs/CODEX_BUILD_PLAN.md

## Invariants

- Preserve: the rule that all untrusted content remains data; archive quarantine and bounded extraction; path traversal and unsafe-link rejection; source instruction/data separation; local-only hook processing profiles; secret detection and redaction before remote model use; source licensing and reuse restriction enforcement
- Maintain: the prohibition on executing imported or generated code; the prohibition on semantic hooks performing network access without explicit policy; the requirement that migration never fabricate identity or authority; the requirement that all end-to-end scenarios have automated tests
- Phase 1 limit: Governance and control documentation only.

## Procedure

1. Read the controlling sources in the stated order.
2. Confirm the active phase, gate, inputs, and repository state.
3. Perform only work authorized for that phase and this skill.
4. Run the tests and checks named below.
5. Record artifacts, evidence, blockers, and deferred decisions.

## Tests

- Required checks: npm test (security/migration-scoped contract tests when implemented), repository-contract tests verifying no premature runtime exists, package verification outside checkout
- Passing evidence: archive quarantine rejects unsafe paths; prompt-injection isolation prevents instruction capture; secret detection redacts before remote processing; local-only hooks have no network access; migration preserves user paths and reports ambiguity; clean packages install and run outside checkout; all 25 end-to-end scenarios pass with automated evidence

## Stop Conditions

- Stop when: archive extraction could access paths outside the quarantine; source content could override hook instructions; a secret could reach a remote model unredacted; migration would fabricate identity or authority; a clean package install fails; a required end-to-end scenario cannot be automated; hosted CI is unavailable for gate-completion claim
- Record: in the active phase completion report under Blockers and Contradictions

## Completion Evidence

- Artifacts: tests/fixtures/contracts/ (valid, invalid, compatibility, recovery, tree-digests, examples), src/hooks/security.ts (when implemented); migration tool; packaged npm and Python artifacts
- Validation: npm test (security/migration-scoped), package:verify, python -m build --wheel, external wheel import check, all end-to-end scenario tests
- Completion condition: security controls prevent all specified threat classes; a representative legacy project migrates without identity or authority fabrication; clean packages install and verify; all end-to-end scenarios have automated evidence

## Phase 1 Status

- Status: Control document only.
- Runtime implementation: None.
- Required declaration: This skill is a Phase 1 control document and contains no Expflow product runtime implementation.
