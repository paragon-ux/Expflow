# Agentic Code Project Set — Documentation Index

**Document role:** Package index for the canonical documentation set and paired `Expflow-Test/` evidence  
**Primary project focus:** Expflow  
**Project set:** Expflow, Guerilla, FIMP, and Reqtrace  
**Current implementation baseline:** Expflow `v1.2.1`  
**Current post-baseline state:** Evidence review complete; no Build Week implementation changes claimed  
**Canonical format:** Markdown

---

## 1. Purpose

This README explains how the canonical documentation set and the paired `Expflow-Test/` evidence relate, which materials are authoritative, and how human readers and agents should navigate the package.

> **Repository activation:** This package is not automatically the active repository source of truth. Before Phase 1 begins, install or merge the controls into the active Expflow repository root and pass `docs/internal/REPOSITORY_ACTIVATION_CHECKLIST.md`. A nested package with correct documents does not override older root governance.

The package separates four different jobs:

1. **External overviews** explain the utility of the project set by product category.
2. **Product narratives** explain how the projects relate, combine, and enter adoption.
3. **Internal controls** govern the current Expflow implementation workflow.
4. **`Expflow-Test/` evidence** preserves independent UX, engineering, functional, sandbox, and disposition evidence without becoming normative architecture.

The documents are intentionally separated. External documents should be understandable without protocol knowledge. Internal documents retain exact engineering terms and execution constraints.

---

## 2. Project-set mental model

The common mental model is a persistent project filesystem and its surrounding native systems:

```text
Human / Model / CI
        |
        +--> Reqtrace: behavioral-control ACI
        +--> FIMP: conditional-mutation ACI
        +--> Expflow: workflow version-control ACI
        |
        v
Persistent project data plane
filesystem / Git / tests / documents / native stores
        |
        +--> Guerilla: profile-driven causal event view
```

The roles are distinct:

- **Reqtrace** preserves behavioral control through bidirectional traceability.
- **FIMP** safely localizes, reviews, validates, and publishes one complete multi-hunk mutation while batching JIT context for actual ambiguities.
- **Expflow** preserves portable workflow identity, authority, decisions, and history across virtual and material artifacts.
- **Guerilla** records causal events across profiled native operations without replacing their authority.

The filesystem, Git, tests, documents, and native stores remain the persistent data plane. The project set does not replace them with one monolithic platform.

---

## 3. Archive map

### Archive 1 — External Overviews

**Archive:** `AGENTIC_CODE_EXTERNAL_OVERVIEWS_MD.zip`

**Purpose:** Explain what each project improves within its existing tool category and what a user gains from the improvement.

| Document                  | Primary question                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `PRODUCT_OVERVIEW.md`     | What category-level problem does the project set solve, and why are there four projects? |
| `UX_OVERVIEW.md`          | What does the user experience before, during, and after each system acts?                |
| `ENGINEERING_OVERVIEW.md` | Which architectural mechanisms create the claimed utility?                               |
| `FUNCTIONAL_OVERVIEW.md`  | What functions exist, what outcomes do they guarantee, and what is their proof status?   |

These documents are external and non-normative. They use task-oriented language and should not be treated as schema or protocol definitions.

**Format rule:** Markdown is canonical. The current archive is Markdown-only; earlier DOCX exports are superseded convenience copies.

---

### Archive 2 — Product Narratives

**Archive:** `AGENTIC_CODE_PRODUCT_NARRATIVES_MD.zip`

**Purpose:** Explain the product boundaries, integrated story, pilot, and progressive adoption path.

| Document                     | Primary question                                                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `SYSTEM_BOUNDARIES.md`       | Which system owns each concern, and what must each system not absorb?                                                            |
| `END_TO_END_NARRATIVE.md`    | How do Reqtrace, Guerilla, FIMP, native validation, and Expflow reinforce one another in one realistic workflow?                 |
| `PILOT_AND_ADOPTION_PLAN.md` | Why is Expflow the first adoption point, what must the pilot prove, and how can the rest of the system be adopted progressively? |

The integrated narrative is not a mandatory deployment topology. Each project must retain independent utility.

---

### Archive 3 — Internal Controls

**Archive:** `AGENTIC_CODE_INTERNAL_CONTROLS_MD.zip`

**Purpose:** Govern the post-`v1.2.1` Expflow Build Week implementation cycle.

| Document                                | Internal role                                                                                                                                 |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `BUILD_WEEK_WORKFLOW_CURRENT.md`        | Current phase sequence, gates, invariants, evidence requirements, and stop conditions.                                                        |
| `CURRENT_STATUS_MATRIX.md`              | Exact implementation, exposure, pilot, empirical-evaluation, and production-support status.                                                   |
| `REPOSITORY_DIRECTORY_STRUCTURE.md`     | Placement rules for external docs, internal controls, architecture, source, future GUI/profile slots, generated output, and local references. |
| `GLOSSARY.md`                           | Canonical internal vocabulary and the external-term translation boundary.                                                                     |
| `phase_prompts/PHASE_01_UX_UI_FIXES.md` | The only currently authorized implementation phase.                                                                                           |
| `REPOSITORY_ACTIVATION_CHECKLIST.md`    | Pre-build gate proving that the controls and evidence paths are active from the repository root.                                              |

These documents use exact internal terms. They are execution controls rather than product marketing.

### Paired evidence set — `Expflow-Test/`

**Purpose:** Preserve independent reports, sandboxes, evidence grading, reproduction results, and disposition inputs for Phase 1.

The evidence set includes work from Kimi, Claude, Codex/ChatGPT, DeepSeek Max, GitHub Copilot, and ChatGPT. Report count alone is not treated as corroboration: `REVIEWS_INDEX.md` grades method and evidence quality, marks duplicates, and distinguishes live reproduction from document-derived analysis.

The finalized evidence layout is:

```text
Expflow-Test/
├── reports/
│   ├── README.md
│   └── # Seven independent review and test reports
├── sandboxes/
│   ├── kimi-v1.1.0-reverification/
│   └── # Codex, DeepSeek Max, and Kimi evidence trees
├── fixtures/
│   └── README.md
├── local-reference/
│   ├── README.md
│   ├── KIMI_BATCH_ACTION_REVIEW_REVISED.md
│   └── CHATGPT_DOCUMENTATION_ACTION_PLAN.md
└── Kimi Meta-Review/
    ├── REVIEWS_INDEX.md
    ├── REVIEW_DISPOSITION_MATRIX.md
    ├── IMPLEMENTATION_FINDINGS.md
    ├── DOCUMENTATION_CHANGE_REQUESTS.md
    └── BATCH_PROCESSING_REPORT.md
```

| Location                                            | Role                                                                                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `reports/`                                          | Preserved review and test reports. Report contents remain evidence and are not editorially normalized.                               |
| `sandboxes/`                                        | Reproducible command, filesystem, and `.expflow` state evidence.                                                                     |
| `fixtures/`                                         | Reserved evidence-fixture location. Fixture-like files may remain inside sandboxes when moving them would weaken evidence integrity. |
| `local-reference/`                                  | Process instructions and ownership plans excluded from evidence grading.                                                             |
| `Kimi Meta-Review/REVIEWS_INDEX.md`                 | Inventory, method, tested version, evidence grade, duplicate status, and corroboration map.                                          |
| `Kimi Meta-Review/REVIEW_DISPOSITION_MATRIX.md`     | Finding classification, reproduction result, decision, and Phase 1 recommendation.                                                   |
| `Kimi Meta-Review/IMPLEMENTATION_FINDINGS.md`       | Confirmed defects, valid behavior with inadequate UX, compatibility decisions, future concerns, and unreproduced findings.           |
| `Kimi Meta-Review/DOCUMENTATION_CHANGE_REQUESTS.md` | Structured requests routed to the canonical documentation owner.                                                                     |
| `Kimi Meta-Review/BATCH_PROCESSING_REPORT.md`       | Evidence-maintenance completion report, organization record, and unchanged-facts statement.                                          |

The preserved Codex duplicate remains inside its sandbox and is marked as a duplicate in the index; it must not be counted as independent corroboration.

`wire.jsonl`, raw model-output files, and similar traces belong under `local-reference/` when retained. They may help inspect how a review was produced, but they are not product evidence, normative sources, or external-release documentation.

---

## 4. Recommended reading orders

### First-time human reader

1. This `README.md`
2. `PRODUCT_OVERVIEW.md`
3. `UX_OVERVIEW.md`
4. `SYSTEM_BOUNDARIES.md`
5. `END_TO_END_NARRATIVE.md`
6. `PILOT_AND_ADOPTION_PLAN.md`
7. `FUNCTIONAL_OVERVIEW.md`
8. `ENGINEERING_OVERVIEW.md`

This path starts with utility and perceived experience, then exposes boundaries, integrated behavior, proof status, and engineering detail.

### Technical reviewer

1. `SYSTEM_BOUNDARIES.md`
2. `ENGINEERING_OVERVIEW.md`
3. `FUNCTIONAL_OVERVIEW.md`
4. `CURRENT_STATUS_MATRIX.md`
5. `GLOSSARY.md`
6. Normative architecture, schemas, registries, and protocol sources in the repositories

### Implementing agent

1. `AGENTS.md`
2. Repository governance and immutable architecture
3. `BUILD_WEEK_WORKFLOW_CURRENT.md`
4. `CURRENT_STATUS_MATRIX.md`
5. `GLOSSARY.md`
6. Active phase prompt
7. Relevant source and tests
8. External UX and Product documents for user-facing language only
9. Review reports as findings to reproduce, not as authority

### Product or pilot reviewer

1. `PRODUCT_OVERVIEW.md`
2. `END_TO_END_NARRATIVE.md`
3. `PILOT_AND_ADOPTION_PLAN.md`
4. `FUNCTIONAL_OVERVIEW.md`
5. `CURRENT_STATUS_MATRIX.md`

---

## 5. Authority and evidence boundary

The document set contains several authority levels.

### Normative or controlling

Within an implementation repository, the controlling order is:

1. `AGENTS.md` and repository governance
2. Immutable architecture and normative schemas/registries
3. `BUILD_WEEK_WORKFLOW_CURRENT.md`
4. `CURRENT_STATUS_MATRIX.md`
5. `GLOSSARY.md`
6. Active phase prompt
7. Completed phase reports and automated evidence

### Explanatory

The external overviews and product narratives explain the system. They do not override architecture, schemas, tests, status evidence, or phase boundaries.

### Findings

UX, engineering, security, and functional reviews identify possible problems. A finding becomes an implementation fact only after it is reproduced and classified against the current baseline.

---

## 6. Terminology policy

The project set has two vocabulary layers.

### External vocabulary

Used in:

- overviews and narratives;
- onboarding and help;
- primary GUI labels;
- human-readable CLI output;
- demonstrations.

External language names user tasks and outcomes, such as:

- project version;
- change request;
- target choices;
- complete change review;
- change record;
- activity history;
- needs attention;
- continue elsewhere.

### Internal vocabulary

Used in:

- architecture and RFCs;
- code, schemas, registries, and tests;
- phase prompts and completion reports;
- technical-detail views.

Internal language includes exact terms such as:

- material tree revision;
- authority-source revision;
- workflow occurrence;
- Intent Manifest;
- Anchor Matrix;
- Resolution Map;
- Preview Decision;
- operation receipt;
- GRM-A, GRM-E, and GRM-A-Resolved;
- event node and causal edge.

A GUI concept may summarize several internal records. It must not alter their semantics or create GUI-only authoritative state.

---

## 7. Current implementation and workflow snapshot

The current implementation baseline is Expflow `v1.2.1`.

The historical Expflow Gates A–D are complete and retained as v1 build evidence. They are not active Build Week phases.

The active workflow begins from the unchanged `v1.1.0` state:

```text
Phase 1: ordinary CLI UX/UI corrections
Phase 2: Expflow GUI foundation
Phase 3: stable read models
Phase 4: evidence intake and authority reconciliation
Phase 5: portable workflow package
Phase 6: major engineering and functional gap closure
Phase 7: end-to-end pilot and empirical evaluation
Phase 8: Expflow Guerilla profile and event contracts
Phase 9: Guerilla causal event-view GUI
```

Only Phase 1 is currently authorized. The evidence pass is complete, but no Phase 1 runtime behavior is claimed. The accepted narrative defaults are:

- keep uninitialized `status` at exit `0` and clarify the state/action contract;
- preserve exact forward-commit restore while adding preview and conflicting-drift consent;
- make provisional preview identity explicit to machine and human consumers;
- treat the historical restore collision as not reproduced on `v1.1.0`;
- use **Expflow GUI** and `apps/gui/`; `Expflow Studio` is not approved.

The old plan to correlate Expflow completion with a Guerilla external-compatible adapter gate is superseded. Guerilla is now profile-driven and records native invocation evidence, observations, event nodes, causal edges, and typed outcome reconciliation. Its GUI appears at the end of the current workflow because it depends on stable native product surfaces and pilot evidence.

---

## 8. Claims policy

External claims should follow this structure:

```text
category defect
    -> concrete mechanism
    -> definitive system outcome
    -> current proof status
```

Avoid claims such as “better context,” “more control,” “improved observability,” or “portable” without naming the exact failure removed and the mechanism that removes it.

Examples:

- Reqtrace does not merely improve requirement links; it makes bidirectional traceability the accepted behavioral-control boundary.
- FIMP does not merely make patches safer; it amortizes model-facing localization and clarification across a complete multi-hunk transaction and publishes only the complete approved result against the evaluated base.
- Guerilla does not merely add logs; it preserves typed outcomes and causal relationships across native systems without claiming their authority.
- Expflow does not merely save versions; it reconciles virtual and material artifact history, scoped authority, decisions, and workflow boundaries into portable workflow state.

A solution may be described definitively before empirical evidence exists, but the proof status must remain explicit.

---

## 9. Suggested repository placement

```text
docs/
  external/
    overviews/
      PRODUCT_OVERVIEW.md
      UX_OVERVIEW.md
      ENGINEERING_OVERVIEW.md
      FUNCTIONAL_OVERVIEW.md

    narratives/
      SYSTEM_BOUNDARIES.md
      END_TO_END_NARRATIVE.md
      PILOT_AND_ADOPTION_PLAN.md

  internal/
    BUILD_WEEK_WORKFLOW_CURRENT.md
    CURRENT_STATUS_MATRIX.md
    REPOSITORY_DIRECTORY_STRUCTURE.md
    GLOSSARY.md
    phase_prompts/
      PHASE_01_UX_UI_FIXES.md

  architecture/
    # Immutable accepted architecture and protocol sources

AGENTS.md
README.md
```

Do not move existing source into an aspirational monorepo merely to match future slots. Future GUI and profile paths should be created only when their authorized phase begins.

---

## 10. What not to infer

The documentation set does not claim that:

- all four projects are currently implemented to the same degree;
- users must adopt all four projects together;
- the Expflow GUI already exists;
- Expflow has completed a real external pilot;
- advanced Expflow runtimes are already coherent ordinary user surfaces;
- Guerilla is an Expflow adapter or owns Expflow state;
- FIMP is a global file anchor system or a DAG orchestrator;
- Reqtrace treats tests or specifications as automatic requirements;
- Git is replaced by Expflow;
- internal test completion is equivalent to empirical product proof.

Use `CURRENT_STATUS_MATRIX.md` for exact current claims.

---

## 11. Review checklist

Before accepting a revision to this document set, verify:

- each project is positioned against the correct tool category;
- each utility claim names a concrete mechanism and outcome;
- current proof status is not inflated;
- external and internal terms are not conflated;
- Reqtrace is described as bidirectional behavioral control, not intent capture alone;
- FIMP batching and JIT localization are represented as scaling advantages;
- Guerilla is described as a profile-driven causal event view, not a state-owning adapter;
- Expflow is described as workflow VCS and authority reconciliation, not backup or Git replacement;
- the GUI remains an optional client over documented native surfaces;
- only the active phase is represented as authorized implementation work.
