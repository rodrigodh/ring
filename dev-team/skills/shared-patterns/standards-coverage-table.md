# Standards Coverage Table Pattern

This file defines the MANDATORY output format for agents comparing codebases against MarsAI standards. It ensures every section in the standards is explicitly checked and reported.

---

## ⛔ CRITICAL: All Sections Are Required

**This is NON-NEGOTIABLE. Every section listed in the Agent → Standards Section Index below MUST be checked.**

| Rule                                          | Enforcement                                                                         |
| --------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Every section MUST be checked**             | No exceptions. No skipping.                                                         |
| **Every section MUST appear in output table** | Missing row = INCOMPLETE output                                                     |
| **Subsections are INCLUDED**                  | If "Containers" is listed, all content (Dockerfile, Docker Compose) MUST be checked |
| **N/A requires explicit reason**              | Cannot mark N/A without justification                                               |

**If you skip any section → Your output is REJECTED. Start over.**

**If you invent section names → Your output is REJECTED. Start over.**

---

## ⛔ CRITICAL: Section Names Are Not Negotiable

**You MUST use the EXACT section names from this file. You CANNOT:**

| FORBIDDEN         | Example                                     | Why Wrong              |
| ----------------- | ------------------------------------------- | ---------------------- |
| Invent names      | "Security", "Code Quality"                  | Not in coverage table  |
| Rename sections   | "Config" instead of "Configuration Loading" | Breaks traceability    |
| Merge sections    | "Error Handling & Logging"                  | Each section = one row |
| Use abbreviations | "Bootstrap" instead of "Bootstrap Pattern"  | Must match exactly     |
| Skip sections     | Omitting "RabbitMQ Worker Pattern"          | Mark N/A instead       |

**Your output table section names MUST match the "Section to Check" column below EXACTLY.**

---

## Why This Pattern Exists

**Problem:** Agents might skip sections from standards files, either by:

- Only checking "main" sections
- Assuming some sections don't apply
- Not enumerating all sections systematically
- Skipping subsections (e.g., checking Dockerfile but skipping Docker Compose)

**Solution:** Require a completeness table that MUST list every section from the WebFetch result with explicit status. All content within each section MUST be evaluated.

---

## MANDATORY: Standards Coverage Table

### ⛔ HARD GATE: Before Outputting Findings

**You MUST output a Standards Coverage Table that enumerates every section from the WebFetch result.**

**REQUIRED: When checking a section, you MUST check all subsections and patterns within it.**

| Section                | What MUST Be Checked                                            |
| ---------------------- | --------------------------------------------------------------- |
| Containers             | Dockerfile patterns and Docker Compose patterns                 |
| Infrastructure as Code | Terraform structure and state management and modules            |
| Observability          | Logging and Tracing (structured JSON logs, OpenTelemetry spans) |
| Security               | Secrets management and Network policies                         |

### Process

1. **Parse the WebFetch result** - Extract all `## Section` headers from the standards file
2. **Count sections** - Record total number of sections found
3. **For each section** - Determine status and evidence
4. **Output table** - MUST have one row per section
5. **Verify completeness** - Table row count MUST equal section count

### Output Format

```markdown
## Standards Coverage Table

**Standards File:** {filename}.md (from WebFetch)
**Total Sections Found:** {N}
**Table Rows:** {N} (MUST match)

| #   | Section (from WebFetch) | Status       | Evidence            |
| --- | ----------------------- | ------------ | ------------------- |
| 1   | {Section 1 header}      | ✅/⚠️/❌/N/A | file:line or reason |
| 2   | {Section 2 header}      | ✅/⚠️/❌/N/A | file:line or reason |
| ... | ...                     | ...          | ...                 |
| N   | {Section N header}      | ✅/⚠️/❌/N/A | file:line or reason |

**Completeness Verification:**

- Sections in standards: {N}
- Rows in table: {N}
- Status: ✅ Complete / ❌ Incomplete
```

### Status Legend

| Status           | Meaning                            | When to Use                          |
| ---------------- | ---------------------------------- | ------------------------------------ |
| ✅ Compliant     | Codebase follows this standard     | Code matches expected pattern        |
| ⚠️ Partial       | Some compliance, needs improvement | Partially implemented or minor gaps  |
| ❌ Non-Compliant | Does not follow standard           | Missing or incorrect implementation  |
| N/A              | Not applicable to this codebase    | Standard doesn't apply (with reason) |

---

## ⛔ CRITICAL: Standards Boundary Enforcement

**You MUST check only what the standards file explicitly defines. Never invent requirements.**

See [shared-patterns/standards-boundary-enforcement.md](standards-boundary-enforcement.md) for:

- Complete list of what IS and IS not required per agent
- Agent-specific requirement boundaries
- Self-verification checklist

**⛔ HARD GATE:** Before flagging any item as non-compliant:

1. Verify the requirement EXISTS in the WebFetch result
2. Quote the EXACT standard that requires it
3. If you cannot quote it → Do not flag it

---

## Anti-Rationalization Table

| Rationalization                                | Why It's WRONG                                                      | Required Action                                   |
| ---------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| "I checked the important sections"             | You don't decide importance. All sections MUST be checked.          | **List every section in table**                   |
| "Some sections obviously don't apply"          | Report them as N/A with reason. Never skip silently.                | **Include in table with N/A status**              |
| "The table would be too long"                  | Completeness > brevity. Every section MUST be visible.              | **Output full table regardless of length**        |
| "I already mentioned these in findings"        | Findings ≠ Coverage table. Both are REQUIRED.                       | **Output table BEFORE detailed findings**         |
| "WebFetch result was unclear"                  | Parse all `## ` headers. If truly unclear, STOP and report blocker. | **Report blocker or parse all headers**           |
| "I checked Dockerfile, that covers Containers" | Containers = Dockerfile + Docker Compose. Partial ≠ Complete.       | **Check all subsections within each section**     |
| "Project doesn't use Docker Compose"           | Report as N/A with evidence. Never assume. VERIFY first.            | **Search for docker-compose.yml, report finding** |
| "Only checking what exists in codebase"        | Standards define what SHOULD exist. Missing = Non-Compliant.        | **Report missing patterns as ❌ Non-Compliant**   |
| "My section name is clearer"                   | Consistency > clarity. Coverage table names are the contract.       | **Use EXACT names from coverage table**           |
| "I combined related sections for brevity"      | Each section = one row. Merging loses traceability.                 | **One row per section, no merging**               |
| "I added a useful section like 'Security'"     | You don't decide sections. Coverage table does.                     | **Only output sections from coverage table**      |
| "'Logging' is the same as 'Logging Standards'" | Names must match EXACTLY. Variations break automation.              | **Use exact string from coverage table**          |

---

## Completeness Check (SELF-VERIFICATION)

**Before submitting output, verify:**

```text
1. Did I extract all ## headers from WebFetch result?     [ ]
2. Does my table have exactly that many rows?             [ ]
3. Does every row have a status (✅/⚠️/❌/N/A)?           [ ]
4. Does every ⚠️/❌ have evidence (file:line)?           [ ]
5. Does every N/A have a reason?                         [ ]

If any checkbox is unchecked → FIX before submitting.
```

---

## Integration with Findings

**Order of output:**

1. **Standards Coverage Table** (this pattern) - Shows completeness
2. **Detailed Findings** - Only for ⚠️ Partial and ❌ Non-Compliant items

The Coverage Table ensures nothing is skipped. The Detailed Findings provide actionable information for gaps.

---

## Example Output

```markdown
## Standards Coverage Table

**Standards File:** typescript.md (from WebFetch)
**Total Sections Found:** 15
**Table Rows:** 15 (MUST match)

| #   | Section (from WebFetch)       | Status | Evidence                               |
| --- | ----------------------------- | ------ | -------------------------------------- |
| 1   | Version                       | ✅     | package.json (TypeScript 5.x, Node 20) |
| 2   | Strict Configuration          | ✅     | tsconfig.json strict: true             |
| 3   | Frameworks & Libraries        | ✅     | Fastify, Kysely, InversifyJS in deps   |
| 4   | Type Safety                   | ⚠️     | Some `any` types found                 |
| 5   | Zod Validation Patterns       | ❌     | Not implemented                        |
| 6   | Dependency Injection          | ✅     | InversifyJS + TYPES symbols            |
| 7   | Context Propagation           | ✅     | DI-based context via @Auth             |
| 8   | Testing                       | ❌     | No tests found                         |
| 9   | Error Handling                | ✅     | Custom error classes                   |
| 10  | Function Design               | ✅     | Small functions, clear names           |
| 11  | File Organization             | ⚠️     | Some files exceed 300 lines            |
| 12  | Naming Conventions            | ✅     | Follows standard conventions           |
| 13  | Directory Structure           | ✅     | Clean Architecture + DDD               |
| 14  | RabbitMQ Worker Pattern       | N/A    | No message queue                       |
| 15  | Always-Valid Domain Model     | ✅     | AggregateRoot factories used           |

**Completeness Verification:**

- Sections in standards: 15
- Rows in table: 15
- Status: ✅ Complete
```

---

## How Agents Reference This Pattern

Agents MUST include this in their Standards Compliance section:

```markdown
## Standards Compliance Output (Conditional)

**Detection:** Prompt contains `**MODE: ANALYSIS only**`

**When triggered, you MUST:**

1. Output Standards Coverage Table per [shared-patterns/standards-coverage-table.md](../skills/shared-patterns/standards-coverage-table.md)
2. Then output detailed findings for ⚠️/❌ items

See [shared-patterns/standards-coverage-table.md](../skills/shared-patterns/standards-coverage-table.md) for:

- Table format
- Status legend
- Anti-rationalization rules
- Completeness verification checklist
```

---

## Agent → Standards Section Index

**IMPORTANT:** When updating a standards file, you MUST also update the corresponding section index below.

**Meta-sections (EXCLUDED from agent checks):**
Standards files may contain these meta-sections that are not counted in section indexes:

- `## Checklist` - Self-verification checklist for developers
- `## Standards Compliance` - Output format examples for agents
- `## Standards Compliance Output Format` - Output templates

These sections describe HOW to use the standards, not WHAT the standards are.

### marsai:backend-engineer-typescript → typescript.md

| #   | Section to Check              | Anchor                                 | Key Subsections                               |
| --- | ----------------------------- | -------------------------------------- | --------------------------------------------- |
| 1   | Version                       | `#version`                             | TypeScript 5.0+, Node.js 20+                  |
| 2   | Strict Configuration          | `#strict-configuration-mandatory`      | tsconfig.json strict mode                     |
| 3   | Frameworks & Libraries        | `#frameworks--libraries`               | Fastify via mars-api, Kysely, InversifyJS, Zod, Vitest |
| 4   | Type Safety                   | `#type-safety`                         | No any, branded types, discriminated unions   |
| 5   | Zod Validation Patterns       | `#zod-validation-patterns`             | Schema validation                             |
| 6   | Dependency Injection          | `#dependency-injection`                | InversifyJS + TYPES symbols + DI config files |
| 7   | Context Propagation           | `#context-propagation`                 | DI-based context (auth via @Auth, transactions via UoW) |
| 8   | Testing                       | `#testing`                             | Type-safe mocks, fixtures, edge cases         |
| 9   | Error Handling                | `#error-handling`                      | Custom error classes                          |
| 10  | Function Design               | `#function-design-mandatory`           | Single responsibility                         |
| 11  | File Organization             | `#file-organization-mandatory`         | File-level SRP, max 200-300 lines             |
| 12  | Naming Conventions            | `#naming-conventions`                  | Files, interfaces, types                      |
| 13  | Directory Structure           | `#directory-structure`                 | Clean Architecture + DDD (domain/app/infra)   |
| 14  | RabbitMQ Worker Pattern       | `#rabbitmq-worker-pattern`             | Async message processing                      |
| 15  | Always-Valid Domain Model     | `#always-valid-domain-model-mandatory` | AggregateRoot/Entity factories, Value Objects, domain events |

---

### marsai:frontend-bff-engineer-typescript → typescript.md

**Includes all backend-engineer-typescript sections PLUS 6 BFF-specific sections (21 total).**

| #   | Section to Check              | Anchor                                 | Key Subsections                                                            |
| --- | ----------------------------- | -------------------------------------- | -------------------------------------------------------------------------- |
| 1   | Version                       | `#version`                             | TypeScript 5.0+, Node.js 20+                                               |
| 2   | Strict Configuration          | `#strict-configuration-mandatory`      | tsconfig.json strict mode                                                  |
| 3   | Frameworks & Libraries        | `#frameworks--libraries`               | Backend stack (see sections 16-21 for BFF overrides)                       |
| 4   | Type Safety                   | `#type-safety`                         | No any, branded types, discriminated unions                                |
| 5   | Zod Validation Patterns       | `#zod-validation-patterns`             | Schema validation                                                          |
| 6   | Dependency Injection          | `#dependency-injection`                | InversifyJS patterns (BFF may differ, see sections 16-21)                  |
| 7   | Context Propagation           | `#context-propagation`                 | DI-based context (BFF may use AsyncLocalStorage, see sections 16-21)       |
| 8   | Testing                       | `#testing`                             | Type-safe mocks, fixtures, edge cases                                      |
| 9   | Error Handling                | `#error-handling`                      | Custom error classes                                                       |
| 10  | Function Design               | `#function-design-mandatory`           | Single responsibility                                                      |
| 11  | File Organization             | `#file-organization-mandatory`         | File-level SRP, max 200-300 lines                                          |
| 12  | Naming Conventions            | `#naming-conventions`                  | Files, interfaces, types                                                   |
| 13  | Directory Structure           | `#directory-structure`                 | V4-Company pattern                                                             |
| 14  | RabbitMQ Worker Pattern       | `#rabbitmq-worker-pattern`             | Async message processing                                                   |
| 15  | Always-Valid Domain Model     | `#always-valid-domain-model-mandatory` | Constructor validation                                                     |
| 16  | BFF Architecture Pattern      | `#bff-architecture-pattern-mandatory`  | **HARD GATE:** Clean Architecture, dual-mode (sindarian-server vs vanilla) |
| 17  | Three-Layer DTO Mapping       | `#three-layer-dto-mapping-mandatory`   | **HARD GATE:** HTTP ↔ Domain ↔ External DTOs, mappers                      |
| 18  | HttpService Lifecycle         | `#httpservice-lifecycle`               | createDefaults, onBeforeFetch, onAfterFetch, catch hooks                   |
| 19  | API Routes Pattern            | `#api-routes-pattern-mandatory`        | **⛔ FORBIDDEN:** Server Actions. MUST use Next.js API Routes              |
| 20  | Exception Hierarchy           | `#exception-hierarchy`                 | ApiException, GlobalExceptionFilter, typed exceptions                      |
| 21  | Cross-Cutting Decorators      | `#cross-cutting-decorators`            | LogOperation, Cached, Retry decorators                                     |

**⛔ HARD GATES for BFF Engineer:**

- Section 16: BFF is MANDATORY for all dynamic data
- Section 17: Three-layer mapping is MANDATORY, no pass-through
- Section 19: Server Actions are FORBIDDEN, API Routes only

---

### marsai:frontend-engineer → frontend.md

| #   | Section to Check                | Anchor                             | Key Subsections                                                         |
| --- | ------------------------------- | ---------------------------------- | ----------------------------------------------------------------------- |
| 1   | Framework                       | `#framework`                       | React 18+, Next.js version policy                                       |
| 2   | Libraries & Tools               | `#libraries--tools`                | Core, state, forms, UI, styling, testing                                |
| 3   | State Management Patterns       | `#state-management-patterns`       | TanStack Query, Zustand                                                 |
| 4   | Form Patterns                   | `#form-patterns`                   | React Hook Form + Zod                                                   |
| 5   | Styling Standards               | `#styling-standards`               | TailwindCSS, CSS variables                                              |
| 6   | Typography Standards            | `#typography-standards`            | Font selection and pairing                                              |
| 7   | Animation Standards             | `#animation-standards`             | CSS transitions, Framer Motion                                          |
| 8   | Component Patterns              | `#component-patterns`              | Compound components, error boundaries                                   |
| 9   | File Organization               | `#file-organization-mandatory`     | File-level SRP, max 200 lines per component                            |
| 10  | Accessibility                   | `#accessibility`                   | WCAG 2.1 AA compliance                                                  |
| 11  | Performance                     | `#performance`                     | Code splitting, image optimization                                      |
| 12  | Directory Structure             | `#directory-structure`             | Next.js App Router layout                                               |
| 13  | Forbidden Patterns              | `#forbidden-patterns`              | Anti-patterns to avoid                                                  |
| 14  | Standards Compliance Categories | `#standards-compliance-categories` | Categories for marsai:dev-refactor                                        |
| 15  | Form Field Abstraction Layer    | `#form-field-abstraction-layer`    | **HARD GATE:** Field wrappers, dual-mode (sindarian-ui vs vanilla)      |
| 16  | Provider Composition Pattern    | `#provider-composition-pattern`    | Nested providers order, feature providers                               |
| 17  | Custom Hooks Patterns           | `#custom-hooks-patterns`           | **HARD GATE:** usePagination, useCursorPagination, useCreateUpdateSheet |
| 18  | Fetcher Utilities Pattern       | `#fetcher-utilities-pattern`       | getFetcher, postFetcher, patchFetcher, deleteFetcher                    |
| 19  | Client-Side Error Handling      | `#client-side-error-handling`      | **HARD GATE:** ErrorBoundary, API error helpers, toast                  |
| 20  | Data Table Pattern              | `#data-table-pattern`              | TanStack Table, server-side pagination                                  |

**⛔ HARD GATES for Frontend Engineer:**

- Section 15: Form field abstraction is MANDATORY, direct input usage FORBIDDEN
- Section 17: Custom hooks MANDATORY for pagination and CRUD sheets
- Section 19: ErrorBoundary and API error handling MANDATORY

---

### marsai:frontend-designer → frontend.md

**Same sections as marsai:frontend-engineer (20 sections).** See above.

---

### marsai:ui-engineer → frontend.md

**Same sections as marsai:frontend-engineer (20 sections).** See above.

**Additional ui-engineer requirements:**
The marsai:ui-engineer MUST also validate against product-designer outputs:

| #   | Additional Check         | Source              | Required                       |
| --- | ------------------------ | ------------------- | ------------------------------ |
| 1   | UX Criteria Compliance   | `ux-criteria.md`    | All criteria satisfied         |
| 2   | User Flow Implementation | `user-flows.md`     | All flows implemented          |
| 3   | Wireframe Adherence      | `wireframes/*.yaml` | All specs implemented          |
| 4   | UI States Coverage       | `ux-criteria.md`    | Loading, error, empty, success |

**Output Format for marsai:ui-engineer:**
In addition to the standard Coverage Table, marsai:ui-engineer MUST output:

```markdown
## UX Criteria Compliance

| Criterion             | Status | Evidence  |
| --------------------- | ------ | --------- |
| [From ux-criteria.md] | ✅/❌  | file:line |
```

---

### marsai:devops-engineer → devops.md

| #   | Section to Check                   | Subsections (all REQUIRED)                                                                 |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | Cloud Provider (MANDATORY)         | Provider table                                                                             |
| 2   | Infrastructure as Code (MANDATORY) | Terraform structure, State management, Module pattern, Best practices                      |
| 3   | Containers (MANDATORY)             | **Dockerfile patterns, Docker Compose (Local Dev), .env file**, Image guidelines           |
| 4   | Helm (MANDATORY)                   | General chart structure, Chart.yaml, values.yaml, [V4-Company Helm Standards](../../docs/standards/helm/index.md) (delegate to marsai:helm-engineer) |
| 5   | Observability (MANDATORY)          | Logging (Structured JSON), Tracing (OpenTelemetry)                                         |
| 6   | Security (MANDATORY)               | Secrets management, Network policies                                                       |
| 7   | Makefile Standards (MANDATORY)     | Required commands (build, lint, test, cover, up, down, etc.), Component delegation pattern |
| 8   | CI/CD Pipeline (MANDATORY)         | Pipeline stages (lint, test, security, build), branch protection, required checks          |

**⛔ HARD GATE:** When checking "Containers", you MUST verify BOTH Dockerfile and Docker Compose patterns. Checking only one = INCOMPLETE.

**⛔ HARD GATE:** When checking "Makefile Standards", you MUST verify all required commands exist: `build`, `lint`, `test`, `cover`, `up`, `down`, `start`, `stop`, `restart`, `rebuild-up`, `set-env`, `generate-docs`.

---

### marsai:sre → sre.md

| #   | Section to Check                      | Anchor                                                            |
| --- | ------------------------------------- | ----------------------------------------------------------------- |
| 1   | Observability                         | `#observability`                                                  |
| 2   | Logging                               | `#logging`                                                        |
| 3   | Tracing                               | `#tracing`                                                        |
| 4   | Structured Logging with lib-common-js | `#structured-logging-with-lib-common-js-mandatory-for-typescript` |
| 5   | Health Checks                         | `#health-checks`                                                  |

---

### marsai:qa-analyst → testing-unit.md (Unit Mode - Gate 3)

**Mode Detection:** `test_mode: unit` passed when invoking `Task(subagent_type="marsai:qa-analyst", test_mode="unit")`

**For TypeScript projects (Unit Mode):**
| # | Section to Check |
|---|------------------|
| 1 | Testing Patterns (MANDATORY) |
| 2 | Edge Case Coverage (MANDATORY) |
| 3 | Type Safety Rules (MANDATORY) |

**Unit Test Quality Gate Checks (Gate 3 Exit - all REQUIRED):**
| # | Check | Detection |
|---|-------|-----------|
| 1 | Type-safe mocks | No `any` in mock definitions |
| 2 | Edge cases | ≥3 per acceptance criterion |
| 3 | No flaky tests | 3x consecutive pass |

---

### marsai:qa-analyst-frontend → frontend/testing-*.md

**Mode Detection:** `test_mode` parameter determines which standards to load.

| # | Section to Check | Mode | File |
|---|------------------|------|------|
| ACC-1 | axe-core Integration | accessibility | testing-accessibility.md |
| ACC-2 | Semantic HTML Verification | accessibility | testing-accessibility.md |
| ACC-3 | Keyboard Navigation | accessibility | testing-accessibility.md |
| ACC-4 | Focus Management | accessibility | testing-accessibility.md |
| ACC-5 | Color Contrast | accessibility | testing-accessibility.md |
| VIS-1 | Snapshot Testing Patterns | visual | testing-visual.md |
| VIS-2 | States Coverage | visual | testing-visual.md |
| VIS-3 | Responsive Snapshots | visual | testing-visual.md |
| VIS-4 | Component Duplication Check | visual | testing-visual.md |
| E2E-1 | User Flow Consumption | e2e | testing-e2e.md |
| E2E-2 | Error Path Testing | e2e | testing-e2e.md |
| E2E-3 | Cross-Browser Testing | e2e | testing-e2e.md |
| E2E-4 | Responsive E2E | e2e | testing-e2e.md |
| E2E-5 | Selector Strategy | e2e | testing-e2e.md |
| PERF-1 | Core Web Vitals | performance | testing-performance.md |
| PERF-2 | Lighthouse Score | performance | testing-performance.md |
| PERF-3 | Bundle Analysis | performance | testing-performance.md |
| PERF-4 | Server Component Audit | performance | testing-performance.md |
| PERF-5 | Anti-Pattern Detection | performance | testing-performance.md |

---

## Maintenance Instructions

**When you add/modify a section in a standards file:**

1. Edit `dev-team/docs/standards/{file}.md` - Add your new `## Section Name`
2. Edit THIS file - Add the section to the corresponding agent table above
3. Verify row count matches section count

**Anti-Rationalization:**

| Rationalization                   | Why It's WRONG                                     | Required Action                      |
| --------------------------------- | -------------------------------------------------- | ------------------------------------ |
| "I'll update the index later"     | Later = never. Sync drift causes missed checks.    | **Update BOTH files in same commit** |
| "The section is minor"            | Minor ≠ optional. All sections must be indexed.    | **Add to index regardless of size**  |
| "Agents parse dynamically anyway" | Index is the explicit contract. Dynamic is backup. | **Index is source of truth**         |
