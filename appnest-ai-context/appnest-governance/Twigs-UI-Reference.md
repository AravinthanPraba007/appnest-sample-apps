# Twigs UI reference (for code generation)

**Companion to [App-Frontend-Rules.md](App-Frontend-Rules.md)** — read that file first for mandatory rules (React entry, backend `invoke`, Twigs-only policy, responsive layout, SaaS look-and-feel, structure, and checklist). **This file** is the lookup for **Twigs `package.json` versions** and the **HTML → Twigs mapping table**.

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

## Responsive, SaaS polish, and consistency

Requirements and examples are in **[App-Frontend-Rules.md](App-Frontend-Rules.md)** (sections 3–5, 9, and the quick reference table). This reference does not repeat them.

- **All screens:** Twigs only—no mix of raw HTML controls on some screens and Twigs on others.
- **Exact component names and props:** Use the [Twigs documentation](https://twigs.surveysparrow.com/); verify exports before assuming names like `Alert` or `Spinner` exist.
