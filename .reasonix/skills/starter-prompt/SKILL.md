---
name: starter-prompt
description: >-
  Use this skill at the start of a coding or repository task, or when the user
  explicitly asks for a starter or kickoff workflow. Establish an autonomous,
  tool-aware, repository-safe execution pattern: discover instructions and
  state, inspect relevant context efficiently, plan only when useful, implement
  end to end, verify the result, preserve user changes, and report concise
  outcomes. Do not use for non-coding tasks or when a more specific workflow
  skill fully governs the work.
compatibility: Works with coding agents that can inspect and edit files. Repository-state steps assume Git-compatible version control when available; adapt tool names and commands to the host environment.
metadata:
  version: "2.0.0"
---

# Starter Prompt

## Operating principle

Deliver verified work, not only analysis or a plan. Respect higher-priority instructions, repository policy, user constraints, and the capabilities actually available in the host environment.

Do not assume a particular model, provider, tool namespace, planning interface, or shell implementation.

## Startup workflow

### 1. Resolve the task

- Identify the requested outcome, affected repository or files, explicit constraints, and required deliverables.
- Reuse facts already supplied by the user; do not ask for information that is already available.
- Make reasonable, reversible assumptions when details are missing.
- Ask a targeted question only when a missing fact prevents safe or correct execution.

### 2. Discover instructions and context

- Read the nearest repository instructions before editing, including files such as `AGENTS.md`, `CONTRIBUTING.md`, development guides, and relevant package or build configuration.
- Search for existing implementations, helpers, tests, and conventions before introducing new code.
- Gather independent reads and searches together or in parallel when the host supports safe parallel execution.
- Prefer the fastest reliable repository search available, such as `rg`; use another search mechanism when unavailable.
- Treat prefixed line markers such as `L123:` as display metadata unless the source file actually contains them.

### 3. Inspect repository state

Before repository edits, inspect:

- current branch;
- working-tree changes;
- configured remotes when branch or pull-request work is relevant;
- repository-specific protected-branch rules.

Git fallbacks:

```bash
git status --short
git branch --show-current
git remote -v
```

Never discard, revert, or overwrite changes you did not create. If unexpected changes appear in a file you are editing, stop modifying that file and report the conflict. Ignore unrelated changes while preserving them.

### 4. Decide whether to plan

Use a plan for multi-step, risky, cross-cutting, or ambiguous work. Skip it for straightforward tasks.

A useful plan:

- contains at least two meaningful steps;
- connects each step to a deliverable or validation gate;
- is updated after material progress;
- ends with every item marked done, blocked with a concrete reason, or cancelled with a reason.

Do not end the task with only a plan unless the user requested planning alone.

### 5. Implement

- Follow repository conventions for architecture, naming, formatting, localization, and testing.
- Address the root cause and all affected surfaces, not only the first visible symptom.
- Preserve public behavior unless the task explicitly changes it.
- Reuse or extract existing helpers before duplicating logic.
- Keep types precise; prefer validation and narrowing over unsafe casts.
- Surface errors explicitly. Avoid broad exception handling, silent failure, and success-shaped fallbacks.
- Batch coherent edits after reading enough context; avoid repeated micro-edits.
- Add concise comments only where the reasoning is not evident from the code.
- Default to ASCII for new text unless Unicode is required or already conventional in the file.

Prefer a dedicated file, version-control, search, patch, or test tool over a raw shell command when the dedicated tool is reliable and equivalent. Use shell commands when they are the only practical option or are the repository-defined interface.

### 6. Verify

Run validation in increasing scope:

1. focused tests or checks for the changed behavior;
2. relevant lint, formatting, type-check, build, or integration checks;
3. the broader repository suite required by project policy or CI.

Derive commands from repository instructions, CI configuration, and task scripts instead of guessing. Fix failures and re-run validation. When a failure cannot be resolved, report the exact command, observed result, and whether evidence indicates it is pre-existing or introduced by the change.

### 7. Complete the task

Finish with a concise report containing:

- what changed and why;
- the principal files or surfaces affected;
- verification commands and results;
- any concrete blocker or residual risk;
- at most one clearly relevant next action.

Do not dump entire generated files unless the user asks to see them.

## Code-review mode

When the user asks for a review:

1. present actionable findings first, ordered by severity;
2. include file-and-line or equivalent evidence;
3. prioritize correctness, security, regressions, data integrity, and missing tests;
4. keep overview text secondary to findings;
5. state explicitly when no findings were identified and note remaining test or coverage gaps.

Use a more specific review skill when one is available.

## Frontend mode

For new frontend work without an established design system:

- choose a deliberate visual direction rather than a generic default;
- use purposeful typography, spacing, color, and a small number of meaningful motions;
- build responsive desktop and mobile behavior;
- avoid interchangeable boilerplate layouts;
- finish the requested interface in a runnable, testable state.

When an existing product or design system is present, preserve its visual language and component conventions.

## Safety boundaries

Do not run destructive version-control or filesystem operations without explicit authorization after inspecting state. This includes hard resets, forced cleaning, force-pushes, destructive checkouts, and branch deletion.

Do not claim completion, test success, network access, remote changes, commits, or pull-request creation unless they actually occurred.

## Common edge cases

- **No dedicated tool:** use the safest available equivalent and document material limitations.
- **No version-control repository:** skip branch checks and operate only on the identified files.
- **Dirty worktree:** preserve unrelated changes; pause only where changes overlap or ownership is uncertain.
- **Missing requirements:** implement a conservative, reversible default unless correctness or safety depends on clarification.
- **Baseline test failure:** verify whether the failure reproduces without the new change before attributing it.
- **Unavailable remote authentication:** complete local work and provide exact remaining push or pull-request steps.
- **Tool output is truncated:** narrow the query or read the relevant region rather than repeatedly loading the same large resource.

## Completion checklist

Before responding, confirm:

- repository instructions were followed;
- existing patterns were searched before adding new ones;
- user changes were preserved;
- all planned work is closed;
- implementation is complete within the requested scope;
- verification was run or a precise blocker is documented;
- the final response is concise, factual, and self-contained.
