---
name: marsai:production-readiness-audit
description: Comprehensive MarsAI-standards-aligned 44-dimension production readiness audit. Detects project stack, loads MarsAI standards via WebFetch, and runs in batches of 10 explorers appending incrementally to a single report file. Categories - Structure (pagination, errors, routes, bootstrap, runtime, core deps, naming, domain modeling, nil-safety, api-versioning, resource-leaks), Security (auth, IDOR, SQL, validation, secret-scanning, data-encryption, multi-tenant, rate-limiting, cors), Operations (telemetry, health, config, connections, logging, resilience, graceful-degradation), Quality (idempotency, docs, debt, testing, dependencies, performance, concurrency, migrations, linting, caching), Infrastructure (containers, hardening, cicd, async, makefile, license). Produces scored report (0-430, max 440 with multi-tenant) with severity ratings and standards cross-reference.

trigger: |
  - Preparing a service for production deployment
  - Conducting periodic security or quality review of a codebase
  - Onboarding to assess codebase health and maturity
  - Evaluating technical debt before a major release
  - Validating compliance with MarsAI engineering standards

skip_when: |
  - Project is a prototype or throwaway proof-of-concept not heading to production
  - Codebase is a library or SDK with no deployable service component
  - User only needs a single-dimension check (use targeted review instead)
---

# Production Readiness Audit

## Modularization Note

> **⚠️ CANDIDATE FOR MODULARIZATION**: This skill file exceeds 6,000 lines and is a candidate for splitting into sub-skills. Future work MUST consider:
>
> 1. **Category-based sub-skills**: Split into 5 category-specific skills (Structure, Security, Operations, Quality, Infrastructure)
> 2. **Explorer templates extraction**: Move the 44 dimension-specific explorer prompts to separate template files
> 3. **Scoring logic separation**: Extract scoring and weighting logic to a dedicated calculation module
> 4. **Report generation**: Separate report templating from audit logic
>
> MUST NOT add new dimensions without first implementing modularization to prevent further bloat.

A comprehensive, multi-agent audit system that evaluates codebase production readiness across **44 dimensions in 5 categories**, aligned with **MarsAI development standards** as the source of truth. This skill detects the project stack, loads relevant standards via WebFetch, and runs explorer agents in **batches of 10**, appending results incrementally to a single report file to prevent context bloat while maintaining thorough coverage.

## When This Skill Activates

Use this skill when:

- Preparing for production deployment
- Conducting periodic security/quality reviews
- Onboarding to understand codebase health
- Evaluating technical debt before major releases
- Validating compliance with MarsAI engineering standards
- Assessing a codebase's maturity level against MarsAI standards

## Audit Dimensions

### Category A: Code Structure & Patterns (11 dimensions)

| # | Dimension | Focus Area |
|---|-----------|------------|
| 1 | **Pagination Standards** | Cursor vs offset pagination, limit validation, response structure |
| 2 | **Error Framework** | Domain errors, error codes convention, error handling, error propagation |
| 3 | **Route Organization** | Hexagonal structure, handler construction, route registration |
| 4 | **Bootstrap & Initialization** | Staged startup, cleanup handlers, graceful shutdown |
| 5 | **Runtime Safety** | Panic recovery, production mode handling |
| 28 | **Core Dependencies & Frameworks** | Framework version minimums, no custom utility duplication |
| 29 | **Naming Conventions** | snake_case DB, camelCase JSON body, snake_case query params |
| 30 | **Domain Modeling** | ToEntity/FromEntity, always-valid constructors, private fields + getters |
| 35 | **Nil/Null Safety** | Type assertions, nil map/pointer/channel, null guards, API response consistency |
| 38 | **API Versioning** | Versioning strategy, backward compatibility, deprecation, sunset headers |
| 42 | **Resource Leak Prevention** | Unclosed handles, connection leaks, context propagation, cleanup ordering |

### Category B: Security & Access Control (9 base + 1 conditional)

| # | Dimension | Focus Area |
|---|-----------|------------|
| 6 | **Auth Protection** | Route protection, JWT validation, tenant extraction, Access Manager |
| 7 | **IDOR & Access Control** | Ownership verification, tenant isolation, resource authorization |
| 8 | **SQL Safety** | Parameterized queries, identifier escaping, injection prevention |
| 9 | **Input Validation** | Request body validation, query params, VO validation |
| 37 | **Secret Scanning** | Hardcoded credentials, API keys, private keys, connection strings |
| 41 | **Data Encryption at Rest** | Field-level encryption, key management, password hashing, encrypted backups |
| 43 | **Rate Limiting** | Three-tier strategy (Global/Export/Dispatch), Redis-backed storage, key generation, production safety |
| 44 | **CORS Configuration** | Origin validation, middleware ordering, production wildcard prohibition, Helmet integration |
| 33 | **Multi-Tenant Patterns** *(CONDITIONAL)* | Tenant Manager, TenantMiddleware with WithPG/WithMB, JWT tenantId, module-specific connections |

### Category C: Operational Readiness (7 dimensions)

| # | Dimension | Focus Area |
|---|-----------|------------|
| 11 | **Telemetry & Observability** | OpenTelemetry integration, tracing, metrics |
| 12 | **Health Checks** | Liveness/readiness probes, dependency health, degraded status |
| 13 | **Configuration Management** | Env var validation, production constraints, secrets handling |
| 14 | **Connection Management** | DB/Redis pool settings, timeouts, replica support |
| 15 | **Logging & PII Safety** | Structured logging, sensitive data protection, log levels |
| 36 | **Resilience Patterns** | Circuit breakers, retry with backoff, timeout cascading, bulkhead isolation |
| 39 | **Graceful Degradation** | Fallback behavior, cached responses, feature flags, partial responses |

### Category D: Quality & Maintainability (10 dimensions)

| # | Dimension | Focus Area |
|---|-----------|------------|
| 16 | **Idempotency** | Idempotency keys, retry safety, duplicate prevention |
| 17 | **API Documentation** | Swaggo/OpenAPI annotations, response schemas, examples |
| 18 | **Technical Debt** | TODOs, FIXMEs, deprecated code, incomplete implementations |
| 19 | **Testing Coverage** | Co-located tests, mocking, parameterized tests, integration tests |
| 20 | **Dependency Management** | Pinned versions, CVE scanning, deprecated packages |
| 21 | **Performance Patterns** | N+1 queries, SELECT *, slice pre-allocation, batching |
| 22 | **Concurrency Safety** | Race conditions, async leaks, unbounded concurrency, worker pools |
| 23 | **Migration Safety** | Up/down pairs, CONCURRENTLY indexes, NOT NULL defaults |
| 31 | **Linting & Code Quality** | Import ordering, magic numbers, linter config |
| 40 | **Caching Patterns** | Cache invalidation, TTL management, stampede prevention, tenant-scoped keys |

### Category E: Infrastructure & Hardening (6 dimensions)

| # | Dimension | Focus Area |
|---|-----------|------------|
| 24 | **Container Security** | Dockerfile best practices, non-root user, multi-stage, image pinning |
| 25 | **HTTP Hardening** | Security headers (HSTS, CSP), cookie attributes, server banner |
| 26 | **CI/CD Pipeline** | Pipeline definitions, automated tests, security scanning |
| 27 | **Async Reliability** | DLQs, retry policies, consumer group usage, message durability |
| 32 | **Makefile & Dev Tooling** | 17+ required Makefile commands, dev workflow automation |
| 34 | **License Headers** | Copyright headers on all source files |

## Execution Protocol

This skill runs **up to 44 explorer agents in 5 batches of up to 10**, writing results incrementally to a single report file. Before dispatch, it detects the project stack and loads MarsAI standards as the source of truth.

### Output File

All results are appended to: `docs/audits/production-readiness-{YYYY-MM-DDTHH:MM:SS}.md`

**Timestamp format:** `YYYY-MM-DDTHH:MM:SS` using local time (e.g., `2026-02-07T20:45:30`). MUST use local time from system clock, not UTC.

### Batch Execution Schedule

| Batch | Agents | Category Focus |
|-------|--------|----------------|
| 1 | 1-10 | Structure (Pagination, Errors, Routes, Bootstrap, Runtime) + Security (Auth, IDOR, SQL, Input) + Operations (Telemetry) |
| 2 | 12-20 | Operations (Health, Config, Connections, Logging) + Quality (Idempotency, API Docs, Tech Debt, Testing, Dependencies) |
| 3 | 21-30 | Quality (Performance, Concurrency, Migrations) + Infrastructure (Containers, Hardening, CI/CD, Async) + Structure (Core Deps, Naming, Domain Modeling) |
| 4 | 31-42 | Quality (Linting, Caching) + Infrastructure (Makefile, Multi-Tenant*, License) + New Dimensions (Resilience, Secret Scanning, API Versioning, Graceful Degradation, Data Encryption, Resource Leaks) |
| 5 | 43-44 + Summary | Security (Rate Limiting, CORS Configuration) + Final Summary (43 base + 1 conditional) |

### Step 0: Stack Detection

Before running any explorers, detect the project stack to determine which MarsAI standards to load.

**Detection via Glob:**

| Check | Flag | Standards to Load |
|-------|------|-------------------|
| `**/package.json` + React/Next.js deps | FRONTEND=true | Language-specific standards |
| `**/package.json` + Express/Fastify/NestJS deps | TS_BACKEND=true | Language-specific standards |
| `**/Dockerfile*` exists | DOCKER=true | devops.md |
| `**/Makefile` exists | MAKEFILE=true | devops.md → Makefile Standards |
| `**/LICENSE*` exists | LICENSE=true | Activates dimension 34 |
| `MULTI_TENANT` env var in config/env files (`.env*`, `docker-compose*`, config files) | MULTI_TENANT=true | multi-tenant.md |

**Detection Logic:**
```
Glob("**/package.json") → Read for React/Next.js → if found: FRONTEND=true
Glob("**/package.json") → Read for Express/Fastify/NestJS → if found: TS_BACKEND=true
Glob("**/Dockerfile*") → if found: DOCKER=true
Glob("**/Makefile") → if found: MAKEFILE=true
Glob("**/LICENSE*") → if found: LICENSE=true
Grep("MULTI_TENANT") → if found in env/config files: MULTI_TENANT=true
```

**Stack determines which standards are loaded in Step 0.5.**

### Step 0.5: Load MarsAI Standards

Based on detected stack, load MarsAI development standards via WebFetch from the canonical source of truth. Store fetched content for injection into explorer prompts.

**WebFetch URL Map:**

Based on detected stack, WebFetch the relevant standards modules from `dev-team/docs/standards/`. The exact modules depend on the project's language and framework.

**Stack-specific standards loading:** Load the appropriate standards modules based on the detected stack flags (GO, TS_BACKEND, FRONTEND, etc.). The standards files are located in the `dev-team/docs/standards/` directory of the MarsAI repository.

**Always** WebFetch (stack-independent):

| Module | Variable | URL |
|--------|----------|-----|
| devops.md | `standards_devops` | `https://raw.githubusercontent.com/V4-Company/marsai/main/dev-team/docs/standards/devops.md` |
| sre.md | `standards_sre` | `https://raw.githubusercontent.com/V4-Company/marsai/main/dev-team/docs/standards/sre.md` |

**Fallback:** If any WebFetch fails, note the failure in the audit report and proceed with existing generic patterns for that dimension. Do not abort the audit.

**Standards Injection Pattern:**
Each explorer prompt receives relevant standards content between `---BEGIN STANDARDS---` and `---END STANDARDS---` markers. The explorer uses these as the authoritative reference for its audit dimension.

### Step 1: Initialize Report File

```markdown
Write to docs/audits/production-readiness-{YYYY-MM-DDTHH:MM:SS}.md:

# Production Readiness Audit Report

**Date:** {YYYY-MM-DDTHH:MM:SS}
**Codebase:** {project-name}
**Auditor:** Claude Code (Production Readiness Skill v3.0)
**Status:** In Progress...

## Audit Configuration

| Property | Value |
|----------|-------|
| **Detected Stack** | {TypeScript / Frontend / Mixed} |
| **Standards Loaded** | {list of loaded standards files} |
| **Active Dimensions** | {43 base + 1 conditional (max 44)} |
| **Max Possible Score** | {dynamic_max: 430 or 440} |
| **Conditional: Multi-Tenant** | {Active / Inactive} |
---
```

### Step 2: Execute Batch 1 (Agents 1-10)

Launch 10 explorers in parallel:
```
Task(subagent_type="Explore", prompt="<Agent 1: Pagination Standards>")
Task(subagent_type="Explore", prompt="<Agent 2: Error Framework>")
Task(subagent_type="Explore", prompt="<Agent 3: Route Organization>")
Task(subagent_type="Explore", prompt="<Agent 4: Bootstrap & Init>")
Task(subagent_type="Explore", prompt="<Agent 5: Runtime Safety>")
Task(subagent_type="Explore", prompt="<Agent 6: Auth Protection>")
Task(subagent_type="Explore", prompt="<Agent 7: IDOR Protection>")
Task(subagent_type="Explore", prompt="<Agent 8: SQL Safety>")
Task(subagent_type="Explore", prompt="<Agent 9: Input Validation>")
Task(subagent_type="Explore", prompt="<Agent 10: Telemetry & Observability>")
```

**After completion:** Append results to the report file.

### Step 3: Execute Batch 2 (Agents 12-20)

Launch 9 explorers in parallel:
```
Task(subagent_type="Explore", prompt="<Agent 12: Health Checks>")
Task(subagent_type="Explore", prompt="<Agent 13: Configuration Management>")
Task(subagent_type="Explore", prompt="<Agent 14: Connection Management>")
Task(subagent_type="Explore", prompt="<Agent 15: Logging & PII Safety>")
Task(subagent_type="Explore", prompt="<Agent 16: Idempotency>")
Task(subagent_type="Explore", prompt="<Agent 17: API Documentation>")
Task(subagent_type="Explore", prompt="<Agent 18: Technical Debt>")
Task(subagent_type="Explore", prompt="<Agent 19: Testing Coverage>")
Task(subagent_type="Explore", prompt="<Agent 20: Dependency Management>")
```

**After completion:** Append results to the report file.

### Step 4: Execute Batch 3 (Agents 21-30)

Launch 10 explorers in parallel:
```
Task(subagent_type="Explore", prompt="<Agent 21: Performance Patterns>")
Task(subagent_type="Explore", prompt="<Agent 22: Concurrency Safety>")
Task(subagent_type="Explore", prompt="<Agent 23: Migration Safety>")
Task(subagent_type="Explore", prompt="<Agent 24: Container Security>")
Task(subagent_type="Explore", prompt="<Agent 25: HTTP Hardening>")
Task(subagent_type="Explore", prompt="<Agent 26: CI/CD Pipeline>")
Task(subagent_type="Explore", prompt="<Agent 27: Async Reliability>")
Task(subagent_type="Explore", prompt="<Agent 28: Core Dependencies & Frameworks>")
Task(subagent_type="Explore", prompt="<Agent 29: Naming Conventions>")
Task(subagent_type="Explore", prompt="<Agent 30: Domain Modeling>")
```

**After completion:** Append results to the report file.

### Step 5: Execute Batch 4 (Agents 31-42)

Launch remaining explorers:
```
Task(subagent_type="Explore", prompt="<Agent 31: Linting & Code Quality>")
Task(subagent_type="Explore", prompt="<Agent 32: Makefile & Dev Tooling>")
# CONDITIONAL: Only if MULTI_TENANT=true
Task(subagent_type="Explore", prompt="<Agent 33: Multi-Tenant Patterns>")
Task(subagent_type="Explore", prompt="<Agent 34: License Headers>")
Task(subagent_type="Explore", prompt="<Agent 35: Nil/Null Safety>")
Task(subagent_type="Explore", prompt="<Agent 36: Resilience Patterns>")
Task(subagent_type="Explore", prompt="<Agent 37: Secret Scanning>")
Task(subagent_type="Explore", prompt="<Agent 38: API Versioning>")
Task(subagent_type="Explore", prompt="<Agent 39: Graceful Degradation>")
Task(subagent_type="Explore", prompt="<Agent 40: Caching Patterns>")
Task(subagent_type="Explore", prompt="<Agent 41: Data Encryption at Rest>")
Task(subagent_type="Explore", prompt="<Agent 42: Resource Leak Prevention>")
```

**After completion:** Append results to the report file.

### Step 6: Execute Batch 5 (Agents 43-44 + Summary)

Launch security middleware explorers:
```
Task(subagent_type="Explore", prompt="<Agent 43: Rate Limiting>")
Task(subagent_type="Explore", prompt="<Agent 44: CORS Configuration>")
```

**After completion:** Append results to the report file.

### Step 7: Finalize Report

1. Read the complete report file
2. Calculate scores for each dimension
3. Generate Executive Summary with totals
4. Prepend Executive Summary to the report
5. Add remediation priorities
6. Add Standards Compliance Cross-Reference table
7. Present verbal summary to user

---

## Explorer Agent Prompts

### Agent 1: Pagination Standards Auditor

```prompt
Audit pagination implementation across the codebase for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Pagination Patterns" section from api-patterns.md}
---END STANDARDS---

**Key Concept: TWO valid pagination strategies:**
- **Offset** for low-volume admin entities
- **Cursor** for high-volume transaction entities

**Search Patterns:**
- Files: `**/pagination*.ts`, `**/handlers.ts`, `**/dto.ts`, `**/httputils.ts`, `**/cursor.ts`
- Keywords: `limit`, `offset`, `cursor`, `page`, `nextCursor`, `prevCursor`, `setCursor`, `setItems`
- Standards-specific: `CursorPagination`, `Pagination`, `validateParameters`, `QueryHeader`, `MAX_PAGINATION_LIMIT`

**Reference Implementations (GOOD):**

Offset mode (admin entities):
```typescript
// Handler sets page field — indicates offset mode
const pagination = new Pagination({
  limit: headerParams.limit,
  page: headerParams.page,
  sortOrder: headerParams.sortOrder,
});
const items = await this.query.getAllOrganizations(ctx, headerParams);
pagination.setItems(items);
return res.status(200).json(pagination);

// Repository uses OFFSET = (page - 1) * limit
query.limit(filter.limit).offset((filter.page - 1) * filter.limit);
```

Cursor mode (transaction entities):
```typescript
// Handler does NOT set page — indicates cursor mode
const pagination = new Pagination({
  limit: headerParams.limit,
  sortOrder: headerParams.sortOrder,
});
const { items, cursor } = await this.query.getAllTransactions(ctx, orgID, ledgerID, headerParams);
pagination.setItems(items);
pagination.setCursor(cursor.next, cursor.prev);
return res.status(200).json(pagination);
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Consistent pagination response structure matching MarsAI standards across all list endpoints
2. (HARD GATE) Maximum limit enforcement via `ValidateParameters` (MAX_PAGINATION_LIMIT, default 100)
3. Correct strategy per entity type: offset for admin entities, cursor for transaction entities
4. No mixing of both strategies in the same endpoint (page + cursor in same response is FORBIDDEN)
5. Proper error handling for invalid pagination params
6. Default values when params missing
7. Response field names match MarsAI API conventions (camelCase JSON)

**Severity Ratings:**
- CRITICAL: No limit validation (allows unlimited queries)
- CRITICAL: HARD GATE violation per MarsAI standards — pagination response structure missing entirely
- HIGH: Inconsistent pagination structures across endpoints
- HIGH: Missing `ValidateParameters` call on list endpoints
- MEDIUM: Using offset pagination on high-volume transaction tables
- MEDIUM: Mixing both strategies in the same endpoint
- LOW: Using cursor where offset would suffice for admin entities

**Output Format:**
```
## Pagination Audit Findings

### Summary
- Total list endpoints: X
- Using cursor pagination: Y
- Using offset pagination: Z
- Missing pagination entirely: W
- Missing limit validation: N

### Strategy Mapping
| Endpoint | Entity Type | Expected Strategy | Actual Strategy | Match |
|----------|-------------|-------------------|-----------------|-------|

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 2: Error Framework Auditor

```prompt
Audit error handling framework usage for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Error Codes Convention" and "Error Handling" sections from domain.md}
---END STANDARDS---

**Search Patterns:**
- Files: `**/error*.ts`, `**/handlers.ts`, `**/exceptions/*.ts`
- Keywords: `throw`, `catch`, `Error`, `HttpException`, `NotFoundException`
- Also search: `process.exit`, `unhandledRejection`
- Standards-specific: `DomainError`, `ErrorResponse`, `HttpException`

**Reference Implementation (GOOD):**
```typescript
// Validate with explicit checks and throw typed errors (no process.exit)
if (!config) {
  throw new ValidationError('config is required');
}

// Domain error types
class NotFoundError extends Error {
  constructor(message = 'resource not found') { super(message); this.name = 'NotFoundError'; }
}
class InvalidInputError extends Error {
  constructor(message = 'invalid input') { super(message); this.name = 'InvalidInputError'; }
}

// Error mapping in handlers
if (err instanceof NotFoundError) {
  return res.status(404).json({ error: 'resource not found' });
}
```

**Reference Implementation (BAD):**
```typescript
// BAD: process.exit in production code
if (!config) {
  process.exit(1); // BAD: Throw error instead
}

// BAD: Swallowing errors
const result = await doSomething().catch(() => null); // BAD: Ignoring error

// BAD: Generic error messages
throw new Error('error'); // BAD: Not descriptive
```

**Reference Implementation (GOOD — RFC 7807 Error Responses):**
```typescript
// RFC 7807 Problem Details compliant error response
interface ProblemDetails {
  type: string;       // URI reference identifying the problem type
  title: string;      // Short human-readable summary
  status: number;     // HTTP status code
  detail: string;     // Human-readable explanation specific to this occurrence
  instance?: string;  // URI reference for the specific occurrence
  code: string;       // Machine-readable error code for programmatic handling
}

// Consistent error response factory
function newProblemResponse(res: Response, status: number, errCode: string, detail: string) {
  return res.status(status).json({
    type: `https://api.example.com/errors/${errCode}`,
    title: getStatusText(status),
    status,
    detail,
    instance: res.req.path,
    code: errCode,
  });
}

// Handler usage — consistent across ALL endpoints
async function create(req: Request, res: Response) {
  try {
    // ...
  } catch (err) {
    if (err instanceof NotFoundError) {
      return newProblemResponse(res, 404, 'RESOURCE_NOT_FOUND', 'The requested resource does not exist');
    }
    if (err instanceof InvalidInputError) {
      return newProblemResponse(res, 422, 'VALIDATION_FAILED', err.message);
    }
    return newProblemResponse(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
}

// OpenAPI annotation with error response schema documented
// @ApiResponse({ status: 404, type: ProblemDetails, description: 'Resource not found' })
// @ApiResponse({ status: 422, type: ProblemDetails, description: 'Validation failed' })
// @ApiResponse({ status: 500, type: ProblemDetails, description: 'Internal server error' })
```

**Reference Implementation (BAD — Inconsistent Error Responses):**
```typescript
// BAD: Inconsistent error response formats across endpoints
// Handler A returns:
return res.status(400).json({ error: 'invalid input' });

// Handler B returns a different structure:
return res.status(400).json({ message: 'invalid input', code: 400 });

// Handler C returns yet another structure:
return res.status(400).json({ errors: ['field X is required'] });

// BAD: Free-text error messages only (no machine-readable codes)
return res.status(422).json({ error: 'The email field is required and must be valid' });
// Client cannot programmatically distinguish error types — must parse human text

// BAD: No error response schema in OpenAPI decorators
// @ApiResponse({ status: 400, description: 'Bad request' }) // No response body schema defined
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Explicit nil checks with error returns instead of panic for validation per MarsAI standards
2. (HARD GATE) Named error variables (sentinel errors) per module following MarsAI error codes convention
3. (HARD GATE) No process.exit() or unhandled exceptions in production code
4. Proper error wrapping with %w
5. errors.Is/errors.As for error matching
6. No swallowed errors (_, err := ignored)
7. HTTP error responses follow MarsAI ErrorResponse structure from domain.md
8. RFC 7807 Problem Details format compliance — error responses MUST include: `type`, `title`, `status`, `detail`, `instance` fields
9. Consistent error response schema across all endpoints — every endpoint MUST return the same JSON error structure (no mixed formats)
10. Machine-readable error codes for programmatic client consumption — every error response MUST include a stable, enumerated `code` field (not free-text messages)
11. Error response examples documented in API annotations (Swaggo `@Failure` tags with response schema)

**Severity Ratings:**
- CRITICAL: process.exit() or unhandled exceptions in production code paths (HARD GATE violation per MarsAI standards)
- CRITICAL: Swallowed errors in critical paths
- HIGH: Generic error messages without context
- HIGH: Error response format does not match MarsAI standards
- HIGH: Inconsistent error response format across endpoints (some return `{"error": "msg"}`, others `{"message": "msg", "code": "X"}`)
- MEDIUM: No RFC 7807 Problem Details compliance (error responses lack `type`, `title`, `status`, `detail`, `instance` structure)
- MEDIUM: Error codes not machine-readable (free-text error messages only, no stable enumerated codes for programmatic consumption)
- MEDIUM: Inconsistent error types across modules
- LOW: Missing error wrapping context
- LOW: Missing error response examples in API documentation (Swaggo `@Failure` annotations lack response body schema)

**Output Format:**
```
## Error Framework Audit Findings

### Summary
- Nil checks with error returns: X
- Panic calls in production: Y
- Swallowed errors: Z

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 3: Route Organization Auditor

```prompt
Audit route organization and handler structure for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Architecture Patterns" and "Directory Structure" sections from architecture.md}
---END STANDARDS---

**Search Patterns:**
- Files: `**/routes.ts`, `**/handlers.ts`, `**/controllers/*.ts`, `**/modules/*.ts`
- Keywords: `Router`, `Controller`, `@Get`, `@Post`, `app.use`, `router.get`
- Standards-specific: `modules/{module}/`, `hexagonal`, `ports`, `adapters`

**Reference Implementation (GOOD):**
```typescript
// Centralized route registration
function registerRoutes(router: Router, handler: Handler): void {
  if (!handler) {
    throw new Error('handler is required');
  }
  router.post('/v1/resources', authMiddleware('resource', 'create'), handler.create);
  router.get('/v1/resources', authMiddleware('resource', 'read'), handler.list);
  router.get('/v1/resources/:id', authMiddleware('resource', 'read'), handler.get);
}

// Handler constructor with validation
class Handler {
  constructor(private readonly deps: Dependencies) {
    if (!deps.repository) {
      throw new Error('repository dependency is required');
    }
  }
}
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Hexagonal structure: `modules/{module}/adapters/http/` per architecture.md
2. (HARD GATE) Centralized route registration per module
3. Handler constructors validate all dependencies
4. Consistent URL patterns (v1, kebab-case, plural resources) per MarsAI conventions
5. All routes use auth middleware (no public endpoints without explicit exemption)
6. Clear separation: routes.ts vs handlers.ts per MarsAI directory structure

**Severity Ratings:**
- CRITICAL: Unprotected routes (missing auth middleware)
- CRITICAL: HARD GATE violation — project does not follow hexagonal architecture per MarsAI standards
- HIGH: Scattered route definitions
- MEDIUM: Handler accepts nil dependencies
- LOW: Inconsistent URL naming conventions

**Output Format:**
```
## Route Organization Audit Findings

### Summary
- Modules following hexagonal: X/Y
- Routes with protection: X/Y
- Handlers validating deps: X/Y

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 4: Bootstrap & Initialization Auditor

```prompt
Audit application bootstrap and initialization for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Bootstrap" section from bootstrap.md}
---END STANDARDS---

**Search Patterns:**
- Files: `**/main.ts`, `**/index.ts`, `**/bootstrap/*.ts`, `**/app.module.ts`
- Keywords: `bootstrap`, `NestFactory`, `listen`, `shutdown`, `cleanup`, `graceful`
- Standards-specific: `bootstrapApplication`, `staged initialization`

**Reference Implementation (GOOD):**
```typescript
// Staged initialization with cleanup
async function bootstrap(): Promise<void> {
  let startupSucceeded = false;
  const cleanupFns: Array<() => Promise<void>> = [];

  try {
    // 1. Load config
    const cfg = loadConfig();

    // 2. Initialize logger
    const logger = initLogger(cfg);
    cleanupFns.push(() => logger.flush());

    // 3. Initialize telemetry
    const telemetry = initTelemetry(cfg, logger);
    cleanupFns.push(() => telemetry.shutdown());

    // 4. Connect infrastructure (DB, Redis, MQ)
    const db = await connectDB(cfg);
    cleanupFns.push(() => db.destroy());

    // 5. Initialize modules in dependency order
    // ...

    startupSucceeded = true;
  } finally {
    if (!startupSucceeded) {
      // Cleanup on failure — reverse order
      for (const fn of cleanupFns.reverse()) {
        await fn().catch(() => {});
      }
    }
  }
}
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Staged initialization order per bootstrap.md (config -> logger -> telemetry -> infra)
2. (HARD GATE) Cleanup handlers for failed startup
3. (HARD GATE) Graceful shutdown support
4. Module initialization in dependency order per MarsAI bootstrap pattern
5. Error propagation (not just logging and continuing)
6. Production vs development mode handling

**Severity Ratings:**
- CRITICAL: No graceful shutdown (HARD GATE violation per MarsAI standards)
- CRITICAL: HARD GATE violation — bootstrap does not follow MarsAI staged initialization pattern
- HIGH: Resources not cleaned up on startup failure
- HIGH: Errors logged but not returned
- MEDIUM: Initialization order issues
- LOW: Missing development mode toggles

**Output Format:**
```
## Bootstrap Audit Findings

### Summary
- Graceful shutdown: Yes/No
- Cleanup on failure: Yes/No
- Staged initialization: Yes/No

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 5: Runtime Safety Auditor

```prompt
Audit pkg/runtime usage and panic handling for production readiness.

**Detected Stack:** {DETECTED_STACK}

**Search Patterns:**
- Files: `**/error-handler*.ts`, `**/middleware/*.ts`, `**/*.ts`
- Keywords: `uncaughtException`, `unhandledRejection`, `process.on`, `ErrorHandler`
- Also search: `process.exit(`, `throw` (unhandled)

**Reference Implementation (GOOD):**
```typescript
// Bootstrap initialization — global error handlers
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  metrics.increment('uncaught_exceptions');
  if (cfg.envName === 'production') {
    process.exit(1); // Crash and let orchestrator restart
  }
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
  metrics.increment('unhandled_rejections');
});

// In HTTP handlers — error middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Handler error', { error: err.message, path: req.path });
  res.status(500).json({ error: 'Internal server error' });
});

// In background workers — try/catch with recovery policy
async function processJob(job: Job): Promise<void> {
  try {
    await handleJob(job);
  } catch (err) {
    logger.error('Job failed', { jobId: job.id, error: err });
    // Log and continue — do not crash worker
  }
}
```

**Check For:**
1. pkg/runtime initialized at startup
2. Production mode set based on environment
3. All async operations have error handling
4. Appropriate error recovery policies per context
5. Error metrics enabled for alerting
6. Global error handlers configured (uncaughtException, unhandledRejection)

**Severity Ratings:**
- CRITICAL: Async operations without error handling
- HIGH: Missing production mode setting
- HIGH: No global error handlers (uncaughtException/unhandledRejection)
- MEDIUM: Inconsistent error recovery policies
- LOW: Missing error metrics

**Output Format:**
```
## Runtime Safety Audit Findings

### Summary
- Runtime initialized: Yes/No
- Handlers with recovery: X/Y
- Goroutines with recovery: X/Y

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 6: Auth Protection Auditor

```prompt
Audit authentication and authorization implementation for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Access Manager Integration" section from security.md}
---END STANDARDS---

**Search Patterns:**
- Files: `**/auth/*.ts`, `**/middleware/*.ts`, `**/guards/*.ts`, `**/routes.ts`
- Keywords: `Authorize`, `Guard`, `JWT`, `tenant`, `extractToken`, `passport`
- Standards-specific: `AccessManager`, `auth-library`, `AuthGuard`

**Reference Implementation (GOOD):**
```typescript
// Protected route group with auth middleware
const authMiddleware = (resource: string, action: string) =>
  [verifyJwt, authorize(resource, action)];

// All routes use auth middleware
router.post('/v1/config/contexts', ...authMiddleware('contexts', 'create'), handler.create);

// JWT validation
function parseTokenClaims(tokenString: string, secret: string): JwtPayload {
  try {
    const decoded = jwt.verify(tokenString, secret, { algorithms: ['RS256'] });
    if (typeof decoded === 'string') throw new InvalidTokenError();
    return decoded as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw new TokenExpiredError();
    throw new InvalidTokenError();
  }
}
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) All routes protected via Access Manager integration per security.md
2. (HARD GATE) Auth library used for JWT validation (not custom JWT parsing)
3. Resource/action authorization granularity per MarsAI access control model
4. Token expiration enforcement
5. Tenant extraction from JWT claims
6. Auth bypass for health/ready endpoints only

**Severity Ratings:**
- CRITICAL: Unprotected data endpoints (HARD GATE violation per MarsAI standards)
- CRITICAL: JWT parsed but not validated
- CRITICAL: HARD GATE violation — not using auth library for access management
- HIGH: Missing token expiration check
- HIGH: Tenant claims not enforced
- MEDIUM: Overly broad permissions
- LOW: Missing fine-grained actions

**Output Format:**
```
## Auth Protection Audit Findings

### Summary
- Protected routes: X/Y
- JWT validation: Complete/Partial/Missing
- Tenant enforcement: Yes/No

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 7: IDOR & Access Control Auditor

```prompt
Audit IDOR (Insecure Direct Object Reference) protection for production readiness.

**Detected Stack:** {DETECTED_STACK}

**Search Patterns:**
- Files: `**/verifier*.ts`, `**/handlers.ts`, `**/guards/*.ts`, `**/context.ts`
- Keywords: `verifyOwnership`, `tenantId`, `contextId`, `parseAndVerify`

**Reference Implementation (GOOD):**
```typescript
// 4-layer IDOR protection
async function parseAndVerifyContextParam(
  req: Request,
  verifier: ContextOwnershipVerifier
): Promise<{ contextId: string; tenantId: string }> {
  // 1. UUID format validation
  const contextId = req.params.contextId;
  if (!isValidUUID(contextId)) throw new InvalidIdError();

  // 2. Extract tenant from auth context (cannot be spoofed)
  const tenantId = req.user.tenantId;

  // 3. Database query filtered by tenant
  // 4. Post-query ownership verification
  await verifier.verifyOwnership(tenantId, contextId);
  return { contextId, tenantId };
}

// Verifier implementation
class OwnershipVerifier {
  async verifyOwnership(tenantId: string, resourceId: string): Promise<void> {
    const resource = await this.query.get(tenantId, resourceId); // Query WITH tenant filter
    if (!resource) throw new NotFoundError();
    if (resource.tenantId !== tenantId) throw new NotOwnedError(); // Double-check ownership
  }
}
```

**Reference Implementation (BAD):**
```typescript
// BAD: No ownership verification
async function getResource(req: Request, res: Response) {
  const id = req.params.id;
  const resource = await repo.findById(id); // No tenant filter!
  return res.json(resource);
}
```

**Check For:**
1. All resource access verifies ownership
2. Tenant ID from JWT context (not request params)
3. Database queries include tenant filter
4. Post-query ownership double-check
5. UUID validation before database lookup
6. Consistent verifier pattern across modules

**Severity Ratings:**
- CRITICAL: Resource access without ownership check
- CRITICAL: Tenant ID from user input (not JWT)
- HIGH: Missing post-query ownership verification
- MEDIUM: Inconsistent verifier implementation
- LOW: Missing UUID format validation

**Output Format:**
```
## IDOR Protection Audit Findings

### Summary
- Modules with verifiers: X/Y
- Multi-tenant filtered queries: X/Y
- Post-query verification: X/Y

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 8: SQL Safety Auditor

```prompt
Audit SQL injection prevention for production readiness.

**Detected Stack:** {DETECTED_STACK}

**Search Patterns:**
- Files: `**/repository/*.ts`, `**/*_repo.ts`, `**/database/*.ts`
- Keywords: `query`, `execute`, `$1`, `$2`, `knex`, `prisma`, `typeorm`
- Also search for: String concatenation in SQL: `` `SELECT.*${` ``, template literal interpolation in queries

**Reference Implementation (GOOD):**
```typescript
// Parameterized queries
const query = 'INSERT INTO resources (id, name, tenant_id) VALUES ($1, $2, $3)';
await client.query(query, [id, name, tenantId]);

// SQL identifier escaping for dynamic schemas
function quoteIdentifier(identifier: string): string {
  return '"' + identifier.replace(/"/g, '""') + '"';
}
await client.query(`SET LOCAL search_path TO ${quoteIdentifier(tenantId)}`);

// Query builder (Knex)
const result = await knex('resources').select('*').where({ tenant_id: tenantId });
```

**Reference Implementation (BAD):**
```typescript
// BAD: String concatenation
const query = "SELECT * FROM users WHERE name = '" + name + "'";

// BAD: Template literal interpolation for values
const query = `SELECT * FROM users WHERE id = '${id}'`;

// BAD: Unescaped identifier
const query = `SET search_path TO ${tenantId}`; // SQL injection via tenant
```

**Check For:**
1. All queries use parameterized statements ($1, $2, ...)
2. No string concatenation in SQL queries
3. Dynamic identifiers properly escaped (QuoteIdentifier)
4. Query builders used for complex WHERE clauses
5. No raw SQL with user input

**Severity Ratings:**
- CRITICAL: String concatenation with user input
- CRITICAL: Template literal interpolation with user values
- HIGH: Unescaped dynamic identifiers
- MEDIUM: Raw SQL where builder would be safer
- LOW: Inconsistent query patterns

**Output Format:**
```
## SQL Safety Audit Findings

### Summary
- Parameterized queries: X/Y
- String concatenation risks: Z
- Identifier escaping: Yes/No

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 9: Input Validation Auditor

```prompt
Audit input validation patterns for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Frameworks & Libraries" section from core.md — specifically validation library reference}
---END STANDARDS---

**Search Patterns:**
- Files: `**/dto.ts`, `**/handlers.ts`, `**/value-objects/*.ts`, `**/schemas/*.ts`
- Keywords: `class-validator`, `zod`, `joi`, `@IsString`, `z.object`, `schema.validate`
- Standards-specific: `class-validator`, `class-transformer`, `zod`

**Reference Implementation (GOOD):**
```typescript
// DTO with validation decorators (class-validator)
class CreateRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsEnum(ResourceType)
  type: string;

  @IsInt()
  @Min(0)
  @Max(1000000)
  amount: number;
}

// Handler with body parsing and validation
async function create(req: Request, res: Response) {
  const payload = plainToInstance(CreateRequest, req.body);
  const errors = await validate(payload);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  // ...
}

// Value object with domain validation
class ValueObject {
  private constructor(private readonly value: string) {}

  static create(value: string): ValueObject {
    if (!value || value.length > MAX_LENGTH) throw new InvalidInputError();
    if (!VALID_PATTERN.test(value)) throw new InvalidInputError();
    return new ValueObject(value);
  }
}
```

**Reference Implementation (BAD):**
```typescript
// BAD: No validation decorators
interface Request {
  name: string; // No validation!
}

// BAD: Ignoring body parse errors
const payload = req.body as CreateRequest; // No validation at all!

// BAD: No bounds checking
const amount = parseInt(req.query.amount as string); // Could be NaN, negative, or huge
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Validation library (class-validator/zod/joi) used for DTO validation per MarsAI core.md
2. (HARD GATE) All DTOs have validation decorators/schemas on required fields
3. Body parsing errors are handled (not ignored)
4. Query/path params validated before use
5. Numeric bounds enforced (min/max)
6. String length limits enforced
7. Enum values constrained
8. Value objects have factory methods with validation
9. File upload size/type validation

**Severity Ratings:**
- CRITICAL: Body parsing errors ignored
- CRITICAL: HARD GATE violation — not using validation library per MarsAI standards
- HIGH: No validation on user input DTOs
- HIGH: Unbounded numeric inputs
- MEDIUM: Missing string length limits
- LOW: Value objects without IsValid()

**Output Format:**
```
## Input Validation Audit Findings

### Summary
- DTOs with validation tags: X/Y
- BodyParser error handling: X/Y
- Value objects with IsValid: X/Y

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 10: Telemetry & Observability Auditor

```prompt
Audit telemetry and observability implementation for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Observability" section from bootstrap.md and "OpenTelemetry" section from sre.md}
---END STANDARDS---

**Search Patterns:**
- Files: `**/observability*.ts`, `**/telemetry*.ts`, `**/tracing*.ts`, `**/handlers.ts`
- Keywords: `tracer.startSpan`, `span`, `logger`, `metrics`, `opentelemetry`
- Standards-specific: `@opentelemetry/sdk-node`, `otel`, `OpenTelemetry`

**Reference Implementation (GOOD):**
```typescript
// Handler with proper telemetry
async function doSomething(req: Request, res: Response) {
  const span = tracer.startSpan('handler.doSomething');
  const ctx = trace.setSpan(context.active(), span);

  span.setAttribute('request_id', req.headers['x-request-id'] ?? '');

  try {
    // ... business logic
  } catch (err) {
    span.recordException(err as Error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: (err as Error).message });
    logger.error('operation failed', { error: err });
    throw err;
  } finally {
    span.end();
  }
}
```

**Reference Implementation (GOOD — Trace Propagation & Sampling):**
```typescript
// W3C Trace Context propagation in outgoing HTTP requests
import { propagation, context } from '@opentelemetry/api';

async function doRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {};
  propagation.inject(context.active(), headers);
  return fetch(url, { ...options, headers: { ...options.headers, ...headers } });
}

// Baggage propagation for business context
import { propagation, baggage } from '@opentelemetry/api';

function injectBusinessContext(tenantId: string, userId: string) {
  const bag = propagation.createBaggage({
    tenantId: { value: tenantId },
    userId: { value: userId },
  });
  return propagation.setBaggage(context.active(), bag);
}

// Span linking for async flows — consumer side
async function handleMessage(msg: Message) {
  const producerCtx = propagation.extract(context.active(), msg.headers);
  const producerSpanCtx = trace.getSpanContext(producerCtx);

  const span = tracer.startSpan(`consume.${msg.type}`, {
    links: producerSpanCtx ? [{ context: producerSpanCtx }] : [],
  });

  try {
    await processMessage(msg);
  } finally {
    span.end();
  }
}

// Trace sampling configuration
function initTracer(env: string) {
  const sampler = env === 'production'
    ? new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(0.1) })
    : env === 'staging'
      ? new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(0.5) })
      : new AlwaysOnSampler();

  return new NodeTracerProvider({ sampler });
}

// Custom span attributes for business context
async function createOrder(req: Request, res: Response) {
  const span = tracer.startSpan('handler.createOrder');
  span.setAttributes({
    'order.id': order.id,
    'tenant.id': tenantId,
    'order.amount': order.totalAmount,
  });
  // ...
  span.end();
}
```

**Reference Implementation (BAD — Trace Propagation):**
```typescript
// BAD: Outgoing HTTP request without trace context propagation
async function doRequest(url: string): Promise<Response> {
  return fetch(url); // No propagation — downstream sees a new disconnected trace
}

// BAD: Async message consumer starts fresh trace without linking to producer
async function handleMessage(msg: Message) {
  const span = tracer.startSpan('consume.event');
  await processMessage(msg); // No link to producer span — trace is disconnected
  span.end();
}

// BAD: No sampling configuration (AlwaysSample in production)
const provider = new NodeTracerProvider(); // Default: AlwaysSample — 100% of traces stored
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) OpenTelemetry SDK used for telemetry initialization per MarsAI standards
2. (HARD GATE) OpenTelemetry integration (not custom tracing) per sre.md
3. All handlers start spans with descriptive names
4. Errors recorded to spans before returning
5. Request IDs propagated through context
6. Metrics initialized at startup per bootstrap.md observability section
7. Structured logging with context (not console.log)
8. Graceful telemetry shutdown
9. Cross-service trace context propagation — outgoing HTTP requests MUST inject W3C Trace Context headers (`traceparent`, `tracestate`) using OpenTelemetry propagators
10. Baggage propagation across service boundaries — business context (e.g., `tenantId`, `userId`, `correlationId`) MUST be propagated via OpenTelemetry Baggage for cross-service observability
11. Span linking for async flows — message producer spans MUST be linked to consumer spans via `trace.WithLinks()` so async flows appear connected in distributed traces
12. Trace sampling configuration — production environments MUST configure sampling rate (not 100% sampling) to control cost; development environments may use `AlwaysSample`
13. Custom span attributes for business-relevant data — spans MUST include domain-specific attributes (e.g., `order.id`, `tenant.id`, `transaction.amount`) for meaningful trace filtering

**Severity Ratings:**
- CRITICAL: No tracing in handlers (HARD GATE violation per MarsAI standards)
- CRITICAL: HARD GATE violation — not using OpenTelemetry SDK for telemetry
- HIGH: Errors not recorded to spans
- HIGH: No trace context propagation in outgoing HTTP requests (downstream services cannot correlate traces — breaks distributed tracing)
- HIGH: Async message flows break trace continuity (no span links between producer and consumer — message processing appears as disconnected traces)
- MEDIUM: Missing request ID propagation
- MEDIUM: No trace sampling configuration (100% sampling in production = storage cost explosion and performance overhead)
- MEDIUM: Missing baggage propagation for cross-service business context (cannot filter/correlate traces by tenant, user, or business entity)
- LOW: Inconsistent span naming conventions
- LOW: No custom span attributes for business metrics (traces lack domain context for meaningful filtering and alerting)

**Output Format:**
```
## Telemetry Audit Findings

### Summary
- Handlers with tracing: X/Y
- Handlers with error recording: X/Y
- Metrics initialization: Yes/No

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 12: Health Checks Auditor

```prompt
Audit health check endpoints for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Health Checks" section from sre.md}
---END STANDARDS---

**Search Patterns:**
- Files: `**/health*.ts`, `**/routes.ts`, `**/app.ts`, `**/server.ts`
- Keywords: `/health`, `/ready`, `/live`, `healthHandler`, `readinessHandler`
- Standards-specific: `liveness`, `readiness`, `degraded`

**Reference Implementation (GOOD):**
```typescript
// Liveness probe - always returns healthy if process is running
function healthHandler(req: Request, res: Response) {
  return res.send('healthy');
}

// Readiness probe - checks all dependencies
function readinessHandler(deps: HealthDependencies) {
  return async (req: Request, res: Response) => {
    const checks: Record<string, string> = {};
    let status = 200;

    // Required dependency - fails readiness if down
    try {
      await deps.db.raw('SELECT 1');
      checks.database = 'healthy';
    } catch {
      checks.database = 'unhealthy';
      status = 503;
    }

    // Optional dependency - reports degraded but doesn't fail
    if (deps.redis) {
      try {
        await deps.redis.ping();
        checks.redis = 'healthy';
      } catch {
        checks.redis = 'degraded';
      }
    }

    return res.status(status).json({
      status: status === 200 ? 'healthy' : 'unhealthy',
      checks,
    });
  };
}

// Register without auth middleware
app.get('/health', healthHandler);
app.get('/ready', readinessHandler(deps));
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) /health endpoint exists (liveness) per sre.md
2. (HARD GATE) /ready endpoint exists (readiness) per sre.md
3. Health endpoints bypass auth middleware
4. Database connectivity checked in readiness
5. Message queue connectivity checked
6. Optional deps don't fail readiness (just report degraded) per MarsAI health check pattern
7. Response includes individual check status
8. Appropriate HTTP status codes (200 vs 503)

**Severity Ratings:**
- CRITICAL: No health endpoints at all (HARD GATE violation per MarsAI standards)
- HIGH: No readiness probe (only liveness)
- HIGH: Health endpoints require auth
- MEDIUM: Missing dependency checks in readiness
- LOW: No degraded status for optional deps

**Output Format:**
```
## Health Checks Audit Findings

### Summary
- Liveness endpoint: Yes/No (/path)
- Readiness endpoint: Yes/No (/path)
- Dependencies checked: [list]

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 13: Configuration Management Auditor

```prompt
Audit configuration management for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Configuration" section from core.md}
---END STANDARDS---

**Search Patterns:**
- Files: `**/config.ts`, `**/bootstrap/*.ts`, `**/.env*`
- Keywords: `process.env`, `dotenv`, `@nestjs/config`, `Joi.object`, `z.object`
- Standards-specific: `dotenv`, `@nestjs/config`, `convict`

**Reference Implementation (GOOD):**
```typescript
// Config with validation (using zod)
const configSchema = z.object({
  envName: z.string().default('development'),
  dbPassword: z.string().optional(),
  authEnabled: z.coerce.boolean().default(false),
  postgresSSLMode: z.string().default('disable'),
});

// Production validation
function validateProductionConfig(cfg: Config): void {
  if (cfg.envName === 'production') {
    if (!cfg.authEnabled) {
      throw new Error('AUTH_ENABLED must be true in production');
    }
    if (!cfg.dbPassword) {
      throw new Error('POSTGRES_PASSWORD required in production');
    }
    if (cfg.postgresSSLMode === 'disable') {
      throw new Error('POSTGRES_SSLMODE cannot be disable in production');
    }
  }
}

// Load with validation
function loadConfig(): Config {
  const raw = {
    envName: process.env.ENV_NAME,
    dbPassword: process.env.POSTGRES_PASSWORD,
    authEnabled: process.env.AUTH_ENABLED,
    postgresSSLMode: process.env.POSTGRES_SSLMODE,
  };
  const cfg = configSchema.parse(raw);
  validateProductionConfig(cfg);
  return cfg;
}
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) All config loaded from env vars (not hardcoded) per MarsAI core.md configuration section
2. (HARD GATE) Production-specific validation exists
3. Sensible defaults for non-production
4. Auth required in production
5. TLS/SSL required in production
6. Default credentials rejected in production
8. Secrets not logged during startup
9. Config validation fails fast (at startup)

**Severity Ratings:**
- CRITICAL: Hardcoded secrets in code (HARD GATE violation per MarsAI standards)
- CRITICAL: No production validation
- HIGH: Auth can be disabled in production
- HIGH: TLS not enforced in production
- MEDIUM: Missing sensible defaults
- LOW: Config not validated at startup

**Output Format:**
```
## Configuration Management Audit Findings

### Summary
- Env vars used: X fields
- Production validation: Yes/No
- Constraints enforced: [list]

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 14: Connection Management Auditor

```prompt
Audit database and cache connection management for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Core Dependencies" section from core.md — specifically connection packages}
---END STANDARDS---

**Search Patterns:**
- Files: `**/config.ts`, `**/database*.ts`, `**/redis*.ts`, `**/postgres*.ts`
- Keywords: `pool`, `max`, `min`, `idleTimeoutMillis`, `connectionTimeoutMillis`, `ioredis`
- Standards-specific: `knex`, `typeorm`, `prisma`, `ioredis`, `pg`

**Reference Implementation (GOOD):**
```typescript
// Database pool configuration
const dbConfig = {
  pool: {
    max: parseInt(process.env.POSTGRES_MAX_OPEN_CONNS ?? '25'),
    min: parseInt(process.env.POSTGRES_MIN_IDLE_CONNS ?? '5'),
    idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT_MS ?? '30000'),
    acquireTimeoutMillis: parseInt(process.env.POSTGRES_ACQUIRE_TIMEOUT_MS ?? '10000'),
  },
};

// Redis pool configuration
const redisConfig = {
  maxRetriesPerRequest: 3,
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT_MS ?? '5000'),
  commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT_MS ?? '3000'),
  lazyConnect: true,
};

// Primary + Replica support
interface DatabaseConnections {
  primary: Knex;
  replica: Knex; // Falls back to primary if not configured
}
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Project connection libraries used per core.md
2. DB connection pool limits configured
3. Redis pool settings configured
4. Connection timeouts set (not infinite)
5. Connection max lifetime set (prevents stale connections)
6. Idle connection limits reasonable
7. Read replica support (for scaling reads)
8. Connection health checks (ping on checkout)
9. Graceful connection shutdown

**Severity Ratings:**
- CRITICAL: No connection pool limits (unbounded connections)
- CRITICAL: HARD GATE violation — not using project connection libraries
- HIGH: No connection timeouts (hang forever)
- HIGH: No max lifetime (stale connections)
- MEDIUM: Missing read replica support
- LOW: Pool sizes not tuned

**Output Format:**
```
## Connection Management Audit Findings

### Summary
- DB pool configured: Yes/No (max: X, idle: Y)
- Redis pool configured: Yes/No (size: X)
- Timeouts configured: Yes/No
- Replica support: Yes/No

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 15: Logging & PII Safety Auditor

```prompt
Audit logging practices and PII protection for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Logging" section from quality.md}
---END STANDARDS---

**Search Patterns:**
- Files: `**/*.ts`
- Keywords: `logger.`, `log.`, `error`, `info`, `warn`, `password`, `token`, `secret`
- Also search: `console.log`, `console.error` (should not be used for logging in production)
- Standards-specific: `winston`, `pino`, `bunyan`, structured logging library references

**Reference Implementation (GOOD):**
```typescript
// Structured logging with context
logger.info('resource created', {
  requestId,
  userId,
  action: 'create_resource',
});

// Production-safe error logging
if (isProduction) {
  // Don't include error details that might leak PII
  logger.error('operation failed', { status: code, path });
} else {
  // Development can have full details
  logger.error('operation failed', { error: err.message, stack: err.stack });
}

// Config DSN without password
function getDSN(config: Config): string {
  // Returns connection string without logging password
  return `host=${config.host} port=${config.port} user=${config.user} dbname=${config.dbName}`;
}
```

**Reference Implementation (BAD):**
```typescript
// BAD: console.log for logging
console.log('User logged in:', userEmail);

// BAD: Logging sensitive data
logger.info(`Login attempt: email=${email} password=${password}`);

// BAD: Logging full request body (might contain PII)
logger.debug('Request body:', requestBody);

// BAD: Not using structured logging
console.error('Error:', err);
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Structured logging used (not console.log or console.error) per quality.md logging section
2. Logger obtained from context (request tracking)
3. No passwords/tokens logged
4. Production mode sanitizes error details
5. Request/response bodies not logged raw
6. Log levels appropriate (not everything at INFO)
7. Request IDs included for tracing
8. No PII in log messages (emails, names, etc.)

**Severity Ratings:**
- CRITICAL: Passwords/tokens logged
- CRITICAL: PII logged in production
- HIGH: console.log used instead of logger (HARD GATE violation per MarsAI standards)
- HIGH: Full error details in production
- MEDIUM: Missing request ID in logs
- LOW: Inappropriate log levels

**Output Format:**
```
## Logging & PII Safety Audit Findings

### Summary
- Structured logging: Yes/No
- PII protection: Yes/No
- Production mode: Yes/No

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 16: Idempotency Auditor

```prompt
Audit idempotency implementation for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: Full module content from idempotency.md}
---END STANDARDS---

**Search Patterns:**
- Files: `**/idempotency*.ts`, `**/value-objects/*.ts`, `**/redis/*.ts`
- Keywords: `idempotencyKey`, `tryAcquire`, `markComplete`, `setNX`, `idempotent`
- Standards-specific: `IdempotencyRepository`, `idempotency middleware`

**Reference Implementation (GOOD):**
```typescript
// Idempotency key value object
const IDEMPOTENCY_KEY_MAX_LENGTH = 128;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9:_-]+$/;

class IdempotencyKey {
  private constructor(private readonly value: string) {}

  static create(value: string): IdempotencyKey {
    if (!value || value.length > IDEMPOTENCY_KEY_MAX_LENGTH) {
      throw new InvalidIdempotencyKeyError();
    }
    if (!IDEMPOTENCY_KEY_PATTERN.test(value)) {
      throw new InvalidIdempotencyKeyError();
    }
    return new IdempotencyKey(value);
  }

  toString(): string { return this.value; }
}

// Redis-backed idempotency
class IdempotencyRepository {
  constructor(private readonly redis: Redis, private readonly ttlSeconds: number = 604800) {} // 7 days

  async tryAcquire(key: IdempotencyKey): Promise<boolean> {
    // SetNX is atomic - only first caller wins
    const result = await this.redis.set(this.keyName(key), 'acquired', 'EX', this.ttlSeconds, 'NX');
    return result === 'OK';
  }

  async markComplete(key: IdempotencyKey): Promise<void> {
    await this.redis.set(this.keyName(key), 'complete', 'EX', this.ttlSeconds);
  }
}

// Usage in handler
async function processCallback(req: Request, res: Response) {
  const key = IdempotencyKey.create(req.headers['idempotency-key'] as string);

  const acquired = await idempotency.tryAcquire(key);
  if (!acquired) {
    return res.status(200).json({ status: 'already_processed' });
  }

  // Process...

  await idempotency.markComplete(key);
  return res.json(result);
}
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Idempotency keys for financial/critical operations per idempotency.md
2. (HARD GATE) Atomic acquire mechanism (SetNX or similar)
3. TTL to prevent unbounded storage
4. Key validation (format, length) per MarsAI idempotency patterns
5. Proper state transitions (acquired -> complete/failed)
6. Retry-safe (failed operations can be retried)
7. Idempotency for webhook callbacks
8. Idempotency for payment operations

**Severity Ratings:**
- CRITICAL: No idempotency for financial operations (HARD GATE violation per MarsAI standards)
- HIGH: Non-atomic acquire (race conditions)
- HIGH: No TTL (memory leak)
- MEDIUM: Missing key validation
- LOW: No failed state handling

**Output Format:**
```
## Idempotency Audit Findings

### Summary
- Idempotency implemented: Yes/No
- Operations covered: [list]
- Storage backend: Redis/DB/Memory
- TTL configured: X days

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 17: API Documentation Auditor

```prompt
Audit API documentation (Swagger/OpenAPI) for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: Swaggo/OpenAPI subsection from "Pagination Patterns" in api-patterns.md}
---END STANDARDS---

**Search Patterns:**
- Files: `**/main.ts`, `**/controllers/*.ts`, `**/dto.ts`, `**/swagger/*`, `**/openapi*.yaml`
- Keywords: `@ApiOperation`, `@ApiResponse`, `@ApiProperty`, `@ApiTags`, `@swagger-jsdoc`
- Standards-specific: `@nestjs/swagger`, `swagger-jsdoc`, `openapi`, `docs/swagger.json`

**Reference Implementation (GOOD):**
```typescript
// NestJS controller with full OpenAPI documentation
@ApiTags('resources')
@ApiBearerAuth()
@Controller('v1/resources')
export class ResourcesController {

  @Post()
  @ApiOperation({ summary: 'Create a resource', description: 'Creates a new resource with the given parameters' })
  @ApiResponse({ status: 201, type: ResourceResponse })
  @ApiResponse({ status: 400, type: ErrorResponse, description: 'Invalid input' })
  @ApiResponse({ status: 401, type: ErrorResponse, description: 'Unauthorized' })
  @ApiResponse({ status: 403, type: ErrorResponse, description: 'Forbidden' })
  @ApiResponse({ status: 500, type: ErrorResponse, description: 'Internal error' })
  async create(@Body() dto: CreateRequest): Promise<ResourceResponse> { ... }
}

// DTO with documentation
class CreateRequest {
  @ApiProperty({ example: 'my-resource' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'TYPE_A', enum: ['TYPE_A', 'TYPE_B'] })
  @IsEnum(ResourceType)
  type: string;

  @ApiProperty({ example: 100, minimum: 0, maximum: 1000000 })
  @IsInt()
  @Min(0)
  @Max(1000000)
  amount: number;
}
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) OpenAPI/Swagger annotations present per MarsAI api-patterns.md
2. API title, version, description in OpenAPI config
3. Security definitions (Bearer token)
4. All endpoints have @Router annotation
5. Request/response types documented
6. All error codes documented (@Failure)
7. Examples in DTOs (example: tag)
8. Enums documented (enums: tag)
9. Parameter constraints documented (minimum, maximum)
10. Tags organize endpoints logically
11. Swagger UI accessible

**Severity Ratings:**
- HIGH: No Swagger annotations at all (HARD GATE violation per MarsAI standards)
- HIGH: Missing security definitions
- MEDIUM: Endpoints without documentation
- MEDIUM: Error responses not documented
- LOW: Missing examples in DTOs
- LOW: Inconsistent tag usage

**Output Format:**
```
## API Documentation Audit Findings

### Summary
- Swagger annotations: Yes/No
- Documented endpoints: X/Y
- Security definitions: Yes/No
- Error responses documented: X/Y

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 18: Technical Debt Auditor

```prompt
Audit technical debt indicators for production readiness.

**Detected Stack:** {DETECTED_STACK}

**Search Patterns (with context):**
- `TODO` - Planned work
- `FIXME` - Known bugs
- `HACK` - Workarounds
- `XXX` - Danger zones
- `deprecated` (case-insensitive)
- `"in a real implementation"` or `"real implementation"`
- `"temporary"` or `"temp fix"`
- `"workaround"`
- `throw new Error("not implemented")`

**Risk Assessment Criteria:**

**Implement Now (High Risk):**
- Security-related TODOs (auth, validation, encryption)
- Error handling TODOs in critical paths
- Data integrity issues
- "FIXME" in production code paths

**Monitor (Medium Risk):**
- Performance optimization TODOs
- Incomplete logging
- "deprecated" usage without migration plan

**Acceptable Debt (Low Risk):**
- Future feature ideas
- Code style improvements
- Test coverage expansion
- Documentation improvements

**Output Format:**
```
## Technical Debt Audit Findings

### Summary
- Total TODOs: X
- Total FIXMEs: Y
- Deprecated usage: Z
- "Real implementation" markers: N

### HIGH RISK - Implement Now
| File:Line | Type | Description | Risk |
|-----------|------|-------------|------|
| path:123 | TODO | Auth bypass for testing | Security |

### MEDIUM RISK - Monitor
| File:Line | Type | Description | Risk |
|-----------|------|-------------|------|

### LOW RISK - Acceptable Debt
| File:Line | Type | Description | Risk |
|-----------|------|-------------|------|

### Recommendations
1. ...
```
```

### Agent 19: Testing Coverage Auditor

```prompt
Audit test coverage and testing patterns for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Testing" section from quality.md}
---END STANDARDS---

**Search Patterns:**
- Files: `**/*.spec.ts`, `**/*.test.ts`, `**/mocks/**/*.ts`, `**/__tests__/**/*.ts`
- Keywords: `describe`, `it(`, `test(`, `expect(`, `jest.mock`, `vi.mock`
- Standards-specific: `jest`, `vitest`, `supertest`, `testcontainers`

**Reference Implementation (GOOD):**
```typescript
// Co-located test file
// file: handler.spec.ts (next to handler.ts)

describe('Handler.create', () => {
  it('should create a resource successfully', async () => {
    // Arrange
    const mockRepo = { save: jest.fn().mockResolvedValue(undefined) };
    const handler = new Handler(mockRepo);

    // Act
    const result = await handler.create(ctx, input);

    // Assert
    expect(result).toEqual(expected);
    expect(mockRepo.save).toHaveBeenCalledWith(expect.any(Object));
  });
});

// Parameterized tests for multiple cases
describe('Validation', () => {
  const cases = [
    { name: 'valid input', input: 'test', shouldThrow: false },
    { name: 'empty input', input: '', shouldThrow: true },
    { name: 'too long', input: 'a'.repeat(300), shouldThrow: true },
  ];

  it.each(cases)('$name', async ({ input, shouldThrow }) => {
    if (shouldThrow) {
      await expect(validate(input)).rejects.toThrow();
    } else {
      await expect(validate(input)).resolves.not.toThrow();
    }
  });
});

// Integration test with testcontainers
describe('Integration: CreateResource', () => {
  if (process.env.SKIP_INTEGRATION) return;
  // Setup container...
});
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Test files co-located with source (*.spec.ts / *.test.ts) per quality.md testing section
2. (HARD GATE) Mocks use jest.mock/vi.mock (not hand-written implementations) per MarsAI standards
3. (HARD GATE) Assertions use jest/vitest expect() per MarsAI standards
4. Parameterized tests (it.each / test.each) for multiple cases
5. Integration tests in separate directory or with configuration flags
6. Test helpers/fixtures organized
7. Concurrent test execution where appropriate
8. Test cleanup with afterEach/afterAll hooks

**Severity Ratings:**
- HIGH: Critical paths without tests (HARD GATE violation per MarsAI standards)
- HIGH: Hand-written mocks (should use jest.mock per MarsAI standards)
- MEDIUM: Missing table-driven tests for validators
- MEDIUM: No integration tests
- LOW: Tests not running in parallel
- LOW: Missing edge case coverage

**Output Format:**
```
## Testing Coverage Audit Findings

### Summary
- Test files found: X
- Modules with tests: X/Y
- Mock generation: jest.mock / hand-written
- Integration tests: Yes/No

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 20: Dependency Management Auditor

```prompt
Audit dependency management for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Frameworks & Libraries" section from core.md — specifically the version table}
---END STANDARDS---

**Search Patterns:**
- Files: `package.json`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- Commands: Run `npm audit` mentally based on package.json
- Standards-specific: Check for required MarsAI dependencies in package.json

**Reference Implementation (GOOD):**
```json
// package.json with pinned versions
{
  "name": "@company/project",
  "dependencies": {
    "@nestjs/core": "^10.3.0",
    "ioredis": "^5.3.0",
    "@opentelemetry/sdk-node": "^0.48.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "typescript": "^5.3.0"
  }
}
```

**Reference Implementation (BAD):**
```json
// BAD: Using file: protocol for production
{ "some-lib": "file:../local-lib" }

// BAD: Unpinned versions
{ "some-lib": "*" }

// BAD: Very old versions with known CVEs
{ "jsonwebtoken": "^7.0.0" }  // Has CVEs, use latest
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Required MarsAI framework dependencies present in package.json per core.md version table
2. All dependencies pinned (no "*" or unranged)
3. No local file: protocol in production dependencies
4. Known vulnerable packages identified (npm audit)
5. Unused dependencies (not imported anywhere)
6. Major version mismatches
7. Deprecated packages flagged by npm
8. Lock file exists and is committed
9. Framework versions meet MarsAI minimum requirements (Node.js 20+, TypeScript 5+, etc.)

**Known Vulnerable Packages to Flag:**
- jsonwebtoken < 9.0.0 (multiple CVEs)
- axios < 1.6.0 (SSRF vulnerability)
- lodash < 4.17.21 (prototype pollution)
- express < 4.19.0 (path traversal)

**Severity Ratings:**
- CRITICAL: Known CVE in dependency (npm audit critical)
- CRITICAL: HARD GATE violation — required MarsAI framework dependency missing from package.json
- HIGH: Local replace directive
- HIGH: Deprecated package with security issues
- MEDIUM: Significantly outdated dependencies
- MEDIUM: Framework versions below MarsAI minimum requirements
- LOW: Minor version behind

**Output Format:**
```
## Dependency Audit Findings

### Summary
- Total dependencies: X
- Direct dependencies: Y
- Potentially outdated: Z
- Known vulnerabilities: N

### Critical Issues
[package] - Description

### Recommendations
1. ...
```
```

### Agent 21: Performance Patterns Auditor

```prompt
Audit performance patterns for production readiness.

**Detected Stack:** {DETECTED_STACK}

**Search Patterns:**
- Files: `**/*.ts`
- Keywords: `for`, `map(`, `push(`, `SELECT *`, `N+1`, `Promise.all`

**Reference Implementation (GOOD):**
```typescript
// Batch database operations
async function createBatch(items: Item[]): Promise<void> {
  const batchSize = 100;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await knex('items').insert(batch);
  }
}

// Select only needed columns
async function list(): Promise<Item[]> {
  return knex('items').select('id', 'name', 'status'); // Not SELECT *
}

// Avoid N+1 with eager loading
async function getWithRelations(id: string): Promise<Item> {
  return knex('items')
    .where('items.id', id)
    .join('children', 'children.parent_id', 'items.id')
    .select('items.*', 'children.*');
}

// Bounded concurrent requests
import pLimit from 'p-limit';
const limit = pLimit(10);
const results = await Promise.all(
  urls.map(url => limit(() => fetch(url)))
);
```

**Reference Implementation (BAD):**
```typescript
// BAD: SELECT * fetches unnecessary data
const items = await knex('items').select('*');

// BAD: N+1 query pattern
for (const item of items) {
  const children = await knex('children').where('parent_id', item.id); // Query per item!
}

// BAD: Unbounded concurrent requests — overwhelms downstream
const results = await Promise.all(
  urls.map(url => fetch(url)) // No concurrency limit
);

// BAD: Large buffer allocation per request without pooling
function handleRequest() {
  const buf = Buffer.alloc(1 << 20); // 1MB allocation per request
}
```

**Check For:**
1. SELECT * avoided (explicit column selection)
2. N+1 queries prevented (use Preload/joins)
3. Slice pre-allocation when size known
4. Object pooling for frequent allocations
5. Batch operations for bulk inserts/updates
6. Indexes exist for filtered/sorted columns
7. Connection pooling configured
8. Context timeouts on DB operations

**Severity Ratings:**
- HIGH: N+1 query pattern in production code
- HIGH: SELECT * on large tables
- MEDIUM: Missing slice pre-allocation
- MEDIUM: No batch operations for bulk data
- LOW: Missing object pooling optimization
- LOW: Minor inefficiencies

**Output Format:**
```
## Performance Audit Findings

### Summary
- N+1 patterns found: X
- SELECT * usage: Y
- Missing pre-allocations: Z

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 22: Concurrency Safety Auditor

```prompt
Audit concurrency patterns for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Concurrency Patterns" section from architecture.md}
---END STANDARDS---

**Search Patterns:**
- Files: `**/*.ts`
- Keywords: `Promise.all`, `Promise.race`, `Worker`, `setInterval`, `async`, `concurrency`
- Standards-specific: `p-limit`, `p-queue`, `worker_threads`, `bull`

**Reference Implementation (GOOD):**
```typescript
// Bounded concurrent processing
import pLimit from 'p-limit';
const limit = pLimit(10); // Max 10 concurrent

async function processAll(items: Item[]): Promise<void> {
  const results = await Promise.allSettled(
    items.map(item => limit(() => process(item)))
  );
  const errors = results.filter(r => r.status === 'rejected');
  if (errors.length > 0) {
    throw new AggregateError(errors.map(e => (e as PromiseRejectedResult).reason));
  }
}

// Worker with AbortController for cancellation
async function worker(signal: AbortSignal): Promise<void> {
  while (!signal.aborted) {
    const item = await getNextItem();
    if (item) await process(item);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Thread-safe cache with Map (single-threaded JS, but consistent patterns)
class Cache<T> {
  private items = new Map<string, T>();

  get(key: string): T | undefined {
    return this.items.get(key);
  }

  set(key: string, item: T): void {
    this.items.set(key, item);
  }
}
```

**Reference Implementation (BAD):**
```typescript
// BAD: Unbounded concurrent requests — overwhelms downstream
const results = await Promise.all(
  millionItems.map(item => process(item)) // Millions of concurrent promises!
);

// BAD: No way to stop background task
setInterval(() => {
  process(); // Runs forever, no cleanup
}, 1000);

// BAD: Fire-and-forget async — unhandled rejections
items.forEach(item => {
  process(item); // Missing await — errors silently lost
});

// BAD: No error handling in concurrent operations
await Promise.all(items.map(item => process(item))); // One failure rejects all
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Maps protected by mutex when shared per architecture.md concurrency patterns
2. Loop variables not captured in closures
3. Goroutines have cancellation (context)
4. WaitGroup used for coordination
5. Bounded concurrency (worker pools) per MarsAI patterns
6. Channels closed by sender
7. Select with default for non-blocking
8. No async leaks (all operations complete or are cancelled)

**Severity Ratings:**
- CRITICAL: Unbounded concurrent operations (HARD GATE violation per MarsAI standards)
- CRITICAL: Async leak (no cleanup path)
- HIGH: Fire-and-forget async operations without error handling
- HIGH: Unbounded Promise.all without concurrency limit
- MEDIUM: Missing context cancellation
- LOW: Inefficient locking patterns

**Output Format:**
```
## Concurrency Audit Findings

### Summary
- Goroutine spawns: X locations
- Mutex usage: Y locations
- Potential race conditions: Z

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 23: Migration Safety Auditor

```prompt
Audit database migration safety for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Core Dependencies" section from core.md — database migration patterns}
---END STANDARDS---

**Search Patterns:**
- Files: `migrations/*.sql`, `migrations/*.ts`, `**/migration*.ts`
- Keywords: `DROP`, `ALTER`, `RENAME`, `NOT NULL`, `CREATE INDEX`
- Standards-specific: migration tool (knex migrations, prisma migrate, typeorm migrations)

**Reference Implementation (GOOD):**
```sql
-- 000001_create_users.up.sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);

-- 000001_create_users.down.sql
DROP INDEX IF EXISTS idx_users_email;
DROP TABLE IF EXISTS users;

-- Adding nullable column (safe)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Adding NOT NULL with default (safe)
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
```

**Reference Implementation (BAD):**
```sql
-- BAD: Adding NOT NULL without default (locks table, fails if data exists)
ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL;

-- BAD: Non-concurrent index (locks table)
CREATE INDEX idx_users_email ON users(email);

-- BAD: Destructive without IF EXISTS
DROP TABLE users;
DROP COLUMN email;

-- BAD: Renaming column (breaks application)
ALTER TABLE users RENAME COLUMN email TO user_email;
```

**Reference Implementation (GOOD — Constraints & Data Migrations):**
```sql
-- GOOD: NOT NULL ADD COLUMN with DEFAULT (no table rewrite lock)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';

-- GOOD: CHECK constraint for domain validation at DB level
ALTER TABLE orders ADD CONSTRAINT chk_order_status
    CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded'));

-- GOOD: Foreign key with explicit cascading behavior and matching types
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- GOOD: Enum type at database level
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended', 'deleted');
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS status account_status NOT NULL DEFAULT 'active';

-- GOOD: Separate data migration file (000005_backfill_status.up.sql)
-- This is a DATA migration, separate from schema changes
UPDATE orders SET status = 'completed' WHERE legacy_status = 1 AND status IS NULL;
UPDATE orders SET status = 'cancelled' WHERE legacy_status = 2 AND status IS NULL;
```

**Reference Implementation (BAD — Constraints & Data Migrations):**
```sql
-- BAD: NOT NULL ADD COLUMN without DEFAULT (full table rewrite — locks table)
ALTER TABLE orders ADD COLUMN priority INTEGER NOT NULL;
-- On a table with 10M rows, this locks the table for minutes

-- BAD: No CHECK constraint — application validates but DB accepts anything
ALTER TABLE orders ADD COLUMN status VARCHAR(20);
-- Application code checks status in ('pending', 'completed') but DB allows 'banana'

-- BAD: Foreign key with mismatched types
ALTER TABLE order_items ADD CONSTRAINT fk_order
    FOREIGN KEY (order_id) REFERENCES orders(id);

-- BAD: Foreign key without cascading behavior
ALTER TABLE order_items ADD CONSTRAINT fk_order
    FOREIGN KEY (order_id) REFERENCES orders(id);
-- Default NO ACTION — DELETE FROM orders fails if order_items exist (unexpected 500s)

-- BAD: Data migration mixed with schema migration in same file
ALTER TABLE orders ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending';
UPDATE orders SET status = 'completed' WHERE completed_at IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
-- CONCURRENTLY cannot run inside a transaction — this file cannot execute atomically
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) All migrations have up AND down files per MarsAI migration patterns
2. (HARD GATE) CREATE INDEX uses CONCURRENTLY
3. New NOT NULL columns have DEFAULT
4. DROP/ALTER use IF EXISTS
5. No column renames (add new, migrate data, drop old)
6. No destructive operations in up migrations
7. Migrations are additive (safe rollback)
8. Sequential numbering (no gaps)
9. Migration tool matches MarsAI standard (knex migrations, prisma migrate, or typeorm migrations)
10. NOT NULL columns MUST have DEFAULT values in ADD COLUMN migrations — adding a NOT NULL column without DEFAULT requires a full table rewrite lock on existing data, causing downtime on large tables
11. CHECK constraints for domain-specific validation at database level — values validated only in application code MUST also have database-level CHECK constraints as a safety net
12. Foreign key consistency — foreign keys MUST have matching column types and MUST define explicit cascading behavior (ON DELETE/ON UPDATE) rather than relying on database defaults
13. Enum validation at database level — domain enums MUST be enforced via CHECK constraint or PostgreSQL enum type, not just application-level validation
14. Data migration scripts MUST be separate from schema migrations — mixing data transformations with schema changes in the same migration file makes rollback unsafe

**Severity Ratings:**
- CRITICAL: NOT NULL without default (HARD GATE violation per MarsAI standards)
- CRITICAL: Missing down migration (HARD GATE violation)
- CRITICAL: NOT NULL ADD COLUMN without DEFAULT (locks entire table for rewrite on large datasets — causes production downtime)
- HIGH: Non-concurrent index creation
- HIGH: Column rename (breaking change)
- HIGH: No CHECK constraints for domain values validated only in application code (database accepts any value — data corruption if application validation is bypassed)
- MEDIUM: DROP without IF EXISTS
- MEDIUM: Foreign keys without explicit cascading behavior (relies on database default `NO ACTION` — may cause unexpected constraint violations on DELETE)
- MEDIUM: Enum values validated only in application code (database allows invalid values — data integrity depends entirely on application correctness)
- LOW: Migration naming inconsistency
- LOW: Data migrations mixed with schema migrations in same file (harder to rollback, debug, and review independently)

**Output Format:**
```
## Migration Safety Audit Findings

### Summary
- Total migrations: X
- Up migrations: Y
- Down migrations: Z
- Potentially unsafe: N

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 24: Container Security Auditor

```prompt
Audit container security and Dockerfile best practices for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Containers" section from devops.md}
---END STANDARDS---

**Search Patterns:**
- Files: `Dockerfile*`, `docker-compose*.yml`, `Makefile`
- Keywords: `FROM`, `USER`, `COPY`, `ADD`, `HEALTHCHECK`
- Standards-specific: `distroless`, `nonroot`, `multi-stage`

**Reference Implementation (GOOD):**
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# Minimal runtime image
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
# Non-root user
USER node
# Healthcheck defined
HEALTHCHECK --interval=30s --timeout=3s CMD ["node", "-e", "require('http').get('http://localhost:3000/health')"]
ENTRYPOINT ["node", "dist/main.js"]
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Multi-stage builds (builder vs runtime) per devops.md containers section
2. (HARD GATE) Non-root user execution (`USER nonroot` or numeric ID) per MarsAI standards
3. Minimal/Distroless runtime images per MarsAI container patterns
4. Pinned base image versions (not `latest`)
5. `COPY` used instead of `ADD` (unless extracting tar)
6. .dockerignore file exists and excludes secrets/git
7. Sensitive args not passed as build-args (secrets)

**Severity Ratings:**
- CRITICAL: Running as root in production image (HARD GATE violation per MarsAI standards)
- CRITICAL: HARD GATE violation — no multi-stage build per devops.md
- HIGH: Secrets in Dockerfile/history
- MEDIUM: Using `latest` tag
- LOW: Missing HEALTHCHECK in Dockerfile

**Output Format:**
```
## Container Security Audit Findings

### Summary
- Multi-stage build: Yes/No
- Non-root user: Yes/No
- Base image pinned: Yes/No

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 25: HTTP Hardening Auditor

```prompt
Audit HTTP security headers and hardening configuration for production readiness.

**Detected Stack:** {DETECTED_STACK}

**Search Patterns:**
- Files: `**/server.ts`, `**/app.ts`, `**/middleware/*.ts`
- Keywords: `helmet`, `csrf`, `secure`, `httpOnly`, `sameSite`

**Reference Implementation (GOOD):**
```typescript
// Security headers with helmet
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: { directives: { defaultSrc: ["'self'"] } },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  xContentTypeOptions: true,
  xXssProtection: true,
}));
```

**Check For:**
1. HSTS enabled (Strict-Transport-Security)
2. CSP configured (Content-Security-Policy)
3. X-Frame-Options set to DENY or SAMEORIGIN
4. Secure cookies (Secure, HttpOnly, SameSite=Strict/Lax)
5. Server banner suppressed (Server: value removed)

**Severity Ratings:**
- HIGH: Missing HSTS
- MEDIUM: Missing CSP or overly permissive
- LOW: Server banner exposed

**Output Format:**
```
## HTTP Hardening Audit Findings

### Summary
- HSTS enabled: Yes/No
- CSP configured: Yes/No

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 26: CI/CD Pipeline Auditor

```prompt
Audit CI/CD pipelines for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: CI section from devops.md}
---END STANDARDS---

**Search Patterns:**
- Files: `.github/workflows/*.yml`, `.gitlab-ci.yml`, `Makefile`
- Keywords: `test`, `lint`, `build`, `docker`, `sign`
- Standards-specific: `eslint`, `npm audit`, `trivy`, `cosign`

**Reference Implementation (GOOD):**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) CI pipeline exists (GitHub Actions/GitLab CI) per devops.md
2. (HARD GATE) Tests run on PRs per MarsAI CI requirements
3. Linting runs on PRs (eslint)
4. Security scanning (npm audit, trivy) integrated
5. Artifact signing (cosign/sigstore)
6. Docker image build and push stages
7. Automated deployment stages (if applicable)

**Severity Ratings:**
- CRITICAL: No CI pipeline (HARD GATE violation per MarsAI standards)
- CRITICAL: Tests not running on PR (HARD GATE violation)
- HIGH: Missing linting in CI
- MEDIUM: Missing security scanning
- LOW: Artifacts not signed

**Output Format:**
```
## CI/CD Pipeline Audit Findings

### Summary
- CI Pipeline: Active/Missing
- Tests on PR: Yes/No
- Linting: Yes/No
- Security Scans: Yes/No

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 27: Async Reliability Auditor

```prompt
Audit asynchronous processing reliability for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "RabbitMQ Worker Pattern" section from messaging.md}
---END STANDARDS---

**Search Patterns:**
- Files: `**/worker/*.ts`, `**/queue/*.ts`, `**/kafka/*.ts`, `**/rabbitmq/*.ts`, `**/bull/*.ts`
- Keywords: `ack`, `nack`, `retry`, `deadLetter`, `DLQ`, `consumerGroup`
- Standards-specific: `amqp`, `RabbitMQ`, `bullmq`, `kafkajs`

**Reference Implementation (GOOD):**
```typescript
// Reliable consumer with DLQ strategy
async function handleMessage(msg: Message): Promise<void> {
  try {
    await process(msg);
    await msg.ack();
  } catch (err) {
    if (msg.retryCount >= MAX_RETRIES) {
      await dlq.publish(msg);
      await msg.ack(); // Remove from main queue
      return;
    }
    await msg.nack(false); // Retry with backoff
  }
}
```

**Reference Implementation (GOOD — Outbox, Idempotency & Poison Messages):**
```typescript
// Transactional outbox pattern — event published within same DB transaction
async function createOrder(order: Order): Promise<void> {
  await knex.transaction(async (trx) => {
    await trx('orders').insert(order);
    await trx('outbox_events').insert({
      aggregateId: order.id,
      aggregateType: 'Order',
      eventType: 'OrderCreated',
      payload: JSON.stringify(order),
      status: 'pending',
    });
  });
}

// Outbound webhook with retry and delivery tracking
async function deliverWebhook(endpoint: string, payload: unknown): Promise<void> {
  let lastErr: Error | undefined;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        await trackDelivery(endpoint, 'delivered', attempt + 1);
        return;
      }
      lastErr = new Error(`attempt ${attempt + 1}: status=${resp.status}`);
    } catch (err) {
      lastErr = err as Error;
    }
    await trackDelivery(endpoint, 'retrying', attempt + 1);
    await sleep(exponentialBackoff(attempt));
  }
  await trackDelivery(endpoint, 'failed', MAX_RETRIES);
  throw new Error(`Webhook delivery failed after ${MAX_RETRIES} attempts: ${lastErr?.message}`);
}

// Idempotent message consumer with deduplication
async function handleIdempotent(msg: Message): Promise<void> {
  const processed = await dedup.isProcessed(msg.id);
  if (processed) {
    logger.info('duplicate message skipped', { msgId: msg.id });
    await msg.ack();
    return;
  }
  await process(msg);
  await dedup.markProcessed(msg.id, 24 * 60 * 60); // 24 hours
  await msg.ack();
}

// Event ordering via partition key
async function publishOrderEvent(orderId: string, event: DomainEvent): Promise<void> {
  await channel.publish({
    exchange: 'orders',
    routingKey: 'order.events',
    partitionKey: orderId,
    body: JSON.stringify(event),
    headers: { sequence: event.sequenceNumber },
  });
}

// Poison message isolation (separate from DLQ)
async function handleWithPoisonDetection(msg: Message): Promise<void> {
  let event: DomainEvent;
  try {
    event = JSON.parse(msg.body);
  } catch (err) {
    await poisonQueue.publish(msg, `deserialization failed: ${(err as Error).message}`);
    await msg.ack();
    return;
  }
  try {
    await process(event);
    await msg.ack();
  } catch (err) {
    if (msg.retryCount >= MAX_RETRIES) {
      await dlq.publish(msg);
      await msg.ack();
      return;
    }
    await msg.nack(false);
  }
}
```

**Reference Implementation (BAD — Outbox, Idempotency & Poison Messages):**
```typescript
// BAD: Fire-and-forget webhook — no retry, no delivery tracking
function notifyWebhook(endpoint: string, payload: unknown): void {
  fetch(endpoint, { method: 'POST', body: JSON.stringify(payload) });
  // No await, no error handling!
}

// BAD: Event published OUTSIDE transaction — lost events on rollback
async function createOrder(order: Order): Promise<void> {
  await db.orders.insert(order);
  await publisher.publish('OrderCreated', order); // Fails after DB commit = lost event
}

// BAD: Consumer without idempotency — processes duplicates
async function handle(msg: Message): Promise<void> {
  await process(msg);
}

// BAD: Poison messages treated same as processing failures
async function handle(msg: Message): Promise<void> {
  const event = JSON.parse(msg.body); // Throws on malformed — requeued forever
  await process(event);
}
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Dead Letter Queues (DLQ) configured for failed messages per messaging.md
2. (HARD GATE) Explicit Ack/Nack handling (no auto-ack) per MarsAI RabbitMQ worker pattern
3. Retry policies with exponential backoff
4. Consumer groups for parallel processing
5. Graceful shutdown of consumers (wait for processing to finish)
6. Message durability settings (persistent queues)
7. Project messaging library integration where applicable
8. Outbound webhook delivery guarantees — webhook publishing MUST implement retry with exponential backoff and delivery status tracking (not fire-and-forget HTTP calls)
9. At-least-once delivery patterns for event publishing — events MUST be published within the same transaction as the state change (transactional outbox pattern) to prevent lost events on rollback
10. Idempotent message receivers — consumers MUST implement deduplication checks (idempotency keys, message ID tracking) before processing to handle at-least-once delivery without duplicate side effects
11. Event ordering guarantees where required — order-dependent workflows MUST use partition keys or sequence numbers to guarantee processing order within a partition
12. Poison message handling — messages that repeatedly fail deserialization or schema validation MUST be isolated separately from DLQ, preventing bad messages from blocking queue consumers

**Severity Ratings:**
- CRITICAL: Messages auto-acked before processing (HARD GATE violation per MarsAI standards)
- HIGH: No DLQ for poison messages (infinite loops) — HARD GATE violation
- HIGH: No retry backoff strategy
- HIGH: Outbound webhooks with no retry mechanism (fire-and-forget HTTP call — delivery failures are silently lost)
- HIGH: Event publishing outside transaction boundary (state change commits but event publish fails — lost events, inconsistent downstream state)
- HIGH: Message consumers without idempotency checks (at-least-once delivery causes duplicate processing — double charges, duplicate records)
- MEDIUM: Missing graceful shutdown for workers
- MEDIUM: No event ordering strategy for order-dependent workflows (e.g., "order cancelled" processed before "order created")
- MEDIUM: No poison message isolation (malformed messages that fail deserialization block the queue or get retried infinitely)
- LOW: No webhook delivery status tracking/dashboard (cannot audit delivery success rates)

**Output Format:**
```
## Async Reliability Audit Findings

### Summary
- Async processing detected: Yes/No
- DLQ configured: Yes/No
- Retry strategy: Yes/No

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 28: Core Dependencies & Frameworks Auditor

```prompt
Audit core dependency usage and framework compliance for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: Sections 2 and 3 from core.md — "Core Dependencies" and "Frameworks & Libraries"}
---END STANDARDS---

**Search Patterns:**
- Files: `package.json`, `**/utils/*.ts`, `**/helpers/*.ts`, `**/common/*.ts`
- Keywords: project shared library, `@nestjs`, `express`, `typeorm`, `prisma`, `class-validator`
- Also search: Custom utility packages that may duplicate shared library functionality

**Reference Implementation (GOOD):**
```json
// package.json with required frameworks
{
  "name": "@company/project",
  "dependencies": {
    "@nestjs/core": "^10.3.x",
    "@nestjs/common": "^10.3.x",
    "typeorm": "^0.3.x",
    "class-validator": "^0.14.x",
    "class-transformer": "^0.5.x",
    "@opentelemetry/sdk-node": "^0.48.x",
    "ioredis": "^5.3.x"
  },
  "devDependencies": {
    "jest": "^29.7.x",
    "typescript": "^5.3.x"
  }
}
```

**Reference Implementation (BAD):**
```typescript
// BAD: Custom utilities that duplicate shared library functionality
// src/utils/database.ts
function connectDB(dsn: string) {
  // Custom connection logic duplicating shared library
}

// BAD: Custom telemetry wrapper duplicating shared library
// src/common/tracing.ts
function startSpan(name: string) {
  // Custom wrapper duplicating shared library telemetry
}

// BAD: Missing shared library entirely from package.json
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Project shared library present in package.json — this is mandatory per MarsAI standards
2. (HARD GATE) No custom utility packages that duplicate shared library functionality (check utils/, helpers/, common/)
3. Node.js version 20+ (engines field or .nvmrc)
4. TypeScript 5+ present
5. Framework (NestJS/Express/Fastify) present
6. Validation library (class-validator/zod) present
7. Testing framework (jest/vitest) present for testing
8. No alternative libraries used for functionality already covered by shared library

**Severity Ratings:**
- CRITICAL: Project shared library not in package.json (HARD GATE violation per MarsAI standards)
- CRITICAL: Custom utilities duplicating shared library functionality (HARD GATE violation)
- HIGH: Framework versions below MarsAI minimum requirements
- MEDIUM: Using alternative libraries for functionality covered by MarsAI stack
- LOW: Minor version discrepancies

**Output Format:**
```
## Core Dependencies & Frameworks Audit Findings

### Summary
- Project shared library present: Yes/No
- Node.js version: X (minimum 20)
- Required frameworks present: X/Y
- Custom utility packages found: [list]
- Shared library duplication detected: Yes/No

### Critical Issues
[file:line or package.json] - Description

### Recommendations
1. ...
```
```

### Agent 29: Naming Conventions Auditor

```prompt
Audit naming conventions across the codebase for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: Naming conventions from core.md section 5 (if exists) and JSON naming subsection from api-patterns.md section 1}
---END STANDARDS---

**Search Patterns:**
- Files: `**/*.ts` for interfaces/types, `**/migrations/*.sql` for column names
- Keywords: `interface`, `type`, `@Column`, `CREATE TABLE`
- Also search: Query parameter handling for naming consistency

**Reference Implementation (GOOD):**
```typescript
// TypeScript interface with correct naming conventions
interface Account {
  id: string;           // camelCase in TS
  displayName: string;  // camelCase in TS and JSON response
  accountType: string;  // camelCase in TS and JSON response
  createdAt: Date;      // camelCase in TS and JSON response
}

// Entity with column mapping
@Entity('accounts')
class AccountEntity {
  @Column({ name: 'display_name' })  // snake_case DB column
  displayName: string;                // camelCase TS property

  @Column({ name: 'account_type' })
  accountType: string;
}

// Query parameters use snake_case
// GET /v1/accounts?account_type=savings&created_after=2024-01-01

// SQL migration with snake_case columns
// CREATE TABLE accounts (
//     id UUID PRIMARY KEY,
//     display_name VARCHAR(255),
//     account_type VARCHAR(50),
//     created_at TIMESTAMP WITH TIME ZONE
// );
```

**Reference Implementation (BAD):**
```typescript
// BAD: Inconsistent JSON naming
interface Account {
  id: string;
  display_name: string;   // snake_case in response — wrong! Use camelCase
  account_type: string;   // snake_case in response — wrong! Use camelCase
  CreatedAt: Date;      // PascalCase — wrong!
}

// BAD: Mixed naming in query params
// GET /v1/accounts?accountType=savings&created_after=2024-01-01
```

**Check Against MarsAI Standards For:**
1. snake_case for database column names in migrations and entity decorators
2. camelCase for JSON response body fields and TypeScript properties
3. snake_case for query parameters
4. PascalCase for TypeScript class names, interfaces, and types
5. camelCase for TypeScript properties, variables, and functions
6. Consistent naming convention within each context (no mixing)

**Severity Ratings:**
- HIGH: Inconsistent JSON field naming across response DTOs (mix of conventions)
- MEDIUM: Query params not using snake_case
- MEDIUM: Database columns not using snake_case
- LOW: Minor naming inconsistencies within a single file

**Output Format:**
```
## Naming Conventions Audit Findings

### Summary
- JSON fields audited: X
- Using camelCase JSON: Y/X
- DB columns using snake_case: Y/Z
- Query params using snake_case: Y/Z
- Naming convention violations: N

### Issues by Convention
#### JSON Naming
[file:line] - Field "display_name" should be "displayName"

#### Database Naming
[file:line] - Column "displayName" should be "display_name"

#### Query Parameter Naming
[file:line] - Param "accountType" should be "account_type"

### Recommendations
1. ...
```
```

### Agent 30: Domain Modeling Auditor

```prompt
Audit domain modeling patterns for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "ToEntity/FromEntity" section 9 from domain.md and "Always-Valid Domain Model" section 21 from domain-modeling.md}
---END STANDARDS---

**Search Patterns:**
- Files: `**/domain/*.ts`, `**/entities/*.ts`, `**/models/*.ts`, `**/value-objects/*.ts`
- Keywords: `toEntity`, `fromEntity`, `create`, `isValid`, `private`, `readonly`
- Also search: `**/adapters/**/*.ts`, `**/mappers/**/*.ts` for mapping patterns

**Reference Implementation (GOOD):**
```typescript
// Always-valid domain model with private fields and factory method
class Account {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _accountType: AccountType,
    private readonly _status: Status,
    private readonly _createdAt: Date,
  ) {}

  // Factory method enforces invariants
  static create(name: string, accountType: AccountType): Account {
    if (!name) throw new Error('Name is required');
    if (!accountType.isValid()) throw new Error('Invalid account type');
    return new Account(
      randomUUID(),
      name,
      accountType,
      Status.Active,
      new Date(),
    );
  }

  // Public getters (no setters for immutable fields)
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get status(): Status { return this._status; }
}

// ToEntity/FromEntity mapping in adapters
class AccountMapper {
  static toEntity(dto: CreateAccountDTO): Account {
    return Account.create(dto.name, new AccountType(dto.type));
  }

  static fromEntity(account: Account): AccountResponse {
    return {
      id: account.id,
      name: account.name,
      status: account.status.toString(),
    };
  }
}
```

**Reference Implementation (BAD):**
```typescript
// BAD: Domain model with public mutable fields and no constructor
interface Account {
  id: string;           // Public + mutable!
  name: string;         // Can be set to "" directly
  accountType: string;  // No type safety
  status: string;       // No validation
}

// BAD: Direct field access without validation
const account: Account = { id: '', name: '', accountType: '', status: '' }; // Invalid state allowed!

// BAD: No toEntity/fromEntity — DTOs used directly as domain models
async function create(req: Request, res: Response) {
  const account = req.body as Account;
  await repo.save(account); // DTO goes straight to persistence!
}
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Domain models use private fields with exported getters per domain-modeling.md always-valid pattern
2. (HARD GATE) Constructors (NewXxx) enforce invariants — no invalid domain objects can be created
3. (HARD GATE) ToEntity/FromEntity mapping patterns in adapters per domain.md section 9
4. Value objects have IsValid() methods
5. No direct field access on domain models from outside the package
6. DTOs are separate from domain models (not the same struct)
7. Consistent domain modeling across all bounded contexts

**Severity Ratings:**
- CRITICAL: Domain models with exported mutable fields and no constructor (HARD GATE violation per MarsAI standards)
- CRITICAL: DTOs used directly as domain models (no ToEntity/FromEntity)
- HIGH: Missing ToEntity/FromEntity in adapters (HARD GATE violation)
- MEDIUM: Inconsistent domain modeling across modules
- MEDIUM: Value objects without IsValid()
- LOW: Minor modeling inconsistencies

**Output Format:**
```
## Domain Modeling Audit Findings

### Summary
- Domain models found: X
- Using always-valid pattern: Y/X
- With constructors (NewXxx): Y/X
- ToEntity/FromEntity present: Y/Z adapters
- Value objects with IsValid: Y/Z

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 31: Linting & Code Quality Auditor

```prompt
Audit linting configuration and code quality patterns for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Linting" section 16 from quality.md}
---END STANDARDS---

**Search Patterns:**
- Files: `.eslintrc.*`, `eslint.config.*`, `**/*.ts`
- Keywords: `eslint-disable`, `@typescript-eslint`, import grouping patterns
- Also search: Magic numbers in business logic code

**Reference Implementation (GOOD):**
```typescript
// Import ordering: 3 groups (node builtins, external, internal)
import { readFile } from 'fs/promises';
import path from 'path';

import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { AccountService } from '../domain/account.service';

// Named constants instead of magic numbers
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_PAGE_SIZE = 100;
const MIN_PASSWORD_LENGTH = 8;

// Using named constants in logic
if (retryCount >= MAX_RETRIES) {
  throw new MaxRetriesExceededError();
}
```

**Reference Implementation (BAD):**
```typescript
// BAD: Import ordering not following convention
import { AccountService } from '../domain/account.service';
import { readFile } from 'fs/promises';
import { Injectable } from '@nestjs/common';
import path from 'path';

// BAD: Magic numbers in business logic
if (retryCount >= 3) {                // What is 3?
  await sleep(30_000);                // What is 30000?
}
if (password.length < 8) {            // What is 8?
  throw new Error('too short');
}
if (pageSize > 100) {                 // What is 100?
  pageSize = 100;
}
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) eslint configuration exists per quality.md linting section
2. Import ordering follows 3-group convention (node builtins, external, internal)
3. Magic numbers replaced with named constants in business logic
4. Required rules enabled in eslint config
5. No blanket eslint-disable without specific rule name
6. Consistent code formatting (prettier applied)

**Severity Ratings:**
- HIGH: No eslint configuration (HARD GATE violation per MarsAI standards)
- MEDIUM: Magic numbers in business logic
- MEDIUM: Import ordering not following 3-group convention
- MEDIUM: Blanket eslint-disable without justification
- LOW: Minor style inconsistencies

**Output Format:**
```
## Linting & Code Quality Audit Findings

### Summary
- eslint config: Yes/No
- Import ordering violations: X files
- Magic numbers found: Y locations
- Blanket eslint-disable usage: Z locations

### Issues
#### eslint Configuration
[config status and missing rules]

#### Import Ordering
[file:line] - Imports not following 3-group convention

#### Magic Numbers
[file:line] - Magic number N used (suggest: named constant)

### Recommendations
1. ...
```
```

### Agent 32: Makefile & Dev Tooling Auditor

```prompt
Audit Makefile and development tooling for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: "Makefile Standards" section 7 from devops.md}
---END STANDARDS---

**Search Patterns:**
- Files: `Makefile`, `makefile`, `GNUmakefile`
- Keywords: `.PHONY`, `build`, `test`, `lint`, `help`, `docker`
- Also search: `scripts/*.sh` for development scripts

**Reference Implementation (GOOD):**
```makefile
.PHONY: build test lint cover up down logs setup migrate seed generate swagger docker-build docker-push clean help check

build: ## Build the application
	npm run build

test: ## Run all unit tests
	npm test

lint: ## Run linters
	npm run lint

cover: ## Run tests with coverage
	npm run test:cov

up: ## Start local dependencies (docker-compose)
	docker compose up -d

down: ## Stop local dependencies
	docker compose down

logs: ## Tail local dependency logs
	docker compose logs -f

setup: ## Initial project setup
	npm ci

migrate: ## Run database migrations
	npx knex migrate:latest

seed: ## Seed database with test data
	npx knex seed:run

generate: ## Run code generators (prisma, etc.)
	npm run generate

swagger: ## Generate Swagger documentation
	npm run swagger

docker-build: ## Build Docker image
	docker build -t app:latest .

docker-push: ## Push Docker image
	docker push app:latest

clean: ## Clean build artifacts
	rm -rf bin/ coverage.out coverage.html

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

check: ## Run all checks (lint + test + cover)
	$(MAKE) lint
	$(MAKE) test
	$(MAKE) cover
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Makefile exists in project root per devops.md
2. Required targets present: build, lint, test, cover, up, down, logs, setup, migrate, seed, generate, swagger, docker-build, docker-push, clean, help, check
3. All targets have help descriptions (## comments)
4. .PHONY declarations for non-file targets
5. `help` target shows available commands
6. `check` target runs full validation pipeline

**Severity Ratings:**
- HIGH: No Makefile in project (HARD GATE violation per MarsAI standards)
- MEDIUM: Missing required Makefile targets (list which ones are missing)
- MEDIUM: Targets without help descriptions
- LOW: Missing .PHONY declarations
- LOW: Targets without error handling

**Output Format:**
```
## Makefile & Dev Tooling Audit Findings

### Summary
- Makefile present: Yes/No
- Required targets present: X/17
- Missing targets: [list]
- Targets with help: X/Y

### Required Targets Checklist
| Target | Present | Has Help |
|--------|---------|----------|
| build | Yes/No | Yes/No |
| test | Yes/No | Yes/No |
| lint | Yes/No | Yes/No |
| cover | Yes/No | Yes/No |
| up | Yes/No | Yes/No |
| down | Yes/No | Yes/No |
| logs | Yes/No | Yes/No |
| setup | Yes/No | Yes/No |
| migrate | Yes/No | Yes/No |
| seed | Yes/No | Yes/No |
| generate | Yes/No | Yes/No |
| swagger | Yes/No | Yes/No |
| docker-build | Yes/No | Yes/No |
| docker-push | Yes/No | Yes/No |
| clean | Yes/No | Yes/No |
| help | Yes/No | Yes/No |
| check | Yes/No | Yes/No |

### Recommendations
1. ...
```
```

### Agent 33: Multi-Tenant Patterns Auditor *(CONDITIONAL)*

```prompt
CONDITIONAL: Only run this agent if MULTI_TENANT=true was detected during stack detection. If the project does not use multi-tenancy (no tenant config, no pool manager, no tenant middleware), SKIP this agent entirely and report: "Dimension 33 skipped — single-tenant project (no multi-tenant indicators detected)."

If multi-tenant IS detected, audit multi-tenant architecture patterns for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: Section 23 from multi-tenant.md}
---END STANDARDS---

**Search Patterns:**
- Files: `**/tenant*.ts`, `**/pool*.ts`, `**/middleware/*.ts`, `**/context*.ts`
- Keywords: `tenantId`, `TenantManager`, `TenantContext`, `schema`, `search_path`
- Also search: `**/jwt*.ts`, `**/auth*.ts` for tenant extraction

**Reference Implementation (GOOD):**
```typescript
// TenantMiddleware with multi-module connection injection
const tenantMiddleware = new TenantMiddleware({
  pgManagers: {
    [Module.Onboarding]: pgOnboardingManager,
    [Module.Transaction]: pgTransactionManager,
  },
  mbManagers: {
    [Module.Onboarding]: mbOnboardingManager,
    [Module.Transaction]: mbTransactionManager,
  },
  tenantCache,
  tenantLoader: tenantClient,
});

// Module-specific connection from context
const db = getTenantConnection(req, Module.Onboarding);

// Entity-scoped query — ALWAYS filter by organization_id + ledger_id
async function find(req: Request, orgId: string, ledgerId: string, id: string): Promise<Entity> {
  const db = getTenantConnection(req, Module.Transaction);
  if (!db) throw new Error(`Tenant connection missing for module ${Module.Transaction}`);
  return db('entities')
    .where({ organization_id: orgId, ledger_id: ledgerId, id })
    .first();
}
```

**Reference Implementation (BAD):**
```typescript
// BAD: Query without entity scoping — intra-tenant IDOR!
async function findById(req: Request, id: string): Promise<Entity> {
  const db = getTenantConnection(req, Module.Transaction);
  return db('entities').where({ id }).first(); // No tenant filter!
}

// BAD: Tenant ID from request header (can be spoofed)
function getTenantId(req: Request): string {
  return req.headers['x-tenant-id'] as string; // User-controlled!
}

// BAD: Using connection without specifying module in multi-module service
const db = getTenantConnection(req); // WRONG: must specify module
```

**Check Against MarsAI Standards For:**
1. (HARD GATE) Tenant ID extracted from JWT claims (not user-controlled headers/params) per multi-tenant.md
2. (HARD GATE) All database queries include entity scoping (organization_id + ledger_id)
3. (HARD GATE) TenantMiddleware with WithPG/WithMB injects tenant into request context with module-specific connections
4. Connection managers with multi-module (onboarding + transaction) architecture
5. Database-per-tenant isolation (separate databases per tenant via connection managers)
6. Tenant-scoped cache keys (Redis keys include tenant prefix via GetKeyContext)
7. No cross-tenant data leakage in list/search operations
8. Cross-module connection injection (both modules in context)
9. ErrManagerClosed handling (503 SERVICE_UNAVAILABLE)
10. EventListener configured (Redis Pub/Sub subscription for tenant lifecycle events)
11. TenantCache + TenantLoader wired to TenantMiddleware
12. OnTenantAdded callback: invalidates cache + starts consumer for new tenant
13. OnTenantRemoved callback: stops consumer + closes connections + invalidates cache
14. StopConsumer called before CloseConnection on tenant removal (ordering matters)

**Severity Ratings:**
- CRITICAL: Queries without entity scoping — intra-tenant IDOR (HARD GATE violation per MarsAI standards)
- CRITICAL: Tenant ID from user-controlled input (HARD GATE violation)
- CRITICAL: Missing TenantMiddleware with WithPG/WithMB (HARD GATE violation)
- CRITICAL: Using deprecated functions (WithPostgresManager, WithMongoManager, WithModule, GetMongoFromContext, GetKeyFromContext, GetPGConnectionFromContext, GetPGConnectionContext, GetMongoContext, ResolvePostgres, ResolveMongo, ResolveModuleDB, SetTenantIDInContext, GetPostgresForTenant, GetMongoForTenant, ContextWithPGConnection, ContextWithMongo, ContextWithModulePGConnection, GetModulePostgresForTenant, MultiPoolMiddleware, DualPoolMiddleware, SettingsWatcher, NewSettingsWatcher) — NON-COMPLIANT, MUST migrate to current API
- HIGH: No connection managers for multi-tenant pool management
- HIGH: Cache keys not tenant-scoped
- HIGH: Missing cross-module connection injection
- MEDIUM: Inconsistent tenant extraction across modules
- MEDIUM: Missing ErrManagerClosed handling
- LOW: Missing tenant validation in non-critical paths

**Output Format:**
```
## Multi-Tenant Patterns Audit Findings

### Summary
- Multi-tenant detection: Yes/No/N/A
- Tenant extraction: JWT / Header / Missing
- TenantMiddleware (WithPG/WithMB): Yes/No
- Tenant Manager: Yes/No
- Multi-module architecture: Yes/No
- Module-specific connections: Yes/No
- Queries with entity scoping: X/Y

### Critical Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 34: License Headers Auditor

```prompt
Audit license/copyright headers on source files for production readiness. If no LICENSE file exists in the project root, report all items as "N/A — No LICENSE file detected" with evidence.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: License header section from core.md section 7 (if exists), otherwise use organizational defaults}
---END STANDARDS---

**Search Patterns:**
- Files: `**/*.ts` (check first 5 lines for copyright/license header)
- Also check: `LICENSE`, `LICENSE.md`, `NOTICE` files in project root
- Keywords: `Copyright`, `Licensed under`, `SPDX-License-Identifier`

**Reference Implementation (GOOD):**
```typescript
// Copyright 2025 V4-Company. All rights reserved.
// Use of this source code is governed by the Apache License 2.0
// that can be found in the LICENSE file.
// SPDX-License-Identifier: Apache-2.0

import { Injectable } from '@nestjs/common';
```

**Reference Implementation (BAD):**
```typescript
// BAD: No license header at all
import { Injectable } from '@nestjs/common';

// BAD: Outdated year
// Copyright 2020 V4-Company. All rights reserved.
// (If current year is 2025+)

// BAD: Inconsistent header format
/* This file is part of Project X
 * (c) Company Name
 */
import { Injectable } from '@nestjs/common';
```

**Check Against MarsAI Standards For:**
1. LICENSE file exists in project root
2. All source files have copyright/license header comment in first 5 lines
3. Consistent header format across all files
4. Year in copyright is current or includes current year (e.g., "2024-2025")
5. SPDX-License-Identifier present (preferred for machine-readability)
6. License matches LICENSE file (e.g., Apache-2.0 header matches Apache-2.0 LICENSE)

**Severity Ratings:**
- HIGH: Source files missing license headers (if license headers are required)
- MEDIUM: Inconsistent license header format across files
- MEDIUM: License header does not match LICENSE file
- LOW: Outdated year in copyright header
- LOW: Missing SPDX identifier

**Output Format:**
```
## License Headers Audit Findings

### Summary
- LICENSE file present: Yes/No (type: Apache-2.0/MIT/etc.)
- Total source files: X
- Files with headers: Y/X
- Consistent format: Yes/No
- Year current: Yes/No

### Files Missing Headers
[file] - No license header found

### Inconsistent Headers
[file] - Header differs from standard format

### Recommendations
1. ...
```
```

### Agent 35: Nil/Null Safety Auditor

```prompt
Audit nil/null pointer safety and dereference risks across the codebase for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: Nil safety patterns — no dedicated standards file; patterns derived from marsai:nil-safety-reviewer agent}
---END STANDARDS---

**Search Patterns:**
- TypeScript files: `**/*.ts`, `**/*.tsx` — search for nullable access, optional chaining, destructuring, Promise handling
- Keywords (TS): `?.`, `!.`, `as `, `.find(`, `.get(`, `undefined`, `null`

**TypeScript Null Safety Patterns to Check:**

| Pattern | Risk Level | What to Look For |
|---------|:----------:|------------------|
| Missing null/undefined check | HIGH | Accessing properties on potentially null values without guards |
| Object destructuring on nullable | HIGH | `const { a } = maybeNull` — throws if null/undefined |
| Array index without bounds | HIGH | `arr[i]` without checking `arr.length > i` |
| Promise rejection unhandled | HIGH | Missing `.catch()` or try/catch around await |
| Array.find() unchecked | MEDIUM | Returns `undefined` if not found — must check before use |
| Map.get() unchecked | MEDIUM | Returns `undefined` if key missing — must check before use |
| Optional chaining misuse | MEDIUM | `a?.b.c` — protects `a` but not `b`. Should be `a?.b?.c` |
| Non-null assertion abuse | MEDIUM | Excessive non-null assertion operator (!) bypasses TypeScript's null checks |

**Tracing Methodology (MANDATORY — do not skip):**
1. **Identify null sources**: Function returns that can be null/undefined, Map lookups, external API responses
2. **Trace forward**: Follow nullable values through assignments, function arguments, object fields
3. **Trace backward**: For each access point, trace all callers to verify they handle null returns
4. **Find access points**: Property access, method calls, index access on potentially null/undefined values

**Reference Implementation (GOOD — TypeScript):**
```typescript
// GOOD: Null check before access
const user = await findUser(id);
if (!user) {
    throw new NotFoundException(`User ${id} not found`);
}
// Safe to access user.name here

// GOOD: Array.find with guard
const item = items.find(i => i.id === targetId);
if (!item) {
    return { error: 'Item not found' };
}

// GOOD: Optional chaining — full chain
const city = user?.address?.city ?? 'Unknown';
```

**Reference Implementation (BAD — TypeScript):**
```typescript
// BAD: No null check — crashes if findUser returns null
const user = await findUser(id);
console.log(user.name); // TypeError if null

// BAD: Partial optional chaining
const city = user?.address.city; // protects user but not address

// BAD: Destructuring nullable
const { name, email } = await findUser(id); // throws if null
```

**Check Against Standards For:**
1. (HIGH) Nullable values are checked before property access
2. (HIGH) Object destructuring only on guaranteed non-null values
3. (HIGH) Promise rejections are handled (try/catch around await, .catch() on promises)
4. (MEDIUM) Optional chaining covers full property chain
5. (MEDIUM) `Array.find()` and `Map.get()` results are checked before use
6. (MEDIUM) API responses use initialized arrays/objects (never return undefined where array expected)
7. (LOW) Non-null assertion operator (!) is used sparingly with justification

**Severity Ratings:**
- HIGH: Nullable property access (TypeError), unhandled Promise rejection, object destructuring on nullable
- MEDIUM: Partial optional chaining, unchecked find()/get(), non-null assertion abuse, undefined in API response where array/object expected
- LOW: Missing null documentation on exported functions, unnecessary null checks on guaranteed non-null values

**Output Format:**
```
## Nil/Null Safety Audit Findings

### Summary
- Nullable access: X unguarded property accesses
- Unhandled promises: X locations
- Optional chaining issues: X partial chains
- Non-null assertions: X locations
- API response consistency: X undefined where array/object expected

### Critical Issues
[file:line] - Description (pattern: {pattern name})

### High Issues
[file:line] - Description (pattern: {pattern name})

### Medium Issues
[file:line] - Description

### Low Issues
[file:line] - Description

### Nil Risk Trace
{For each CRITICAL/HIGH issue, show the trace: source → assignments → dereference point}

### Recommendations
1. ...
```
```

### Agent 36: Resilience Patterns Auditor

```prompt
Audit resilience patterns (circuit breakers, retries, timeouts, bulkheads) across the codebase for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: Resilience patterns — no dedicated standards file; patterns derived from industry best practices and marsai:production-readiness standards}
---END STANDARDS---

**Search Patterns:**
- TypeScript files: `**/*.ts`, `**/*.tsx` — search for circuit breaker, retry, timeout, abort, concurrency limiter patterns
- Config files: `**/*.yaml`, `**/*.yml`, `**/*.json`, `**/*.toml` — search for timeout, retry, backoff configuration
- Keywords (TS): `CircuitBreaker`, `cockatiel`, `opossum`, `p-retry`, `axios-retry`, `AbortController`, `setTimeout`, `Promise.race`, `semaphore`, `bulkhead`
- Keywords (general): `timeout`, `retry`, `circuit`, `breaker`, `backoff`, `jitter`, `bulkhead`, `resilience`

**TypeScript Resilience Patterns to Check:**

| Pattern | Risk Level | What to Look For |
|---------|:----------:|------------------|
| HTTP call without timeout | CRITICAL | `fetch()` or `axios()` calls with no timeout or AbortController — hangs indefinitely |
| No circuit breaker on critical dependency | CRITICAL | Direct HTTP calls to external services without circuit breaker protection |
| Retry without backoff | HIGH | Retry logic with fixed delay or immediate retry — thundering herd risk |
| No timeout on Promise chains | HIGH | `await someExternalCall()` with no `Promise.race` timeout wrapper — blocks event loop conceptually forever |
| No jitter on backoff | MEDIUM | Exponential backoff without random jitter — correlated retries |
| No concurrency limiting | MEDIUM | Unbounded `Promise.all()` on external calls — overwhelms downstream services |
| Hardcoded timeout values | LOW | Timeout values as inline numbers instead of configuration constants |

**Timeout Cascading Analysis (MANDATORY — do not skip):**
1. **Map the call chain**: Identify entry point timeout → middleware timeout → downstream call timeouts
2. **Verify ordering**: Outer timeout MUST be greater than inner timeout at every level
3. **Example valid cascade**: API gateway 30s > service handler 25s > database query 10s > cache lookup 2s
4. **Example INVALID cascade**: API gateway 30s > service handler 30s > database query 30s (all same = no cascading)

**Reference Implementation (GOOD — TypeScript):**
```typescript
// GOOD: Circuit breaker with cockatiel (already shown above)
// See TypeScript reference implementations below
```

**Timeout Cascading Reference (language-agnostic):**
```
// GOOD: Retry with exponential backoff + jitter (pseudocode)
function retryWithBackoff(maxRetries, fn):
    for attempt in 0..maxRetries:
        result = fn()
        if result.ok: return result
        if !isRetryable(result.error): throw result.error
        base = (2 ^ attempt) * 100ms
        jitter = random(0, base / 2)
        sleep(base + jitter)
    throw MaxRetriesExceededError
```

**Reference Implementation (GOOD — TypeScript):**
```typescript
// GOOD: Circuit breaker with cockatiel
import { CircuitBreakerPolicy, ConsecutiveBreaker, handleAll, retry, wrap } from 'cockatiel';

const circuitBreaker = new CircuitBreakerPolicy(handleAll, {
  halfOpenAfter: 30_000,
  breaker: new ConsecutiveBreaker(5),
});

const retryPolicy = retry(handleAll, {
  maxAttempts: 3,
  backoff: new ExponentialBackoff({ initialDelay: 100, maxDelay: 5000 }),
});

const policy = wrap(retryPolicy, circuitBreaker);
const result = await policy.execute(() => fetchFromDownstream());

// GOOD: Timeout with AbortController
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10_000);
try {
  const response = await fetch(url, { signal: controller.signal });
} finally {
  clearTimeout(timeout);
}
```

**Reference Implementation (BAD — TypeScript):**
```typescript
// BAD: No timeout on fetch — hangs forever
const response = await fetch(url);

// BAD: Retry in tight loop
for (let i = 0; i < 3; i++) {
  try {
    return await fetch(url);
  } catch {
    continue; // No delay!
  }
}

// BAD: Unbounded concurrent requests — overwhelms downstream
const results = await Promise.all(
  urls.map(url => fetch(url)) // No concurrency limit
);
```

**Check Against Standards For:**
1. (CRITICAL) All external HTTP clients have explicit timeouts configured
2. (CRITICAL) Critical downstream dependencies are wrapped with circuit breakers
3. (HIGH) All retry logic uses exponential backoff (not fixed delay or no delay)
4. (HIGH) Timeout cascading is correct: outer timeout > inner timeout at every level
5. (MEDIUM) Retry backoff includes jitter to prevent synchronized retries
6. (MEDIUM) Bulkhead isolation exists between dependency pools (separate connection pools, bounded concurrency)
7. (MEDIUM) Concurrency is bounded on parallel external calls (p-limit, semaphore, or similar)
8. (LOW) Timeout and retry values are configurable (not hardcoded magic numbers)
9. (LOW) Transient errors are retried; non-transient errors fail fast

**Severity Ratings:**
- CRITICAL: No timeout on external HTTP calls (service hangs indefinitely), no circuit breaker on critical downstream dependency (cascading failure to all instances)
- HIGH: Retry without backoff (thundering herd on recovery), inner timeout >= outer timeout (timeout cascade violation), no timeout on Promise chains (TypeScript)
- MEDIUM: No jitter on retry backoff (correlated retries), no bulkhead isolation between pools (one slow dependency affects all), unbounded concurrent external calls
- LOW: Hardcoded timeout values (hard to tune), no retry on transient errors (reduced availability), missing resilience documentation

**Output Format:**
```
## Resilience Patterns Audit Findings

### Summary
- Language(s) detected: {TypeScript / Mixed}
- HTTP clients audited: X total, Y without timeouts
- Circuit breakers found: X (covering Y of Z external dependencies)
- Retry patterns found: X total, Y without backoff, Z without jitter
- Timeout cascade: Valid/Invalid (deepest chain: {description})
- Bulkhead patterns: X isolation boundaries found

### Critical Issues
[file:line] - Description (pattern: {pattern name})
  Evidence: {code snippet}
  Impact: {what happens in production}
  Fix: {specific remediation}

### High Issues
[file:line] - Description (pattern: {pattern name})
  Evidence: {code snippet}
  Fix: {specific remediation}

### Medium Issues
[file:line] - Description

### Low Issues
[file:line] - Description

### Timeout Cascade Map
{Entry point} (Xs) → {middleware} (Ys) → {downstream} (Zs)
Status: Valid/INVALID — {explanation}

### Recommendations
1. ...
```
```

### Agent 37: Secret Scanning Auditor

```prompt
Audit the codebase for hardcoded secrets, credentials, API keys, tokens, and sensitive data exposure for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: Secret scanning patterns — no dedicated standards file; patterns derived from industry secret detection rules (GitHub secret scanning, truffleHog, gitleaks)}
---END STANDARDS---

**Search Patterns:**
- All source files: `**/*.ts`, `**/*.tsx`, `**/*.js`, `**/*.jsx`
- Configuration files: `**/*.yaml`, `**/*.yml`, `**/*.json`, `**/*.toml`, `**/*.ini`, `**/*.conf`, `**/*.cfg`
- Environment files: `**/*.env`, `**/*.env.*`, `.env.local`, `.env.production`
- Key/certificate files: `**/*.pem`, `**/*.key`, `**/*.p12`, `**/*.pfx`, `**/*.crt`, `**/*.cer`
- Docker/CI: `**/Dockerfile*`, `**/.github/workflows/*.yml`, `**/docker-compose*.yml`, `**/.gitlab-ci.yml`
- Keywords (credentials): `password`, `passwd`, `pwd`, `secret`, `api_key`, `apikey`, `api-key`, `token`, `auth_token`, `access_token`, `private_key`, `credential`
- Keywords (connection): `connection_string`, `conn_str`, `database_url`, `redis_url`, `mongodb_uri`, `dsn`
- Keywords (cloud): `AKIA`, `ASIA` (AWS), `AIza` (GCP), `ghp_`, `gho_`, `ghu_` (GitHub), `sk-` (OpenAI/Stripe), `xoxb-`, `xoxp-` (Slack)
- Patterns (high-entropy): Base64 strings > 20 chars, hex strings > 32 chars, `eyJ` (JWT prefix)
- Patterns (private keys): `-----BEGIN.*PRIVATE KEY-----`, `-----BEGIN RSA`, `-----BEGIN EC`, `-----BEGIN OPENSSH`

**Secret Detection Patterns to Check:**

| Pattern | Risk Level | What to Look For |
|---------|:----------:|------------------|
| Private keys in source | CRITICAL | `-----BEGIN RSA PRIVATE KEY-----` or similar PEM blocks committed to repo |
| Cloud provider credentials | CRITICAL | AWS access keys (`AKIA...`), GCP service account JSON, Azure client secrets in source |
| Database connection strings with passwords | CRITICAL | `postgres://user:password@`, `mongodb+srv://user:pass@`, `mysql://root:pass@` |
| API keys/tokens hardcoded | HIGH | `const API_KEY = "sk-..."`, `token: "ghp_..."`, inline bearer tokens |
| .env files in version control | HIGH | `.env`, `.env.production` tracked by git (not in .gitignore) |
| JWT tokens hardcoded | HIGH | Strings starting with `eyJ` (base64-encoded JSON header) in source code |
| Secrets in CI/CD config | HIGH | Plaintext secrets in GitHub Actions workflows, Docker compose, or CI config |
| Secrets in config files without encryption | MEDIUM | Passwords or tokens in YAML/JSON/TOML config files not using vault references |
| Secrets in comments or documentation | MEDIUM | Example credentials in comments that are actually real, or TODO with temp credentials |
| Secrets in test fixtures | MEDIUM | Test files containing what appear to be real credentials (not obviously fake) |
| Weak secret references | LOW | Hardcoded default passwords like `password123`, `admin`, `changeme` in non-test code |
| Example credentials resembling real ones | LOW | Test/example values that follow real credential formats (could confuse scanning tools) |

**Gitignore Verification (MANDATORY — do not skip):**
1. **Check .gitignore exists** at repository root
2. **Verify .env exclusion**: `.env`, `.env.*`, `.env.local`, `.env.production` MUST be in .gitignore
3. **Verify key file exclusion**: `*.pem`, `*.key`, `*.p12`, `*.pfx` SHOULD be in .gitignore
4. **Check for tracked .env files**: `git ls-files '*.env*'` — any results are HIGH severity findings
5. **Check for tracked key files**: `git ls-files '*.pem' '*.key'` — any results are CRITICAL

**Reference Implementation (GOOD):**
```typescript
// GOOD: Secrets from environment
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

// GOOD: Secret from config service
const apiKey = await configService.getSecret('EXTERNAL_API_KEY');
```

```yaml
# GOOD: .gitignore includes secret files
.env
.env.*
.env.local
.env.production
*.pem
*.key
*.p12
*.pfx
credentials.json
```

**Reference Implementation (BAD):**
```typescript
// BAD: Hardcoded API key
const API_KEY = 'sk-proj-abc123xyz789...';

// BAD: Hardcoded database connection with password
const DATABASE_URL = 'postgres://admin:SuperSecret123@db.example.com:5432/production';

// BAD: Hardcoded AWS credentials
const AWS_ACCESS_KEY = 'AKIAIOSFODNN7EXAMPLE';
const AWS_SECRET_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';

// BAD: Inline token
const headers = {
  Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};

// BAD: Hardcoded connection string
const mongoUri = 'mongodb+srv://admin:P@ssw0rd@cluster0.example.mongodb.net/prod';
```

```yaml
# BAD: Secrets in docker-compose.yml
services:
  app:
    environment:
      - DB_PASSWORD=MySecretPassword123
      - API_KEY=sk-live-abc123
```

**Check Against Standards For:**
1. (CRITICAL) No private keys (RSA, SSH, TLS) committed to source control
2. (CRITICAL) No cloud provider credentials (AWS access keys, GCP service account JSON, Azure secrets) in source
3. (CRITICAL) No database connection strings with embedded passwords in source code
4. (HIGH) No API keys or tokens hardcoded in source files (MUST come from environment or secret manager)
5. (HIGH) .env files are in .gitignore and not tracked by git
6. (HIGH) No plaintext secrets in CI/CD configuration files
7. (HIGH) No hardcoded JWT tokens in source code
8. (MEDIUM) Configuration files use vault references or environment variable substitution for secrets
9. (MEDIUM) No real-looking credentials in comments, documentation, or TODO items
10. (MEDIUM) Test fixtures use obviously fake credentials (e.g., `test-key-not-real`, not `sk-abc123`)
11. (LOW) No default passwords like `password`, `admin`, `changeme` in non-test code
12. (LOW) Example credentials in documentation are clearly marked as fake

**Severity Ratings:**
- CRITICAL: Private keys committed to repo (full compromise), cloud provider credentials in source (account takeover), database connection strings with passwords (data breach)
- HIGH: API keys/tokens hardcoded (service compromise), .env tracked by git (secret exposure on clone), secrets in CI/CD config (pipeline compromise), hardcoded JWT tokens (authentication bypass)
- MEDIUM: Secrets in config files without encryption (exposure if config leaked), real-looking credentials in comments (confusion, potential real secrets), test fixtures with real-format secrets (may be actual secrets)
- LOW: Default/weak passwords in non-test code (brute force risk), example credentials resembling real format (scanner noise)

**Output Format:**
```
## Secret Scanning Audit Findings

### Summary
- Files scanned: X
- Secrets found: Y total (Z unique)
- .gitignore coverage: Adequate/Inadequate
- .env files tracked: X (MUST be 0)
- Key/certificate files tracked: X (MUST be 0)
- Secret management approach: {env vars / vault / config service / mixed / none detected}

### Critical Issues
[file:line] - Description (type: {secret type})
  Evidence: {redacted snippet showing pattern, NOT the actual secret}
  Impact: {what an attacker could do with this secret}
  Fix: Move to environment variable or secret manager; rotate immediately

### High Issues
[file:line] - Description (type: {secret type})
  Evidence: {redacted snippet}
  Fix: {specific remediation}

### Medium Issues
[file:line] - Description

### Low Issues
[file:line] - Description

### .gitignore Analysis
- .env patterns: {listed / missing}
- Key file patterns: {listed / missing}
- Tracked secret files: {list or "none"}

### Recommendations
1. ...

### IMPORTANT: Secret Rotation Notice
{If any CRITICAL or HIGH secrets are found, include this notice:}
WARNING: Any secrets found in source code MUST be considered compromised.
Rotate all affected credentials IMMEDIATELY — removing from code is not sufficient.
```
```

### Agent 38: API Versioning Auditor

```prompt
Audit API versioning strategy, backward compatibility practices, and deprecation management across the codebase for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: API versioning patterns — no dedicated standards file; patterns derived from REST API design best practices and marsai:production-readiness standards}
---END STANDARDS---

**Search Patterns:**
- Route definitions: `**/*.ts`, `**/*.tsx` — search for route decorators, Express/Fastify route registrations, controller paths
- API specs: `**/openapi*.yaml`, `**/openapi*.json`, `**/swagger*.yaml`, `**/swagger*.json`, `**/*.proto`
- Config/Gateway: `**/nginx*.conf`, `**/traefik*.yaml`, `**/gateway*.yaml`, `**/kong*.yaml`
- Keywords (versioning): `/v1/`, `/v2/`, `/v3/`, `/api/v`, `version`, `api-version`, `Accept-Version`, `X-API-Version`
- Keywords (deprecation): `deprecated`, `Deprecated`, `@deprecated`, `Sunset`, `sunset`, `migration`, `breaking`
- Keywords (routing): `Router`, `Route`, `Controller`, `@Get`, `@Post`, `@Put`, `@Delete`, `app.use`, `app.get`, `app.post`
- Keywords (compatibility): `breaking`, `backward`, `compatible`, `migration`, `changelog`

**API Versioning Patterns to Check:**

| Pattern | Risk Level | What to Look For |
|---------|:----------:|------------------|
| No versioning strategy | HIGH | API endpoints with no version prefix or header — breaking changes have no migration path |
| Multiple versions without deprecation | HIGH | `/v1/` and `/v2/` both active with no deprecation notice or sunset timeline on v1 |
| Inconsistent versioning | MEDIUM | Some endpoints use `/v1/` prefix, others are unversioned — confusing for consumers |
| No Sunset headers on deprecated endpoints | MEDIUM | Deprecated API versions return responses without `Sunset` or `Deprecation` headers |
| No version documentation | LOW | API version exists but no changelog or migration guide documents the differences |
| No version negotiation | LOW | No mechanism for clients to request specific version via headers |
| Mixed versioning strategies | MEDIUM | Some endpoints use URL versioning (`/v1/`), others use header versioning — inconsistent approach |
| Deprecated code still in main paths | MEDIUM | Code marked `@deprecated` or `// Deprecated` is still in active request handling paths |

**TypeScript-Specific Patterns:**

| Pattern | What to Look For |
|---------|------------------|
| Controller versioning | `@Controller('v1/users')`, route prefix decorators |
| Express route groups | `app.use('/v1', v1Router)`, `app.use('/v2', v2Router)` |
| Deprecation decorators | `@Deprecated()`, `@ApiDeprecated()`, JSDoc `@deprecated` tags |
| OpenAPI version tags | `info.version` in OpenAPI spec, version tags on operations |

**Versioning Strategy Analysis (MANDATORY — do not skip):**
1. **Identify strategy**: URL path (`/v1/`), header (`Accept-Version`), query param (`?version=1`), content negotiation, or none
2. **Verify consistency**: All endpoints MUST follow the same versioning strategy
3. **Check all routes**: Map all registered routes and categorize as versioned or unversioned
4. **Identify deprecated versions**: Find which versions are marked for deprecation and their sunset timeline
5. **Check backward compatibility**: Look for breaking changes within a single version (field removals, type changes, required field additions)

**Reference Implementation (GOOD — TypeScript):**
```typescript
// GOOD: Versioned controllers with NestJS
@Controller('v1/users')
export class UsersV1Controller {
  /** @deprecated Use v2/users instead. Sunset: 2025-03-01 */
  @Get()
  @Header('Sunset', 'Sat, 01 Mar 2025 00:00:00 GMT')
  @Header('Deprecation', 'true')
  async listUsers() { /* ... */ }
}

@Controller('v2/users')
export class UsersV2Controller {
  @Get()
  async listUsers() { /* ... */ }
}

// GOOD: Express versioned route groups
app.use('/v1', deprecationMiddleware, v1Router);
app.use('/v2', v2Router);

function deprecationMiddleware(req, res, next) {
  res.set('Sunset', 'Sat, 01 Mar 2025 00:00:00 GMT');
  res.set('Deprecation', 'true');
  next();
}
```

**Reference Implementation (BAD — TypeScript):**
```typescript
// BAD: No versioning
@Controller('users')
export class UsersController {
  @Get()
  async listUsers() { /* ... */ }
}

// BAD: Breaking change in same version (field renamed without new version)
// Before: { "userName": "..." }
// After:  { "name": "..." }  // Clients break!
```

**Check Against Standards For:**
1. (HIGH) A versioning strategy exists and is documented (URL path, header, or content negotiation)
2. (HIGH) Deprecated API versions have sunset dates and deprecation notices
3. (MEDIUM) All API endpoints follow the same versioning strategy consistently
4. (MEDIUM) Deprecated endpoints return `Sunset` and/or `Deprecation` headers
5. (MEDIUM) No mixed versioning approaches (URL vs header) within the same API
6. (MEDIUM) Breaking changes are only introduced in new versions, not within existing versions
7. (LOW) API changelog or migration guide exists for version transitions
8. (LOW) Version negotiation mechanism is available for clients
9. (LOW) Infrastructure endpoints (/health, /ready, /metrics) are excluded from versioning (acceptable)

**Severity Ratings:**
- HIGH: No versioning strategy at all (breaking changes break all consumers with no migration path), multiple active versions with no deprecation or sunset timeline (consumers don't know which to use or when old versions will be removed)
- MEDIUM: Inconsistent versioning across endpoints (confusing API surface), no Sunset/Deprecation headers on deprecated versions (consumers unaware of upcoming removal), mixed versioning strategies (URL and header in same API), breaking changes within a single version (contract violation), deprecated code still actively serving without notice
- LOW: Missing version documentation or changelog (consumers must guess differences), no version negotiation mechanism (reduced client flexibility), infrastructure endpoints not versioned (this is actually acceptable)

**Output Format:**
```
## API Versioning Audit Findings

### Summary
- Versioning strategy detected: {URL path / Header / Query param / Content negotiation / None / Mixed}
- API versions found: {v1, v2, ...} or "No versioning detected"
- Total endpoints: X
- Versioned endpoints: Y/X
- Unversioned endpoints: Z/X (list if infrastructure: /health, /metrics, etc.)
- Deprecated versions: {list with sunset dates, or "none marked"}
- Breaking changes in same version: X found

### Route Map
| Version | Endpoints | Status | Sunset Date |
|---------|-----------|--------|-------------|
| v1 | X endpoints | Deprecated / Active | YYYY-MM-DD / N/A |
| v2 | Y endpoints | Active | N/A |
| unversioned | Z endpoints | Active | N/A |

### High Issues
[file:line] - Description
  Evidence: {code snippet showing the issue}
  Impact: {what happens to API consumers}
  Fix: {specific remediation}

### Medium Issues
[file:line] - Description
  Evidence: {code snippet}
  Fix: {specific remediation}

### Low Issues
[file:line] - Description

### Versioning Consistency Check
- Strategy: {consistent / inconsistent}
- Deviations: {list endpoints that don't follow the primary strategy}

### Recommendations
1. ...
```
```

### Agent 39: Graceful Degradation Auditor

```prompt
Audit graceful degradation and fallback behavior when downstream dependencies fail for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: Graceful degradation patterns — no dedicated standards file; patterns derived from operational readiness best practices}
---END STANDARDS---

**Search Patterns:**
- TypeScript files: `**/*.ts`, `**/*.tsx` — search for fallback chains, error boundaries, feature flag SDKs, service workers
- Config files: `**/*.yaml`, `**/*.yml`, `**/*.json` — search for feature flag configuration, fallback settings
- Keywords (TS): `fallback`, `ErrorBoundary`, `errorBoundary`, `featureFlag`, `feature_flag`, `LaunchDarkly`, `unleash`, `serviceWorker`, `caches.match`, `circuitBreaker`, `singleflight`

**TypeScript Graceful Degradation Patterns to Check:**

| Pattern | Risk Level | What to Look For |
|---------|:----------:|------------------|
| No fallback for critical paths | CRITICAL | Payment or checkout flows with no fallback when API fails |
| No error boundaries | HIGH | React components without ErrorBoundary wrappers for isolating failures |
| No service worker caching | MEDIUM | Frontend serves blank page when API is unavailable instead of cached content |
| No feature flag integration | MEDIUM | Features shipped without flag SDK (LaunchDarkly, Unleash, custom) |
| Missing retry with fallback | MEDIUM | API calls that retry forever or fail immediately instead of falling back |
| No offline support | LOW | App provides no indication or functionality when network is unavailable |

**Fallback Chain Methodology (MANDATORY — do not skip):**
1. **Identify critical paths**: Map all endpoints/flows that involve payment, authentication, or data mutation
2. **Trace dependencies**: For each critical path, list all downstream dependencies (DB, cache, external APIs, message queues)
3. **Check fallback existence**: For each dependency, verify there is a fallback path when it is unavailable
4. **Verify cache-aside**: For read-heavy endpoints, verify cached/stale data can be served when primary source is down
5. **Check kill switches**: For new or risky features, verify feature flags exist for quick disable

**Reference Implementation (GOOD — TypeScript):**
```typescript
// GOOD: Fallback chain — try primary, secondary, then cached
async function fetchUserProfile(userId: string): Promise<UserProfile> {
    try {
        return await primaryAPI.getUser(userId);
    } catch {
        try {
            return await secondaryAPI.getUser(userId);
        } catch {
            const cached = await cache.get(`user:${userId}`);
            if (cached) return cached;
            throw new ServiceDegradedError('User profile unavailable');
        }
    }
}

// GOOD: Error boundary isolating component failures
function App() {
    return (
        <ErrorBoundary fallback={<FallbackUI />}>
            <Dashboard />
        </ErrorBoundary>
    );
}
```

**Reference Implementation (BAD — TypeScript):**
```typescript
// BAD: No fallback — UI crashes when API fails
async function fetchUserProfile(userId: string): Promise<UserProfile> {
    const response = await fetch(`/api/users/${userId}`);
    return response.json(); // no error handling, no fallback
}

// BAD: No error boundary — one component crash takes down entire app
function App() {
    return <Dashboard />; // if Dashboard throws, entire app white-screens
}
```

**Check Against Standards For:**
1. (CRITICAL) Critical payment/transaction paths have fallback when downstream fails
2. (HIGH) Service does not crash when any single dependency is unavailable
3. (HIGH) Read-heavy endpoints can serve cached/default responses when primary source is down
4. (HIGH) React/frontend apps use error boundaries to isolate component failures
5. (MEDIUM) New or risky features have feature flags or kill switches for quick disable
6. (MEDIUM) Endpoints return partial data with degradation indicators instead of full failure
7. (MEDIUM) Retry logic includes fallback path, not infinite retry
8. (LOW) Responses include degradation status indicators (headers, fields) when serving fallback data
9. (LOW) Frontend provides offline or degraded-mode experience

**Severity Ratings:**
- CRITICAL: No fallback for critical payment/transaction/auth paths — service is fully unavailable when dependency fails
- HIGH: Service crashes (panic/500) when any single dependency (Redis, DB, external API) is unavailable; no cached response capability for read-heavy endpoints; no error boundaries in frontend
- MEDIUM: No feature flags for risky new features; all-or-nothing responses with no partial degradation; retry without fallback
- LOW: No degradation status indicators in responses; no offline support in frontend

**Output Format:**
```
## Graceful Degradation Audit Findings

### Summary
- Critical paths identified: X
- Paths with fallback: Y/X
- Cache-aside patterns: Y (of Z read-heavy endpoints)
- Feature flags present: Yes/No (library: {name})
- Error boundaries (TS): Y/Z components
- Kill switches for new features: Yes/No

### Critical Issues
[file:line] - Description (pattern: {pattern name})

### High Issues
[file:line] - Description (pattern: {pattern name})

### Medium Issues
[file:line] - Description

### Low Issues
[file:line] - Description

### Dependency Failure Impact Map
{For each critical path, show: dependency → failure mode → current behavior → recommended fallback}

### Recommendations
1. ...
```
```

### Agent 40: Caching Patterns Auditor

```prompt
Audit caching patterns, invalidation strategies, and cache safety for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: Caching patterns — no dedicated standards file; patterns derived from quality and maintainability best practices}
---END STANDARDS---

**Search Patterns:**
- TypeScript files: `**/*.ts`, `**/*.tsx` — search for cache-aside patterns, LRU cache, ioredis, node-cache
- Config files: `**/*.yaml`, `**/*.yml`, `**/*.env*` — search for cache TTL, Redis connection, eviction settings
- Keywords (TS): `node-cache`, `ioredis`, `createClient`, `cache.set`, `cache.get`, `lru-cache`, `LRUCache`, `cache.del`, `invalidate`, `Redis`, `ttl`, `singleflight`

**TypeScript Caching Patterns to Check:**

| Pattern | Risk Level | What to Look For |
|---------|:----------:|------------------|
| Unbounded cache growth | CRITICAL | In-memory cache with no `max` or `maxSize` — leads to OOM |
| No invalidation on writes | HIGH | Mutation endpoints don't clear related cache entries |
| Cache stampede vulnerability | HIGH | No locking or coalescing on concurrent cache misses |
| Non-tenant-scoped keys | HIGH | Cache keys without tenant context in multi-tenant system |
| No TTL on Redis keys | MEDIUM | `redis.set(key, value)` without `EX` — keys persist forever |
| Inconsistent TTL strategy | MEDIUM | Random TTL values scattered across codebase |
| Missing error handling for cache | MEDIUM | Cache failure crashes request instead of falling through to source |
| No cache hit/miss metrics | LOW | Cannot measure cache effectiveness |

**Cache Safety Methodology (MANDATORY — do not skip):**
1. **Inventory caches**: Find all cache instances (in-memory, Redis, CDN) and their usage
2. **Check bounds**: Verify every cache has TTL, max-size, or eviction policy — no unbounded growth
3. **Check invalidation**: For every write/mutation path, verify the corresponding cache entry is invalidated
4. **Check stampede protection**: Verify singleflight, distributed locks, or request coalescing on cache miss paths
5. **Check tenant isolation**: In multi-tenant systems, verify all cache keys include tenant context
6. **Check consistency**: Verify TTL values are consistent for similar data types

**Reference Implementation (GOOD — TypeScript):**
```typescript
// GOOD: Bounded LRU cache with TTL
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, Product>({
    max: 500,           // max entries
    ttl: 1000 * 60 * 5, // 5 minute TTL
});

// GOOD: Tenant-scoped cache key with invalidation on write
async function updateProduct(tenantId: string, id: string, data: ProductUpdate): Promise<void> {
    await db.products.update(id, data);
    cache.delete(`${tenantId}:product:${id}`);
}

// GOOD: Cache failure falls through to source
async function getProduct(tenantId: string, id: string): Promise<Product> {
    const key = `${tenantId}:product:${id}`;
    try {
        const cached = await redis.get(key);
        if (cached) return JSON.parse(cached);
    } catch {
        // Cache failure — fall through to DB
    }
    const product = await db.products.findById(id);
    try {
        await redis.set(key, JSON.stringify(product), 'EX', 300);
    } catch {
        // Cache write failure — non-fatal
    }
    return product;
}
```

**Reference Implementation (BAD — TypeScript):**
```typescript
// BAD: Unbounded cache — no max, no TTL
const cache = new Map<string, any>(); // grows forever

// BAD: No tenant prefix — data leak in multi-tenant system
cache.set(`product:${id}`, product); // missing tenant context

// BAD: Cache failure crashes request
async function getProduct(id: string): Promise<Product> {
    const cached = await redis.get(`product:${id}`); // throws if Redis down
    if (cached) return JSON.parse(cached);
    return db.products.findById(id);
}

// BAD: No invalidation — write to DB but cache still has old data
async function updateProduct(id: string, data: ProductUpdate): Promise<void> {
    await db.products.update(id, data);
    // cache still has stale product data
}
```

**Check Against Standards For:**
1. (CRITICAL) All caches have TTL, max-size, or eviction policy — no unbounded growth
2. (HIGH) Cache entries are invalidated when underlying data is mutated
3. (HIGH) Cache stampede protection exists (singleflight, distributed locks, request coalescing)
4. (HIGH) Cache keys are tenant-scoped in multi-tenant systems
5. (MEDIUM) TTL values are consistent for similar data types across codebase
6. (MEDIUM) Cache failures do not crash requests (graceful fallthrough to source)
7. (MEDIUM) Cache warming strategy exists for cold-start scenarios
8. (LOW) Cache hit/miss/eviction metrics are tracked
9. (LOW) Cache keys include version prefix for schema change safety

**Severity Ratings:**
- CRITICAL: Unbounded cache growth (no TTL, no eviction, no max-size) — OOM risk in production
- HIGH: No cache invalidation on writes (stale data served indefinitely), cache stampede vulnerability (thundering herd to DB), non-tenant-scoped keys in multi-tenant system (data leak)
- MEDIUM: Inconsistent TTL values, cache failure crashes request, no cache warming for cold-start, no TTL on Redis keys
- LOW: Missing cache hit/miss metrics, no cache key versioning strategy

**Output Format:**
```
## Caching Patterns Audit Findings

### Summary
- Cache instances found: X (in-memory: Y, Redis: Z, CDN: W)
- Caches with TTL/eviction: Y/X
- Stampede protection: Yes/No (mechanism: singleflight / locks / none)
- Multi-tenant key scoping: Yes/No/N/A
- Invalidation on writes: Y/Z write paths
- Cache metrics instrumented: Yes/No

### Critical Issues
[file:line] - Description (pattern: {pattern name})

### High Issues
[file:line] - Description (pattern: {pattern name})

### Medium Issues
[file:line] - Description

### Low Issues
[file:line] - Description

### Cache Inventory
| Cache | Type | Max Size | TTL | Eviction | Stampede Protection | Tenant-Scoped |
|-------|------|----------|-----|----------|---------------------|---------------|
| ... | ... | ... | ... | ... | ... | ... |

### Recommendations
1. ...
```
```

### Agent 41: Data Encryption at Rest Auditor

```prompt
Audit data encryption at rest, key management, and sensitive data protection for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: Data encryption patterns — no dedicated standards file; patterns derived from security best practices and OWASP guidelines}
---END STANDARDS---

**Search Patterns:**
- TypeScript files: `**/*.ts`, `**/*.tsx` — search for crypto modules, encryption utilities, password hashing
- Config files: `**/*.yaml`, `**/*.yml`, `**/*.env*`, `**/docker-compose*` — search for encryption keys, database encryption settings
- SQL/Migration files: `**/*.sql`, `**/migrations/**` — search for sensitive columns, pgcrypto, encryption extensions
- Keywords (TS): `crypto`, `createCipheriv`, `createDecipheriv`, `node-forge`, `bcrypt`, `argon2`, `scrypt`, `pbkdf2`
- Keywords (DB): `pgcrypto`, `encrypt`, `decrypt`, `gen_salt`, `crypt`, `ENCRYPTED`, `BYTEA`
- Keywords (Config): `ENCRYPTION_KEY`, `MASTER_KEY`, `KMS`, `vault`, `SECRET_KEY`, `CIPHER`

**Sensitive Data Patterns to Identify:**

| Data Type | Identifiers | Required Protection |
|-----------|-------------|---------------------|
| Passwords | `password`, `passwd`, `pass`, `secret` | Hashed with bcrypt/argon2/scrypt (NEVER plaintext, NEVER reversible encryption) |
| Credit cards | `credit_card`, `card_number`, `pan`, `cc_num` | Field-level encryption (AES-256-GCM), masked in logs |
| Bank accounts | `bank_account`, `account_number`, `iban`, `routing` | Field-level encryption |
| SSN / Tax IDs | `ssn`, `tax_id`, `national_id`, `social_security` | Field-level encryption |
| API keys / tokens | `api_key`, `token`, `secret_key`, `access_key` | Encrypted at rest, never in source |
| PII (general) | `email`, `phone`, `address`, `date_of_birth` | Encryption recommended for regulated environments |

**Encryption Safety Methodology (MANDATORY — do not skip):**
1. **Inventory sensitive fields**: Scan models, database schemas, and API payloads for sensitive data types
2. **Check password hashing**: Verify all password storage uses bcrypt, argon2, or scrypt — NEVER plaintext or reversible encryption
3. **Check field encryption**: Verify financial and identity data uses AES-256-GCM or equivalent field-level encryption
4. **Check key management**: Verify encryption keys come from KMS, Vault, or secure secret store — NOT from source code or .env files
5. **Check backups**: Verify database backup processes include encryption
6. **Check algorithm strength**: Flag use of MD5, SHA1, DES, RC4, or other deprecated algorithms

**TypeScript Encryption Patterns to Check:**

| Pattern | Risk Level | What to Look For |
|---------|:----------:|------------------|
| Plaintext passwords | CRITICAL | Password stored/compared as plain string without hashing |
| Weak hash for passwords | CRITICAL | `crypto.createHash('md5')` or `crypto.createHash('sha1')` for passwords |
| Unencrypted sensitive data | CRITICAL | PII or financial data stored without encryption |
| Keys in source | HIGH | Encryption keys hardcoded in TypeScript files |
| No key rotation | MEDIUM | Static encryption key with no versioning |
| Weak algorithm | MEDIUM | `createCipheriv('des', ...)`, `createCipheriv('aes-128-ecb', ...)` |

**Reference Implementation (GOOD — TypeScript):**
```typescript
// GOOD: Password hashing with argon2
import argon2 from 'argon2';

async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
}

async function verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
}

// GOOD: AES-256-GCM field encryption
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

function encryptField(plaintext: string, key: Buffer): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
}
```

**Reference Implementation (BAD — TypeScript):**
```typescript
// BAD: Plaintext password comparison
async function login(email: string, password: string): Promise<User> {
    const user = await db.users.findByEmail(email);
    if (user.password !== password) throw new Error('Invalid'); // plaintext!
    return user;
}

// BAD: MD5 for hashing
import { createHash } from 'crypto';
const hash = createHash('md5').update(password).digest('hex');

// BAD: Encryption key in source
const ENCRYPTION_KEY = 'hardcoded-secret-key-do-not-do-this';
```

**Check Against Standards For:**
1. (CRITICAL) All passwords are hashed with bcrypt, argon2, or scrypt — never plaintext or reversible encryption
2. (CRITICAL) Credit card and financial data is encrypted at rest with AES-256-GCM or equivalent
3. (CRITICAL) No weak hashing algorithms (MD5, SHA1) used for passwords or security-sensitive data
4. (HIGH) PII (SSN, tax ID, national ID) is encrypted with field-level encryption
5. (HIGH) Encryption keys are stored in KMS, Vault, or secure secret store — not in source code or .env files
6. (HIGH) Database backups are encrypted
7. (MEDIUM) No deprecated/weak encryption algorithms (DES, RC4, AES-ECB)
8. (MEDIUM) Key rotation mechanism exists (key versioning, re-encryption strategy)
9. (LOW) Non-sensitive data is not unnecessarily encrypted (performance overhead)

**Severity Ratings:**
- CRITICAL: Plaintext password storage, credit card/financial data stored unencrypted, weak hash algorithms (MD5/SHA1) for passwords
- HIGH: PII stored without field-level encryption, encryption keys in source code or .env, unencrypted backups, no key management strategy
- MEDIUM: Weak encryption algorithms (DES, RC4, AES-ECB), no key rotation mechanism, SHA256 used for password hashing (use bcrypt/argon2 instead)
- LOW: Non-sensitive data encrypted unnecessarily (performance overhead), missing encryption documentation

**Output Format:**
```
## Data Encryption at Rest Audit Findings

### Summary
- Sensitive data types found: {password, credit card, SSN, ...}
- Password hashing: {bcrypt / argon2 / scrypt / MD5 / SHA1 / plaintext}
- Field encryption: {AES-256-GCM / AES-ECB / none}
- Key management: {Vault / KMS / env var / hardcoded / none}
- Key rotation: Yes/No
- Backup encryption: Yes/No/Unknown

### Critical Issues
[file:line] - Description (data type: {type}, current protection: {none/weak})

### High Issues
[file:line] - Description (data type: {type})

### Medium Issues
[file:line] - Description

### Low Issues
[file:line] - Description

### Sensitive Data Inventory
| Field/Column | Data Type | Location | Current Protection | Required Protection | Gap |
|-------------|-----------|----------|-------------------|--------------------|----|
| ... | ... | ... | ... | ... | ... |

### Recommendations
1. ...
```
```

### Agent 42: Resource Leak Prevention Auditor

```prompt
Audit resource leak risks including unclosed handles, connection leaks, and cleanup failures for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: Resource leak patterns — no dedicated standards file; patterns derived from TypeScript runtime behavior and production failure analysis}
---END STANDARDS---

**Search Patterns:**
- TypeScript files: `**/*.ts`, `**/*.tsx` — search for stream cleanup, event listeners, AbortController, finally blocks, using declarations
- Keywords (TS): `finally`, `addEventListener`, `removeEventListener`, `AbortController`, `.destroy()`, `.close()`, `.end()`, `createReadStream`, `createWriteStream`, `using`, `Symbol.dispose`, `setInterval`, `clearInterval`

**TypeScript Resource Leak Patterns to Check:**

| Pattern | Risk Level | What to Look For |
|---------|:----------:|------------------|
| Stream not closed on error | CRITICAL | `createReadStream` / `createWriteStream` without error-path cleanup |
| Connection not closed | CRITICAL | Database/Redis connections opened but not closed in error paths |
| Event listener not removed | MEDIUM | `addEventListener` without corresponding `removeEventListener` on cleanup/unmount |
| AbortController not used | MEDIUM | Long-running fetch/operations without AbortController for cancellation |
| No finally for cleanup | MEDIUM | Resource cleanup in try block only — skipped on exception |
| Interval not cleared | HIGH | `setInterval` without corresponding `clearInterval` — memory leak |
| Missing using declaration | LOW | Resources that implement `Symbol.dispose` not using `using` keyword (TC39 proposal) |

**Resource Leak Tracing Methodology (MANDATORY — do not skip):**
1. **Find resource acquisitions**: Scan for all `open`, `create`, `new`, `connect`, `createReadStream`, `createWriteStream` calls
2. **Trace cleanup path**: For each acquisition, verify a corresponding `close`, `destroy`, `end`, `clearInterval` exists
3. **Check error paths**: Verify cleanup happens in catch/finally blocks, not just happy path
4. **Check component lifecycle**: For React components, verify useEffect cleanup functions remove listeners and intervals
5. **Check AbortController**: For long-running fetch/operations, verify AbortController is used for cancellation

**Reference Implementation (GOOD — TypeScript):**
```typescript
// GOOD: finally block ensures cleanup
async function processFile(path: string): Promise<void> {
    const stream = fs.createReadStream(path);
    try {
        await pipeline(stream, transformer, output);
    } finally {
        stream.destroy(); // cleanup regardless of success/failure
    }
}

// GOOD: Event listener removed on unmount
useEffect(() => {
    const handler = (e: Event) => handleResize(e);
    window.addEventListener('resize', handler);
    return () => {
        window.removeEventListener('resize', handler); // cleanup on unmount
    };
}, []);

// GOOD: AbortController for cancellable fetch
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
}

// GOOD: Interval cleared on cleanup
useEffect(() => {
    const intervalId = setInterval(() => pollData(), 5000);
    return () => clearInterval(intervalId);
}, []);
```

**Reference Implementation (BAD — TypeScript):**
```typescript
// BAD: No finally — stream stays open on error
async function processFile(path: string): Promise<void> {
    const stream = fs.createReadStream(path);
    await pipeline(stream, transformer, output); // if throws, stream leaks
}

// BAD: Event listener never removed — memory leak
useEffect(() => {
    window.addEventListener('resize', handleResize);
    // missing cleanup return
}, []);

// BAD: setInterval never cleared
useEffect(() => {
    setInterval(() => pollData(), 5000);
    // missing clearInterval — runs forever even after unmount
}, []);

// BAD: No AbortController — fetch cannot be cancelled
async function fetchData(url: string): Promise<Response> {
    return fetch(url); // hangs if server is slow, no way to cancel
}
```

**Check Against Standards For:**
1. (CRITICAL) All streams and connections are closed in finally blocks — including error paths
2. (CRITICAL) Database connections are properly released after use
3. (HIGH) File handles are closed with finally/using
4. (HIGH) `setInterval` has corresponding `clearInterval` on cleanup
5. (HIGH) Database transactions are rolled back on error paths
6. (MEDIUM) Event listeners are removed on component unmount
7. (MEDIUM) AbortController is used for cancellable long-running operations
8. (LOW) Missing using declaration for disposable resources (TC39 proposal)

**Severity Ratings:**
- CRITICAL: Streams/connections not closed on error paths (resource exhaustion), database connections not released (pool exhaustion)
- HIGH: File handles not closed (fd exhaustion under load), intervals not cleared (memory leak), transactions without rollback on error (connection held)
- MEDIUM: Event listeners not removed on unmount (memory leak), no AbortController for fetch (cannot cancel)
- LOW: Missing using declaration for disposable resources

**Output Format:**
```
## Resource Leak Prevention Audit Findings

### Summary
- Streams/connections: X found, Y properly closed in finally blocks
- Database connections: X queries, Y properly released
- File handles: X opens, Y with finally/using close
- Event listeners (TS): X added, Y with cleanup
- Intervals (TS): X set, Y with clearInterval

### Critical Issues
[file:line] - Description (resource type: {type}, leak risk: {description})

### High Issues
[file:line] - Description (resource type: {type})

### Medium Issues
[file:line] - Description

### Low Issues
[file:line] - Description

### Resource Lifecycle Trace
{For each CRITICAL/HIGH issue: acquisition point → expected cleanup → actual cleanup (or missing)}

### Recommendations
1. ...
```
```

### Agent 43: Rate Limiting Auditor

```prompt
Audit rate limiting implementation across the codebase for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: security.md § Rate Limiting (MANDATORY)}
---END STANDARDS---

**Search Patterns:**
- TypeScript files: `**/*.ts` — search for rate limiting middleware, limiter configuration, Redis storage for rate limits
- Config files: `**/*.env*`, `**/docker-compose*`, `**/config*.ts` — search for RATE_LIMIT env vars
- Middleware files: `**/middleware/**`, `**/bootstrap/**` — search for limiter registration
- Keywords (TS): `limiter`, `rateLimit`, `rate-limit`, `RateLimit`, `RATE_LIMIT`, `express-rate-limit`, `rate-limiter-flexible`, `maxRequests`, `windowMs`, `429`, `Retry-After`
- Keywords (Config): `RATE_LIMIT_ENABLED`, `RATE_LIMIT_MAX`, `RATE_LIMIT_EXPIRY_SEC`, `EXPORT_RATE_LIMIT`, `DISPATCH_RATE_LIMIT`

**Rate Limiting Patterns to Check:**

| Pattern | Risk Level | What to Look For |
|---------|:----------:|------------------|
| No rate limiting at all | CRITICAL | No limiter middleware registered on any route |
| Single-tier only | HIGH | Only global rate limit, no export/dispatch tiers |
| In-memory storage only | HIGH | Rate limiter not backed by Redis — rate limits not shared across instances |
| Hardcoded limits | MEDIUM | Rate limit values hardcoded in code instead of env vars |
| No key generation strategy | HIGH | Default key generator (IP only) — no UserID or TenantID+IP |
| Rate limiting disabled in production | CRITICAL | `RATE_LIMIT_ENABLED=false` with no production override |
| No 429 response with Retry-After | MEDIUM | Rate limit exceeded but no `Retry-After` header in response |
| No graceful degradation | HIGH | Redis unavailable causes request failures instead of fallback to in-memory |

**Three-tier Strategy Verification (MANDATORY — do not skip):**
1. **Global tier**: Verify a general rate limiter exists on all protected routes (default: 100 req/60s)
2. **Export tier**: Verify resource-intensive endpoints (exports, bulk ops) have a stricter limiter (default: 10 req/60s)
3. **Dispatch tier**: Verify external integration endpoints (webhooks, external calls) have their own limiter (default: 50 req/60s)

**Redis Storage Verification (MANDATORY — do not skip):**
1. **Storage implementation**: Verify rate limiter uses Redis-backed distributed storage
2. **Key prefix**: Verify rate limit keys use `ratelimit:` prefix for namespace isolation
3. **Sentinel errors**: Verify Redis operations use sentinel errors (not generic Error)
4. **Graceful degradation**: Verify fallback behavior when Redis is unavailable

**Production Safety Verification (MANDATORY — do not skip):**
1. **Force-enable in production**: Verify rate limiting cannot be disabled when `ENV_NAME=production`
2. **Key generation**: Verify key generator uses UserID > TenantID+IP > IP priority
3. **Configuration via env vars**: Verify all limits are configurable via environment variables

**Reference Implementation (GOOD — TypeScript):**
```typescript
// GOOD: Three-tier rate limiting with Redis storage
import { RateLimiterRedis } from 'rate-limiter-flexible';

const globalLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: cfg.rateLimit.max,            // from env vars
  duration: cfg.rateLimit.windowSec,    // from env vars
  keyPrefix: 'ratelimit:global',
});

// Key generator: UserID > TenantID+IP > IP
function getKey(req: Request): string {
  if (req.user?.id) return `user:${req.user.id}`;
  if (req.user?.tenantId) return `tenant:${req.user.tenantId}:ip:${req.ip}`;
  return req.ip;
}

app.use(async (req, res, next) => {
  try {
    await globalLimiter.consume(getKey(req));
    next();
  } catch {
    res.set('Retry-After', String(cfg.rateLimit.windowSec));
    res.status(429).json({ error: 'Too many requests' });
  }
});
```

**Reference Implementation (BAD — TypeScript):**
```typescript
// BAD: No rate limiting at all — DoS vulnerable
app.get('/api/v1/exports', exportHandler);

// BAD: Hardcoded limits, in-memory only
import rateLimit from 'express-rate-limit';
app.use(rateLimit({
  max: 100,         // hardcoded
  windowMs: 60000,  // hardcoded
  // No store — in-memory only, not shared across instances
}));

// BAD: Rate limiting can be disabled in production
if (cfg.rateLimit.enabled) {
  app.use(rateLimiter);
}
```

**Check Against Standards For:**
1. (CRITICAL) Rate limiting middleware exists and is registered on protected routes
2. (CRITICAL) Rate limiting cannot be disabled in production environment
3. (HIGH) Three-tier strategy implemented (Global, Export, Dispatch)
4. (HIGH) Redis-backed distributed storage (not in-memory only)
5. (HIGH) Key generation uses UserID > TenantID+IP > IP priority
6. (HIGH) Graceful degradation when Redis is unavailable
7. (MEDIUM) All rate limit values configurable via environment variables
8. (MEDIUM) 429 response includes `Retry-After` header
9. (MEDIUM) Sentinel errors used in Redis storage operations
10. (LOW) Rate limit key prefix isolates namespace (`ratelimit:`)

**Severity Ratings:**
- CRITICAL: No rate limiting middleware at all, rate limiting disabled in production
- HIGH: Single-tier only (no export/dispatch tiers), in-memory storage only (not distributed), no key generation strategy (IP only), no graceful degradation on Redis failure
- MEDIUM: Hardcoded rate limit values (not configurable), no Retry-After header, generic Error instead of sentinel/typed errors
- LOW: Missing key prefix, rate limit logging not structured, no rate limit metrics/observability

**Output Format:**
```
## Rate Limiting Audit Findings

### Summary
- Rate limiting middleware: {Present / Absent}
- Tiers implemented: {Global, Export, Dispatch / Global only / None}
- Storage backend: {Redis / In-memory / None}
- Key generation: {UserID+TenantID+IP / IP only / Default}
- Production safety: {Force-enabled / Disableable / Not configured}
- Graceful degradation: {Yes / No}

### Critical Issues
[file:line] - Description

### High Issues
[file:line] - Description

### Medium Issues
[file:line] - Description

### Low Issues
[file:line] - Description

### Recommendations
1. ...
```
```

### Agent 44: CORS Configuration Auditor

```prompt
Audit CORS (Cross-Origin Resource Sharing) configuration across the codebase for production readiness.

**Detected Stack:** {DETECTED_STACK}

**MarsAI Standards (Source of Truth):**
---BEGIN STANDARDS---
{INJECTED: security.md § CORS Configuration (MANDATORY)}
---END STANDARDS---

**Search Patterns:**
- TypeScript files: `**/*.ts` — search for CORS middleware configuration, origin validation, preflight handling
- Config files: `**/*.env*`, `**/docker-compose*`, `**/config*.ts` — search for CORS env vars
- Middleware files: `**/middleware/**`, `**/bootstrap/**` — search for CORS and Helmet middleware registration
- Keywords (TS): `cors`, `CORS`, `origin`, `allowedOrigins`, `cors()`, `helmet`, `Helmet`, `HSTS`, `contentSecurityPolicy`, `frameguard`
- Keywords (Config): `CORS_ALLOWED_ORIGINS`, `CORS_ALLOWED_METHODS`, `CORS_ALLOWED_HEADERS`, `TLS_TERMINATED_UPSTREAM`, `SERVER_TLS_CERT_FILE`

**CORS Patterns to Check:**

| Pattern | Risk Level | What to Look For |
|---------|:----------:|------------------|
| No CORS middleware at all | CRITICAL | No `cors.New()` or equivalent middleware registered |
| Wildcard origins in production | CRITICAL | `AllowOrigins: "*"` when `ENV_NAME=production` |
| Empty origins in production | CRITICAL | `CORS_ALLOWED_ORIGINS` not set in production |
| Hardcoded origins | HIGH | Origins in code instead of env var configuration |
| CORS after business logic | HIGH | CORS middleware placed after auth/handler — preflight fails |
| No production validation | HIGH | No check for wildcard/empty origins in production |
| Origin reflection without validation | CRITICAL | `AllowOriginsFunc` that returns true for all origins |
| No Helmet integration | MEDIUM | CORS configured but no Helmet security headers |
| HSTS not enabled with TLS | HIGH | TLS configured but `HSTSMaxAge` not set |

**Middleware Ordering Verification (MANDATORY — do not skip):**
Verify CORS is placed in the correct position in the middleware chain:
```
Recover → Request ID → CORS → Helmet (Security Headers) → Telemetry → Rate Limiter → Handler
```

**Production Validation Verification (MANDATORY — do not skip):**
1. **No wildcard origins**: Verify `*` is rejected when `ENV_NAME=production`
2. **No empty origins**: Verify empty `CORS_ALLOWED_ORIGINS` is rejected in production
3. **HTTPS origins**: Verify production origins use `https://` (not `http://`)
4. **Sentinel errors**: Verify validation uses sentinel errors (not generic Error)

**Helmet Integration Verification (MANDATORY — do not skip):**
1. **Security headers present**: Verify Helmet middleware is registered
2. **HSTS conditional**: Verify HSTS is enabled only when TLS is configured (cert file or TLSTerminatedUpstream)
3. **CSP configured**: Verify Content-Security-Policy header is set
4. **Cross-origin policies**: Verify CrossOriginEmbedderPolicy, CrossOriginOpenerPolicy, CrossOriginResourcePolicy

**Reference Implementation (GOOD — TypeScript):**
```typescript
// GOOD: Configuration-driven CORS with production validation
import cors from 'cors';

app.use(cors({
  origin: cfg.server.corsAllowedOrigins.split(','),  // From env vars
  methods: cfg.server.corsAllowedMethods.split(','),
  allowedHeaders: cfg.server.corsAllowedHeaders.split(','),
}));

// GOOD: Production validation with typed errors
class CORSOriginsEmptyError extends Error {
  constructor() { super('CORS_ALLOWED_ORIGINS must be set in production'); }
}
class CORSOriginsWildcardError extends Error {
  constructor() { super('CORS_ALLOWED_ORIGINS must not contain wildcard (*) in production'); }
}

function validateProductionConfig(cfg: Config): void {
  if (cfg.app.envName !== 'production') return;
  const origins = (cfg.server.corsAllowedOrigins ?? '').trim();
  if (!origins) throw new CORSOriginsEmptyError();
  if (origins.includes('*')) throw new CORSOriginsWildcardError();
}
```

**Reference Implementation (BAD — TypeScript):**
```typescript
// BAD: Wildcard origins — allows any site to make requests
app.use(cors({ origin: '*' }));

// BAD: Hardcoded origins
app.use(cors({ origin: 'https://app.example.com' }));

// BAD: No CORS middleware at all

// BAD: CORS after business logic — preflight fails
app.use(authMiddleware);
app.use(rateLimiter);
app.use(cors(corsConfig));  // Too late

// BAD: Origin reflection without validation
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);  // Effectively same as wildcard
  },
}));
```

**Check Against Standards For:**
1. (CRITICAL) CORS middleware is registered on the HTTP server
2. (CRITICAL) Wildcard origins (`*`) are not used in production
3. (CRITICAL) Empty origins are rejected in production
4. (CRITICAL) No origin reflection function that accepts all origins
5. (HIGH) Origins are configuration-driven via env vars (not hardcoded)
6. (HIGH) CORS is placed before Helmet and business logic in middleware chain
7. (HIGH) Production validation exists with sentinel errors
8. (HIGH) HSTS is enabled when TLS is configured
9. (MEDIUM) Helmet middleware is registered with security headers (CSP, X-Frame-Options, etc.)
10. (MEDIUM) Cross-origin policies are set (Embedder, Opener, Resource)
11. (LOW) Production origins use HTTPS (not HTTP)

**Severity Ratings:**
- CRITICAL: No CORS middleware, wildcard origins in production, empty origins in production, origin reflection accepting all
- HIGH: Hardcoded origins, CORS placed after business logic, no production validation, HSTS not enabled with TLS
- MEDIUM: No Helmet security headers, missing cross-origin policies, no CSP header
- LOW: HTTP origins in production, missing PermissionPolicy, verbose CORS error messages

**Output Format:**
```
## CORS Configuration Audit Findings

### Summary
- CORS middleware: {Present / Absent}
- Allowed origins source: {Env var / Hardcoded / Wildcard / Not configured}
- Production validation: {Present with sentinel errors / Present without sentinel errors / Absent}
- Middleware ordemarsai: {Correct / Incorrect — position: {actual position}}
- Helmet integration: {Present / Absent}
- HSTS: {Enabled / Disabled / N/A (no TLS)}

### Critical Issues
[file:line] - Description

### High Issues
[file:line] - Description

### Medium Issues
[file:line] - Description

### Low Issues
[file:line] - Description

### Recommendations
1. ...
```
```

---

## Consolidated Report Template (Thorough)

<report-template-mandate>
MANDATORY: This template MUST be followed exactly as written. every section is REQUIRED — do not abbreviate, summarize, condense, or skip any section. The report MUST provide exhaustive detail for each dimension, with every issue fully documented including file location, code evidence, impact analysis, and remediation guidance. Omitting sections or reducing detail is FORBIDDEN regardless of the number of findings.
</report-template-mandate>

After all explorers complete, generate this report:

```markdown
# Production Readiness Audit Report

> **THOROUGH AUDIT** — This report provides exhaustive findings across all audited dimensions.
> every issue is documented with file location, evidence, impact analysis, and remediation guidance.

**Date:** {YYYY-MM-DDTHH:MM:SS}
**Codebase:** {project-name}
**Auditor:** Claude Code (Production Readiness Skill v3.0)
**Report Type:** Thorough

---

## Dashboard

| Overall Score | Classification | Critical | High | Medium | Low | HARD GATE Violations |
|:-------------:|:--------------:|:--------:|:----:|:------:|:---:|:--------------------:|
| **{score}/{dynamic_max} ({pct}%)** | **{classification}** | **{n}** | **{n}** | **{n}** | **{n}** | **{n}** |

### Readiness Classification

| Score Range | Classification | Deployment Recommendation |
|:-----------:|:--------------:|:-------------------------:|
| 90%+ | **Production Ready** | Clear to deploy |
| 75-89% | **Ready with Minor Remediation** | Deploy after addressing HIGH issues |
| 50-74% | **Needs Significant Work** | Do not deploy until CRITICAL/HIGH resolved |
| Below 50% | **Not Production Ready** | Major remediation required |

> **Current Status:** {classification} — {one-sentence summary of overall production readiness posture}

---

## Audit Configuration

| Property | Value |
|----------|-------|
| **Detected Stack** | {TypeScript / Frontend / Mixed} |
| **Standards Loaded** | {list of loaded standards files} |
| **Active Dimensions** | {43 base + 1 conditional (max 44)} |
| **Max Possible Score** | {dynamic_max: 430 or 440} |
| **Conditional: Multi-Tenant** | {Active / Inactive} |

---

## Category Scoreboard

| Category | Score | % | Critical | High | Medium | Low | Status |
|:---------|------:|--:|:--------:|:----:|:------:|:---:|:------:|
| **A: Code Structure & Patterns** | {x}/110 | {pct}% | {n} | {n} | {n} | {n} | {PASS/NEEDS WORK/FAIL} |
| **B: Security & Access Control** | {x}/{90 or 100} | {pct}% | {n} | {n} | {n} | {n} | {PASS/NEEDS WORK/FAIL} |
| **C: Operational Readiness** | {x}/70 | {pct}% | {n} | {n} | {n} | {n} | {PASS/NEEDS WORK/FAIL} |
| **D: Quality & Maintainability** | {x}/100 | {pct}% | {n} | {n} | {n} | {n} | {PASS/NEEDS WORK/FAIL} |
| **E: Infrastructure & Hardening** | {x}/60 | {pct}% | {n} | {n} | {n} | {n} | {PASS/NEEDS WORK/FAIL} |
| **TOTAL** | **{x}/{dynamic_max}** | **{pct}%** | **{n}** | **{n}** | **{n}** | **{n}** | — |

Category status: PASS (>=70%), NEEDS WORK (40-69%), FAIL (<40%)

### Dimension Scores at a Glance

| # | Dimension | Score | Status | # | Dimension | Score | Status |
|---|-----------|:-----:|:------:|---|-----------|:-----:|:------:|
| 1 | Pagination Standards | {x}/10 | {icon} | 18 | Technical Debt | {x}/10 | {icon} |
| 2 | Error Framework | {x}/10 | {icon} | 19 | Testing Coverage | {x}/10 | {icon} |
| 3 | Route Organization | {x}/10 | {icon} | 20 | Dependency Mgmt | {x}/10 | {icon} |
| 4 | Bootstrap & Init | {x}/10 | {icon} | 21 | Performance | {x}/10 | {icon} |
| 5 | Runtime Safety | {x}/10 | {icon} | 22 | Concurrency | {x}/10 | {icon} |
| 6 | Auth Protection | {x}/10 | {icon} | 23 | Migrations | {x}/10 | {icon} |
| 7 | IDOR Protection | {x}/10 | {icon} | 24 | Container Security | {x}/10 | {icon} |
| 8 | SQL Safety | {x}/10 | {icon} | 25 | HTTP Hardening | {x}/10 | {icon} |
| 9 | Input Validation | {x}/10 | {icon} | 26 | CI/CD Pipeline | {x}/10 | {icon} |
| 11 | Telemetry | {x}/10 | {icon} | 28 | Core Dependencies | {x}/10 | {icon} |
| 12 | Health Checks | {x}/10 | {icon} | 29 | Naming Conventions | {x}/10 | {icon} |
| 13 | Configuration | {x}/10 | {icon} | 30 | Domain Modeling | {x}/10 | {icon} |
| 14 | Connections | {x}/10 | {icon} | 31 | Linting & Quality | {x}/10 | {icon} |
| 15 | Logging & PII | {x}/10 | {icon} | 32 | Makefile & Tooling | {x}/10 | {icon} |
| 16 | Idempotency | {x}/10 | {icon} | 33* | Multi-Tenant | {x}/10 | {icon} |
| 17 | API Documentation | {x}/10 | {icon} | 34 | License Headers | {x}/10 | {icon} |
| 35 | Nil/Null Safety | {x}/10 | {icon} | 36 | Resilience Patterns | {x}/10 | {icon} |
| 37 | Secret Scanning | {x}/10 | {icon} | 38 | API Versioning | {x}/10 | {icon} |
| 39 | Graceful Degradation | {x}/10 | {icon} | 40 | Caching Patterns | {x}/10 | {icon} |
| 41 | Data Encryption | {x}/10 | {icon} | 42 | Resource Leaks | {x}/10 | {icon} |
| 43 | Rate Limiting | {x}/10 | {icon} | 44 | CORS Configuration | {x}/10 | {icon} |

Status icons: PASS (>=7), WARN (4-6), FAIL (<4), N/A (conditional not active)
*33 = conditional dimension (Multi-Tenant) — included only if multi-tenant indicators detected*

---

## HARD GATE Violations

> HARD GATE violations are non-negotiable MarsAI standards failures that MUST be resolved before any deployment consideration. These represent structural non-compliance, not just quality gaps.

{If no violations: "No HARD GATE violations detected."}

{If violations exist:}

| # | Dimension | Violation | Location | Standards Reference |
|---|-----------|-----------|----------|---------------------|
| 1 | {dimension name} | {description of standards violation} | `{file:line}` | {standards-file.md} § {section} |

---

## Critical Blockers (Must Fix Before Production)

> These issues represent immediate risks to production safety, security, or data integrity. Deployment MUST NOT proceed until all CRITICAL issues are resolved.

{If no critical issues: "No critical blockers identified. All dimensions passed critical-level checks."}

{For each CRITICAL issue — MUST include all fields:}

### CB-{n}: {Short descriptive issue title}

| Property | Value |
|----------|-------|
| **Dimension** | #{num}. {Dimension Name} |
| **Category** | {A/B/C/D/E}: {Category Name} |
| **Severity** | CRITICAL |
| **Location** | `{file:line}` |
| **Standards Reference** | {standards-file.md} § {section name} |
| **HARD GATE Violation** | {Yes / No} |

**Description:**
{Detailed explanation of the issue — what is wrong and why it matters. Minimum 2-3 sentences.}

**Evidence:**
```{language}
// {file}:{line}
{relevant code snippet showing the problem — include enough context to understand the issue}
```

**Impact:**
{What could go wrong in production if this is not fixed. Be specific about failure modes, data risks, or security implications.}

**Recommended Fix:**
```{language}
// {file}:{line} — suggested change
{code showing the corrected approach aligned with MarsAI standards}
```

---

## High Priority Issues

> These issues represent significant risks or standards non-compliance. Address before production deployment or within the current sprint.

{If no high issues: "No high priority issues identified."}

{For each HIGH issue — MUST include all fields:}

### HP-{n}: {Short descriptive issue title}

| Property | Value |
|----------|-------|
| **Dimension** | #{num}. {Dimension Name} |
| **Category** | {A/B/C/D/E}: {Category Name} |
| **Severity** | HIGH |
| **Location** | `{file:line}` |
| **Standards Reference** | {standards-file.md} § {section name} |

**Description:**
{Detailed explanation of the issue. Minimum 2-3 sentences.}

**Evidence:**
```{language}
// {file}:{line}
{relevant code snippet showing the problem}
```

**Impact:**
{Production impact if not addressed.}

**Recommended Fix:**
```{language}
// {file}:{line} — suggested change
{code showing the corrected approach}
```

---

## Detailed Findings by Category

> This section provides exhaustive per-dimension findings. every dimension MUST include: a score breakdown, all issues organized by severity (CRITICAL first, then HIGH, MEDIUM, LOW), code evidence for each issue, and positive findings. Do not skip any dimension.

---

### Category A: Code Structure & Patterns ({x}/110)

---

#### Dimension 1: Pagination Standards

| Property | Value |
|----------|-------|
| **Score** | **{x}/10** |
| **Status** | {PASS (>=7) / WARN (4-6) / FAIL (<4)} |
| **Standards Source** | api-patterns.md § Pagination Patterns |
| **Issues Found** | {n} Critical, {n} High, {n} Medium, {n} Low |

**Summary:**
{2-3 sentence summary of the dimension's overall compliance. Describe what was checked, what the predominant pattern is, and the key gap (if any).}

{For each severity level that has issues, in order CRITICAL → HIGH → MEDIUM → LOW. Omit empty severity sections.}

##### CRITICAL Issues

| # | Location | Issue | HARD GATE | Standards Ref |
|---|----------|-------|:---------:|---------------|
| C1 | `{file:line}` | {brief description} | {Yes/No} | {section ref} |

**C1: {Issue title}**

- **Description:** {What is wrong and why it violates standards}
- **Evidence:**
  ```{language}
  // {file}:{line}
  {code showing the problem}
  ```
- **Impact:** {Production risk}
- **Recommended Fix:**
  ```{language}
  {corrected code}
  ```

##### HIGH Issues

| # | Location | Issue | Standards Ref |
|---|----------|-------|---------------|
| H1 | `{file:line}` | {brief description} | {section ref} |

**H1: {Issue title}**

- **Description:** {What is wrong}
- **Evidence:**
  ```{language}
  // {file}:{line}
  {code showing the problem}
  ```
- **Impact:** {Risk if not addressed}
- **Recommended Fix:**
  ```{language}
  {corrected code}
  ```

##### MEDIUM Issues

| # | Location | Issue | Standards Ref |
|---|----------|-------|---------------|
| M1 | `{file:line}` | {brief description} | {section ref} |

**M1: {Issue title}**
- **Description:** {What is wrong}
- **Evidence:** `{file}:{line}` — {brief code reference or description}
- **Recommended Fix:** {Brief guidance on how to align with standards}

##### LOW Issues

| # | Location | Issue |
|---|----------|-------|
| L1 | `{file:line}` | {brief description} |

- **L1:** {One-line description with fix guidance}

##### What Was Done Well

{List positive findings. If the dimension is fully compliant, describe what was correctly implemented. Minimum 1 item.}

- {Positive finding 1 — cite specific file or pattern}
- {Positive finding 2}

---

#### Dimension 2: Error Framework

{SAME structure as Dimension 1 — property table, summary, severity-grouped issues, positive findings}

---

#### Dimension 3: Route Organization

{SAME structure}

---

#### Dimension 4: Bootstrap & Initialization

{SAME structure}

---

#### Dimension 5: Runtime Safety

{SAME structure}

---

#### Dimension 28: Core Dependencies & Frameworks

{SAME structure}

---

#### Dimension 29: Naming Conventions

{SAME structure}

---

#### Dimension 30: Domain Modeling

{SAME structure}

---

#### Dimension 35: Nil/Null Safety

{SAME structure as Dimension 1}

---

#### Dimension 38: API Versioning

{SAME structure as Dimension 1}

---

#### Dimension 42: Resource Leak Prevention

{SAME structure as Dimension 1}

---

### Category B: Security & Access Control ({x}/{90 or 100})

---

#### Dimension 6: Auth Protection

{SAME structure as Dimension 1}

---

#### Dimension 7: IDOR & Access Control

{SAME structure}

---

#### Dimension 8: SQL Safety

{SAME structure}

---

#### Dimension 9: Input Validation

{SAME structure}

---

#### Dimension 37: Secret Scanning

{SAME structure as Dimension 1}

---

#### Dimension 41: Data Encryption at Rest

{SAME structure as Dimension 1}

---

#### Dimension 43: Rate Limiting

{SAME structure as Dimension 1}

---

#### Dimension 44: CORS Configuration

{SAME structure as Dimension 1}

---

#### Dimension 33: Multi-Tenant Patterns *(CONDITIONAL)*

{If MULTI_TENANT=false: "**Dimension not activated** — No multi-tenant indicators detected in this codebase. Score excluded from total."}

{If MULTI_TENANT=true: SAME structure as Dimension 1}

---

### Category C: Operational Readiness ({x}/70)

---

#### Dimension 11: Telemetry & Observability

{SAME structure as Dimension 1}

---

#### Dimension 12: Health Checks

{SAME structure}

---

#### Dimension 13: Configuration Management

{SAME structure}

---

#### Dimension 14: Connection Management

{SAME structure}

---

#### Dimension 15: Logging & PII Safety

{SAME structure}

---

#### Dimension 36: Resilience Patterns

{SAME structure as Dimension 1}

---

#### Dimension 39: Graceful Degradation

{SAME structure as Dimension 1}

---

### Category D: Quality & Maintainability ({x}/100)

---

#### Dimension 16: Idempotency

{SAME structure as Dimension 1}

---

#### Dimension 17: API Documentation

{SAME structure}

---

#### Dimension 18: Technical Debt

{SAME structure}

---

#### Dimension 19: Testing Coverage

{SAME structure}

---

#### Dimension 20: Dependency Management

{SAME structure}

---

#### Dimension 21: Performance Patterns

{SAME structure}

---

#### Dimension 22: Concurrency Safety

{SAME structure}

---

#### Dimension 23: Migration Safety

{SAME structure}

---

#### Dimension 31: Linting & Code Quality

{SAME structure}

---

#### Dimension 40: Caching Patterns

{SAME structure as Dimension 1}

---

### Category E: Infrastructure & Hardening ({x}/60)

---

#### Dimension 24: Container Security

{SAME structure as Dimension 1}

---

#### Dimension 25: HTTP Hardening

{SAME structure}

---

#### Dimension 26: CI/CD Pipeline

{SAME structure}

---

#### Dimension 27: Async Reliability

{SAME structure}

---

#### Dimension 32: Makefile & Dev Tooling

{SAME structure}

---

#### Dimension 34: License Headers

{SAME structure as Dimension 1 — if no LICENSE file exists, all items reported as N/A with evidence}

---

## Standards Compliance Cross-Reference

| # | Dimension | Standards Source | Section | Status | Score |
|---|-----------|----------------|---------|:------:|------:|
| 1 | Pagination Standards | api-patterns.md | Pagination Patterns | {PASS/FAIL} | {x}/10 |
| 2 | Error Framework | domain.md | Error Codes, Error Handling | {PASS/FAIL} | {x}/10 |
| 3 | Route Organization | architecture.md | Architecture Patterns, Directory Structure | {PASS/FAIL} | {x}/10 |
| 4 | Bootstrap & Initialization | bootstrap.md | Bootstrap | {PASS/FAIL} | {x}/10 |
| 5 | Runtime Safety | (generic) | — | {PASS/FAIL} | {x}/10 |
| 6 | Auth Protection | security.md | Access Manager Integration | {PASS/FAIL} | {x}/10 |
| 7 | IDOR & Access Control | (generic) | — | {PASS/FAIL} | {x}/10 |
| 8 | SQL Safety | (generic) | — | {PASS/FAIL} | {x}/10 |
| 9 | Input Validation | core.md | Frameworks & Libraries | {PASS/FAIL} | {x}/10 |
| 11 | Telemetry & Observability | bootstrap.md + sre.md | Observability, OpenTelemetry | {PASS/FAIL} | {x}/10 |
| 12 | Health Checks | sre.md | Health Checks | {PASS/FAIL} | {x}/10 |
| 13 | Configuration Management | core.md | Configuration | {PASS/FAIL} | {x}/10 |
| 14 | Connection Management | core.md | Core Dependencies | {PASS/FAIL} | {x}/10 |
| 15 | Logging & PII Safety | quality.md | Logging | {PASS/FAIL} | {x}/10 |
| 16 | Idempotency | idempotency.md | Full module | {PASS/FAIL} | {x}/10 |
| 17 | API Documentation | api-patterns.md | OpenAPI (Swaggo) | {PASS/FAIL} | {x}/10 |
| 18 | Technical Debt | (generic) | — | {PASS/FAIL} | {x}/10 |
| 19 | Testing Coverage | quality.md | Testing | {PASS/FAIL} | {x}/10 |
| 20 | Dependency Management | core.md | Frameworks & Libraries | {PASS/FAIL} | {x}/10 |
| 21 | Performance Patterns | (generic) | — | {PASS/FAIL} | {x}/10 |
| 22 | Concurrency Safety | architecture.md | Concurrency Patterns | {PASS/FAIL} | {x}/10 |
| 23 | Migration Safety | core.md | Database patterns | {PASS/FAIL} | {x}/10 |
| 24 | Container Security | devops.md | Containers | {PASS/FAIL} | {x}/10 |
| 25 | HTTP Hardening | (generic) | — | {PASS/FAIL} | {x}/10 |
| 26 | CI/CD Pipeline | devops.md | CI section | {PASS/FAIL} | {x}/10 |
| 27 | Async Reliability | messaging.md | RabbitMQ Worker Pattern | {PASS/FAIL} | {x}/10 |
| 28 | Core Dependencies | core.md | Frameworks & Libraries | {PASS/FAIL} | {x}/10 |
| 29 | Naming Conventions | core.md + api-patterns.md | Naming conventions | {PASS/FAIL} | {x}/10 |
| 30 | Domain Modeling | domain.md + domain-modeling.md | ToEntity, Always-Valid | {PASS/FAIL} | {x}/10 |
| 31 | Linting & Code Quality | quality.md | Linting | {PASS/FAIL} | {x}/10 |
| 32 | Makefile & Dev Tooling | devops.md | Makefile Standards | {PASS/FAIL} | {x}/10 |
| 35 | Nil/Null Safety | (nil-safety-reviewer) | Nil Patterns | {PASS/FAIL} | {x}/10 |
| 36 | Resilience Patterns | (generic) | Resilience Patterns | {PASS/FAIL} | {x}/10 |
| 37 | Secret Scanning | (generic) | Secret Detection | {PASS/FAIL} | {x}/10 |
| 38 | API Versioning | api-patterns.md | API Versioning | {PASS/FAIL} | {x}/10 |
| 39 | Graceful Degradation | (generic) | Degradation Patterns | {PASS/FAIL} | {x}/10 |
| 40 | Caching Patterns | (generic) | Cache Management | {PASS/FAIL} | {x}/10 |
| 41 | Data Encryption | security.md | Encryption at Rest | {PASS/FAIL} | {x}/10 |
| 42 | Resource Leaks | (generic) | Resource Lifecycle | {PASS/FAIL} | {x}/10 |
| 43 | Rate Limiting | security.md | Rate Limiting | {PASS/FAIL} | {x}/10 |
| 44 | CORS Configuration | security.md | CORS Configuration | {PASS/FAIL} | {x}/10 |
| 33 | Multi-Tenant Patterns | multi-tenant.md | Full module | {PASS/FAIL/N/A} | {x}/10 |
| 34 | License Headers | core.md | License section | {PASS/FAIL/N/A} | {x}/10 |

*Dimension 33 is conditional — excluded from scoring when MULTI_TENANT=false*

---

## Issue Index by Severity

> Complete cross-cutting index of all issues found across all dimensions, grouped by severity. Use this for quick reference and remediation tracking.

### All CRITICAL Issues ({total_count})

| # | ID | Dimension | Category | Location | Issue | HARD GATE |
|---|----|-----------|----------|----------|-------|:---------:|
| 1 | CB-1 | {dimension} | {cat} | `{file:line}` | {description} | {Yes/No} |

### All HIGH Issues ({total_count})

| # | ID | Dimension | Category | Location | Issue |
|---|----|-----------|----------|----------|-------|
| 1 | HP-1 | {dimension} | {cat} | `{file:line}` | {description} |

### All MEDIUM Issues ({total_count})

| # | Dimension | Category | Location | Issue |
|---|-----------|----------|----------|-------|
| 1 | {dimension} | {cat} | `{file:line}` | {description} |

### All LOW Issues ({total_count})

| # | Dimension | Category | Location | Issue |
|---|-----------|----------|----------|-------|
| 1 | {dimension} | {cat} | `{file:line}` | {description} |

---

## Remediation Roadmap

> Prioritized action plan organized by urgency. Each phase includes estimated effort to help with sprint planning.

### Phase 1: Immediate (before any deployment)

> Blocking issues that MUST be resolved before production. These are CRITICAL severity items and HARD GATE violations.

| Priority | ID | Dimension | Issue | Estimated Effort |
|:--------:|----|-----------|-------|:----------------:|
| 1 | CB-{n} | {dimension} | {short description} | {hours}h |

**Phase 1 Total Estimated Effort:** {X} hours

### Phase 2: Short-term (within 1 sprint)

> HIGH severity items to address in the current or next sprint before considering the system production-stable.

| Priority | ID | Dimension | Issue | Estimated Effort |
|:--------:|----|-----------|-------|:----------------:|
| 1 | HP-{n} | {dimension} | {short description} | {hours}h |

**Phase 2 Total Estimated Effort:** {X} hours

### Phase 3: Medium-term (within 1 quarter)

> MEDIUM severity improvements to plan for upcoming sprints. These improve compliance and reduce technical debt.

| Priority | Dimension | Issue | Estimated Effort |
|:--------:|-----------|-------|:----------------:|
| 1 | {dimension} | {short description} | {hours}h |

**Phase 3 Total Estimated Effort:** {X} hours

### Phase 4: Backlog (track but do not block deployment)

> LOW severity enhancements. Create tickets in issue tracker for future consideration.

| Dimension | Issue |
|-----------|-------|
| {dimension} | {short description} |

---

## Appendix A: Files Audited

| # | File Path | Lines | Dimensions That Examined It |
|---|-----------|------:|:---------------------------|
| 1 | `{file path}` | {n} | {comma-separated dimension numbers} |

**Total:** {n} files, {n} lines of code audited

---

## Appendix B: Audit Metadata

| Property | Value |
|----------|-------|
| **Audit Date** | {YYYY-MM-DD HH:MM} |
| **Audit Duration** | {X} minutes |
| **Explorers Launched** | {43 or 44} |
| **Files Examined** | {X} |
| **Lines of Code** | {X} |
| **Skill Version** | 3.0 |
| **Report Type** | Thorough |
| **Standards Source** | MarsAI Development Standards (GitHub) |
| **Standards Files Loaded** | {list} |
| **Stack Detected** | {TypeScript / Frontend / Mixed} |
| **Dimensions** | {43 + conditional count} |
```

---

## Scoring Guide

### Per-Dimension Scoring (0-10 each)

| Score | Criteria |
|-------|----------|
| 10 | Exemplary - fully aligned with MarsAI standards, could serve as reference |
| 8-9 | Strong - minor deviations from MarsAI standards |
| 6-7 | Adequate - meets basic requirements but missing some MarsAI patterns |
| 4-5 | Concerning - multiple gaps vs MarsAI standards |
| 2-3 | Poor - significant non-compliance with MarsAI standards |
| 0-1 | Critical - fundamentally misaligned or missing |

### Deductions Per Dimension

- Each CRITICAL issue: -3 points (includes HARD GATE violations)
- Each HIGH issue: -1.5 points
- Each MEDIUM issue: -0.5 points
- Each LOW issue: -0.25 points
- Minimum score: 0 (no negative scores)

### Category Weights

| Category | Dimensions | Count | Max Score |
|----------|------------|-------|-----------|
| A: Code Structure | 1-5, 28-30, 35, 38, 42 | 11 | 110 |
| B: Security | 6-9, 33*, 37, 41, 43, 44 | 9 (+1c) | 90 (+10c) |
| C: Operations | 11-15, 36, 39 | 7 | 70 |
| D: Quality | 16-23, 31, 40 | 10 | 100 |
| E: Infrastructure | 24-27, 32, 34 | 6 | 60 |
| **Total** | | **43 (+1c = 44)** | **430 (+10c = 440)** |

*c = conditional (Multi-Tenant). dynamic_max = 430 + (10 if MULTI_TENANT=true)*

### Overall Classification (Percentage-Based)

| Score Range | Percentage | Classification |
|-------------|------------|----------------|
| 90%+ of dynamic_max | 90%+ | Production Ready |
| 75-89% of dynamic_max | 75-89% | Ready with Minor Remediation |
| 50-74% of dynamic_max | 50-74% | Needs Significant Work |
| Below 50% of dynamic_max | <50% | Not Production Ready |

---

## Usage Example

```
User: /production-readiness-audit
```

---

## Assistant Execution Protocol

When this skill is invoked, follow this exact protocol:

### Step 1: Initialize Todo List

```
TodoWrite: Create todos for stack detection, standards loading, all 5 batches + consolidation
```

### Step 2: Detect Stack (Step 0)

Use Glob and Grep to detect:
- GO, TS_BACKEND, FRONTEND, DOCKER, MAKEFILE, LICENSE, MULTI_TENANT flags

### Step 3: Load Standards (Step 0.5)

Use WebFetch to load MarsAI standards based on detected stack. Store content for injection into explorer prompts.

**If WebFetch fails for any module:** Note the failure and proceed with generic patterns for affected dimensions.

### Step 4: Initialize Report File

Write the report header with Audit Configuration to `docs/audits/production-readiness-{YYYY-MM-DDTHH:MM:SS}.md`

### Step 5: Launch Parallel Explorers (Batch 1)

**CRITICAL**: Use a SINGLE response with 10 Task tool calls for agents 1-10.

Each Task call should include:
- The full explorer prompt from the dimension
- Injected MarsAI standards content between ---BEGIN STANDARDS--- / ---END STANDARDS--- markers
- Detected stack information
- Instruction to search the codebase thoroughly

### Step 6: Launch Parallel Explorers (Batch 2)

Launch 10 agents (11-20) in a SINGLE response.

### Step 7: Launch Parallel Explorers (Batch 3)

Launch 10 agents (21-30) in a SINGLE response.

### Step 8: Launch Parallel Explorers (Batch 4)

Launch agents 31-42 in a SINGLE response. Note: Agent 33 (Multi-Tenant) is CONDITIONAL — only include if MULTI_TENANT=true was detected in Step 2.

### Step 9: Launch Parallel Explorers (Batch 5)

Launch agents 43-44 in a SINGLE response.

### Step 10: Collect Results

As each explorer completes, mark its todo as completed and append to report.

### Step 11: Consolidate Report

Once ALL explorers complete:
1. Calculate scores for each dimension (0-10 scale)
2. Calculate category totals (A: /110, B: /90-100, C: /70, D: /100, E: /60)
3. Calculate overall score (/{dynamic_max})
4. Aggregate critical/high/medium/low counts
5. Determine readiness classification (percentage-based)
6. Generate Standards Compliance Cross-Reference table
7. Generate the consolidated report

### Step 12: Write Report

```
Write: docs/audits/production-readiness-{YYYY-MM-DDTHH:MM:SS}.md
```

### Step 12.5: Visual Readiness Dashboard

**MANDATORY: Generate a visual HTML dashboard from the audit results.**

Invokes `Skill("marsai:visual-explainer")` to produce a self-contained HTML page showing the production readiness score and findings visually. The markdown report is exhaustive (thousands of lines) — the HTML dashboard provides an executive overview that opens in the browser.

**Read templates first:** Read `default/skills/visual-explainer/templates/code-diff.html` for severity badges and KPI card patterns, AND read `default/skills/visual-explainer/templates/data-table.html` for table/heatmap patterns. Combine patterns for an audit dashboard layout. Also read `default/skills/visual-explainer/references/responsive-nav.md` for section navigation (7 sections require sidebar TOC).

**Generate the HTML dashboard with these sections:**

**1. Score Hero**
- Large overall score display: `{score}/{dynamic_max}` with percentage
- Readiness classification badge (Production Ready / Ready with Minor Remediation / Needs Significant Work / Not Production Ready)
- Color-coded: green (90%+), yellow (75-89%), orange (50-74%), red (<50%)

**2. Category Scoreboard**
- 5 category cards (A: Structure, B: Security, C: Operations, D: Quality, E: Infrastructure)
- Each card shows: score/max, percentage bar, critical/high/medium/low counts with severity badges
- Visual progress bars per category

**3. Dimension Scores Heatmap**
- All 44 dimensions in a grid/table
- Color-coded cells: 8-10 green, 6-7 yellow, 4-5 orange, 0-3 red
- Grouped by category with subtotals

**4. HARD GATE Violations** (if any)
- Prominent red section listing all HARD GATE violations
- Each violation shows: dimension, standard reference, evidence, remediation

**5. Critical Blockers** (if any)
- Per-blocker cards with: severity badge, description, file:line references, impact, remediation steps

**6. Remediation Roadmap**
- 4-phase timeline: Immediate (blockers) → Short-term (HIGH) → Medium-term (MEDIUM) → Backlog (LOW)
- Issue count per phase
- Collapsible details per phase

**7. Standards Compliance Summary**
- Table showing which MarsAI standards were checked and their compliance status
- Collapsible per-standard details

**Output:** Save to `docs/audits/production-readiness-{YYYY-MM-DDTHH:MM:SS}-dashboard.html`

**Open in browser:**
```text
macOS: open docs/audits/production-readiness-{YYYY-MM-DDTHH:MM:SS}-dashboard.html
Linux: xdg-open docs/audits/production-readiness-{YYYY-MM-DDTHH:MM:SS}-dashboard.html
```

**Tell the user** the file path. The dashboard opens before the verbal summary.

See [dev-team/skills/shared-patterns/anti-rationalization-visual-report.md](../../../dev-team/skills/shared-patterns/anti-rationalization-visual-report.md) for anti-rationalization table.

### Step 13: Present Summary

Provide a verbal summary to the user including:
- Detected stack and standards loaded
- Overall score and classification
- Number of critical/high issues
- HARD GATE violations summary
- Top 3 recommendations
- Link to full report and visual dashboard

---

## Customization Options

Users can customize the audit:

### Scope Limiting

```
User: /production-readiness-audit --modules=matching,ingestion
```

Only audit specified modules.

### Dimension Selection

```
User: /production-readiness-audit --dimensions=security
```

Run only security-related auditors (6, 7, 8, 9, 37, 41, 43, 44, 33).

### Output Format

```
User: /production-readiness-audit --format=json
```

Output structured JSON instead of markdown.

### Standards Override

```
User: /production-readiness-audit --no-standards
```

Run without MarsAI standards injection (generic mode, equivalent to v2.0 behavior).

---

## Integration with CI/CD

This skill can be automated:

1. Run audit on every release branch
2. Block merges if CRITICAL issues exist
3. Block merges if HARD GATE violations exist (MarsAI standards)
4. Track debt trends over time
5. Generate dashboards from JSON output
6. Compare scores across audit runs to measure standards adoption

---

## Reference Patterns Source

The reference implementations in this skill are derived from two sources:

### MarsAI Development Standards (Primary - Source of Truth)
Standards loaded at runtime via WebFetch from `dev-team/docs/standards/`:
- **Language-specific standards** — Loaded based on detected stack
- **devops.md** — Container, Makefile, and infrastructure standards
- **sre.md** — Observability and health check standards

### Reference Implementations (Legacy Reference)
Original reference implementations that serve as the organizational standard for:
- Hexagonal architecture per bounded context
- Telemetry, database, and messaging integration
- JWT validation and tenant extraction
- HTTP framework conventions

When auditing projects, findings are compared against MarsAI standards as the authoritative reference.

## Blocker Criteria

STOP and report if:

| Decision Type | Blocker Condition | Required Action |
|---|---|---|
| Stack Detection | Cannot detect project stack (no package.json, tsconfig.json, etc.) | STOP and ask user to specify stack |
| Standards Loading | WebFetch fails for critical MarsAI standards | STOP and report - audit requires standards as source of truth |
| Batch Failure | Entire batch of agents fails to complete | STOP and report - investigate infrastructure issue |
| Report File | Cannot write to docs/audits/ directory | STOP and report - ensure directory exists and is writable |

### Cannot Be Overridden

The following requirements CANNOT be waived:
- MUST load MarsAI standards before dispatching explorers - audit without standards is not MarsAI-compliant
- MUST run ALL applicable dimensions (43 base + 1 conditional) - partial audits are incomplete
- MUST include HARD GATE violations prominently in report - they CANNOT be buried in findings
- CANNOT mark audit complete without generating both markdown report AND HTML dashboard

## Severity Calibration

| Severity | Condition | Required Action |
|---|---|---|
| CRITICAL | HARD GATE violation per MarsAI standards | MUST be fixed before production deployment - blocks release |
| HIGH | Security vulnerability or missing auth protection | MUST fix before completing audit remediation |
| MEDIUM | Quality issue or missing best practice | Should fix - improves maintainability |
| LOW | Style inconsistency or documentation gap | Fix in next iteration |

## Pressure Resistance

| User Says | Your Response |
|---|---|
| "Just audit security, skip the rest" | "CANNOT run partial audit unless --dimensions flag is specified. Full audit (44 dimensions) is required for production readiness assessment." |
| "Skip the standards loading, just run generic checks" | "CANNOT audit without MarsAI standards unless --no-standards flag is specified. Standards are the source of truth for compliance." |
| "We need to deploy tomorrow, mark it production ready" | "CANNOT mark production ready if CRITICAL issues or HARD GATE violations exist. Report shows actual state - deployment decision is yours." |

## Anti-Rationalization Table

| Rationalization | Why It's WRONG | Required Action |
|---|---|---|
| "Most dimensions passed, skip the remaining ones" | Partial audit hides unknown risks. Each dimension covers unique production concerns. | **MUST complete all 44 dimensions** |
| "Standards fetch is slow, use cached version" | Cached standards may be outdated. MarsAI standards evolve - fresh fetch ensures accuracy. | **MUST WebFetch current standards** |
| "HARD GATE violations are minor for this project" | HARD GATE means NON-NEGOTIABLE per MarsAI standards. Project size doesn't change compliance. | **MUST report HARD GATE violations prominently** |
| "HTML dashboard is optional, markdown is enough" | Dashboard provides executive visibility. Both outputs are required for complete audit. | **MUST generate both markdown and HTML dashboard** |
