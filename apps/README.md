# Expflow Apps

**Status:** local application surfaces.

`apps/gui/` contains the Phase 2 Expflow GUI. It is a local-first browser client served by a small Node server. The GUI calls the documented `src/gui/bridge.ts` application surface and does not read or write `.expflow` storage directly.

Application files are intentionally outside the npm package contents unless package policy explicitly changes.
