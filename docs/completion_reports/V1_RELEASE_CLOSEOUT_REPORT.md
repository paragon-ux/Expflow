# v1 Release Closeout Report

## Result

PASS -- v1.0.0 is published to npm, PyPI, and GitHub Releases

## Release Identity

| Field                       | Value                                                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Release version             | `1.0.0`                                                                                                                                                                   |
| Final release commit        | `605d249f7e09adcaecc2a102f2fb874ef460a6fa`                                                                                                                                |
| Latest package-readiness CI | Hosted CI run `29633182623` passed on `605d249f7e09adcaecc2a102f2fb874ef460a6fa`                                                                                          |
| Pull requests               | [PR #12](https://github.com/paragon-ux/Expflow/pull/12), [PR #13](https://github.com/paragon-ux/Expflow/pull/13), [PR #16](https://github.com/paragon-ux/Expflow/pull/16) |
| Release classification      | `dual-registry v1.0.0 publication`                                                                                                                                        |
| Tag status                  | Remote tag `v1.0.0` exists at `605d249f7e09adcaecc2a102f2fb874ef460a6fa`                                                                                                  |
| GitHub Release status       | Published at <https://github.com/paragon-ux/Expflow/releases/tag/v1.0.0>                                                                                                  |
| Publish status              | npm `expflow@1.0.0` and PyPI `expflow-hooks==1.0.0` published and externally installed                                                                                    |

The repository revision for v1.0.0 dual-registry publication is merged to `main`. The public README quickstart requires package installation rather than developer setup. The `v1.0.0` tag exists on the validated release commit, npm and PyPI packages are public, external registry installation checks pass, and the GitHub Release is published with registry-matching assets.

## Dual-Registry Preflight

| Check                           | Result | Evidence                                                                                     |
| ------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| Repository root                 | PASS   | `C:/Users/USER/Desktop/Frameworks/Expflow`                                                   |
| Status refresh branch model     | PASS   | Non-protected `codex/` branches are used for release-status refreshes                        |
| Worktree                        | PASS   | Clean before release-status edits                                                            |
| `origin/main`                   | PASS   | Includes merged release workflow, package-only quickstart, and status refreshes              |
| Open release pull requests      | PASS   | No open release-publication PRs remain                                                       |
| Remote tag `v1.0.0`             | PASS   | Tag exists at `605d249f7e09adcaecc2a102f2fb874ef460a6fa`                                     |
| GitHub Release `v1.0.0`         | PASS   | `gh release view v1.0.0` returned the final release URL                                      |
| Hosted CI on `main`             | PASS   | Run `29633182623` succeeded for commit `605d249f7e09adcaecc2a102f2fb874ef460a6fa`            |
| npm package `expflow`           | PASS   | `npm view expflow@1.0.0` reports public package `expflow` under MIT                          |
| npm external install            | PASS   | Clean external install of `expflow@1.0.0` reports version `1.0.0`                            |
| PyPI project `expflow-hooks`    | PASS   | PyPI JSON reports `expflow-hooks` version `1.0.0` with sdist and wheel files                 |
| PyPI external install           | PASS   | Clean external install of `expflow-hooks==1.0.0` imports `expflow_hooks` and reports `1.0.0` |
| GitHub environments             | PASS   | `release-npm` and `release-pypi` exist with required reviewer `paragon-ux`                   |
| Private Vulnerability Reporting | PASS   | `gh api repos/paragon-ux/Expflow/private-vulnerability-reporting` returned `enabled: true`   |

## Release Workflow And Artifact Manifest

| Item            | Value                                                              |
| --------------- | ------------------------------------------------------------------ |
| Workflow file   | `.github/workflows/release.yml`                                    |
| Workflow digest | `fbeb7ba0edd585a0b58a0a34b6e46c46644f4b92afea68e84d229e5092132837` |
| Workflow run ID | `29633276841`                                                      |

| Artifact                               | SHA-256                                                            | GitHub    | npm/PyPI | Verified                                 |
| -------------------------------------- | ------------------------------------------------------------------ | --------- | -------- | ---------------------------------------- |
| `expflow-1.0.0.tgz`                    | `89cb3c50703140902acd0b0061d34b31c6002935dc3462d62b1ccb1363adc8ae` | Published | npm      | Registry tarball install verifier passed |
| `expflow_hooks-1.0.0.tar.gz`           | `f7dc9dfe5f53a6ae85aa062190dc61a229507c78d22cd2134a96e4ef466f3b29` | Published | PyPI     | PyPI digest verified                     |
| `expflow_hooks-1.0.0-py3-none-any.whl` | `c3a4aa3df87535cd8b90d0bdb8c250efed5dae51a154f9a796104b035f3adb97` | Published | PyPI     | Registry wheel install verifier passed   |
| `release-manifest.json`                | `ecee09ad313b2131b4ab501f00cd7c9ff9d93b57e3e67b3464b664e79998d372` | Published | GitHub   | Release asset digest verified            |
| `SHA256SUMS`                           | `65cf1c9654b54b578671c858204f9409e3164c1a30dd09c8113848d2ba6c91a5` | Published | GitHub   | Release asset digest verified            |

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
- npm `publishConfig.access` set to `public`.
- Package repository, homepage, issue URL, license, binary, exports, and files metadata are coherent for review.
- Python wheel import verification reports `1.0.0` and confirms top-level tests are excluded.
- Python dev metadata includes `twine` for distribution metadata checks.

## Documentation Changes

- `README.md` now presents a CI badge, Expflow v1.0.0 release scope, package-only quickstart, workflow, command table, delegated boundaries, repository map, validation, documentation links, and MIT license.
- `README_DEV.md` now presents v1 release setup and validation.
- `CHANGELOG.md` records v1.0.0 outcomes.
- `docs/release_notes/GITHUB_RELEASE_NOTE_V1_0_0.md` provides standalone text for a GitHub release.
- `docs/V1_COMPATIBILITY.md` records the v1 public compatibility promise.
- `docs/RELEASE_PUBLISHING.md` records published registry state, release-environment maintenance, and future tokenless publishing guidance.
- `.github/workflows/release.yml` builds once from `v1.0.0`, attests the exact artifacts, publishes through OIDC, and creates or verifies the GitHub Release only after npm and PyPI verify.
- `SECURITY.md` directs suspected vulnerabilities to GitHub Private Vulnerability Reporting and keeps public issues for non-sensitive hardening requests.
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

The dual-registry release remediation adds these validation results:

| Command                                                                   | Exit code | Result | Evidence                                                                                                                   |
| ------------------------------------------------------------------------- | --------: | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| `npx prettier --check .github/workflows/release.yml`                      |         0 | PASS   | Release workflow formatting passed.                                                                                        |
| `npm pack --dry-run`                                                      |         0 | PASS   | npm package preview produced `expflow-1.0.0.tgz` with expected README, LICENSE, `dist/`, schemas, and architecture assets. |
| `npx tsx tests/contracts/package-verify.ts --tarball <local release tgz>` |         0 | PASS   | Exact locally built npm tarball installs outside checkout and reports `1.0.0`.                                             |
| `npm run clean`                                                           |         0 | PASS   | Removed TypeScript build output before exact Python distribution validation.                                               |
| `python -m build`                                                         |         0 | PASS   | Built `expflow_hooks-1.0.0.tar.gz` and `expflow_hooks-1.0.0-py3-none-any.whl`.                                             |
| `python -m twine check dist/*`                                            |         0 | PASS   | Python sdist and wheel metadata passed after `dist/` contained only Python distributions.                                  |
| `python tests/contracts/verify_python_wheel.py --wheel <local wheel>`     |         0 | PASS   | Exact locally built wheel imports outside checkout, excludes tests, and reports `1.0.0`.                                   |

Initial diagnostic note: `python -m twine check dist/*` fails when TypeScript build directories remain in `dist/`. The documented local validation path now runs `npm run clean` before Python distribution validation.

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

Package-only quickstart and final-preflight validation also passed:

| Command                                                                              | Exit code | Result | Evidence                                                                  |
| ------------------------------------------------------------------------------------ | --------: | ------ | ------------------------------------------------------------------------- |
| `npm run format:check`                                                               |         0 | PASS   | README quickstart and release-status docs use Prettier style.             |
| `git diff --check -- ':!docs/architecture/**'`                                       |         0 | PASS   | No whitespace errors outside immutable architecture sources.              |
| `npx tsx tests/contracts/package-verify.ts --tarball <README-inclusive release tgz>` |         0 | PASS   | Exact locally built npm tarball installs outside checkout and reports v1. |
| `python tests/contracts/verify_python_wheel.py --wheel <README-inclusive wheel>`     |         0 | PASS   | Exact locally built wheel imports outside checkout and reports v1.        |
| `python -m twine check <README-inclusive Python distributions>`                      |         0 | PASS   | README-inclusive Python sdist and wheel metadata passed.                  |

## Hosted CI Evidence

PR #7 hardening closure hosted checks were green at head `d1dd2ac925b219c50c7728963e908042793c7376`.

PR #10 and PR #11 are merged. PR #12 merged at `4482e2e6b3a133fd1a18c24b6150e7269ee31310`. PR #13 merged at `c3ed67613ac951f5199081ac1f64fff546c06165` and simplified the public quickstart to package installation plus CLI usage. PR #14 merged as a release-status refresh. PR #16 merged at `605d249f7e09adcaecc2a102f2fb874ef460a6fa` and finalized v1 release metadata. Hosted CI run `29633182623` passed on the final release commit.

## Release Follow-Up

Publication is complete. The first `v1.0.0` release workflow run exposed verifier issues after registry publication:

- npm verification failed because the job rejected an ambient `NODE_AUTH_TOKEN` before checking the already-published package.
- PyPI verification failed because the version JSON endpoint returned 404 immediately after successful upload, before propagation completed.

The workflow has been updated to unset `NODE_AUTH_TOKEN` only before an actual npm publish and to retry PyPI version JSON verification for propagation. Do not move or delete the `v1.0.0` tag; future releases should use the corrected workflow.

## Handoff

Expflow core v1.0.0 is published. npm `expflow@1.0.0`, PyPI `expflow-hooks==1.0.0`, and the GitHub Release assets have been independently verified. Remaining work is post-v1 maintenance: keep tokenless registry publishing configured, protect release tags where repository settings permit it, and carry the workflow verifier fix forward for later releases.
