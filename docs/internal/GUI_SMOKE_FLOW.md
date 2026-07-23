# Expflow GUI Smoke-Flow Test Plan

**Version:** 1.1.1
**Status:** Test plan for v1.1.1 GUI distribution gate (G7). Automated tests are referenced by file path; manual flows are labeled as owner-tested.
**Owner test:** Owner-performed manual GUI smoke test passed on the tested repository-local flows.

---

## 1. Entry points

| Entry                                    | Action                        | Expected result                                                                          |
| ---------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| `expflow-gui` from npm                   | Launch from installed package | Server starts on `http://127.0.0.1:4173`, prints URL and request token                   |
| `node apps/gui/server.mjs` from checkout | Launch from repository        | Same as above                                                                            |
| Browser at `http://127.0.0.1:4173`       | Open GUI shell                | Index page loads with project root input, panels, and request token injected as meta tag |

---

## 2. Project-root selection

| Flow                  | Setup               | Action                                       | Expected result                                        | Mutation |
| --------------------- | ------------------- | -------------------------------------------- | ------------------------------------------------------ | -------- |
| Enter root            | Clean checkout      | Type absolute path into "Project root" field | Path accepted                                          | No       |
| Blank root            | Clean checkout      | Leave root empty, click Inspect              | Error: `root_required` with guidance                   | No       |
| Whitespace root       | Clean checkout      | Enter spaces, click Inspect                  | Error: `root_required`                                 | No       |
| Inspect uninitialized | New empty directory | Enter path, click Inspect                    | State: `empty`, recommended action: "Run expflow init" | No       |

---

## 3. Uninitialized state

| Flow                       | Setup           | Action       | Expected result                                              | Mutation |
| -------------------------- | --------------- | ------------ | ------------------------------------------------------------ | -------- |
| Status shows empty         | New directory   | Inspect      | `working_tree_state: uninitialized`, project id `efp_000...` | No       |
| Init disabled without root | No root entered | Attempt Init | UI prevents via root validation                              | No       |

---

## 4. Initialization

| Flow                     | Setup                       | Action                                | Expected result                                            | Mutation                  |
| ------------------------ | --------------------------- | ------------------------------------- | ---------------------------------------------------------- | ------------------------- |
| Initialize new project   | New directory, root entered | Click Initialize                      | State: `success`, receipt with `new_head`, project created | Yes — `.expflow/` created |
| Init already initialized | Initialized directory       | Click Initialize                      | Error: `project_already_initialized`                       | No                        |
| Init via GET             | Server running              | `curl http://127.0.0.1:4173/api/init` | 405 Method Not Allowed                                     | No                        |
| Init without token       | Server running              | POST without `x-request-token`        | 401 `invalid_token`                                        | No                        |

---

## 5. Clean and drifted status

| Flow                 | Setup                           | Action                                                       | Expected result                                       | Mutation |
| -------------------- | ------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------- | -------- |
| Clean status         | No file changes since last sync | Inspect                                                      | `working_tree_state: clean`, no pending changes       | No       |
| Drifted status       | File added/modified/deleted     | Inspect                                                      | `working_tree_state: drifted`, pending changes listed | No       |
| Status via POST      | Server running                  | `curl -X POST http://127.0.0.1:4173/api/status` (with token) | Returns status JSON                                   | No       |
| Status without token | Server running                  | POST without token                                           | 401 `invalid_token`                                   | No       |

---

## 6. Sync preview

| Flow                       | Setup           | Action               | Expected result                        | Mutation |
| -------------------------- | --------------- | -------------------- | -------------------------------------- | -------- |
| Preview pending changes    | Drifted project | Click Sync → Preview | Change details with kind, path, digest | No       |
| Preview clean project      | Clean project   | Click Sync → Preview | Empty change details                   | No       |
| Preview returns plan token | Any             | Click Preview        | Response includes `planToken` field    | No       |

---

## 7. Sync execution

| Flow                         | Setup                          | Action               | Expected result                                        | Mutation                |
| ---------------------------- | ------------------------------ | -------------------- | ------------------------------------------------------ | ----------------------- |
| Commit after preview         | Previewed, confirm dialog      | Click Sync → Commit  | Receipt with `new_head`, status `committed`            | Yes — new tree revision |
| Commit without preview       | Fresh page load, no preview    | Click Sync → Commit  | Client-side `sync_preview_required` error              | No                      |
| Stale preview — file changed | Preview, modify file, commit   | Click Commit         | `sync_candidate_changed`, recommendation to re-preview | No                      |
| Stale preview — head changed | Preview, sync from CLI, commit | Click Commit         | `sync_head_changed`, recommendation to re-preview      | No                      |
| Reused plan token            | Commit, then reuse same token  | POST with used token | `sync_plan_expired`                                    | No                      |

---

## 8. Stale-preview refusal

| Flow                 | Setup                          | Action                | Expected result                         | Mutation |
| -------------------- | ------------------------------ | --------------------- | --------------------------------------- | -------- |
| Head changed         | Preview, external sync, commit | Status shows new head | Error code from G3 refusal; recoverable | No       |
| Working tree changed | Preview, edit file, commit     | File content differs  | Error code from G3 refusal; recoverable | No       |

All refusals are non-mutating and recommend running Preview again.

---

## 9. History

| Flow          | Setup                    | Action                         | Expected result                                                  | Mutation |
| ------------- | ------------------------ | ------------------------------ | ---------------------------------------------------------------- | -------- |
| Tree history  | Project with revisions   | Click History → Tree History   | Revision list with sequence, tree_revision_id, restore reference | No       |
| Empty history | New project (no commits) | Click History                  | "No items"                                                       | No       |
| Node history  | File path entered        | Enter path, click Node History | Node revision list for that file                                 | No       |

---

## 10. Restore preview

| Flow                       | Setup                               | Action                                                   | Expected result                              | Mutation |
| -------------------------- | ----------------------------------- | -------------------------------------------------------- | -------------------------------------------- | -------- |
| Preview restore            | Enter tree reference, click Preview | Path effects with effect, relative_path, conflict status | No                                           |
| Preview returns plan token | Restore preview                     | Response includes `planToken`                            | No                                           |
| Restore button disabled    | No preview yet                      | Observe Restore button                                   | Button is `disabled` until preview completes | —        |
| Invalid reference          | Enter invalid ref, click Preview    | Error with guidance                                      | No                                           |

---

## 11. Restore execution

| Flow                                  | Setup                                       | Action                     | Expected result                              | Mutation             |
| ------------------------------------- | ------------------------------------------- | -------------------------- | -------------------------------------------- | -------------------- |
| Restore after preview                 | Previewed, confirm dialog                   | Click Restore              | Receipt with `new_head`                      | Yes — forward commit |
| Restore without preview               | No preview, no planToken                    | Click Restore (if enabled) | Client-side `restore_preview_required` error | No                   |
| Restore without planToken server-side | POST `/api/restore` without token           | Bridge returns error       | `restore_preview_required`                   | No                   |
| Stale restore — head changed          | Preview, external change, execute           | Execute                    | `restore_head_changed`, re-preview required  | No                   |
| Stale restore — source changed        | Preview, change reference, execute          | Execute                    | `restore_source_changed`                     | No                   |
| Force requirement changed             | Preview without conflicts, add conflict     | Execute                    | `restore_force_changed`                      | No                   |
| Overwrite choice changed              | Preview without force, check force, execute | Execute                    | `restore_overwrite_changed`                  | No                   |
| Path effects changed                  | Preview, modify working tree, execute       | Execute                    | `restore_path_effects_changed`               | No                   |
| Preserved drift changed               | Preview, add drift, execute                 | Execute                    | `restore_drift_changed`                      | No                   |
| Target path changed (node restore)    | Preview target A, execute target B          | Execute                    | Refused (path effects differ)                | No                   |

---

## 12. Restore conflict refusal

| Flow                    | Setup                                 | Action            | Expected result                       | Mutation |
| ----------------------- | ------------------------------------- | ----------------- | ------------------------------------- | -------- |
| Conflicting drift shown | Drifted file, restore would overwrite | Preview           | `conflicting: true` on affected paths | No       |
| Force required          | Conflicting drift                     | Preview           | `requires_force: true`                | No       |
| Force override          | Check "Force overwrite"               | Preview + Execute | Restore proceeds                      | Yes      |

Restore remains byte-exact, append-only, and forward-committing.

---

## 13. Receipt inspection

| Flow            | Setup                               | Action                       | Expected result                             | Mutation |
| --------------- | ----------------------------------- | ---------------------------- | ------------------------------------------- | -------- |
| Load receipt    | Operation ID from previous mutation | Enter ID, click Load Receipt | Receipt with operation_id, status, new_head | No       |
| Invalid receipt | Empty or unknown ID                 | Enter invalid ID, click Load | Error with guidance                         | No       |

---

## 14. Server/request errors

| Flow                | Setup          | Action                                  | Expected result                     | Mutation |
| ------------------- | -------------- | --------------------------------------- | ----------------------------------- | -------- |
| Invalid Host header | Server running | `curl -H "Host: evil.com" ...`          | 400 `invalid_host`                  | No       |
| Invalid Origin      | Server running | `curl -H "Origin: http://evil.com" ...` | 403 `invalid_origin`                | No       |
| Missing token       | Server running | POST without `x-request-token`          | 401 `invalid_token`                 | No       |
| Wrong token         | Server running | POST with wrong token                   | 401 `invalid_token`                 | No       |
| GET on mutation     | Server running | `curl http://127.0.0.1:4173/api/init`   | 405 Method Not Allowed, Allow: POST | No       |
| PUT on mutation     | Server running | `curl -X PUT ...`                       | 405 Method Not Allowed              | No       |
| OPTIONS on mutation | Server running | `curl -X OPTIONS ...`                   | 405 Method Not Allowed              | No       |

---

## 15. Blank-root refusal

| Flow                   | Setup                 | Action                                      | Expected result                | Mutation                     |
| ---------------------- | --------------------- | ------------------------------------------- | ------------------------------ | ---------------------------- |
| Blank root in GUI      | No text in root field | Click Inspect                               | API returns `root_required`    | No                           |
| Whitespace root in GUI | Spaces only           | Click Inspect                               | API returns `root_required`    | No                           |
| Blank root in API      | Server running        | POST `{"root":"","root":""}` to `/api/init` | 400 `root_required`            | No — `.expflow/` NOT created |
| Omitted root in API    | Server running        | POST `{}` to `/api/init`                    | Bridge returns `root_required` | No                           |

Server working directory is never substituted for a blank root.

---

## 16. Installed-package launch

| Flow                        | Setup                               | Action                  | Expected result                     |
| --------------------------- | ----------------------------------- | ----------------------- | ----------------------------------- |
| `expflow-gui` binary        | `npm install -g expflow@1.1.1`      | Run `expflow-gui`       | Server starts, prints URL and token |
| Port override               | `EXPFLOW_GUI_PORT=4200 expflow-gui` | Server on port 4200     | URL shows port 4200                 |
| Port unavailable            | Port already in use                 | Launch                  | Fails with clear error              |
| `expflow` CLI unchanged     | Installed package                   | Run `expflow --version` | `1.1.1`, four commands unchanged    |
| GUI assets served           | Browser open                        | Navigate to URL         | Full GUI shell loads                |
| No source checkout required | Delete repo, keep npm global        | Run `expflow-gui`       | Works from installed package        |

---

## 17. Shutdown

| Flow   | Action                   | Expected result      |
| ------ | ------------------------ | -------------------- |
| Ctrl+C | Press Ctrl+C in terminal | Server stops cleanly |

---

## 18. Automated test references

- API/boundary tests: `tests/unit/gui-bridge.test.ts` (bridge-level binding tests)
- Installed launch test: `tests/contracts/package-verify.ts` (launches `expflow-gui`, makes authenticated API request)
- Sync binding tests: `tests/unit/gui-bridge.test.ts`
- Restore binding tests: `tests/unit/gui-bridge.test.ts`

Owner-performed manual GUI smoke test passed on the tested repository-local flows. This is not independent usability evidence, external pilot evidence, empirical evaluation, production support evidence, or installed-package verification.
