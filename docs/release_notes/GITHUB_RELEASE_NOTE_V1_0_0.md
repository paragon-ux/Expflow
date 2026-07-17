# GitHub Release Note: v1.0.0

## Title

Expflow v1.0.0 Release Candidate

## Summary

Expflow v1.0.0 prepares the local core for external review as an MIT-licensed release candidate. This release closes Gates A through D: repository contracts, material-core runtime behavior, ownership and reproduction record families, local security and migration controls, native hardening, package metadata, and end-to-end proof.

No packages have been published and no `v1.0.0` tag has been created from this branch.

## Included

- Four ordinary commands: `expflow init`, `expflow sync`, `expflow status`, and `expflow restore`.
- Local `.expflow/` material storage with immutable objects, node revisions, tree revisions, validation records, operation receipts, change records, and material heads.
- Complete-tree sync, drift status, node/tree restore, scoped path selection, explicit identity directives, and digest-similarity proposals without silent identity preservation.
- Operation-scoped staging, recoverable init and restore intents, stale-lock classification, causal tree/receipt head repair, restore intent/tree agreement checks, and restored-tree digest verification.
- Library runtimes for authority sources, semantic decisions, workflow boundaries, projections, regeneration/equivalence, structural reuse, security controls, migration evidence, and the native extension host.
- Repository validation for immutable architecture sources, schemas, examples, fixtures, registries, package boundaries, and end-to-end proof.
- MIT license metadata for npm and Python package surfaces.

## Explicitly Out Of Scope

- Adapter inspection or external revision protocols.
- Adapter change cursors, external idempotency, or lost-response reconciliation.
- Guerilla hook dispatch or provider-specific integration runtime.
- Network services, database-backed storage, message brokers, archive extraction, or generated-code execution.
- Production pilots, benchmarks, empirical evaluation, and separately packaged adapters.

## Validation

Local release validation passed on 2026-07-17 for Node, TypeScript, repository contracts, package verification, Python tests, wheel build, wheel import, and release diff whitespace checks. Detailed command evidence is recorded in `docs/completion_reports/V1_RELEASE_CLOSEOUT_REPORT.md`.

## Release Status

Classification: `release-candidate-ready`.

Owner-controlled follow-ups remain:

- Review and merge the Gate D hardening closure PR if not already merged.
- Review and merge the v1 release-closeout PR.
- Decide whether to create the `v1.0.0` tag.
- Decide whether and where to publish npm and Python packages.
