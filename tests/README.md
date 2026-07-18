# Expflow Tests

**Status:** repository-contract, material-runtime, Gate C ownership/reproduction, and Gate D proof tests.

Current test areas:

- `unit/` covers generated type inventory, repository discovery, prohibited-scope boundaries, extension-host boundaries, Gate B material runtime behavior, Gate C authority behavior, Gate C ownership/reproduction behavior, and Gate D security/migration behavior.
- `e2e/` covers the Gate D final core proof path.
- `contracts/` verifies immutable architecture sources, registries, schema examples, fixtures, generated controls, and package installation boundaries, including exact release tarball and wheel checks when supplied.
- `fixtures/` contains seed conformance fixtures used by the contract verifiers.

Gate B/Gate D material-runtime coverage includes immutable stores, staged object and record promotion, object integrity, same-path identity, explicit identity overrides, digest-similarity proposals, stale-head rejection, partial post-commit material success, tree restore reconciliation, real interruption recovery for sync/init/restore, stale/live lock classification, receipt-based `HEAD` and project metadata repair, and scoped sync selector roots.

Gate C coverage includes:

- authority descriptors remaining proposed until accepted by immutable decisions;
- current-source projection with revocation, supersession, effective intervals, same-timestamp decision ordering, document validation, exact authority nested shape checks, and scope conflicts;
- semantic assertions and decisions remaining distinct from conflicts and review records, with nested assertion shape validation;
- workflow output attachment not implying accepted completion, accepted completion requiring a decision reference, and workflow selector shape validation;
- projection-root exclusion, model-assisted proposal defaults, accepted-only manifest-head derivation, and terminal projection statuses not evicting accepted heads;
- regeneration unknown-outcome preservation, required prompt digests, equivalence evaluation records, and structural reuse policy gates.

Gate D coverage includes:

- archive quarantine manifest validation and unsafe archive rejection;
- source instruction/data separation, secret redaction, local-only remote disclosure blocking, generated-code non-execution, and reuse license restrictions;
- in-place typed-folder migration evidence without user-path moves or authority fabrication;
- end-to-end proof across material, authority, semantic, workflow, projection, reproduction, security, migration, old-state inspection, partial automation success, native recovery hardening, and adapter-boundary scenarios.

Use the repository validation commands in `README_DEV.md` and record actual exit codes in completion reports.
