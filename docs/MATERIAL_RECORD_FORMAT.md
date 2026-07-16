# Material Record Format

**Status:** Gate A Phase 2 baseline

Material records are architecture intent in Gate A. They are not implemented by the Phase 1 scaffold.

## Record Families

| Record            | Purpose                                                   |
| ----------------- | --------------------------------------------------------- |
| Material node     | Opaque continuity identity for a material artifact.       |
| Node revision     | Immutable content revision with mandatory SHA-256 digest. |
| Tree entry        | Actual relative path occupancy for a node revision.       |
| Tree revision     | Complete immutable project tree state.                    |
| Operation plan    | Planned native operation inputs and expected state.       |
| Operation receipt | Immutable native operation result evidence.               |

## Digest Requirements

- Content digests use SHA-256 over exact bytes.
- Tree-content digests use canonical UTF-8 JSON for sorted tree content.
- Tree digest preimage includes path selectors, normalized sorted entries, node revision references, content digests, occupancy metadata, and sorted removed paths.
- Tree digest preimage excludes tree revision ID, parent, operation ID, creation time, and notes.

## Phase Boundary

Gate A may define and validate record shapes. It must not create material stores, scan working trees, persist objects, or mutate project state.
