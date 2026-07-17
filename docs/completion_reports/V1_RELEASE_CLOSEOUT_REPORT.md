# v1 Release Closeout Report

## Result

PASS -- Expflow v1.0.0 release preparation completed locally

## Release Identity

| Field                  | Value                                      |
| ---------------------- | ------------------------------------------ |
| Release version        | `1.0.0`                                    |
| Branch                 | `codex/gate-d-v1-release-closeout`         |
| Starting head          | `d1dd2ac925b219c50c7728963e908042793c7376` |
| Release classification | `release-ready`                            |
| Tag status             | No tag created                             |
| Publish status         | No package published                       |

The release branch intentionally incorporates the Gate D native hardening closure from PR #7. Tagging, publishing, and merging remain owner-controlled follow-up actions.

## Gate D Durability Status

| Item                                   | Status | Evidence                                                                                                          |
| -------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| F10 receipt-order head rollback        | FIXED  | `npm test` includes causal tree/receipt head repair tests; Gate D completion report records the closure.          |
| DCR-1 causal receipt/head repair       | PASS   | Recovery selects verified causal tree sequence and rejects forked candidates.                                     |
| DCR-2 file durability failures surface | PASS   | Regular file fsync/write failures are not swallowed; directory fsync remains documented best-effort.              |
| DCR-3 recovery convergence             | PASS   | Restore recovery rerun scenario remains covered by material runtime tests.                                        |
| DCR-4 restore intent/tree agreement    | PASS   | Restore recovery refuses mismatched committed tree/intent evidence.                                               |
| DCR-5 honest durability wording        | PASS   | `docs/STORAGE_AND_RECOVERY.md` and Gate D report avoid absolute power-loss guarantees.                            |
| DCR-6 Guerilla boundary closed         | PASS   | No Guerilla hook dispatch, adapter protocols, network, database, broker, cursor, or lost-response behavior added. |

## Legal And License Decision

| Area                   | Status       | Evidence                                                                                                              |
| ---------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| Owner license decision | PASS         | MIT selected by owner for v1.                                                                                         |
| Root license file      | PASS         | `LICENSE` contains MIT license text for Paragon UX.                                                                   |
| npm metadata           | PASS         | `package.json` and `package-lock.json` use `license: MIT`.                                                            |
| Python metadata        | PASS         | `pyproject.toml` uses `license = "MIT"` and includes `LICENSE` in the wheel.                                          |
| Unlicensed metadata    | PASS         | No active package metadata retains `UNLICENSED` or `LicenseRef-UNLICENSED`.                                           |
| Source reuse policy    | PASS         | `UNLICENSED` remains accepted by the default source-reuse allowlist; stricter callers can override `allowedLicenses`. |
| NOTICE                 | NOT REQUIRED | MIT release does not require a NOTICE file for this repository's current metadata posture.                            |

## Package Metadata Changes

- TypeScript package version set to `1.0.0`.
- Python hook package version set to `1.0.0`.
- npm private marker removed for the v1 release.
- Package repository, homepage, issue URL, license, binary, exports, and files metadata are coherent for review.
- Python wheel import verification reports `1.0.0` and confirms top-level tests are excluded.

## Documentation Changes

- `README.md` now presents a CI badge, Expflow v1.0.0 release scope, quickstart, workflow, command table, delegated boundaries, repository map, validation, documentation links, and MIT license.
- `README_DEV.md` now presents v1 release setup and validation.
- `CHANGELOG.md` records v1.0.0 outcomes.
- `docs/release_notes/GITHUB_RELEASE_NOTE_V1_0_0.md` provides standalone text for a GitHub release.
- `SECURITY.md` records supported versions, reporting expectations, and local-first security posture.
- `CONTRIBUTING.md` records branch, validation, architecture-source, and scope-boundary rules.
- `docs/CURRENT_STATUS_MATRIX.md`, `docs/TEST_MATRIX.md`, and `docs/README.md` were updated for release-closeout status.
- `docs/CODEX_BUILD_PLAN.md`, `docs/phase_prompts/`, and `docs/external_references/GUERILLA_UNIVERSAL_HOOK_BOUNDARY.md` were removed from tracking as internal build artifacts during final release hygiene. Immutable architecture references to these paths remain unchanged per AGENTS.md §6.
- No `CODE_OF_CONDUCT.md` was added because the owner has not requested a public community contribution posture file.

## PR Review Closure

| Finding                                                                                            | Status | Evidence                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1 status matrix conflated Gate D Phase 16 package evidence with post-Gate-D v1 release metadata   | FIXED  | `docs/CURRENT_STATUS_MATRIX.md` now keeps Gate D Phase 16 on the original `0.0.0-gate-d` package identity and records `1.0.0` MIT metadata as release-closeout evidence.                                            |
| F2 agent governance validation list was narrower than the release-closeout required validation set | FIXED  | `AGENTS.md` now includes registry verification, schema example validation, fixture verification, wheel import verification, and release diff whitespace validation in the current required set and quick reference. |
| F3 README overclaimed production status while the release report needed local-core scoping         | FIXED  | `README.md` now scopes v1.0.0 to implemented local core surfaces.                                                                                                                                                   |
| F4 setuptools lower bound did not guarantee PEP 639 license metadata support                       | FIXED  | `pyproject.toml` now requires `setuptools>=77.0.3` for the SPDX `license` string and `license-files` metadata.                                                                                                      |
| F5 default reuse policy blocked `UNLICENSED` source inputs                                         | FIXED  | `src/security/runtime.ts` now keeps `UNLICENSED` in the default source-reuse allowlist while tests verify explicit policy overrides can still reject it.                                                            |
| F6 README was less readable than the Reqtrace release README                                       | FIXED  | `README.md` now follows the Reqtrace-style badge, current-release, quickstart, workflow, commands, delegation, validation, documentation, and license structure.                                                    |

## Repository Hygiene Audit

| Area                           | Status | Evidence                                                                                                                                        |
| ------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Immutable architecture sources | PASS   | `docs/architecture/**` was not edited; source integrity check passed.                                                                           |
| Generated output               | PASS   | `build/`, `dist/`, wheels, npm tarballs, caches, and `.expflow/` remain ignored/generated.                                                      |
| Local reference state          | PASS   | `.reasonix/` and `build-docs/` are ignored local-only directories.                                                                              |
| Tracked `build-docs/**`        | PASS   | No tracked `build-docs/**` paths remain.                                                                                                        |
| Release-facing docs            | PASS   | No local absolute paths or private scratch links were added to public release docs.                                                             |
| Package surface                | PASS   | npm package verification installs outside checkout and reports `1.0.0`; Python wheel verification imports outside checkout and reports `1.0.0`. |

## Repository Structure Follow-Up

| Item                                | Status | Evidence                                                                                              |
| ----------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| Directory-structure compliance      | PASS   | `build-docs/` and `.reasonix/` are local-only ignored directories with no tracked paths.              |
| Standalone GitHub release note      | PASS   | `docs/release_notes/GITHUB_RELEASE_NOTE_V1_0_0.md` is tracked separately from changelog and reports.  |
| Curated Gate C review evidence      | PASS   | `docs/reviews/PR_5_GATE_C_ARCHITECTURE_REVIEW.md` keeps the historical PR #5 review under reviews.    |
| Curated hardening review evidence   | PASS   | `docs/reviews/GATE_D_HARDENING_REVIEW_SUMMARY.md` preserves release-relevant hardening review status. |
| Curated Guerilla boundary reference | PASS   | Removed during final release hygiene; AGENTS.md §10 already covers the Guerilla exclusion.            |

## Scope Audit

| Boundary                                           | Status |
| -------------------------------------------------- | ------ |
| Four ordinary commands remain fixed                | PASS   |
| Adapter protocols remain outside core              | PASS   |
| Guerilla hook dispatch remains outside core        | PASS   |
| Network/database/broker services remain absent     | PASS   |
| Archive extraction remains absent                  | PASS   |
| Generated-code execution remains disabled          | PASS   |
| Projections remain non-authoritative               | PASS   |
| Material output does not imply workflow completion | PASS   |

## Validation Evidence

All commands were run on 2026-07-17 under the requested 60-second command cap.

| Command                                         | Exit code | Result | Evidence                                                                                           |
| ----------------------------------------------- | --------: | ------ | -------------------------------------------------------------------------------------------------- |
| `npm ci`                                        |         0 | PASS   | Clean dependency install; 174 packages audited, 0 vulnerabilities.                                 |
| `npm run format:check`                          |         0 | PASS   | Prettier check passed.                                                                             |
| `npm run lint`                                  |         0 | PASS   | ESLint passed for `src/` and `tests/`.                                                             |
| `npm run typecheck`                             |         0 | PASS   | Strict TypeScript check passed.                                                                    |
| `npm test`                                      |         0 | PASS   | 10 test files and 92 tests passed.                                                                 |
| `npm run contracts:verify`                      |         0 | PASS   | 54 immutable architecture files verified.                                                          |
| `npm run registries:verify`                     |         0 | PASS   | Core registries match workflow and schema inventory.                                               |
| `npm run schemas:meta-validate`                 |         0 | PASS   | 26/26 schemas meta-validated as Draft 2020-12.                                                     |
| `npm run examples:index-check`                  |         0 | PASS   | 18/18 examples parse and are indexed.                                                              |
| `npm run schemas:examples-validate`             |         0 | PASS   | 20 examples and fixtures matched expected schema outcomes.                                         |
| `npm run fixtures:verify`                       |         0 | PASS   | Gate A fixture taxonomy and seed corpus are present and parseable.                                 |
| `npm run build`                                 |         0 | PASS   | TypeScript build passed.                                                                           |
| `npm run package:verify`                        |         0 | PASS   | npm package installs outside checkout and reports `1.0.0`.                                         |
| `python -m pip install -e ".[dev]"`             |         0 | PASS   | Editable Python install completed as `expflow-hooks==1.0.0`.                                       |
| `python -m pytest`                              |         0 | PASS   | 9 Python tests passed.                                                                             |
| `python -m build --wheel`                       |         0 | PASS   | `expflow_hooks-1.0.0-py3-none-any.whl` built with `LICENSE`.                                       |
| `python tests/contracts/verify_python_wheel.py` |         0 | PASS   | Wheel imports outside checkout, excludes tests, enforces repo-only discovery, and reports `1.0.0`. |
| `git diff --check -- ':!docs/architecture/**'`  |         0 | PASS   | No whitespace errors outside immutable architecture sources.                                       |

Focused preflight also passed:

- `npm test -- tests/unit/version.test.ts tests/unit/security-migration-runtime.test.ts` -- 6 tests passed.
- `python -m pytest python/tests/test_scaffold.py` -- 6 tests passed.

Release-structure follow-up validation also passed:

| Command                                                                                                      | Exit code | Result | Evidence                                                       |
| ------------------------------------------------------------------------------------------------------------ | --------: | ------ | -------------------------------------------------------------- |
| `npm run format:check`                                                                                       |         0 | PASS   | Edited tracked docs use Prettier style.                        |
| `npm run contracts:verify`                                                                                   |         0 | PASS   | 54 immutable architecture files verified after structure edit. |
| `npm run package:verify`                                                                                     |         0 | PASS   | npm package still installs outside checkout and reports 1.0.0. |
| `git diff --check -- ':!docs/architecture/**'`                                                               |         0 | PASS   | No whitespace errors outside immutable architecture sources.   |
| `git ls-files build-docs .reasonix` structure check                                                          |         0 | PASS   | No tracked local-only reference or tool-state paths remain.    |
| `git check-ignore build-docs/Expflow-Gate-D-Hardening-PR-Review.md .reasonix/skills/starter-prompt/SKILL.md` |         0 | PASS   | Local reference and tool-state paths are ignored.              |

Devin review and README follow-up validation also passed:

| Command                                                     | Exit code | Result | Evidence                                                                                      |
| ----------------------------------------------------------- | --------: | ------ | --------------------------------------------------------------------------------------------- |
| `npm run format:check`                                      |         0 | PASS   | README, report, and TypeScript formatting passed.                                             |
| `npm run typecheck`                                         |         0 | PASS   | TypeScript typecheck passed after source-reuse policy update.                                 |
| `npm test -- tests/unit/security-migration-runtime.test.ts` |         0 | PASS   | 5 security/migration tests passed, including default `UNLICENSED` allow and explicit reject.  |
| `python -m build --wheel`                                   |         0 | PASS   | Isolated wheel build installed `setuptools>=77.0.3` and built `expflow_hooks-1.0.0`.          |
| `python tests/contracts/verify_python_wheel.py`             |         0 | PASS   | Wheel imports outside checkout, excludes tests, enforces repo-only discovery, and reports v1. |
| `npm run package:verify`                                    |         0 | PASS   | npm package installs outside checkout and reports `1.0.0`.                                    |
| `git diff --check -- ':!docs/architecture/**'`              |         0 | PASS   | No whitespace errors outside immutable architecture sources.                                  |

## Hosted CI Evidence

PR #7 hardening closure hosted checks were green at head `d1dd2ac925b219c50c7728963e908042793c7376`.

PR #10 is the active v1 release PR against `main` after PR #7 merged. Local release validation passed before this wording cleanup; hosted checks are tracked on the PR.

## Blockers And Release Risks

None for the locally validated v1.0.0 release branch.

Remaining owner-controlled follow-ups:

- Review and merge the hardening closure if it is not already merged.
- Review the v1 release-closeout PR.
- Decide whether to create the `v1.0.0` tag.
- Decide whether and where to publish npm and Python packages.

## Handoff

Expflow is release-ready locally for v1.0.0. No tag was created and no package was published.
