# Appnest Frontend Rules — Enforce When Generating Frontend Code

**Goal:** Keep the frontend codebase **clean, scalable, maintainable, and consistent** across the team. The rules below apply to all Appnest app frontends.

**For AI (Cursor, etc.):** When generating or editing **any frontend code** (`app-frontend/`, `*.jsx`, `*.tsx`, or UI under this app), **read and apply this file first**. Then use **[Twigs-UI-Reference.md](Twigs-UI-Reference.md)** for **`package.json` Twigs versions** and the **HTML → Twigs mapping table** while coding. These rules are mandatory; do not generate frontend code that violates them. For **visual and layout direction** (Stripe / Linear / Notion–style SaaS UI), follow **§5** after **§3–4** (Twigs + responsive baseline).

**Where frontend docs live:** Canonical guidance is **`App-Frontend-Rules.md`** (this file) + **`Twigs-UI-Reference.md`** in **`appnest-governance/`**. There is no separate Twigs-only Cursor rule file—point tools and contributors at these two files only.

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

For the client bridge (`client.js`, `window.AppnestFunctions`), see [Frontend-Appnest-Functions.md](appnest-functions/Frontend-Appnest-Functions.md).

---

## 3. UI: Twigs only

| Rule | Constraint |
|------|------------|
| **Libraries** | **MUST** use **`@sparrowengg/twigs-react`** and **`@sparrowengg/twigs-react-icons`** for all UI. Add both to `app-frontend/package.json` with version **`"*"`** (latest). |
| **MUST NOT** | Use raw HTML for UI primitives: no `<button>`, `<input>`, `<select>`, `<table>`, `<label>`, `<p>` or custom-styled `<div>` for forms/tables. No Tailwind/custom utility classes for buttons or form controls when Twigs provides the component. |
| **Layout** | Use Twigs **Stack** and **Box** for layout and spacing (`gap`, `padding`). Prefer Twigs design tokens over hardcoded hex or one-off CSS. |
| **Component names** | **Verify exact export names** at [https://twigs.surveysparrow.com/](https://twigs.surveysparrow.com/) (component docs). Do not assume names like `Alert` or `Spinner` exist—use what the package actually exports. |

Mapping (what to use instead of raw HTML): [Twigs-UI-Reference.md](Twigs-UI-Reference.md).

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

### Typography and readability

**Goal:** Text should be easy to scan and read at a glance, with **size, weight, and style** reflecting **role**—not everything at the same visual weight.

- **Hierarchy (largest → smallest):** **page title** → **section header** → **card / list title** → **body** → **captions / helper / metadata** → **nav labels** (distinct but not competing with page titles).
- **Headings:** Use **larger sizes** and **bolder weight** than body copy so structure is obvious. Prefer one clear **page title** per view; subsection headings step down in size/weight consistently.
- **Body text:** Use a **comfortable base size** for the platform (not smaller than typical readable UI copy). **Line height** should feel airy enough for paragraphs—avoid cramped multi-line blocks.
- **Navigation (sidebar, top bar, tabs):** Use a **dedicated treatment**: slightly **smaller or medium** size vs. the page title, often **medium** weight for active items and **regular** for inactive—so nav reads as **chrome**, not as the primary headline layer. Icons + labels should align; keep label truncation rules consistent (ellipsis + tooltip when truncated).
- **Metadata** (timestamps, counts, tertiary labels): **Smaller size** and/or **muted** color via tokens—still **meeting contrast** requirements (see §13).
- **Implementation:** Map these roles to Twigs **Text** (or typography) **variants / token sizes / weights** as documented—do not rely on default browser font stacking for hierarchy.

### Selects, dropdowns, and menus

Options and menu items must stay **legible**; never sacrifice clarity for density alone.

- **Option text:** Use **full, clear labels**; avoid cryptic abbreviations unless expanded in a tooltip or secondary line.
- **Limited width:** Prefer **one** of: (a) **truncate** with **ellipsis** and expose full text on **hover/focus** (tooltip or title attribute where appropriate), or (b) **wrap** to multiple lines when wrapping is supported and does not break layout—pick per pattern and stay consistent within the same surface.
- **Multi-line options:** If labels wrap, keep **consistent padding** and **alignment** so lists remain scannable; avoid uneven row heights without reason.
- **Long lists:** Consider **grouping**, **search/filter** in the control, or **max height + scroll** so the trigger and first options remain usable.
- Implement with **Twigs** Select / Dropdown / Menu primitives; respect **keyboard** and **focus** behavior (§13).

### Visual refinement (look and feel)

Small details that keep the UI feeling **intentional** and **product-grade**:

- **Contrast:** Body and labels should meet readable contrast on backgrounds; do not rely on **ultra-light** text for essential content.
- **Alignment and rhythm:** **Baseline-align** related text (e.g. label + control); use **consistent** horizontal padding in toolbars, cards, and lists.
- **Interactive targets:** Keep **tap/click targets** adequately sized; do not shrink controls so much that labels clip unintentionally.
- **Dividers:** Use **light** separators sparingly; prefer **spacing** to separate groups when possible.
- **Icons:** Pair with **labels** when meaning is not universal; size icons in proportion to adjacent text.

### UI generation checklist (MUST)

Use this when **generating or reviewing** screens. Everything below is expressed with **Twigs** (Stack, Box, primitives for nav, select, dialog—never raw HTML controls).

| Area | MUST (all items in the row) |
|------|------------------------------|
| **Stack & Box / layout** | • Use **Stack** for flow and **gap**; **Box** for padded surfaces, radius, borders—no nesting that fights spacing. • **8px-based** rhythm (tokens) for gaps and padding. • **Max-width** + horizontal inset for main content on large screens. • **More space between sections** than within a section. |
| **Navigation** | • Nav as **chrome**: typography **quieter** than **page title** (see **Typography and readability**). • **Clear active** state (tokens: color and/or weight). • **Small screens**: collapse, menu, or drawer—no reliance on clipped labels. • **Icons + labels** aligned; **ellipsis + tooltip** when labels truncate. |
| **Dropdown / select / menu** | • **Legible** option rows (padding, contrast); **Twigs** primitives only. • Tight width: **truncate + full text on hover/focus** *or* **wrap**—**one pattern per surface**. • **Keyboard** + visible **focus**; **loading** and **empty** for async lists. • Long lists: **group**, **search/filter**, or **scroll**. |
| **Modal / drawer / popover** | • **Intent**: blocking → **modal**; extended context/form → **drawer**; light edit → **popover**; avoid nested modals when possible. • **Focus trap** in modal; **return focus** on close; **ESC** when safe. • **Title**, body, footer; **one primary** in the action region. • **Readable** backdrop; overlay content meets **contrast** (§13). |
| **Button** | • **One primary** per logical block (card, footer, dialog actions). • **Loading** + **disabled**; no **double submit**. • **Destructive** only for harmful actions; labels state outcome (not vague “OK”). • **Hit targets** adequate, especially **icon-only** on touch. |

### References (SaaS UI patterns — discussion & inspiration)

These are **industry references** for hierarchy, density, and interaction quality. **Implementation stays Twigs** (§3); use the links to align **intent** with common SaaS and product UI practice, not to copy unrelated stacks.

**For automated codegen (AI tools):** Rely on **§5**—especially the **UI generation checklist**, **Typography and readability**, **Selects / dropdowns**, **Condensed principles** below, and **§3–4**. **Do not assume** external URLs can be fetched; treat links as **human follow-up** and **citation only**. They do not add new MUST rules beyond this file.

**Condensed principles (in-house summary):** The checklist above is the **enforceable** bar. The bullets below distill what those references keep repeating—use them for **reviews and discussions** without replacing §5 or Twigs.

- **Consistency:** Same control and wording for the same job; users should not have to guess how this app behaves vs. the host product.
- **Recognition over recall:** Prefer visible structure, clear labels, and obvious affordances—especially for nav, menus, and primary actions.
- **Errors and risk:** Prevent mistakes where possible; for destructive or irreversible actions, confirm with explicit outcomes (not vague “OK”).
- **Choice and targets:** Fewer competing choices per decision point; primary actions should be easy to see and hit (including on touch).
- **Hierarchy before decoration:** Establish structure with **type scale, weight, and spacing** before adding borders, shadows, or extra chrome.
- **Accessibility as part of polish:** Readable contrast, visible focus, predictable modals and focus return—same sources (M3, HIG) reinforce this.

| Resource | Useful for |
|----------|------------|
| [Nielsen Norman Group: 10 usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) | Error prevention, consistency, recognition over recall, match to the real world—good **review lens** for any generated UI. |
| [Laws of UX](https://lawsofux.com/) | Short principles (e.g. Hick’s Law, Fitts’s Law) that explain **why** simpler nav, clear primary actions, and target size matter. |
| [Refactoring UI](https://www.refactoringui.com/) | Practical **visual hierarchy**, spacing, and typography judgment—aligns with “calm SaaS” without mandating a specific framework. |
| [Material Design 3](https://m3.material.io/) | **Patterns** for components, motion, and accessibility; adapt concepts through **Twigs** components and tokens. |
| [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) | **Clarity, deference, depth**—useful for touch targets, feedback, and modal behavior expectations in embedded/Web-style UIs. |
| [Stripe Docs: Design your app (Stripe Apps)](https://docs.stripe.com/stripe-apps/design) | **Embedded SaaS** thinking: contextual vs. focused surfaces, app chrome vs. host content, constrained styling for consistency and **accessibility**—parallels Appnest apps living inside another product. **Still implement with Twigs** here; do not adopt Stripe’s proprietary UI SDK. |

**Qualitative reference (no single spec URL):** Products such as **Linear** (and similar dense dashboards) are useful **examples** of calm hierarchy and keyboard-friendly density; treat them as **inspiration**, not a contract—the **UI generation checklist** and Twigs remain authoritative.

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

- Use **Twigs** for UI and **Twigs design tokens** (spacing, colors, typography) for consistency. See [Twigs-UI-Reference.md](Twigs-UI-Reference.md).
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

- Run the **Frontend UI (Twigs)** section of [Code-Review-and-AI-Generation-Checklist.md](Code-Review-and-AI-Generation-Checklist.md).
- Confirm: (a) Twigs packages in package.json with version `"*"`, (b) no raw HTML for controls, (c) layout uses Stack/Box, (d) backend calls use `window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })` and response `{ statusCode, body }`, (e) UI matches **§5 SaaS style** and the **UI generation checklist** (typography hierarchy, nav vs. title, dropdowns/modals/buttons/layout, spacing, states, responsive shell) and is polished for a SaaS context, (f) structure, naming, API/error handling, and accessibility (§6–§16) are followed where applicable.

---

## Quick reference (MUST / MUST NOT)

| Area | MUST | MUST NOT |
|------|------|----------|
| Entry | `app-frontend/src/App.jsx` as root | react/react-dom in package.json; multiple roots |
| Backend call | `window.appnestClientFunctions.appBackend.invoke({ apiFunctionName, payload })`; handle `{ statusCode, body }` | fetch/axios to app backend; wrong param name |
| UI | Twigs only; Stack/Box layout; version `"*"`; verify names at twigs.surveysparrow.com | Raw HTML for controls; fixed versions like ^2.0.0; assume Alert/Spinner without verifying |
| UX | Responsive; mobile-first; SaaS "wow"; **§5** hierarchy (type, nav, dropdowns), spacing & states | Fixed widths; cluttered layouts; uniform font sizes; clipped unreadable menu text; Tailwind-as-primary UI |
| Structure | Clear folders (components, pages, hooks, services, utils); modular; index where helpful | Deep nesting; monolithic files |
| Naming | PascalCase components; camelCase `use*` hooks; kebab-case files; UPPER_SNAKE_CASE constants | Inconsistent or unclear names |
| API/errors | Separate invoke logic (services/hooks); loading + error states; user-friendly messages | Raw API errors to user; no loading/error handling |
| A11y | Semantic use of Twigs; keyboard nav; alt text; a11y best practices | Non-semantic or inaccessible custom UI when Twigs covers it |
