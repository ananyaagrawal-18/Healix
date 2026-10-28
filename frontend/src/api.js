const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}

export async function fetchWorkflows() {
  const res = await fetch(`${API_BASE}/workflows`);
  if (!res.ok) throw new Error('Failed to fetch workflows');
  return res.json();
}

export async function fetchWorkflowDetail(id) {
  const res = await fetch(`${API_BASE}/workflows/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch workflow ${id}`);
  return res.json();
}

export async function runWorkflow(id, { injectFailure = false, failureType = null } = {}) {
  const res = await fetch(`${API_BASE}/workflows/${id}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inject_failure: injectFailure, failure_type: failureType })
  });
  if (!res.ok) throw new Error('Failed to run workflow');
  return res.json();
}

export async function diagnoseWorkflow(id) {
  const res = await fetch(`${API_BASE}/workflows/${id}/diagnose`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to diagnose workflow');
  return res.json();
}

export async function healWorkflow(id, { runId, approved = true, customPatch = null } = {}) {
  const res = await fetch(`${API_BASE}/workflows/${id}/heal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ run_id: runId, approved, custom_patch: customPatch })
  });
  if (!res.ok) throw new Error('Failed to heal workflow');
  return res.json();
}

export async function resetWorkflow(id) {
  const res = await fetch(`${API_BASE}/workflows/${id}/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset workflow');
  return res.json();
}

export async function fetchIncidents() {
  const res = await fetch(`${API_BASE}/incidents`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateApiKey(apiKey) {
  const res = await fetch(`${API_BASE}/settings/key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey })
  });
  if (!res.ok) throw new Error('Failed to update API key');
  return res.json();
}

export async function sendChatMessage(message, workflowId = null, history = []) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, workflow_id: workflowId, history })
  });
  if (!res.ok) throw new Error('Failed to send chat message');
  return res.json();
}

export async function fetchSdkSamples() {
  const res = await fetch(`${API_BASE}/sdk/samples`);
  if (!res.ok) throw new Error('Failed to fetch SDK samples');
  return res.json();
}

export async function executeSdkCode(code, funcName, inputArgs) {
  const res = await fetch(`${API_BASE}/sdk/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, func_name: funcName, input_args: inputArgs })
  });
  if (!res.ok) throw new Error('Failed to execute SDK code');
  return res.json();
}

export async function fetchIntegrationDocs() {
  const res = await fetch(`${API_BASE}/sdk/integration-docs`);
  if (!res.ok) throw new Error('Failed to fetch integration docs');
  return res.json();
}

