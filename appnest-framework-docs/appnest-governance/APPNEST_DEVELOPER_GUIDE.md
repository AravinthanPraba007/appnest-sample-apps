# Sample Appnest App

A **frontend** and **backend** app built on the **Appnest custom framework**. You implement business logic and UI; the framework handles routing, HTTP, React setup, and bundling.

- **Backend entry:** **`app-backend/server.js`** — only the functions exported from this file can be invoked (by API or events). Register them in `manifest.json` under `backend_api_functions` and `event_listener_functions`. Use Appnest SDK (`$db`, `$http`, etc.) for DB and API calls.
- **Frontend entry:** The frontend is a **React** app; **`app-frontend/src/App.jsx`** is the root component loaded by the framework. Build your UI there (or in components it imports) and call the backend with `window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })`. The invoke returns an object of the form **`{ statusCode, body }`**: `statusCode` is the HTTP-style status (e.g. `200`, `400`, `401`); `body` is the backend function’s return value. When the backend uses **`ResultData({ body, statusCode })`**, that `statusCode` and `body` are used; otherwise the framework assigns a default `statusCode` (e.g. `200`) and the returned plain object is exposed as `body`.
- **Frontend UI:** Use **`@sparrowengg/twigs-react`** for React UI components and **`@sparrowengg/twigs-react-icons`** for SVG icons. Twigs is SurveySparrow’s themeable, customisable, and fully accessible React component library. Add both to `app-frontend/package.json` before building UI with version **`"*"`** (latest)—do not pin to versions like `^2.0.0` that may not exist (see [07-Twigs-UI-Reference.md](04-frontend/07-Twigs-UI-Reference.md)). Use **only** Twigs for all UI on every screen; no raw HTML for controls (`<button>`, `<input>`, `<select>`, `<table>`)—use Twigs components only. Use **Stack** and **Box** for layout; avoid one-off CSS. Prefer Twigs design tokens over hardcoded hex. Do not use custom .btn/.alert classes when Twigs provides equivalents. See [09-Code-Review-and-AI-Generation-Checklist](03-integration-standards/09-Code-Review-and-AI-Generation-Checklist.md) and [07-Twigs-UI-Reference.md](04-frontend/07-Twigs-UI-Reference.md).
- **UI look and feel:** The app is **viewed inside a SaaS product** and must deliver a **polished, “wow” experience**—clean, consistent, professional, with clear navigation, readable typography, coherent spacing, and predictable interactions. Use **responsive** layout (Twigs responsive props/patterns) so it works on desktop, tablet, and mobile and feels native to the host product.

---

## Full documentation

All detailed docs are in this directory (**appnest-governance**):

| Topic | Document |
|-------|----------|
| **Frontend rules (read first when generating UI)** | [frontend-rules.md](04-frontend/frontend-rules.md) — enforced for AI |
| **Entry points, backend & frontend how-to, project structure** | [01-architecture/03-Entry-Points-and-Implementation.md](01-architecture/03-Entry-Points-and-Implementation.md) |
| **SDK usage rules** | [02-sdk/04-AppNest-SDK-Usage-Rules.md](02-sdk/04-AppNest-SDK-Usage-Rules.md) |
| **SDK reference** ($db, $http, $file, $next, $schedule) | [02-sdk/Backend-Appnest-SDK-Reference.md](02-sdk/Backend-Appnest-SDK-Reference.md) |
| **Manifest rules & schema** (code-generation) | [02-sdk/06-Manifest-Rules.md](02-sdk/06-Manifest-Rules.md) |
| **Twigs UI reference** (use instead of raw HTML) | [04-frontend/07-Twigs-UI-Reference.md](04-frontend/07-Twigs-UI-Reference.md) |
| **Architecture & flow classification** | [01-architecture/](01-architecture/) |
| **Integration standards & checklist** | [03-integration-standards/](03-integration-standards/) |

**Index:** [README.md](../README.md) | [AppnestTools.md](../AppnestTools.md)
