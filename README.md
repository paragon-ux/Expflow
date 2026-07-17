# Expflow

Expflow is a schema-governed, local-first workflow ownership and observability platform for projects where people, agents, and tools produce changing artifact trees.

It records the relationship between:

- material files before and after workflow activity;
- accepted authority sources for the work;
- attributed claims, decisions, conflicts, and review requests;
- workflow inputs, outputs, projections, regeneration attempts, equivalence evaluations, and reuse evidence.

The goal is practical ownership of automated work: a project should be able to show what changed, why it changed, what evidence was trusted, what decisions remain durable, and which parts can be inspected, regenerated, restored, or reused.

## v1.0.0 Release Scope

Expflow v1.0.0 is release-candidate-ready for the local core surfaces implemented in this repository:

- the four ordinary commands: `expflow init`, `expflow sync`, `expflow status`, and `expflow restore`;
- local `.expflow/` material storage with immutable object, node-revision, tree-revision, receipt, validation, and change records;
- complete-tree sync, drift status, tree/node restore, scoped path selection, explicit identity directives, and digest-similarity proposals without silent identity preservation;
- project locks, operation-scoped staging, recoverable init/restore intents, stale-lock classification, causal tree/receipt head repair, and restore recovery;
- library runtimes for authority sources, semantic decisions, workflow boundaries, projections, regeneration/equivalence, structural reuse, security controls, and migration evidence;
- repository-contract checks for immutable architecture sources, schemas, examples, fixtures, registries, package boundaries, and end-to-end proof.

The core intentionally does not implement adapter inspection, adapter change cursors, external idempotency, adapter lost-response reconciliation, Guerilla hook dispatch, network services, database-backed storage, brokers, archive extraction, or generated-code execution.

## Install From Source

```bash
git clone https://github.com/paragon-ux/Expflow.git
cd Expflow
npm ci
npm run build
python -m pip install -e ".[dev]"
```

The npm package exposes the `expflow` CLI and TypeScript library exports after `npm run build`. The Python package is a hook scaffold with read-only repository architecture discovery; it does not dispatch or execute hooks.

## Command Surface

Expflow keeps a small everyday interface:

```text
expflow init
expflow sync
expflow status
expflow restore
```

These commands operate on local material-core behavior. Gate C ownership/reproduction behavior and Gate D security/migration behavior are available through library runtimes rather than additional ordinary commands.

## Repository Map

- `docs/architecture/` contains immutable architecture sources.
- `docs/` contains mutable implementation evidence, phase prompts, completion reports, release evidence, and orientation.
- `schemas/` and `examples/` mirror the architecture schemas and examples for tooling.
- `src/` contains the TypeScript package, CLI, material runtime, Gate C library runtimes, Gate D security/migration runtimes, and contract tooling.
- `python/expflow_hooks/` contains the Python hook-package scaffold and repository-only schema discovery.
- `tests/` contains repository-contract, material-runtime, authority, Gate C ownership/reproduction, Gate D security/migration, package, and end-to-end proof tests.

For implementation status, see [docs/CURRENT_STATUS_MATRIX.md](docs/CURRENT_STATUS_MATRIX.md). For contributor setup and validation commands, see [README_DEV.md](README_DEV.md).

## Validate

```bash
npm ci
npm run validate
python -m pip install -e ".[dev]"
python -m pytest
python -m build --wheel
python tests/contracts/verify_python_wheel.py
```

## License

Expflow is released under the [MIT License](LICENSE).
