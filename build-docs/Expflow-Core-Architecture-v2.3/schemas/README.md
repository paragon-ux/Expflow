# Expflow 2.3 Machine Contracts

These JSON Schema 2020-12 files are normative.

Key changes from 2.1:

- extensible authority-source registration;
- split and unified readable authority-document profiles;
- immutable source-registration and semantic decisions;
- explicit conflicts and review requests;
- source correspondence separated from import-tree inventory;
- mandatory SHA-256 digests and write-isolated stored objects;
- explicit identity directives for same-path replacement and moves;
- workflow input/output tree revisions and path selectors;
- proposed versus accepted manifest revisions;
- deterministic and model-assisted projector classes;
- virtual artifacts, materialization events, regeneration, evaluation, and reuse contracts;
- one consistent schema and protocol version: `2.2`.

Generated language types are derivative. They do not replace these schemas.


## Version 2.3 boundary change

Adapter-level inspection, composite revisions, cursors, request normalization,
idempotency retention, operation reconciliation, capability policy, and
cross-system writer partitioning are not core schemas.

Core schema changes:

- `tree-entry` carries `node_content_digest`;
- `operation-plan` no longer carries an external idempotency key;
- all contracts use schema version 2.3.
