# Expflow UX Flow Analysis

**Date:** 2026-07-23
**Version tested:** Expflow `v1.1.0` (npm install)
**Methodology:** Fresh npm install, real command execution, observation of all outputs, exit codes, and error states.
**Test root:** `Expflow-UX-Test/`

---

## 1. Entry Points

### E1 — First-time user, uninitialized project

```bash
expflow status
```

**What happens:** Exit 0. Human-readable message: "No Expflow project exists at this root. Next action: run `expflow init` to initialize a project."

**UX assessment:** Clean. Does not error out (correct — uninitialized is a valid state). Gives exactly one next action. No jargon.

### E2 — First-time user, wants help

```bash
expflow --help
```

**What happens:** Lists four commands (`init`, `sync`, `status`, `restore`), global options, and exit code legend. Each command suggests `expflow <command> --help` for details.

**UX assessment:** Good discoverability. Four commands is small enough to scan. Exit code legend is unusual for a CLI but valuable for automation users.

### E3 — Returning user, initialized project

```bash
expflow status
```

**What happens:** Shows project ID, current tree revision, working tree state (clean/drifted), pending changes with paths, and hints for next actions.

**UX assessment:** The project ID is long and human-unfriendly, but it's clearly labeled as an identifier, not something to memorize. The tree revision ID is similarly opaque but functional.

### E4 — User with history interest

```bash
expflow status --history
```

**What happens:** Lists project versions newest-first with timestamps, source (initialization/sync), status, and tree revision IDs. Provides restore syntax hint.

**UX assessment:** The history table is scannable. The restore hint at the bottom is a copy-paste template — good for discoverability but could be made clickable or more prominent.

---

## 2. Decision Points

### D1 — To commit or to preview?

**User state:** Working tree is dirty. `expflow status` shows pending changes.
**Options:** `expflow sync --dry-run` (preview) or `expflow sync` (commit).

**UX:** The status output pushes `sync --dry-run` as the recommended preview step. The dry-run shows exactly what would change without committing. The flow `status → dry-run → sync` is natural and well-supported by the CLI output.

### D2 — Which tree revision to restore?

**User state:** User runs `expflow status --history` and sees multiple versions.

**Decision:** Pick a tree revision ID (e.g., `eft_7SZVDFT19N3W60QWRV8K39787D`) and use it in `expflow restore tree:<id>`.

**UX pain point:** Tree revision IDs are opaque 30-character strings. Users must copy-paste them from the history output. No shorthand for "restore the previous version" or "restore version #2." The `--dry-run` preview mitigates this by showing affected paths before any mutation.

### D3 — Override or not? (Restore conflict)

**User state:** `expflow restore` detects conflicting unrecorded drift.

**Options:** `expflow sync` first to record drift, then restore. Or `expflow restore --force` to overwrite.

**UX:** The error message is clear, actionable, and non-destructive. Lists the conflicting path. Gives two concrete recommendations. Exit 1 correctly signals refusal. This is one of the strongest UX points in the CLI.

### D4 — Identity directives during sync

**User state:** User wants to move, rename, or force-new-node during `expflow sync`.

**Options:** `--move`, `--new-node`, `--replace-node`, `--expected-head`.

**UX:** These are discoverable in `expflow sync --help` but not surfaced in the default status or sync output. A user who doesn't read `--help` won't know they exist. This is acceptable for advanced features but would benefit from a mention in the dry-run output when relevant (e.g., "Use --move to preserve identity when renaming").

---

## 3. Happy Path

### Full workflow: init → status → dry-run → sync → history → restore preview → restore

```
1. expflow status                          # exit 0, recommends init
2. expflow init                            # exit 0, project created
3. expflow status                          # exit 0, clean
4. <user edits files>
5. expflow status                          # exit 0, shows 1 pending change
6. expflow sync --dry-run                  # exit 0, previews change
7. expflow sync                            # exit 0, committed
8. expflow status --history                # exit 0, shows 2 versions
9. expflow restore --dry-run tree:<id>     # exit 0, previews affected paths
10. expflow restore tree:<id>              # exit 0, restores (or exit 1 if conflict)
```

**UX assessment:** Every step returns exit 0 unless there's a real problem. Each step's output recommends the next step. The flow is consistent: preview before mutate, verify after mutate. No surprises.

---

## 4. Error States

### ERROR 1 — Unknown command

```bash
expflow unknown
```

**Output:** `expflow: unknown command 'unknown'. Use --help for usage.`
**Exit:** 2
**UX:** Correct. Exit 2 for usage failure. Message is clear. Recommends `--help`.

### ERROR 2 — Init on already-initialized project

```bash
expflow init   # (on an already-initialized dir)
```

**Output:** `expflow: Expflow project already exists. [project_already_initialized]. No new project version was committed. Run expflow status for current project state.`
**Exit:** 1
**UX:** Good. Error code in brackets (`[project_already_initialized]`) is machine-friendly. States explicitly that nothing was committed. Gives next action.

### ERROR 3 — Stale expected head

```bash
expflow sync --expected-head <wrong_id>
```

**Output:** `expflow: Expected material head does not match current head. [stale_head]. No new project version was committed. Run expflow status for current project state.`
**Exit:** 1
**UX:** Clear. The `[stale_head]` code helps automation. "No new project version was committed" is reassuring.

### ERROR 4 — Restore conflict

```bash
expflow restore tree:<id>   # (with unrecorded drift)
```

**Output:** `expflow: Restore would overwrite unrecorded working-tree changes at: <path>. [restore_conflict]. No new project version was committed. Recommended action: Run expflow sync to record your working-tree changes first, or re-run with --force to overwrite them.`
**Exit:** 1
**UX:** Excellent. Lists the conflicting file. Explains WHY it refused. Gives TWO repair options. Non-destructive by default.

### ERROR 5 — Missing or malformed restore reference

```bash
expflow restore tree:badref
```

**Expected behavior** (per help): Exit 1 with operational failure message.
**UX assessment:** The restore syntax uses `tree:<id>` and `node:<id>@<rev>:<path>` — these are discoverable from the history output but a malformed reference should give a clear parse error rather than a generic failure.

---

## 5. Exit Points

### EXIT 0 — Success / Read-only query

All status queries, successful previews, successful commits, and successful restores exit 0. This includes uninitialized status (by design — querying state is not an error).

### EXIT 1 — Operational failure

Init on existing project, stale expected head, restore conflict, lock failure, and other mutation failures exit 1. Every exit-1 message includes the error code, states that nothing was committed, and recommends a next action.

### EXIT 2 — Usage failure

Unknown commands and unsupported options exit 2. Message directs to `--help`.

**UX assessment:** The three-tier exit code system is consistently applied and well-documented in `--help`. Automation scripts can reliably branch on exit codes.

---

## 6. Pain Points

### P1 — Opaque identifiers

**Severity:** Moderate
**Evidence:** Tree revision IDs (`eft_7SZVDFT19N3W60QWRV8K39787D`), node IDs, project IDs, and operation IDs are all 30-character opaque strings. Users must copy-paste from history output.

**Impact:** Typing errors are likely. No shorthand for "latest" or "previous" or "version #2."

**Recommendation:** Add numbered aliases like `restore tree:#1` for history list position, or `restore tree:previous` for the prior head.

### P2 — Missing "what changed" in history

**Severity:** Moderate
**Evidence:** `expflow status --history` shows timestamps and revision IDs but no file-level detail. Users must run `restore --dry-run` on each revision to see what changed.

**Impact:** Exploratory history browsing requires multiple commands.

**Recommendation:** Add `--history` to `status` that includes a one-line change summary per revision (e.g., "1 added, 2 modified").

### P3 — No `--json` parity in history

**Severity:** Low
**Evidence:** `expflow status --json` works but `expflow status --history --json` shows human-readable output with JSON fields mixed in, not a pure JSON array.

**Impact:** Automation scripts must parse human-readable history output.

**Recommendation:** Make `--json` produce identical structure in both `status` and `status --history` modes.

### P4 — Dry-run ID churn

**Severity:** Low
**Evidence:** Provisional node IDs change between `status`, `sync --dry-run`, and `sync` runs even when the file hasn't changed (e.g., `efn_VX6AKMWWB615SCPKSJ0QR2AZBD@1` vs `efn_3D5HY1QHFH27XXQQT40GD2X68C@1` for the same file).

**Impact:** Confusion if a user writes down a provisional ID from status and then sees a different one in dry-run. The provisional label helps but the churn is noticeable.

**Recommendation:** Stabilize provisional IDs where possible, or explain the churn in output when it occurs.

### P5 — Help buried behind `--help`

**Severity:** Low
**Evidence:** Identity directives (`--move`, `--new-node`, `--replace-node`) are only discoverable via `expflow sync --help`. Status output doesn't mention them.

**Impact:** Users who only follow the `status → dry-run → sync` flow miss these features entirely.

**Recommendation:** Add a hint line to status output when relevant: "Use --move <from:to> with sync to preserve file identity when renaming."

### P6 — No project name or human label

**Severity:** Low
**Evidence:** Projects are identified only by opaque IDs (`efp_KKJQ564WKWM2CXJ5WFNK1202S8`). No way to set a human-readable project name.

**Impact:** Managing multiple projects requires remembering or recording opaque IDs.

**Recommendation:** Allow an optional `--label` during `init` and display it in `status`.

---

## 7. Summary

| Dimension          | Rating    | Notes                                                                                                                   |
| ------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| Discoverability    | Good      | `--help` is thorough. Status output guides next actions well.                                                           |
| Error handling     | Excellent | Consistent three-tier exit codes. Every error names the problem, states nothing was committed, and gives a next action. |
| Safety             | Excellent | Dry-run before every mutation. Restore refuses conflicts by default. No destructive commands without preview.           |
| Consistency        | Good      | All four commands follow the same output format. Exit codes are predictable.                                            |
| Learnability       | Good      | Four commands is learnable. Flow `status → dry-run → commit → verify` is natural.                                       |
| Power-user support | Adequate  | `--json`, `--expected-head`, identity directives. Opaque IDs are a friction point.                                      |
| Overall            | **Good**  | Production-ready for a v1.1 CLI. Pain points are real but none block ordinary use.                                      |

The restore-safety refusal UX is the standout feature — clear conflict identification, two repair options, no data loss path in the default flow.
