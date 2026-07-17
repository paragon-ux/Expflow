# Guerilla Universal Hook Runtime Implementation Specification

**File:** `docs/architecture/GUERILLA_UNIVERSAL_HOOK_IMPLEMENTATION_SPEC.md`  
**Version:** 1.0  
**Date:** 2026-07-17  
**Status:** Accepted normative Gate D architecture revision  
**Supersession:** Replaces bespoke-adapter expansion where current documents conflict; preserves existing DAG, state-boundary, lineage, intent, idempotency, reconciliation, conflict, decision, projection, snapshot, replay, and historical Gate C invariants

---

## 1. Normative Language

**MUST** and **MUST NOT** are required for conformance.  
**SHOULD** and **SHOULD NOT** may be waived only by an explicit recorded architecture decision.  
**MAY** is optional behavior.

---

## 2. Product Definition

Guerilla consists of:

1. one logically authoritative append-only causal-lineage and continuity DAG;
2. one universal hook and conformance runtime;
3. one data-only system-profile model for ordinary interfaces;
4. one constrained provider-driver model for exceptional transports;
5. one generic agent-facing resource and command surface;
6. one resynchronization path for work outside managed invocation.

Guerilla is not:

- a replacement for native application state;
- a collection of bespoke per-system adapters;
- a provider-specific reconciliation framework;
- a universal semantic model imposed on every tool;
- a second implementation of native commands;
- an adapter marketplace or plugin authority.

---

## 3. Required Invariants

A conforming implementation MUST preserve:

1. External systems retain application-state authority.
2. The Guerilla DAG is the sole lineage and continuity authority.
3. Every managed native mutation has committed Guerilla intent before launch.
4. Native transport success is not external acceptance.
5. External acceptance is not semantic correctness.
6. Unknown outcomes remain explicit until Guerilla reconciliation.
7. Profiles and drivers supply evidence; they do not decide continuity.
8. Replay never repeats native actions.
9. The hook runtime uses the existing validated graph mutation path.
10. A new ordinary CLI requires no Guerilla core code when the profile language is sufficient.
11. Provider drivers use the same lifecycle and evidence contracts.
12. Native argv, cwd, stdin policy, environment policy, output, signals, cancellation, and exit status are preserved or blocked before launch.
13. Payloads and command output are untrusted data.
14. Outbox, cache, index, snapshot, and projection state remain non-authoritative.
15. Out-of-band mutations are represented through resynchronization.
16. Agent-facing operations remain generic across systems.
17. Profiles are data-only and content-addressed.
18. Unknown commands fail closed.
19. Mutating, destructive, and administrative commands fail closed when intent cannot commit.
20. Resynchronization does not duplicate managed lineage when native evidence can prove overlap.
21. Ambiguous overlap remains an explicit conflict.
22. Profile upgrades are explicit and never occur during command execution.

---

## 4. Architecture Planes

```text
┌──────────────────────────────────────────────────────┐
│ Agent / Human / CI / Native Hook Entry              │
├──────────────────────────────────────────────────────┤
│ Universal Hook and Conformance Runtime              │
│ discovery · profile lock · classification           │
│ execution · observation · evidence · outbox         │
│ resynchronization · driver isolation                │
├──────────────────────────────────────────────────────┤
│ Existing Guerilla Continuity Services               │
│ intent · idempotency · reconciliation · conflicts   │
│ decisions · continuation · projections · snapshots  │
├──────────────────────────────────────────────────────┤
│ Authoritative Append-Only Guerilla DAG              │
└──────────────────────────────────────────────────────┘
                 references, never owns
┌──────────────────────────────────────────────────────┐
│ Native Systems and Native Application State         │
└──────────────────────────────────────────────────────┘
```

The hook runtime is the control and ingestion plane.

The DAG is the evidence and continuity plane.

---

## 5. Canonical Agent and CLI Surface

### 5.1 Canonical library operations

```text
read(path)
search(path, query)
run(system_instance_id, argv, options)
status(system_instance_id, freshness)
sync(scope)
```

### 5.2 Canonical CLI mapping

```text
guerilla read <guerilla-uri>
guerilla search <guerilla-uri> --query <text>
guerilla run <system-instance-id> -- <native-args...>
guerilla status [system-instance-id] [--live|--cached]
guerilla sync [system-instance-id|--workspace]
```

### 5.3 Exact meanings

- `read` returns a resource or collection through the generic namespace.
- `search` searches the selected resource subtree.
- `run` brackets one native invocation.
- `status --live` performs declared read-only observations and appends the resulting observation evidence.
- `status --cached` reads the latest committed Guerilla projection without native access.
- `sync` performs Guerilla resynchronization only and MUST NOT invoke a native mutating sync command.

---

## 6. System and Resource Identity

### 6.1 System instance

Each configured or discovered native system has a stable workspace-scoped `system_instance_id`.

The identifier names the integration instance, not the provider globally.

Example:

```text
sys_expflow_primary
sys_reqtrace_repo
sys_git_workspace
```

### 6.2 Profile identity

A profile is identified by:

```text
profile_id
profile_version
hook_protocol_version
content_digest
```

Example:

```yaml
profile_id: expflow.cli
profile_version: 1.0.0
hook_protocol_version: 1.0
content_digest: sha256:...
```

Multiple versions MAY coexist.

### 6.3 Workspace profile lock

Every managed system instance MUST pin:

- `system_instance_id`;
- profile identity;
- exact profile version;
- profile content digest;
- native executable or endpoint identity;
- accepted native-version range;
- approved state boundaries;
- approved capabilities;
- trust source;
- lock decision metadata.

Execution MUST NOT auto-upgrade a profile.

### 6.4 Resource namespace

The canonical discovery root is:

```text
guerilla://systems/
```

Reading it returns system-instance descriptors.

Each descriptor MUST expose:

- `system_instance_id`;
- display name;
- selected profile identity and digest;
- native version evidence;
- continuity mode;
- state boundaries;
- command-class capabilities;
- resource roots;
- live/cached observation capability;
- driver presence;
- known limitations;
- last committed native boundary;
- current continuity status.

Recommended paths:

```text
guerilla://systems/<instance>/descriptor
guerilla://systems/<instance>/status
guerilla://systems/<instance>/resources/
guerilla://continuity/pending
guerilla://continuity/conflicts
guerilla://lineage/<node-id>
```

Resource paths are derived views and references. They do not transfer application-state authority.

---

## 7. Integration Modes

### 7.1 Wrapper mode — primary

The canonical invocation is:

```text
run(system_instance_id, native_args)
```

The profile supplies the native executable or endpoint.

The CLI form is:

```text
guerilla run <system-instance-id> -- <native-args...>
```

### 7.2 Native hook mode — optional

A native system MAY call generic before/after lifecycle endpoints when it already has a hook mechanism.

Native hook mode MUST use the same profile, intent, evidence, reconciliation, and graph contracts as wrapper mode.

It MUST NOT introduce product-specific Guerilla semantics.

### 7.3 Provider-driver mode — exceptional

Use a provider driver only when:

- no ordinary local command or stable public interface is available to the profile host; or
- required interaction cannot be represented by data-only observation/invocation recipes.

A driver is executable code and therefore MUST be isolated.

### 7.4 Resynchronization mode

Resynchronization compares current native observations with the latest committed native boundary and records reconstructed continuity for unmanaged work.

---

## 8. Deterministic System and Profile Selection

Selection order is:

1. explicit `system_instance_id`;
2. exact workspace profile lock;
3. explicit workspace default for the current root;
4. unique detected instance with an exactly compatible pinned profile.

If zero instances match, return `system_not_found`.

If more than one instance or profile remains, return `system_selection_ambiguous`.

The runtime MUST NOT guess based on friendly name, executable order, registry order, or newest profile version.

---

## 9. Command Classification

### 9.1 Classes

Every managed command is classified as:

- `read_only`;
- `observational`;
- `mutating`;
- `destructive`;
- `administrative`;
- `unknown`.

### 9.2 Matching grammar

Gate D v1 command patterns are ordered token-prefix patterns.

A pattern contains:

- literal tokens;
- registered typed placeholders;
- optional terminal remainder capture.

Selection uses the longest matching literal prefix.

Equal-specificity matches are an error.

Pattern matching MUST NOT execute regex against the complete shell command.

### 9.3 Unknown command policy

`unknown` is blocked.

Agents and untrusted payloads cannot override command class at invocation time.

A trusted maintainer must revise the profile, update fixtures, validate, and update the profile lock.

---

## 10. Data-Only System Conformance Profiles

### 10.1 Required profile fields

```yaml
profile_id: example.cli
profile_version: 1.0.0
hook_protocol_version: 1.0
content_digest: sha256:...

detect:
  executables: [example]
  root_markers: [.example]

native_compatibility:
  version_command: [--version]
  supported: ">=1.0.0 <2.0.0"

commands:
  - match: [status]
    class: read_only
  - match: [apply, "<path>"]
    class: mutating
  - match: [reset]
    class: destructive
  default: unknown

observations:
  - id: status_json
    phases: [before, after, live_status, resync]
    required_for: [mutating, destructive]
    argv: [status, --json]
    parser: json
    timeout_ms: 5000
    max_output_bytes: 1048576

extractors:
  native_revision:
    observation: status_json
    path: $.revision
  operation_ref:
    source: native_result
    path: $.operation_id

boundaries:
  owned_paths: [.example/**]
  referenced_paths: ["**"]

consistency:
  continuity_mode: hybrid
  revision_semantics: opaque

security:
  inherit_environment: minimal
  allow_network: false
  redact_paths: [$.credentials]

limitations:
  - Out-of-band writes require resynchronization.
```

### 10.2 Allowed custom observation commands

Profiles MAY define any number of custom observation recipes when:

1. argv is a data array;
2. the executable is the profile executable or an explicitly allowed observer executable;
3. no implicit shell is used;
4. the recipe is classified and proven read-only;
5. cwd and boundaries are declared;
6. environment inheritance is declared;
7. timeout and output limits are declared;
8. parser and extractor types are registered;
9. conformance fixtures prove no mutation;
10. recursion into Guerilla is prohibited.

### 10.3 Registered Gate D v1 parsers

The initial registered set is:

- `json`;
- `jsonl`;
- `utf8_lines`;
- `key_value`;
- `exit_status`;
- `filesystem_snapshot`;
- `content_digest`;
- `none`.

Arbitrary profile-provided parser code is prohibited.

A new parser requires a Guerilla core contract/version change because parsers execute inside the trusted hook host.

### 10.4 Profile prohibitions

A profile MUST NOT contain:

- arbitrary executable code;
- shell strings;
- credentials;
- graph paths or graph writes;
- node or edge construction code;
- idempotency decisions;
- retry decisions;
- conflict decisions;
- continuity state;
- provider-specific agent tools;
- dynamic package imports.

### 10.5 Profile trust

Profiles may be:

- built-in;
- package-installed;
- workspace-local.

Every profile MUST be content-digest verified.

Workspace-local profiles require an explicit trust decision before any managed mutation.

---

## 11. Observation Semantics

### 11.1 Required versus optional

Each observation declares:

- lifecycle phases;
- command classes it is required for;
- timeout;
- output bound;
- failure policy.

### 11.2 Pre-observation failure

For `mutating`, `destructive`, and `administrative` commands:

- failure of a required pre-observation blocks native launch;
- failure of an optional pre-observation records degraded evidence and proceeds only if workspace policy permits.

### 11.3 Post-observation failure

Post-observation failure:

- MUST NOT change a native success exit into native failure;
- MUST append or queue a partial-evidence result;
- MUST enter Guerilla reconciliation;
- MAY block continuation under policy;
- MUST NOT authorize blind retry.

### 11.4 Observation identity

Every observation records:

- profile identity and digest;
- system instance;
- native subject;
- native revision or absence;
- observation digest;
- observed_at;
- effective_at if known;
- consistency mode;
- parser/extractor versions;
- redaction policy version;
- ambiguity.

---

## 12. Universal Managed-Invocation Lifecycle

### 12.1 Ordered flow

1. Resolve workspace.
2. Resolve `system_instance_id`.
3. Load and verify exact profile lock.
4. Verify native compatibility.
5. Classify command.
6. Validate authorization and state boundaries.
7. Capture required and optional pre-observations.
8. Normalize the intent without changing native semantics.
9. Commit Guerilla intent and idempotency identity.
10. Record invocation start.
11. Launch the native interface.
12. Capture native result or transport uncertainty.
13. Capture post-observations.
14. Normalize and append evidence through the existing graph path.
15. Reconcile continuity in Guerilla.
16. Return the native result.

### 12.2 DAG unavailable before launch

- `mutating`, `destructive`, and `administrative` commands fail closed.
- `read_only` and `observational` commands fail closed by default.
- A workspace MAY set `untracked_read_policy = allow`.
- An untracked read returns native output but creates no lineage claim.
- The runtime SHOULD emit a local diagnostic when possible.

### 12.3 Failure during invocation

The runtime records the strongest supported native classification:

- launch rejected;
- known native failure;
- interrupted;
- cancelled;
- timed out;
- accepted pending;
- unknown.

It MUST NOT infer completion from process or transport success alone.

### 12.4 Failure after native completion

If native completion occurs but graph append is interrupted:

- the isolated producer or hook host writes a bounded outbox envelope;
- the envelope is schema validated and content digested;
- draining uses the normal graph mutation path;
- replay is idempotent;
- the outbox cannot authorize native retry;
- reconciliation occurs only after graph evidence is committed.

---

## 13. Native Executor

The executor MUST capture:

- resolved executable identity;
- exact native args;
- cwd;
- sanitized environment descriptor;
- stdin mode and digest where retained;
- start and finish times;
- stdout/stderr references after redaction;
- exit code;
- terminating signal;
- timeout;
- cancellation;
- launch error;
- profile and system-instance identity.

The executor MUST:

- use argument arrays;
- prohibit implicit shell interpolation;
- preserve native exit behavior;
- prevent recursive Guerilla wrapping;
- bound output and duration;
- enforce filesystem/network policy;
- treat output as untrusted data.

---

## 14. Provider Driver Contract

### 14.1 Allowed operations

A driver MAY implement:

```text
detect
observe
invoke
probe_native_outcome
list_resources
read_resource
search_resources
```

### 14.2 Isolation

A driver MUST run:

- outside the graph-store process;
- without direct graph filesystem access;
- with schema-only IPC;
- with minimal environment;
- with injected credentials;
- with endpoint allowlists;
- with time, memory, and output limits;
- with a pinned driver package identity and digest.

### 14.3 Driver prohibitions

A driver MUST NOT:

- commit graph records;
- decide Guerilla idempotency;
- resolve conflicts;
- authorize retry;
- decide continuation;
- maintain a continuity ledger;
- claim undeclared state boundaries;
- expose credentials;
- require a provider-specific agent tool as the only interface.

### 14.4 Async invocation outcomes

A driver invocation may return:

- native handle;
- submission/acceptance evidence;
- immediate rejection;
- immediate failure;
- immediate completion;
- unknown transport state.

Required normalized classifications:

```text
accepted_pending
confirmed_completed
confirmed_rejected
confirmed_failed
confirmed_cancelled
still_pending
unknown_probe_failed
unknown_unprobeable
```

### 14.5 Unprobeable fallback

When the provider has no reliable outcome probe:

1. record `unknown_unprobeable`;
2. retain the native handle if one exists;
3. allow read-only resynchronization;
4. prohibit automatic potentially duplicating retry;
5. require explicit human or policy decision for retry, abandonment, or conflict resolution.

---

## 15. Evidence Normalization and Reconciliation

Profiles and drivers return native evidence.

Example:

```json
{
  "system_instance_id": "sys_cloud_jobs",
  "native_status": "accepted_pending",
  "native_revision": null,
  "operation_ref": "job-123",
  "effect": "unknown",
  "ambiguities": [],
  "evidence_refs": ["payload:sha256:..."]
}
```

The Guerilla reconciliation engine receives:

- committed intent;
- graph-backed idempotency identity;
- invocation evidence;
- native result;
- pre/post observations;
- resynchronization evidence;
- prior cross-system lineage;
- state-boundary policy;
- conflicts and decisions.

Only Guerilla appends:

- reconciliation result;
- missing-lineage record;
- conflict;
- resolution;
- continuation decision.

Profiles and drivers do not expose a normative `reconcile` operation. Legacy adapter `reconcile` compatibility must map to `probe_native_outcome` and return evidence only.

---

## 16. Managed and Unmanaged Resynchronization

### 16.1 Boundary anchor

Every managed invocation records:

- pre-observation boundary;
- intent node;
- invocation node/reference;
- native operation reference if available;
- native pre-revision;
- native post-revision;
- pre/post observation digests;
- post-result classification.

### 16.2 Resynchronization checkpoint

Each system instance has a committed last-observed boundary containing:

- native revision or opaque token;
- observation digest;
- observation time;
- source profile identity;
- associated managed invocation references;
- known unobserved interval.

### 16.3 Deduplication algorithm

Resynchronization MUST:

1. load the last committed checkpoint;
2. obtain the current live observation;
3. identify managed invocation post-boundaries after the checkpoint;
4. compare native revisions, operation references, and observation digests;
5. mark already-accounted effects as covered;
6. append only the remaining reconstructed interval;
7. advance the checkpoint after successful graph commit.

### 16.4 Ambiguous overlap

If evidence proves state changed but cannot separate managed and unmanaged effects:

- do not duplicate the managed effect;
- do not fabricate an unmanaged action;
- append an `ambiguous_overlap` conflict;
- preserve the observed state difference and interval;
- require later evidence or decision for exact attribution.

### 16.5 Required test case

Gate D MUST test:

```text
managed Git commit
→ direct unmanaged Git commit
→ managed read
→ resynchronization
```

The result must contain:

- one managed invocation lineage;
- one reconstructed unmanaged interval when Git evidence distinguishes commits;
- no duplicate managed commit;
- an ambiguity conflict only when fixture evidence intentionally removes distinguishing identity.

---

## 17. Profile Compatibility and Upgrade

### 17.1 Coexistence

Multiple versions of a profile MAY coexist.

### 17.2 Compatibility declaration

Each profile declares:

- native version command or evidence source;
- supported native-version range;
- required capabilities;
- optional capabilities;
- reduced-observation modes;
- deprecated versions.

### 17.3 Runtime selection

The runtime uses the workspace lock. It does not negotiate or upgrade automatically.

### 17.4 Upgrade procedure

An upgrade requires:

1. install and digest verification;
2. compatibility check against native version;
3. profile fixture validation;
4. workspace lock update;
5. explicit recorded decision;
6. optional resynchronization from the last boundary;
7. rollback by restoring the prior lock.

---

## 18. Existing Gate C Migration

| Existing concept | Final revised role |
|---|---|
| Adapter descriptor | Source material for profile and driver descriptors |
| Adapter host | Universal hook/profile/driver host |
| Observe | Observation recipe and normalized evidence |
| Act | Managed native invocation |
| Evaluate | Existing Guerilla evaluation over evidence |
| Reconcile method | Legacy alias for native outcome probe only |
| Synthetic adapters | Historical synthetic conformance systems |
| Adapter idempotency claims | Native capability evidence; Guerilla owns idempotency |
| Adapter state boundary | Profile state-boundary declaration |
| Adapter CLI workflow | Generic hook CLI workflow |

Rules:

- Historical records remain readable.
- Historical reports are annotated, not rewritten.
- Compatibility aliases MAY remain for one documented version.
- No alias may preserve profile/driver reconciliation authority.
- Phase 15 remains completed historical internal CLI evidence.

---

## 19. Security

The runtime MUST:

- verify profile and driver content digests;
- require explicit trust for workspace-local profiles;
- use argument arrays;
- prohibit profile shell strings;
- classify and test observation commands as read-only;
- minimize inherited environment;
- redact before persistence;
- bound duration, output, payload, and observation size;
- prevent recursive wrapping;
- isolate drivers;
- restrict endpoints and filesystem roots;
- preserve native signals/cancellation where supported;
- record policy and parser versions;
- never persist raw credentials in graph payloads.

---

## 20. Conformance Requirements

### 20.1 Profile conformance

- schema valid;
- digest verified;
- deterministic discovery;
- exact native compatibility;
- complete command classification for supported surface;
- unknown-command denial;
- observation non-mutation proof;
- parser/extractor fixtures;
- boundary tests;
- redaction tests;
- profile-lock fixtures;
- coexistence and explicit-upgrade fixtures.

### 20.2 Hook runtime conformance

- required pre-observation ordering;
- intent-before-launch;
- native argv/cwd/env/stdin/output/exit/signal preservation;
- post-observation partial evidence;
- one graph mutation path;
- outbox recovery;
- recursion prevention;
- DAG-unavailable fail-closed behavior;
- untracked-read exception;
- no blind retry.

### 20.3 Required CLI profiles

1. `expflow.cli.v1`;
2. `reqtrace.cli.v1`;
3. `patchdiff.cli.v1`;
4. `git.cli.v1`.

The Git profile MUST require no Guerilla core code.

### 20.4 Driver conformance

- isolated execution;
- schema-only IPC;
- no graph access;
- capability enforcement;
- async handle and probe fixtures;
- `unknown_unprobeable`;
- credential redaction;
- no continuity ledger.

### 20.5 Resynchronization conformance

- managed-only no duplication;
- unmanaged-only reconstructed interval;
- managed plus unmanaged separable interval;
- ambiguous overlap conflict;
- repeated sync idempotency;
- checkpoint crash recovery.

---

## 21. Non-Goals for Gate D

Gate D does not require:

- universal semantic understanding;
- native failure repair;
- forced SDK adoption;
- provider-specific model tools;
- distributed graph consensus;
- remote multi-writer Guerilla;
- perfect interception of out-of-band work;
- semantic merge of external systems;
- production claims;
- automatic retry of unprobeable mutations.

---

## 22. Final Acceptance Criteria

Gate D implementation is complete only when:

1. one hook host executes every managed ordinary command;
2. profiles are data-only, exact-version pinned, and digest verified;
3. unknown commands fail closed;
4. custom observations are declarative and proven read-only;
5. profile versions coexist without automatic upgrade;
6. system discovery is available through `guerilla://systems/`;
7. profile selection is deterministic and ambiguity fails;
8. provider drivers are isolated transport exceptions;
9. async unprobeable outcomes remain unknown without blind retry;
10. Guerilla commits intent before managed mutation;
11. native results remain native facts;
12. failed post-observation does not rewrite native success;
13. profiles and drivers cannot write the DAG;
14. Guerilla alone reconciles uncertain outcomes;
15. resynchronization deduplicates managed effects when evidence permits;
16. ambiguous managed/unmanaged overlap becomes an explicit conflict;
17. Expflow, Reqtrace, Patch-DIFF, and Git use the same generic surface;
18. Git integration requires no Guerilla core code;
19. historical Gates A–C records remain compatible;
20. hosted CI and clean-package conformance pass.

---

## 23. Final Architecture Principle

> Normalize invocation and evidence, not the external system.

> Profiles describe. Drivers transport and probe. Native systems own their state. Guerilla alone owns the causal DAG, reconciliation, and continuity.
