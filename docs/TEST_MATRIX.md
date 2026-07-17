# Test Matrix

**Status:** Gate D validation baseline

## Validation Commands

| ID  | Command                                                           | Purpose                                          |
| --- | ----------------------------------------------------------------- | ------------------------------------------------ |
| V01 | `npm ci`                                                          | Clean dependency installation                    |
| V02 | `npm run format:check`                                            | Formatting contract for stable files             |
| V03 | `npm run lint`                                                    | TypeScript lint contract                         |
| V04 | `npm run typecheck`                                               | Strict TypeScript typecheck                      |
| V05 | `npm test`                                                        | Node repository and runtime tests                |
| V06 | `npm run contracts:verify`                                        | Source integrity and repository contract         |
| V07 | `npm run registries:verify`                                       | Registry coverage and boundary checks            |
| V08 | `npm run schemas:meta-validate`                                   | JSON Schema meta-validation                      |
| V09 | `npm run examples:index-check`                                    | Example discoverability and parse check          |
| V10 | `npm run schemas:examples-validate`                               | TypeScript example and fixture schema validation |
| V11 | `npm run fixtures:verify`                                         | Fixture taxonomy and seed corpus verification    |
| V12 | `npm run build`                                                   | TypeScript build                                 |
| V13 | `npm run package:verify`                                          | npm package verification                         |
| V14 | `python -m pip install -e ".[dev]"`                               | Editable Python dev install                      |
| V15 | `python -m pytest`                                                | Python schema parity tests                       |
| V16 | `python -m build --wheel`                                         | Python wheel build                               |
| V17 | `python tests/contracts/verify_python_wheel.py`                   | External wheel import                            |
| V18 | `git diff --check origin/main...HEAD -- ':!docs/architecture/**'` | Whitespace check outside immutable sources       |

`docs/CURRENT_STATUS_MATRIX.md` is a live operational status artifact and is intentionally excluded from formatting and contract validation.

## Gate A Coverage

| Area                       | Evidence                                                 |
| -------------------------- | -------------------------------------------------------- |
| Source integrity           | `SOURCE_MANIFEST.json`, `npm run contracts:verify`       |
| Schema meta-validation     | AJV Draft 2020-12 and Python `jsonschema`                |
| Example validation         | `npm run schemas:examples-validate`, Python parity tests |
| Fixture taxonomy and seeds | `tests/fixtures/contracts/`                              |
| Generated type descriptors | `src/generated/schema-types.ts`                          |
| Adapter deferral           | Contract tests and extension-boundary docs               |

## Gate B Coverage

| Area                          | Evidence                                                                  |
| ----------------------------- | ------------------------------------------------------------------------- |
| Immutable material stores     | `tests/unit/material-runtime.test.ts`                                     |
| Object integrity              | Corruption verification test                                              |
| Tree-content digest path      | Runtime tree revision creation and status clean/drift checks              |
| Sync and identity             | Same-path, explicit move, explicit new-node, and digest proposal tests    |
| Scoped selectors              | Selector-root sync keeps out-of-scope entries unchanged                   |
| Transactions and receipts     | Stale-head guard, lock path, receipt status, and partial post-commit test |
| Core recovery                 | Uncommitted staging cleanup and committed receipt/head-gap reconciliation |
| Restore-source reads          | Tree restore reconciliation removes files absent from the restored tree   |
| Extension host boundary       | `tests/unit/extension-host.test.ts`                                       |
| Adapter-only contracts absent | `tests/unit/prohibited-scope.test.ts`                                     |

## Gate C Coverage

| Area                                  | Evidence                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Authority source validation           | `tests/unit/authority-runtime.test.ts`                                                            |
| Registration decisions                | accepted, revoked, superseded, and same-timestamp replay tests                                    |
| Current-source projection             | effective interval and supersession test                                                          |
| Readable authority documents          | split/unified schema, required digest, and section shape tests                                    |
| Authority scope conflicts             | overlapping accepted-source conflict test                                                         |
| Semantic ownership                    | `tests/unit/gate-c-runtime.test.ts`                                                               |
| Nested schema-shape guards            | authority selector/interval/section, semantic issuer/claim, and workflow selector rejection tests |
| Conflict retention                    | conflict remains after resolution test                                                            |
| Workflow boundaries                   | output attachment leaves completion `none`                                                        |
| Completion decision guard             | accepted completion rejects null decision refs                                                    |
| Virtual artifacts and materialization | workflow runtime test                                                                             |
| Projection root and manifest heads    | projection runtime and terminal-status tests                                                      |
| Regeneration and equivalence          | unknown attempt, prompt-digest, and evaluation tests                                              |
| Structural reuse                      | reuse policy-gate and no-transfer tests                                                           |

## Gate D Coverage

| Area                             | Evidence                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| Archive quarantine               | `tests/unit/security-migration-runtime.test.ts` rejects traversal, links, devices, and size drift |
| Source instruction/data boundary | source preparation test marks content as data and keeps control instructions separate             |
| Secret and remote disclosure     | local-only rejection and redacted remote disclosure tests                                         |
| Generated-code non-execution     | default policy rejects generated-code execution                                                   |
| Licensing restrictions           | reuse policy rejects blocked license and reuse labels                                             |
| Legacy migration                 | typed-folder migration test preserves files and reports no authority fabrication                  |
| End-to-end proof                 | `tests/e2e/gate-d-proof.test.ts` covers 25 workflow-required proof scenarios                      |
| Adapter boundary                 | prohibited-scope and e2e tests prove adapter-only protocols remain absent                         |
