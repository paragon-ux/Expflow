# Architecture Decisions

**Status:** Gate A Phase 2 baseline
**Workflow SSOT:** `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`
**Source basis:** `EXPFLOW_CONCEPT_PAPER_V2_3.md`, `EXPFLOW_IMPLEMENTATION_SPEC_V2_3.md`, `EXPFLOW_PROTOCOL_SPEC_V2_3.md`, `EXPFLOW_PROJECT_SNAPSHOT_V2_3.md`, `Note-On-Architecture.md`, `V2_3_REVIEW_RESOLUTION.md`, `V2_3_ARCHITECTURE_DELTA.md`

These decisions freeze the repository contract for Gate A. They do not implement runtime behavior.

## Decision Register

| ID     | Decision                                                                                                                         | Rationale                                                                                 | Phase boundary        |
| ------ | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------- |
| AD-001 | Node.js 20+ and Python 3.11+ are the supported Gate A runtimes.                                                                  | Matches current CI and avoids unsupported language features.                              | Repository contract   |
| AD-002 | npm with `package-lock.json` is the JavaScript package manager.                                                                  | Keeps install and CI deterministic.                                                       | Repository contract   |
| AD-003 | Public ordinary commands are limited to `expflow init`, `expflow sync`, `expflow status`, and `expflow restore`.                 | The architecture deliberately keeps the ordinary command surface small.                   | Core command boundary |
| AD-004 | Gate A code may expose version/help text, read-only architecture discovery, schema validation, and contract verification only.   | Prevents premature product runtime.                                                       | No-runtime boundary   |
| AD-005 | Architecture sources under `docs/architecture/` are immutable inputs verified by `SOURCE_MANIFEST.json`.                         | Source bytes must stay authoritative and reproducible.                                    | Source integrity      |
| AD-006 | Working mirrors under `schemas/` and `examples/` are non-authoritative discoverability copies.                                   | Tooling can read convenient paths without shifting authority.                             | Source integrity      |
| AD-007 | Opaque identifiers use record-family prefixes and do not encode meaning.                                                         | Identity is continuity-based, not path-purpose-based.                                     | Identity model        |
| AD-008 | Relative paths are UTF-8, normalized with forward slashes, must not traverse upward, and must not rely on unsafe links.          | Stable path identity and source-content safety require deterministic path handling.       | Protocol and storage  |
| AD-009 | SHA-256 is the mandatory digest for source integrity, material object intent, and Gate A tree-digest vectors.                    | The architecture requires strong byte-level integrity evidence.                           | Digest model          |
| AD-010 | Tree-content digests hash canonical UTF-8 JSON for sorted complete tree content.                                                 | Tree revisions represent complete material state, not individual file deltas.             | Tree revision model   |
| AD-011 | Material records, semantic records, workflow records, and projection records remain separate families.                           | Material facts do not imply semantic acceptance or workflow completion.                   | Data model            |
| AD-012 | Authority descriptors are not accepted authority until an immutable registration decision exists.                                | Acceptance history is part of workflow ownership.                                         | Authority model       |
| AD-013 | Assertions and decisions are distinct immutable records.                                                                         | Reviewable ownership requires attributed claims and durable decisions.                    | Semantic model        |
| AD-014 | Deterministic projections and model-assisted projections are separate, attributable outputs.                                     | Model-assisted output is proposed by default and must not become deterministic authority. | Projection model      |
| AD-015 | Python hooks are schema-governed, stdin/stdout, read-only contract participants.                                                 | Hooks must not mutate material state or execute generated code.                           | Hook boundary         |
| AD-016 | Adapter inspection, cursors, idempotency, reconciliation, capability policy, and writer partitioning are deferred outside core.  | `V2_3_REVIEW_RESOLUTION.md` separates adapter profiles from core.                         | Adapter boundary      |
| AD-017 | Core extension exports may expose schema-valid records, native operation invocation, receipts, and read-only project state only. | Separate packages need documented extension points without raw storage access.            | Extension boundary    |
| AD-018 | Phase 1 provides no locks, staging, material stores, transactions, recovery, or operation receipts.                              | These begin in later phases and must not be implied by scaffolds.                         | Phase discipline      |
| AD-019 | Source-content security is a semantic correctness requirement, but Gate A records it as governance and tests only.               | Enforcement belongs to later runtime phases.                                              | Security model        |
| AD-020 | Gate A closure requires decisions, schemas, registries, fixture corpus, generated types, and validator parity to agree.          | Later material work must not reopen contract identity or digest choices.                  | Gate A exit           |

## Deferred Decisions

The core repository does not decide adapter request canonicalization, external idempotency grammar, external revision cursors, lost-response reconciliation, adapter capability policy, or writer partitioning. Those decisions belong to separately versioned adapter profiles.

## Executable Decision Vectors

Machine-readable decision vectors live in `registries/decision-vectors.json`. They are contract data for validation and review, not runtime configuration.
