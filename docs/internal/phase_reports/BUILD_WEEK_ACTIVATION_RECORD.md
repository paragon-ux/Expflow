# Build Week Activation Record

**Date:** 2026-07-20  
**Repository branch:** `main`  
**Repository commit:** `ba7292e9616a055ed5e25da8734c2b49a9f66ec9`  
**Baseline:** Expflow v1.0.1  
**Activation result:** PASS

## Scope

This activation installed Build Week documentation governance and evidence only. It did not begin Phase 1 implementation.

Runtime source, immutable architecture, schemas, registries, tests, release metadata, package metadata, README_DEV, SECURITY, `.github/`, Python package metadata, and Python source remained unchanged. The root product README was preserved as the product overview and edited only to retarget active/frozen documentation links.

## Freeze And Provenance

| Item                              | Result                                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| Release source ref                | `v1.0.1`                                                                                           |
| Release source commit             | `ba7292e9616a055ed5e25da8734c2b49a9f66ec9`                                                         |
| Current file match to release ref | PASS - `HEAD` equals `v1.0.1`; tracked diff against the release ref was empty before activation.   |
| Frozen archive path               | `docs/releases/v1.0.1/`                                                                            |
| Freeze manifest                   | `docs/releases/v1.0.1/MANIFEST.md`                                                                 |
| Freeze manifest hash verification | PASS - 111 manifest entries verified.                                                              |
| Frozen archive authority          | Historical release provenance only; excluded from active Build Week source-of-truth order.         |
| Immutable architecture handling   | `docs/architecture/` left unchanged and represented by canonical path/hash in the freeze manifest. |

## Pre-Activation Inventory

| Item                                                                | Result                                                                                                  |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Pre-activation manifest                                             | `docs/internal/phase_reports/BUILD_WEEK_PRE_ACTIVATION_MANIFEST.md`                                     |
| Imported package/evidence files hashed before governance activation | 505 files                                                                                               |
| Pre-existing root evidence preserved                                | `Expflow-Test/build-week-inputs/`                                                                       |
| Pre-existing tracked working tree                                   | Clean before activation; only untracked `Expflow-Build-Week-Package/` and `Expflow-Test/` were present. |

## Governance Activation

| Item                          | Result                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| Root `AGENTS.md`              | Merged with Build Week governance and repository-specific validation controls retained. |
| Current workflow path         | `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md`                                          |
| Current status path           | `docs/internal/CURRENT_STATUS_MATRIX.md`                                                |
| Current glossary path         | `docs/internal/GLOSSARY.md`                                                             |
| Current directory policy path | `docs/internal/REPOSITORY_DIRECTORY_STRUCTURE.md`                                       |
| Activation checklist path     | `docs/internal/REPOSITORY_ACTIVATION_CHECKLIST.md`                                      |
| Active phase prompt           | `docs/internal/phase_prompts/PHASE_01_UX_UI_FIXES.md`                                   |
| Current authorized phase      | Phase 1 - Ordinary UX/UI Corrections only                                               |
| Product root README           | Preserved in place; active/frozen documentation links retargeted.                       |
| Build Week package index      | Installed at `docs/build-week/README.md`.                                               |
| Documentation update report   | Installed at `docs/build-week/DOCUMENTATION_UPDATE_REPORT.md`.                          |

## Legacy Document Handling

Mutable legacy v1.0.1 documentation was removed from the active documentation tree after
frozen-copy verification. No top-level legacy current-control documents remain outside the
frozen release archive.

| Legacy surface                        | Result                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------- |
| Top-level v1 model/control docs       | Removed from active docs; frozen copies live under `docs/releases/`.    |
| `docs/completion_reports/`            | Removed from active docs; frozen copies live under `docs/releases/`.    |
| `docs/orientation/`                   | Removed from active docs; frozen copies live under `docs/releases/`.    |
| `docs/release_notes/`                 | Removed from active docs; frozen copies live under `docs/releases/`.    |
| `docs/reviews/`                       | Removed from active docs; frozen copies live under `docs/releases/`.    |
| `docs/README.md`                      | Updated as current active documentation navigation.                     |
| Root `README.md` release/status links | Updated to point to `docs/internal/` or frozen `docs/releases/v1.0.1/`. |

## Evidence Merge

| Item                                       | Result                                                               |
| ------------------------------------------ | -------------------------------------------------------------------- |
| Source                                     | `Expflow-Build-Week-Package/Expflow-Test/`                           |
| Target                                     | `Expflow-Test/`                                                      |
| Merge mode                                 | Non-destructive, collision-aware.                                    |
| Files copied                               | 447                                                                  |
| Existing same-path files hash-matched      | 0                                                                    |
| Existing `Expflow-Test/build-week-inputs/` | Preserved.                                                           |
| Flattened `Kimi Meta-Review/`              | No.                                                                  |
| Moved sandbox fixtures                     | No.                                                                  |
| Edited report bodies                       | No.                                                                  |
| After-merge evidence inventory             | `docs/internal/phase_reports/BUILD_WEEK_EVIDENCE_AFTER_INVENTORY.md` |
| After-merge root evidence files            | 449                                                                  |

## Required Path Verification

| Path                                                             | Result |
| ---------------------------------------------------------------- | ------ |
| `AGENTS.md`                                                      | PASS   |
| `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md`                   | PASS   |
| `docs/internal/CURRENT_STATUS_MATRIX.md`                         | PASS   |
| `docs/internal/GLOSSARY.md`                                      | PASS   |
| `docs/internal/REPOSITORY_DIRECTORY_STRUCTURE.md`                | PASS   |
| `docs/internal/REPOSITORY_ACTIVATION_CHECKLIST.md`               | PASS   |
| `docs/internal/phase_prompts/PHASE_01_UX_UI_FIXES.md`            | PASS   |
| `docs/external/overviews/`                                       | PASS   |
| `docs/external/narratives/`                                      | PASS   |
| `docs/build-week/README.md`                                      | PASS   |
| `docs/build-week/DOCUMENTATION_UPDATE_REPORT.md`                 | PASS   |
| `docs/releases/v1.0.1/README.md`                                 | PASS   |
| `docs/releases/v1.0.1/MANIFEST.md`                               | PASS   |
| `Expflow-Test/Kimi Meta-Review/REVIEWS_INDEX.md`                 | PASS   |
| `Expflow-Test/Kimi Meta-Review/REVIEW_DISPOSITION_MATRIX.md`     | PASS   |
| `Expflow-Test/Kimi Meta-Review/IMPLEMENTATION_FINDINGS.md`       | PASS   |
| `Expflow-Test/Kimi Meta-Review/DOCUMENTATION_CHANGE_REQUESTS.md` | PASS   |
| `Expflow-Test/Kimi Meta-Review/BATCH_PROCESSING_REPORT.md`       | PASS   |
| `Expflow-Test/sandboxes/kimi-v1.0.1-reverification/`             | PASS   |

## Historical Workflow Conflict Result

PASS. Active governance now points to `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md`. No mutable active document directs implementers to continue historical Gate D as the current workflow. Remaining Gate D references are historical, completed v1 evidence, release-scope statements, supersession notes, or prohibited-name notes.

Excluded from active conflict authority by design:

- `docs/releases/v1.0.1/`
- `docs/architecture/`
- `Expflow-Test/`
- `Expflow-Build-Week-Package/`

## Validation Evidence

| Command or check                                               | Exit code | Result | Notes                                                                                                                                  |
| -------------------------------------------------------------- | --------: | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                                                       |         0 | PASS   | Clean dependency installation.                                                                                                         |
| `npm run format:check`                                         |         0 | PASS   | Final formatter check passed after formatting active docs.                                                                             |
| `npm run validate`                                             |         0 | PASS   | Covers format, lint, typecheck, tests, contracts, registries, schemas, examples, fixtures, TypeScript build, and package verification. |
| `git diff --check -- ':!docs/architecture/**'`                 |         0 | PASS   | Whitespace check passed; Git reported line-ending normalization warnings only.                                                         |
| `npm pack --dry-run`                                           |         0 | PASS   | Package preview produced `expflow-1.0.1.tgz`.                                                                                          |
| `npx prettier --check .github/workflows/release.yml`           |         0 | PASS   | Release workflow formatting passed.                                                                                                    |
| `python -m pip install -e ".[dev]"`                            |         0 | PASS   | Editable Python package install succeeded.                                                                                             |
| `python -m pytest`                                             |         0 | PASS   | 9 Python tests passed.                                                                                                                 |
| `python -m build`                                              |         0 | PASS   | Python sdist and wheel built.                                                                                                          |
| `python tests/contracts/verify_python_wheel.py`                |         0 | PASS   | Wheel imports outside checkout and reports 1.0.1.                                                                                      |
| `npm run clean; python -m build; python -m twine check dist/*` |         0 | PASS   | Clean Python dist and Twine metadata check passed.                                                                                     |
| Clean CLI `init -> sync -> status -> restore` transcript       |         0 | PASS   | See `docs/internal/phase_reports/BUILD_WEEK_CLI_BASELINE_TRANSCRIPT.txt`.                                                              |
| Archive manifest hash verification                             |         0 | PASS   | 111 entries verified.                                                                                                                  |

## Unchanged-Surface Verification

`git diff --name-only -- docs/architecture schemas registries tests src package.json package-lock.json README_DEV.md SECURITY.md .github pyproject.toml python` returned no paths after activation and validation.

Root `README.md` changed only to retarget release/status/navigation links from moved legacy docs to `docs/internal/` and `docs/releases/v1.0.1/`.

## Final Decision

PASS. Repository-root Build Week governance is active and unambiguous. Phase 1 is build-ready, but Phase 1 implementation has not started and is not claimed complete.
