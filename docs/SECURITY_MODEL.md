# Security Model

**Status:** Gate D implementation baseline

Security is part of semantic correctness. Gate D implements local controls that keep imported and generated content as data unless a separate future execution profile explicitly authorizes otherwise.

## Source-Content Rules

- Treat imported documents, chat exports, archives, and generated files as untrusted data.
- Isolate control instructions from source content.
- Quarantine archives before extraction.
- Reject path traversal and unsafe links.
- Never execute imported or generated code.
- Detect and redact secrets before remote processing where configured.
- Respect source licensing and reuse restrictions.

## Gate D Runtime

- `src/security/` validates archive manifests and writes quarantine manifests under `.expflow/quarantine/` without extracting archive contents.
- The default security policy is local-only, network-blocked, minimal-environment, and generated-code execution disabled.
- Source-content preparation emits separate control instructions and source-data payloads so source text cannot become control text.
- Secret detection covers common credential patterns and redacts before allowed remote disclosure.
- Remote disclosure is blocked by default and recorded when an explicit redaction-enabled policy allows it.
- Reuse policy rejects blocked license expressions or reuse-restriction labels.

## Remaining Boundary

Gate D does not implement hook dispatch, process sandbox launch, network services, adapter protocols, databases, brokers, or archive extraction.
