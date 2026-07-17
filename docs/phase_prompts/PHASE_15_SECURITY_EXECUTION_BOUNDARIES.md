# Phase 15 -- Security and Execution Boundaries

## Objective

Implement local security controls for untrusted content without adding hook execution, network services, adapter behavior, or new ordinary commands.

## Permitted Scope

- Archive quarantine manifest validation.
- Path traversal, unsafe link, device entry, size, count, and depth rejection.
- Source instruction/data separation for hook/model inputs.
- Secret detection and redaction before remote disclosure where policy allows remote processing.
- Local-only default security profile.
- Generated-code non-execution by default.
- Reuse license and restriction gates.

## Prohibited Scope

- Executing imported or generated code.
- Enabling network access by default.
- Implementing hook dispatch, sandbox process launch, adapters, databases, brokers, or reconciliation services.
- Modifying immutable architecture sources.

## Required Sources

- `AGENTS.md`
- `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`
- `docs/architecture/EXPFLOW_IMPLEMENTATION_SPEC_V2_3.md`
- `docs/architecture/EXPFLOW_PROTOCOL_SPEC_V2_3.md`
- `docs/SECURITY_MODEL.md`
- `docs/ERROR_REGISTRY.md`

## Expected Files

- `src/security/`
- `tests/unit/security-migration-runtime.test.ts`
- Mutable docs and completion reports.

## Exit Criteria

- Unsafe archives are rejected before extraction.
- Safe archives create only quarantine manifests under `.expflow/quarantine/`.
- Source content is marked data, not instruction.
- Secrets are detected and redacted before allowed remote disclosure.
- Local-only policy blocks remote disclosure.
- Generated-code execution remains disabled.
- Reuse policy blocks restricted licenses or reuse labels.
