# gui

**Status:** Phase 2 application bridge.

This directory exposes the documented Expflow GUI application boundary. The bridge calls `operations/runtime.ts` methods and returns explicit GUI states, technical details, and typed errors for the local browser client.

The bridge must not read raw `.expflow` storage paths directly. Add GUI-facing behavior here only when it is backed by documented Expflow runtime operations or accepted read models.
