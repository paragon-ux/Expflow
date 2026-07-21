# Data Model

**Status:** Gate A Phase 2 baseline

Expflow separates durable state into four families.

| Family     | Records                                                                                                                        | Authority rule                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Material   | Nodes, node revisions, tree entries, tree revisions, operation plans, operation receipts                                       | Byte and path facts are immutable once committed.                          |
| Semantic   | Authority sources, authority documents, assertions, decisions, conflicts, review requests, source correspondence               | Accepted semantic state is derived from immutable decisions.               |
| Workflow   | Workflow occurrences, virtual artifacts, materialization events, regeneration attempts, equivalence evaluations, reuse results | Workflow completion is not inferred from material outputs alone.           |
| Projection | Manifest revisions, manifest heads, deterministic and model-assisted outputs                                                   | Projections are derived and rebuildable, not authoritative material state. |

## Record Version

Core schemas use `schema_version: "2.3"` where applicable. Compatibility changes must be reflected in schemas, examples, registries, seed fixtures, and generated descriptors before Gate A closure.

## Identifiers

Identifiers are opaque and prefix-scoped. Prefixes identify record family only; they do not encode user purpose, path meaning, or semantic acceptance.

## State Derivation

Current state is derived from immutable records and revision ordering. No mutable "current" field is authoritative by itself.
