# System 2 Improvements

**Status:** Gate A review-control document
**Scope:** Prevent over-expansion when a gate stalls on future-gate evidence.

System 2 improvements are design and review-control ADRs. They do not add implementation scope by themselves; they clarify how a gate should reason when evidence, maturity, and future decisions are being conflated.

## Recognizing System 2 Friction

System 2 friction appears when progress stalls because the team is debating the shape of the work instead of the next owned deliverable. It usually involves unclear maturity, later-gate decisions being pulled forward, overbroad completion wording, or a review finding that is valid only because the artifact claims too much.

Add or update a System 2 ADR when the fix is a reusable classification rule, review response, or gate-scope decision that future passes should apply before expanding work.

## Adding Or Challenging A System 2 ADR

Add a new ADR with the next `ADR-S2-###` identifier when no existing ADR covers the friction. Use this shape: `Issue`, `Decision`, `Review Response`, and, when useful, a gate-specific application.

Challenge an existing ADR when it misclassifies gate ownership, contradicts the controlling workflow source, hides a future-gate decision, or creates unnecessary current-gate scope. Because this document is mutable, revise the ADR in place, preserving the useful classification rule and deleting stale scope claims. Do not add a competing ADR for the same design rule unless the old one is being split into clearer rules.

## ADR-S2-001 Gate Maturity Classification

### Issue

Use this document when review friction appears because a gate completion claim is being interpreted as requiring all later-gate implementation decisions, fixtures, tests, or generated artifacts immediately.

Typical signals:

- a review asks the current gate to finish choices owned by later gates;
- a completion report says "complete" while the evidence only proves a harness, taxonomy, or seed corpus;
- a validation command proves parseability or coverage of existing files, but the report claims exhaustive behavior coverage;
- generated descriptors are described as full generated interfaces or runtime models;
- progress stalls because the team is expanding artifacts instead of clarifying maturity.

### Decision

When a gate stalls, classify the disputed artifact before adding scope.

| Class                   | Meaning                                                                | Correct action                                                      |
| ----------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Invariant               | A rule that later gates must preserve.                                 | Freeze it now and verify it if practical.                           |
| Decision slot           | A concrete later-gate choice.                                          | Name the slot, owner gate, and constraints; do not decide it early. |
| Harness                 | Validation machinery that proves future evidence can be checked.       | Keep the harness small and truthful about what it proves.           |
| Seed evidence           | Minimal examples or fixtures that exercise the harness.                | Preserve them as seeds and assign full coverage to the owning gate. |
| Implementation evidence | Behavior, recovery, compatibility, or security proof for runtime code. | Require it only when the owning runtime exists.                     |

### Review Response

If a finding is valid only because wording overclaims maturity, fix the wording and add the missing slot or maturity label. Do not expand the artifact to satisfy future-gate work unless the current gate owns that behavior.

If a finding exposes a missing current-gate invariant, add the invariant and verify it.

If a finding exposes missing behavior evidence for a later gate, create or reference a decision slot, fixture category, or test obligation for that later gate.

### Gate A Application

Gate A closes when it has:

- immutable architecture sources and source-integrity verification;
- frozen no-runtime, command-surface, source-immutability, core/adapter, and record-family invariants;
- machine-readable schema and registry checks;
- seeded fixtures proving the fixture harness works;
- generated schema descriptors proving schema inventory coverage;
- TypeScript and Python validation parity for supplied examples and seeded fixtures;
- future decision slots for later-gate implementation choices.

Gate A does not close by exhaustively deciding material storage, identity algorithms, transaction recovery, semantic trust policy, projection behavior, hardening policy, or end-to-end runtime proof.

### Larger-Scale Check

Before marking any future gate complete, reviewers should ask:

1. Is every "complete" claim backed by evidence at the same maturity level?
2. Are later-gate choices represented as decision slots instead of hidden assumptions?
3. Are fixture and test claims scoped to implemented behavior?
4. Are generated artifacts named according to what they actually provide?
5. Did the gate add only the evidence needed for its owning behavior?

If any answer is no, the fix is to correct the claim, add a slot, or move the obligation to the owning gate. The default fix is not to expand the current gate.

## ADR-S2-002 Universal Hook Compatibility Boundary

### Issue

The Guerilla universal-hook architecture replaces the archived bespoke-adapter direction, which can make Expflow review findings look like integration work rather than native core work.

### Decision

Expflow remains authoritative for native material transactions, restore behavior, project locks, immutable record promotion, material heads, and recovery. A future Guerilla `expflow.cli.v1` profile may classify commands, bracket invocation, capture observations, and resynchronize evidence, but it must not repair Expflow-native partial restores, stale locks, corrupt immutable paths, or `HEAD`/`project.json` divergence.

### Review Response

Fix Expflow-owned durability defects inside Expflow core without adding Guerilla hook dispatch, provider drivers, adapter idempotency, external cursors, network services, or lost-response reconciliation. Treat the locked Guerilla hook revision as a compatibility boundary reference, not as an Expflow deliverable.

## ADR-S2-003 Registry Publication Is Release State

### Issue

Release closeout can look document-complete while registry ownership, OIDC publishing identity, tag state, and GitHub Release state are still unresolved. Creating a GitHub Release before npm and PyPI are verified makes the release externally visible but not publication-complete.

### Decision

For v1 publication, npm package ownership, PyPI project or pending-publisher ownership, protected GitHub release environments, tag-to-validated-main equality, and registry verification are release-state invariants. The GitHub Release is downstream of successful npm and PyPI publication, not a substitute for it.

### Review Response

If tag or GitHub Release state exists before registry publication is verified, classify it as a release-state inconsistency. Prepare corrective repository workflow and documentation changes, but do not move tags, delete releases, rename packages, or add persistent token fallbacks without explicit owner authorization.

## ADR-S2-004 Git Substrate And Bespoke Control Boundary

### Issue

Agentic projects can accumulate databases, synchronization commands, registries, graph stores, transaction layers, or custom version-control behavior that duplicate Git without adding enough domain-specific value.

This friction often appears after review feedback says a design is Git-like, less efficient than Git, or unnecessarily coupled to a second source of truth. It can also appear when a narrow repository invariant grows into a registry, scanner, codemod, daemon, or explicit `sync` workflow even though the authoritative state already lives in versioned files.

The config-reference reconciliation work exposed the broader pattern: a marked forward reference, reverse index, staged checker, hook, and commit-range CI check can provide bidirectional integrity without a persistent synchronization subsystem.

### Decision

Before adding bespoke state or synchronization, classify the proposed capability against Git's existing substrate.

| Capability             | Prefer Git when                                                                                       | Add bespoke behavior when                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| State transition       | The change is fully represented by repository files and can be reviewed as a diff.                    | The authoritative transition occurs outside the repository or spans partially authoritative systems.    |
| History and provenance | Commits, branches, tags, and object identity provide the required record.                             | Domain identity or causal history must survive independently of Git commits or file paths.              |
| Atomicity              | One staged change or commit can contain the complete invariant-preserving transaction.                | The operation must coordinate external stores, runtime state, or recoverable partial execution.         |
| Validation             | A deterministic checker can evaluate `HEAD`, the staged index, a commit range, or a checked-out tree. | Correctness depends on remote observations, deployed state, or non-repository authority.                |
| Enforcement            | A repository-owned command can be invoked by a thin hook and verify-only CI step.                     | Enforcement requires runtime mediation, cross-system policy, or continuous observation.                 |
| Derived views          | A graph, report, or index can be rebuilt from a selected Git snapshot.                                | The view itself is authoritative, mutable, or too expensive to derive for the required operating model. |

When Git supplies the substrate, the project should own only the domain semantics:

- declarations and relationship types;
- invariant checks;
- impact analysis;
- explanations and reports;
- waivers and evidence requirements;
- optional adapters for external authority.

Do not add an explicit `sync` command merely to refresh a derived repository view. Prefer deriving the view from `HEAD`, the staged index, a commit range, or the checked-out tree.

A repository control should normally have this shape:

```text
versioned declarations
        ↓
repository-owned deterministic checker
        ↓
thin local hook
        ↓
verify-only commit-range CI
```

Hooks and CI are adapters over the same checker. They must not contain separate domain logic.

### Review Response

When review says a design duplicates Git or is strictly worse than Git for agentic use, do not defend or remove the design based on similarity alone. Classify the disputed machinery:

1. What authority exists outside Git?
2. What domain semantic cannot be derived from repository state?
3. What failure cannot be represented as a deterministic non-zero check?
4. What recovery requirement cannot be satisfied by an atomic commit or ordinary Git rollback?
5. What persistent identity must outlive commits and paths?
6. Does an explicit synchronization command reconcile real independent authorities, or only refresh a derived view?

If the answers identify no independent authority or irreducible domain requirement, remove or defer the bespoke subsystem and use Git-backed enforcement.

If the answers identify cross-system authority, runtime state, partial synchronization, causal observation, or independent identity, keep the bespoke layer but constrain it to those semantics. Do not recreate generic branching, commit history, staging, diffing, or hook orchestration inside the project.

### Project Applications

- **Config-reference reconciliation:** Git owns the transition and provenance. The repository checker owns the bidirectional reference invariant. Hooks and CI only invoke the checker.
- **Reqtrace:** For repository-native requirements, implementation, tests, and evidence, derive the trace graph from Git state and enforce it through staged and commit-range checks. Do not require `sync` for correctness unless Reqtrace is reconciling an independent external authority.
- **Expflow:** Keep bespoke workflow ownership, reconciliation, restore, and identity semantics only where they exceed ordinary Git behavior or span partial authorities. Do not recreate generic version-control mechanics without a workflow-specific invariant.
- **Guerilla:** Git may version profiles and policies, but native external systems retain authority; cross-system causal observation remains bespoke.
- **FIMP:** Git provides before/after provenance and rollback. FIMP remains responsible for file-blind conditional mutation and atomic selected application, not generic patch history.

These applications are classification guidance, not authorization to redesign the named projects during the current pass.

### Larger-Scale Check

Before approving a new subsystem, reviewers should ask:

1. Is the authoritative state already in repository files?
2. Can the invariant be checked from staged or committed Git objects?
3. Can the correction be represented as an ordinary diff?
4. Can one repository command serve direct use, hooks, and CI?
5. Is proposed persistent state authoritative or merely a cache of a derivable view?
6. Does a proposed `sync` operation reconcile independent authorities?
7. Would removing the bespoke layer lose domain semantics, or only duplicate Git mechanics?

If Git can supply state transition, provenance, review, and enforcement without losing domain semantics, use Git as the substrate. Add bespoke machinery only above that boundary.

## ADR-S2-005 System 2 Execution For Multi-Surface Repository Controls

### Issue

Some repository-control changes appear narrow but cross several semantic boundaries at once: Git index behavior, commit-range behavior, reverse indexes, hooks, CI, protected files, agent skills, and timing-sensitive tests.

These passes are vulnerable to semantically false `PASS` results. Examples include:

- a staged-only checker returning success in a clean CI checkout because there are no staged files;
- a retarget check validating the new reference but not the removed old reference;
- a target rename leaving stale inbound references because only changed source files were inspected;
- test assertions passing while the runner process still fails or times out;
- a skill reporting completion because prose was updated even though the deterministic checker still has false positives.

The problem is not task size by itself. The problem is that ordinary validation can appear green while proving the wrong state transition.

### Decision

Use System 2 execution when a repository-control change combines at least three of these conditions:

- Git index, tree, or commit-object semantics;
- bidirectional or reverse-index integrity;
- local-hook and CI enforcement parity;
- repository-local and global skill interaction;
- protected, frozen, or immutable target handling;
- migration of an already accepted invariant;
- process-heavy or timing-sensitive tests;
- multiple validation surfaces with different execution models;
- a credible risk that a passing command is semantically a no-op.

For System 2 execution:

1. Identify the repository-owned deterministic checker before changing skills, hooks, or CI.
2. Decompose each false positive into a separate invariant instead of treating the task as one general fix.
3. Preserve the exact failing evidence before editing.
4. Keep local staged mode and CI commit-range mode explicit and separate.
5. Keep hooks and CI as thin adapters over the same checker.
6. Add focused repository tests for every previously false-positive invariant.
7. Use a broader external or integration harness for cross-surface behavior, but do not let it replace core repository regression tests.
8. Distinguish assertion success from runner/process success.
9. Diagnose timeout class before increasing timeouts.
10. Base completion on reproducible final validation, not on the implementation narrative.

A working-tree inspection is diagnostic only. It is not equivalent to either staged enforcement or committed-range enforcement.

### Validation Hierarchy

A System 2 repository-control pass may report `GO` only when all applicable layers pass:

1. focused regression tests;
2. the repository checker in staged mode;
3. the same checker in commit-range mode on committed fixtures;
4. formerly failing limit or adversarial tests;
5. the broader integration or skill harness;
6. normal repository validation;
7. formatting, package, and diff checks;
8. protected-surface immutability checks;
9. hook and CI adapters invoking the declared checker with valid semantics.

A clean checkout that produces zero staged changes is not evidence that CI enforcement works.

A test run whose assertions pass but whose process exits with an error is not a passing test run.

### Timeout And Runner Response

Before changing a timeout, capture:

- the exact error;
- whether assertions finished;
- whether the failure is a per-test timeout, worker-channel timeout, process hang, or outer command timeout;
- the current worker or pool mode;
- the duration and blocking behavior of the slowest fixture.

Prefer this response order:

1. remove duplicate fixture work;
2. share or consolidate expensive repository setup;
3. replace avoidable synchronous child-process calls where practical;
4. test an appropriate worker or pool mode;
5. increase the relevant timeout only when the timeout class is confirmed;
6. repeat focused and full validation to prove the adjustment did not hide a hang.

### Review Response

When a repository-control pass stalls or runs unusually long, reviewers should not ask only whether the implementation is complex. Ask:

1. Which state transition is authoritative: working tree, staged index, or commit range?
2. Can the current checker produce a false `PASS`?
3. Are local hook and CI modes proving equivalent invariants?
4. Is every prior false positive covered by a focused repository test?
5. Is the broader harness additive evidence rather than the sole proof?
6. Did the test runner exit successfully, not merely finish assertions?
7. Was any timeout change matched to the actual timeout class?
8. Are protected and unrelated surfaces unchanged?

If these questions are unresolved, keep the pass in System 2 review and do not accept completion based on elapsed effort or agent confidence.

### Config-Reference Reconciliation Application

The config-reference reconciliation closeout is the reference application:

- staged mode compares `HEAD` with the Git index;
- CI mode compares explicit base and head commits;
- retargets require both old-target removal and new-target addition;
- target renames and deletions must verify indexed inbound sources;
- malformed markers and marker-removal bypasses are hard failures;
- skills, hooks, and CI do not duplicate checker logic;
- repository tests cover core false positives;
- the external skill-limit harness covers routing, authorization, hook-manager, and CI boundaries.

This application is evidence for the ADR, not a requirement that every future System 2 pass use the same files or tools.

### Larger-Scale Check

Before closing any multi-surface repository-control pass, verify:

1. The checker is the single correctness authority.
2. Each execution mode names the Git state it evaluates.
3. No adapter contains a second implementation of the invariant.
4. Every formerly silent partial transaction is now a hard failure.
5. Focused tests and broad harnesses have distinct, documented roles.
6. Final validation was rerun after the last meaningful edit.
7. Reports distinguish machine results from stale or narrative summaries.
8. The final verdict follows reproducible evidence rather than the duration or reasoning level of the run.
