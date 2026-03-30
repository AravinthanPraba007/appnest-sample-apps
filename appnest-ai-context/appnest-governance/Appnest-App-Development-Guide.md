# Appnest app development guide

Single guide for your **app project** (the folder where you run `appnest-development-engine`): what you own, fixed entry points, **`manifest.json`** wiring, backend and frontend implementation, and local workflow.

For a quick engine summary see **[Appnest-Development-Engine.md](appnest-development-engine/Appnest-Development-Engine.md)**; for CLI actions see **[Appnest-Development-Engine-Commands.md](appnest-development-engine/Appnest-Development-Engine-Commands.md)**.

---

## What Appnest handles vs what you build

| Layer | Your focus | Handled by Appnest |
|-------|------------|--------------------|
| **Backend** | Export functions in `server.js`; use Appnest SDK for DB/API | Routing, HTTP server (e.g. Express), controllers, request/response handling |
| **Frontend** | Build components and UI | React setup, bundling, build pipeline, hosting |

---

## App structure (what you own)

| Folder / file | Required? | Role |
|---------------|-----------|------|
| **`app-backend/`** | Yes | Server logic: `server.js` is loaded by the engine; expose handlers the platform can call. |
| **`app-frontend/`** | Yes | Main UI (e.g. Vite + React). Built and served under `/app-frontend`. |
| **`app-install-frontend/`** | Optional | Installation / onboarding UI, served under `/app-install-frontend` when present. |
| **`manifest.json`** | Yes for packaging | Declares your app for the platform (e.g. backend functions, frontend locations, metadata). Validated by **`validate`**. |
| **`.env`** | Recommended | Local config (ports, `CLIENT_SCRIPT_URL`, etc.). Read by the proxy; can be included in **`pack`**. |

You do **not** edit `appnest-*` engine packages in normal app work—only your **`app-*`** trees and root config files.

---

## Backend (`app-backend`)

### You don’t need to

- Configure or edit Express (or any HTTP framework) core  
- Define routes or controllers  
- Wire request/response objects manually  

### Responsibilities and what you get

**You are responsible for**

- Implementing **`server.js`** as the single entry the engine invokes for backend calls.  
- Exporting the functions your **`manifest.json`** references (names must match).  
- Business logic, data access, and integration with the Appnest SDK / APIs as documented for your product.  

**You get**

- A Node runtime wired through the engine’s backend layer (no separate public HTTP server required for local dev).  
- Requests routed from the proxy as **`/app-backend/...`**; the engine adapts them to your handlers.  

### Implementation

1. **Implement functions** in any files you like (e.g. `sampleHandler.js`, `eventHandler.js`).  
2. **Export them from `app-backend/server.js`**. Those exports are what the framework uses as **API endpoints** and **event handlers**. Any other backend code must be required by `server.js` and re-exported if it should be callable.  
3. **Use Appnest-provided utilities** for all external I/O (database, other APIs)—see **[Backend-Appnest-Functions.md](appnest-functions/Backend-Appnest-Functions.md)**.  

**Only functions exported from `app-backend/server.js` are invoked**; no other backend file is used as an entry.

### Wiring in `manifest.json`

- **Backend API endpoints** — Declare under **`backend_api_functions`**. Each key must be the name of a function exported from **`app-backend/server.js`**. Per-function options (e.g. `timeout` in seconds) go in the value object.  
- **Event listeners** — Declare under **`event_listener_functions`**. The `handler` in each value must be the name of a function exported from **`app-backend/server.js`**. When the event occurs, the framework calls that function (e.g. with a `payload`).  

Full schema: **[Manifest-Rules.md](app-configuration/Manifest-Rules.md)**.

### `app-backend/package.json`

- **Do not add `@sparrowengg/appnest-app-sdk-utils` (or `appnest-app-sdk-utils`) to `app-backend/package.json` dependencies.** The Appnest SDK is provided by the platform at runtime. List only app-specific dependencies (e.g. `mssql`, other third-party libraries).  

### Rules

- **CommonJS only** in `app-backend`: use `require` / `module.exports` — **no** `import` / `export` / `import()` (enforced by **`validate`**).  
- Keep exports aligned with **`manifest.json`** so **`validate`** does not report missing functions.  
- API and event handlers receive a **`payload`**; use **AppnestFunctions** for all DB and outbound API calls—**do not** use raw DB or HTTP clients.  

### Example backend layout

- **`app-backend/server.js`** — Re-exports all handlers and API functions. No Express or controller code here—only exports.  
- **`app-backend/sampleHandler.js`** — API-style functions that receive `{ payload }`, use AppnestFunctions (e.g. `$db`, `$fetch`) and `ResultData`, and return plain objects or `ResultData`.  
- **`app-backend/eventHandler.js`** — Product event handlers that receive `{ payload }`, use AppnestFunctions for DB/API, and return plain objects or `ResultData`.  

### Returning HTTP-style responses

Use **`ResultData`** from the Appnest SDK when you need to control status and body:

```js
const { AppnestFunctions, ResultData } = require('@sparrowengg/appnest-app-sdk-utils');

return new ResultData({
  body: { message: 'Success' },
  statusCode: 200,
});
```

---

## Frontend (`app-frontend` / optional `app-install-frontend`)

### You don’t need to

- Configure React, Vite, or the build pipeline  
- Manage bundles, entry points, or deployment of the frontend  
- Add **React** or **react-dom** to **`app-frontend/package.json`** — the platform supplies them  

### `app-frontend/package.json`

- **Do not add `react` or `react-dom` to `app-frontend/package.json` dependencies.** List only app-specific dependencies (e.g. `uuid`, Twigs packages).  

### UI (Twigs)

Use **SurveySparrow** packages for UI in `app-frontend`:

| Package | Purpose |
|---------|---------|
| **`@sparrowengg/twigs-react`** | React UI components (buttons, inputs, selects, modals, toasts, layout, etc.). |
| **`@sparrowengg/twigs-react-icons`** | SVG icons. |

Add both with version **`"*"`** (latest)—do not pin to versions that may not exist (e.g. `^2.0.0`). Full enforcement, responsive layout, and SaaS look-and-feel: **[App-Frontend-Rules.md](App-Frontend-Rules.md)** and **[Twigs-UI-Reference.md](Twigs-UI-Reference.md)**. Before ship, use the **Frontend UI (Twigs)** section of **[Code-Review-and-AI-Generation-Checklist.md](Code-Review-and-AI-Generation-Checklist.md)**.

### Responsibilities and what you get

**You are responsible for**

- UI, routing, state, and calling the backend.  
- Building a standard SPA layout; static output goes to **`dist`** for production / **`pack`**.  

**You get**

- Vite dev server + HMR for day-to-day editing.  
- Base path under **`/app-frontend`** (and **`/app-install-frontend`** for the optional install UI) so links and assets work behind the proxy.  

### Entry and calling the backend

- **`app-frontend/src/App.jsx`** is always the root component; build UI there or in components it imports.  
- Call the backend with **`window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })`**. Only functions exported from **`app-backend/server.js`** can be invoked.  
- **`invoke`** returns **`{ statusCode, body }`**: when the backend uses **`ResultData({ body, statusCode })`**, those values are used; otherwise the framework may assign a default `statusCode` (e.g. `200`) and expose the returned object as `body`.  
- Use **`getClient()`** from **`src/utils/client.js`** when you need the classic Appnest client (e.g. `window.app.initialized()`).  
- Entry URL for the full-page app is set in **`manifest.json`** → **`frontend_locations.full_page_app.url`**.  

### Calling backend from the frontend

```javascript
const response = await window.appnestClientFunctions.appBackend.invoke({
  apiFunctionName: 'function1',   // export name in app-backend/server.js + key in manifest.backend_api_functions
  payload: { name: 'John Doe' },
});

if (response.statusCode >= 200 && response.statusCode < 300) {
  console.log(response.body);
} else {
  console.error(response.statusCode, response.body);
}
```

- **`apiFunctionName`** — Must match an export from **`app-backend/server.js`** and **`manifest.json`** → **`backend_api_functions`**.  
- **`payload`** — Passed to your handler as **`{ payload }`**.  

Example in a React component (use **Twigs** for controls—not raw `<button>`):

```jsx
import { Button } from '@sparrowengg/twigs-react';

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

return <Button onClick={makeBackendCall}>Make backend call</Button>;
```

### App surfaces

- **`app-frontend`** — Main full-page app UI.  
- **`app-install-frontend`** — Optional installation/setup UI (omit the folder if you don’t need it; use **`manifest.json`** when your product enables a custom installation UI—see **[Manifest-Rules.md](app-configuration/Manifest-Rules.md)**).  

Both follow the same pattern: components + **`invoke`** or **`getClient()`** as needed.

### Frontend rules (engine / tooling)

- Prefer the engine’s expected layout (e.g. **`app-frontend/dist`** after build).  
- ESLint during **`validate`** treats **PascalCase** imports as likely JSX components (fewer false “unused” warnings for `<Component />`).  

---

## Example project structure

```text
your-app/
├── manifest.json                 # backend_api_functions, event_listener_functions, frontend_locations, etc.
├── app-backend/
│   ├── server.js                 # BACKEND ENTRY: only exported functions can be invoked (API + events)
│   ├── sampleHandler.js          # API handlers (AppnestFunctions, ResultData)
│   └── eventHandler.js           # Event handlers
├── app-frontend/
│   └── src/
│       ├── App.jsx               # FRONTEND ENTRY: root component
│       ├── components/
│       ├── utils/client.js       # getClient()
│       └── css/
└── app-install-frontend/         # Optional
    └── src/
        ├── App.jsx
        ├── components/
        ├── utils/client.js
        └── css/
```

---

## Cross-cutting practices

- **Try/catch** — Only a **parameterless** `catch { }` is allowed when the exception value is unused (no unused `catch (e)`). If you need the error, bind it and use it (log, rethrow, branch).  
- **Run from the app root** — Commands use `process.cwd()` as your project root (`ORIGINAL_CWD` for child processes).  
- **`appnest-development-engine app validate`** — Run before commits or CI: backend + frontend lint + **`manifest.json`** checks.  
- **`appnest-development-engine app pack`** — Bundles default folders (`app-frontend`, `app-backend`, `app-install-frontend`), **`manifest.json`**, **`.env`**, plus optional **`PACK_FOLDER_PATHS`** / **`PACK_FILE_PATHS`** from `.env`.  
- **Secrets** — Treat **`.env`** as sensitive; only pack or share it when your deployment model requires it.  

---

## Quick command reminders

```bash
appnest-development-engine app init       # scaffold (empty folder rules apply)
appnest-development-engine app start      # proxy + backend + frontends
appnest-development-engine app validate   # lint + manifest
appnest-development-engine app pack       # build + zip for distribution
```

---

## Further reading

- **Recommended reading order:** [Documentation-Order.md](Documentation-Order.md)  
- **Full document index:** [README.md](README.md)  
- **Tools hub (repo root):** [AppnestTools.md](../AppnestTools.md)  
- **Deep reference:** [Manifest-Rules.md](app-configuration/Manifest-Rules.md), [Backend-Appnest-Functions.md](appnest-functions/Backend-Appnest-Functions.md), [App-Frontend-Rules.md](App-Frontend-Rules.md), [Twigs-UI-Reference.md](Twigs-UI-Reference.md)  
