# Expflow Tests

**Status:** repository-contract, material-runtime, and Gate C ownership/reproduction tests.

Current test areas:

- `unit/` covers generated type inventory, repository discovery, prohibited-scope boundaries, extension-host boundaries, Gate B material runtime behavior, Gate C authority behavior, and Gate C ownership/reproduction behavior.
- `contracts/` verifies immutable architecture sources, registries, schema examples, fixtures, generated controls, and package installation boundaries.
- `fixtures/` contains seed conformance fixtures used by the contract verifiers.

Gate B material-runtime coverage includes immutable stores, object integrity, same-path identity, explicit identity overrides, digest-similarity proposals, stale-head rejection, partial post-commit material success, tree restore reconciliation, receipt/head recovery, and scoped sync selector roots.

Gate C coverage includes:

- authority descriptors remaining proposed until accepted by immutable decisions;
- current-source projection with revocation, supersession, effective intervals, document validation, and scope conflicts;
- semantic assertions and decisions remaining distinct from conflicts and review records;
- workflow output attachment not implying accepted completion;
- projection-root exclusion, model-assisted proposal defaults, and accepted manifest-head derivation;
- regeneration unknown-outcome preservation, equivalence evaluation records, and structural reuse policy gates.

Use the repository validation commands in `README_DEV.md` and record actual exit codes in completion reports.
