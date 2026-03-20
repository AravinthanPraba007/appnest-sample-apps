# Appnest Client SDK — Invoke Backend Function

This document describes the **client-side** function used to invoke a backend (server) function by name. Use it for **code generation**, auto-completion, and integration in your app's frontend or client code.

**For AI code generation:** This is the **client** API. Use `appBackendInvoke` when the client (e.g. browser, mobile app) needs to call a named backend function. For **backend** SDK functions (`$db`, `$http`, `$file`, `$next`, `$schedule`), see [Backend-Appnest-SDK-Reference.md](../02-sdk/Backend-Appnest-SDK-Reference.md).

---

## Import / usage

`appBackendInvoke` is provided by the Appnest client SDK. The exact import path depends on your project (e.g. from the platform's client bundle or a local wrapper). Ensure `makeSparrowAppsApiRequest`, `createUUID`, `appId`, and `appVersionId` are available in scope (typically injected by the platform or your client setup).

```javascript
// Example: after client SDK is loaded
const result = await appBackendInvoke({
  apiFunctionName: 'myBackendHandler',
  payload: { userId: 123, action: 'sync' }
});
```

---

## API

### appBackendInvoke

Invokes a backend function by name. Sends a POST request to the platform's backend-invoke endpoint with the given function name and payload. The client context (`appId`, `appVersionId`, `traceId`) is added automatically.

| Item | Description |
|------|-------------|
| **Signature** | `appBackendInvoke({ apiFunctionName, payload, options })` |
| **Return** | `Promise<any>` — the **parsed JSON body** of the backend response. Not `{ data, status }`; the response body is parsed and returned directly. |
| **Throws** | Rethrows if the request fails or response is not valid JSON. |

---

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `apiFunctionName` | string | yes | — | Name of the backend function to invoke (e.g. the server method/handler name). |
| `payload` | object | yes | — | Data to send to the backend function. Must be serializable (e.g. plain object, array). |
| `options` | object | no | `{}` | Optional extra options (reserved for future use). |

**Request:** The function sends a POST to `/v2/api/sparrow-apps/backend-invoke` with a body that includes `serverMethod` (same as `apiFunctionName`), `payload`, `appVersionId`, `appId`, and `traceId` (from `createUUID()`). The actual HTTP call is made via `makeSparrowAppsApiRequest`.

---

## Return value

- **Success:** The **parsed JSON** of `response.body` is returned. Type is `any` (object, array, or primitive depending on what the backend returns).
- **Failure:** The promise rejects; errors are rethrown (e.g. network error, non-JSON response).

**Do not** assume a wrapper shape like `{ data, status }`. Use the returned value directly as the backend response body.

---

## Examples

**Invoke a backend function with a payload:**

```javascript
const data = await appBackendInvoke({
  apiFunctionName: 'getUserSettings',
  payload: { userId: 'user_123' }
});
// data is the parsed response body (e.g. { theme: 'dark', notifications: true })
```

**Invoke with empty payload:**

```javascript
const result = await appBackendInvoke({
  apiFunctionName: 'refreshCache',
  payload: {}
});
```

**With options (for future use):**

```javascript
const result = await appBackendInvoke({
  apiFunctionName: 'exportData',
  payload: { format: 'csv' },
  options: {}
});
```

---

## Summary for code generation

| Function | Params | Return |
|----------|--------|--------|
| `appBackendInvoke({ apiFunctionName, payload, options })` | `apiFunctionName` (string, required), `payload` (object, required), `options` (object, optional, default `{}`) | `Promise<any>` — parsed JSON body of the backend response |

- **Client-only:** Use from frontend/client code to call backend functions by name.
- **Backend functions** (e.g. `getUserSettings`, `refreshCache`) are implemented on the server and documented in the backend SDK reference.
