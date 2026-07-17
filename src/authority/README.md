# authority

**Gate C implementation.** This directory owns authority-source revisions, immutable source-registration decisions, readable authority documents, current-source projection, and scope-conflict checks.

Authority records are validated before immutable writes. The runtime rejects undeclared nested keys in authority-source subject selectors, effective intervals, and authority document sections. Current-source projection replays source-registration decisions in durable write order and accounts for accepted decisions, revocation/rejection/supersession, source supersession chains, and effective intervals.

This directory does not implement semantic assertions, workflow occurrences, projections, hooks, adapters, databases, brokers, or network services.
