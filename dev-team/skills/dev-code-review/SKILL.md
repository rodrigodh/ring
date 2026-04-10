---
name: ring:dev-code-review
description: |
  Automated architectural code review against gold standard references. Compares diffs against
  the architecture template and reference examples, verifying structure, naming, architecture,
  events, duplication, responsibility, and ops.
user-invocable: true
disable-model-invocation: true
---

# Dev - Code Review

> **When to use**: before opening a PR or during code review. Invoke manually to receive rigorous architectural feedback.
>
> **Goal**: ensure code follows the architectural standard (Clean Architecture + DDD + Event-Driven) by comparing against the gold standard.

---

## AI Stance (mandatory)

- Be rigorous. Do not gloss over issues. If it is wrong, block it.
- Ground every finding with a reference to the gold standard or the architecture template.
- Do not flag cosmetic changes as BLOCK — only real pattern violations.
- When finding a problem, explain WHY it is wrong and HOW to fix it.
- Never approve code that violates the standard just because "it works".
- If the code is good, say it is good. Do not invent problems.

---

## Inputs

### Required: business context

Before starting the review, ask:

**"What is the ticket for this change? (paste the link or explain what is being done)"**

- If the dev provides a link: read the ticket via Linear MCP and use as context.
- If the dev explains manually: evaluate depth. If superficial (e.g., "I'm creating an invite"), request the ticket: **"That explanation is too shallow. Please share the ticket so I can understand the full context."**
- MUST NOT start review without business context.

### Automatic: branch diff

Run `git diff main...HEAD` to capture everything changed in the current branch vs main.

If the branch is already main or there is no diff, warn: **"No diff found against main. Are you on the correct branch?"**

---

## Step by step

### 1. Collect context

1. Ask for the ticket (rule above).
2. Run `git diff main...HEAD --name-only` to list changed files.
3. Run `git diff main...HEAD` for the full diff.
4. Read the ticket via Linear MCP (if link provided).

### 2. Analyze impact (selective attention)

From the diff, decide what to investigate in the repo:

- **New files**: verify the folder exists in the standard pattern, naming follows conventions.
- **Modified files**: read the full file to understand context. Verify the change is in the correct layer.
- **Imports**: check for inverted imports (domain importing from infra/app, app importing from infra).
- **Services/UseCases**: check if something similar already exists in the repo (search by name and functionality). Check if Unit of Work is being used.
- **Event Handlers**: verify idempotency, delegation to service, error handling.
- **Consequences**: if the diff touches something shared (service, repository, aggregate), check who else uses it.

**Golden rule of attention**: think like a senior — "what can go wrong here? what else depends on this? does something that does this already exist?"

### 3. Compare against gold standard

For each file in the diff, identify which architectural concept it represents and compare against the corresponding gold standard:

| If the file is a... | Compare against |
|---|---|
| Aggregate | `gold-standard/domain/aggregate--User.ts` |
| Entity | `gold-standard/domain/entity--EmailAddress.ts` |
| Value Object | `gold-standard/domain/value-object--AuthProviderVO.ts` |
| Repository interface | `gold-standard/domain/repository--UserRepository.ts` |
| Provider interface | `gold-standard/domain/provider--TokenProvider.ts` |
| UseCase | `gold-standard/app/usecase--SignUpUseCase.ts` |
| Service | `gold-standard/app/service--CreateUserMembershipService.ts` |
| Event Handler | `gold-standard/app/event-handler--UserCreatedEventHandler.ts` |
| DTO Input | `gold-standard/app/dto-input--SignInInput.ts` |
| DTO Input (paginated) | `gold-standard/app/dto-input--PaginatedInput.ts` |
| Response Mapper | `gold-standard/app/response-mapper--UserResponseMapper.ts` |
| Exception | `gold-standard/app/exception--pattern.md` |
| DI Symbols | `gold-standard/app/di-symbols--types.ts` |
| Controller | `gold-standard/infra/controller--AuthController.ts` |
| Kysely Repository | `gold-standard/infra/kysely-repo--KyselyUserRepository.ts` |
| Kysely Paginated Query | `gold-standard/infra/kysely-repo--PaginatedQuery.ts` |
| Controller (paginated route) | `gold-standard/infra/controller--PaginatedRoute.ts` |
| Persistence Mapper | `gold-standard/infra/persistence-mapper--UserPersistenceMapper.ts` |
| Provider impl | `gold-standard/infra/provider--JoseTokenProvider.ts` |
| DI config | `gold-standard/infra/di--*.ts` |
| Events setup | `gold-standard/infra/events--index.ts` |
| Server config | `gold-standard/infra/server--index.ts` |
| Prisma schema | `gold-standard/infra/prisma--schema.prisma` |

The gold standard is in: `gold-standard/` (within this skill's folder)
The architecture template is in: `architecture-template.md` (within this skill's folder)

**MUST read the corresponding gold standard AND the architecture template before making any judgment.**

### 4. Verify by category

Verify ALL categories below, in order:

#### 4.1 Folder structure

- No new folders created outside the pattern defined in the template (Project Structure section).
- Files are in the correct layer (domain/, app/, infra/).
- Files are in the correct subfolder (aggregates/, entities/, usecases/, services/, etc.).

#### 4.2 Naming

- Files follow the pattern: `PascalCase` with concept suffix (`UseCase`, `Service`, `EventHandler`, `Repository`, `Controller`, `Mapper`, `Exception`, etc.).
- Classes/interfaces follow the same pattern.
- Methods use domain language (not generic terms).
- Naming is consistent with what already exists in the repo.

#### 4.3 Architecture (Clean Architecture)

- **Dependency Rule**: domain MUST NOT import from app or infra. app MUST NOT import from infra (except DI types).
- **Aggregate**: has factory methods (create/from), business logic, domain events via raiseEvent().
- **Entity**: private constructor, create/from pattern, everything in Value Objects.
- **Repository interface**: extends UowEntitiesRepository, methods with domain language. Paginated methods use `PaginationParams` as input and `PaginatedResult<T>` as output (both from `@v4-company/mars-api/core`). MUST NOT create custom pagination types (e.g., `FindByXPaginatedOutput`) — use library types.
- **UseCase**: orchestrates, does not contain business logic. Uses UoW: start → logic → commit → publish events → return DTO.
- **Service**: reusable logic, composable, nested UoW when called from UseCase.
- **Controller**: complete decorators, request → DTO → usecase → response. No logic. For paginated routes: use `PaginationParams` from `@v4-company/mars-api/core` as Querystring type (do not redefine `page?: number; limit?: number` inline).
- **Persistence Mapper**: bidirectional (toPersistence/fromPersistence).

#### 4.3.1 Pagination (mandatory pattern)

Paginated queries MUST follow this end-to-end pattern:

- **Domain (repository interface)**: method receives `params: PaginationParams` and returns `Promise<PaginatedResult<T>>`. Both imported from `@v4-company/mars-api/core`.
- **Infra (Kysely repository)**: use `KyselyDatabasePagination` from `@v4-company/mars-api/core`. Instantiate with the repository's `Kysely<DB>`. Flow: `getTotalCount(baseQuery)` → `addPagination(baseQuery, { ...params, total })` → `query.execute()` → return `{ success: true, data, pagination }`.
- **Infra (Kysely repository — db access)**: MUST NOT use `this.model!` (non-null assertion). Store the Kysely instance in a private field `private readonly db: Kysely<DatabaseSchema>` in the constructor (already injected, save to own field with non-null type).
- **App (DTO input)**: export `SchemaOpenApi` (with `z.coerce.number()` for page/limit query params), `QuerySchema` (for `@ApiQueryParamsSchema`), and `Request extends RequestDto`. Defaults: `page = 1`, `limit = 10`, max `limit = 100`.
- **App (UseCase)**: return `PaginatedResult<ResponseType>`. Map domain objects to DTOs over `result.data`. Pass `result.pagination` directly.
- **Infra (Controller)**: use `Querystring: PaginationParams` (from lib) in request type. `@ApiQueryParamsSchema(QuerySchema)` for OpenAPI. Defaults in controller: `page: req.query.page ?? 1, limit: req.query.limit ?? 10`.

**Reference**: `gold-standard/app/dto-input--PaginatedInput.ts`, `gold-standard/infra/controller--PaginatedRoute.ts`

Violations that are BLOCK:
- Manual pagination (calculating offset, building pagination object) instead of using `KyselyDatabasePagination`
- `this.model!` (non-null assertion) to access Kysely instance
- Custom pagination types in domain (e.g., `{ items: T[], total: number }`) instead of `PaginatedResult<T>`
- Redefining `page?: number; limit?: number` inline in controller instead of using `PaginationParams`

#### 4.3.2 Authorization and Organization Scope

Routes that receive `organizationId` as a parameter and access org-scoped data MUST:

- **Use `@Auth(PERMISSIONS.RESOURCES.X, PERMISSIONS.ACTIONS.Y)`** — not just `@Auth()`. Define correct resource and action.
- **Verify the organization exists** via `OrganizationRepository.findById()` — throw `OrganizationNotFoundException` if not.
- **Verify the caller belongs to the organization** via `CheckUserOrganizationService` — prevents a user with permission in org A from accessing data in org B.
- **MUST NOT use `RequireSystemAdminService`** for routes that should be accessible by normal org users. System admin is for global administrative operations.

Violations that are BLOCK:
- Org-scoped route without membership verification (any authenticated user accesses any org)
- `@Auth()` without resource/action on a route that requires specific permission
- `RequireSystemAdminService` where `CheckUserOrganizationService` + permission would be correct

#### 4.4 Events and Resilience

- **"Cake" prohibited**: if the service performs more than one consequential operation after the core is persisted, it must decompose into events. Rule: "Did the core succeed? What comes after is an event."
- **Unit of Work mandatory**: external call + database write MUST use UoW. If it fails, everything rolls back.
- **Event Handler idempotent**: must check state before acting. If already processed, return (not error). Avoid unnecessary DLQ.
- **Event Handler delegates to service**: do not duplicate logic in the handler.
- **Events published after commit**: never before uow.commit().

#### 4.5 Duplication

- Check if a service/usecase/handler that does something similar already exists in the repo.
- If the dev created logic that already exists, point to where the existing code is.
- Search the repo by similar names and equivalent functionality.

#### 4.6 Responsibility

- Each class has a single responsibility.
- Business logic is in the domain (aggregates/entities), not in app or infra.
- Services and UseCases orchestrate, they do not decide business rules.
- Controllers only convert request → DTO and call usecase.
- Event Handlers delegate to services.

#### 4.7 Ops

- New env vars added to `.env.example`.
- Dependencies (libs) at correct/updated versions.
- Migrations created if schema changed.
- DI container updated (types.ts + corresponding config file).
- Event bus subscription registered if new handler.
- Controller registered in server bootstrap if new controller.

### 5. Generate report

Follow output format below.

---

## Severity

### BLOCK (blocks merge)

Everything that violates the architectural pattern. Includes:

- New folder outside the standard
- File in the wrong layer
- Inverted import (dependency rule violation)
- Naming outside convention
- Business logic outside domain
- "Cake" without events
- External call without Unit of Work
- Non-idempotent handler
- Duplication of existing code
- File that should remain unchanged was modified
- DI not updated
- Env var missing
- Event subscription missing
- UseCase without UoW pattern
- Aggregate without factory methods or domain events
- Manual pagination instead of `KyselyDatabasePagination` from lib
- `this.model!` (non-null assertion) in Kysely repository — store in private field
- Custom pagination types in domain instead of `PaginatedResult<T>` / `PaginationParams`
- Inline `page?: number; limit?: number` in controller instead of `PaginationParams` from lib
- Org-scoped route without caller membership verification
- `@Auth()` without resource/action on route requiring permission
- `RequireSystemAdminService` on route that should use `CheckUserOrganizationService` + permissions

### WARNING (advisory)

Improvement suggestions that do not violate the pattern:

- Could extract to a Value Object
- Mapper could be cleaner
- Validation could be more robust
- Logging could be better
- Code works but there is a more elegant approach

---

## Output format (mandatory)

```md
# Code Review — [branch-name]

**Ticket**: [Linear link or description]
**Files changed**: [N]
**Status**: [X BLOCKs | Y WARNINGs] or [APPROVED]

---

## Structure
[findings or "No issues"]

## Naming
[findings or "No issues"]

## Architecture
[findings or "No issues"]

## Events and Resilience
[findings or "No issues"]

## Duplication
[findings or "No issues"]

## Responsibility
[findings or "No issues"]

## Ops
[findings or "No issues"]

---

## Correction prompts

### By category

#### [Category with issues]
> Ready-to-paste prompt for fixing the issues in this category.

[repeat for each category with issues]

### General correction prompt
> Single prompt consolidating ALL issues found, ready to copy and paste.

---

## Verdict

[BLOCKED — X issues must be fixed before merge]
or
[APPROVED — code follows the architectural standard]
or
[APPROVED WITH NOTES — Y warnings to consider]
```

### Finding format

```
BLOCK file.ts:line — Description of the problem.
  Reference: [gold standard or architecture template section X]
  How to fix: [direct instruction]
```

```
WARNING file.ts:line — Improvement suggestion.
  Reason: [why it would be better]
```

### Correction prompt format

Each prompt must be **self-contained** — whoever pastes it does not need additional context:

```
Fix the following issues on branch [branch] following the architectural
standard (Clean Architecture + DDD + Event-Driven):

1. [file:line] — [problem]. Correct: [how it should be].
   Reference: [template concept]

2. [file:line] — [problem]. Correct: [how it should be].

Rules:
- Do not create new folders
- Follow the pattern for [concept] as shown in: [template excerpt]
- Use Unit of Work for [context]
```

---

## General rules

- Same bar for ALL repositories. No exceptions.
- If there are no issues, approve and say it is good. Do not invent problems.
- Always cite exact file and line.
- Always reference the gold standard or template in the justification.
- Correction prompts must be practical and pasteable — the dev copies, pastes, and resolves.
- If the diff is very large (>50 files), warn and ask if the user wants to review everything or focus on something specific.
