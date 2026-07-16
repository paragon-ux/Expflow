# Codex Build Plan

**Status:** Gate A continuation baseline
**Workflow SSOT:** `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`

## Current Path

1. Phase 1 -- Kickoff and Repository Contract: complete and merged in PR #1.
2. Phase 2 -- Architecture Decisions and Vocabulary: freeze mutable decision docs and registries from immutable architecture sources.
3. Phase 3 -- Core Machine Contracts and Registries: verify supplied core schemas, examples, registries, compatibility policy, and extension-boundary descriptors.
4. Phase 4 -- Conformance Fixtures and Generated Types: add valid/invalid/compatibility/recovery/tree-digest fixture corpus, generated descriptors, and TypeScript/Python validation parity.
5. Gate A Exit: confirm hosted CI and local validation pass with adapter-only contracts absent.

## Execution Rules

- Do not modify immutable `docs/architecture/**` sources.
- Do not implement material storage, scanning, identity resolution, transactions, command handlers, authority runtime, semantic stores, projections, hooks, adapters, or migration runtime in Gate A.
- Keep `docs/CURRENT_STATUS_MATRIX.md` mutable and outside validation.
- Update completion evidence with actual command results only.
