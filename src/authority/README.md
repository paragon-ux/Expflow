# authority

**Gate C implementation.** This directory owns authority-source revisions, immutable source-registration decisions, readable authority documents, current-source projection, and scope-conflict checks.

Authority records are validated before immutable writes. Current-source projection accounts for accepted decisions, revocation/rejection/supersession, source supersession chains, and effective intervals.

This directory does not implement semantic assertions, workflow occurrences, projections, hooks, adapters, databases, brokers, or network services.
