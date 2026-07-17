# Expflow Tests

**Status:** repository-contract and Gate B material-runtime tests.

Current test areas:

- `unit/` covers generated type inventory, repository discovery, prohibited-scope boundaries, extension-host boundaries, and Gate B material runtime behavior.
- `contracts/` verifies immutable architecture sources, registries, schema examples, fixtures, generated controls, and package installation boundaries.
- `fixtures/` contains seed conformance fixtures used by the contract verifiers.

Gate B material-runtime coverage includes immutable stores, object integrity, same-path identity, explicit identity overrides, digest-similarity proposals, stale-head rejection, partial post-commit material success, tree restore reconciliation, receipt/head recovery, and scoped sync selector roots.

Use the repository validation commands in `README_DEV.md` and record actual exit codes in completion reports.
