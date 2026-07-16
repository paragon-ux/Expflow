# Expflow

**Schema-governed, local-first workflow ownership and observability platform.**

Expflow versions complete material trees, registers extensible authority sources, records attributed semantic assertions and immutable decisions, defines explicit workflow input/output boundaries, manages deterministic and model-assisted projections, and evaluates regeneration, equivalence, and structural reuse — through a deliberately small ordinary command surface.

## Status

**Phase 1 / Gate A — Contract Ready.** No product runtime is implemented.

The four ordinary commands are specified but not yet operational:

```text
expflow init       (not implemented in Phase 1)
expflow sync       (not implemented in Phase 1)
expflow status     (not implemented in Phase 1)
expflow restore    (not implemented in Phase 1)
```

## Requirements

- **Node.js** >= 20
- **Python** >= 3.11
- **npm** (lockfile included)

## Quick Start

```bash
# Install dependencies
npm ci
python -m pip install -e ".[dev]"

# Run full Phase 1 validation
npm run validate
python -m pytest
```

## Architecture Sources

Immutable architecture sources live under `docs/architecture/`. Their byte-for-byte integrity is verified by `docs/architecture/SOURCE_MANIFEST.json`.

- 8 architecture Markdown documents
- 26 JSON Schema 2020-12 schemas
- 18 JSON examples

## Completion Report

[Phase 1 Completion Report](docs/completion_reports/PHASE_01_COMPLETION_REPORT.md)

## License

UNLICENSED — this repository is in a pre-release architecture phase.
