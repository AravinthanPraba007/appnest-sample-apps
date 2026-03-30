# Survey Response CSV Import — User Personas

## Primary persona

| Attribute | Description |
|-----------|-------------|
| **Role** | Survey administrator or insights owner (power user, not necessarily a developer) |
| **Goal** | Import many responses from a CSV into a specific SurveySparrow survey accurately and quickly |
| **Pain points** | Fear of breaking data; unclear API errors; no visibility into which rows failed; having to map columns mentally without validation |
| **Context** | Works inside SurveySparrow daily; may receive CSVs from HR, support, or another survey tool export |

## Secondary personas (if any)

| Role | Goal | v1 involvement |
|------|------|----------------|
| IT / security reviewer | Ensure credentials and data handling meet policy | Indirect: relies on AppNest installation_params and SurveySparrow API usage |
| Developer | Automate imports | v1 targets UI-first; automation/API-for-import could be Phase 2 |

## v1 focus

For v1 we are designing for: **the survey administrator (primary persona)**. Developer-only automation is documented as a future phase.
