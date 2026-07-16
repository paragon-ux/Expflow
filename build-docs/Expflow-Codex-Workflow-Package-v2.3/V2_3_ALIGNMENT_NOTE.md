# Expflow Workflow v2.3 Alignment

This workflow accompanies Expflow Core Architecture 2.3.

The core build no longer owns exact external inspection, composite project revisions, incremental cursors, adapter idempotency, lost-response reconciliation, capability policy, or writer partitioning.

Those contracts are built and versioned in separate adapter packages after the core extension boundary is available.
