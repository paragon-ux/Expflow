# Expflow Source

**Status:** Gate C ownership and reproduction runtime on top of the Gate B material core.

The TypeScript source implements the local material core for the four ordinary operations:

- `init`
- `sync`
- `status`
- `restore`

Gate C ownership and reproduction behavior is exposed through library runtimes, not new ordinary commands.

## Runtime Areas

- `material/` owns record types, digesting, selector handling, planning, and material stores.
- `scan/` owns working-tree scanning with managed exclusions and selector roots.
- `operations/` owns shared runtime handlers used by the CLI and extension host.
- `transactions/` owns local structural recovery checks.
- `extensions/` owns the narrow documented extension host.
- `cli/` owns the ordinary command surface.
- `authority/` owns authority-source revisions, source-registration decisions, durable decision ordering, readable authority documents, current-source projection, and scope-conflict checks.
- `semantics/` owns assertions, decisions, conflicts, review requests, source correspondence, artifact clusters, semantic change listing, and schema-shape validation for persisted semantic records.
- `workflows/` owns workflow occurrences, virtual artifacts, materialization events, immutable workflow transitions, and explicit completion-decision guards.
- `projections/` owns manifest revisions, accepted-only projection-head derivation, projection-root validation, and model-assisted proposal defaults.
- `reproduction/` owns regeneration attempts, equivalence evaluations, reuse results, required regeneration prompt evidence, and reuse policy gates.
- `hooks/`, `protocol/`, and `status/` remain boundary placeholders for later hardening or external surfaces.

Core must not add adapter inspection, change cursors, adapter idempotency, lost-response reconciliation, hook dispatch, databases, brokers, or network services.
