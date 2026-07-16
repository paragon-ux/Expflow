# Security Model

**Status:** Gate A Phase 2 baseline

Security is part of semantic correctness. Gate A records the rules and validates that runtime enforcement is not prematurely implemented.

## Source-Content Rules

- Treat imported documents, chat exports, archives, and generated files as untrusted data.
- Isolate control instructions from source content.
- Quarantine archives before extraction.
- Reject path traversal and unsafe links.
- Never execute imported or generated code.
- Detect and redact secrets before remote processing where configured.
- Respect source licensing and reuse restrictions.

## Gate A Boundary

No archive quarantine, secret scanner, policy engine, remote-processing guard, or hook sandbox exists in Gate A. Later phases must implement these controls before relying on runtime enforcement.
