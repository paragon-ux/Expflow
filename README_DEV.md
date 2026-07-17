# Expflow Developer Guide

**Gate D -- Hardened and Proven.** Local material-core runtime behavior is implemented for the four ordinary commands. Gate C ownership and reproduction behavior is implemented through library runtimes for authority, semantics, workflows, projections, regeneration/equivalence, and reuse. Gate D adds local security controls, migration evidence, package hardening, and end-to-end proof.

Adapter inspection/reconciliation, hook dispatch, network services, databases, brokers, and generated-code execution remain out of scope.

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
python -m build --wheel
python tests/contracts/verify_python_wheel.py
```

### Full Local Validation Sequence

```bash
npm run validate
python -m pip install -e ".[dev]"
python -m pytest
python -m build --wheel
python tests/contracts/verify_python_wheel.py
```

## Current TypeScript Runtime Boundary

The TypeScript package implements:

- Package version reporting (`0.0.0-gate-d`)
- CLI handlers for `expflow init`, `expflow sync`, `expflow status`, and `expflow restore`
- Local `.expflow/` material storage with immutable objects, node revisions, tree revisions, operation receipts, validations, changes, and material head state
- Working-tree scanning with `.expflow/**` exclusion and scoped path selectors
- Same-path continuity, explicit `preserve`, `new`, and `replace` directives, and digest-similarity proposals without identity preservation
- Local transaction locking, validation receipts, partial post-commit material success status, receipt/head recovery checks, and restore-source reads
- A narrow extension host that invokes native operations and reads schema-shaped committed records without raw store exports
- Authority-source revisions, source-registration decisions, readable authority documents, current-source projection, and scope-conflict checks
- Semantic assertions, semantic decisions, conflicts, review requests, source correspondence, artifact clusters, and semantic change listing
- Workflow occurrences, virtual artifacts, materialization events, and immutable workflow state transitions
- Manifest revisions, projection-head derivation, projection-root constraints, and model-assisted proposal defaults
- Regeneration attempts, equivalence evaluations, reuse results, and reuse policy-gate checks
- Security controls for archive quarantine manifests, source instruction/data separation, secret redaction, local-only remote disclosure policy, generated-code non-execution, and reuse license restrictions
- Migration evidence for in-place typed-folder projects without fabricating authority or semantic acceptance
- End-to-end proof covering material, authority, semantic, workflow, projection, reproduction, security, migration, and adapter-boundary scenarios
- Read-only architecture-source discovery and repository-contract verification

The TypeScript package does not implement adapter inspection, composite external revisions, adapter change cursors, adapter idempotency, adapter lost-response reconciliation, hook dispatch, network services, databases, brokers, archive extraction, or generated-code execution.

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
