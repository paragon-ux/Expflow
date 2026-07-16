# Storage and Recovery

**Status:** Gate A Phase 2 baseline

Storage and recovery are material-core concerns. Gate A freezes the contract without implementing storage.

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

## Gate A Boundary

No locks, object store, staging area, atomic commit logic, receipt store, or recovery implementation exists in Gate A.
