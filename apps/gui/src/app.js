/* ── State ──────────────────────────────────────────────────── */
let root = '';
let version = '';
let currentFamily = '';
let currentCommand = '';
let lastPlan = null;
let lastPlanToken = null;
let actorClass = 'human';
const pageToken = document.querySelector('meta[name="request-token"]')?.content ?? '';

/* ── DOM refs ───────────────────────────────────────────────── */
const el = (s) => document.querySelector(s);
const rootInput = el('#project-root');
const statusPill = el('#status-pill');
const versionBadge = el('#version-badge');
const familyList = el('#family-list');
const familyTitle = el('#family-title');
const commandList = el('#command-list');
const optionsPanel = el('#options-panel');
const optionsFields = el('#options-fields');
const planPanel = el('#plan-panel');
const planContent = el('#plan-content');
const resultPanel = el('#result-panel');
const resultContent = el('#result-content');
const receiptContent = el('#receipt-content');
const applyBtn = el('#apply-button');
const shortcutHint = el('#shortcut-hint');

/* ── Command definitions ────────────────────────────────────── */
const families = {
  project: {
    label: 'Project',
    commands: {
      init: { opts: [] },
      inspect: { opts: [] },
    },
  },
  material: {
    label: 'Material',
    commands: {
      status: { opts: ['history'] },
      sync: { opts: ['expectedHead'] },
      history: { opts: [] },
      restore: { opts: ['reference', 'force'] },
      receipts: { opts: ['operationId'] },
      recover: { opts: [] },
    },
  },
  workflow: {
    label: 'Workflow',
    commands: {
      list: { opts: [] },
      inspect: { opts: ['workflowId'] },
      state: { opts: ['workflowId', 'state'] },
      history: { opts: ['workflowId'] },
    },
  },
  evidence: {
    label: 'Evidence',
    commands: {
      intake: { opts: ['path'] },
      inspect: { opts: ['reference'] },
    },
  },
  authority: {
    label: 'Authority',
    commands: {
      'source-propose': { opts: ['type', 'identifier', 'description'] },
      'source-decide': { opts: ['reference', 'decision'] },
      'artifact-propose': { opts: ['type', 'identifier', 'description'] },
      'artifact-decide': { opts: ['reference', 'decision'] },
    },
  },
  conflicts: {
    label: 'Conflicts',
    commands: {
      declare: { opts: ['description'] },
      list: { opts: [] },
    },
  },
  decisions: {
    label: 'Decisions',
    commands: {
      complete: { opts: ['reference', 'result'] },
      verify: { opts: ['reference'] },
      equivalent: { opts: ['reference', 'other'] },
      reuse: { opts: ['reference'] },
    },
  },
  package: {
    label: 'Package',
    commands: {
      export: { opts: ['output'] },
      validate: { opts: ['path'] },
      'plan-import': { opts: ['path'] },
      import: { opts: ['path', 'planToken'] },
    },
  },
  reporting: {
    label: 'Reporting',
    commands: {
      capabilities: { opts: [] },
      inspect: { opts: [] },
      history: { opts: [] },
    },
  },
};

/* ── API ────────────────────────────────────────────────────── */
async function apiCall(path, body = {}) {
  const resp = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-request-token': pageToken },
    body: JSON.stringify({ root, ...body }),
  });
  return resp.json();
}

async function callCmd(family, cmd, opts = {}) {
  const params = { root, ...opts };
  // Map family+cmd to existing API endpoints
  const routes = {
    'project:init': ['/api/init', params],
    'project:inspect': ['/api/status', params],
    'material:status': ['/api/status', params],
    'material:sync': ['/api/sync/plan', params],
    'material:history': ['/api/history', params],
    'material:restore': [
      '/api/restore/plan',
      { ...params, reference: opts.reference || '', overwrite: opts.force },
    ],
    'material:receipts': ['/api/receipt', { ...params, operationId: opts.operationId || '' }],
    'material:recover': ['/api/recover', params],
    'reporting:capabilities': ['/api/capabilities', {}],
    'reporting:inspect': ['/api/status', params],
    'reporting:history': ['/api/history', params],
    'evidence:intake': ['/api/evidence/intake', params],
    'evidence:inspect': ['/api/evidence/inspect', params],
    'authority:source-propose': ['/api/authority/propose', { ...params, kind: 'source' }],
    'authority:source-decide': ['/api/authority/decide', { ...params, kind: 'source' }],
    'authority:artifact-propose': ['/api/authority/propose', { ...params, kind: 'artifact' }],
    'authority:artifact-decide': ['/api/authority/decide', { ...params, kind: 'artifact' }],
    'conflicts:declare': ['/api/conflicts/declare', params],
    'conflicts:list': ['/api/conflicts/list', params],
    'decisions:complete': ['/api/decisions/complete', params],
    'decisions:verify': ['/api/decisions/verify', params],
    'decisions:equivalent': ['/api/decisions/equivalent', params],
    'decisions:reuse': ['/api/decisions/reuse', params],
    'workflow:list': ['/api/workflow/list', params],
    'workflow:inspect': ['/api/workflow/inspect', params],
    'workflow:state': ['/api/workflow/state', params],
    'workflow:history': ['/api/workflow/history', params],
    'package:export': ['/api/package/export', params],
    'package:validate': ['/api/package/validate', params],
    'package:plan-import': ['/api/package/plan-import', params],
    'package:import': ['/api/package/import', params],
  };
  const key = `${family}:${cmd}`;
  if (routes[key]) {
    const [path, body] = routes[key];
    return apiCall(path, body);
  }
  return {
    state: 'error',
    error: { code: 'NOT_IMPLEMENTED', message: `Command ${family}:${cmd} not implemented.` },
  };
}

/* ── Render ──────────────────────────────────────────────────── */
function esc(v) {
  return String(v ?? '').replace(
    /[&<>"']/g,
    (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m],
  );
}

function renderStatus(state) {
  statusPill.textContent = state;
  statusPill.className = 'status-pill ' + state;
}

function renderFamilies() {
  familyList.innerHTML = Object.entries(families)
    .map(
      ([key, f]) =>
        `<li class="${currentFamily === key ? 'active' : ''}" data-family="${key}">${esc(f.label)}</li>`,
    )
    .join('');
  familyList
    .querySelectorAll('li')
    .forEach((li) => li.addEventListener('click', () => selectFamily(li.dataset.family)));
}

function selectFamily(key) {
  currentFamily = key;
  currentCommand = '';
  const f = families[key];
  familyTitle.textContent = f.label;
  commandList.innerHTML = Object.entries(f.commands)
    .map(
      ([cmd, def]) =>
        `<li class="${currentCommand === cmd ? 'active' : ''}" data-cmd="${cmd}">${esc(cmd)}${def.opts.length ? ' ⚙' : ''}</li>`,
    )
    .join('');
  commandList
    .querySelectorAll('li')
    .forEach((li) => li.addEventListener('click', () => selectCommand(li.dataset.cmd)));
  optionsPanel.style.display = 'none';
  planPanel.style.display = 'none';
  resultPanel.style.display = 'none';
  lastPlan = null;
  lastPlanToken = null;
  applyBtn.disabled = true;
  renderFamilies();
}

function selectCommand(cmd) {
  currentCommand = cmd;
  const f = families[currentFamily];
  const def = f.commands[cmd];
  optionsPanel.style.display = def.opts.length ? 'block' : 'none';
  planPanel.style.display = 'block';
  resultPanel.style.display = 'none';
  lastPlan = null;
  lastPlanToken = null;
  applyBtn.disabled = true;
  // Render options
  optionsFields.innerHTML = def.opts
    .map((o) => {
      const isBool = o === 'force';
      return `<label class="inline-field">${esc(o)}${isBool ? ' <input type="checkbox" data-opt="${o}">' : ' <input type="text" data-opt="' + o + '" autocomplete="off">'}</label>`;
    })
    .join('');
  planContent.innerHTML = '<div class="empty-state">Click Preview to plan this operation.</div>';
  renderFamilies();
}

function getOpts() {
  const opts = {};
  optionsFields.querySelectorAll('[data-opt]').forEach((el) => {
    if (el.type === 'checkbox') opts[el.dataset.opt] = el.checked;
    else if (el.value.trim()) opts[el.dataset.opt] = el.value.trim();
  });
  return opts;
}

function renderPreview(result) {
  if (result.error) {
    planContent.innerHTML = `<p class="danger">${esc(result.error.code)}</p><p>${esc(result.error.message)}</p>`;
    applyBtn.disabled = true;
    return;
  }
  const data = result.data || result;
  const items = data.change_details || data.path_effects || data.entries || [];
  const summary = Array.isArray(items) ? `${items.length} item(s)` : 'Ready';
  planContent.innerHTML =
    `<p><strong>Summary:</strong> ${summary}</p>` +
    (data.reference ? `<p>Reference: ${esc(data.reference)}</p>` : '') +
    (Array.isArray(items)
      ? `<ul>${items.map((i) => `<li>${esc(i.kind || i.effect || 'item')} ${esc(i.relative_path || '')}</li>`).join('')}</ul>`
      : '');
  if (data.planToken) {
    lastPlanToken = data.planToken;
    lastPlan = data;
    applyBtn.disabled = false;
  }
}

function renderResult(result) {
  resultPanel.style.display = 'block';
  if (result.error) {
    resultContent.innerHTML = `<p class="danger">${esc(result.error.code)}</p><p>${esc(result.error.message)}</p>`;
    renderStatus('blocked');
  } else {
    const data = result.data || result;
    resultContent.innerHTML =
      `<p class="success-text">Operation completed</p>` +
      (data.operation_id ? `<p>Operation ID: ${esc(data.operation_id)}</p>` : '') +
      (data.status ? `<p>Status: ${esc(data.status)}</p>` : '');
    renderStatus('success');
  }
  receiptContent.textContent = JSON.stringify(result, null, 2);
}

/* ── Actions ─────────────────────────────────────────────────── */
async function doPreview() {
  if (!currentCommand) return;
  renderStatus('loading');
  const opts = getOpts();
  if (currentCommand === 'sync') {
    // Sync: plan first
    const plan = await apiCall('/api/sync/plan', opts);
    renderPreview(plan);
    return;
  }
  if (currentCommand === 'restore') {
    const plan = await apiCall('/api/restore/plan', {
      reference: opts.reference || '',
      overwrite: opts.force,
      force: opts.force,
    });
    renderPreview(plan);
    return;
  }
  // Generic preview: just call the command
  const result = await callCmd(currentFamily, currentCommand, opts);
  renderPreview(result);
}

async function doApply() {
  if (!currentCommand || !lastPlanToken) return;
  renderStatus('loading');
  const opts = getOpts();
  let result;
  if (currentCommand === 'sync') {
    result = await apiCall('/api/sync', {
      expectedHead: lastPlan.previous_head,
      planToken: lastPlanToken,
    });
  } else if (currentCommand === 'restore') {
    result = await apiCall('/api/restore', {
      reference: opts.reference || '',
      overwrite: opts.force,
      force: opts.force,
      planToken: lastPlanToken,
    });
  } else {
    result = await callCmd(currentFamily, currentCommand, { ...opts, planToken: lastPlanToken });
  }
  renderResult(result);
  lastPlan = null;
  lastPlanToken = null;
  applyBtn.disabled = true;
}

/* ── Events ──────────────────────────────────────────────────── */
rootInput.addEventListener('input', () => {
  root = rootInput.value.trim();
});
el('#refresh-button').addEventListener('click', async () => {
  if (!root) return;
  renderStatus('loading');
  const r = await apiCall('/api/status');
  renderStatus(r.state || 'unknown');
  versionBadge.textContent = 'v' + (r.data?.status?.head_tree_revision_id || '1.2.3').slice(0, 8);
});
el('#logs-button').addEventListener('click', () => {
  resultPanel.style.display = 'block';
});
el('#preview-button').addEventListener('click', doPreview);
applyBtn.addEventListener('click', doApply);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    planPanel.style.display = 'none';
    resultPanel.style.display = 'none';
    renderStatus('idle');
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    el('#refresh-button').click();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
    e.preventDefault();
    el('#logs-button').click();
  }
});

/* ── Init ────────────────────────────────────────────────────── */
async function init() {
  try {
    const caps = await apiCall('/api/capabilities');
    version = caps.version || '1.2.3';
    versionBadge.textContent = 'v' + version;
    renderStatus('disconnected');
    shortcutHint.textContent = 'Ctrl+R Refresh · Esc Cancel · Ctrl+L Logs';
    renderFamilies();
    // Pre-select project family
    selectFamily('project');
  } catch {
    renderStatus('error');
    versionBadge.textContent = 'offline';
  }
}

init();
