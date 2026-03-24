# PRD: SurveySparrow Response Viewer

This folder contains the filled Product Requirements Document for **SurveySparrow Response Viewer**, produced using the [prd-generation-workflow](../../appnest-tools/appnest-prd-generator/prd-generation-workflow.md).

## Documents

| # | File | Description |
|---|------|-------------|
| 01 | [01-overview.md](01-overview.md) | Product name, vision, scope, success criteria |
| 02 | [02-problem-statement.md](02-problem-statement.md) | Problem, users affected, desired outcome |
| 03 | [03-user-personas.md](03-user-personas.md) | Primary/secondary personas, v1 focus |
| 04 | [04-user-flows.md](04-user-flows.md) | Survey list/sync, response viewer, backup download flows |
| 05 | [05-feature-requirements.md](05-feature-requirements.md) | Core features, configuration, UI surface, out of scope |
| 06 | [06-technical-architecture.md](06-technical-architecture.md) | AppNest alignment, backend/frontend layout, security |
| 07 | [07-data-model.md](07-data-model.md) | $db entities, $file (backups), storage keys |
| 08 | [08-api-contracts.md](08-api-contracts.md) | Backend API functions, installation params, whitelisted domains, $schedule |
| 09 | [09-non-functional-requirements.md](09-non-functional-requirements.md) | Performance, error handling, external API, security |
| 10 | [10-milestones.md](10-milestones.md) | MVP scope, Phase 1 milestones, deliverables |
| 11 | [11-ui-screens.md](11-ui-screens.md) | Survey List, Response Viewer, Backup Files (Twigs-only UI) |

## Implementation note

When implementing the app, use the manifest schema from `appnest-tools/appnest-governance/02-sdk/06-Manifest-Rules.md`: installation params are under **`installation_parameters`** (not `installation_params`) and all app config under **`product_config.<product>`** (e.g. `product_config.surveysparrow`).
