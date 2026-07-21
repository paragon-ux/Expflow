[![CI](https://github.com/paragon-ux/Expflow/actions/workflows/phase-1-contract.yml/badge.svg)](https://github.com/paragon-ux/Expflow/actions/workflows/phase-1-contract.yml)

# Expflow

Expflow is a schema-governed, local-first workflow ownership and observability platform for projects where people, agents, and tools produce changing artifact trees.

Expflow records what changed, which evidence was trusted, which decisions remain durable, and which outputs can be inspected, regenerated, restored, or reused.

Current release:
[`v1.0.1`](docs/releases/v1.0.1/files/docs/release_notes/GITHUB_RELEASE_NOTE_V1_0_1.md).

## What Expflow Tracks

Expflow separates five concerns that are often blurred in automated work:

- material files before and after workflow activity;
- accepted authority sources for the work;
- attributed claims, decisions, conflicts, and review requests;
- workflow inputs, outputs, projections, regeneration attempts, equivalence evaluations, and reuse evidence;
- local security, migration, package, and proof evidence.

Material output does not imply semantic acceptance, workflow completion, or reuse permission. Expflow keeps those records separate.

## Release Scope

Expflow v1.0.1 covers the local core surfaces implemented in this repository:

- four ordinary commands: `expflow init`, `expflow sync`, `expflow status`, and `expflow restore`;
- local `.expflow/` material storage with immutable object, node-revision, tree-revision, receipt, validation, change, and material-head records;
- complete-tree sync, drift status, tree/node restore, scoped path selection, explicit identity directives, and digest-similarity proposals without silent identity preservation;
- project locks, operation-scoped staging, recoverable init/restore intents, stale-lock classification, causal tree/receipt head repair, restore recovery, and restored-tree digest verification;
- library runtimes for authority sources, semantic decisions, workflow boundaries, projections, regeneration/equivalence, structural reuse, security controls, migration evidence, and the native extension host;
- repository-contract checks for immutable architecture sources, schemas, examples, fixtures, registries, package boundaries, and end-to-end proof.

## Quickstart

With the npm package available from the public registry:

```bash
npm install -g expflow
expflow init
expflow status
```

The npm package exposes the `expflow` CLI and TypeScript library exports. The Python package is a separate hook scaffold with read-only repository architecture discovery; it does not dispatch or execute hooks.

## Installation

After verified registry publication, install the primary Expflow CLI and TypeScript package with:

```bash
npm install -g expflow
```

Install the Python hook scaffold separately with:

```bash
pip install expflow-hooks
```

`expflow-hooks` is not the primary Expflow CLI implementation. It exposes the limited Python hook/scaffold package and `expflow_hooks` import surface.

## Workflow

1. Run `expflow init` to create local Expflow state.
2. Change files in the project tree.
3. Run `expflow sync` to record a complete material tree revision.
4. Run `expflow status` to inspect drift and recorded state.
5. Run `expflow restore` when a recorded tree or node revision should be restored.

Gate C ownership/reproduction behavior and Gate D security/migration behavior are available through library runtimes rather than additional ordinary commands.

## Commands

| Command           | Purpose                                                             |
| ----------------- | ------------------------------------------------------------------- |
| `expflow init`    | Initialize local Expflow project state.                             |
| `expflow sync`    | Scan the working tree and commit a complete material tree revision. |
| `expflow status`  | Report local drift and material project state.                      |
| `expflow restore` | Restore a recorded material tree or node revision.                  |

## What Expflow Delegates

Expflow core intentionally does not implement every surrounding integration surface.

- **Adapter inspection and reconciliation:** belongs in separately versioned adapter packages.
- **External revision cursors and idempotency:** outside the core repository.
- **Guerilla hook dispatch:** compatibility reference only, not an Expflow core runtime.
- **Network services, databases, and brokers:** absent from the local core.
- **Archive extraction and generated-code execution:** blocked by the Gate D security posture.
- **Pilots and empirical evaluation:** future work outside the v1.0.1 core release.

## Repository Map

- `docs/architecture/` contains immutable architecture sources.
- `docs/internal/` contains current Build Week governance, status, prompts, and activation records.
- `docs/external/` contains current product overviews and narratives.
- `docs/releases/v1.0.1/` contains the frozen v1.0.1 release documentation record.
- `schemas/` and `examples/` mirror the architecture schemas and examples for tooling.
- `src/` contains the TypeScript package, CLI, material runtime, Gate C library runtimes, Gate D security/migration runtimes, and contract tooling.
- `python/expflow_hooks/` contains the Python hook-package scaffold and repository-only schema discovery.
- `tests/` contains repository-contract, material-runtime, authority, Gate C ownership/reproduction, Gate D security/migration, package, and end-to-end proof tests.

For implementation status, see
[docs/internal/CURRENT_STATUS_MATRIX.md](docs/internal/CURRENT_STATUS_MATRIX.md). For contributor setup
and validation commands, see [README_DEV.md](README_DEV.md).

## Validation

```bash
npm ci
npm run validate
python -m pip install -e ".[dev]"
python -m pytest
python -m build --wheel
python tests/contracts/verify_python_wheel.py
```

## Documentation

- [v1.0.1 GitHub release note](docs/releases/v1.0.1/files/docs/release_notes/GITHUB_RELEASE_NOTE_V1_0_1.md)
- [v1 compatibility promise](docs/releases/v1.0.1/files/docs/V1_COMPATIBILITY.md)
- [Release publishing checklist](docs/releases/v1.0.1/files/docs/RELEASE_PUBLISHING.md)
- [Current status matrix](docs/internal/CURRENT_STATUS_MATRIX.md)
- [Developer guide](README_DEV.md)
- [Security policy](SECURITY.md)

## License

Expflow is released under the [MIT License](LICENSE).
