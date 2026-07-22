# Expflow Source

**Status:** Gate D hardened proof runtime with native durability closure on top of the Gate B material core and Gate C ownership/reproduction runtimes.

The TypeScript source implements the local material core for the four ordinary operations:

- `init`
- `sync`
- `status`
- `restore`

Gate C ownership/reproduction behavior and Gate D security/migration plus native hardening behavior are exposed through library runtimes and the existing material operations, not new ordinary commands.

## Runtime Areas

- `material/` owns record types, digesting, selector handling, planning, material stores, staged immutable promotion, project locks, and recovery intents.
- `scan/` owns working-tree scanning with managed exclusions and selector roots.
- `operations/` owns shared runtime handlers used by the CLI and extension host.
- `gui/` owns the documented application bridge used by the local Expflow GUI.
- `transactions/` owns local structural recovery checks and restore working-tree installation helpers.
- `extensions/` owns the narrow documented extension host.
- `cli/` owns the ordinary command surface.
- `authority/` owns authority-source revisions, source-registration decisions, durable decision ordering, readable authority documents, current-source projection, scope-conflict checks, and exact nested shape validation for authority source/document records.
- `semantics/` owns assertions, decisions, conflicts, review requests, source correspondence, artifact clusters, semantic change listing, and schema-shape validation for persisted semantic records.
- `workflows/` owns workflow occurrences, virtual artifacts, materialization events, immutable workflow transitions, exact selector shape validation, and explicit completion-decision guards.
- `projections/` owns manifest revisions, accepted-only projection-head derivation, projection-root validation, and model-assisted proposal defaults.
- `reproduction/` owns regeneration attempts, equivalence evaluations, reuse results, required regeneration prompt evidence, and reuse policy gates.
- `security/` owns archive quarantine manifests, source instruction/data separation, secret redaction, local-only disclosure policy, generated-code non-execution, and reuse licensing gates.
- `migration/` owns representative legacy typed-folder migration evidence without authority or semantic fabrication.
- `hooks/`, `protocol/`, and `status/` remain boundary placeholders for later hardening or external surfaces.

Core must not add adapter inspection, adapter change cursors, adapter idempotency, adapter lost-response reconciliation, Guerilla hook dispatch, databases, brokers, network services, archive extraction, or generated-code execution.
