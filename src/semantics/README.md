# semantics

**Gate C implementation.** This directory owns immutable semantic assertions, semantic decisions, conflicts, review requests, source correspondence records, artifact clusters, and semantic change listing.

Assertions remain proposals until decisions are recorded. Runtime validation rejects nested assertion shape drift before immutable writes. Decisions supersede prior decisions by reference without mutating the earlier record. Conflicts remain visible after resolution decisions.

This directory does not implement workflow execution, projection generation, adapter inspection, hook dispatch, databases, brokers, or network services.
