# Expflow

Expflow is a local-first workflow ownership and observability platform for projects where people, agents, and tools produce changing artifact trees.

It is designed to preserve the relationship between:

- the material files that existed before and after a workflow run;
- the authority sources that were accepted for that work;
- the attributed claims, decisions, conflicts, and review requests created along the way;
- the workflow inputs, outputs, projections, regeneration attempts, and reuse evidence that explain how an artifact was produced.

The goal is practical ownership of automated work: a project should be able to show what changed, why it changed, what evidence was trusted, what decisions remain durable, and which parts can be safely inspected, regenerated, restored, or reused.

## Current Availability

Expflow is in a pre-release material-core phase. This repository provides architecture sources, schemas, examples, validation harnesses, and a local TypeScript material runtime.

The Gate B runtime can initialize a project, scan the working tree, persist immutable material records under `.expflow/`, commit complete tree revisions, report drift, restore prior tree or node revisions, and expose a narrow extension host. It does not implement adapter inspection, change cursors, external idempotency, reconciliation, authority decisions, semantic stores, workflow detection, projections, hook dispatch, network services, or database-backed storage.

## Planned Command Surface

Expflow is intentionally built around a small everyday interface:

```text
expflow init
expflow sync
expflow status
expflow restore
```

These commands are operational for local material-core behavior in Gate B. They intentionally remain the only ordinary commands.

## What Is In This Repository

- `docs/architecture/` contains the immutable architecture sources for the current contract.
- `schemas/` and `examples/` mirror the published architecture schemas and examples.
- `src/` contains the TypeScript package, CLI, local material runtime, and read-only contract tooling.
- `python/expflow_hooks/` contains the Python hook-package scaffold and repository-only schema discovery.
- `tests/` contains repository-contract checks and Gate B material-runtime tests.

For implementation status, see [docs/CURRENT_STATUS_MATRIX.md](docs/CURRENT_STATUS_MATRIX.md). For contributor setup and validation commands, see [README_DEV.md](README_DEV.md).

## Development Snapshot

The current package version is `0.0.0-gate-b`. It can be installed locally for material-core validation and package-boundary checks, not for production use.

```bash
npm ci
python -m pip install -e ".[dev]"
npm run validate
python -m pytest
```

## License

UNLICENSED. This repository is not yet released for production use.
