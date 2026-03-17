# Appnest SDK Functions — Developer Reference

This document is the **single source of truth** for the Appnest custom SDK functions. Use it for **code generation**, auto-completion, and integration in your app.

**For code generation:** This file is self-contained. All function signatures, parameters, types, and constraints are below; no other MD files are required to generate code that calls these SDK functions.

**Do not add `@aravinthan_p/appnest-app-sdk-utils` (or `appnest-app-sdk-utils`) to `app-backend/package.json`.** The SDK is provided by the AppNest platform at runtime. Your backend code should `require('@aravinthan_p/appnest-app-sdk-utils')` (or the package name configured by the platform) without listing it as a dependency.

---

## Import

```javascript
const AppnestFunctions = require('@aravinthan_p/appnest-app-sdk-utils');
// or the package name configured by the platform (e.g. appnest-app-sdk-utils)

const { $db, $file, $http, $next, $schedule, getTraceId } = AppnestFunctions;
const { ResultData } = require('@aravinthan_p/appnest-app-sdk-utils');  // for HTTP-style responses
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

---

## Code reference — function signatures & param details

All functions return `Promise<{ data, status }>` unless noted.

---

### $db

**Common param for all $db methods:** `key` (string, required, non-empty, max 1000 chars).

| Function | Params | Types / constraints |
|----------|--------|----------------------|
| `$db.get({ key })` | key | string |
| `$db.create({ key })` | key | string |
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
| `$db.number.increment({ key })` | key | string |
| `$db.number.decrement({ key })` | key | string |
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
| `$http.request({ url, query, method, headers, body })` | url, query, method, headers, body | **url** (string, required): must start with `http://` or `https://`, max 2048 chars. **method** (string, required): `GET` \| `POST` \| `PUT` \| `DELETE` \| `PATCH`. **headers** (object, required): string key/value, max 1000 keys, each value max 1000 chars. **body** (object, required): same. **query** (object, required): same. **Runtime replacement:** Use `<%=iparams.<key>%>` for manifest params; use `<%=access_token%>` in headers for platform token (AppNest framework replaces at runtime). |

---

### $file

**Common params:** `path` (string, required), `visibility` (string, optional, default `"PUBLIC"`: `"PUBLIC"` \| `"PRIVATE"`).

| Function | Params | Notes |
|----------|--------|--------|
| `$file.getUploadUrl({ path, visibility })` | path, visibility | Signed URL for upload. |
| `$file.getDownloadUrl({ path, visibility })` | path, visibility | Signed URL for download/read. |
| `$file.delete({ path, visibility })` | path, visibility | Delete file at path. |
| `$file.list({ path, visibility })` | path, visibility | List objects under path. |
| `$file.exists({ path, visibility })` | path, visibility | Check if file exists. |

---

### $next

| Function | Params | Types / constraints |
|----------|--------|----------------------|
| `$next.run({ functionName, payload, delay })` | functionName, payload, delay | **functionName** (string, required). **payload** (object, required). **delay** (number, optional, default 0): seconds before execution, >= 0. |

---

### $schedule

**Common for create/update:** `name` (string, required, max 30), `type` (string, required: `ONE_TIME` \| `CRON` \| `RECURRING`), `data` (object, required, at least one key).

| Function | Params | Types / constraints |
|----------|--------|----------------------|
| `$schedule.create({ name, type, data, runAt? \| cronExpression? \| repeat? })` | name, type, data + type-specific | **ONE_TIME:** `runAt` (string, required, valid date e.g. ISO 8601). **CRON:** `cronExpression` (string, required). **RECURRING:** `repeat: { frequency, timeUnit }` — frequency (integer >= 1; >= 10 if timeUnit is MINUTES), timeUnit: `MINUTES` \| `HOURS` \| `DAYS` \| `WEEKS` \| `MONTHS` \| `YEARS`. |
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

Use the SDK inside any function you export from `app-backend/server.js`. Handlers receive **`{ payload }`**:

```javascript
const AppnestFunctions = require('@aravinthan_p/appnest-app-sdk-utils');
const { ResultData } = require('@aravinthan_p/appnest-app-sdk-utils');
const { $db, $http, $file, $next, $schedule, getTraceId } = AppnestFunctions;

const myApiHandler = async ({ payload }) => {
  const traceId = getTraceId();
  const row = await $db.string.get({ key: 'config' });
  await $http.request({ url: 'https://api.example.com', method: 'GET', headers: {}, body: {}, query: {} });
  await $next.run({ functionName: 'otherFn', payload: { id: 1 }, delay: 0 });
  return new ResultData({ body: { row }, statusCode: 200 });
};

module.exports = { myApiHandler };
```

**Code generation:** This file is self-contained; use it as the single source for SDK function names, signatures, and param details.
