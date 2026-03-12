# Appnest Tools

This folder contains **Appnest** framework documentation and internal tools.

| Folder | Purpose |
|--------|---------|
| **appnest-governance/** | Standards and reference for Appnest apps: architecture, SDK usage, manifest rules, integration standards. Use for code review and compliance. |
| **appnest-prd-generator/** | Reusable PRD generator: question framework, PRD templates, generation workflow, and validation checklist. Use to turn an app idea into a production-ready PRD aligned with Appnest. |

**Start here:** [appnest-governance/README.md](appnest-governance/README.md) or [appnest-governance/APPNEST_DEVELOPER_GUIDE.md](appnest-governance/APPNEST_DEVELOPER_GUIDE.md) for framework docs; [appnest-prd-generator/README.md](appnest-prd-generator/README.md) for the PRD generator.

---

## For AI agents (Cursor, etc.)

These rules apply to **Appnest apps** in this repository. Use the docs under **`appnest-governance/`** as the source of truth. Do not use patterns from other frameworks (e.g. raw Express routes, direct axios) unless a governance doc explicitly allows them.

**Quick start:** [appnest-governance/APPNEST_DEVELOPER_GUIDE.md](appnest-governance/APPNEST_DEVELOPER_GUIDE.md) — entry points and links to full docs.

### When to read which doc

| If you are… | Read these (in order) |
|-------------|------------------------|
| **Adding or changing a backend API** | [03-Entry-Points-and-Implementation.md](appnest-governance/01-architecture/03-Entry-Points-and-Implementation.md), [04-AppNest-SDK-Usage-Rules.md](appnest-governance/02-sdk/04-AppNest-SDK-Usage-Rules.md), [05-SDK-Reference.md](appnest-governance/02-sdk/05-SDK-Reference.md), [06-Manifest-Rules.md](appnest-governance/02-sdk/06-Manifest-Rules.md) |
| **Adding or changing an event listener** | [03-Entry-Points-and-Implementation.md](appnest-governance/01-architecture/03-Entry-Points-and-Implementation.md), [04-AppNest-SDK-Usage-Rules.md](appnest-governance/02-sdk/04-AppNest-SDK-Usage-Rules.md), [06-Manifest-Rules.md](appnest-governance/02-sdk/06-Manifest-Rules.md) |
| **Calling an external API from the backend** | [04-AppNest-SDK-Usage-Rules.md](appnest-governance/02-sdk/04-AppNest-SDK-Usage-Rules.md), [05-SDK-Reference.md](appnest-governance/02-sdk/05-SDK-Reference.md), [07-External-API-Standards.md](appnest-governance/03-integration-standards/07-External-API-Standards.md) |
| **Building or changing frontend UI** | [03-Entry-Points-and-Implementation.md](appnest-governance/01-architecture/03-Entry-Points-and-Implementation.md), [APPNEST_DEVELOPER_GUIDE.md](appnest-governance/APPNEST_DEVELOPER_GUIDE.md) (Twigs, UI look-and-feel) |
| **Editing manifest.json** | [06-Manifest-Rules.md](appnest-governance/02-sdk/06-Manifest-Rules.md), [03-Entry-Points-and-Implementation.md](appnest-governance/01-architecture/03-Entry-Points-and-Implementation.md) |
| **Doing code review or validating generated code** | [09-Code-Review-and-AI-Generation-Checklist.md](appnest-governance/03-integration-standards/09-Code-Review-and-AI-Generation-Checklist.md) |

Full index: [appnest-governance/README.md](appnest-governance/README.md).

### MUST / MUST NOT (summary)

- **MUST** use **`app-backend/server.js`** as the only backend entry; only **exported** functions are invokable. Register API functions in `manifest.json` → `backend_api_functions` and event handlers in `event_listener_functions`.
- **MUST** use **`app-frontend/src/App.jsx`** as the frontend entry; build UI there or in components it imports.
- **MUST** use Appnest SDK for all backend I/O: **$http** (no axios/fetch), **$db** (no raw DB or in-memory state for cross-invocation data), **$file** (file operations), **$schedule** (long-running/chained work). See [05-SDK-Reference.md](appnest-governance/02-sdk/05-SDK-Reference.md).
- **MUST NOT** add **`@aravinthan_p/appnest-app-sdk-utils`** or **`appnest-sdk-utils`** to `app-backend/package.json`; the platform provides the SDK at runtime.
- **MUST NOT** add **`react`** or **`react-dom`** to `app-frontend/package.json`; they are provided by the platform.
- **MUST** call the backend from the frontend via **`window.appnestClient.backend.invoke({ functionName, payload })`**. The response shape is **`{ statusCode, body }`**; `body` is the handler's return (e.g. from `ResultData`). Use **`functionName`** (exact name of the function exported from `server.js` and declared in `backend_api_functions`).
- **MUST** use **ResultData** (or a structured return) for handlers when you need explicit status/body (e.g. errors); do not throw raw errors without a structured response.
- **MUST** keep handlers stateless; persist state with $db or external storage. No global variables for execution state.
- **MUST** use **`@sparrowengg/twigs-react`** and **`@sparrowengg/twigs-react-icons`** for UI; keep the UI look and feel like a SaaS product app (clean, consistent, professional).

Before considering a change complete, verify it against [09-Code-Review-and-AI-Generation-Checklist.md](appnest-governance/03-integration-standards/09-Code-Review-and-AI-Generation-Checklist.md).
