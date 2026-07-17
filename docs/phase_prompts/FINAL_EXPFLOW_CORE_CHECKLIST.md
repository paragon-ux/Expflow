# Final Expflow Core Checklist

## Gate D Core Proof

| Criterion                                                                 | Status | Evidence                          |
| ------------------------------------------------------------------------- | ------ | --------------------------------- |
| Four ordinary commands remain the primary user surface                    | PASS   | CLI/runtime exports unchanged     |
| User paths remain unchanged unless a mutating operation is requested      | PASS   | Material and migration tests      |
| Every stored object has a verified digest                                 | PASS   | Material verification tests       |
| Hard links are rejected for immutable history                             | PASS   | Material store behavior           |
| Identity overrides work                                                   | PASS   | Material and e2e tests            |
| Digest similarity is proposal-only                                        | PASS   | Material and e2e tests            |
| Old node and tree revisions restore or remain inspectable                 | PASS   | Material and e2e tests            |
| Native operation receipts are immutable and material success is preserved | PASS   | Material and e2e tests            |
| Authority requires decisions                                              | PASS   | Authority and e2e tests           |
| Assertions remain distinct from decisions                                 | PASS   | Gate C and e2e tests              |
| Workflow completion remains separate from material output                 | PASS   | Workflow and e2e tests            |
| Projections never become material authority                               | PASS   | Projection and e2e tests          |
| Model-assisted output remains attributable and non-deterministic          | PASS   | Projection and e2e tests          |
| Regeneration unknown outcomes remain explicit                             | PASS   | Reproduction tests                |
| Reuse does not inherit acceptance automatically                           | PASS   | Reproduction and e2e tests        |
| Security controls pass                                                    | PASS   | Security tests                    |
| Migration evidence is complete                                            | PASS   | Migration tests                   |
| End-to-end scenarios pass                                                 | PASS   | `tests/e2e/gate-d-proof.test.ts`  |
| Clean packages install and run                                            | PASS   | package verification commands     |
| Documentation reflects implemented reality                                | PASS   | Gate D docs and completion report |

## Adapter Boundary

Inspection cursors, adapter request normalization, adapter idempotency, lost-response reconciliation, capability policy, and writer partitioning remain outside core and are not implemented as ordinary commands.
