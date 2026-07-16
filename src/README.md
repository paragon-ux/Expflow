# Expflow Source

**Status:** Gate C Phase 9 authority model on top of the Gate B material-core runtime.

The TypeScript source implements the local material core for the four ordinary operations:

- `init`
- `sync`
- `status`
- `restore`

Material runtime code lives in:

- `material/` for record types, digesting, selector handling, planning, and stores.
- `scan/` for working-tree scanning with managed exclusions and path-selector roots.
- `operations/` for shared runtime handlers used by the CLI and extension host.
- `transactions/` for local structural recovery checks.
- `extensions/` for the narrow documented extension host.
- `cli/` for the ordinary command surface.
- `authority/` for authority-source revisions, source-registration decisions, readable authority documents, current-source projection, and scope-conflict checks.

The following directories remain boundary placeholders until later Gate C or Gate D phases own them: `semantics/`, `workflows/`, `projections/`, `hooks/`, `protocol/`, and `status/`.

Core must not add adapter inspection, change cursors, adapter idempotency, lost-response reconciliation, authority decisions, semantic stores, workflow detection, projection generation, hook dispatch, databases, brokers, or network services in the Gate B material-core path.
