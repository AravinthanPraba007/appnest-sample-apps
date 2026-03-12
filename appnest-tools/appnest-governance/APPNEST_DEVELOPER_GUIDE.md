# Sample Appnest App

A **frontend** and **backend** app built on the **Appnest custom framework**. You implement business logic and UI; the framework handles routing, HTTP, React setup, and bundling.

- **Backend entry:** **`app-backend/server.js`** — only the functions exported from this file can be invoked (by API or events). Register them in `manifest.json` under `backend_api_functions` and `event_listener_functions`. Use Appnest SDK (`$db`, `$http`, etc.) for DB and API calls.
- **Frontend entry:** **`app-frontend/src/App.jsx`** — this is always the root component loaded by the framework. Build your UI there (or in components it imports) and call the backend with `window.appnestClient.backend.invoke({ functionName, payload })`. The invoke returns an object of the form **`{ statusCode, body }`**: `statusCode` is the HTTP-style status (e.g. `200`, `400`, `401`); `body` is the backend function’s return value. When the backend uses **`ResultData({ body, statusCode })`**, that `statusCode` and `body` are used; otherwise the framework assigns a default `statusCode` (e.g. `200`) and the returned plain object is exposed as `body`.
- **Frontend UI:** Use **`@sparrowengg/twigs-react`** for React UI components and **`@sparrowengg/twigs-react-icons`** for SVG icons. Twigs is SurveySparrow’s themeable, customisable, and fully accessible React component library. Add these packages to `app-frontend/package.json` when building UI.
- **UI look and feel:** The app UI should look and feel like a **SaaS product app** — clean, consistent, professional, and focused on usability (clear navigation, readable typography, coherent spacing, and predictable interactions).

---

## Full documentation

All detailed docs are in this directory (**appnest-governance**):

| Topic | Document |
|-------|----------|
| **Entry points, backend & frontend how-to, project structure** | [01-architecture/03-Entry-Points-and-Implementation.md](01-architecture/03-Entry-Points-and-Implementation.md) |
| **SDK usage rules** | [02-sdk/04-AppNest-SDK-Usage-Rules.md](02-sdk/04-AppNest-SDK-Usage-Rules.md) |
| **SDK reference** ($db, $http, $file, $next, $schedule) | [02-sdk/05-SDK-Reference.md](02-sdk/05-SDK-Reference.md) |
| **Manifest rules & schema** (code-generation) | [02-sdk/06-Manifest-Rules.md](02-sdk/06-Manifest-Rules.md) |
| **Architecture & flow classification** | [01-architecture/](01-architecture/) |
| **Integration standards & checklist** | [03-integration-standards/](03-integration-standards/) |

**Index:** [README.md](../README.md) | [AppnestTools.md](../AppnestTools.md)
