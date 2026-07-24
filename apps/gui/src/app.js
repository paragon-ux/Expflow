/* ── State ──────────────────────────────────────────────────── */
let root = '';
let version = '';
let currentFamily = '';
let currentCommand = '';
let lastPlan = null;
let lastPlanToken = null;
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
const previewBtn = el('#preview-button');

/* ── Helpers ────────────────────────────────────────────────── */
function esc(v) {
  return String(v ?? '').replace(
    /[&<>"']/g,
    (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m],
  );
}
function kv(items) {
  return items.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(String(v))}</dd>`).join('');
}

function renderStatus(state, label) {
  statusPill.textContent = label || state;
  statusPill.className = 'status-pill ' + (state || 'idle');
}

function setLoading(label) {
  renderStatus('loading', label);
}
function setSuccess() {
  renderStatus('success', 'success');
}
function setBlocked() {
  renderStatus('blocked', 'blocked');
}
function setError() {
  renderStatus('error', 'error');
}

/* ── API ────────────────────────────────────────────────────── */
async function apiCall(path, body = {}) {
  try {
    const resp = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-request-token': pageToken },
      body: JSON.stringify({ root, ...body }),
    });
    const text = await resp.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON response from server');
    }
    if (!resp.ok) {
      return {
        state: 'error',
        error: payload.error || { code: 'HTTP_' + resp.status, message: text || 'Request failed' },
      };
    }
    return payload;
  } catch (err) {
    return {
      state: 'error',
      error: {
        code: 'NETWORK',
        message: err.message || 'Connection failed',
        recoverable: true,
        recommended_action: 'Check that the Expflow GUI server is running on localhost.',
      },
    };
  }
}

/* ── Command definitions with execution modes ────────────────── */
// mode: 'read' | 'planned-mutation' | 'direct-mutation'
const families = {
  project: {
    label: 'Project',
    state: 'implemented',
    commands: {
      inspect: { mode: 'read', opts: [], desc: 'Inspect project state and identity.' },
      init: {
        mode: 'direct-mutation',
        opts: [],
        desc: 'Initialize a new Expflow project.',
        confirm: 'Initialize a new Expflow project?',
      },
    },
  },
  material: {
    label: 'Material',
    state: 'implemented',
    commands: {
      status: { mode: 'read', opts: [], desc: 'View material working-tree status.' },
      sync: {
        mode: 'planned-mutation',
        opts: ['expectedHead'],
        desc: 'Sync material sources into the project.',
        previewRoute: '/api/sync/plan',
        applyRoute: '/api/sync',
      },
      history: { mode: 'read', opts: [], desc: 'View tree revision history.' },
      restore: {
        mode: 'planned-mutation',
        opts: ['reference', 'force'],
        desc: 'Restore project state from a reference.',
        previewRoute: '/api/restore/plan',
        applyRoute: '/api/restore',
      },
      receipts: { mode: 'read', opts: ['operationId'], desc: 'View a durable operation receipt.' },
      recover: { mode: 'read', opts: [], desc: 'Check for interrupted commits.' },
    },
  },
  workflow: {
    label: 'Workflow',
    state: 'partial',
    commands: {
      list: { mode: 'read', opts: [], desc: 'List workflow occurrences.' },
      inspect: { mode: 'read', opts: ['workflowId'], desc: 'Inspect a workflow occurrence.' },
      state: { mode: 'read', opts: ['workflowId'], desc: 'Read workflow state.' },
      history: { mode: 'read', opts: ['workflowId'], desc: 'View workflow history.' },
    },
  },
  evidence: {
    label: 'Evidence',
    state: 'partial',
    commands: {
      intake: {
        mode: 'direct-mutation',
        opts: ['path'],
        desc: 'Intake evidence from a file.',
        confirm: 'Intake this evidence file?',
      },
      inspect: { mode: 'read', opts: ['reference'], desc: 'Inspect previously intaken evidence.' },
    },
  },
  authority: {
    label: 'Authority',
    state: 'partial',
    commands: {
      'source-propose': {
        mode: 'direct-mutation',
        opts: ['type', 'identifier', 'description'],
        desc: 'Propose an authority source.',
        confirm: 'Propose this authority source?',
      },
      'source-decide': {
        mode: 'direct-mutation',
        opts: ['reference', 'decision'],
        desc: 'Decide on a proposed source.',
        confirm: 'Decide on this source?',
      },
      'artifact-propose': {
        mode: 'direct-mutation',
        opts: ['type', 'identifier', 'description'],
        desc: 'Propose an authority artifact.',
        confirm: 'Propose this artifact?',
      },
      'artifact-decide': {
        mode: 'direct-mutation',
        opts: ['reference', 'decision'],
        desc: 'Decide on a proposed artifact.',
        confirm: 'Decide on this artifact?',
      },
    },
  },
  conflicts: {
    label: 'Conflicts',
    state: 'partial',
    commands: {
      declare: {
        mode: 'direct-mutation',
        opts: ['description'],
        desc: 'Declare a conflict.',
        confirm: 'Declare this conflict?',
      },
      list: { mode: 'read', opts: [], desc: 'List declared conflicts.' },
    },
  },
  decisions: {
    label: 'Decisions',
    state: 'partial',
    commands: {
      complete: {
        mode: 'direct-mutation',
        opts: ['reference', 'result'],
        desc: 'Complete a decision.',
        confirm: 'Complete this decision?',
      },
      verify: { mode: 'read', opts: ['reference'], desc: 'Verify a decision.' },
      equivalent: {
        mode: 'read',
        opts: ['reference', 'other'],
        desc: 'Check equivalence of two decisions.',
      },
      reuse: { mode: 'read', opts: ['reference'], desc: 'Check reuse potential for a decision.' },
    },
  },
  package: {
    label: 'Package',
    state: 'unavailable',
    commands: {
      export: { mode: 'direct-mutation', opts: ['output'], desc: 'Available via CLI only.' },
      validate: { mode: 'read', opts: ['path'], desc: 'Available via CLI only.' },
      'plan-import': { mode: 'direct-mutation', opts: ['path'], desc: 'Available via CLI only.' },
      import: {
        mode: 'direct-mutation',
        opts: ['path', 'planToken'],
        desc: 'Available via CLI only.',
      },
    },
  },
  reporting: {
    label: 'Reporting',
    state: 'partial',
    commands: {
      capabilities: { mode: 'read', opts: [], desc: 'Show system capabilities.' },
      inspect: { mode: 'read', opts: [], desc: 'Inspect project state.' },
      history: { mode: 'read', opts: [], desc: 'View revision history.' },
    },
  },
};

/* ── Renderers ──────────────────────────────────────────────── */

function renderProjectStatus(data) {
  const s = data.status || data;
  return `<div class="result-summary">
    <h4>Project State</h4>
    <dl class="kv-list"><dt>Project root</dt><dd>${esc(root)}</dd>
    <dt>Initialization</dt><dd>${esc(s.working_tree_state === 'uninitialized' ? 'Not initialized' : 'Initialized')}</dd>
    <dt>Project ID</dt><dd>${esc(s.project_id || '—')}</dd>
    <dt>Working tree</dt><dd>${esc(s.working_tree_state || 'unknown')}</dd>
    <dt>Material head</dt><dd>${esc(s.head_tree_revision_id || 'none')}</dd>
    <dt>Pending changes</dt><dd>${s.pending_change_details ? s.pending_change_details.length : '0'}</dd>
    <dt>Unresolved items</dt><dd>${s.unresolved_items ? s.unresolved_items.length : '0'}</dd>
    <dt>Recommended action</dt><dd>${esc(s.recommended_action || 'Inspect further or run a plan.')}</dd>
    </dl></div>`;
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
    (Array.isArray(items) && items.length
      ? `<ul>${items.map((i) => `<li>${esc(i.kind || i.effect || 'item')} ${esc(i.relative_path || '')}</li>`).join('')}</ul>`
      : '');
  if (data.planToken) {
    lastPlanToken = data.planToken;
    lastPlan = data;
    applyBtn.disabled = false;
  }
  renderStatus(result.state || 'success', 'plan ready');
}

function renderResult(result) {
  resultPanel.style.display = 'block';
  if (result.error) {
    resultContent.innerHTML =
      `<p class="danger">${esc(result.error.code)}</p><p>${esc(result.error.message)}</p>` +
      (result.error.recommended_action ? `<p>→ ${esc(result.error.recommended_action)}</p>` : '');
    renderStatus('blocked', result.error.code || 'error');
  } else {
    const data = result.data || result;
    // Use operation-specific renderer when available
    if (currentCommand === 'inspect' || currentCommand === 'status') {
      resultContent.innerHTML = renderProjectStatus(data);
    } else {
      resultContent.innerHTML =
        `<p class="success-text">Operation completed</p>` +
        (data.operation_id ? `<p>Operation ID: <code>${esc(data.operation_id)}</code></p>` : '') +
        (data.status ? `<p>Status: ${esc(data.status)}</p>` : '');
    }
    renderStatus('success', 'success');
  }
  receiptContent.textContent = JSON.stringify(result, null, 2);
}

/* ── Render layout ──────────────────────────────────────────── */
function renderFamilies() {
  familyList.innerHTML = Object.entries(families)
    .map(([key, f]) => {
      const cls = [
        currentFamily === key ? 'active' : '',
        f.state === 'unavailable' ? 'dimmed' : '',
        f.state,
      ]
        .filter(Boolean)
        .join(' ');
      return `<li class="${cls}" data-family="${key}" title="${esc(f.label)} — ${f.state}">${esc(f.state === 'unavailable' ? f.label + ' (CLI)' : f.label)}</li>`;
    })
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
    .map(([cmd, def]) => {
      const cls = currentCommand === cmd ? 'active' : '';
      const marker =
        def.mode === 'direct-mutation' ? '⚡' : def.mode === 'planned-mutation' ? '📋' : '';
      return `<li class="${cls}" data-cmd="${cmd}" title="${esc(def.desc || '')}">${marker} ${esc(cmd)}</li>`;
    })
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
  const isRead = def.mode === 'read';
  const isPlanned = def.mode === 'planned-mutation';

  optionsPanel.style.display = def.opts.length ? 'block' : 'none';
  planPanel.style.display = isRead ? 'none' : 'block';
  resultPanel.style.display = 'none';
  lastPlan = null;
  lastPlanToken = null;
  applyBtn.disabled = true;

  // Render options with friendly labels
  optionsFields.innerHTML = def.opts
    .map((o) => {
      const isBool = o === 'force' || o === 'overwrite';
      const label =
        {
          expectedHead: 'Expected head',
          workflowId: 'Workflow ID',
          operationId: 'Operation ID',
          reference: 'Reference',
          path: 'Path',
          output: 'Output',
          description: 'Description',
          identifier: 'Identifier',
          type: 'Type',
          decision: 'Decision',
          result: 'Result',
          other: 'Other reference',
          state: 'State',
        }[o] || o;
      return `<label class="inline-field">${esc(label)}${isBool ? ' <input type="checkbox" data-opt="' + o + '">' : ' <input type="text" data-opt="' + o + '" autocomplete="off">'}</label>`;
    })
    .join('');

  // Update buttons based on mode
  if (isRead) {
    previewBtn.textContent = 'Run';
    previewBtn.style.display = '';
    applyBtn.style.display = 'none';
  } else if (isPlanned) {
    previewBtn.textContent = 'Preview';
    previewBtn.style.display = '';
    applyBtn.style.display = '';
  } else {
    previewBtn.textContent = 'Execute';
    previewBtn.style.display = '';
    applyBtn.style.display = 'none';
  }
  planContent.innerHTML =
    '<div class="empty-state">' +
    (def.desc ? esc(def.desc) : 'Configure and execute this operation.') +
    '</div>';
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

/* ── Action routing ─────────────────────────────────────────── */
async function doPrimaryAction() {
  if (!currentCommand) return;
  const f = families[currentFamily];
  const def = f.commands[currentCommand];
  setLoading(currentCommand);

  try {
    if (def.mode === 'read') {
      // Read: execute directly, show result
      const result = await callCmd(currentFamily, currentCommand, getOpts());
      renderResult(result);
    } else if (def.mode === 'planned-mutation') {
      // Planned mutation: preview (non-mutating)
      const opts = getOpts();
      if (def.previewRoute) {
        const plan = await apiCall(
          def.previewRoute,
          currentCommand === 'restore'
            ? { reference: opts.reference || '', overwrite: opts.force, force: opts.force }
            : opts,
        );
        renderPreview(plan);
      } else {
        const plan = await callCmd(currentFamily, currentCommand, opts);
        renderPreview(plan);
      }
    } else {
      // Direct mutation: confirm then execute
      if (def.confirm && !window.confirm(def.confirm)) {
        renderStatus('idle', 'cancelled');
        return;
      }
      const result = await callCmd(currentFamily, currentCommand, getOpts());
      renderResult(result);
    }
  } catch (err) {
    renderResult({ error: { code: 'UNHANDLED', message: err.message || 'Unknown error' } });
  }
}

async function doApply() {
  if (!currentCommand || !lastPlanToken) return;
  setLoading('applying ' + currentCommand);
  try {
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
  } catch (err) {
    renderResult({ error: { code: 'UNHANDLED', message: err.message || 'Apply failed' } });
  }
}

/* ── Command routing to endpoints ───────────────────────────── */
async function callCmd(family, cmd, opts = {}) {
  const params = { root, ...opts };
  const routes = {
    'project:init': ['/api/init', params],
    'project:inspect': ['/api/status', params],
    'material:status': ['/api/status', params],
    'material:history': ['/api/history', params],
    'material:receipts': ['/api/receipt', { root, operationId: opts.operationId || '' }],
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
    error: { code: 'NOT_IMPLEMENTED', message: `Command ${family}:${cmd} not available.` },
  };
}

/* ── UI Events ───────────────────────────────────────────────── */
rootInput.addEventListener('input', () => {
  root = rootInput.value.trim();
});
el('#refresh-button').addEventListener('click', async () => {
  if (!root) return;
  setLoading('inspecting');
  try {
    const r = await apiCall('/api/status');
    renderStatus(r.state || 'success', r.state || 'connected');
    if (r.data) {
      const status = r.data.status || r.data;
      versionBadge.textContent = 'v' + (status.project_id || '1.2.3').slice(0, 10);
    }
  } catch {
    renderStatus('error', 'offline');
  }
});
el('#logs-button').addEventListener('click', () => {
  resultPanel.style.display = 'block';
});

previewBtn.addEventListener('click', doPrimaryAction);
applyBtn.addEventListener('click', doApply);

// Init: disable apply by default
applyBtn.style.display = 'none';

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    renderStatus('idle', 'cancelled');
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
    renderStatus('idle', 'ready');
    renderFamilies();
    selectFamily('project');
  } catch {
    renderStatus('error', 'offline');
    versionBadge.textContent = 'offline';
  }
}

init();
