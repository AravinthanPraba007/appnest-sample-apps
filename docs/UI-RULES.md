# App frontend — UI rules and guidelines

Use this document in **future development** to keep the SurveySparrow Response Viewer (and any app-frontend) UI consistent, readable, and maintainable.

**How to use:** Before changing UI in `app-frontend`, read the rules below. For Cursor/IDE: you can add a rule that references this file (e.g. in `.cursor/rules/app-frontend-ui.mdc`) so AI and developers are reminded to follow it.

---

## 1. Layout and structure

- **Root:** Wrap the app in a single root element with class `app-root app-shell` (see `App.jsx`). The shell provides padding and background.
- **Main content:** Place all page content inside `<main className="app-container">`. The container is max-width (e.g. `56rem`) and centered so content doesn’t stretch on large screens.
- **Spacing:** Prefer the spacing scale from `App.css` (`--app-space-*`, `--app-section-gap`) instead of arbitrary pixel values. Use Twigs `gap` and `padding` props where you use Twigs layout components.

**Rules:**
- Do not add full-width content that ignores `app-container` unless it’s a deliberate full-bleed (e.g. a banner).
- Do not use inline `style` for layout (padding, max-width, flex). Use CSS classes and variables from `App.css`.

---

## 2. CSS variables and classes

- **Variables** in `App.css` (`:root` and `.app-root`): use them for color, spacing, and radius so the app can be themed (e.g. dark host) from one place.
- **Shared classes:** Prefer existing classes before adding new ones:
  - `.app-card` — cards (survey row, response card, backup row).
  - `.app-error` — error message block.
  - `.app-header-row` — title + actions in one row.
  - `.app-actions` — button group.
  - `.app-subtitle` — muted text under a heading.
  - `.app-empty` — empty state message.

**Rules:**
- New one-off layout or color should use variables (e.g. `var(--app-space-lg)`) or a new reusable class in `App.css`, not inline styles or new random class names in components.
- Keep component-specific classes (e.g. `.survey-list__card`) in `App.css` or a dedicated CSS file, not scattered in JSX.

---

## 3. Twigs usage

- Use **Twigs** (`@sparrowengg/twigs-react`) for buttons, text, loaders, and layout (Box, Stack). Use Twigs design tokens (e.g. `gap`, `padding`) where possible.
- Avoid passing non-DOM props (e.g. `borderRadius`, `backgroundColor`) to Twigs components that forward to native elements. Use the `style` prop with standard CSS values or Twigs’ documented props.

**Rules:**
- Do not replace Twigs with raw HTML for buttons, inputs, or cards unless Twigs is unavailable or doesn’t support the pattern.
- Prefer Twigs `Stack`/`Box` for layout and spacing; use `App.css` for app-level layout (shell, container, section gap).

---

## 4. Responsiveness

- **Header row:** Use flex with `flex-wrap` so “title + actions” wrap on small screens (e.g. `.app-header-row`).
- **Padding:** Reduce shell/container padding on small viewports (see `@media (max-width: 640px)` in `App.css`).
- **Touch targets:** Keep buttons and links large enough on mobile (min ~44px tap area if possible).

**Rules:**
- Test at 320px and 768px width. Avoid fixed pixel widths that break layout on small screens.
- Prefer `max-width` on the main container and let content reflow.

---

## 5. Accessibility and semantics

- Use semantic HTML where Twigs allows (e.g. headings, `<main>`, `role="alert"` for errors).
- Ensure sufficient contrast for text (e.g. muted text on background) and error states.

**Rules:**
- Do not remove or override focus styles without providing a visible alternative.
- Error messages should be in a container with `role="alert"` or an equivalent.

---

## 6. Consistency checklist (before merging UI changes)

- [ ] New screens use `app-container` (or equivalent) so content is constrained and centered.
- [ ] Spacing uses `--app-space-*` or Twigs spacing props, not one-off `margin`/`padding` values.
- [ ] Cards and list items use a consistent style (e.g. `.app-card` or the same border/radius/background).
- [ ] Error and empty states use `.app-error` and `.app-empty` (or the same visual pattern).
- [ ] Header + actions use a single row that wraps (e.g. `.app-header-row` + `.app-actions`).
- [ ] No layout or theme values hardcoded in JSX; they live in CSS variables or shared classes.
- [ ] Responsive behavior checked at narrow and medium widths.

---

## 7. Where to put new styles

- **Global / layout / theme:** `app-frontend/src/css/App.css` (variables, app-shell, app-container, shared classes).
- **Screen-specific:** Add a section in `App.css` or a new file under `src/css/` (e.g. `SurveyList.css`) and import in the component. Prefer one place (App.css) for small apps.
- **Twigs overrides:** Prefer Twigs props. If you must override Twigs, use a wrapper class in App.css rather than inline style.

---

## Summary

- Use **app-shell** and **app-container** for structure; use **CSS variables** and **shared classes** from `App.css` for look and feel.
- Prefer **Twigs** for components and layout; avoid non-DOM props and raw HTML for controls.
- Keep **responsive** and **accessible** behavior; run the **consistency checklist** before merging UI work.
