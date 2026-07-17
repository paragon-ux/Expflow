# v1 Release Closeout Report

## Result

PASS -- Expflow v1.0.0 release candidate prepared locally

## Release Identity

| Field                  | Value                                      |
| ---------------------- | ------------------------------------------ |
| Release version        | `1.0.0`                                    |
| Branch                 | `codex/gate-d-v1-release-closeout`         |
| Starting head          | `d1dd2ac925b219c50c7728963e908042793c7376` |
| Release classification | `release-candidate-ready`                  |
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

| Area                   | Status       | Evidence                                                                                   |
| ---------------------- | ------------ | ------------------------------------------------------------------------------------------ |
| Owner license decision | PASS         | MIT selected by owner for v1.                                                              |
| Root license file      | PASS         | `LICENSE` contains MIT license text for Paragon UX.                                        |
| npm metadata           | PASS         | `package.json` and `package-lock.json` use `license: MIT`.                                 |
| Python metadata        | PASS         | `pyproject.toml` uses `license = "MIT"` and includes `LICENSE` in the wheel.               |
| Unlicensed metadata    | PASS         | No active package metadata retains `UNLICENSED` or `LicenseRef-UNLICENSED`.                |
| NOTICE                 | NOT REQUIRED | MIT release does not require a NOTICE file for this repository's current metadata posture. |

## Package Metadata Changes

- TypeScript package version set to `1.0.0`.
- Python hook package version set to `1.0.0`.
- npm private marker removed for the release candidate.
- Package repository, homepage, issue URL, license, binary, exports, and files metadata are coherent for review.
- Python wheel import verification reports `1.0.0` and confirms top-level tests are excluded.

## Documentation Changes

- `README.md` now presents Expflow v1.0.0 release scope, install steps, command surface, repository map, validation, and MIT license.
- `README_DEV.md` now presents v1 release-candidate setup and validation.
- `CHANGELOG.md` records v1.0.0 outcomes.
- `SECURITY.md` records supported versions, reporting expectations, and local-first security posture.
- `CONTRIBUTING.md` records branch, validation, architecture-source, and scope-boundary rules.
- `docs/CURRENT_STATUS_MATRIX.md`, `docs/CODEX_BUILD_PLAN.md`, `docs/TEST_MATRIX.md`, and `docs/README.md` were updated for release-closeout status.
- No `CODE_OF_CONDUCT.md` was added because the owner has not requested a public community contribution posture file.

## Repository Hygiene Audit

| Area                           | Status               | Evidence                                                                                                                                                             |
| ------------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Immutable architecture sources | PASS                 | `docs/architecture/**` was not edited; source integrity check passed.                                                                                                |
| Generated output               | PASS                 | `build/`, `dist/`, wheels, npm tarballs, caches, and `.expflow/` remain ignored/generated.                                                                           |
| Local reference state          | PASS                 | `.reasonix/` and `build-docs/untracked/` are ignored.                                                                                                                |
| Tracked `build-docs/**`        | DOCUMENTED EXCEPTION | Existing tracked reference packets remain tracked to avoid unapproved untracking or deletion. They are excluded from npm package contents by `package.json` `files`. |
| Release-facing docs            | PASS                 | No local absolute paths or private scratch links were added to public release docs.                                                                                  |
| Package surface                | PASS                 | npm package verification installs outside checkout and reports `1.0.0`; Python wheel verification imports outside checkout and reports `1.0.0`.                      |

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

## Hosted CI Evidence

PR #7 hardening closure hosted checks were green at head `d1dd2ac925b219c50c7728963e908042793c7376`.

PR #8 is intentionally stacked on `codex/gate-d-hardening-review-format`; the repository workflow currently runs pull-request hosted checks only for PRs targeting `main`, so no hosted checks are listed for the stacked release PR. Local release validation passed. Retargeting or rebasing PR #8 onto `main` after PR #7 merges should trigger hosted checks if required for final review.

## Blockers And Release Risks

None for `release-candidate-ready`.

Remaining owner-controlled follow-ups:

- Review and merge the hardening closure if it is not already merged.
- Review the v1 release-closeout PR.
- Decide whether to create the `v1.0.0` tag.
- Decide whether and where to publish npm and Python packages.

## Handoff

Expflow is release-candidate-ready locally for v1.0.0. No tag was created and no package was published.
