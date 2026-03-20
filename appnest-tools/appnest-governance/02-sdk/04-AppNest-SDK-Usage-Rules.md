# Appnest SDK Usage Rules

All external operations must use Appnest SDK primitives.

**Package dependency:** Do not add `@aravinthan_p/appnest-app-sdk-utils` to `app-backend/package.json`. The SDK is provided by the platform at runtime.

## Rules summary (MUST / MUST NOT)

| Rule | Constraint |
|------|------------|
| **$http** | MUST use `$http` for all outbound HTTP. MUST NOT use axios, fetch, or any other HTTP client. |
| **$db** | MUST use `$db` for persistent state. MUST NOT use in-memory storage for cross-invocation state. |
| **$schedule** | MUST use `$schedule` for long-running or chained execution. MUST NOT use direct recursion without scheduling. |
| **$file** | MUST use `$file` for file uploads and processing. MUST validate files before processing. |
| **ResultData** | SHOULD return `ResultData` for explicit status/body (e.g. errors). MUST NOT throw raw errors without a structured return. |

## 1. $http

All external HTTP calls MUST use $http.

Direct use of axios/fetch is prohibited.

## 2. $db

All persistent state MUST use $db.

In-memory storage is not allowed for cross-invocation state.

## 3. $schedule

Long-running or chained execution MUST use $schedule.

Direct recursion without scheduling is not allowed.

## 4. $file

File uploads and processing MUST use $file.

Files must be validated before processing.

## 5. ResultData

Handlers should return **ResultData** for explicit status and body control (e.g. non-200, error payloads). Plain objects are acceptable for simple success responses. Throwing raw errors without a structured return is prohibited.

---

## Don't — forbidden patterns

**Do not use direct HTTP libraries.** Use `$http.request()` instead.

```javascript
// DON'T
const axios = require('axios');
const res = await axios.get('https://api.example.com');

// DO
const { $http } = require('@aravinthan_p/appnest-app-sdk-utils');
const { data, status } = await $http.request({ url: 'https://api.example.com', method: 'GET', headers: {}, body: {}, query: {} });
```

**Do not use in-memory or raw DB for cross-invocation state.** Use `$db` instead.

```javascript
// DON'T
const cache = {};
function getConfig() { return cache.config; }

// DO
const { $db } = require('@aravinthan_p/appnest-app-sdk-utils');
const { data } = await $db.string.get({ key: 'config' });
```