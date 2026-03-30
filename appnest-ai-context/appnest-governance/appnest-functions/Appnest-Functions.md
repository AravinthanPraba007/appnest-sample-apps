# Appnest Functions — Overview

Appnest separates “functions” into two layers: **backend helpers** used inside server handlers and a **frontend API** used to invoke those handlers by name.

## Backend AppnestFunctions
Use the **two-step** import: the package exports `AppnestFunctions` (and `ResultData`); destructure helpers from that object. Do **not** do `const { $db } = require('@sparrowengg/appnest-app-sdk-utils')` — that is incorrect.

```js
const { AppnestFunctions } = require('@sparrowengg/appnest-app-sdk-utils');
const { $db, $fetch, $file, $next, $schedule, getTraceId } = AppnestFunctions;
```

Available helpers (destructure only what you need):

- **`$db`** — typed key/value storage  
- **`$fetch`** — outbound HTTP requests  
- **`$file`** — signed upload/download and object operations  
- **`$next`** — invoke another backend function  
- **`$schedule`** — one-time, cron, or recurring jobs  
- **`getTraceId`** — request correlation  

The platform provides this package at runtime for backend code. Use it for storage, HTTP calls, file handling, chaining backend functions, and scheduling jobs.

## Frontend AppnestFunctions
From **`window.AppnestFunctions`**, take **`$appBackend`** and **`await`** **`invoke`**:

```js
const { $appBackend } = window.AppnestFunctions;

const data = await $appBackend.invoke({
  apiFunctionName: 'myBackendHandler',
  payload: { userId: 123 },
});
```

This can be used in the browser or app client. It triggers the platform’s backend invocation flow and returns the **parsed JSON response body** (not a `{ data, status }` wrapper). Use it whenever the UI needs to call a named server function.

For detailed information about function signatures, parameters, return shapes, and code-generation details, refer to:

- **[Backend-Appnest-Functions.md](Backend-Appnest-Functions.md)** — Backend `AppnestFunctions` API reference  
- **[Frontend-Appnest-Functions.md](Frontend-Appnest-Functions.md)** — Frontend `window.AppnestFunctions` reference