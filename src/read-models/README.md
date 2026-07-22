# Read Models

Phase 3 read models expose deterministic, versioned application views over existing Expflow records.

The runtime is read-only. It uses documented Expflow runtimes and material store helpers internally, returns bounded pages with stable cursors, and keeps proposed, accepted, rejected, stale, partial, conflicted, unknown, and completed states distinct. Applications should consume this surface instead of reading `.expflow` record directories directly.
