/**
 * Invokes AppNest backend functions (Survey CSV import).
 * @param {string} apiFunctionName
 * @param {Record<string, unknown>} [payload]
 */
export async function invokeBackend(apiFunctionName, payload = {}) {
  const inv = window.appnestClientFunctions?.appBackend?.invoke;
  if (typeof inv !== 'function') {
    const err = new Error(
      'Backend is only available inside the AppNest host (appnestClientFunctions missing).'
    );
    err.code = 'NO_HOST';
    throw err;
  }
  const res = await inv({ apiFunctionName, payload });
  if (res.statusCode < 200 || res.statusCode >= 300) {
    const msg =
      (res.body && (res.body.error || res.body.message)) ||
      `Request failed (${res.statusCode})`;
    const err = new Error(msg);
    err.statusCode = res.statusCode;
    err.body = res.body;
    throw err;
  }
  return res.body;
}
