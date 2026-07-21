# Documentation Update Report

**Date:** 2026-07-20  
**Baseline:** Expflow `v1.0.1`  
**Result:** PASS — canonical Markdown documentation updated from reviewed evidence

## Evidence consumed

- Kimi `BATCH_PROCESSING_REPORT.md`
- `DOCUMENTATION_CHANGE_REQUESTS.md` DOC-01 through DOC-10
- `IMPLEMENTATION_FINDINGS.md`
- `REVIEW_DISPOSITION_MATRIX.md`
- `REVIEWS_INDEX.md`
- Kimi process output and `wire.jsonl` as process-audit material only

## Files modified

- `README.md`
- `AGENTS.md`
- `docs/external/overviews/PRODUCT_OVERVIEW.md`
- `docs/external/overviews/FUNCTIONAL_OVERVIEW.md`
- `docs/external/narratives/END_TO_END_NARRATIVE.md`
- `docs/external/narratives/SYSTEM_BOUNDARIES.md`
- `docs/internal/CURRENT_STATUS_MATRIX.md`
- `docs/internal/REPOSITORY_DIRECTORY_STRUCTURE.md`
- `docs/internal/GLOSSARY.md`
- `docs/internal/phase_prompts/PHASE_01_UX_UI_FIXES.md`

## Claim-status changes

- The Product Overview now discloses the ordinary CLI boundary without weakening Expflow's category-level utility.
- Restore remains available and verified, but ordinary discovery, preview, and drift consent are explicitly incomplete.
- The end-to-end narrative labels each major step as current, library-available, or specified/planned.
- The `v1.0.0` restore collision is retained as historical and not represented as a `v1.0.1` defect.

## Accepted decisions

- Keep uninitialized `status` at exit `0`; clarify the read-only query versus mutation contract.
- Preserve exact forward-commit restore while adding preview and conflicting-drift consent.
- Make provisional preview identity explicit to machine and human consumers.
- Use **Expflow GUI** externally and `apps/gui/` internally; `Expflow Studio` remains unapproved.

## Unchanged facts

- No runtime source or behavior was changed.
- Expflow remains at `v1.0.1`.
- Phase 1 remains the only authorized implementation phase.
- GUI, evidence intake, portability, pilot, Guerilla profile, and Guerilla GUI remain later-phase work.
- Architecture and the four-command boundary remain unchanged.

## Evidence-organization follow-up

Kimi subsequently organized the paired `Expflow-Test/` evidence set into:

- `reports/`;
- `sandboxes/`;
- `fixtures/`;
- `local-reference/`;
- `Kimi Meta-Review/`.

Canonical navigation and placement controls were updated to reflect that final layout. The organization preserves report bodies and sandbox state, keeps the Codex duplicate marked and intact, and separates graded evidence from process-only instructions and traces.

No runtime source, evidence report body, finding disposition, architecture, or implementation status changed in this follow-up.

## Repository-activation correction

A subsequent Codex review returned `CONDITIONAL GO` for Phase 1. The package content was judged sufficiently explicit, but two repository-handoff defects remained:

1. the active repository could still point to the historical Gate D workflow because the Build Week controls had not been installed at repository root;
2. the Phase 1 prompt used pre-organization evidence paths rather than `Expflow-Test/Kimi Meta-Review/`.

This revision corrects both:

- Phase 1 now uses the finalized evidence paths;
- `REPOSITORY_ACTIVATION_CHECKLIST.md` is a mandatory pre-build gate;
- root governance must point to `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md`;
- the merge instructions provide a root-safe overlay and preserve the product README;
- a nested documentation package is explicitly non-authoritative until activated.

The documentation is now package-complete and provides the controls required to make an active repository Phase 1-ready. The active repository itself remains unmodified until the overlay is applied and the checklist passes.
