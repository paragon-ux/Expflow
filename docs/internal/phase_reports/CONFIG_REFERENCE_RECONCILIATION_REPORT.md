# Config Reference Reconciliation Report

## Result

PASS

## Baseline

- Commit: `ba7292e9616a055ed5e25da8734c2b49a9f66ec9`
- Version: Expflow `v1.0.1`
- Working-tree state: Build Week activation changes were already present and unstaged before this task. This task staged only the config-reference reconciliation implementation and directly related governance files for staged-check validation.

## Initial Reconciliation

| Category                                      | Count |
| --------------------------------------------- | ----: |
| Candidate references reviewed                 |    31 |
| Marked governed source-target pairs           |     5 |
| Ordinary links left unmarked                  |    14 |
| Ambiguous or stale candidates left unresolved |    12 |
| Mutable target indexes created or updated     |     4 |
| Protected sidecar sections created or updated |     0 |

Unresolved candidates were not marked because they point to removed legacy active docs or historical filenames whose current authority cannot be chosen silently:

- `.agents/skills/expflow-testing-security-migration/SKILL.md`: `docs/SECURITY_MODEL.md`, `docs/ERROR_REGISTRY.md`, `docs/TEST_MATRIX.md`, `docs/CODEX_BUILD_PLAN.md`
- `.agents/skills/expflow-projections-reproduction/SKILL.md`: `docs/WORKFLOW_AND_PROJECTION_MODEL.md`
- `.agents/skills/expflow-material-storage-sync/SKILL.md`: `docs/DATA_MODEL.md`, `docs/IDENTITY_AND_REVISION_MODEL.md`, `docs/MATERIAL_RECORD_FORMAT.md`, `docs/STORAGE_AND_RECOVERY.md`
- `.agents/skills/expflow-contracts-protocol/SKILL.md`: `docs/ARCHITECTURE_DECISIONS.md`
- `.agents/skills/expflow-authority-semantics-workflows/SKILL.md`: `docs/AUTHORITY_AND_SEMANTIC_MODEL.md`, `docs/WORKFLOW_AND_PROJECTION_MODEL.md`

## Checker Validation

- Staged source reads confirmed by focused tests and repository command.
- Staged target reads confirmed by focused tests.
- Added-reference, removed-reference, retarget, source-rename, protected-sidecar, missing-target, malformed-index, marker-binding, JSON-object, and unstaged-repair cases are covered by `tests/unit/config-reference-checker.test.ts`.
- Bypass behavior: no bypass flag was added; the skill forbids `git commit --no-verify`.

## Files Created

- `.agents/skills/config-reference-reconciliation/SKILL.md`
- `docs/internal/CONFIG_REFERENCE_RECONCILIATION.md`
- `docs/internal/PROTECTED_CONFIG_REFERENCE_INDEX.md`
- `docs/internal/phase_reports/CONFIG_REFERENCE_RECONCILIATION_REPORT.md`
- `tests/unit/config-reference-checker.test.ts`
- `tools/check-config-references.ts`
- `tools/hooks/pre-commit-config-references`

## Files Modified

- `AGENTS.md`
- `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md`
- `docs/internal/CURRENT_STATUS_MATRIX.md`
- `docs/internal/GLOSSARY.md`
- `docs/internal/REPOSITORY_ACTIVATION_CHECKLIST.md`
- `docs/internal/phase_prompts/PHASE_01_UX_UI_FIXES.md`
- `package.json`
- `tsconfig.test.json`

## Tests

- `npm test -- config-reference-checker` - PASS, 12 tests.
- `npm run check:config-references` - PASS against the staged snapshot.

## Repository Validation

- `npm run validate` - PASS.
- Covered format, lint, typecheck, 105 Vitest tests, source integrity, registries, schemas, examples, fixtures, TypeScript build, and package verification.

## Immutability Checks

- `docs/releases/`: not modified by this task.
- `docs/architecture/`: not modified by this task.
- Evidence report bodies: not modified by this task.
- Package metadata: package version remains `1.0.1`.

## Hook Status

PROVIDED_LOCAL_INSTALL

No hook manager exists in this repository. The tracked wrapper `tools/hooks/pre-commit-config-references` is provided for local installation. The authoritative command is `npm run check:config-references`.

## Known Limitations

Unmarked references are outside ongoing hook enforcement after the initial pass. Existing stale repository-skill references remain unresolved until their document authority is explicitly chosen.

## Unchanged Facts

- Expflow remains `v1.0.1`.
- Phase 1 runtime implementation was not started.
- Frozen release documents remain unchanged.
- Immutable architecture remains unchanged.
- No evidence report body was edited.
- No registry or codemod system was added.
- No hook bypass was used.

## Final Verdict

GO
