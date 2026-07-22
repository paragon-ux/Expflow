# Phase 7 Measures

## Quantitative Measures

| Measure                                                       | Result                                                                | Source                           |
| ------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------- |
| Representative workflows completed                            | 1 completed documentation workflow; 1 post-fix relocation smoke check | Command transcript               |
| CLI task attempts                                             | 17 pilot workflow commands; 7 defect/fix verification steps           | Command transcript               |
| Unexpected product defects                                    | 1                                                                     | Issue ledger `P7-F1`             |
| Safety refusals observed                                      | 1                                                                     | Restore conflict refusal, exit 1 |
| Silent overwrites observed                                    | 0                                                                     | Restore refusal evidence         |
| Unknown command outcomes                                      | 0                                                                     | All command exits recorded       |
| Machine-absolute paths in post-fix generated project metadata | 0 found by scan                                                       | Post-fix root-path scan          |

## Qualitative Observations

- Uninitialized `status` was understandable and non-mutating.
- `sync --dry-run` clearly separated preview from commit.
- Restore preview described affected paths before mutation.
- Default restore refusal protected unrecorded drift and gave a usable next action.
- The root-path persistence issue would have weakened portability and evidence hygiene if left unresolved.

## Limits

- The pilot used one repository-owned workflow and one operator.
- The pilot did not include external human participants.
- The pilot did not test GUI ergonomics directly.
- The pilot did not claim production adoption or empirical generality beyond this workflow.
