# Expflow GUI

**Status:** Phase 2 local GUI foundation.

Run from the repository root:

```bash
npm run gui:serve
```

The server builds the TypeScript package, serves the browser client, and exposes local JSON endpoints backed by `createGuiBridge`. The GUI requires a local project path typed by the user. It does not require a network account, shell command construction, or raw `.expflow` storage access.

Primary surfaces:

- project selection and initialization;
- current material state and drift;
- revision and node history;
- sync preview and execution;
- restore preview, refusal, override, and execution;
- receipts, recovery, verification, advanced read-model records, and technical details.
