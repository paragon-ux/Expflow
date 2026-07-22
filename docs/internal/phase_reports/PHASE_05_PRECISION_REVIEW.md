# Phase 5 Precision Review - Portable Workflow Package

**Status:** BLOCK
**Review type:** independent phase review
**Phase:** 5 - Portable Workflow Package
**Base:** `f13ef5e3a112c19152a7354e25f51a9b3dfea66f`
**Reviewed head:** `e95d1eb6087810f4a5d6c44c4b9db5e8a19c0df7`
**Follow-up report evidence:** `0adce83f296a46dddd9bdab653f96a04cd29ef26`
**Reviewer:** independent precision reviewer

## Verdict

BLOCK.

The candidate implemented the package surface and validation passed on rerun, but two Phase 5 exit criteria were not satisfied. Import accepted digest-consistent but schema-invalid package records, and export/import selection could be blocked by unrelated project evidence.

## Finding Ledger

| ID  | Priority | Status   | Finding                                                                                                                          | Required remediation                                                                                                                       |
| --- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| F1  | P1       | verified | Package import accepted digest-consistent but schema-invalid record payloads as successful imports.                              | Validate each payload record schema and ensure payload `kind`/`ref` matches the record canonical identity before planning or importing.    |
| F2  | P1       | verified | Export included project-wide evidence and marked unrelated external evidence as a blocking dependency for the selected workflow. | Limit exported evidence/dependency records to the selected workflow closure, or otherwise prevent unrelated project records from blocking. |

## Reproduction Evidence

- F1: exporting a valid package, changing the `workflow_occurrence` payload `workflow_occurrence_id` to `not-an-expflow-id`, and updating that payload digest/byte size made `validatePackage`, `planImport`, and `importPackage` succeed on the reviewed candidate.
- F2: adding an unrelated external evidence intake record caused the selected workflow package manifest to contain one external reference and a clean target import plan to block on `missing_external`.

## Verification

| Command or procedure                                                                      | Exit | Result                                             |
| ----------------------------------------------------------------------------------------- | ---: | -------------------------------------------------- |
| `git diff --check feat/build-week-integration...e95d1eb6087810f4a5d6c44c4b9db5e8a19c0df7` |    0 | PASS                                               |
| `npx vitest run tests/unit/portable-package-runtime.test.ts`                              |    0 | PASS - 3 tests                                     |
| `npm run typecheck`                                                                       |    0 | PASS                                               |
| `npm run check:protected-surfaces`                                                        |    0 | PASS                                               |
| F1 tampered digest-consistent workflow payload reproduction                               |    0 | reproduced - validation, planning, import passed   |
| F2 unrelated external evidence reproduction                                               |    0 | reproduced - clean import blocked                  |
| `npm run validate` rerun                                                                  |    0 | PASS - 22 files / 174 tests plus repository checks |

## Handoff

Parent remediation required for F1 and F2 before Phase 5 acceptance.
