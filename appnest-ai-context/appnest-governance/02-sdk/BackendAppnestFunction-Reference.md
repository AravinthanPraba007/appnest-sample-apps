# Appnest Backend SDK Functions — Developer Reference

This document is the **single source of truth** for the Appnest custom SDK functions. Use it for **code generation**, auto-completion, and integration in your app.

**For AI code generation:** (1) This file is self-contained; all function signatures, parameters, return shapes, and constraints are below. (2) **Import pattern:** The package exports `AppnestFunctions` and `ResultData` only. Always use: `const { AppnestFunctions } = require('@aravinthan_p/appnest-app-sdk-utils'); const { $db, $http, $file, $next, $schedule, getTraceId } = AppnestFunctions;` (destructure only the modules you need). Do not use `const { $db } = require('@aravinthan_p/appnest-app-sdk-utils')` — that is incorrect.

**Do not add `@aravinthan_p/appnest-app-sdk-utils` (or `@aravinthan_p/appnest-app-sdk-utils`) to `app-backend/package.json`.** The SDK is provided by the AppNest platform at runtime. Your backend code should `require('@aravinthan_p/appnest-app-sdk-utils')` (or the package name configured by the platform) without listing it as a dependency.

---

## Import

```javascript
const { AppnestFunctions } = require('@aravinthan_p/appnest-app-sdk-utils');
// or from path:
// const { AppnestFunctions } = require('<path-to-sdk>/appnestFunctions');

const { $db, $file, $http, $next, $schedule, getTraceId } = AppnestFunctions;
```

---

## Quick reference

| Module      | Purpose                    | Main APIs / Methods |
|------------|----------------------------|----------------------|
| **$db**    | Key/value storage          | `get`, `create`, `update`, `delete`; typed: `string`, `number`, `list`, `map`, `boolean` (each with get/create/update/delete and type-specific ops) |
| **$http**  | Outbound HTTP requests     | `request({ url, method, headers, body, query })` |
| **$file**  | File storage (signed URLs) | `getUploadUrl`, `getDownloadUrl`, `delete`, `list`, `exists` |
| **$next**  | Invoke another function    | `run({ functionName, payload, delay })` |
| **$schedule** | Scheduled jobs          | `create`, `get`, `update`, `pause`, `resume`, `delete` |
| **getTraceId** | Request trace ID       | `getTraceId()` → string (for logging/correlation) |

---

## Module details (per-function docs)

Each module has a dedicated MD file with full signatures, parameters, and examples. Paths are relative to `appnestFunctions/`:

| Module    | Doc file              | Summary |
|-----------|------------------------|--------|
| **$db**   | [dbFunction/db.MD](dbFunction/db.MD) | Key/value by type: STRING, NUMBER, LIST, MAP, BOOLEAN. Common param: `key` (string). |
| **$http** | [httpFunction/http.MD](httpFunction/http.MD) | `$http.request({ url, method, headers, body, query })`. Methods: GET, POST, PUT, DELETE, PATCH. Use `<%=iparams.<key>%>` for manifest params; use `<%=user_oauth.access_token%>` in headers for platform's access_token (e.g. OAuth or API auth); framework replaces at runtime. |
| **$file** | [fileFunction/file.MD](fileFunction/file.MD) | `getUploadUrl`, `getDownloadUrl`, `delete`, `list`, `exists`. Params: `path`, `visibility` (optional). |
| **$next** | [nextFunction/next.MD](nextFunction/next.MD) | `$next.run({ functionName, payload, delay })`. Delay in seconds. |
| **$schedule** | [scheduleFunction/schedule.MD](scheduleFunction/schedule.MD) | Types: ONE_TIME, CRON, RECURRING. `name`, `type`, `data` required; type-specific: `runAt`, `cronExpression`, or `repeat`. |

---

## Code reference — function signatures & param details

**Return shapes (summary):**  
- **$db:** Get methods return the value directly (string, number, array, object, boolean). Create/update/delete return nothing (`Promise<void>`).  
- **$http:** `request` returns `Promise<{ headers, body, status }>`.  
- **$file:** All methods return the response object directly (e.g. `{ preSignedUrl }`, `{ deleted }`, `{ objects }`, `{ exists }`). No `{ data, status }` wrapper.  
- **$next:** `run` returns the API response body directly (e.g. `Promise<{ success: boolean }>`).  
- **$schedule:** All methods return nothing (`Promise<void>`).

---

### $db

**Common param for all $db methods:** `key` (string, required, non-empty, max 1000 chars).

| Function | Params | Types / constraints |
|----------|--------|----------------------|
| `$db.get({ key })` | key | string |
| `$db.create({ key, value })` | key, value | key: string; value: string |
| `$db.update({ key, value })` | key, value | key: string; value: string |
| `$db.delete({ key })` | key | string |
| `$db.string.get({ key })` | key | string |
| `$db.string.create({ key, value })` | key, value | key: string; value: string |
| `$db.string.update({ key, value })` | key, value | string, string |
| `$db.string.delete({ key })` | key | string |
| `$db.number.get({ key })` | key | string |
| `$db.number.create({ key, value })` | key, value | key: string; value: number |
| `$db.number.update({ key, value })` | key, value | string, number |
| `$db.number.delete({ key })` | key | string |
| `$db.number.increment({ key, value })` | key, value | key: string; value: number (optional, for increment amount) |
| `$db.number.decrement({ key, value })` | key, value | key: string; value: number (optional, for decrement amount) |
| `$db.list.get({ key })` | key | string |
| `$db.list.create({ key, value })` | key, value | key: string; value: array |
| `$db.list.update({ key, value })` | key, value | string, array |
| `$db.list.append({ key, value })` | key, value | string, array |
| `$db.list.prepend({ key, value })` | key, value | string, array |
| `$db.list.updateItemAtIndex({ key, value, index })` | key, value, index | string, array, number |
| `$db.list.removeItemAtIndex({ key, index })` | key, index | string, number |
| `$db.map.get({ key })` | key | string |
| `$db.map.create({ key, value })` | key, value | key: string; value: object (JSON-serializable) |
| `$db.map.update({ key, value })` | key, value | string, object |
| `$db.map.delete({ key })` | key | string |
| `$db.boolean.get({ key })` | key | string |
| `$db.boolean.create({ key, value })` | key, value | key: string; value: boolean |
| `$db.boolean.update({ key, value })` | key, value | string, boolean |
| `$db.boolean.delete({ key })` | key | string |

---

### $http

| Function | Params | Types / constraints |
|----------|--------|----------------------|
| `$http.request({ url, query, method, headers, body })` | url, query, method, headers, body | **url** (string, required). **method** (string, required): `GET` \| `POST` \| `PUT` \| `DELETE` \| `PATCH`. **headers** / **body** / **query** (object, optional, default `{}`). **Return:** `Promise<{ headers, body, status }>`. **Runtime replacement:** Use `<%=iparams.<key>%>` and `<%=user_oauth.access_token%>` in headers. See [http.MD](httpFunction/http.MD). |

---

### $file

**Common params:** `path` (string, required), `visibility` (string, optional, default `"PUBLIC"`: `"PUBLIC"` \| `"PRIVATE"`). All return the response object directly (no `{ data, status }` wrapper).

| Function | Params | Return |
|----------|--------|--------|
| `$file.getUploadUrl({ path, visibility })` | path, visibility | `Promise<{ preSignedUrl: string }>` |
| `$file.getDownloadUrl({ path, visibility })` | path, visibility | `Promise<{ preSignedUrl: string }>` |
| `$file.delete({ path, visibility })` | path, visibility | `Promise<{ deleted: boolean }>` |
| `$file.list({ path, visibility })` | path, visibility | `Promise<{ objects: Array<string> }>` |
| `$file.exists({ path, visibility })` | path, visibility | `Promise<{ exists: boolean }>` |

---

### $next

| Function | Params | Types / constraints | Return |
|----------|--------|----------------------|--------|
| `$next.run({ functionName, payload, delay })` | functionName, payload, delay | **functionName** (string, required). **payload** (object, required). **delay** (number, optional, default 0): seconds, >= 0. | `Promise<object>` (API response body, e.g. `{ success: boolean }`) |

---

### $schedule

**Common for create/update:** `name` (string, required, max 30), `type` (string, required: `ONE_TIME` \| `CRON` \| `RECURRING`), `data` (object, required, at least one key). All schedule methods return `Promise<void>`.

| Function | Params | Types / constraints |
|----------|--------|----------------------|
| `$schedule.create({ name, type, data, runAt? \| cronExpression? \| repeat? })` | name, type, data + type-specific | **ONE_TIME:** `runAt` (string, required). **CRON:** `cronExpression` (string, required). **RECURRING:** `repeat: { frequency, timeUnit }` — frequency (integer >= 1; >= 10 if timeUnit is MINUTES), timeUnit: `MINUTES` \| `HOURS` \| `DAYS` \| `WEEKS` \| `MONTHS` \| `YEARS`. |
| `$schedule.get({ name, type })` | name, type | name: string; type: ONE_TIME \| CRON \| RECURRING |
| `$schedule.update({ name, type, data, runAt? \| cronExpression? \| repeat? })` | same as create | Same type-specific rules as create. |
| `$schedule.pause({ name, type })` | name, type | string, string |
| `$schedule.resume({ name, type })` | name, type | string, string |
| `$schedule.delete({ name, type })` | name, type | string, string |

---

### getTraceId

| Function | Params | Return |
|----------|--------|--------|
| `getTraceId()` | none | string (trace ID for logging/correlation) |

---

## Usage in handlers

Typical pattern inside a Lambda or handler:

```javascript
const { AppnestFunctions } = require('@aravinthan_p/appnest-app-sdk-utils');
const { $db, $http, $file, $next, $schedule, getTraceId } = AppnestFunctions;

exports.myHandler = async (event, context) => {
  const traceId = getTraceId();
  // Use $db, $http, $file, $next, $schedule as needed
  const row = await $db.string.get({ key: 'config' }); // row is the string value
  const res = await $http.request({ url: 'https://api.example.com', method: 'GET', headers: {}, body: {}, query: {} }); // res === { headers, body, status }
  const nextResult = await $next.run({ functionName: 'otherFn', payload: { id: 1 }, delay: 0 }); // nextResult is the API response body
};
```

**Code generation:** Use this single file as the only input; it contains all SDK function names, signatures, and param details needed to generate correct calls to `$db`, `$http`, `$file`, `$next`, `$schedule`, and `getTraceId`.
