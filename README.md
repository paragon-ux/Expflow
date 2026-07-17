# Expflow

Expflow is a local-first workflow ownership and observability platform for projects where people, agents, and tools produce changing artifact trees.

It preserves the relationship between:

- material files before and after a workflow run;
- authority sources accepted for that work;
- attributed claims, decisions, conflicts, and review requests;
- workflow inputs, outputs, projections, regeneration attempts, equivalence evaluations, and reuse evidence.

The goal is practical ownership of automated work: a project should be able to show what changed, why it changed, what evidence was trusted, what decisions remain durable, and which parts can be inspected, regenerated, restored, or reused.

## Current Availability

Expflow is in a pre-release Gate D hardened-proof phase. This repository provides immutable architecture sources, schemas, examples, validation harnesses, a local TypeScript material runtime, Gate C library runtimes for authority, semantic ownership, workflow boundaries, projections, regeneration/equivalence, and structural reuse, plus Gate D security, migration, and end-to-end proof surfaces.

The runtime can initialize a project, scan the working tree, persist immutable material records under `.expflow/`, commit complete tree revisions, report drift, restore prior tree or node revisions, register authority-source revisions with immutable decisions, derive current accepted authority sources, record semantic/workflow/projection/reproduction record families, validate security boundaries, record migration evidence, and expose a narrow extension host.

It does not implement adapter inspection, adapter change cursors, external idempotency, adapter lost-response reconciliation, hook dispatch, network services, database-backed storage, or archive/code execution.

## Command Surface

Expflow keeps a small everyday interface:

```text
expflow init
expflow sync
expflow status
expflow restore
```

These commands are operational for local material-core behavior and intentionally remain the only ordinary commands. Gate C ownership/reproduction behavior and Gate D security/migration behavior are exposed through library runtimes, not additional ordinary commands.

## Repository Map

- `docs/architecture/` contains immutable architecture sources.
- `docs/` contains mutable implementation evidence, phase prompts, completion reports, and orientation.
- `schemas/` and `examples/` mirror the architecture schemas and examples for tooling.
- `src/` contains the TypeScript package, CLI, material runtime, Gate C library runtimes, Gate D security/migration runtimes, and contract tooling.
- `python/expflow_hooks/` contains the Python hook-package scaffold and repository-only schema discovery.
- `tests/` contains repository-contract, material-runtime, authority, Gate C ownership/reproduction, Gate D security/migration, and end-to-end proof tests.

For implementation status, see [docs/CURRENT_STATUS_MATRIX.md](docs/CURRENT_STATUS_MATRIX.md). For setup and validation commands, see [README_DEV.md](README_DEV.md).

## Development Snapshot

The current package version is `0.0.0-gate-d`. It is suitable for local validation and PR review, not production use.

```bash
npm ci
python -m pip install -e ".[dev]"
npm run validate
python -m pytest
```

## License

UNLICENSED. This repository is not yet released for production use.
