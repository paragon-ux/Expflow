# Portable Package

Phase 5 portable packages export selected workflow records into deterministic package directories, validate payload digests offline, plan collision-safe imports, and import only when unresolved dependencies and collisions are absent.

Packages contain a `manifest.json`, JSON record payloads, and immutable object bytes. The manifest declares the selected workflow occurrence, selected input/output tree revisions, source project, producer version, payload digest closure, external references, warnings, and import resume state.

Imports are append-only to the target Expflow store. Existing matching records are skipped, collisions block the import, and external evidence references are reported as unresolved dependencies rather than dereferenced or fabricated.
