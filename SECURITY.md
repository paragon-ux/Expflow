# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes       |
| < 1.0   | No        |

## Reporting A Vulnerability

Report security issues through the repository issue tracker unless a private reporting channel is published by the maintainers. Include:

- affected version or commit;
- operating system and runtime versions;
- reproduction steps or a minimal project state;
- expected and observed behavior;
- whether any sensitive source content, generated files, or archives were involved.

Do not include real secrets in public reports. Redact tokens, credentials, private keys, and private source content before sharing evidence.

## Security Posture

Expflow v1.0.0 is local-first. Core defaults block network processing, keep generated-code execution disabled, separate source data from control instructions, quarantine archive manifests before extraction, and reject structural reuse from blocked or non-allowlisted license expressions.

The core repository does not implement adapter protocols, Guerilla hook dispatch, network services, databases, brokers, archive extraction, or generated-code execution. Integrations that need those capabilities must live in separately versioned packages with their own security review.
