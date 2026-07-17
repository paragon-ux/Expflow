# System 1 Improvements

**Status:** operational orientation records
**Scope:** Small implementation and review practices that prevent avoidable stalls across the project.

System 1 improvements are low-level rules learned from project execution. They are not architecture changes and do not replace the source-of-truth order. They exist so every pass starts with the same operational facts.

## Recognizing System 1 Friction

System 1 friction is small, repeatable execution drag that blocks progress without changing the architecture. It usually appears as a preventable timeout, stale status assumption, wrong source-of-truth lookup, stale top-level directory README, accidental parallel command collision, or validation claim that outruns the evidence.

Add or update a System 1 ADR when the fix is a reusable habit or operating rule that future passes should apply before they lose time.

## Adding Or Challenging A System 1 ADR

Add a new ADR with the next `ADR-S1-###` identifier when no existing ADR covers the friction. Use this shape: `Issue`, `Rule`, optional `Default`, and `Prevents`.

Challenge an existing ADR when it is too broad, stale, contradicted by a higher source of truth, or creates more stall risk than it removes. Because this document is mutable, revise the ADR in place, keeping the useful reason and deleting obsolete wording. Do not add a competing ADR for the same rule unless the old one is being split into two clearer rules.

## ADR-S1-001 Command Timeout Calibration

**Issue:** Treating a 60-second cap as a hard timeout for every command can turn normal validation into a false blocker.

**Rule:** Use timeouts that match the expected command. Fast inspections can keep short caps. Full validation, package build, wheel build, and hosted-check inspection need longer caps.

**Default:** Use at least 300 seconds for `npm run validate`, at least 180 seconds for `python -m build --wheel`, and at least 120 seconds for Python tests or package verifiers unless a task explicitly requires a stricter cap.

**Prevents:** False failures, repeated reruns, and long stalls caused by confusing timeout policy with validation failure.

## ADR-S1-002 Workflow Source Of Truth

**Issue:** Confusion between root agent guidance and workflow governance can make agents debate gate sequencing instead of proceeding.

**Rule:** `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md` owns workflow phase and gate sequencing. `AGENTS.md` owns repository agent governance and source-order policy. When the question is "what phase or gate owns this work," use the workflow document.

**Prevents:** Reopening gate definitions from secondary guidance and misclassifying later-gate work as current-gate scope.

## ADR-S1-003 Shared Output Commands Are Not Parallel-Safe

**Issue:** Running two package-build or wheel-verification commands in parallel can collide on `build/`, `dist/`, or package metadata output.

**Rule:** Parallelize read-only inspection and independent checks. Run commands that write shared build or package directories sequentially.

**Prevents:** Non-deterministic build failures such as directory-not-empty errors from concurrent wheel operations.

## ADR-S1-004 Validation Wording Must Match Evidence

**Issue:** A command that proves parseability, category presence, or descriptor coverage can be misreported as exhaustive behavior coverage.

**Rule:** Completion reports and status matrices must describe exactly what validation proves. Use words like "seed," "taxonomy," "descriptor," or "harness" when the evidence is intentionally narrow.

**Prevents:** Review loops that try to satisfy overbroad wording by expanding artifacts beyond the current scope.

## ADR-S1-005 Live Status Is Mutable

**Issue:** `docs/CURRENT_STATUS_MATRIX.md` can become stale during PR creation or hosted-check completion.

**Rule:** Treat the status matrix as a live operational artifact. Update PR links, hosted-check status, branch head evidence, and risk statements when review state changes. Do not treat it as immutable architecture input.

**Prevents:** Conflicting status claims such as "pending PR creation" after a PR exists and checks are green.

## ADR-S1-006 Architecture Sources Are No-Edit Inputs

**Issue:** Fixing review friction by editing immutable `docs/architecture/**` files would violate the repository contract.

**Rule:** Do not edit immutable architecture sources. Resolve operational wording, orientation, status, completion-report, registry, or validation-message issues in mutable repo documents and tests.

**Prevents:** Source-manifest failures and accidental architecture drift.

## ADR-S1-007 Known Local-Only Directories

**Issue:** `.reasonix/` and `build-docs/` appear as untracked local directories and can distract review or cleanup work.

**Rule:** Treat `.reasonix/` and `build-docs/` as intentional local-only directories unless the user explicitly asks to stage, remove, or inspect them.

**Prevents:** Accidental deletion or unrelated churn in local reference material.

## ADR-S1-008 Start With State Before Action

**Issue:** Acting before checking branch, worktree, remotes, and PR state risks editing the wrong branch or overwriting unrelated work.

**Rule:** At the start of a pass, inspect branch, worktree, remotes, and relevant PR metadata before editing.

**Prevents:** Protected-branch edits, stale PR assumptions, and accidental interference with user changes.

## ADR-S1-009 Sequential Evidence Beats Assumption

**Issue:** A passing hosted check, local test, or prior report can be misremembered or made stale by later edits.

**Rule:** After changing files, rerun the focused checks that cover the edit, then the broader validation set when the change affects shared contracts or reports.

**Prevents:** Reporting validation as current when it only applied to an earlier revision.

## ADR-S1-010 Directory README Currency

**Issue:** Top-level directory READMEs can become stale when a pass changes the purpose, contents, generated/manual boundary, runtime status, or validation role of a major repository area.

**Rule:** Treat top-level directory READMEs as mutable local orientation. During any pass that materially affects a major top-level area, update that area's primary README once before handoff so it describes the current purpose, ownership boundary, and relevant validation or usage notes.

**Default:** Apply this rule only to primary READMEs directly under major repository directories such as `docs/`, `examples/`, `registries/`, `schemas/`, `tests/`, and `src/`. Do not recurse into subdirectory READMEs during ordinary pass cleanup. Subdirectory README updates require an explicit user request or a change whose direct deliverable is that subdirectory README. Do not edit immutable architecture sources under `docs/architecture/**`; if a README beside immutable sources needs currency, update only mutable README/control text allowed by repository policy.

**Prevents:** Review stalls caused by stale local maps, outdated validation instructions, hidden generated/manual boundary drift, and confusion about whether a directory reflects Gate A contracts or Gate B material-core behavior.
