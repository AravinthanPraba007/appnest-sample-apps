/**
 * Invoke backend functions via Appnest client.
 * Response shape: { statusCode, body }. We return body; on non-2xx we throw or return error from body.
 */
export async function invoke(functionName, payload = {}) {
  const client = window.appnestClientFunctions;
  if (!client?.appBackend?.invoke) {
    throw new Error('Appnest client not available');
  }
  console.log("xd--");
  console.log(functionName);
  console.log(payload);
  const response = await client.appBackend.invoke({ apiFunctionName: functionName, payload });
  const { statusCode, body } = response || {};
  if (statusCode >= 400) {
    const err = new Error(body?.error || body?.message || `Request failed (${statusCode})`);
    err.statusCode = statusCode;
    err.body = body;
    throw err;
  }
  return body;
}
