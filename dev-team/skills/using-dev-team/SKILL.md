---
name: marsai:using-dev-team
description: |
  8 specialist developer agents for backend (TypeScript), DevOps, frontend,
  design, UI implementation, QA (backend + frontend), and SRE. Dispatch when you need deep technology expertise.

trigger: |
  - Need deep expertise for specific technology (TypeScript)
  - Building infrastructure/CI-CD → marsai:devops-engineer
  - Frontend with design focus → marsai:frontend-designer
  - Frontend from product-designer specs → marsai:ui-engineer
  - Backend test strategy → marsai:qa-analyst
  - Frontend test strategy → marsai:qa-analyst-frontend
  - Reliability/monitoring → marsai:sre

skip_when: |
  - General code review → use default plugin reviewers
  - Planning/design → use brainstorming
  - Debugging → use marsai:systematic-debugging

related:
  similar: [marsai:using-marsai]
---

# Using MarsAI Developer Specialists

The marsai-dev-team plugin provides 8 specialized developer agents. Use them via `Task tool with subagent_type:`.

See [CLAUDE.md](https://raw.githubusercontent.com/V4-Company/marsai/main/CLAUDE.md) and [marsai:using-marsai](https://raw.githubusercontent.com/V4-Company/marsai/main/default/skills/using-marsai/SKILL.md) for canonical workflow requirements and ORCHESTRATOR principle. This skill introduces dev-team-specific agents.

**Remember:** Follow the **ORCHESTRATOR principle** from `marsai:using-marsai`. Dispatch agents to handle complexity; don't operate tools directly.

---

## Blocker Criteria - STOP and Report

<block_condition>

- Technology Stack decision needed
- Architecture decision needed (monolith vs microservices)
- Infrastructure decision needed (cloud provider)
- Testing strategy decision needed (unit vs E2E)
  </block_condition>

If any condition applies, STOP and ask user.

**always pause and report blocker for:**

| Decision Type        | Examples                         | Action                                         |
| -------------------- | -------------------------------- | ---------------------------------------------- |
| **Technology Stack** | TypeScript variant for new service | STOP. Check existing patterns. Ask user.       |
| **Architecture**     | Monolith vs microservices        | STOP. This is a business decision. Ask user.   |
| **Infrastructure**   | Cloud provider choice            | STOP. Check existing infrastructure. Ask user. |
| **Testing Strategy** | Unit vs E2E vs both              | STOP. Check QA requirements. Ask user.         |

**You CANNOT make technology decisions autonomously. STOP and ask.**

---

## Common Misconceptions - REJECTED

See [shared-patterns/shared-anti-rationalization.md](../shared-patterns/shared-anti-rationalization.md) for universal anti-rationalizations (including Specialist Dispatch section).

**Self-sufficiency bias check:** If you're tempted to implement directly, ask:

1. Is there a specialist for this? (Check the 9 specialists below)
2. Would a specialist follow standards I might miss?
3. Am I avoiding dispatch because it feels like "overhead"?

**If any answer is yes → You MUST DISPATCH the specialist. This is NON-NEGOTIABLE.**

---

## Severity Calibration

| Severity | Criteria | Examples |
|----------|----------|----------|
| **CRITICAL** | Wrong agent dispatched, security risk | Backend agent for frontend task, skipped security review |
| **HIGH** | Missing specialist dispatch, sequential reviewers | Implemented directly without agent, reviewers run one-by-one |
| **MEDIUM** | Suboptimal agent selection, missing context | Used general agent when specialist exists |
| **LOW** | Documentation gaps, minor dispatch issues | Missing agent context, unclear prompt |

Report all severities. CRITICAL = immediate correction. HIGH = fix before continuing. MEDIUM = note for next dispatch. LOW = document.

---

## Anti-Rationalization Table

See [shared-patterns/shared-anti-rationalization.md](../shared-patterns/shared-anti-rationalization.md) for universal anti-rationalizations (including Specialist Dispatch section and Universal section).

---

### Cannot Be Overridden

<cannot_skip>

- Dispatch to specialist (standards loading required)
- 8-gate development cycle (quality gates)
- Parallel reviewer dispatch (not sequential)
- TDD in Gate 0 (test-first)
- User approval in Gate 9
  </cannot_skip>

**These requirements are NON-NEGOTIABLE:**

| Requirement                    | Why It Cannot Be Waived                       |
| ------------------------------ | --------------------------------------------- |
| **Dispatch to specialist**     | Specialists have standards loading, you don't |
| **8-gate development cycle**  | Gates prevent quality regressions             |
| **Parallel reviewer dispatch** | Sequential review = 3x slower, same cost      |
| **TDD in Gate 0**              | Test-first ensures testability                |
| **User approval in Gate 9**    | Only users can approve completion             |

**User cannot override these. Time pressure cannot override these. "Simple task" cannot override these.**

---

## Pressure Resistance

See [shared-patterns/shared-pressure-resistance.md](../shared-patterns/shared-pressure-resistance.md) for universal pressure scenarios (including Combined Pressure Scenarios and Emergency Response).

**Critical Reminder:**

- **Urgency ≠ Permission to bypass** - Emergencies require MORE care, not less
- **Authority ≠ Permission to bypass** - MarsAI standards override human preferences
- **Sunk Cost ≠ Permission to bypass** - Wrong approach stays wrong at 80% completion

---

## Emergency Response Protocol

See [shared-patterns/shared-pressure-resistance.md](../shared-patterns/shared-pressure-resistance.md) → Emergency Response section for the complete protocol.

**Emergency Dispatch Template:**

```
Task tool:
  subagent_type: "marsai:backend-engineer-typescript"
  prompt: "URGENT PRODUCTION INCIDENT: [brief context]. [Your specific request]"
```

**IMPORTANT:** Specialist dispatch takes 5-10 minutes, not hours. This is NON-NEGOTIABLE even under CEO pressure.

---

## Combined Pressure Scenarios

See [shared-patterns/shared-pressure-resistance.md](../shared-patterns/shared-pressure-resistance.md) → Combined Pressure Scenarios section.

---

## 8 Developer Specialists

<dispatch_required agent="{specialist}">
Use Task tool to dispatch appropriate specialist based on technology need.
</dispatch_required>

| Agent                                       | Specializations                                                                                      | Use When                                                                              |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **`marsai:backend-engineer-typescript`**      | TypeScript/Node.js, Express/Fastify/NestJS, Prisma/TypeORM, async patterns, Jest/Vitest              | TS backends, JS→TS migration, NestJS design, full-stack TS                            |
| **`marsai:devops-engineer`**                  | Docker/Compose, Terraform/Helm, cloud infra, secrets management                                      | Containerization, local dev setup, IaC provisioning, Helm charts                      |
| **`marsai:frontend-bff-engineer-typescript`** | Next.js API Routes BFF, Clean/Hexagonal Architecture, DDD patterns, Inversify DI, repository pattern | BFF layer, Clean Architecture, DDD domains, API orchestration                         |
| **`marsai:frontend-designer`**                | Bold typography, color systems, animations, unexpected layouts, textures/gradients                   | Landing pages, portfolios, distinctive dashboards, design systems                     |
| **`marsai:ui-engineer`**                      | Wireframe-to-code, Design System compliance, UX criteria satisfaction, UI states implementation      | Implementing from product-designer specs (ux-criteria.md, user-flows.md, wireframes/) |
| **`marsai:qa-analyst`**                       | Test strategy, coverage analysis, API testing, integration/chaos testing                             | Backend test planning, coverage gaps, quality gates                                   |
| **`marsai:qa-analyst-frontend`**              | Vitest, Testing Library, axe-core, Playwright, Lighthouse, Core Web Vitals, snapshot testing         | Frontend test planning, accessibility, visual, E2E, performance testing               |
| **`marsai:sre`**                              | Structured logging, tracing, health checks, observability                                            | Logging validation, tracing setup, health endpoint verification                       |

**Dispatch template:**

```
Task tool:
  subagent_type: "marsai:{agent-name}"
  prompt: "{Your specific request with context}"
```

**Frontend Agent Selection:**

- `marsai:frontend-designer` = visual aesthetics, design specifications (no code)
- `marsai:frontend-bff-engineer-typescript` = business logic/architecture, BFF layer
- `marsai:ui-engineer` = implementing UI from product-designer specs (ux-criteria.md, user-flows.md, wireframes/)

**When to use marsai:ui-engineer:**
Use `marsai:ui-engineer` when product-designer outputs exist in `docs/pre-dev/{feature}/`. The marsai:ui-engineer specializes in translating design specifications into production code while ensuring all UX criteria are satisfied.

---

## When to Use Developer Specialists vs General Review

### Use Developer Specialists for:

- ✅ **Deep technical expertise needed** – Architecture decisions, complex implementations
- ✅ **Technology-specific guidance** – "How do I optimize this TypeScript service?"
- ✅ **Specialized domains** – Infrastructure, SRE, testing strategy
- ✅ **Building from scratch** – New service, new pipeline, new testing framework

### Use General Review Agents for:

- ✅ **Code quality assessment** – Architecture, patterns, maintainability
- ✅ **Correctness & edge cases** – Business logic verification
- ✅ **Security review** – OWASP, auth, validation
- ✅ **Post-implementation** – Before merging existing code

**Both can be used together:** Get developer specialist guidance during design, then run general reviewers before merge.

---

## Dispatching Multiple Specialists

If you need multiple specialists (e.g., backend engineer + DevOps engineer), dispatch in **parallel** (single message, multiple Task calls):

```
✅ CORRECT:
Task #1: marsai:backend-engineer-typescript
Task #2: marsai:devops-engineer
(Both run in parallel)

❌ WRONG:
Task #1: marsai:backend-engineer-typescript
(Wait for response)
Task #2: marsai:devops-engineer
(Sequential = 2x slower)
```

---

## ORCHESTRATOR Principle

Remember:

- **You're the orchestrator** – Dispatch specialists, don't implement directly
- **Don't read specialist docs yourself** – Dispatch to specialist, they know their domain
- **Combine with marsai:using-marsai principle** – Skills + Specialists = complete workflow

### Good Example (ORCHESTRATOR):

> "I need a TypeScript service. Let me dispatch `marsai:backend-engineer-typescript` to design it."

### Bad Example (OPERATOR):

> "I'll manually read TypeScript best practices and design the service myself."

---

## Available in This Plugin

**Agents:** See "9 Developer Specialists" table above.

**Skills:** `marsai:using-dev-team` (this), `marsai:dev-cycle` (8-gate backend workflow), `marsai:dev-cycle-frontend` (9-gate frontend workflow), `marsai:dev-refactor` (backend/general codebase analysis), `marsai:dev-refactor-frontend` (frontend codebase analysis)

**Commands:** `/marsai:dev-cycle` (backend tasks), `/marsai:dev-cycle-frontend` (frontend tasks), `/marsai:dev-refactor` (analyze backend/general codebase), `/marsai:dev-refactor-frontend` (analyze frontend codebase), `/marsai:dev-status`, `/marsai:dev-cancel`, `/marsai:dev-report`

**Note:** Missing agents? Check `.claude-plugin/marketplace.json` for marsai-dev-team plugin.

---

## Development Workflows

All workflows converge to the 8-gate development cycle:

| Workflow         | Entry Point                           | Output                                        | Then                         |
| ---------------- | ------------------------------------- | --------------------------------------------- | ---------------------------- |
| **New Feature**  | `/marsai:pre-dev-feature "description"` | `docs/pre-dev/{feature}/tasks.md`             | → `/marsai:dev-cycle tasks.md` |
| **Direct Tasks** | `/marsai:dev-cycle tasks.md`            | —                                             | Execute 8 gates directly     |
| **Refactoring**  | `/marsai:dev-refactor`                  | `docs/marsai:dev-refactor/{timestamp}/tasks.md` | → `/marsai:dev-cycle tasks.md` |
| **Frontend Refactoring** | `/marsai:dev-refactor-frontend` | `docs/marsai:dev-refactor-frontend/{timestamp}/tasks.md` | → `/marsai:dev-cycle-frontend tasks.md` |

**8-Gate Backend Development Cycle:**

| Gate                       | Focus                            | Agent(s)                                                                               |
| -------------------------- | -------------------------------- | -------------------------------------------------------------------------------------- |
| **0: Implementation**      | TDD: RED→GREEN→REFACTOR          | `marsai:backend-engineer-*`, `marsai:frontend-bff-engineer-typescript`, `marsai:ui-engineer` |
| **1: DevOps**              | Dockerfile, docker-compose, .env | `marsai:devops-engineer`                                                                 |
| **2: SRE**                 | Health checks, logging, tracing  | `marsai:sre`                                                                             |
| **3: Unit Testing**        | Unit tests, coverage ≥85%        | `marsai:qa-analyst`                                                                      |
| **4: Integration Testing** | Integration tests (write per unit, execute at end) | `marsai:qa-analyst`                                                   |
| **5: Chaos Testing**       | Chaos tests (write per unit, execute at end) | `marsai:qa-analyst`                                                         |
| **6: Review**              | 7 reviewers IN PARALLEL          | `marsai:code-reviewer`, `marsai:business-logic-reviewer`, `marsai:security-reviewer`, `marsai:test-reviewer`, `marsai:nil-safety-reviewer`, `marsai:consequences-reviewer`, `marsai:dead-code-reviewer` |
| **7: Validation**          | User approval: APPROVED/REJECTED | User decision                                                                          |

**Gate 0 Agent Selection for Frontend:**

- If `docs/pre-dev/{feature}/ux-criteria.md` exists → use `marsai:ui-engineer`
- Otherwise → use `marsai:frontend-bff-engineer-typescript`

**Key Principle:** Backend follows the 8-gate process. Frontend follows the 9-gate process.

### Frontend Development Cycle (9 Gates)

**Use `/marsai:dev-cycle-frontend` for frontend-specific development:**

| Gate                      | Focus                                | Agent(s)                        |
| ------------------------- | ------------------------------------ | ------------------------------- |
| **0: Implementation**     | TDD: RED→GREEN→REFACTOR              | `marsai:frontend-engineer`, `marsai:ui-engineer`, `marsai:frontend-bff-engineer-typescript` |
| **1: DevOps**             | Dockerfile, docker-compose, .env     | `marsai:devops-engineer`          |
| **2: Accessibility**      | WCAG 2.1 AA, axe-core, keyboard nav | `marsai:qa-analyst-frontend`      |
| **3: Unit Testing**       | Vitest + Testing Library, ≥85%       | `marsai:qa-analyst-frontend`      |
| **4: Visual Testing**     | Snapshots, states, responsive        | `marsai:qa-analyst-frontend`      |
| **5: E2E Testing**        | Playwright, cross-browser, user flows| `marsai:qa-analyst-frontend`      |
| **6: Performance**        | Core Web Vitals, Lighthouse > 90     | `marsai:qa-analyst-frontend`      |
| **7: Review**             | 7 reviewers IN PARALLEL              | `marsai:code-reviewer`, `marsai:business-logic-reviewer`, `marsai:security-reviewer`, `marsai:test-reviewer`, `marsai:nil-safety-reviewer`, `marsai:consequences-reviewer`, `marsai:dead-code-reviewer` |
| **8: Validation**         | User approval: APPROVED/REJECTED     | User decision                   |

**Backend → Frontend Handoff:**
When backend dev cycle completes, it produces a handoff with endpoints, types, and contracts. The frontend dev cycle consumes this handoff to verify E2E tests exercise the correct API endpoints.

| Step | Command | Output |
|------|---------|--------|
| 1. Backend | `/marsai:dev-cycle tasks.md` | Backend code + handoff (endpoints, contracts) |
| 2. Frontend | `/marsai:dev-cycle-frontend tasks-frontend.md` | Frontend code consuming backend endpoints |

---

## Integration with Other Plugins

- **marsai:using-marsai** (default) – ORCHESTRATOR principle for all agents

Dispatch based on your need:

- General code review → default plugin agents
- Specific domain expertise → marsai-dev-team agents
