# Referential Documents Ledger — v1.2.0

Documents updated to reflect `v1.2.0` as the current release.

| Document | Path | Change |
|----------|------|--------|
| README.md | `/` | Current release, install commands, version output, release note links |
| CHANGELOG.md | `/` | Added v1.2.0 section |
| CURRENT_STATUS_MATRIX.md | `docs/internal/` | Updated current release paragraph |
| BUILD_WEEK_WORKFLOW_CURRENT.md | `docs/internal/` | Added v1.2.0 completion note |
| build-week README | `docs/build-week/` | Updated baseline, purpose |
| Documentation Update Report | `docs/build-week/` | Updated baseline |
| Product Overview | `docs/external/overviews/` | Updated product description, status table |
| Functional Overview | `docs/external/overviews/` | Updated command contracts heading |
| Engineering Overview | `docs/external/overviews/` | Updated current-state table |
| End-to-End Narrative | `docs/external/narratives/` | Updated proof status |
| v1.2.0 Release Note | `docs/releases/v1.2.0/` | Created frozen release note |

## Frozen releases (NOT modified)

- `docs/releases/v1.1.0/` — frozen v1.1.0 release evidence
- `docs/releases/v1.0.1/` — frozen v1.0.1 release evidence
- `docs/internal/phase_prompts/` — historical phase prompts
- `docs/internal/phase_reports/` — historical phase reports

## Version surfaces (verified correct)

- `package.json` → `1.2.0`
- `src/core/version.ts` → `'1.2.0'`
- `pyproject.toml` → `1.1.0` (intentionally skipped)
- `.github/workflows/release.yml` — dynamic, reads from package.json
