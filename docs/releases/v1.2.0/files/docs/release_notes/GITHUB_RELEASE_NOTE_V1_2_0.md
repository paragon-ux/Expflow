# Expflow v1.2.0 — Actor-Ambivalent Workflow Control

CLI and GUI are peer interfaces over one application command service.
Every durable GUI action has an equivalent CLI operation.

## New in v1.2.0

- **Application command service** (`src/application/`) — plan/apply/receipt lifecycle with deterministic plan tokens
- **Actor metadata model** — `human`, `agent`, `CI`, `service`, `tool`, `unknown`
- **Capability discovery** — `expflow capabilities --json` CLI and `GET /api/capabilities` GUI endpoint
- **Automation flags** — `--yes` and `--non-interactive` for scripted/CI usage
- **Nine command families** — project, material, workflow, evidence, authority, conflicts, decisions, package, reporting

## Installation

```bash
npm install -g expflow
expflow --version   # 1.2.0
expflow-gui         # http://127.0.0.1:4173
```

## Python

`expflow-hooks` intentionally stays at `v1.1.0`. No Python-package changes in this release.

## Artifacts

- npm: `expflow@1.2.0`
- GitHub Release: `v1.2.0` with checksums, manifest, and provenance attestation
