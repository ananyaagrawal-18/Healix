import { clientEngine } from './clientEngine';

// Configurable API Base (via localStorage, Vite env, or relative /api)
function getApiBase() {
  const custom = localStorage.getItem('healix-api-base');
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/+$/, '');
  }
  return import.meta.env.VITE_API_BASE_URL || '/api';
}

export function setCustomApiBase(url) {
  if (url && url.trim()) {
    localStorage.setItem('healix-api-base', url.trim().replace(/\/+$/, ''));
  } else {
    localStorage.removeItem('healix-api-base');
  }
}

export function getCustomApiBase() {
  return localStorage.getItem('healix-api-base') || '';
}

// Resilient fetch wrapper with seamless Client-Side Engine fallback
async function resilientFetch(endpoint, options = {}, fallbackFn) {
  const base = getApiBase();
  const url = `${base}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    // Backend unreachable or offline - fall through to client engine
  }

  // Fallback to in-browser autonomous engine
  if (fallbackFn) {
    return fallbackFn();
  }
  throw new Error(`Endpoint ${endpoint} unavailable and no fallback defined.`);
}

export async function fetchHealth() {
  return resilientFetch('/health', {}, () => clientEngine.getHealth());
}

export async function fetchWorkflows() {
  return resilientFetch('/workflows', {}, () => clientEngine.getWorkflows());
}

export async function fetchWorkflowDetail(id) {
  return resilientFetch(`/workflows/${id}`, {}, () => clientEngine.getWorkflowDetail(id));
}

export async function runWorkflow(id, { injectFailure = false, failureType = null } = {}) {
  return resilientFetch(
    `/workflows/${id}/run`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inject_failure: injectFailure, failure_type: failureType })
    },
    () => clientEngine.runWorkflow(id, { injectFailure, failureType })
  );
}

export async function diagnoseWorkflow(id) {
  return resilientFetch(
    `/workflows/${id}/diagnose`,
    { method: 'POST' },
    () => clientEngine.diagnoseWorkflow(id)
  );
}

export async function healWorkflow(id, { runId, approved = true, customPatch = null } = {}) {
  return resilientFetch(
    `/workflows/${id}/heal`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ run_id: runId, approved, custom_patch: customPatch })
    },
    () => clientEngine.healWorkflow(id)
  );
}

export async function resetWorkflow(id) {
  return resilientFetch(
    `/workflows/${id}/reset`,
    { method: 'POST' },
    () => clientEngine.resetWorkflow(id)
  );
}

export async function fetchIncidents() {
  return resilientFetch('/incidents', {}, () => clientEngine.getIncidents());
}

export async function fetchSettings() {
  return resilientFetch('/settings', {}, () => clientEngine.getSettings());
}

export async function updateApiKey(apiKey) {
  return resilientFetch(
    '/settings/key',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey })
    },
    () => ({ status: 'success', key_saved: Boolean(apiKey) })
  );
}

export async function sendChatMessage(message, workflowId = null, history = []) {
  return resilientFetch(
    '/chat',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, workflow_id: workflowId, history })
    },
    () => clientEngine.sendChatMessage(message, workflowId)
  );
}

export async function fetchSdkSamples() {
  return resilientFetch('/sdk/samples', {}, () => clientEngine.getSdkSamples());
}

export async function executeSdkCode(code, funcName, inputArgs) {
  return resilientFetch(
    '/sdk/execute',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, func_name: funcName, input_args: inputArgs })
    },
    () => clientEngine.executeSdkCode(code, funcName, inputArgs)
  );
}

export async function fetchIntegrationDocs() {
  return resilientFetch('/sdk/integration-docs', {}, () => clientEngine.getIntegrationDocs());
}
