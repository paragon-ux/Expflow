# Phase 7 Command Transcript

**Evaluated branch:** `feat/build-week-phase-07-pilot-evaluation`
**Entry base:** `bbdb28375d42c1317ddd1b3e3c6b4ca113e3d0c5`
**Runtime:** Node `v22.19.0`; npm `11.12.1`; Python `3.11.9`; Git `2.53.0.windows.1`

This transcript summarizes command evidence without recording machine-absolute paths.

## Baseline Controls

| Step | Command                            | Exit | Result |
| ---- | ---------------------------------- | ---: | ------ |
| B1   | `npm run check:skill-contracts`    |    0 | PASS   |
| B2   | `npm run check:config-references`  |    0 | PASS   |
| B3   | `npm run check:protected-surfaces` |    0 | PASS   |
| B4   | `npm run build`                    |    0 | PASS   |

## Pilot CLI Workflow

| Step | Command                                                                                             | Exit | Elapsed | Evidence summary                                                                               |
| ---- | --------------------------------------------------------------------------------------------------- | ---: | ------: | ---------------------------------------------------------------------------------------------- |
| P1   | `expflow status --root <pilot-project>`                                                             |    0 |  186 ms | Reported no Expflow project and recommended `expflow init`.                                    |
| P2   | `expflow init --root <pilot-project>`                                                               |    0 |  459 ms | Initialized project `efp_XNW3MHE2KFJT3KEGZ890D1YBVT` at tree `eft_AG8Z29Q3N08KZPAD990WPG82KB`. |
| P3   | `expflow status --root <pilot-project>`                                                             |    0 |  238 ms | Reported clean working tree.                                                                   |
| P4   | `expflow sync --root <pilot-project> --dry-run`                                                     |    0 |  259 ms | Reported no changes and did not commit.                                                        |
| P5   | `expflow sync --root <pilot-project>`                                                               |    0 |  294 ms | Reported `no_change`; head remained `eft_AG8Z29Q3N08KZPAD990WPG82KB`.                          |
| P6   | `expflow status --root <pilot-project> --history`                                                   |    0 |  297 ms | Listed initialization tree and restore guidance.                                               |
| P7   | `expflow restore tree:eft_AG8Z29Q3N08KZPAD990WPG82KB --root <pilot-project> --dry-run`              |    0 |  640 ms | Previewed no changes against the current baseline.                                             |
| P8   | `expflow status --root <pilot-project>` after observation edit                                      |    0 |  254 ms | Reported one modified file with provisional revision.                                          |
| P9   | `expflow sync --root <pilot-project> --dry-run`                                                     |    0 |  239 ms | Previewed one modified file and did not commit.                                                |
| P10  | `expflow sync --root <pilot-project>`                                                               |    0 |  439 ms | Committed tree `eft_TGZPQJZB0GW9TYENQXYQE0CHPK`.                                               |
| P11  | `expflow status --root <pilot-project> --history`                                                   |    0 |  249 ms | Listed two tree revisions.                                                                     |
| P12  | `expflow restore tree:eft_AG8Z29Q3N08KZPAD990WPG82KB --root <pilot-project> --dry-run`              |    0 |  247 ms | Previewed an update to `raw-observations.md` and changed nothing.                              |
| P13  | `expflow restore tree:eft_AG8Z29Q3N08KZPAD990WPG82KB --root <pilot-project>` with conflicting drift |    1 |  343 ms | Refused to overwrite `raw-observations.md`; no new project version was committed.              |
| P14  | `expflow status --root <pilot-project>` after refusal                                               |    0 |  272 ms | Preserved the drift and recommended `expflow sync`.                                            |
| P15  | `expflow sync --root <pilot-project>`                                                               |    0 |  398 ms | Committed refusal observation at tree `eft_3HD7S0778W068JHC01MWXKWTMC`.                        |
| P16  | `expflow status --root <pilot-project>`                                                             |    0 |  242 ms | Reported clean working tree.                                                                   |
| P17  | `expflow status --root <pilot-project> --history`                                                   |    0 |  358 ms | Listed three tree revisions.                                                                   |

## Pilot-Found Defect and Fix Verification

| Step | Command or procedure                                                           | Exit | Elapsed | Evidence summary                                                                   |
| ---- | ------------------------------------------------------------------------------ | ---: | ------: | ---------------------------------------------------------------------------------- |
| F1   | Inspect generated `.expflow/project.json` after initial pilot init             |    0 |     n/a | Found `root_path` persisted as a machine-absolute path.                            |
| F2   | `npm run build` after runtime fix                                              |    0 |     n/a | PASS                                                                               |
| F3   | `npx vitest run tests/unit/material-runtime.test.ts tests/unit/cli-ux.test.ts` |    0 |     n/a | PASS - 2 files / 26 tests.                                                         |
| F4   | `expflow init --root <post-fix-project>`                                       |    0 | 1645 ms | Initialized project `efp_GXZA7GYKQEEXPP74YZ19HN49P4`.                              |
| F5   | Scan post-fix `.expflow/project.json`                                          |    0 |     n/a | `contains_absolute=False`; `root_path=.`.                                          |
| F6   | `expflow status --root <post-fix-project>`                                     |    0 | 1502 ms | Reported clean working tree.                                                       |
| F7   | Copy initialized post-fix project to a temporary relocation and run `status`   |    0 | 1539 ms | Relocated status reported clean working tree for `efp_GXZA7GYKQEEXPP74YZ19HN49P4`. |
