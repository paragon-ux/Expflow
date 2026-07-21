# Phase 1 Working Note - CLI UX Contract

**Status:** implemented CLI presentation contract for the Phase 1 completion candidate. Normative authority remains the Phase 1 prompt; this note records the exact human-output contract tested by `tests/unit/cli-ux.test.ts`.

## Exit codes (locked)

- `0` - success, including `status` on an uninitialized directory (D1).
- `1` - operational failure (uninitialized `sync`/`restore`, restore conflict refusal, stale head, lock, missing revision, already-initialized `init`).
- `2` - usage failure (unknown command, unsupported option, missing option value, missing restore reference, malformed `--move`).

## Parsing rules

- Strict per-command option sets; an unsupported option anywhere fails with exit 2 and names the option.
- `expflow <command> --help` prints command-specific help, exit 0, and NEVER executes the command.
- Global: `--root <path>`, `--json`, `--help/-h`, `--version/-v`.
- `sync`: `--dry-run`, `--expected-head <id>`, `--move <from>:<to>`, `--new-node <path>`, `--replace-node <path>`.
- `status`: `--history`, `--node-history <path>`, `--history-limit <n>`.
- `restore`: `--dry-run`, `--force`, `--target-path <path>`.

## Human output contract (all derive from the same runtime records as `--json`)

- `init` (success): labeled project id, initial tree revision (labeled "current project version"), operation id, next action hint.
- `status`:
  - uninitialized: states no project exists at the root, next action `expflow init`, exit 0.
  - clean: labeled project id, current project version (tree revision), "no pending changes", hints for `--json`, `--history`, and restore preview.
  - drifted: pending change count by kind (added/modified/removed/moved), bounded path list with kinds, provisional labels on uncommitted node revisions, next action `expflow sync` (preview: `expflow sync --dry-run`).
  - invalid: "needs attention", unresolved item codes, recommended action, recovery guidance.
  - `--history`: bounded recent tree revisions with sequence, created_at, source, operation status, current-head marker, exact `tree:<id>` restore reference and preview syntax.
  - `--node-history <path>`: node revisions for the path with `node:<id>@<rev>:<path>` restore references, current-revision marker.
- `sync --dry-run`: header stating preview/no mutation; counts by kind; deterministic path list with kind and provisional identity; current head and candidate digest labeled; next action.
- `sync` (commit): labeled status (`committed`/`no_change`), new current project version, operation id.
- `restore --dry-run <ref>`: header stating preview/no mutation; selected source reference; current head; affected paths grouped by create/update/remove; conflicting drift paths with refusal warning and remediation (`expflow sync` first or `--force`); preserved unrelated drift note; forward-commit explanation.
- `restore <ref>`: same labels as sync commit; refusal (without `--force`) exits 1 with conflicting paths and remediation; nothing mutated.
- Errors (human, stderr): what failed + error code; why; whether a new project version was committed (always "no" for thrown errors); safe next action from `recommendedAction`; how to inspect (`expflow status`, `--json`). `--json` errors print a JSON error object with code/message/recoverable/recommended_action.

## Terminology

Human copy uses the prompt section 7 external vocabulary (project, current project version, changes, restore preview, needs attention, safe next action) with canonical ids labeled (project id, tree revision, node revision, operation id, provisional). No schema field is renamed.
