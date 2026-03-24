# Appnest frontend — Twigs UI rule (for Cursor / AI)

When building or editing **Appnest app frontend** UI (`app-frontend/` or paths under `app-frontend/`), apply this rule. **When generating frontend code, read [frontend-rules.md](frontend-rules.md) first**—it enforces entry, backend invoke, Twigs, responsive, and SaaS "wow". This file adds Twigs-specific detail. All frontend enforcement is in appnest-governance (frontend-rules.md and this file); no .cursor/rules file is used.

---

## 1. Install Twigs first

- Ensure **`@sparrowengg/twigs-react`** and **`@sparrowengg/twigs-react-icons`** are in **`app-frontend/package.json`** dependencies. Add them if missing.
- Use version **`"*"`** so npm installs the latest available. Do **not** pin to a specific version (e.g. `^2.0.0`) that may not exist—that causes `npm install` to fail. See [07-Twigs-UI-Reference.md](07-Twigs-UI-Reference.md#package-versions-in-app-frontendpackagejson).
- Do not assume they are private or skip them to avoid install issues.

## 2. Use only Twigs for UI primitives

- Use Twigs components for buttons, inputs, selects, tables, modals, toasts, and Twigs icons for icons.
- **Do not** use raw HTML elements or custom-styled divs for these:
  - **Don't:** `<button>`, `<input>`, `<select>`, `<table>`, `<label>`, `<p>`, custom CSS-only forms/tables.
  - **Do:** `import { Button, Input, Select, Stack, Box, Text, Alert, Spinner, Table, ... } from '@sparrowengg/twigs-react';` and icons from `@sparrowengg/twigs-react-icons`.
- For which Twigs component to use instead of each raw HTML element, see [07-Twigs-UI-Reference.md](07-Twigs-UI-Reference.md).

## 3. Layout and spacing

- Use **Stack** and **Box** for layout and spacing (and their props: `gap`, `padding`). Avoid one-off CSS for layout and buttons. Prefer Twigs design tokens over hardcoded hex values.
- Do not rely on custom classes (e.g. `.btn`, `.alert-error`) when Twigs provides equivalent components.

## 4. Responsive

- Use **responsive** Twigs components and layout so the app works on desktop, tablet, and mobile. Avoid fixed widths that break on small screens.

## 5. SaaS "wow" UI

- The app is **viewed inside a SaaS product**. Deliver a **polished, professional** look and feel—clear hierarchy, readable typography, coherent spacing—so it feels native to the host and meets the quality users expect from a modern SaaS app.

## 6. Before considering UI complete

- Verify: (a) both Twigs packages are in package.json, (b) no raw HTML for buttons/inputs/selects/tables, (c) layout uses Stack/Box, (d) UI is responsive and polished for a SaaS context.
- See [09-Code-Review-and-AI-Generation-Checklist.md](../03-integration-standards/09-Code-Review-and-AI-Generation-Checklist.md) — "Frontend UI (Twigs)" section.
