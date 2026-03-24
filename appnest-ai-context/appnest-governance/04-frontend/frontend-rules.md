# Appnest Frontend Rules — Enforce When Generating Frontend Code

**Goal:** Keep the frontend codebase **clean, scalable, maintainable, and consistent** across the team. The rules below apply to all Appnest app frontends.

**For AI (Cursor, etc.):** When generating or editing **any frontend code** (`app-frontend/`, `*.jsx`, `*.tsx`, or UI under this app), **read and apply this file first**. These rules are mandatory; do not generate frontend code that violates them. For **visual and layout direction** (Stripe / Linear / Notion–style SaaS UI), follow **§5** after **§3–4** (Twigs + responsive baseline).

---

## 1. Stack and entry

| Rule | Constraint |
|------|------------|
| **Framework** | The frontend is a **React** application. React and react-dom are provided by the platform at runtime. |
| **Entry** | **MUST** use **`app-frontend/src/App.jsx`** as the single root. Build UI there or in components it imports (e.g. `src/components/`). |
| **MUST NOT** | Add `react` or `react-dom` to `app-frontend/package.json`. Do not create a separate router entry or multiple roots. |

---

## 2. Calling the backend

| Rule | Constraint |
|------|------------|
| **API** | **MUST** call the backend via **`window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })`**. |
| **Parameter name** | Use **`apiFunctionName`** (exact). The value must match a function **exported** from `app-backend/server.js` and declared in `manifest.json` → `backend_api_functions`. |
| **Response** | Response shape is **`{ statusCode, body }`**. `body` is the handler return (e.g. from `ResultData`). Always check `response.statusCode` before using `response.body`. |
| **MUST NOT** | Use `fetch`, `axios`, or any other HTTP client to call app backend. Do not use a different parameter name (e.g. `functionName`) for the invoke call—use **`apiFunctionName`**. |

**Example:**
```javascript
const response = await window.appnestClientFunctions.appBackend.invoke({
  apiFunctionName: 'getUserSettings',
  payload: { userId: 'user_123' }
});
if (response.statusCode >= 200 && response.statusCode < 300) {
  const data = response.body;
} else {
  // handle error via response.body or statusCode
}
```

For the client bridge (`client.js`, `window.AppnestFunctions`), see [FrontendAppnestFunction-Reference.md](FrontendAppnestFunction-Reference.md).

---

## 3. UI: Twigs only

| Rule | Constraint |
|------|------------|
| **Libraries** | **MUST** use **`@sparrowengg/twigs-react`** and **`@sparrowengg/twigs-react-icons`** for all UI. Add both to `app-frontend/package.json` with version **`"*"`** (latest). |
| **MUST NOT** | Use raw HTML for UI primitives: no `<button>`, `<input>`, `<select>`, `<table>`, `<label>`, `<p>` or custom-styled `<div>` for forms/tables. No Tailwind/custom utility classes for buttons or form controls when Twigs provides the component. |
| **Layout** | Use Twigs **Stack** and **Box** for layout and spacing (`gap`, `padding`). Prefer Twigs design tokens over hardcoded hex or one-off CSS. |
| **Component names** | **Verify exact export names** at [https://twigs.surveysparrow.com/](https://twigs.surveysparrow.com/) (component docs). Do not assume names like `Alert` or `Spinner` exist—use what the package actually exports. |

Mapping (what to use instead of raw HTML): [07-Twigs-UI-Reference.md](07-Twigs-UI-Reference.md).

---

## 4. Responsive and look-and-feel

| Rule | Constraint |
|------|------------|
| **Responsive** | **MUST** use responsive layout so the app works on desktop, tablet, and mobile. Prefer **mobile-first** design; support common breakpoints (mobile, tablet, desktop). Avoid fixed widths that break on small screens; use Twigs responsive props/patterns where available. |
| **SaaS "wow"** | The app is **viewed inside a SaaS product**. **MUST** deliver a polished, professional look and feel: clear hierarchy, readable typography, coherent spacing, so it feels native to the host. Avoid cluttered layouts; prefer minimal, modern design. |

---

## 5. SaaS UI generation style (Stripe / Linear / Notion)

When generating frontend UI, **design interfaces that match modern SaaS products** (e.g. Stripe, Linear, Notion): calm, professional, and hierarchy-first.

**Implementation constraint:** Express every pattern below with **Twigs** (`@sparrowengg/twigs-react`, `@sparrowengg/twigs-react-icons`)—nav, sidebar, tables, modals, toasts, etc. Map to the closest Twigs components ([Twigs docs](https://twigs.surveysparrow.com/)). **Do not** use Tailwind or utility CSS as the primary UI system; use Twigs layout (**Stack**, **Box**) and tokens. **React** + **functional components + hooks** only.

### Overall principles

- Prioritize **clarity**, **minimalism**, and **strong visual hierarchy**.
- Avoid clutter and unnecessary borders; every section needs a **clear purpose** and **spacing**.

### Layout structure

Prefer this hierarchy when the app warrants it:

- **Top navigation bar** (sticky where appropriate)
- **Sidebar navigation** (icons + labels when space allows)
- **Main content area**
- **Optional right panel** for detail views

Use **responsive** layout: flex/stack patterns via Twigs **Stack** / **Box**, sensible **max-width** on main content, avoid full-bleed dense text on large screens.

### Spacing

- Use **consistent spacing** aligned with an **8px-based rhythm** (e.g. gaps and padding in multiples of 4/8 via Twigs tokens where possible).
- **Whitespace** between sections—do not pack unrelated blocks together.

### Component patterns (Twigs-backed)

| Area | Aim for |
|------|---------|
| **Navigation** | Sticky top bar; collapsible sidebar; breadcrumbs for nested flows (use Twigs equivalents). |
| **Content** | Cards, data tables, list views, grids, expandable sections. |
| **Overlays** | Modals, slide-in drawers, popovers, context menus (Twigs/dialog patterns). |
| **Feedback** | Toasts, confirmation dialogs, inline validation. |

### Data interfaces

- **Tables:** Sticky header where useful; sorting, filters, pagination, sensible column alignment—all with Twigs table/list primitives where available.
- **Lists:** Avatar/icon, title, metadata, row actions.
- **Cards:** Icon or image, title, short description, primary/secondary actions.
- **Text:** Truncate long strings with ellipsis; tooltip or expand for full content; avoid dense paragraphs.

### Interactions

- **Hover, focus, active** states on interactive elements.
- **Transitions** ~150–200ms where it improves perceived quality.
- **Buttons:** loading, disabled, clear primary vs secondary hierarchy.

### State management UI

Always design:

| State | Pattern |
|-------|---------|
| **Loading** | Skeleton loaders (Twigs equivalent) or loading indicator—not a blank area. |
| **Empty** | Friendly empty state + clear **call to action**. |
| **Error** | Clear message + **retry** when applicable. |

### Forms

- Clear **labels**, **grouped sections**, **helper text**, **inline validation**, **success feedback**—all via Twigs form components.

### Responsiveness

Adapt for **desktop**, **tablet**, **mobile**:

- Sidebar **collapses** or becomes overlay on small viewports.
- Top nav may use **compact** or **menu** pattern on mobile.
- Cards and lists **stack** vertically on narrow screens.

### Visual style

- **Rounded corners** (moderate, e.g. ~6–12px feel via Twigs).
- **Subtle shadows** and **soft borders** where Twigs supports them.
- **Neutral base** + **one accent** for primary actions.

### Typography hierarchy

Maintain clear levels: **page title** → **section header** → **card title** → **body** → **metadata** (use Twigs **Text** variants / props as documented).

### Performance (UI)

- Lazy-load heavy sections where helpful; **skeleton** while loading; avoid unnecessary re-renders (see §11).

### Code architecture

- **Component-based**, **modular**, **reusable**, easy to maintain.
- Prefer **functional components + hooks**; shared layout components (e.g. `AppShell`, `PageHeader`) when the app has multiple screens.

---

## 6. Project structure

- **Folder organization:** Keep a clear structure under `app-frontend/src/`: separate **components**, **pages** (or views), **hooks**, **services** (API/backend-invoke helpers), **utils**, and **styles** (if any) as appropriate. Use **index** files for cleaner imports where it helps.
- **Modular architecture:** Prefer small, focused modules. **Avoid deeply nested folders** (e.g. keep depth to 2–3 levels where possible).

---

## 7. Component design

- Keep components **small, reusable, and single-responsibility**. Prefer **composition over inheritance**.
- **Separate container logic from presentational UI** when it helps (e.g. container fetches/handles state, child components receive props and render).
- Avoid large monolithic components; split by concern or screen area.

---

## 8. Naming conventions

| Kind | Convention | Example |
|------|------------|---------|
| Components | **PascalCase** | `UserProfile.jsx`, `SurveyList.jsx` |
| Hooks | **camelCase** starting with `use` | `useSurveyData`, `useAuth` |
| Files / folders | **kebab-case** or project-consistent | `user-profile.jsx`, `survey-list/` |
| Constants | **UPPER_SNAKE_CASE** | `MAX_ITEMS`, `API_TIMEOUT` |

Use clear, descriptive names everywhere.

---

## 9. Styling guidelines

- Use **Twigs** for UI and **Twigs design tokens** (spacing, colors, typography) for consistency. See [07-Twigs-UI-Reference.md](07-Twigs-UI-Reference.md).
- Avoid **inline styles** unless necessary (e.g. dynamic values). Prefer Twigs props and tokens.
- Keep styles **maintainable and reusable**; do not duplicate token values or create one-off CSS when Twigs covers the need.

---

## 10. State management

- Keep **local state** inside components when possible. Use **global state** (e.g. context, external store) only when data is shared across many components or screens.
- Avoid **unnecessary prop drilling**; consider context or a small store for widely used data.

---

## 11. Performance

- Use **lazy loading** (e.g. `React.lazy` / `Suspense`) for heavy or route-level components where it helps.
- Avoid **unnecessary re-renders** (memoize callbacks/values when they are passed to many children or used in effects).
- For **large lists**, use virtualization (e.g. windowing) when appropriate. Memoize expensive computations where needed.

---

## 12. Code quality

- Follow **ESLint** and **Prettier** (or project lint/format) so the codebase stays consistent.
- Keep **functions small and readable**. Avoid duplicated logic; extract shared helpers or hooks.
- Prefer **self-documenting** names and structure; add comments only for non-obvious or complex logic.

---

## 13. Accessibility

- Use **semantic structure** (Twigs components are built for accessibility; use them correctly). Do not replace semantic elements with non-semantic ones when Twigs provides the right component.
- Ensure **keyboard navigation** works for interactive elements. Include **alt text** for images and descriptive labels for form controls.
- Follow **accessibility best practices** (focus order, contrast, ARIA where needed). Prefer Twigs' built-in a11y over custom solutions.

---

## 14. API handling and error handling

- **Separate API/backend logic from UI:** Use **services** or dedicated modules for `window.appnestClientFunctions.appBackend.invoke(...)`. Components should call a service/hook that returns data or error state, not invoke directly in the middle of JSX when it can be avoided.
- **Loading and error states:** Always handle loading (e.g. spinner/skeleton) and errors (e.g. user-facing message). Do not leave the user with a blank screen or raw API errors.
- **User-facing errors:** Show **user-friendly error messages**. Do **not** expose raw API errors or stack traces to the user. Log details for debugging if needed.

---

## 15. Reusability and documentation

- **Reusability:** Extract **reusable UI components** and shared logic (hooks, utils). Prefer a small set of shared components over one-off copies.
- **Documentation:** Add **comments for complex logic**. Document **reusable components** (purpose, props, usage) so the team can use them consistently.

---

## 16. General principles

- Keep code **simple and readable**. Prioritize **maintainability** over clever or dense code.
- Follow **consistent patterns** across the project (same way to call backend, same way to show errors, same structure for similar screens).

---

## 17. Before considering frontend complete

- Run the **Frontend UI (Twigs)** section of [09-Code-Review-and-AI-Generation-Checklist.md](../03-integration-standards/09-Code-Review-and-AI-Generation-Checklist.md).
- Confirm: (a) Twigs packages in package.json with version `"*"`, (b) no raw HTML for controls, (c) layout uses Stack/Box, (d) backend calls use `window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })` and response `{ statusCode, body }`, (e) UI matches **§5 SaaS style** (hierarchy, spacing, states, responsive shell) and is polished for a SaaS context, (f) structure, naming, API/error handling, and accessibility (§6–§16) are followed where applicable.

---

## Quick reference (MUST / MUST NOT)

| Area | MUST | MUST NOT |
|------|------|----------|
| Entry | `app-frontend/src/App.jsx` as root | react/react-dom in package.json; multiple roots |
| Backend call | `window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })`; handle `{ statusCode, body }` | fetch/axios to app backend; wrong param name |
| UI | Twigs only; Stack/Box layout; version `"*"`; verify names at twigs.surveysparrow.com | Raw HTML for controls; fixed versions like ^2.0.0; assume Alert/Spinner without verifying |
| UX | Responsive; mobile-first; SaaS "wow"; **§5** Stripe/Linear/Notion-style hierarchy & states | Fixed widths; cluttered layouts; Tailwind-as-primary UI |
| Structure | Clear folders (components, pages, hooks, services, utils); modular; index where helpful | Deep nesting; monolithic files |
| Naming | PascalCase components; camelCase `use*` hooks; kebab-case files; UPPER_SNAKE_CASE constants | Inconsistent or unclear names |
| API/errors | Separate invoke logic (services/hooks); loading + error states; user-friendly messages | Raw API errors to user; no loading/error handling |
| A11y | Semantic use of Twigs; keyboard nav; alt text; a11y best practices | Non-semantic or inaccessible custom UI when Twigs covers it |
