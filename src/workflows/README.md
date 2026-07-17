# workflows

**Gate C implementation.** This directory owns workflow occurrences, virtual artifacts, materialization events, and immutable workflow state transitions.

Workflow occurrences record input and output tree selectors separately from completion, verification, and reuse states. Input and output selectors are validated against the path-selector schema shape before immutable writes. Attaching material output does not imply accepted completion, and accepted completion requires an explicit completion decision reference.

This directory does not execute workflows, run hooks, generate projections, implement adapter cursors, or add ordinary commands.
