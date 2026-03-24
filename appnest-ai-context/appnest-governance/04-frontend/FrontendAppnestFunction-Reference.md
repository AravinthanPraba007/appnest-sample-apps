# Appnest client (`client.js`) — developer reference

This script runs **inside your marketplace app iframe**. It exposes **`window.AppnestFunctions`**, a small API for talking to the **parent window** (product shell) and the **Sparrow Apps backend**.

## Prerequisites

1. **`client.js` is loaded** in your app page (before you call `AppnestFunctions`).
2. Your app is **embedded in the product iframe** so `window.parent` is the host that runs the matching parent script (`parent.js`).
3. **`document.referrer`** must be the product origin; the client uses it as the `postMessage` target (`targetOrigin`).
4. For **`$appBackend.invoke`**, the app URL must include query params **`appVersionId`** and **`appId`** (read once at load). They are sent on every backend-invoke request.

## Global: `window.AppnestFunctions`

```js
window.AppnestFunctions = {
  $check,
  $appBackend,
  $productParent,
};
```

---

## `$check`

**Purpose:** Quick sanity check that the bridge script loaded.

| | |
|---|---|
| **Type** | Synchronous |
| **Signature** | `$check()` |
| **Returns** | `{ data: { message: string } }` |

**Example**

```js
const ok = window.AppnestFunctions.$check();
console.log(ok.data.message); // "Hello from Frontend AppnestFunctions"
```

---

## `$appBackend`

Server-side calls through the Sparrow Apps API (`/v2/api/sparrow-apps/backend-invoke`), proxied via the parent.

### `$appBackend.invoke`

| | |
|---|---|
| **Signature** | `invoke({ apiFunctionName, payload?, options? })` |
| **Returns** | `Promise<object>` — parsed JSON body of the HTTP response |

**Parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `apiFunctionName` | `string` | Yes | Backend method name (`serverMethod` sent to the API). Non-empty string. |
| `payload` | `any` | No | JSON-serializable argument for the server method. |
| `options` | `object` | No | Reserved; may include `timeout` (ms) forwarded to the underlying request (default **120000**). |

**Behavior**

- Sends `POST` with body: `{ serverMethod, payload, appVersionId, appId, traceId }` (`traceId` is generated per call).
- On HTTP **401**, shows a toastr error on the client.
- On status **> 300**, shows a toastr error and rejects with `Error('Sparrowapps API Error')`.

**Example**

```js
const result = await window.AppnestFunctions.$appBackend.invoke({
  apiFunctionName: 'myServerHandler',
  payload: { foo: 'bar' },
});
```

---

## `$productParent`

Calls into the **embedding product** (parent page) via `postMessage`. The parent must handle `action: 'product-parent-request'` (platform **2.0**).

### `$productParent.getName`

| | |
|---|---|
| **Returns** | `Promise` — product parent identifier from host JWT claims (e.g. `surveysparrow`) |

```js
const name = await window.AppnestFunctions.$productParent.getName();
```

### `$productParent.getRegion`

| | |
|---|---|
| **Returns** | `Promise` — region claim from the host |

```js
const region = await window.AppnestFunctions.$productParent.getRegion();
```

**Note:** Internally, these methods return `response.body` from the resolved `postMessage` result. The parent should return a shape consistent with that (e.g. `{ body: ... }`) or the client should be updated to return the raw `result` if the parent sends a plain value.

### `$productParent.invoke`

| | |
|---|---|
| **Signature** | `invoke({ actionName, actionPayload? })` |
| **Returns** | `Promise` — whatever the parent returns for that action |

Dispatches a product-specific action. Support depends on the **current product parent**. For **`surveysparrow`**, the parent typically supports actions such as:

| `actionName` | Description (typical) |
|--------------|------------------------|
| `getSurveyId` | Survey id inferred from parent URL; resolves to `{ surveyId }`. |
| `getLoggedInUserDetails` | Resolves to `{ loggedInUserDetails }` from `window.getLoggedInUserDetails()`. |
| `getLocation` | Resolves to `window.marketplaceLocalAppLocation`. |

Other product parents may reject unsupported actions.

**Example**

```js
const { surveyId } = await window.AppnestFunctions.$productParent.invoke({
  actionName: 'getSurveyId',
});
```

---

## Errors and timeouts

- Requests are tracked by **`requestId`**; responses must match or they are ignored.
- Default **timeout: 120 seconds** (`TIMEOUT` in `client.js`). On timeout the promise rejects with `Error('Timeout: …')`.
- Parent or network failures surface as rejected promises; errors from the parent may include a `.code` if provided in the error payload.

## Debugging

Set `DEBUG = true` at the top of `client.js` to enable verbose `console.trace` logging for the client bridge.

---

## TypeScript-style shape (reference)

```ts
interface AppnestFunctions {
  $check: () => { data: { message: string } };
  $appBackend: {
    invoke: (args: {
      apiFunctionName: string;
      payload?: unknown;
      options?: { timeout?: number };
    }) => Promise<unknown>;
  };
  $productParent: {
    getName: () => Promise<unknown>;
    getRegion: () => Promise<unknown>;
    invoke: (args: {
      actionName: string;
      actionPayload?: unknown;
    }) => Promise<unknown>;
  };
}
```
