# Expflow Developer Guide

**v1.0.1 release.** Local material-core runtime behavior is implemented for the four ordinary commands. Gate C ownership and reproduction behavior is implemented through library runtimes for authority, semantics, workflows, projections, regeneration/equivalence, and reuse. Gate D adds local security controls, migration evidence, package hardening, end-to-end proof, and native durability hardening for material transactions.

Adapter inspection/reconciliation, Guerilla hook dispatch, network services, databases, brokers, and generated-code execution remain out of scope.

## Prerequisites

- Node.js >= 20
- npm >= 10
- Python >= 3.11
- Git

## Setup

```bash
git clone https://github.com/paragon-ux/Expflow.git
cd Expflow
git checkout main
npm ci
python -m pip install -e ".[dev]"
```

## Package Roles

The npm package `expflow` is the primary CLI and TypeScript library package. Its public v1 API is the package-root export surface documented in `src/index.ts` and [docs/V1_COMPATIBILITY.md](docs/V1_COMPATIBILITY.md).

The PyPI package `expflow-hooks` is the Python hook/scaffold package and imports as `expflow_hooks`. It is not the TypeScript core or the `expflow` CLI.

Registry publication is owner-controlled through [docs/RELEASE_PUBLISHING.md](docs/RELEASE_PUBLISHING.md). Do not claim npm or PyPI publication until registry metadata and external install checks prove it.

## Validation Commands

### Formatting

```bash
npm run format
npm run format:check
```

### Linting And Type Checking

```bash
npm run lint
npm run typecheck
```

### Tests

```bash
npm test
python -m pytest
```

### Contract Verification

```bash
npm run contracts:verify
npm run registries:verify
npm run schemas:meta-validate
npm run examples:index-check
npm run schemas:examples-validate
npm run fixtures:verify
```

### Build And Package Verification

```bash
npm run build
npm run package:verify
npm run clean
python -m build
python -m twine check dist/*
python tests/contracts/verify_python_wheel.py
```

`npm run clean` is required before the exact `python -m twine check dist/*` command because TypeScript build output also uses `dist/`.

### Full Local Validation Sequence

```bash
npm run validate
python -m pip install -e ".[dev]"
python -m pytest
npm run clean
python -m build
python -m twine check dist/*
python tests/contracts/verify_python_wheel.py
git diff --check -- ':!docs/architecture/**'
```

## Current TypeScript Runtime Boundary

The TypeScript package implements:

- Package version reporting (`1.0.1`)
- CLI handlers for `expflow init`, `expflow sync`, `expflow status`, and `expflow restore`
- Local `.expflow/` material storage with immutable objects, node revisions, tree revisions, operation receipts, validations, changes, and material head state
- Working-tree scanning with `.expflow/**` exclusion and scoped path selectors
- Same-path continuity, explicit `preserve`, `new`, and `replace` directives, and digest-similarity proposals without identity preservation
- Local transaction locking, operation-scoped staging, recoverable init/restore intents, validation receipts, partial post-commit material success status, stale-lock classification, causal tree/receipt head repair, and restore-source reads
- A narrow extension host that invokes native operations and reads schema-shaped committed records without raw store exports
- Authority-source revisions, source-registration decisions, readable authority documents, current-source projection, and scope-conflict checks
- Semantic assertions, semantic decisions, conflicts, review requests, source correspondence, artifact clusters, and semantic change listing
- Workflow occurrences, virtual artifacts, materialization events, and immutable workflow state transitions
- Manifest revisions, projection-head derivation, projection-root constraints, and model-assisted proposal defaults
- Regeneration attempts, equivalence evaluations, reuse results, and reuse policy-gate checks
- Stable read-model envelopes, deterministic ordering, bounded cursor pagination, filters, material linkage, and GUI bridge access for advanced records
- Evidence intake with provenance envelopes, deterministic digest/idempotency handling, quarantine state, authority-source proposals, correspondence proposals, conflict records, artifact candidates, and explicit human decisions
- Portable workflow package export/import with deterministic manifests, offline payload validation, collision-safe import plans, unresolved external dependency reporting, and resume-state summaries
- Security controls for archive quarantine manifests, source instruction/data separation, secret redaction, local-only remote disclosure policy, generated-code non-execution, and reuse license restrictions
- Migration evidence for in-place typed-folder projects without fabricating authority or semantic acceptance
- End-to-end proof covering material, authority, semantic, workflow, projection, reproduction, security, migration, and adapter-boundary scenarios
- Read-only architecture-source discovery and repository-contract verification

The TypeScript package does not implement adapter inspection, composite external revisions, adapter change cursors, adapter idempotency, adapter lost-response reconciliation, Guerilla hook dispatch, network services, databases, brokers, archive extraction, or generated-code execution.

The Python wheel does not package `docs/architecture/`. Installed wheels import and report the hook package version, while architecture-source discovery remains explicitly repository-checkout-only.

## Architecture Sources

Immutable architecture sources: `docs/architecture/`

- Markdown architecture documents
- 26 JSON Schema 2020-12 schemas in `docs/architecture/schemas/`
- JSON examples in `docs/architecture/examples/`
- `docs/architecture/SOURCE_MANIFEST.json` -- SHA-256 integrity manifest

Working mirrors: `schemas/`, `examples/`

## Completion Reports

Completion evidence lives under `docs/completion_reports/`. Reports must cite actual command results only.

## Agent Governance

- `AGENTS.md` -- root agent governance
- `docs/orientation/` -- mutable pass-start controls
- `.agents/skills/` -- focused skill documents
