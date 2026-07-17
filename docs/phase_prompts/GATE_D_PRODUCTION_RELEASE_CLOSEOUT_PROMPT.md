# Gate D Production Release Closeout Prompt

## Purpose

Use this prompt after Gate D native durability closure is fixed, reviewed, and merged or intentionally incorporated into the active release branch.

The goal is to convert Expflow from a Gate D architecture-lock candidate into an externally understandable, production-release-ready `v1.0.0` repository without weakening the architecture boundary, hiding residual durability limits, or introducing adapter/runtime scope that belongs outside core.

## Starting Position

- Gate D owns local security, migration evidence, package hardening, end-to-end proof, and native material durability closure.
- The four ordinary commands remain fixed: `expflow init`, `expflow sync`, `expflow status`, and `expflow restore`.
- Guerilla universal-hook compatibility remains an external profile/observation boundary.
- Immutable architecture sources under `docs/architecture/**` must not be edited.
- Release cleanup is external-facing product readiness, not a new architecture gate.

## Work In This Repository

Act as the release-closeout implementation agent.

### Goal

Prepare the repository for an external production `v1.0.0` release candidate.

This includes final release metadata, legal/license files, public documentation, package readiness, validation evidence, and a clear release handoff. Do not publish packages, create a GitHub release, tag `v1.0.0`, or merge to a protected branch unless the user explicitly asks for that action after review.

### Branch

Create or use a non-protected branch such as `codex/gate-d-v1-release-closeout`. Do not edit `main` directly.

### Required Orientation

Before editing:

- Read `AGENTS.md`.
- Read `docs/orientation/SYSTEM_1_IMPROVEMENTS.md`.
- Read `docs/orientation/SYSTEM_2_IMPROVEMENTS.md`.
- Read `docs/ARCHITECTURE_DECISIONS.md`.
- Read `docs/REPOSITORY_DIRECTORY_STRUCTURE.md`.
- Read `docs/completion_reports/GATE_D_COMPLETION_REPORT.md`.
- Read `build-docs/Expflow-Gate-D-Hardening-PR-Review.md` if present.
- Inspect branch, worktree, remote, latest PR state, and hosted checks.
- Confirm Gate D durability closeout requirements F10 and DCR-1 through DCR-6 are fixed or explicitly incorporated in the release branch.

Stop and report a blocker if Gate D durability closeout is still unresolved.

## Release Scope

### 1. Version And Package Identity

Make release identity coherent across package surfaces:

- Set the TypeScript package version to `1.0.0` unless the user specifies another v1 version.
- Set the Python package version to the matching release version or document why the Python hook package version intentionally differs.
- Remove private/pre-release package markers only when external publication is intended and package metadata is complete.
- Ensure package descriptions, repository URLs, exports, `files`, binaries, and package verification align with the external release story.
- Verify generated `dist/` output and Python wheel contents include only intended public artifacts.

### 2. License And Legal Readiness

Do not invent a license choice. If no explicit license has been selected by the owner, stop and request that decision before changing package license metadata.

Once the owner selects a license:

- Add a root `LICENSE` file using the exact chosen license text.
- Update `package.json` with the correct SPDX license identifier.
- Update `pyproject.toml` with matching license metadata.
- Add `NOTICE` only if the selected license or dependency posture requires it.
- Add a short licensing section to the public README.
- Verify no remaining `UNLICENSED` or `LicenseRef-UNLICENSED` metadata survives unless intentionally documented as non-release scope.

### 3. External Public Documentation

Revise public-facing docs for external comprehension:

- Root `README.md` should explain what Expflow is, what is production-ready in v1, what remains outside core, and how a new user starts.
- `README_DEV.md` should focus on contributor setup, validation, and release checks.
- Add or update `CHANGELOG.md` with a `v1.0.0` section summarizing Gate A through Gate D outcomes in user-facing language.
- Add or update `SECURITY.md` with supported versions, vulnerability reporting, and default local-only/security posture.
- Add or update `CONTRIBUTING.md` with contribution workflow, validation expectations, and immutable architecture-source rules.
- Add `CODE_OF_CONDUCT.md` only if the repository owner wants a public community contribution posture.
- Keep internal build-process detail out of the main README unless it helps an external user make a safe first decision.

### 4. Repository Hygiene

Clean up the release surface without deleting useful local or reference material:

- Follow `docs/REPOSITORY_DIRECTORY_STRUCTURE.md` as the authoritative tracked/untracked placement guide for this revision.
- Prefer leaving local/reference artifacts untracked, ignored, or excluded from package/release artifacts over removing files.
- Do not delete local directories, reference packages, build docs, private scratch material, or generated evidence unless the user explicitly requests deletion.
- Do not run `git rm --cached` to untrack a currently tracked file or directory unless the release report names the exact path, explains why it should leave version control, and the user approves that change.
- Ensure `.reasonix/`, local build output, caches, and private scratch material are ignored or excluded from release artifacts.
- Confirm `build-docs/` content is either intentionally tracked reference material, intentionally untracked local reference material, or omitted from package publication.
- Confirm no secrets, local absolute paths, private notes, or machine-specific artifacts appear in release-facing docs or packaged files.
- Confirm top-level directory READMEs remain current where this pass materially changes their purpose or release boundary.
- Do not recursively update subdirectory READMEs unless directly affected by the release cleanup.

### 5. Architecture And Scope Boundaries

Preserve these constraints:

- Do not edit immutable architecture sources under `docs/architecture/**`.
- Do not add ordinary commands beyond `init`, `sync`, `status`, and `restore`.
- Do not add Guerilla hook dispatch, adapter protocols, external cursors, adapter idempotency, lost-response reconciliation, network services, databases, brokers, archive extraction, or generated-code execution.
- Do not make projections authoritative.
- Do not make material output imply workflow completion.
- Do not treat model-assisted output as deterministic.
- Do not fabricate semantic authority, migration certainty, workflow completion, verification, or reuse acceptance.

### 6. Release Evidence

Create or update a release closeout report, for example `docs/completion_reports/V1_RELEASE_CLOSEOUT_REPORT.md`, with:

- Result line: `PASS`, `PARTIAL`, or `FAIL`.
- Release version and branch/head commit.
- Final Gate D durability status, including F10 and DCR-1 through DCR-6.
- Legal/license decision and exact files updated.
- Package metadata changes.
- Documentation changes.
- Repository hygiene audit.
- Scope audit.
- Validation command table with exact exit codes.
- Hosted CI evidence when available.
- Blockers and unresolved release risks.
- Handoff statement saying whether the repo is release-candidate-ready, tag-ready, publish-ready, or blocked.

## Required Validation

Run these commands after changes, using calibrated timeouts:

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npm run contracts:verify
npm run registries:verify
npm run schemas:meta-validate
npm run examples:index-check
npm run schemas:examples-validate
npm run fixtures:verify
npm run build
npm run package:verify
python -m pip install -e ".[dev]"
python -m pytest
python -m build --wheel
python tests/contracts/verify_python_wheel.py
git diff --check -- ':!docs/architecture/**'
```

If an aggregate validation command times out, run the component commands and record the exact command, timeout, and replacement evidence. Do not report validation as passed unless it actually passed.

## Release Readiness Classification

Use these exact statuses in the release closeout report:

- `release-candidate-ready`: all local release cleanup and validation are complete, but no tag or publish action has been taken.
- `tag-ready`: release-candidate-ready plus explicit user approval to create `v1.0.0` tag.
- `publish-ready`: tag-ready plus package metadata and credentials/publishing targets verified, but publish not yet executed.
- `published`: packages or release artifacts were actually published by explicit user request and evidence is recorded.
- `blocked`: a required legal, durability, validation, or scope condition is unresolved.

## Pull Request Body Template

```markdown
## Summary

- Prepare Expflow for external v1.0.0 release readiness.
- Add/update public release docs, legal metadata, package metadata, and release closeout evidence.
- Preserve Gate D core boundaries and adapter/Guerilla deferral.

## Gate D Durability Closeout

- F10: fixed / not-reproducible / duplicate / intentional-behavior / out-of-scope - <evidence>
- DCR-1: pass/fail - <evidence>
- DCR-2: pass/fail - <evidence>
- DCR-3: pass/fail - <evidence>
- DCR-4: pass/fail - <evidence>
- DCR-5: pass/fail - <evidence>
- DCR-6: pass/fail - <evidence>

## Release Readiness

- Version: <version>
- License: <chosen license and files>
- Package status: <npm/python package status>
- Documentation status: <README/CHANGELOG/SECURITY/CONTRIBUTING status>
- Release classification: release-candidate-ready / tag-ready / publish-ready / published / blocked

## Verification

- `npm ci` - <result>
- `npm run format:check` - <result>
- `npm run lint` - <result>
- `npm run typecheck` - <result>
- `npm test` - <result>
- `npm run contracts:verify` - <result>
- `npm run registries:verify` - <result>
- `npm run schemas:meta-validate` - <result>
- `npm run examples:index-check` - <result>
- `npm run schemas:examples-validate` - <result>
- `npm run fixtures:verify` - <result>
- `npm run build` - <result>
- `npm run package:verify` - <result>
- `python -m pip install -e ".[dev]"` - <result>
- `python -m pytest` - <result>
- `python -m build --wheel` - <result>
- `python tests/contracts/verify_python_wheel.py` - <result>
- `git diff --check -- ':!docs/architecture/**'` - <result>
```

## Stop Conditions

Stop and report `blocked` if:

- The license has not been selected by the owner.
- Gate D durability closeout remains unresolved.
- Immutable architecture sources would need edits.
- Package metadata cannot be made coherent without a product decision.
- Validation fails and cannot be fixed without changing architecture scope.
- Release would require adding adapter, network, database, broker, hook-dispatch, or generated-code execution behavior to core.
