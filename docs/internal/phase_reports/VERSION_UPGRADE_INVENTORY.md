# Version Upgrade Inventory — v1.1.0 Closeout

**Date:** 2026-07-21
**Source version:** `1.0.1` (published implementation baseline)
**Candidate version:** `1.1.0` (release candidate)
**Integration head:** `feat/build-week-integration`
**Verdict:** release candidate validated; ready for PR review

## Executed Changes

### Authoritative version bump

| File                               | From                    | To                                                          |
| ---------------------------------- | ----------------------- | ----------------------------------------------------------- |
| `package.json`                     | `"version": "1.0.1"`    | `"version": "1.1.0"`                                        |
| `package-lock.json`                | `1.0.1`                 | `1.1.0` (regenerated via `npm install --package-lock-only`) |
| `src/core/version.ts`              | `VERSION = '1.0.1'`     | `VERSION = '1.1.0'`                                         |
| `pyproject.toml`                   | `version = "1.0.1"`     | `version = "1.1.0"`                                         |
| `python/expflow_hooks/__init__.py` | `__version__ = "1.0.1"` | `__version__ = "1.1.0"`                                     |

### Test assertions updated

| File                                     | From                                   | To                                     |
| ---------------------------------------- | -------------------------------------- | -------------------------------------- |
| `tests/unit/version.test.ts`             | `expect(VERSION).toBe('1.0.1')`        | `expect(VERSION).toBe('1.1.0')`        |
| `tests/contracts/verify_python_wheel.py` | `1.0.1`                                | `1.1.0`                                |
| `python/tests/test_scaffold.py`          | `expflow_hooks.__version__ == "1.0.1"` | `expflow_hooks.__version__ == "1.1.0"` |

### Release workflow updated

| File                            | Scope                                                                                                                                                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/release.yml` | All 26 references updated: tag, version, notes path, npm/Python assertions, artifact names, checksums, attestation paths, npm publish/verify, PyPI lookup/publish/verify, GitHub Release title/assets |

### Release notes created

| File                                                                          | Purpose                                                                             |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `docs/releases/v1.1.0/files/docs/release_notes/GITHUB_RELEASE_NOTE_V1_1_0.md` | v1.1.0 GitHub Release note with Phase 1–7 contents, GUI boundary, pilot limitations |

### Documentation corrections

| File                                                  | Change                                                                             |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md`        | Baseline restored to `v1.0.1` (Phases were built from v1.0.1)                      |
| `docs/internal/CURRENT_STATUS_MATRIX.md`              | Added `Release candidate: v1.1.0`; BW-D status set to BLOCKED; Phase 8 is deferred |
| `docs/internal/phase_prompts/PHASE_01_UX_UI_FIXES.md` | Baseline restored to `v1.0.1`                                                      |
| `CHANGELOG.md`                                        | v1.0.1 entry restored; genuine v1.1.0 section added with Phase 1–7 contents        |
| `README.md`                                           | Release note links corrected to `GITHUB_RELEASE_NOTE_V1_1_0.md`                    |

### Tooling fix

| File                             | Change                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------- |
| `tools/check-skill-contracts.ts` | Legacy prefix restored to `docs/releases/v1.0.1/files/` (frozen release location) |

### GUI boundary

| Decision                | Implementation                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------- |
| GUI is repository-local | `apps/gui/` excluded from npm `files`; `gui:serve` script removed from package.json |
| GUI not in npm          | `package:verify` enforces this boundary                                             |
| Follow-up               | GUI distribution deferred to `v1.1.1` as a packaging correction                     |

### Preserved (not updated)

All `docs/releases/v1.0.1/**`, historical phase reports, protected surface fixtures, and frozen release evidence remain unchanged.

## Validation Results

| Command                            | Result                                          |
| ---------------------------------- | ----------------------------------------------- |
| `npm run validate`                 | PASS — 22 files / 176 tests                     |
| `npm run build`                    | PASS                                            |
| `npm run package:verify`           | PASS — installs outside checkout, reports 1.1.0 |
| `npm pack --dry-run`               | `expflow-1.1.0.tgz`, 292 files                  |
| `npm run check:config-references`  | PASS                                            |
| `npm run check:skill-contracts`    | PASS                                            |
| `npm run check:protected-surfaces` | PASS                                            |
| `git diff --check`                 | PASS (historical trailing whitespace only)      |
| `git status --short`               | Clean                                           |

## Unresolved Blockers

None. Ready for PR review.
