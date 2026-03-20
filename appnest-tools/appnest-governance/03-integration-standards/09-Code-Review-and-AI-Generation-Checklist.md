# Code Review and AI Generation Checklist

**Before considering a change complete, verify every item below.** Use this checklist for code review and when validating AI-generated code.

## Runtime Safety

- [ ] Batching implemented for large datasets
- [ ] $schedule used for long-running flows
- [ ] $db used for state persistence
- [ ] No unbounded loops

## External API

- [ ] Idempotency implemented
- [ ] Non-200 handled
- [ ] Rate limits respected

## SDK Compliance

- [ ] No direct HTTP libraries (use $http)
- [ ] Handlers exported from **app-backend/server.js** only
- [ ] ResultData or structured return used

## Manifest

- [ ] **event_listener_functions** and **backend_api_functions** match exports from app-backend/server.js
- [ ] **oauth_config** declared if OAuth is used
- [ ] **frontend_locations** (e.g. full_page_app.url) set correctly

## Entry Points

- [ ] Frontend entry: **app-frontend/src/App.jsx**
- [ ] Backend entry: **app-backend/server.js** (only exported functions are invokable)

## Frontend UI (Twigs) — required when the app has a UI

- [ ] **`@sparrowengg/twigs-react`** and **`@sparrowengg/twigs-react-icons`** are listed in **`app-frontend/package.json`** (required app dependencies). Version should be **`"*"`** (latest)—do not pin to a specific version that may not exist (e.g. `^2.0.0`); see [07-Twigs-UI-Reference.md](../04-frontend/07-Twigs-UI-Reference.md).
- [ ] **All screens** use **only** Twigs (and twigs-react-icons) for buttons, form controls, layout, and feedback. No raw `<button>`, `<select>`, `<input>`, `<table>`, `<label>`, `<p>` for UI—use Twigs **Button**, **Select**, **Input**, **Table**, **Text**, **Alert**, **Spinner**, etc.
- [ ] **Layout and spacing** use Twigs layout components (**Stack**, **Box**) and their props (`gap`, `padding`); custom CSS is minimal and does **not** redefine buttons, alerts, or layout (no parallel design system like `.btn`, `.alert-error`).
- [ ] **Loading, empty, and error states** use Twigs components (e.g. **Text**, **Spinner**, **Alert**) where applicable—not raw HTML or custom CSS-only divs.
- [ ] No reliance on custom App.css classes (e.g. `.btn`, `.alert`, `.run-list`) when Twigs provides equivalent components; the app must look like a single Twigs-based design.
- [ ] **Responsive:** UI uses **responsive** layout (Twigs responsive props/patterns) so the app works well on desktop, tablet, and mobile; no fixed widths that break on small screens.
- [ ] **SaaS “wow” UI:** The app is viewed **inside a SaaS product** and delivers a **polished, professional** look and feel—clear hierarchy, readable typography, coherent spacing—so it feels native to the host and meets the quality users expect from a modern SaaS app.
- [ ] Before considering frontend complete, confirm every screen uses Twigs only, layout uses Stack/Box, UI is responsive, and the experience is polished for a SaaS context. See [07-Twigs-UI-Reference.md](../04-frontend/07-Twigs-UI-Reference.md).

## AI Generated Code

- [ ] No hallucinated SDK methods
- [ ] No forbidden libraries
- [ ] Structure matches Appnest standards