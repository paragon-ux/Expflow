# Contributing

Thanks for contributing to Expflow.

## Branches

Work on a non-protected branch. Do not commit directly to `main`.

## Immutable Architecture Sources

Files under `docs/architecture/**` are immutable architecture inputs verified by `docs/architecture/SOURCE_MANIFEST.json`. Do not edit them during ordinary implementation, release, documentation, or cleanup work.

Use mutable docs such as `docs/ARCHITECTURE_DECISIONS.md`, `docs/orientation/`, `docs/completion_reports/`, `docs/CURRENT_STATUS_MATRIX.md`, and top-level README files for implementation evidence and status updates.

## Scope Boundaries

Keep the ordinary command surface limited to:

```text
expflow init
expflow sync
expflow status
expflow restore
```

Do not add adapter inspection, external change cursors, adapter idempotency, lost-response reconciliation, Guerilla hook dispatch, network services, database services, brokers, archive extraction, or generated-code execution to core.

## Validation

Run the relevant focused checks for your change, then the release validation set before a release handoff:

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npm run contracts:verify
npm run registries:verify
npm run schemas:meta-validate
npm run examples:index-check
npm run schemas:examples-validate
npm run fixtures:verify
npm run build
npm run package:verify
python -m pip install -e ".[dev]"
python -m pytest
python -m build --wheel
python tests/contracts/verify_python_wheel.py
git diff --check -- ':!docs/architecture/**'
```

Report exact command results. Do not claim validation that has not been run on the current changes.
