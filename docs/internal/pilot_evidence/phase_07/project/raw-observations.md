# Raw Observations

## Observation Log

| Step | Intended action                         | Start                | End                  | Outcome                                                 | Error or friction                                                  | Decision                                                      |
| ---- | --------------------------------------- | -------------------- | -------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| 0    | Define pilot charter and task packet    | 2026-07-22T04:43:00Z | 2026-07-22T04:44:00Z | Complete                                                | None                                                               | Use repository-owned documentation workflow as pilot subject. |
| 1    | Check status before initialization      | 2026-07-22T04:44:04Z | 2026-07-22T04:44:04Z | Exit 0 with initialization guidance                     | None                                                               | Continue to initialization.                                   |
| 2    | Initialize Expflow workspace            | 2026-07-22T04:44:05Z | 2026-07-22T04:44:05Z | Exit 0; initial tree `eft_AG8Z29Q3N08KZPAD990WPG82KB`   | None                                                               | Use this as baseline project version.                         |
| 3    | Inspect clean status and history        | 2026-07-22T04:44:05Z | 2026-07-22T04:44:06Z | Exit 0; working tree clean; history lists baseline tree | None                                                               | Proceed to a real documentation change.                       |
| 4    | Preview and commit observation edit     | 2026-07-22T04:44:30Z | 2026-07-22T04:44:31Z | Exit 0; committed tree `eft_TGZPQJZB0GW9TYENQXYQE0CHPK` | None                                                               | Use baseline tree for restore-preview and refusal checks.     |
| 5    | Create conflicting drift before restore | 2026-07-22T04:45:00Z | 2026-07-22T04:45:01Z | Restore exit 1; no new project version committed        | Intentional conflict; message recommended syncing or force restore | Preserve refusal as safety evidence and sync the observation. |

## Pilot Change

The pilot change records observed behavior from the first Expflow run and prepares the workspace for preview, sync, history, and restore-safety checks.

## Interpretation Rules

- Do not infer success from command appearance alone.
- Preserve failed commands and retries.
- Treat unknown outcomes as unknown until reconciled.
- Do not convert subjective friction into a product fact without evidence.
