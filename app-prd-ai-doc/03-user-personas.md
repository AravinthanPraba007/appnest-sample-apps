# SurveySparrow Contact Export — User Personas

## Primary persona

| Attribute | Description |
|-----------|-------------|
| **Role** | SurveySparrow **admin** or **marketing ops** user who owns contact data quality and exports. |
| **Goal** | Quickly **find** the right contacts and **export a CSV** for sharing or downstream tools. |
| **Pain points** | Slow navigation at scale; difficulty exporting **only** a chosen subset; fear of exporting too much or stale copies. |
| **Context** | Works inside SurveySparrow daily; comfortable with app install but expects **minimal configuration** (API access already governed by org). |

## Secondary personas (if any)

- **Analyst / RevOps:** Needs a clean table and CSV for spreadsheets; cares about column consistency and predictable filters.
- *(Future)* **Developer:** May want webhooks or batch sync—not in v1.

## v1 focus

For v1 we are designing for: **the SurveySparrow admin/ops user** who needs a read-only list, filters, and CSV export. Secondary roles are documented for future phases.
