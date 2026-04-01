export async function invokeBackend(apiFunctionName, payload = {}) {
  const invoke = window.AppnestFunctions?.$appBackend?.invoke;
  if (typeof invoke !== 'function') {
    throw new Error(
      'appBackend.invoke is not available. Open this app inside Appnest (e.g. app start).',
    );
  }
  // Wire capture shows `serverMethod`; some hosts only read that key. Keep both.
  return invoke({
    apiFunctionName,
    serverMethod: apiFunctionName,
    payload,
  });
}

/**
 * Same as invokeBackend but returns only the handler payload (runs, totalRuns, etc.).
 */
export async function invokeBackendBody(apiFunctionName, payload = {}) {
  const raw = await invokeBackend(apiFunctionName, payload);
  return unwrapInvokeResult(raw).body;
}

function parseJsonIfString(value) {
  if (typeof value !== 'string') return value;
  const t = value.trim();
  if (!t) return value;
  try {
    return JSON.parse(t);
  } catch {
    return value;
  }
}

function hasLabListShape(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    ('runs' in obj || 'totalRuns' in obj || 'removed' in obj || 'cleared' in obj)
  );
}

/** Unwrap one level of { body } / { data } when the real payload is nested. */
function liftPayloadShape(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  if (hasLabListShape(obj)) return obj;
  if (obj.body != null && typeof obj.body === 'object' && !Array.isArray(obj.body)) {
    if (hasLabListShape(obj.body)) return obj.body;
  }
  if (obj.data != null && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    if (hasLabListShape(obj.data)) return obj.data;
  }
  return obj;
}

/**
 * Normalize invoke() results: `{ statusCode, body }`, stringified body, or nested body/data.
 */
export function unwrapInvokeResult(raw) {
  if (raw == null || typeof raw !== 'object') {
    return { statusCode: undefined, body: raw };
  }

  const statusCode = raw.statusCode ?? raw.status;

  let body;
  if ('body' in raw) {
    body = parseJsonIfString(raw.body);
  } else {
    body = raw;
  }

  body = liftPayloadShape(body);
  body = parseJsonIfString(body);

  return { statusCode, body };
}

export function formatOutcomePayload(body) {
  if (body === null || body === undefined) return '(empty)';
  if (typeof body === 'string') return body;
  try {
    return JSON.stringify(body, null, 2);
  } catch {
    return String(body);
  }
}

export function sdkAction(category, action, extra = {}) {
  return invokeBackend('runSdkLabAction', { category, action, ...extra });
}
