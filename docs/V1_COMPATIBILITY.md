# Expflow v1 Compatibility

**Status:** v1 public compatibility promise

This document defines what Expflow keeps stable throughout the `1.x` release line. It applies to the released core repository and package surfaces, not to separately versioned adapter or integration packages.

## Stable Throughout 1.x

Expflow treats these surfaces as stable throughout `1.x`:

- the four ordinary CLI command names: `expflow init`, `expflow sync`, `expflow status`, and `expflow restore`;
- npm root exports from `src/index.ts`;
- documented public TypeScript runtime interfaces and exported types;
- supported persisted material records and schemas;
- the ability to read valid v1 `.expflow` state;
- npm package name `expflow` and primary import path `expflow`;
- PyPI distribution name `expflow-hooks` and Python import package `expflow_hooks`;
- documented security defaults and external-state boundaries.

Internal modules that are not exported from the npm package root are not public API unless separately documented.

## Major-Version Changes

These changes are breaking changes and require a major-version review:

- removing or incompatibly changing a root export;
- changing CLI command names or existing required arguments incompatibly;
- making valid v1 persisted state unreadable without a supported migration;
- changing record meaning incompatibly;
- transferring adapter behavior, Guerilla hook dispatch, network services, databases, archive execution, or generated-code execution into core without a new architecture decision and major-version review.

## Allowed In 1.x

These changes are allowed in `1.x` when they preserve the stable promises above:

- additive exports;
- additive optional fields with backward-compatible defaults;
- new validation and recovery checks that reject corrupt or previously undefined states;
- security fixes;
- documentation corrections;
- new separately versioned integration packages.

## Boundary

Expflow core remains local-first and limited to the implemented four-command material core plus library/runtime surfaces documented for v1. Separately versioned integrations may build on documented exports and schemas, but they do not change the core compatibility promise.
