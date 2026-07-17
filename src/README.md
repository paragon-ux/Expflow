# Expflow Source

**Status:** Gate B material-core runtime with Gate C packages still absent.

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

The following directories remain boundary placeholders until Gate C or later phases own them: `authority/`, `semantics/`, `workflows/`, `projections/`, `hooks/`, `protocol/`, and `status/`.

Core must not add adapter inspection, change cursors, adapter idempotency, lost-response reconciliation, authority decisions, semantic stores, workflow detection, projection generation, hook dispatch, databases, brokers, or network services in the Gate B material-core path.
