# Phase 5 Precision Review - F1/F2 Closure

**Status:** BLOCK
**Review type:** closure review
**Phase:** 5 - Portable Workflow Package
**Base:** `0adce83f296a46dddd9bdab653f96a04cd29ef26`
**Reviewed head:** `ac620068b3d87d152743f3c1b82b02b882980a78`
**Reviewer:** independent closure reviewer

## Verdict

BLOCK.

F2 was closed. F1 remained open because a digest-consistent but schema-invalid workflow occurrence payload with an invalid lifecycle enum still passed validation, planning, and import.

## Finding Closure

| ID  | Status | Evidence                                                                                                                                                                                                                                 |
| --- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | open   | Changing the workflow payload `material_status` to `not_a_material_status`, then updating payload digest and byte size, made `validatePackage`, `planImport`, and `importPackage` succeed at `ac620068b3d87d152743f3c1b82b02b882980a78`. |
| F2  | closed | Adding an unrelated external evidence record produced `externalReferenceCount: 0`, `evidencePayloads: 0`, `planBlocking: false`, and `missingExternal: 0` at `ac620068b3d87d152743f3c1b82b02b882980a78`.                                 |

## Verification

| Command or procedure                                                  | Exit | Result                                             |
| --------------------------------------------------------------------- | ---: | -------------------------------------------------- |
| `git diff --check 0adce83f296a46dddd9bdab653f96a04cd29ef26...ac62006` |    0 | PASS                                               |
| `npx vitest run tests/unit/portable-package-runtime.test.ts`          |    0 | PASS - 5 tests                                     |
| `npm run typecheck`                                                   |    0 | PASS                                               |
| `npm run validate`                                                    |    0 | PASS - 22 files / 176 tests plus repository checks |
| F1 enum-tamper reproduction                                           |    0 | reproduced open F1                                 |
| F2 unrelated-external reproduction                                    |    0 | verified closed F2                                 |

## Handoff

Parent remediation required for remaining F1 only.
