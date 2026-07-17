# Expflow Developer Guide

**Gate B -- Material Core.** Local material-core runtime behavior is implemented for the four ordinary commands. Adapter inspection/reconciliation and Gate C semantic/projection behavior remain out of scope.

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
npm run format        # Auto-fix formatting
npm run format:check  # Check only
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
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

## Gate B Runtime Boundary

The TypeScript package implements:

- Package version reporting (`0.0.0-gate-b`)
- CLI handlers for `expflow init`, `expflow sync`, `expflow status`, and `expflow restore`
- Local `.expflow/` material storage with immutable objects, node revisions, tree revisions, operation receipts, validations, changes, and material head state
- Working-tree scanning with `.expflow/**` exclusion
- Path-selector roots for scoped scans and scoped material planning
- Same-path continuity, explicit `preserve`, `new`, and `replace` directives, and digest-similarity proposals without identity preservation
- Local transaction locking, validation receipts, partial post-commit material success status, receipt/head recovery checks, and restore-source reads
- Tree restore reconciles files absent from the restored tree before advancing the material head
- A narrow extension host that invokes native operations and reads schema-shaped committed records without raw store exports
- Read-only architecture-source discovery and repository-contract verification

The TypeScript package does not implement adapter inspection, composite external revisions, change cursors, adapter idempotency, lost-response reconciliation, authority decisions, semantic stores, workflow detection, projections, hook dispatch, network services, databases, or brokers. Repository-contract tests verify this boundary.

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
