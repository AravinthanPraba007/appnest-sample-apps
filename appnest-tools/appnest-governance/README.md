# Sample Appnest App — Documentation

Frontend and backend app on the **Appnest** framework. All documentation is managed here.

**Start here:** [APPNEST_DEVELOPER_GUIDE.md](APPNEST_DEVELOPER_GUIDE.md) — entry points and links to full docs.

---

## Appnest Governance

Standards and reference for Appnest apps: architecture, SDK usage, manifest rules, and integration standards. Use for code review, AI-assisted generation, and compliance.

## Document index

| Section | Document | Purpose |
|--------|----------|---------|
| **Architecture** | [01-Architecture-Principles.md](01-architecture/01-Architecture-Principles.md) | Execution model, statelessness, safety |
| | [02-Flow-Classification-Model.md](01-architecture/02-Flow-Classification-Model.md) | Trigger/operation types, long-running flows |
| | [03-Entry-Points-and-Implementation.md](01-architecture/03-Entry-Points-and-Implementation.md) | Entry points, backend/frontend how-to, Twigs UI libraries, project structure |
| **SDK** | [04-AppNest-SDK-Usage-Rules.md](02-sdk/04-AppNest-SDK-Usage-Rules.md) | $http, $db, $schedule, $file, ResultData rules |
| | [05-SDK-Reference.md](02-sdk/05-SDK-Reference.md) | Full SDK reference (import, $db, $http, $file, $next, $schedule) |
| | [06-Manifest-Rules.md](02-sdk/06-Manifest-Rules.md) | Manifest rules + full schema (code-generation) |
| | [07-Twigs-UI-Reference.md](02-sdk/07-Twigs-UI-Reference.md) | Twigs-only UI mapping (no raw HTML); use Stack, Box, Button, Select, Alert, Spinner, Table, etc. |
| | [08-Twigs-UI-Cursor-Rule.md](02-sdk/08-Twigs-UI-Cursor-Rule.md) | Canonical Twigs UI rule for Cursor / AI (install, Twigs-only, responsive, SaaS “wow”; .cursor/rules points here) |
| **Integration** | [07-External-API-Standards.md](03-integration-standards/07-External-API-Standards.md) | Idempotency, errors, rate limits, secrets |
| | [09-Code-Review-and-AI-Generation-Checklist.md](03-integration-standards/09-Code-Review-and-AI-Generation-Checklist.md) | Review and AI-generation checklist |
