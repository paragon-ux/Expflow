# Guerilla Universal Hook Boundary

**Status:** curated external-reference summary

The Guerilla universal-hook architecture was reviewed as compatibility context during Gate D hardening and v1 release closeout. It replaces the older bespoke Guerilla Phase 16 adapter direction, which remains archived local reference material.

## Expflow Boundary

Expflow core remains responsible for native material transactions, restore behavior, project locks, immutable record promotion, material heads, security controls, migration evidence, package metadata, and end-to-end proof.

Expflow core does not implement:

- Guerilla hook dispatch;
- provider-specific adapter drivers;
- adapter inspection protocols;
- external revision cursors;
- adapter idempotency;
- lost-response reconciliation;
- network services;
- database or broker services.

## Compatibility Stance

A future separately versioned Guerilla profile can bracket Expflow command invocation, capture observations, classify command behavior, and synchronize external evidence through documented extension boundaries. It must not depend on undocumented `.expflow` storage paths or repair Expflow-native partial transactions.

This summary is intentionally not a normative architecture source. The immutable Expflow architecture package remains under `docs/architecture/`.
