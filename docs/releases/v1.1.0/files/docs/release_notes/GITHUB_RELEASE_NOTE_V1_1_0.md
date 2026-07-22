# Expflow v1.1.0

Expflow `v1.1.0` is a feature-bearing minor release built on the `v1.0.1` hotfix baseline.

It delivers accepted Build Week Phases 1 through 7: ordinary CLI UX corrections, a local GUI foundation, stable read models for advanced record families, evidence intake and authority reconciliation, portable workflow package export/import, evidence-backed gap closure, and a repository-owned pilot evaluation.

## What's new

### Ordinary CLI UX (Phase 1)

- `status` gives actionable human guidance and exits `0` when uninitialized.
- `sync --dry-run` reports path-level changes and provisional identities without committing.
- `status --history` and `status --node-history <path>` expose tree and node restore references.
- `restore --dry-run` previews affected paths before mutation.
- Default restore refuses conflicting unrecorded drift with exit `1`; `--force` is an explicit opt-in.
- `--move`, `--new-node`, `--replace-node`, and `--expected-head` are discoverable in `expflow sync --help`.
- Provisional preview identities are labeled wherever exposed.
- CLI errors include mutation results, recommended actions, and `status` inspection guidance.
- Machine-readable output fields are additive and backward-compatible with `v1.0.x`.

### Local GUI foundation (Phase 2)

- A local Expflow GUI is available at `apps/gui/` (repository-local, not shipped in the npm package).
- GUI reads documented application APIs and read models; it does not treat raw `.expflow` storage as a contract.
- Project selection, initialization state, material/drift views, revision history, sync/restore plan review, operation receipts, and recovery inspection are represented.
- Loading, empty, error, and recovery states are present.
- Technical-detail panels preserve canonical internal terms.

### Stable read models (Phase 3)

- Documented, versioned, deterministic read models for advanced record families.
- Stable ordering, filtering, pagination, and change inspection.
- Proposed, accepted, rejected, superseded, conflicted, stale, partial, and unknown states remain distinct.
- Application consumers use read models, not raw store classes.

### Evidence intake and authority reconciliation (Phase 4)

- Evidence intake envelope with provenance and capture method.
- Original evidence preservation; normalized records without erasing source identity.
- Authority registration and scope decisions kept distinct from inferred facts.
- Correspondence proposals, artifact clustering, conflict/duplicate/low-confidence states.
- User-controlled accept/reject/split/merge/defer operations with audit trail.
- Untrusted content and secrets handled safely.

### Portable workflow packages (Phase 5)

- Versioned manifest with deterministic integrity.
- Semantic-role and repository-relative addressing for relocation.
- Selected material/workflow references with explicit inclusion policy.
- Collision policy, path-traversal refusal, and safe archive handling.
- Round-trip tests in clean environments.

### Evidence-backed gap closure (Phase 6)

- Systematic inventory of all open Phase 1–5 findings.
- No eligible unresolved defects or severity-one pilot blockers found.
- No speculative features entered; confirmed gaps deferred to later phases.

### Pilot evaluation (Phase 7)

- One repository-owned documentation workflow completed with the ordinary CLI.
- 17 pilot commands recorded with exits, elapsed times, and summaries.
- Restore-safety refusal exercised and confirmed.
- Portability defect discovered and fixed: new project metadata no longer persists a machine-absolute `root_path`.
- Post-fix relocation smoke check passed.
- Pilot limitations (single operator, single workflow, no external participants) remain visible.

## What's fixed since v1.0.1

- P7-F1: `root_path` in new project metadata stored as `"."` instead of a machine-absolute path.
- Skill-contract checker references the correct frozen-release document location.

## What hasn't changed

- The ordinary command set remains `init`, `sync`, `status`, and `restore`.
- Restore remains byte-exact, append-only, forward-committing, and recoverable.
- Machine output compatibility with `v1.0.x` is preserved.
- Protected architecture and frozen `v1.0.1` release bodies are unchanged.
- Guerilla profile and causal event GUI remain Phase 8–9 (not included).
- The GUI is repository-local and not shipped in the npm package.

## Known limitations

- Pilot evidence comes from one operator and one repository-owned workflow.
- GUI usability has no pilot or empirical evidence.
- Multi-user, production, and broad-adoption claims are not supported.
- Portable workflow package usability with richer advanced records is follow-up work.

## Release metadata

- npm: `expflow@1.1.0`
- PyPI: `expflow-hooks@1.1.0`
- Node.js: `>=20.0.0`
- License: MIT
