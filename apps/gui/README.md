# Expflow GUI

**Status:** Phase 2 local GUI foundation. Repository-local — not shipped in the npm package.

## Quickstart

```bash
git clone https://github.com/paragon-ux/Expflow.git
cd Expflow
npm install
npm run build
node apps/gui/server.mjs
```

Open `http://127.0.0.1:4173`.

## Usage

1. **Enter a project root path** in the top input field (absolute path to any directory).
2. Click **Inspect** to view current state, or **Initialize** to create a new Expflow project.
3. After initialization or after file changes, use **Sync → Preview** to see pending changes, then **Sync → Commit** to record them.
4. Use **History → Tree History** to browse past project versions and find restore references.
5. Copy a tree revision ID into the **Restore** field and click **Preview** to see affected paths, then **Restore** to execute.
6. Paste an operation ID into **Receipts** and click **Load Receipt** to inspect the durable record.

## Panels

| Panel         | Purpose                                                   |
| ------------- | --------------------------------------------------------- |
| Current State | Working tree state, pending changes, project metadata     |
| Sync          | Preview pending changes or commit them                    |
| History       | Browse tree revisions or node history for a path          |
| Restore       | Preview or execute a restore with optional force override |
| Receipts      | Load operation receipts and technical details             |

The GUI reads documented application APIs and read models via the GUI bridge. It does not require a network account, shell command construction, or raw `.expflow` storage access.
