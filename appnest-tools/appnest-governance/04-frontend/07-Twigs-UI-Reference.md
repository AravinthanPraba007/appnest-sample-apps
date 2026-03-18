# Twigs UI reference (for code generation)

Use **`@sparrowengg/twigs-react`** and **`@sparrowengg/twigs-react-icons`** for all Appnest app UI. Use these components **instead of** raw HTML so the app has a consistent, SaaS-style look.

**Rule:** For every user-facing control or block, use the Twigs component below—not `<button>`, `<input>`, `<select>`, `<table>`, or custom-styled divs.

---

## Package versions in app-frontend/package.json

When adding Twigs to **`app-frontend/package.json`**, use **`"*"`** as the version so npm installs the **latest available** from the registry. Do **not** pin to a specific version (e.g. `^2.0.0`) that may not exist—that causes `npm install` to fail with "No matching version found".

**Correct (use latest):**
```json
"dependencies": {
  "@sparrowengg/twigs-react": "*",
  "@sparrowengg/twigs-react-icons": "*"
}
```

**Avoid:** Pinning to a version that might not be published (e.g. `"^2.0.0"`). If you need a specific version, use one that exists on the registry you use.

---

## Mapping: use Twigs instead of raw HTML

| UI need | Use Twigs (from @sparrowengg/twigs-react) | Do NOT use |
|---------|-------------------------------------------|------------|
| **Layout / structure** | **Box**, **Stack** (with `gap`, `direction`, `padding` props) | Raw `<div>` with custom flex/CSS for layout |
| **Spacing** | Stack/Box `gap`, `padding` (e.g. `padding="xl"`) | One-off `marginBottom: 8`, `#f8d7da`, custom margin/padding in style |
| **Buttons** | **Button** (and variants) | `<button>`, `.btn`, `.btn-primary` |
| **Text / labels** | **Text** | Raw `<p>`, `<label>`, `<span>` for visible text |
| **Form: dropdown** | **Select** | `<select>` |
| **Form: text field** | **Input** | `<input type="text">` |
| **Form: other inputs** | Twigs **Input**, **Checkbox**, **Radio** (as per Twigs API) | `<input>`, raw form elements |
| **Error / warning message** | **Alert** (or Twigs equivalent) | `<div class="alert-error">`, custom red divs |
| **Loading** | **Spinner** (or Twigs loading component) | Custom loading div or raw HTML |
| **Data table** | **Table** (if available in Twigs) or Twigs list components | Raw `<table>`, `<tr>`, `<td>` |
| **Cards / containers** | **Box**, Twigs card component (if any) | Raw `<div>` with custom border/background |
| **Icons** | **@sparrowengg/twigs-react-icons** | Raw SVG or other icon libs |

---

## Layout: Stack and Box

- **Stack** — vertical or horizontal layout with consistent `gap`. Use for grouping and spacing between elements.
- **Box** — container with padding/border. Use for sections and cards.
- Prefer **Twigs design tokens** (e.g. spacing scale, colors) over hardcoded values in `style` or CSS.

---

## Responsive and SaaS product

- **Responsive:** Use **responsive** Twigs components and layout so the app works on **desktop, tablet, and mobile**. Prefer Stack/Box with responsive props (e.g. direction or breakpoints) where Twigs supports them; avoid fixed pixel widths that break on small screens. The app should adapt to the viewport and remain usable at all sizes.
- **SaaS "wow" UI:** The app is **embedded in a SaaS product** and will be judged against that context. Deliver a **polished, professional** look and feel: clear visual hierarchy, readable typography, coherent spacing, and interactions that feel native to the host. Aim for a "wow" experience—consistent, modern, and high-quality—so the app does not feel like a disconnected or dated widget.

---

## Consistency

- **All screens** must use only Twigs (and twigs-react-icons). No mix of Twigs on one screen and raw HTML on another.
- **Do not** rely on custom classes like `.btn`, `.alert`, `.run-list` in App.css when Twigs provides equivalent components. Use Twigs everywhere so the app looks like a single design system.
- For the exact component names and props, refer to the **Twigs** package documentation; this reference is for mapping "what to use instead of raw HTML" when generating code.
