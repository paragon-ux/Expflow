# Material Record Format

**Status:** Gate B implemented baseline

Material records are implemented by the Gate B TypeScript runtime as local JSON records and content-addressed objects under `.expflow/`.

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

## Gate B Implementation

- Objects are copied into `.expflow/objects/sha256/<prefix>/<hash>` and verified by SHA-256.
- Node revisions are immutable JSON records under `.expflow/records/node-revisions/`.
- Tree revisions are immutable JSON records under `.expflow/records/tree-revisions/`.
- Operation receipts are immutable JSON records under `.expflow/records/operation-receipts/`.
- The material head is updated separately through `.expflow/HEAD`.
- Tree-content digests are deterministic and exclude event fields such as tree ID, operation ID, parent, timestamp, and notes.

Gate B does not implement authority, semantic, workflow, projection, adapter, database, broker, or network runtime behavior.
