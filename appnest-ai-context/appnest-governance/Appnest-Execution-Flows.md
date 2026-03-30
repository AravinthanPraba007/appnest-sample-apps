# Appnest execution flows

How Appnest **runs** app code: the execution path from trigger to result, **principles** handlers must follow, and how **flows** are classified (triggers, operations, long-running work).

---

## Execution path

All Appnest apps follow this model:

**Trigger → Handler → SDK operations → ResultData**

A **trigger** starts a handler run. Trigger sources include:

- Event-based  
- Scheduled  
- Manual API invocation  
- File upload  
- Webhook  

An app may use **multiple** triggers.

---

## Principles

### Statelessness

All handlers **MUST** be stateless.

State must be persisted using:

- **`$db`**  
- External storage  
- Deterministic computation  

Global variables **MUST NOT** be used to maintain execution state.

### Deterministic execution

Apps must produce **consistent results** for identical inputs.

External API pushes must be **idempotent**.

### Separation of concerns

Apps must separate:

- Trigger logic  
- Processing logic  
- External integration logic  
- Progress tracking  

### Production-grade safety

All apps must be designed for:

- Timeout safety  
- Partial failure handling  
- Retry safety  
- Duplicate prevention  

No app should assume ideal runtime conditions. For outbound HTTP (`$fetch`), errors, and secrets, see **[Code-Review-and-AI-Generation-Checklist.md](Code-Review-and-AI-Generation-Checklist.md#external-api)** (External API standards). For scheduling and chaining, see **[Backend-Appnest-Functions.md](appnest-functions/Backend-Appnest-Functions.md)** (`$schedule`, `$next`).

---

## Operation capabilities

Apps are classified in part by what they **do** during execution (non-exhaustive):

- External API communication  
- File processing  
- Artifact generation (PDF/Excel, etc.)  
- Data migration  
- Long-running execution  
- Database usage (`$db`, etc.)  

---

## Long-running flows

An app is considered **long-running** if it:

- Processes **more than 500** records  
- Performs **bulk** migration  
- Requires **execution chaining**  
- Uses **scheduled** orchestration  

Long-running flows must follow **runtime safety** practices (timeouts, retries, idempotency, progress persistence). Use this document together with **[Code-Review-and-AI-Generation-Checklist.md](Code-Review-and-AI-Generation-Checklist.md)** (external API standards + full pre-ship checklist).
