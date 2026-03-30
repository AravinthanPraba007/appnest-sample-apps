# Appnest Tools

This folder contains **Appnest** framework documentation and internal tools.

| Folder | Purpose |
|--------|---------|
| **appnest-governance/** | Standards and reference for Appnest apps: execution flows, SDK usage, manifest rules, pre-ship **review checklist** (includes external API standards), and **[appnest-development-engine/](appnest-governance/appnest-development-engine/)** CLI docs. Use for code review and compliance. |
| **appnest-prd-generator/** | Reusable PRD generator: question framework, PRD templates, PRD generation workflow, and validation checklist. Use to turn an app idea into a production-ready PRD aligned with Appnest. |

**Start here:** [appnest-governance/README.md](appnest-governance/README.md) or [appnest-governance/Appnest-App-Development-Guide.md](appnest-governance/Appnest-App-Development-Guide.md) for framework docs; [appnest-governance/Documentation-Order.md](appnest-governance/Documentation-Order.md) for the recommended reading sequence; [appnest-prd-generator/README.md](appnest-prd-generator/README.md) for the PRD generator.

---

## For AI agents (Cursor, etc.)

These rules apply to **Appnest apps** in this repository. Use the docs under **`appnest-governance/`** as the source of truth. Do not use patterns from other frameworks (e.g. raw Express routes, direct axios) unless a governance doc explicitly allows them.

**Quick start:** [appnest-governance/Appnest-App-Development-Guide.md](appnest-governance/Appnest-App-Development-Guide.md) — app structure, entries, engine workflow, and links to full docs.

### When to read which doc

| If you are… | Read these (in order) |
|-------------|------------------------|
| **Adding or changing a backend API** | [Appnest-App-Development-Guide.md](appnest-governance/Appnest-App-Development-Guide.md), [Appnest-Functions.md](appnest-governance/appnest-functions/Appnest-Functions.md), [Backend-Appnest-Functions.md](appnest-governance/appnest-functions/Backend-Appnest-Functions.md), [Manifest-Rules.md](appnest-governance/app-configuration/Manifest-Rules.md) |
| **Adding or changing an event listener** | [Appnest-App-Development-Guide.md](appnest-governance/Appnest-App-Development-Guide.md), [Appnest-Functions.md](appnest-governance/appnest-functions/Appnest-Functions.md), [Manifest-Rules.md](appnest-governance/app-configuration/Manifest-Rules.md) |
| **Calling an external API from the backend** | [Appnest-Functions.md](appnest-governance/appnest-functions/Appnest-Functions.md), [Backend-Appnest-Functions.md](appnest-governance/appnest-functions/Backend-Appnest-Functions.md), [Code-Review-and-AI-Generation-Checklist.md](appnest-governance/Code-Review-and-AI-Generation-Checklist.md#external-api) (External API standards) |
| **Building or changing frontend UI** | **[App-Frontend-Rules.md](appnest-governance/App-Frontend-Rules.md)** (read first—enforced for AI), then [Twigs-UI-Reference.md](appnest-governance/Twigs-UI-Reference.md), [Appnest-App-Development-Guide.md](appnest-governance/Appnest-App-Development-Guide.md) |
| **Editing manifest.json** | [Manifest-Rules.md](appnest-governance/app-configuration/Manifest-Rules.md), [Appnest-App-Development-Guide.md](appnest-governance/Appnest-App-Development-Guide.md) |
| **Doing code review or validating generated code** | [Code-Review-and-AI-Generation-Checklist.md](appnest-governance/Code-Review-and-AI-Generation-Checklist.md) |
| **Generating a PRD from an app idea** | [prd-generation-workflow.md](appnest-prd-generator/prd-generation-workflow.md), [question-framework.md](appnest-prd-generator/question-framework.md), [prd-template/](appnest-prd-generator/prd-template/), [validation-checklist.md](appnest-prd-generator/validation-checklist.md). Start at [appnest-prd-generator/README.md](appnest-prd-generator/README.md). |

Full index: [appnest-governance/README.md](appnest-governance/README.md). Recommended governance order: [Documentation-Order.md](appnest-governance/Documentation-Order.md). PRD generator: [appnest-prd-generator/README.md](appnest-prd-generator/README.md).

### MUST / MUST NOT (summary)

All conditions are defined in **appnest-governance**. This is a short pointer only.

- **Entry points:** Backend = `app-backend/server.js` (exported functions only); frontend = **React** app, root `app-frontend/src/App.jsx`. Register in manifest. → [Appnest-App-Development-Guide.md](appnest-governance/Appnest-App-Development-Guide.md), [Manifest-Rules.md](appnest-governance/app-configuration/Manifest-Rules.md)
- **Backend I/O:** Use Appnest SDK only ($db, $fetch, $file, $next, $schedule, getTraceId). No axios/fetch; no SDK in backend package.json. → [Appnest-Functions.md](appnest-governance/appnest-functions/Appnest-Functions.md), [Backend-Appnest-Functions.md](appnest-governance/appnest-functions/Backend-Appnest-Functions.md)
- **Frontend → backend:** `window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })`; response `{ statusCode, body }`. No react/react-dom in frontend package.json. → [Appnest-App-Development-Guide.md](appnest-governance/Appnest-App-Development-Guide.md)
- **Frontend UI:** Twigs only (`@sparrowengg/twigs-react`, `@sparrowengg/twigs-react-icons`); no raw HTML for controls; responsive; SaaS "wow" look and feel. → [App-Frontend-Rules.md](appnest-governance/App-Frontend-Rules.md), [Twigs-UI-Reference.md](appnest-governance/Twigs-UI-Reference.md), [Appnest-App-Development-Guide.md](appnest-governance/Appnest-App-Development-Guide.md)
- **Generating a PRD:** Use [prd-generation-workflow.md](appnest-prd-generator/prd-generation-workflow.md) (output is PRD documents only, not code). Fill templates from [prd-template/](appnest-prd-generator/prd-template/), validate with [validation-checklist.md](appnest-prd-generator/validation-checklist.md). Optionally read [PRD-GENERATOR-ASSESSMENT.md](appnest-prd-generator/PRD-GENERATOR-ASSESSMENT.md) for generator coverage. → [appnest-prd-generator/README.md](appnest-prd-generator/README.md)

Before considering a change complete, run [Code-Review-and-AI-Generation-Checklist.md](appnest-governance/Code-Review-and-AI-Generation-Checklist.md).
