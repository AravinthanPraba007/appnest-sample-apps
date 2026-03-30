# Backend Appnest Functions — Developer Reference

This document is the **single source of truth** for the Appnest custom SDK functions. Use it for **code generation**, auto-completion, and integration in your app.

**For AI code generation:** (1) This file is self-contained; all function signatures, parameters, return shapes, and constraints are below. (2) **Import pattern:** The package exports `AppnestFunctions` and `ResultData` only. Always use: `const { AppnestFunctions } = require('@sparrowengg/appnest-app-sdk-utils'); const { $db, $fetch, $file, $next, $schedule, getTraceId } = AppnestFunctions;` (destructure only the modules you need). Do not use `const { $db } = require('@sparrowengg/appnest-app-sdk-utils')` — that is incorrect.

**Do not add `@sparrowengg/appnest-app-sdk-utils` (or `appnest-app-sdk-utils`) to `app-backend/package.json`.** The SDK is provided by the AppNest platform at runtime. Your backend code should `require('@sparrowengg/appnest-app-sdk-utils')` (or the package name configured by the platform) without listing it as a dependency.

---

## Import

```javascript
const { AppnestFunctions } = require('@sparrowengg/appnest-app-sdk-utils');
// or from path:
// const { AppnestFunctions } = require('<path-to-sdk>/appnestFunctions');

const { $db, $file, $fetch, $next, $schedule, getTraceId } = AppnestFunctions;
```

---

## Quick reference

| Module      | Purpose                    | Main APIs / Methods |
|------------|----------------------------|----------------------|
| **$db**    | Key/value storage          | `get`, `set`, `delete`; typed: `string` / `number` (get/set/delete + number increment/decrement), `list` (get/set/append/prepend/updateItemAtIndex/removeItemAtIndex), `map` (get/set/delete), `boolean` (get/set/delete) |
| **$fetch** | Outbound HTTP requests     | `request({ url, method, headers, body, options? })` |
| **$file**  | File storage (signed URLs) | `getUploadUrl`, `getDownloadUrl`, `delete`, `list`, `exists` |
| **$next**  | Invoke another function    | `run({ functionName, payload, delay })` |
| **$schedule** | Scheduled jobs          | `create`, `get`, `update`, `pause`, `resume`, `delete` |
| **getTraceId** | Request trace ID       | `getTraceId()` → string (for logging/correlation) |

---

## Module summary

Brief overview of each module.

| Module      | Summary |
|-------------|--------|
| **$db**     | Key/value by type: STRING, NUMBER, LIST, MAP, BOOLEAN. Common param: `key` (string). |
| **$fetch**  | `$fetch.request({ url, method, headers, body, options? })`. **options:** `isOauth` (boolean, default false), `maxAttempts` (number, default 0). Methods: GET, POST, PUT, DELETE, PATCH. Use `<%=installation_parameters.<key>%>` for manifest params; use `<%=user_oauth.access_token%>` in headers for platform access_token; framework replaces at runtime. |
| **$file**   | `getUploadUrl`, `getDownloadUrl`, `delete`, `list`, `exists`. Params: `path`, `visibility` (optional). |
| **$next**   | `$next.run({ functionName, payload, delay })`. Delay in seconds. |
| **$schedule** | Job kinds: ONE_TIME, CRON, RECURRING. `jobName`, `jobType`, `jobPayload`, `jobConfig` (create/update); `jobConfig` holds `runAt` / `cronExpression` / `repeat` by type. |

---

## Code reference — function signatures & param details

**Return shapes (summary):**  
- **$db:** Get methods return the value directly (string, number, array, object, boolean). Create/update/delete return nothing (`Promise<void>`).  
- **$fetch:** `request` returns `Promise<{ headers, body, status }>`.  
- **$file:** All methods return the response object directly (e.g. `{ preSignedUrl }`, `{ deleted }`, `{ objects }`, `{ exists }`). No `{ data, status }` wrapper.  
- **$next:** `run` returns the API response body directly (e.g. `Promise<{ success: boolean }>`).  
- **$schedule:** All methods return nothing (`Promise<void>`).

---

### $db

**Common param for all $db methods:** `key` (string, required, non-empty, max 1000 chars).

| Function | Params | Types / constraints |
|----------|--------|----------------------|
| `$db.get({ key })` | key | string |
| `$db.set({ key, value })` | key, value | key: string; value: string (writes string at key; same backend op as `$db.string.update`) |
| `$db.delete({ key })` | key | string |
| `$db.string.get({ key })` | key | string |
| `$db.string.set({ key, value })` | key, value | key: string; value: string |
| `$db.string.delete({ key })` | key | string |
| `$db.number.get({ key })` | key | string |
| `$db.number.set({ key, value })` | key, value | key: string; value: number |
| `$db.number.delete({ key })` | key | string |
| `$db.number.increment({ key, value })` | key, value | key: string; value: number (optional, for increment amount) |
| `$db.number.decrement({ key, value })` | key, value | key: string; value: number (optional, for decrement amount) |
| `$db.list.get({ key })` | key | string |
| `$db.list.set({ key, value })` | key, value | key: string; value: array |
| `$db.list.append({ key, value })` | key, value | string, array |
| `$db.list.prepend({ key, value })` | key, value | string, array |
| `$db.list.updateItemAtIndex({ key, value, index })` | key, value, index | string, array, number |
| `$db.list.removeItemAtIndex({ key, index })` | key, index | string, number |
| `$db.map.get({ key })` | key | string |
| `$db.map.set({ key, value })` | key, value | key: string; value: object (JSON-serializable) |
| `$db.map.delete({ key })` | key | string |
| `$db.boolean.get({ key })` | key | string |
| `$db.boolean.set({ key, value })` | key, value | key: string; value: boolean |
| `$db.boolean.delete({ key })` | key | string |

---

### $fetch

| Function | Params | Types / constraints |
|----------|--------|----------------------|
| `$fetch.request({ url, method, headers, body, options? })` | url, method, headers, body, options | **url** (string, required). **method** (string, required): `GET` \| `POST` \| `PUT` \| `DELETE` \| `PATCH`. **headers** / **body** (object, optional, default `{}`). **options** (object, optional): **isOauth** (boolean, default false), **maxAttempts** (number, default 0). **Return:** `Promise<{ headers, body, status }>`. **Runtime replacement:** Use `<%=installation_parameters.<key>%>` and `<%=user_oauth.access_token%>` in headers. See [fetch.md](fetchFunction/fetch.md). |

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

**Common for create/update:** `jobName` (string, required, max 30), `jobType` (string, required: `ONE_TIME` \| `CRON` \| `RECURRING`), `jobPayload` (object, required, at least one key), `jobConfig` (object, required: type-specific fields only). All schedule methods return `Promise<void>`. (The HTTP layer still sends `name`, `type`, `data`, and top-level `runAt` / `cronExpression` / `repeat`; the SDK maps from `jobName`, `jobType`, `jobPayload`, and expands `jobConfig`. For `RECURRING`, `repeat` is sent as `{ every, unit }`.)

| Function | Params | Types / constraints |
|----------|--------|----------------------|
| `$schedule.create({ jobName, jobType, jobPayload, jobConfig })` | jobName, jobType, jobPayload, jobConfig | **jobConfig for ONE_TIME:** `{ runAt }` (string, required). **CRON:** `{ cronExpression }` (string, required). **RECURRING:** `{ repeat: { frequency, timeUnit } }` — frequency (integer >= 1; >= 10 if timeUnit is MINUTES), timeUnit: `MINUTES` \| `HOURS` \| `DAYS` \| `WEEKS` \| `MONTHS` \| `YEARS`. |
| `$schedule.get({ jobName, jobType })` | jobName, jobType | jobName: string; jobType: ONE_TIME \| CRON \| RECURRING |
| `$schedule.update({ jobName, jobType, jobPayload, jobConfig })` | same as create | Same `jobConfig` rules as create. |
| `$schedule.pause({ jobName, jobType })` | jobName, jobType | string, string |
| `$schedule.resume({ jobName, jobType })` | jobName, jobType | string, string |
| `$schedule.delete({ jobName, jobType })` | jobName, jobType | string, string |

---

### getTraceId

| Function | Params | Return |
|----------|--------|--------|
| `getTraceId()` | none | string (trace ID for logging/correlation) |

---

## Usage in handlers

Typical pattern inside a Lambda or handler:

```javascript
const { AppnestFunctions } = require('@sparrowengg/appnest-app-sdk-utils');
const { $db, $fetch, $file, $next, $schedule, getTraceId } = AppnestFunctions;

exports.myHandler = async (event, context) => {
  const traceId = getTraceId();
  // Use $db, $fetch, $file, $next, $schedule as needed
  const row = await $db.string.get({ key: 'config' }); // row is the string value
  const res = await $fetch.request({ url: 'https://api.example.com', method: 'GET', headers: {}, body: {} }); // optional: options: { isOauth, maxAttempts }
  const nextResult = await $next.run({ functionName: 'otherFn', payload: { id: 1 }, delay: 0 }); // nextResult is the API response body
};
```

**Code generation:** Use this single file as the only input; it contains all SDK function names, signatures, and param details needed to generate correct calls to `$db`, `$fetch`, `$file`, `$next`, `$schedule`, and `getTraceId`.
