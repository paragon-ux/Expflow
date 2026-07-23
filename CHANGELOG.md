# Changelog

## v1.1.0 - 2026-07-21

### Added

- Phase 1: ordinary CLI UX corrections — actionable human `status`, path-level `sync --dry-run`, discoverable tree and node revision references, restore preview with affected-path disclosure, conflicting-drift refusal by default with explicit `--force` override, provisional identity labeling, remediation-first errors, backward-compatible machine output.
- Phase 2: local Expflow GUI foundation under `apps/gui/` — project selection, initialization state, material state and drift view, tree and node revision history, sync/restore plan review and execution, operation receipt and recovery inspection, accessible loading/empty/error/recovery states.
- Phase 3: stable read models for advanced record families — documented, versioned, deterministic read models with stable ordering, filtering, pagination, and distinct state representation.
- Phase 4: evidence intake and authority reconciliation — intake envelope, provenance and capture method, normalized records, authority registration, correspondence proposals, artifact clustering, conflict/duplicate/unresolved states.
- Phase 5: portable workflow package export/import — versioned manifest, relocatable addressing, collision policy, safe archive handling, deterministic integrity checks, round-trip tests.
- Phase 6: evidence-backed gap closure — systematic inventory and triage of all open Phase 1–5 findings; no unresolved defects or pilot blockers remained.
- Phase 7: pilot and empirical evaluation — one repository-owned documentation workflow completed with the ordinary CLI (17 commands); portability defect discovered and fixed (machine-absolute `root_path` → `"."`); restore-safety refusal exercised; BW-C gate review PASS.
- Added Build Week governance controls: skill-contract validation, config-reference reconciliation, protected-surface verification, precision review skill, phase prompts, and workflow documentation.

### Fixed

- P7-F1: new project metadata no longer persists a machine-absolute `root_path`; stores `"."` for newly initialized project records.
- Updated skill-contract checker to reference the correct frozen-release document location.

### Changed

- Bumped package version from `1.0.1` to `1.1.0` across npm, Python, runtime constants, and documentation.
- Consolidated PR #24 (BW-A) into the Phase 1–7 integration branch; BW-A, BW-B, and BW-C gate reviews all returned PASS with no verified gate findings.

## v1.0.1 - 2026-07-18

### Fixed

- Fixed post-restore same-path material revision allocation so edits after restoring an older tree commit create the next persisted node revision instead of colliding with historical immutable node-revision records.

### Release

- Updated npm, Python, release workflow, and release-note metadata for the v1.0.1 hotfix.

## v1.0.0 - 2026-07-17

### Added

- Released the local Expflow core with the fixed ordinary command surface: `init`, `sync`, `status`, and `restore`.
- Added immutable architecture-source verification, schema/example validation, fixture checks, and registry checks.
- Added local material-core storage for objects, node revisions, complete tree revisions, validation records, operation receipts, change records, and material heads.
- Added authority, semantic, workflow, projection, regeneration/equivalence, structural reuse, security, migration, and extension-host library runtimes.
- Added Gate D security controls for archive quarantine manifests, source instruction/data separation, secret redaction, local-only remote processing defaults, generated-code non-execution, and reuse licensing gates.
- Added end-to-end proof coverage for material, authority, semantic, workflow, projection, reproduction, security, migration, old-state, partial-success, and adapter-boundary scenarios.
- Added the v1 compatibility promise and dual-registry release publishing workflow for npm, PyPI, artifact attestation, and GitHub Release publication.

### Hardened

- Added operation-scoped staging, recoverable init/restore intents, stale-lock liveness classification, causal tree/receipt head repair, and restore intent/tree agreement checks.
- Verified restored tree digests against persisted entries, removed paths, and scope before durable tree reads and writes.
- Removed prerelease package metadata and aligned npm/Python package licensing for v1.0.0.
- Hardened security reporting policy around GitHub Private Vulnerability Reporting and redaction of sensitive evidence.

### Boundaries

- Kept adapter inspection, external revision cursors, adapter idempotency, lost-response reconciliation, Guerilla hook dispatch, network services, databases, brokers, archive extraction, and generated-code execution outside Expflow core.
- Kept immutable architecture sources under `docs/architecture/**` unchanged.
