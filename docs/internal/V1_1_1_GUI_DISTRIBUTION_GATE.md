# Expflow v1.1.1 GUI Distribution Gate

**Gate ID:** `V1.1.1-GUI-DISTRIBUTION`
**Gate type:** Single release gate
**Target release:** Expflow `v1.1.1`
**Target branch:** `main`
**Review procedure:** `expflow-build-week-pr-review-precision`
**Status:** Owner-authorized implementation and PR-review contract

---

## 1. Gate objective

The gate answers one question:

> Can the existing Expflow GUI be safely distributed and launched from the npm package without changing the four-command Expflow CLI contract, weakening preview-before-mutation consent, or expanding into unrelated product work?

Expflow `v1.1.0` remains immutable.

The repository-local GUI already exists and has been manually smoke-tested by the owner. The purpose of `v1.1.1` is to:

1. correct the confirmed GUI safety defects;
2. include the existing GUI in the npm package;
3. provide a supported installed launcher;
4. prove the GUI works outside a repository checkout;
5. correct current repository documentation;
6. complete one independent precision-first PR review.

This is one gate. It is not a new Build Week phase and does not authorize Phases 8–9.

---

## 2. Controlling evidence

The implementation SHALL treat the following as accepted input evidence:

```text
V1.1.0_VERIFICATION_REPORT.md
```

The report established:

- `v1.1.0` resolves to merge commit
  `a1eaaad4c226eb3722f13804ece561b8cf275378`;
- current `main` at verification time was
  `e87759a7046fd2e9ad9b8c3b5ad17b3dc3656490`;
- repository validation passed:

  - 22/22 Node test files;
  - 176/176 Node tests;
  - 9/9 Python tests;
  - repository contracts, schemas, registries, fixtures, build, package verification, and diff checks;

- the current GUI has four confirmed distribution blockers:

  - V10 — API methods are not restricted and GET can trigger mutations;
  - V11 — sync execution is not bound to the displayed preview;
  - V12 — blank roots resolve to the server working directory;
  - V15 — restore can execute without a current preview and is not bound to previewed effects;

- V14 established the absence of a structured GUI smoke-test and UX evidence document;
- V1–V4 established bounded documentation corrections;
- the CLI UX backlog is not part of `v1.1.1`.

The implementation SHALL reproduce the confirmed defects before changing them. It SHALL not repeat the entire discovery exercise unless current behavior materially differs from the accepted evidence.

---

## 3. Gate roles

### 3.1 Parent orchestrator

The parent orchestrator owns:

- repository preflight;
- branch creation;
- implementation;
- tests;
- candidate evidence;
- PR preparation;
- remediation of verified findings;
- final handoff to the owner.

DeepSeek may act as the parent orchestrator.

### 3.2 Independent reviewer

A separate read-only reviewer context SHALL conduct the gate review.

The reviewer:

- may use DeepSeek;
- MUST directly read the repository and review skill;
- MUST NOT rely on the implementation conversation;
- MUST NOT edit files;
- MUST NOT implement fixes;
- MUST attempt to falsify every suspected defect;
- MUST admit only verified, actionable defects to the finding ledger;
- MAY return `No verified findings`.

The implementation context and reviewer context MUST remain separate.

---

## 4. Gate entry conditions

Before implementation begins, the parent orchestrator SHALL record:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git describe --tags --always
git log -10 --oneline
git diff v1.1.0..main --stat
```

The entry record must include:

- exact repository root;
- exact starting commit;
- exact `v1.1.0` peeled commit;
- current branch;
- clean, staged, unstaged, and untracked state;
- current npm and Python package versions;
- current release-workflow behavior;
- known pre-existing failures, if any.

The implementation branch SHALL be created from the exact current `main` head.

Recommended branch:

```text
fix/v1.1.1-gui-distribution
```

Do not implement directly on `main`.

---

## 5. Required gate outcomes

### G1 — Restrict the local HTTP API

All current `/api/*` operations use JSON request bodies and SHALL accept `POST` only.

The server SHALL:

- reject GET, PUT, PATCH, DELETE, and unsupported methods before reading a body;
- return a deterministic `405 Method Not Allowed`;
- advertise the allowed method where appropriate;
- validate the request `Host`;
- validate browser `Origin` when present;
- require a random per-launch request token;
- reject missing or incorrect tokens before invoking an application operation;
- remain bound to a loopback interface by default;
- avoid exposing tokens in logs, URLs, or rendered technical details.

A request rejected at this boundary MUST NOT:

- initialize a project;
- sync;
- restore;
- recover;
- create `.expflow/`;
- modify the selected working tree;
- invoke the GUI bridge operation.

Required regression cases include:

```text
GET /api/init
GET /api/status
PUT /api/init
OPTIONS /api/init
POST without token
POST with incorrect token
POST with invalid Origin
POST with invalid Host
```

The tests SHALL verify both the response and the absence of filesystem mutation.

---

### G2 — Require an explicit project root

The GUI/API boundary SHALL reject:

- omitted root;
- empty root;
- whitespace-only root;
- roots containing invalid characters;
- roots that cannot be resolved to an acceptable local directory.

The GUI SHALL:

- require a nonempty project path before inspection or mutation;
- display the resolved absolute path;
- prevent initialization until the root has been inspected;
- require confirmation that names the resolved path;
- never silently substitute `process.cwd()` for a GUI-supplied blank root.

Library and ordinary CLI defaults do not need to change unless required by an existing contract. This requirement applies to the installed GUI boundary.

Required negative tests SHALL prove that blank-root requests cannot create `.expflow/` in:

- the package installation directory;
- the process working directory;
- the Expflow source checkout;
- an unrelated temporary directory.

---

### G3 — Bind sync execution to the preview

A sync commit SHALL represent the plan the user approved.

A successful sync preview SHALL produce an execution binding containing at least:

```text
expectedHead
expectedCandidateDigest
```

A server-held opaque plan token may be used in addition to or instead of directly exposing the digest, provided the resulting contract remains deterministic and testable.

During execution:

1. acquire the normal mutation lock;
2. verify the expected Expflow head;
3. recompute the candidate under the lock;
4. compare the recomputed candidate with the preview binding;
5. refuse execution if the head or candidate differs;
6. require a new preview after refusal.

The refusal SHALL:

- be non-mutating;
- use a specific recoverable error code;
- explain that the working tree changed after preview;
- recommend running Preview again.

Required tests:

- unchanged preview commits successfully;
- Expflow head changed after preview;
- file content changed after preview;
- file added after preview;
- file removed after preview;
- identity directive changed after preview;
- stale token or digest reused after successful commit;
- commit attempted without a preview.

---

### G4 — Bind restore execution to the preview

Restore execution SHALL require a current preview.

A successful restore preview SHALL produce an execution binding covering at least:

- selected reference;
- resolved source;
- current head;
- target path, when applicable;
- overwrite/force choice;
- path effects;
- conflicting paths;
- preserved drift paths;
- plan fingerprint or opaque plan token.

During execution:

1. acquire the normal mutation lock;
2. recompute the restore plan;
3. compare the current plan with the approved preview;
4. refuse when the source, head, path effects, conflicts, force requirement, or target path changed;
5. require another preview after refusal.

The GUI Restore button SHALL remain unavailable until a valid current preview exists.

Changing any relevant input SHALL invalidate the preview, including:

- root;
- restore reference;
- target path;
- force selection;
- current head;
- working-tree state.

Required tests:

- restore without preview is refused;
- unchanged preview executes successfully;
- working tree changes after preview;
- Expflow head changes after preview;
- reference changes after preview;
- force choice changes after preview;
- target path changes after preview;
- preview token is reused after execution;
- conflict status changes after preview.

Restore MUST remain:

- byte-exact;
- forward-committing;
- append-only;
- recoverable;
- non-destructive to recorded history;
- refusing conflicting unrecorded drift by default.

---

### G5 — Distribute the existing GUI through npm

The npm package SHALL include the existing GUI runtime assets required for installed operation.

The installed launcher SHALL be:

```text
expflow-gui
```

It SHALL be a separate npm `bin` entry.

The ordinary command surface SHALL remain exactly:

```text
expflow init
expflow sync
expflow status
expflow restore
```

Do not add `expflow gui` without a separate architecture and compatibility decision.

The installed launcher SHALL:

- start the local GUI server;
- locate packaged static assets without relying on a repository checkout;
- locate the built Expflow library from the installed package;
- print the loopback URL;
- print no secret token value unless the launch design requires a one-time browser handoff that does not expose it in durable shell history;
- exit clearly when the required assets are missing;
- support an explicit port override;
- fail safely when the port is unavailable.

The implementation MAY preserve the existing relative asset layout when package verification proves that it works after installation.

Do not redesign the GUI.

---

### G6 — Prove the packed npm artifact

Verification SHALL use the exact generated npm tarball, not source-tree execution alone.

Required sequence:

```bash
npm ci
npm run validate
npm pack
```

Install the exact tarball into a clean temporary directory.

The external package test SHALL verify:

- package version is `1.1.1`;
- `expflow` binary still works;
- `expflow-gui` binary exists;
- GUI assets are present;
- the server starts from the installed package;
- the browser shell is served;
- the API token and request boundary work;
- a disposable project can be inspected and initialized;
- sync preview and bound execution work;
- history loads;
- restore preview and bound execution work;
- receipts can be inspected;
- the installed package does not depend on the source checkout;
- `apps/gui/` source-only files not required at runtime are not accidentally included.

The installed-package smoke test SHALL run through `package:verify` or an equally mandatory repository validation command.

---

### G7 — Create structured GUI verification evidence

Create a repository-owned GUI smoke-flow document.

It SHALL cover:

- entry points;
- project-root selection;
- uninitialized state;
- initialization;
- clean and drifted status;
- sync preview;
- sync execution;
- stale-preview refusal;
- history;
- restore preview;
- restore execution;
- restore conflict refusal;
- receipt inspection;
- server/request errors;
- blank-root refusal;
- unsupported-method refusal;
- installed-package launch;
- shutdown.

For every flow, record:

- setup;
- action;
- expected result;
- expected mutation state;
- expected error state where applicable;
- automated test or manual evidence reference.

The owner’s prior test may be recorded as:

```text
Owner-performed manual GUI smoke test passed on the tested repository-local flows.
```

Do not describe it as:

- independent usability evidence;
- external pilot evidence;
- empirical evaluation;
- production support;
- installed-package verification.

---

### G8 — Correct current repository documentation

The gate SHALL make the bounded corrections confirmed by V1–V4.

Required corrections include:

- status matrix:

  - `v1.1.0` is the current release, not a release candidate;
  - Phases 1–7 are merged into `main`;
  - PR #25 is merged;
  - the old integration branch is historical;

- Build Week workflow:

  - preserve `v1.0.1` as the historical starting baseline;
  - state that Phases 1–7 shipped in `v1.1.0`;
  - mark the workflow paused after BW-C;
  - state that Phases 8–9 are not currently authorized;

- `SECURITY.md`:

  - include `1.1.x` in the supported-version table;
  - leave the status of `1.0.x` to an explicit owner decision;

- `README_DEV.md`:

  - repair the four confirmed stale paths;

- root and GUI README:

  - document npm installation and `expflow-gui`;
  - distinguish the released package instructions from source-checkout development instructions;
  - preserve the four-command CLI boundary.

Frozen `v1.1.0` release provenance MUST NOT be rewritten.

---

## 6. Versioning and publication boundary

The owner intent is:

```text
v1.1.1 = npm distribution of the existing GUI
```

The default release decision SHALL therefore be:

```text
expflow npm package:       1.1.1
expflow-hooks PyPI package: remains 1.1.0
```

The implementation SHALL inspect and update release automation so that the `v1.1.1` release does not silently:

- republish `expflow-hooks@1.1.0`;
- fabricate `expflow-hooks@1.1.1` without a Python-package change;
- require synchronized npm/PyPI versioning without recording an owner decision.

Before the gate candidate is declared, the candidate report SHALL state exactly:

- which package versions changed;
- which registries will receive a publication;
- how the GitHub Release will be created;
- which artifacts will be attached;
- why the Python package is or is not part of `v1.1.1`.

A coordinated Python `1.1.1` release requires a separate explicit owner decision and a legitimate Python-package release reason.

---

## 7. Out-of-scope work

The gate MUST NOT include:

- GUI redesign;
- desktop packaging;
- Electron, Tauri, or another desktop framework;
- accounts, network services, databases, or brokers;
- a fifth `expflow` subcommand;
- restore aliases such as `tree:previous`;
- human project labels;
- per-revision history summaries;
- provisional-ID redesign;
- advanced evidence or workflow UI expansion;
- Guerilla integration;
- Build Week Phase 8;
- Build Week Phase 9;
- changes to immutable `v1.1.0` release evidence;
- unrelated refactoring.

Scope leakage is a gate finding.

---

## 8. Candidate PR contract

One pull request SHALL carry the complete gate.

Recommended title:

```text
release: Expflow v1.1.1 GUI distribution gate
```

The PR SHALL target:

```text
main
```

The PR body SHALL include:

- objective;
- exact base and head;
- V10, V11, V12, and V15 closure mapping;
- npm package and launcher changes;
- versioning and registry decision;
- validation table;
- installed-tarball evidence;
- GUI smoke-flow evidence;
- documentation corrections;
- known limitations;
- explicit exclusions;
- release sequence after merge.

The PR SHOULD remain draft until:

- implementation is complete;
- tests are complete;
- candidate evidence is committed;
- the worktree is clean;
- the exact candidate head is stable.

---

## 9. Required candidate validation

At minimum, run:

```bash
npm ci
npm run validate

python -m pip install -e ".[dev]"
python -m pytest

npm pack
npm run package:verify

git diff --check -- ':!docs/architecture/**'
git status --short
```

The candidate evidence SHALL also include:

- API negative-test results;
- blank-root mutation checks;
- sync binding tests;
- restore binding tests;
- exact packed-file list;
- clean external installation;
- installed `expflow --version`;
- installed `expflow-gui` launch;
- GUI happy-path smoke result;
- package and release version inventory.

Every claimed PASS must identify the exact command and evaluated result.

---

## 10. Precision PR review

The gate review SHALL use:

```text
.agents/skills/expflow-build-week-pr-review-precision/SKILL.md
```

The reviewer MUST directly open and read the skill before substantive review.

### 10.1 Review assignment

Use:

```text
Assigned phase: Release Gate v1.1.1 — GUI Distribution Ready
Review type: gate
```

### 10.2 Reviewer packet

The parent orchestrator SHALL provide:

- exact skill path;
- repository root;
- exact base revision;
- exact head revision;
- merge base;
- exact diff range;
- this gate contract;
- corrected `V1.1.0_VERIFICATION_REPORT.md`;
- candidate completion report;
- changed-file summary;
- known limitations;
- known pre-existing failures;
- validation commands and evaluated states;
- PR number and URL.

The packet is orientation only. The reviewer MUST inspect the repository directly.

### 10.3 Required skill attestation

The review MUST begin with:

```markdown
## Skill attestation

- Skill: `expflow-build-week-pr-review-precision`
- Skill version: `1.1.0`
- Review mode: `precision-first`
- Assigned phase: `Release Gate v1.1.1 — GUI Distribution Ready`
- Review type: `gate`
- Base: `<exact base revision>`
- Head: `<exact head revision>`
- Diff: `<base>...<head>`
- Authority read: `<AGENTS.md, active workflow, active status, this gate contract, verification report, candidate report, relevant compatibility and release sources>`
- Reviewer mode: `read-only`
```

### 10.4 Required review contents

The review SHALL include:

1. skill attestation;
2. target and scope audit;
3. authority and compatibility audit;
4. verified-finding ledger or explicit `No verified findings`;
5. V10 request-boundary audit;
6. V12 root-safety audit;
7. V11 sync-consent audit;
8. V15 restore-consent audit;
9. npm package and installed-launch audit;
10. versioning and publication audit;
11. test and evidence audit;
12. documentation and claim audit;
13. verification commands;
14. limitations;
15. verdict;
16. provider-neutral remediation handoff when findings exist.

The reviewer SHALL attempt to falsify every suspicion before admitting it.

Preferences, questions, speculative hardening, and future ideas do not belong in the verified-finding ledger.

---

## 11. Finding closure

If the first gate review returns verified findings:

1. freeze the finding ledger;
2. implement only the confirmed remediation and necessary regression tests;
3. do not reopen unrelated scope;
4. run focused checks;
5. rerun full required validation when material behavior changed;
6. commit a stable remediation head;
7. request a focused skill-compliant re-review.

The re-review packet SHALL include:

- prior finding IDs;
- exact prior reviewed head;
- exact remediation head;
- focused diff;
- remediation evidence;
- updated validation table.

One bounded remediation pass and one focused re-review are authorized.

If verified findings remain after the focused re-review, the gate status is:

```text
FAIL — OWNER DECISION REQUIRED
```

Do not create an unlimited review loop.

---

## 12. Gate PASS criteria

The gate passes only when all of the following are true:

- V10 is closed with verified request-boundary tests;
- V12 is closed with verified blank-root refusal;
- V11 is closed with verified preview-bound sync execution;
- V15 is closed with verified preview-bound restore execution;
- `expflow-gui` launches from the exact packed npm artifact;
- the four-command `expflow` CLI contract is unchanged;
- the GUI works without a repository checkout;
- GUI assets and launcher are included intentionally;
- installed-package smoke testing passes;
- the structured GUI smoke-flow document exists;
- V1–V4 documentation corrections are complete;
- Phases 8–9 remain deferred;
- npm/PyPI publication behavior is explicit;
- all required local validation passes;
- PR CI passes on the exact reviewed head;
- the precision review ledger is empty;
- the reviewer verdict is `PASS`;
- the PR head has not changed after the passing review, except for explicitly reviewed evidence-only changes;
- the worktree is clean;
- remaining limitations are accurately stated.

---

## 13. Gate FAIL conditions

The gate fails when any of these remain:

- a non-POST request can invoke an API operation;
- a missing or invalid token can invoke an API operation;
- an invalid Origin or Host is accepted contrary to the approved contract;
- a blank root can target `process.cwd()`;
- sync can commit content different from the approved preview;
- restore can execute without a current approved preview;
- restore execution can differ materially from the approved plan without refusal;
- installed `expflow-gui` depends on the source checkout;
- npm packaging breaks the existing CLI or package exports;
- Python is republished without an explicit release decision;
- a verified PR-review finding remains open;
- required tests or evidence are absent;
- Phase 8–9 or unrelated feature work enters the PR;
- the review response is not skill-compliant.

An invalid or prose-only review MUST NOT be interpreted as PASS.

---

## 14. Merge and release sequence

A passing gate authorizes a recommendation to merge. It does not itself authorize repository writes or publication.

After explicit owner approval:

1. confirm the exact reviewed PR head;
2. confirm all required PR checks pass;
3. merge through the protected `main` workflow;
4. confirm post-merge CI on the exact `main` commit;
5. update any permitted post-merge status evidence;
6. create the annotated `v1.1.1` tag on the exact validated `main` commit;
7. push the tag through the trusted release workflow;
8. publish `expflow@1.1.1` to npm;
9. do not publish Python unless explicitly authorized;
10. verify public npm metadata;
11. install `expflow@1.1.1` from the public registry in a clean environment;
12. run `expflow --version`;
13. run `expflow-gui`;
14. complete the public installed-GUI smoke flow;
15. verify the GitHub Release and attached artifacts;
16. record final release evidence.

Do not move or recreate `v1.1.0`.

---

## 15. Required completion response

The parent orchestrator SHALL return:

### 1. Repository identity

- exact starting commit;
- exact final candidate commit;
- branch;
- merge base;
- PR number and URL.

### 2. Files changed

- complete file list;
- grouped by runtime, GUI, tests, package, workflow, and documentation.

### 3. Finding closure

| Finding | Correction | Tests | Status |
| ------- | ---------- | ----- | ------ |
| V10     | ...        | ...   | CLOSED |
| V11     | ...        | ...   | CLOSED |
| V12     | ...        | ...   | CLOSED |
| V15     | ...        | ...   | CLOSED |

### 4. Package result

- npm version;
- tarball name;
- file count;
- GUI asset paths;
- binary entries;
- clean-install result.

### 5. Security result

- method enforcement;
- token enforcement;
- Origin enforcement;
- Host enforcement;
- rejected-request mutation proof.

### 6. Consent-binding result

- sync preview binding;
- restore preview binding;
- stale-plan refusal behavior;
- error codes and remediation guidance.

### 7. Validation

- exact commands;
- exact pass/fail results;
- test counts;
- CI result.

### 8. Review

- reviewer skill attestation;
- exact reviewed base/head;
- verified-finding ledger;
- review verdict;
- re-review result where applicable.

### 9. Documentation

- V1–V4 corrections;
- GUI smoke-flow document;
- final workflow status;
- remaining limitations.

### 10. Release boundary

- npm publication plan;
- Python publication decision;
- GitHub Release plan;
- confirmation that Phases 8–9 remain deferred.

### 11. Final gate status

Choose exactly one:

```text
PASS — READY FOR OWNER MERGE AUTHORIZATION
FAIL — VERIFIED FINDINGS REMAIN
FAIL — VALIDATION INCOMPLETE
FAIL — SCOPE OR RELEASE BOUNDARY VIOLATION
```
