# Storage and Recovery

**Status:** Gate B implemented baseline

Storage and recovery are material-core concerns. Gate B implements the local file-backed material path.

## Future Transaction Discipline

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

## Gate B Implementation

- Project transactions acquire `.expflow/LOCK` and release it in a `finally` path.
- Objects, node revisions, tree revisions, validations, changes, and operation receipts are written as local files.
- Immutable records use exclusive writes; existing record identifiers are not overwritten.
- Material head replacement is separated from immutable record writes and does not delete the old `HEAD` before replacement.
- Recovery removes uncommitted staging directories and verifies the committed head tree and object integrity.
- Recovery reconciles a committed material-success receipt whose tree exists but whose head advance was interrupted.
- Recovery reports a head that points at a tree without a matching committed receipt.
- Recovery reports committed tree revisions that have no receipt and were not advanced to head.
- `partial_post_commit` receipts preserve material success when post-commit automation is incomplete.
- Recovery reports `partial_post_commit` automation incompleteness without converting material success into material failure.

Gate B does not implement semantic recovery, hook dispatch, adapter lost-response reconciliation, or external operation resolution.
