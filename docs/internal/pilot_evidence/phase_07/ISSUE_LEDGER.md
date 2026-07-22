# Phase 7 Issue Ledger

| ID    | Severity | Finding                                                                                            | Evidence                                                                                                                                                     | Disposition                                                                                                                                                                               |
| ----- | -------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P7-F1 | P1       | Newly initialized Expflow project metadata persisted `root_path` as a machine-absolute local path. | Initial pilot `.expflow/project.json` contained the local workspace path in `root_path`. Phase 7 prompt prohibits durable machine-absolute path persistence. | Fixed by storing `root_path` as `.` for newly initialized project records. Regression added in `tests/unit/material-runtime.test.ts`; post-fix init scan found `contains_absolute=False`. |

## Non-Findings

- Restore refusal behaved as intended: default restore refused conflicting unrecorded drift and preserved local work.
- Relocation status behaved as intended after the root-path fix: copied initialized workspace reported clean status from the new location.
