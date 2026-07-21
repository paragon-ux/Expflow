# Glossary

**Status:** Gate A Phase 2 baseline

| Term                        | Definition                                                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Accepted authority source   | An authority-source descriptor with an immutable source-registration decision that accepts it.                                                                                             |
| Assertion                   | An attributed semantic claim. Assertions do not become accepted state without decisions.                                                                                                   |
| Complete tree revision      | One immutable material state for a complete relative project tree.                                                                                                                         |
| Core extension host         | The narrow documented surface a separate package may use to access schema-valid records, native operations, receipts, and read-only project state.                                         |
| Decision                    | An immutable semantic act such as accept, reject, modify, defer, revoke, or supersede.                                                                                                     |
| Deterministic projection    | A derived output produced from accepted state and a fixed projector/template version.                                                                                                      |
| Gate A                      | Contract-ready work across Phases 1-4: repository governance, invariant decisions, future decision slots, schemas, registries, seed fixtures, generated descriptors, and validator parity. |
| Material fact               | A byte, path, node, node revision, tree entry, tree revision, operation plan, or operation receipt fact.                                                                                   |
| Model-assisted projection   | A proposed output with model profile, prompt digest, and source limitations.                                                                                                               |
| Native operation            | A core mutation or query surfaced through the four ordinary commands.                                                                                                                      |
| Operation receipt           | An immutable record of a native operation result. Intent only until the material-core phases.                                                                                              |
| Ordinary command            | One of `expflow init`, `expflow sync`, `expflow status`, or `expflow restore`.                                                                                                             |
| Projection                  | A derived view or manifest that is rebuildable and not authoritative material state.                                                                                                       |
| Readable authority document | A human-reviewable authority source profile, split or unified.                                                                                                                             |
| Semantic ownership          | Control over accepted decisions and reviewable workflow state, not just possession of files.                                                                                               |
| Source correspondence       | A record connecting imported or recovered source content to Expflow records without making the source authoritative.                                                                       |
| Tree-content digest         | A SHA-256 digest of canonical complete tree content, excluding record metadata that would make the digest unstable.                                                                        |
| Virtual artifact            | A workflow artifact recorded without being materialized into the user tree.                                                                                                                |
| Workflow occurrence         | A bounded workflow instance with input/output tree boundaries and material, completion, verification, and reuse state.                                                                     |

Adapter-only terms such as external cursor, adapter idempotency key, and lost-response reconciliation are intentionally excluded from core definitions.
