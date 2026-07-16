# Final Contract Material Core Checklist

**Status:** Gate B local evidence checklist
**Workflow SSOT:** `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`

| Checklist item                                                 | Status | Evidence                                        |
| -------------------------------------------------------------- | ------ | ----------------------------------------------- |
| Four ordinary commands remain the primary user surface         | PASS   | `src/cli/index.ts`, package verifier            |
| User paths remain unchanged during dry-run planning and status | PASS   | `planSync`, `status`, unit tests                |
| Every stored object has a verified digest                      | PASS   | `src/material/store.ts`, object corruption test |
| Hard links are never used for immutable history                | PASS   | `rejectHardLinkedObject`                        |
| Same-path identity advances the same node                      | PASS   | material runtime unit test                      |
| Explicit `new` creates a new node                              | PASS   | material runtime unit test                      |
| Explicit move with `preserve` keeps identity                   | PASS   | material runtime unit test                      |
| Digest similarity is proposal-only                             | PASS   | material runtime unit test                      |
| Old tree revisions restore as new committed heads              | PASS   | restore unit test                               |
| Native operation receipts are immutable                        | PASS   | exclusive receipt writes                        |
| `partial_post_commit` preserves material success               | PASS   | partial post-commit unit test                   |
| Extension host avoids raw store access                         | PASS   | extension-host unit test                        |
| Adapter idempotency and reconciliation are absent from core    | PASS   | prohibited-scope audit                          |
| Authority and semantic runtime remain future Gate C scope      | PASS   | scope audit                                     |
| Projections remain future Gate C scope                         | PASS   | scope audit                                     |
| Clean package installs and runs outside checkout               | PASS   | `npm run package:verify`                        |

## Notes

Hosted CI evidence must be recorded after the Gate B PR is opened. Gate C must not start until Gate B review, hosted CI, and merge evidence are complete.
