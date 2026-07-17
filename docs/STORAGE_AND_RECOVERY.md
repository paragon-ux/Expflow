# Storage and Recovery

**Status:** Gate D native hardening closure

Storage and recovery are material-core concerns. Gate B implements the local file-backed material path. Gate D hardening closure adds staged immutable promotion, recoverable init/restore intents, stale-lock classification, and receipt-based repair for mutable material heads.

## Transaction Discipline

A material transaction will:

1. acquire a project lock;
2. check expected head;
3. scan the working tree with mandatory exclusions;
4. create immutable object and node revisions;
5. create a candidate project tree;
6. run blocking validation;
7. commit material records atomically;
8. record an immutable operation receipt;
9. run post-commit automation;
10. release the lock.

## Recovery Principle

Recovery repairs structural state from durable evidence. It must never invent semantic decisions.

## Implemented Behavior

- Project transactions acquire `.expflow/LOCK` and release it in a `finally` path.
- Objects, node revisions, tree revisions, validations, changes, and operation receipts are written as local files through operation-scoped staging before final promotion.
- Immutable records use staged exclusive writes; existing final paths are verified before reuse and rejected if occupied by different bytes.
- Material head replacement is separated from immutable record writes and does not delete the old `HEAD` before replacement.
- `init` publishes `project.json` only after the first material records and operation receipt exist; an `init_project` recovery intent completes interrupted publication.
- `restore` precomputes and verifies the target tree, stages replacement bytes, records a `restore_working_tree` intent, commits material records, then installs working-tree changes.
- Recovery removes uncommitted staging directories, handles recovery intents, and verifies the committed head tree and object integrity.
- Recovery reconciles committed material-success receipts whose tree exists but whose head/project metadata advance was interrupted.
- Recovery repairs `HEAD` and `project.json.head_tree_revision_id` from the latest verified material-success receipt.
- Recovery classifies `.expflow/LOCK` as stale, live, or malformed using same-host PID liveness; it does not delete a lock merely because it is old.
- Recovery reports a head that points at a tree without a matching committed receipt.
- Recovery reports committed tree revisions that have no receipt and were not advanced to head.
- `partial_post_commit` receipts preserve material success when post-commit automation is incomplete.
- Recovery reports `partial_post_commit` automation incompleteness without converting material success into material failure.

Core does not implement semantic recovery, Guerilla hook dispatch, adapter lost-response reconciliation, external operation resolution, network services, databases, or brokers.
