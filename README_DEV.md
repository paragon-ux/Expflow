# Expflow Developer Guide

**Phase 1 / Gate A — Contract Ready.** No product runtime is implemented.

## Prerequisites

- Node.js >= 20
- npm >= 10
- Python >= 3.11
- Git

## Setup

```bash
# Clone and enter branch
git clone https://github.com/paragon-ux/Expflow.git
cd Expflow
git checkout feature/expflow-phase-1-kickoff

# Node dependencies
npm ci

# Python development install
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
npm test              # Node repository-contract tests
python -m pytest      # Python repository-contract tests
```

### Contract Verification

```bash
npm run contracts:verify       # Source integrity verification
npm run schemas:meta-validate  # Schema meta-validation (Draft 2020-12)
npm run examples:index-check   # Example discoverability index check
```

### Build

```bash
npm run build                # TypeScript build
python -m build --wheel      # Python wheel build
```

### Package Verification

```bash
npm run package:verify       # Build, pack, install outside checkout, verify CLI and export
```

### External Package Verification

```bash
# npm package (outside checkout)
npm run package:verify

# Python wheel (outside checkout; verifies version, no top-level tests package,
# and the explicit repository-only architecture discovery boundary)
python tests/contracts/verify_python_wheel.py
```

### Full Local Validation Sequence

```bash
# Node validation
npm run format:check
npm run lint
npm run typecheck
npm test
npm run contracts:verify
npm run schemas:meta-validate
npm run examples:index-check
npm run build
npm run package:verify

# Python validation
python -m pip install -e ".[dev]"
python -m pytest
python -m build --wheel
python tests/contracts/verify_python_wheel.py
```

## Phase 1 No-Runtime Boundary

The TypeScript and Python packages in Phase 1 implement only:

- Package version reporting (`0.0.0-phase.1`)
- CLI `--help` and `--version` handling
- Read-only architecture-source discovery from an editable repository checkout
- Read-only repository-contract verification

No material scanning, storage, mutation, persistence, network access, hook execution, or domain algorithms exist. Repository-contract tests verify this boundary.

The Python wheel does not package `docs/architecture/`. Installed wheels import and report the contract version, while architecture-source discovery is explicitly repository-checkout-only in Phase 1.

## Architecture Sources

Immutable architecture sources: `docs/architecture/`

- 8 Markdown architecture documents
- 1 review-resolution architecture document
- 26 JSON Schema 2020-12 schemas in `docs/architecture/schemas/`
- 18 JSON examples in `docs/architecture/examples/`
- `docs/architecture/SOURCE_MANIFEST.json` — SHA-256 integrity manifest

Working mirrors (byte-for-byte copies): `schemas/`, `examples/`

## Documentation Skeletons

Phase 1 establishes governance skeletons under `docs/`. All contain the deferral statement:

> Substantive content is intentionally deferred to the owning later phase.

## Completion Report

`docs/completion_reports/PHASE_01_COMPLETION_REPORT.md`

## Agent Governance

- `AGENTS.md` — root agent governance
- `.agents/skills/` — five focused skill documents (control documents only)
