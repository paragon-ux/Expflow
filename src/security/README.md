# security

**Gate D implementation.** This directory owns local security policy helpers for untrusted source content, archive quarantine, secret redaction, local-only remote disclosure checks, generated-code non-execution, and reuse licensing guards.

The runtime validates archive manifests before extraction and writes only quarantine manifests under `.expflow/quarantine/`. It does not extract archives, execute hooks, enable network access, or add ordinary commands.
