const rootInput = document.querySelector('#project-root');
const stateSummary = document.querySelector('#state-summary');
const statusPill = document.querySelector('#status-pill');
const statePanel = document.querySelector('#state-panel');
const syncPanel = document.querySelector('#sync-panel');
const historyPanel = document.querySelector('#history-panel');
const restorePanel = document.querySelector('#restore-panel');
const technicalPanel = document.querySelector('#technical-panel');
const nodeHistoryPath = document.querySelector('#node-history-path');
const restoreReference = document.querySelector('#restore-reference');
const restoreForce = document.querySelector('#restore-force');
const receiptId = document.querySelector('#receipt-id');
const syncButton = document.querySelector('#sync-button');
const restoreButton = document.querySelector('#restore-button');

let lastPayload = {};
let lastSyncPlan = null;
let lastSyncPlanToken = null;
let lastRestorePlan = null;
let lastRestorePlanToken = null;

// Request token from the server page (injected by server.mjs)
const pageToken = document.querySelector('meta[name="request-token"]')?.content ?? '';

function rootPayload() {
  return { root: rootInput.value.trim() };
}

function setBusy(label) {
  statusPill.textContent = 'loading';
  stateSummary.textContent = label;
}

function renderTechnical(payload) {
  lastPayload = payload;
  technicalPanel.textContent = JSON.stringify(payload, null, 2);
  if (payload?.data?.operation_id) {
    receiptId.value = payload.data.operation_id;
  }
}

function escapeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, (match) => {
    const replacements = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return replacements[match];
  });
}

function keyValues(values) {
  return `<dl class="kv-list">${values
    .map(([key, value]) => `<dt>${escapeText(key)}</dt><dd>${escapeText(value)}</dd>`)
    .join('')}</dl>`;
}

function listItems(items, render) {
  if (!Array.isArray(items) || items.length === 0) {
    return '<div class="empty-state">No items.</div>';
  }
  return `<ul class="item-list">${items.map((item) => `<li>${render(item)}</li>`).join('')}</ul>`;
}

function renderResult(target, payload, renderer) {
  statusPill.textContent = payload.state;
  stateSummary.textContent = payload.error
    ? payload.error.message
    : `Loaded ${payload.technical_details.operation} for ${payload.root}`;
  target.classList.remove('empty-state');
  if (payload.error) {
    target.innerHTML = `<p class="danger">${escapeText(payload.error.code)}</p><p>${escapeText(
      payload.error.message,
    )}</p><p>${escapeText(payload.error.recommended_action ?? 'Inspect project state.')}</p>`;
  } else {
    target.innerHTML = renderer(payload.data);
  }
  renderTechnical(payload);
}

function updateRestoreButton() {
  restoreButton.disabled = lastRestorePlanToken === null;
}

async function request(path, body) {
  const response = await fetch(path, {
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      'x-request-token': pageToken,
    },
    method: 'POST',
  });
  const payload = await response.json();
  if (!response.ok && payload.error === undefined) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return payload;
}

async function run(label, target, path, body, renderer) {
  setBusy(label);
  try {
    const payload = await request(path, body);
    renderResult(target, payload, renderer);
    return payload;
  } catch (error) {
    const payload = {
      data: null,
      error: {
        code: 'gui_request_failed',
        message: error instanceof Error ? error.message : String(error),
        recoverable: true,
        recommended_action: 'Check that the local Expflow GUI server is still running.',
      },
      root: rootInput.value.trim(),
      state: 'error',
      technical_details: {
        native_authority: 'Expflow',
        operation: path,
        raw_storage_access: false,
        surface: 'Expflow GUI client',
      },
    };
    renderResult(target, payload, () => '');
    return payload;
  }
}

function renderStatus(data) {
  const status = data.status;
  const changes = status.pending_change_details ?? [];
  return `${keyValues([
    ['Project id', status.project_id],
    ['Working tree', status.working_tree_state],
    ['Current project version', status.head_tree_revision_id ?? 'none'],
    ['Recommended action', status.recommended_action ?? 'none'],
  ])}<h3>Pending Changes</h3>${listItems(
    changes,
    (item) => `${escapeText(item.kind)} ${escapeText(item.relative_path)}`,
  )}`;
}

function renderReceipt(receipt) {
  return keyValues([
    ['Operation id', receipt.operation_id],
    ['Status', receipt.status],
    ['Project id', receipt.project_id],
    ['Previous head', receipt.previous_head ?? 'none'],
    ['New head', receipt.new_head ?? 'none'],
    ['Warnings', receipt.warnings?.join(', ') || 'none'],
  ]);
}

function renderSyncPlan(plan) {
  return `${keyValues([
    ['Project id', plan.project_id],
    ['Current head', plan.previous_head ?? 'none'],
    ['Candidate digest', plan.content_digest],
  ])}${listItems(
    plan.change_details,
    (item) =>
      `${escapeText(item.kind)} ${escapeText(item.relative_path)} ${
        item.identity === 'provisional' ? '(provisional)' : ''
      }`,
  )}`;
}

function renderHistory(data) {
  return listItems(data.revision_history ?? [], (item) =>
    keyValues([
      ['Sequence', item.sequence],
      ['Tree revision', item.tree_revision_id],
      ['Restore reference', item.restore_reference],
      ['Current', item.is_current_head ? 'yes' : 'no'],
    ]),
  );
}

function renderNodeHistory(data) {
  return listItems(data.node_history ?? [], (item) =>
    keyValues([
      ['Node revision', item.node_revision_ref],
      ['Restore reference', item.restore_reference],
      ['Current', item.is_current ? 'yes' : 'no'],
    ]),
  );
}

function renderRestorePlan(plan) {
  return `${keyValues([
    ['Reference', plan.reference],
    ['Resolved source', plan.source_ref],
    ['Current head', plan.current_head ?? 'none'],
    ['Requires force', plan.requires_force ? 'yes' : 'no'],
  ])}${listItems(
    plan.path_effects,
    (item) =>
      `${escapeText(item.effect)} ${escapeText(item.relative_path)} ${
        item.conflicting ? 'conflicting' : ''
      }`,
  )}`;
}

document.querySelector('#inspect-button').addEventListener('click', () => {
  void run('Inspecting project...', statePanel, '/api/status', rootPayload(), renderStatus);
});

document.querySelector('#init-button').addEventListener('click', () => {
  void run('Initializing project...', statePanel, '/api/init', rootPayload(), renderReceipt);
});

document.querySelector('#recover-button').addEventListener('click', () => {
  void run('Checking recovery...', statePanel, '/api/recover', rootPayload(), (data) =>
    keyValues(Object.entries(data)),
  );
});

document.querySelector('#verify-button').addEventListener('click', () => {
  void run('Verifying material state...', statePanel, '/api/verify', rootPayload(), (data) =>
    keyValues([
      ['Status', data.status],
      ['Blocking', data.blocking ? 'yes' : 'no'],
      ['Findings', data.findings.length],
    ]),
  );
});

document.querySelector('#plan-sync-button').addEventListener('click', () => {
  void (async () => {
    const payload = await run(
      'Planning sync...',
      syncPanel,
      '/api/sync/plan',
      rootPayload(),
      renderSyncPlan,
    );
    if (payload.error) {
      lastSyncPlan = null;
      lastSyncPlanToken = null;
    } else {
      lastSyncPlan = payload.data;
      lastSyncPlanToken = payload.data.planToken;
    }
  })();
});

syncButton.addEventListener('click', () => {
  if (lastSyncPlan === null || lastSyncPlanToken === null) {
    renderResult(
      syncPanel,
      {
        data: null,
        error: {
          code: 'sync_preview_required',
          message: 'Sync execution requires a current preview.',
          recoverable: true,
          recommended_action: 'Run Preview, then commit the displayed plan.',
        },
        root: rootInput.value.trim(),
        state: 'blocked',
        technical_details: {
          native_authority: 'Expflow',
          operation: 'sync.execute',
          raw_storage_access: false,
          surface: 'Expflow GUI client',
        },
      },
      () => '',
    );
    return;
  }
  if (!window.confirm('Commit the current sync plan as a new Expflow project version?')) {
    return;
  }
  void (async () => {
    const payload = await run(
      'Committing sync...',
      syncPanel,
      '/api/sync',
      {
        ...rootPayload(),
        expectedHead: lastSyncPlan.previous_head,
        planToken: lastSyncPlanToken,
      },
      renderReceipt,
    );
    if (!payload.error) {
      lastSyncPlan = null;
      lastSyncPlanToken = null;
    }
  })();
});

document.querySelector('#history-button').addEventListener('click', () => {
  void run('Loading history...', historyPanel, '/api/history', rootPayload(), renderHistory);
});

document.querySelector('#node-history-button').addEventListener('click', () => {
  void run(
    'Loading node history...',
    historyPanel,
    '/api/node-history',
    { ...rootPayload(), nodeHistoryPath: nodeHistoryPath.value.trim() },
    renderNodeHistory,
  );
});

document.querySelector('#plan-restore-button').addEventListener('click', () => {
  void (async () => {
    const payload = await run(
      'Planning restore...',
      restorePanel,
      '/api/restore/plan',
      { ...rootPayload(), reference: restoreReference.value.trim() },
      renderRestorePlan,
    );
    if (payload.error) {
      lastRestorePlan = null;
      lastRestorePlanToken = null;
    } else {
      lastRestorePlan = payload.data;
      lastRestorePlanToken = payload.data.planToken;
    }
    updateRestoreButton();
  })();
});

restoreButton.addEventListener('click', () => {
  if (lastRestorePlanToken === null) {
    renderResult(
      restorePanel,
      {
        data: null,
        error: {
          code: 'restore_preview_required',
          message: 'Restore execution requires a current preview.',
          recoverable: true,
          recommended_action: 'Run a restore preview, review the path effects, then execute.',
        },
        root: rootInput.value.trim(),
        state: 'blocked',
        technical_details: {
          native_authority: 'Expflow',
          operation: 'restore.execute',
          raw_storage_access: false,
          surface: 'Expflow GUI client',
        },
      },
      () => '',
    );
    return;
  }
  if (
    !window.confirm(
      'Restore will create a forward commit and may overwrite paths when forced. Continue?',
    )
  ) {
    return;
  }
  void (async () => {
    const payload = await run(
      'Executing restore...',
      restorePanel,
      '/api/restore',
      {
        ...rootPayload(),
        overwrite: restoreForce.checked,
        reference: restoreReference.value.trim(),
        planToken: lastRestorePlanToken,
      },
      renderReceipt,
    );
    if (!payload.error) {
      lastRestorePlan = null;
      lastRestorePlanToken = null;
      updateRestoreButton();
    }
  })();
});

document.querySelector('#receipt-button').addEventListener('click', () => {
  void run(
    'Loading receipt...',
    technicalPanel,
    '/api/receipt',
    { ...rootPayload(), operationId: receiptId.value.trim() },
    renderReceipt,
  );
});

document.querySelector('#clear-button').addEventListener('click', () => {
  renderTechnical({});
  stateSummary.textContent = 'Cleared technical details.';
});

// Initialize restore button state
updateRestoreButton();

// Inject request token from meta tag (set by server at page serve time)
if (pageToken.length === 0) {
  console.warn('No request token found on page. API requests may be rejected.');
}

renderTechnical(lastPayload);
