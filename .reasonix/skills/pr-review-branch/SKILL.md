---
name: pr-review-branch
description: >-
  Use this skill when reviewing code, commits, diffs, branches, pull requests,
  or release candidates and the work may continue into bug triage,
  implementation, verification, or pull-request preparation. Produce a compact
  evidence-backed candidate-finding ledger, require independent triage of every
  finding, preserve lower-severity defects for validation, and keep all edits on
  a non-protected branch.
compatibility: Requires a version-controlled repository. Branch and pull-request steps assume Git-compatible commands; adapt them to the repository host and available tools.
metadata:
  version: "2.0.0"
---

# PR Review Branch

## Outcome

Complete the review-to-PR workflow without losing findings or editing a protected branch:

1. inspect repository instructions and state;
2. review the requested change;
3. record each plausible defect exactly once;
4. hand every candidate to an implementation agent for independent triage;
5. fix confirmed defects on a feature branch;
6. verify the result and prepare or open a pull request.

The candidate-finding ledger is the source of truth.

## Activation boundaries

Use this skill for:

- code, diff, commit, branch, pull-request, or release-candidate review;
- review-to-implementation handoffs;
- bug-triage and regression-fix work;
- pre-release audits that may produce repository edits;
- pull-request preparation from review findings.

Do not use it for a purely explanatory code question, a design discussion with no repository review, or a feature request that contains no review or triage step.

## Repository preflight

Before editing:

1. Read repository-level instructions such as `AGENTS.md`, `CONTRIBUTING.md`, development guides, and CI configuration.
2. Inspect the working tree, current branch, and configured remotes with available version-control tools. Git command fallbacks:

```bash
git status --short
git branch --show-current
git remote -v
```

3. Identify protected branches from repository policy. Treat `main`, `master`, `trunk`, and `release` as protected unless the repository states otherwise.
4. Never discard, overwrite, or revert changes you did not create.
5. If existing user changes overlap the intended edits or ownership is unclear, stop editing the affected files and report the conflict. Unrelated changes may remain untouched.
6. Create or switch to one non-protected branch for the coherent implementation attempt.

Preferred branch patterns:

- `fix/<topic>`
- `feature/<topic>`
- `docs/<topic>`
- `chore/<topic>`

Git fallback:

```bash
git switch -c <branch-name>
```

## Review procedure

1. Establish the review target and expected behavior from the user request, repository documentation, tests, and public contracts.
2. Inspect the complete affected surface, not only the changed lines, when behavior crosses modules, APIs, storage, concurrency, security, or user-visible flows.
3. Prioritize correctness, security, data integrity, behavioral regressions, compatibility, and missing validation or tests.
4. Report only actionable candidate defects. Do not classify a new feature request, style preference, or unsupported speculation as a bug.
5. Attach compact evidence to every candidate: a file and line, failing test, reproducible behavior, contract mismatch, or review note.
6. Assign provisional priority for review ordering only. Priority does not decide whether a candidate reaches triage.

### Provisional priorities

| Priority | Meaning |
|---|---|
| P0 | Candidate release-blocking security, correctness, data-loss, or CI failure |
| P1 | Candidate merge-blocking trust, validation, or compatibility defect |
| P2 | Candidate real defect or material edge case |
| P3 | Candidate low-impact defect, weak-signal risk, performance issue, or maintainability defect with behavioral consequence |

Do not omit a candidate merely because it is P2 or P3.

## Candidate-finding ledger

Use stable IDs `F1`, `F2`, `F3`, and so on. Each candidate appears exactly once.

```markdown
## Candidate-finding ledger

| ID | Reviewer priority | Candidate defect | Evidence | Suggested direction |
|---|---|---|---|---|
| F1 | P0 | <concise defect> | <file:line, test, or source> | <concise fix direction> |
| F2 | P2 | <concise defect> | <file:line, test, or source> | <concise fix direction> |
```

Ledger rules:

- Keep evidence and fix directions compact.
- Do not create a reviewer-deferred section.
- Do not duplicate a finding in prose and the ledger.
- Merge true duplicates under one ID and list all relevant evidence.
- Exclude non-defect ideas from the ledger; mention a material scope assumption separately only when needed.

## Independent triage

The implementation agent must inspect the code before accepting a candidate as valid. It must classify every finding ID as exactly one of:

- `fixed`
- `not-reproducible`
- `duplicate`
- `intentional-behavior`
- `out-of-scope`

A non-fixed classification requires repository-based evidence. Do not defer a confirmed defect only because its provisional priority is low.

## Handoff prompt

End a review with a compact, provider-neutral implementation prompt. Reference ledger IDs instead of repeating the full review.

```text
Work in this repository as the implementation agent.

Goal:
Independently validate, triage, and resolve every candidate finding from the review ledger.

Branch:
Create or use `<branch-name>`. Do not edit a protected branch.

Rules:
- Read repository instructions and inspect repository state before editing.
- Triage every finding ID: <F1, F2, ...>.
- Inspect the implementation before accepting a finding as real.
- Classify each ID as fixed, not-reproducible, duplicate, intentional-behavior, or out-of-scope.
- Provide code- or test-based evidence for every non-fixed classification.
- Fix every confirmed in-scope defect, regardless of provisional priority.
- Preserve behavior not explicitly changed.
- Add or update regression tests for each fixed behavior.
- Do not overwrite unrelated user changes.
- Run repository-defined verification.
- Open a pull request when supported; otherwise provide exact equivalent commands or steps.

Candidate findings:
- F1 - <short description; evidence; suggested direction>
- F2 - <short description; evidence; suggested direction>

Completion report:
- final status and evidence for every finding ID;
- changed files and behavioral impact;
- verification commands and results;
- pull-request title and body, or exact creation commands.
```

If the review finds no candidates, still require branch-safe verification and a pull-request-ready report when repository changes are requested.

## Implementation and verification

For confirmed defects:

1. Reproduce or inspect the behavior.
2. Make the smallest coherent root-cause fix.
3. Add or update tests that fail before the fix and pass after it when feasible.
4. Run the narrowest relevant checks first, then the repository's broader required suite.
5. Re-run failed checks after correction until they pass or a concrete blocker is established.
6. Preserve unrelated working-tree changes.
7. Commit, push, or open a pull request only when requested or when the host workflow permits it.

Derive verification commands from repository sources in this order:

1. repository instructions;
2. CI configuration;
3. task runner or package scripts;
4. language-standard test, lint, build, and type-check commands.

Do not invent a passing result. Distinguish failures introduced by the change from verified pre-existing failures.

## Pull-request contract

Every reviewed finding ID must appear in the pull-request body or final PR-ready report.

```markdown
## Summary
- <change>
- <change>

## Finding status
- F1: fixed / not-reproducible / duplicate / intentional-behavior / out-of-scope - <evidence>
- F2: fixed / not-reproducible / duplicate / intentional-behavior / out-of-scope - <evidence>

## Verification
- `<command>` - <result>
- `<command>` - <result>
```

When command-line Git and a compatible hosting CLI are available, equivalent fallback steps are:

```bash
git add <paths>
git commit -m "<type>: <message>"
git push -u origin <branch-name>
# Use the repository host's pull-request command or UI.
```

Never use destructive operations such as hard reset, forced cleaning, force-push, or branch deletion unless the user explicitly authorizes them after repository state is inspected.

## Review output template

````markdown
# Code Review

## Verdict
PASS | CAUTION | BLOCK

## Release risk
<One paragraph, no more than four sentences, focused on the highest material risk.>

## Candidate-finding ledger

| ID | Reviewer priority | Candidate defect | Evidence | Suggested direction |
|---|---|---|---|---|
| F1 | P1 | <defect> | <evidence> | <direction> |

## Handoff scope
- Branch: `<branch-name>`
- Findings requiring independent triage: F1, ...
- Reviewer-deferred candidate defects: none

## Verification
```bash
<repository-derived commands>
```

## Triage and implementation prompt
```text
<provider-neutral handoff prompt>
```
````

## Gotchas

- A dirty working tree is not permission to revert user changes.
- A review priority is not an implementation scope gate.
- A failing test is evidence only after confirming it exercises the reviewed behavior.
- An intentional behavior classification requires a contract, test, documentation, or code-history basis.
- An unavailable remote or pull-request tool does not block local review and implementation; provide exact remaining steps.

## Final check

Before completing, confirm:

- every candidate defect appears once in the ledger;
- every ledger ID received an independent final status;
- no confirmed defect was dropped because of provisional severity;
- implementation occurred only on a non-protected branch;
- unrelated user changes remain intact;
- tests or explicit verification cover every fixed behavior;
- the pull-request body or PR-ready report includes every finding ID.
