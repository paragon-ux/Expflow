# Expflow v1.0.0

Expflow v1.0.0 is the first MIT-licensed release of the local Expflow core.

This release closes Gates A through D: repository contracts, the material-core runtime, ownership and reproduction record families, local security and migration controls, native hardening, package metadata, and end-to-end proof.

## Install

```bash
npm install -g expflow
```

The npm package provides the `expflow` CLI, TypeScript library exports, schemas, and architecture assets.

```bash
pip install expflow-hooks
```

The Python package is a hook scaffold and read-only architecture schema discovery surface. It does not dispatch or execute hooks.

## What Is Included

- Four ordinary commands: `expflow init`, `expflow sync`, `expflow status`, and `expflow restore`.
- Local `.expflow/` material storage with immutable objects, node revisions, tree revisions, validation records, operation receipts, change records, and material heads.
- Complete-tree sync, drift status, node/tree restore, scoped path selection, explicit identity directives, and digest-similarity proposals without silent identity preservation.
- Operation-scoped staging, recoverable init and restore intents, stale-lock classification, causal tree/receipt head repair, restore intent/tree agreement checks, and restored-tree digest verification.
- Library runtimes for authority sources, semantic decisions, workflow boundaries, projections, regeneration/equivalence, structural reuse, security controls, migration evidence, and the native extension host.
- Repository validation for immutable architecture sources, schemas, examples, fixtures, registries, package boundaries, and end-to-end proof.
- A v1 compatibility promise for CLI names, npm root exports, TypeScript runtime interfaces, persisted v1 state, and package identities.

## Compatibility

The v1 compatibility promise covers CLI names, npm root exports, TypeScript runtime interfaces, persisted v1 state, and package identities throughout the 1.x line. The compatibility promise is documented in `docs/V1_COMPATIBILITY.md`.

## Out Of Scope

- Adapter inspection or external revision protocols.
- Adapter change cursors, external idempotency, or lost-response reconciliation.
- Guerilla hook dispatch or provider-specific integration runtime.
- Network services, database-backed storage, message brokers, archive extraction, or generated-code execution.
- Production pilots, benchmarks, empirical evaluation, and separately packaged adapters.

## Publication And Provenance

- Package build tag: `v1.0.0`
- Package build commit: `605d249f7e09adcaecc2a102f2fb874ef460a6fa`
- npm package: `expflow@1.0.0`
- PyPI package: `expflow-hooks==1.0.0`

The attached release artifacts were downloaded from the public npm and PyPI registries after publication and verified by SHA-256 checksum. Public install checks passed for both `expflow@1.0.0` and `expflow-hooks==1.0.0`.

The GitHub Actions release run built, validated, uploaded, and attested artifacts from the `v1.0.0` tag. Registry verification later required release-process cleanup because npm verification encountered token handling behavior and PyPI verification initially raced registry propagation. The published registry artifacts and GitHub Release assets now match the recorded release evidence.

Post-publication workflow and documentation corrections landed on `main` after the package-build commit. Those corrections did not change TypeScript source, Python source, schemas, package metadata, package contents, or registry artifacts for v1.0.0.

Detailed release evidence is recorded in `docs/completion_reports/V1_RELEASE_CLOSEOUT_REPORT.md`.
