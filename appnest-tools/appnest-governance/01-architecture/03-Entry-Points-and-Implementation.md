# Entry Points and Implementation

Fixed entry points and how to implement backend and frontend for Appnest apps.

## Overview

| Layer | Your focus | Handled by Appnest |
|-------|------------|--------------------|
| **Backend** | Export functions in server.js; use Appnest functions for DB/API | Routing, HTTP server (e.g. Express), controllers, request/response handling |
| **Frontend** | Build components and UI | React setup, bundling, build pipeline, hosting |

## Entry points (fixed)

- **Frontend:** **`app-frontend/src/App.jsx`** is always the frontend entry point. The framework loads and renders this component; build your UI there or by importing components from it.
- **Backend:** **`app-backend/server.js`** is the single backend entry. Only the functions you **export** from this file can be invoked—by API (via `backend_api_functions` in the manifest) or by platform events (via `event_listener_functions`). Any other backend code must be required by `server.js` and re-exported if it should be callable.

---

## Backend

### You don’t need to

- Configure or edit Express (or any HTTP framework) core
- Define routes or controllers
- Wire request/response objects manually

### What you do

1. **Implement functions** (in any files you like, e.g. `sampleHandler.js`, `eventHandler.js`).
2. **Export them from `server.js`**. Those exports are what the framework uses as **endpoints** and **event handlers**.
3. **Use Appnest-provided utilities** for all external I/O (database, other APIs)—see [Backend-Appnest-SDK-Reference.md](../02-sdk/Backend-Appnest-SDK-Reference.md).

So: **only the functions you export from `app-backend/server.js` are invoked by the framework**; no other backend file is used as an entry.

### Wiring in manifest.json

- **Backend API endpoints** — Declare under `backend_api_functions`. Each key must be the name of a function exported from **`app-backend/server.js`**. Per-function options (e.g. `timeout` in seconds) go in the value object.
- **Event listeners** — Declare under `event_listener_functions`. The `handler` in each value must be the name of a function exported from **`app-backend/server.js`**. When the event occurs, the framework calls that function (e.g. with a `payload`).

Full manifest schema: [06-Manifest-Rules.md](../02-sdk/06-Manifest-Rules.md).

### app-backend package.json

- **Do not add `@aravinthan_p/appnest-app-sdk-utils` (or `appnest-app-sdk-utils`) to `app-backend/package.json` dependencies.** The AppNest SDK is provided by the platform at runtime. List only app-specific dependencies (e.g. `mssql`, other third-party libraries).

### Example backend layout

- **`app-backend/server.js`** — Re-exports all handlers and API functions. No Express or controller code here—only exports.
- **`app-backend/sampleHandler.js`** — API-style functions that receive `{ payload }`, use AppnestFunctions (e.g. `$db.string.create`) and `ResultData`, and return plain objects or `ResultData`.
- **`app-backend/eventHandler.js`** — Product event handlers that receive `{ payload }`, use AppnestFunctions for DB/API, and return plain objects or `ResultData`.

Both API and event handlers receive a **payload**; use **AppnestFunctions** for all DB and outbound API calls—do not use raw DB or HTTP clients.

### Returning HTTP-style responses

Use `ResultData` from the Appnest SDK when you need to control status and body:

```js
const { AppnestFunctions, ResultData } = require('@aravinthan_p/appnest-app-sdk-utils');

return new ResultData({
  body: { message: 'Success' },
  statusCode: 200,
});
```

---

## Frontend

The app frontend is a **React** application. The platform provides React and react-dom at runtime; the root component is **`app-frontend/src/App.jsx`**. Build UI there or in components it imports, using React and Twigs components only.

### You don’t need to

- Configure React, Vite, or the build pipeline
- Manage bundles, entry points, or deployment of the frontend
- Add **React** or **react-dom** to `app-frontend/package.json` — the platform supplies them.

### app-frontend package.json

- **Do not add `react` or `react-dom` to `app-frontend/package.json` dependencies.** They are provided by the platform. List only app-specific dependencies (e.g. `uuid`, UI libraries, etc.).

### Frontend UI component libraries

Use the following **SurveySparrow** packages for building UI in `app-frontend`:

| Package | Purpose |
|--------|---------|
| **`@sparrowengg/twigs-react`** | React UI components — themeable, customisable, and fully accessible component library. Use for buttons, inputs, selects, modals, toasts, and other UI primitives. |
| **`@sparrowengg/twigs-react-icons`** | SVG icons package built with React. Use for icons across the app. |

Add these to `app-frontend/package.json` dependencies when building UI. Use version **`"*"`** so npm installs the latest available (do not pin to a specific version like `^2.0.0` that may not exist—see [07-Twigs-UI-Reference.md](../04-frontend/07-Twigs-UI-Reference.md#package-versions-in-app-frontendpackagejson)). Twigs is the recommended frontend component library for Appnest apps; it is themeable, customisable, and fully accessible.

**Enforcement (required for all Appnest app frontends):**
- Add **`@sparrowengg/twigs-react`** and **`@sparrowengg/twigs-react-icons`** to `app-frontend/package.json` before implementing any UI, with version **`"*"`** (latest). Do not skip this step or assume the packages are private—they are required dependencies. Do not use fixed versions (e.g. `^2.0.0`) that may not exist on the registry.
- Use **only** Twigs components for buttons, inputs, selects, tables, modals, toasts, and icons. **Do not** use raw HTML (`<button>`, `<input>`, `<select>`, `<table>`) or custom-styled divs for UI primitives.
- **Don't:** `<button>Click</button>`, `<input type="text" />`, `<select>`, custom CSS-only tables. **Do:** `import { Button, Input, Select } from '@sparrowengg/twigs-react';` and Twigs icons from `@sparrowengg/twigs-react-icons`. For which Twigs component to use instead of each raw HTML element, see [07-Twigs-UI-Reference.md](../04-frontend/07-Twigs-UI-Reference.md).
- **Responsive:** Use responsive Twigs layout so the app works on desktop, tablet, and mobile; avoid fixed widths that break on small screens.
- **SaaS “wow”:** The app is viewed inside a SaaS product—deliver a polished, professional look and feel so it feels native to the host. Before marking frontend work complete, run the "Frontend UI (Twigs)" checks in the [Code Review and AI Generation Checklist](../03-integration-standards/09-Code-Review-and-AI-Generation-Checklist.md).

### What you do

- **Use `app-frontend/src/App.jsx` as the entry component**—the framework always loads this file as the root. Build your UI there or by importing components (e.g. from `src/components/`).
- **Call backend functions** via `window.appnestClientFunctions.appBackend.invoke()`. Only functions exported from `app-backend/server.js` can be invoked.
- Use **`getClient()`** from `src/utils/client.js` when you need the classic Appnest client (e.g. `window.app.initialized()`).

Entry URL is set in `manifest.json` → `frontend_locations.full_page_app.url`.

### Calling backend from the frontend

The framework exposes **`window.appnestClientFunctions.appBackend.invoke()`**. The response shape is **`{ statusCode, body }`**: `statusCode` is the HTTP-style status (e.g. `200`, `400`, `401`); `body` is the value your handler returned (e.g. the `body` from `ResultData` or a plain object).

```javascript
const response = await window.appnestClientFunctions.appBackend.invoke({
  apiFunctionName: 'function1',   // must match an export in app-backend/server.js and a key in manifest.backend_api_functions
  payload: {
    name: 'John Doe',
  },
});

// response = { statusCode, body }
if (response.statusCode >= 200 && response.statusCode < 300) {
  console.log(response.body);   // e.g. { message, success } if your handler returns that
} else {
  console.error(response.statusCode, response.body);
}
```

- **`apiFunctionName`** — Name of a function exported from **`app-backend/server.js`** (and declared in `manifest.json` → `backend_api_functions`).
- **`payload`** — Object passed to your backend handler as `{ payload }`.
- **Response** — Always **`{ statusCode, body }`**. `body` is whatever your handler returned (e.g. from `ResultData` or a plain object).

Example in a React component:

```jsx
const makeBackendCall = async () => {
  try {
    const response = await window.appnestClientFunctions.appBackend.invoke({
      apiFunctionName: 'function1',
      payload: { name: 'John Doe' },
    });
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(response.body);
    } else {
      console.error(response.statusCode, response.body);
    }
  } catch (error) {
    console.error(error);
  }
};

<button onClick={makeBackendCall}>Make Backend Call</button>
```

### App surfaces in this repo

- **`app-frontend`** — main app UI (full-page app).
- **`app-installation-frontend`** — installation/setup UI (used when `custom_installation_frontend` is `true` in the manifest).

Both use the same pattern: implement components and call the backend via `window.appnestClientFunctions.appBackend.invoke()` or `getClient()` when needed.

---

## Project structure

```text
sample-appnest-app/
├── manifest.json                 # backend_api_functions, event_listener_functions, frontend_locations, etc.
├── app-backend/
│   ├── server.js                 # BACKEND ENTRY: only exported functions can be invoked (API + events)
│   ├── sampleHandler.js         # API functions (use AppnestFunctions for $db, $http, etc.)
│   └── eventHandler.js           # Product event handlers (use AppnestFunctions for DB/API)
├── app-frontend/                 # Main app UI
│   └── src/
│       ├── App.jsx               # FRONTEND ENTRY: always the root component loaded by the framework
│       ├── components/
│       ├── utils/client.js       # getClient() for Appnest client
│       └── css/
└── app-installation-frontend/    # Optional installation UI
    └── src/
        ├── App.jsx
        ├── components/
        ├── utils/client.js
        └── css/
```
