# Appnest Tools

This folder contains **Appnest** framework documentation and internal tools.

| Folder | Purpose |
|--------|---------|
| **appnest-governance/** | Standards and reference for Appnest apps: architecture, SDK usage, manifest rules, integration standards. Use for code review and compliance. |
| **appnest-prd-generator/** | Reusable PRD generator: question framework, PRD templates, PRD generation workflow, and validation checklist. Use to turn an app idea into a production-ready PRD aligned with Appnest. |

**Start here:** [appnest-governance/README.md](appnest-governance/README.md) or [appnest-governance/APPNEST_DEVELOPER_GUIDE.md](appnest-governance/APPNEST_DEVELOPER_GUIDE.md) for framework docs; [appnest-prd-generator/README.md](appnest-prd-generator/README.md) for the PRD generator.

---

## For AI agents (Cursor, etc.)

These rules apply to **Appnest apps** in this repository. Use the docs under **`appnest-governance/`** as the source of truth. Do not use patterns from other frameworks (e.g. raw Express routes, direct axios) unless a governance doc explicitly allows them.

**Quick start:** [appnest-governance/APPNEST_DEVELOPER_GUIDE.md](appnest-governance/APPNEST_DEVELOPER_GUIDE.md) — entry points and links to full docs.

### When to read which doc

| If you are… | Read these (in order) |
|-------------|------------------------|
| **Adding or changing a backend API** | [03-Entry-Points-and-Implementation.md](appnest-governance/01-architecture/03-Entry-Points-and-Implementation.md), [04-AppNest-SDK-Usage-Rules.md](appnest-governance/02-sdk/04-AppNest-SDK-Usage-Rules.md), [BackendAppnestFunction-Reference.md](appnest-governance/02-sdk/BackendAppnestFunction-Reference.md), [06-Manifest-Rules.md](appnest-governance/02-sdk/06-Manifest-Rules.md) |
| **Adding or changing an event listener** | [03-Entry-Points-and-Implementation.md](appnest-governance/01-architecture/03-Entry-Points-and-Implementation.md), [04-AppNest-SDK-Usage-Rules.md](appnest-governance/02-sdk/04-AppNest-SDK-Usage-Rules.md), [06-Manifest-Rules.md](appnest-governance/02-sdk/06-Manifest-Rules.md) |
| **Calling an external API from the backend** | [04-AppNest-SDK-Usage-Rules.md](appnest-governance/02-sdk/04-AppNest-SDK-Usage-Rules.md), [BackendAppnestFunction-Reference.md](appnest-governance/02-sdk/BackendAppnestFunction-Reference.md), [07-External-API-Standards.md](appnest-governance/03-integration-standards/07-External-API-Standards.md) |
| **Building or changing frontend UI** | **[frontend-rules.md](appnest-governance/04-frontend/frontend-rules.md)** (read first—enforced for AI), then [03-Entry-Points-and-Implementation.md](appnest-governance/01-architecture/03-Entry-Points-and-Implementation.md), [07-Twigs-UI-Reference.md](appnest-governance/04-frontend/07-Twigs-UI-Reference.md), [APPNEST_DEVELOPER_GUIDE.md](appnest-governance/APPNEST_DEVELOPER_GUIDE.md) |
| **Editing manifest.json** | [06-Manifest-Rules.md](appnest-governance/02-sdk/06-Manifest-Rules.md), [03-Entry-Points-and-Implementation.md](appnest-governance/01-architecture/03-Entry-Points-and-Implementation.md) |
| **Doing code review or validating generated code** | [09-Code-Review-and-AI-Generation-Checklist.md](appnest-governance/03-integration-standards/09-Code-Review-and-AI-Generation-Checklist.md) |
| **Generating a PRD from an app idea** | [prd-generation-workflow.md](appnest-prd-generator/prd-generation-workflow.md), [question-framework.md](appnest-prd-generator/question-framework.md), [prd-template/](appnest-prd-generator/prd-template/), [validation-checklist.md](appnest-prd-generator/validation-checklist.md). Start at [appnest-prd-generator/README.md](appnest-prd-generator/README.md). |

Full index: [appnest-governance/README.md](appnest-governance/README.md). PRD generator: [appnest-prd-generator/README.md](appnest-prd-generator/README.md).

### MUST / MUST NOT (summary)

All conditions are defined in **appnest-governance**. This is a short pointer only.

- **Entry points:** Backend = `app-backend/server.js` (exported functions only); frontend = **React** app, root `app-frontend/src/App.jsx`. Register in manifest. → [03-Entry-Points-and-Implementation.md](appnest-governance/01-architecture/03-Entry-Points-and-Implementation.md), [06-Manifest-Rules.md](appnest-governance/02-sdk/06-Manifest-Rules.md)
- **Backend I/O:** Use Appnest SDK only ($http, $db, $file, $schedule, $next). No axios/fetch; no SDK in backend package.json. → [04-AppNest-SDK-Usage-Rules.md](appnest-governance/02-sdk/04-AppNest-SDK-Usage-Rules.md), [BackendAppnestFunction-Reference.md](appnest-governance/02-sdk/BackendAppnestFunction-Reference.md)
- **Frontend → backend:** `window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })`; response `{ statusCode, body }`. No react/react-dom in frontend package.json. → [03-Entry-Points-and-Implementation.md](appnest-governance/01-architecture/03-Entry-Points-and-Implementation.md)
- **Frontend UI:** Twigs only (`@sparrowengg/twigs-react`, `@sparrowengg/twigs-react-icons`); no raw HTML for controls; responsive; SaaS "wow" look and feel. → [APPNEST_DEVELOPER_GUIDE.md](appnest-governance/APPNEST_DEVELOPER_GUIDE.md), [07-Twigs-UI-Reference.md](appnest-governance/04-frontend/07-Twigs-UI-Reference.md)
- **Generating a PRD:** Use [prd-generation-workflow.md](appnest-prd-generator/prd-generation-workflow.md) (output is PRD documents only, not code). Fill templates from [prd-template/](appnest-prd-generator/prd-template/), validate with [validation-checklist.md](appnest-prd-generator/validation-checklist.md). Optionally read [PRD-GENERATOR-ASSESSMENT.md](appnest-prd-generator/PRD-GENERATOR-ASSESSMENT.md) for generator coverage. → [appnest-prd-generator/README.md](appnest-prd-generator/README.md)

Before considering a change complete, run [09-Code-Review-and-AI-Generation-Checklist.md](appnest-governance/03-integration-standards/09-Code-Review-and-AI-Generation-Checklist.md).
