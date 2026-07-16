# Test Matrix

**Status:** Gate A Phase 2-4 baseline

## Validation Commands

| ID  | Command                                         | Purpose                                          |
| --- | ----------------------------------------------- | ------------------------------------------------ |
| V01 | `npm ci`                                        | Clean dependency installation                    |
| V02 | `npm run format:check`                          | Formatting contract for stable files             |
| V03 | `npm run lint`                                  | TypeScript lint contract                         |
| V04 | `npm run typecheck`                             | Strict TypeScript typecheck                      |
| V05 | `npm test`                                      | Node repository-contract tests                   |
| V06 | `npm run contracts:verify`                      | Source integrity and repository contract         |
| V07 | `npm run schemas:meta-validate`                 | JSON Schema meta-validation                      |
| V08 | `npm run examples:index-check`                  | Example discoverability and parse check          |
| V09 | `npm run schemas:examples-validate`             | TypeScript example and fixture schema validation |
| V10 | `npm run fixtures:verify`                       | Fixture taxonomy and seed corpus verification    |
| V11 | `npm run build`                                 | TypeScript build                                 |
| V12 | `npm run package:verify`                        | npm package verification                         |
| V13 | `python -m pip install -e ".[dev]"`             | Editable Python dev install                      |
| V14 | `python -m pytest`                              | Python schema parity tests                       |
| V15 | `python -m build --wheel`                       | Python wheel build                               |
| V16 | `python tests/contracts/verify_python_wheel.py` | External wheel import                            |

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
| No product runtime         | Prohibited-scope tests                                   |
