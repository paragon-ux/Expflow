# GitHub Release Note: v1.0.0

## Title

Expflow v1.0.0

## Summary

Expflow v1.0.0 is the first MIT-licensed release of the local Expflow core. This release closes Gates A through D: repository contracts, material-core runtime behavior, ownership and reproduction record families, local security and migration controls, native hardening, package metadata, and end-to-end proof.

## Included

- Four ordinary commands: `expflow init`, `expflow sync`, `expflow status`, and `expflow restore`.
- Local `.expflow/` material storage with immutable objects, node revisions, tree revisions, validation records, operation receipts, change records, and material heads.
- Complete-tree sync, drift status, node/tree restore, scoped path selection, explicit identity directives, and digest-similarity proposals without silent identity preservation.
- Operation-scoped staging, recoverable init and restore intents, stale-lock classification, causal tree/receipt head repair, restore intent/tree agreement checks, and restored-tree digest verification.
- Library runtimes for authority sources, semantic decisions, workflow boundaries, projections, regeneration/equivalence, structural reuse, security controls, migration evidence, and the native extension host.
- Repository validation for immutable architecture sources, schemas, examples, fixtures, registries, package boundaries, and end-to-end proof.
- MIT license metadata for npm and Python package surfaces.
- A v1 compatibility promise for CLI names, npm root exports, TypeScript runtime interfaces, persisted v1 state, and package identities.

## Explicitly Out Of Scope

- Adapter inspection or external revision protocols.
- Adapter change cursors, external idempotency, or lost-response reconciliation.
- Guerilla hook dispatch or provider-specific integration runtime.
- Network services, database-backed storage, message brokers, archive extraction, or generated-code execution.
- Production pilots, benchmarks, empirical evaluation, and separately packaged adapters.

## Validation

Local release validation passed on 2026-07-17 for Node, TypeScript, repository contracts, package verification, Python tests, wheel build, wheel import, and release diff whitespace checks. Detailed command evidence is recorded in `docs/completion_reports/V1_RELEASE_CLOSEOUT_REPORT.md`.

## Compatibility

The v1 compatibility promise is documented in `docs/V1_COMPATIBILITY.md`.

## Registry Publication

Registry publication is owner-controlled through the OIDC release workflow documented in `docs/RELEASE_PUBLISHING.md`. Do not treat npm or PyPI installation as available until registry metadata and external installation checks verify the published artifacts.
