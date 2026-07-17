# Changelog

## v1.0.0 - 2026-07-17

### Added

- Released the local Expflow core with the fixed ordinary command surface: `init`, `sync`, `status`, and `restore`.
- Added immutable architecture-source verification, schema/example validation, fixture checks, and registry checks.
- Added local material-core storage for objects, node revisions, complete tree revisions, validation records, operation receipts, change records, and material heads.
- Added authority, semantic, workflow, projection, regeneration/equivalence, structural reuse, security, migration, and extension-host library runtimes.
- Added Gate D security controls for archive quarantine manifests, source instruction/data separation, secret redaction, local-only remote processing defaults, generated-code non-execution, and reuse licensing gates.
- Added end-to-end proof coverage for material, authority, semantic, workflow, projection, reproduction, security, migration, old-state, partial-success, and adapter-boundary scenarios.

### Hardened

- Added operation-scoped staging, recoverable init/restore intents, stale-lock liveness classification, causal tree/receipt head repair, and restore intent/tree agreement checks.
- Verified restored tree digests against persisted entries, removed paths, and scope before durable tree reads and writes.
- Removed prerelease and unlicensed package metadata for the v1 release candidate.

### Boundaries

- Kept adapter inspection, external revision cursors, adapter idempotency, lost-response reconciliation, Guerilla hook dispatch, network services, databases, brokers, archive extraction, and generated-code execution outside Expflow core.
- Kept immutable architecture sources under `docs/architecture/**` unchanged.
