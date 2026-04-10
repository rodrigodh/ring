# MarsAI Marketplace Manual

Quick reference guide for the MarsAI skills library and workflow system. This monorepo provides 2 plugins with 54 skills, 22 agents, and 23 slash commands for enforcing proven software engineering practices.

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                              MARKETPLACE (2 PLUGINS)                               │
│                     (monorepo: .claude-plugin/marketplace.json)                    │
│                                                                                    │
│  ┌───────────────┐  ┌───────────────┐                                            │
│  │ marsai-default  │  │ marsai-dev-team │                                            │
│  │  Skills(22)   │  │  Skills(32)   │                                            │
│  │  Agents(10)   │  │  Agents(12)   │                                            │
│  │  Cmds(14)     │  │  Cmds(9)      │                                            │
│  └───────────────┘  └───────────────┘                                            │
└────────────────────────────────────────────────────────────────────────────────────┘

                              HOW IT WORKS
                              ────────────

    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
    │   SESSION    │         │    USER      │         │  CLAUDE CODE │
    │    START     │────────▶│   PROMPT     │────────▶│   WORKING    │
    └──────────────┘         └──────────────┘         └──────────────┘
           │                        │                        │
           ▼                        ▼                        ▼
    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
    │    HOOKS     │         │   COMMANDS   │         │    SKILLS    │
    │ auto-inject  │         │ user-invoked │         │ auto-applied │
    │   context    │         │  /marsai:...   │         │  internally  │
    └──────────────┘         └──────────────┘         └──────────────┘
           │                        │                        │
           │                        ▼                        │
           │                 ┌──────────────┐                │
           └────────────────▶│    AGENTS    │◀───────────────┘
                             │  dispatched  │
                             │  for work    │
                             └──────────────┘

                            COMPONENT ROLES
                            ───────────────

    ┌────────────┬──────────────────────────────────────────────────┐
    │ Component  │ Purpose                                          │
    ├────────────┼──────────────────────────────────────────────────┤
    │ MARKETPLACE│ Monorepo containing all plugins                  │
    │ PLUGIN     │ Self-contained package (skills+agents+commands)  │
    │ HOOK       │ Auto-runs at session events (injects context)    │
    │ SKILL      │ Workflow pattern (Claude Code uses internally)   │
    │ COMMAND    │ User-invokable action (/marsai:codereview)         │
    │ AGENT      │ Specialized subprocess (Task tool dispatch)      │
    └────────────┴──────────────────────────────────────────────────┘
```

---

## 🎯 Quick Start

MarsAI is auto-loaded at session start. Three ways to invoke MarsAI capabilities:

1. **Slash Commands** – `/command-name`
2. **Skills** – `Skill tool: "marsai:skill-name"`
3. **Agents** – `Task tool with subagent_type: "marsai:agent-name"`

---

## 📋 Slash Commands

Commands are invoked directly: `/command-name`.

### Project & Feature Workflows

| Command                         | Use Case                                    | Example                                            |
| ------------------------------- | ------------------------------------------- | -------------------------------------------------- |
| `/marsai:brainstorm [topic]`      | Interactive design refinement before coding | `/marsai:brainstorm user-authentication`             |
| `/marsai:explore-codebase [path]` | Autonomous two-phase codebase exploration   | `/marsai:explore-codebase payment/`                  |
| `/marsai:interview-me [topic]`    | Proactive requirements gathering interview  | `/marsai:interview-me auth-system`                   |
| `/marsai:md-to-html [file]`       | Transform a markdown file into an HTML page | `/marsai:md-to-html architecture.md`                 |
| `/marsai:diagram [topic]`         | Generate a Mermaid diagram                  | `/marsai:diagram payment-flow`                       |
| `/marsai:visualize [topic]`       | Generate visual explanation                 | `/marsai:visualize auth-architecture`                |
| `/marsai:release-guide`           | Generate step-by-step release instructions  | `/marsai:release-guide`                              |
| `/marsai:pre-dev-feature [name]`  | Plan simple features (<2 days) – 5 gates    | `/marsai:pre-dev-feature logout-button`              |
| `/marsai:pre-dev-full [name]`     | Plan complex features (≥2 days) – 10 gates  | `/marsai:pre-dev-full payment-system`                |
| `/marsai:worktree [branch-name]`  | Create isolated git workspace               | `/marsai:worktree auth-system`                       |
| `/marsai:write-plan [feature]`    | Generate detailed task breakdown            | `/marsai:write-plan dashboard-redesign`              |
| `/marsai:execute-plan [path]`     | Execute plan in batches with checkpoints    | `/marsai:execute-plan docs/pre-dev/feature/tasks.md` |

### Code & Integration Workflows

| Command                             | Use Case                                       | Example                                              |
| ----------------------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| `/marsai:codereview [files-or-paths]` | Dispatch 7 parallel code reviewers             | `/marsai:codereview src/auth/`                         |
| `/marsai:commit [message]`            | Create git commit with AI trailers             | `/marsai:commit "fix(auth): improve token validation"` |
| `/marsai:lint [path]`                 | Run lint and dispatch agents to fix all issues | `/marsai:lint src/`                                    |

### Session Management

| Command                       | Use Case                                                      | Example                              |
| ----------------------------- | ------------------------------------------------------------- | ------------------------------------ |
| `/marsai:create-handoff [name]` | Create handoff document before /clear (auto-resumes via hook) | `/marsai:create-handoff auth-refactor` |

### Development Cycle (marsai-dev-team)

| Command                     | Use Case                           | Example                                 |
| --------------------------- | ---------------------------------- | --------------------------------------- |
| `/marsai:dev-cycle [task]`    | Start 10-gate development workflow | `/marsai:dev-cycle "implement user auth"` |
| `/marsai:dev-cycle-frontend [task]` | Start 9-gate frontend workflow | `/marsai:dev-cycle-frontend "improve dashboard UX"` |
| `/marsai:dev-refactor [path]` | Analyze codebase against standards | `/marsai:dev-refactor src/`               |
| `/marsai:dev-refactor-frontend [path]` | Analyze frontend against standards | `/marsai:dev-refactor-frontend web/` |
| `/marsai:dev-service-discovery [path]` | Scan service/module/resource hierarchy | `/marsai:dev-service-discovery .` |
| `/marsai:dev-status`          | Show current gate progress         | `/marsai:dev-status`                      |
| `/marsai:dev-report`          | Generate development cycle report  | `/marsai:dev-report`                      |
| `/marsai:dev-cancel`          | Cancel active development cycle    | `/marsai:dev-cancel`                      |
| `/marsai:migrate-v4 [path]`  | Analyze Go service for lib-commons v4 migration | `/marsai:migrate-v4 src/`        |

---

## 💡 About Skills

Skills (54) are workflows that Claude Code invokes automatically when it detects they're applicable. They handle testing, debugging, verification, planning, and code review enforcement. You don't call them directly - Claude Code uses them internally to enforce best practices.

Examples: marsai:test-driven-development, marsai:systematic-debugging, marsai:requesting-code-review, marsai:verification-before-completion, marsai:production-readiness-audit (44-dimension audit, up to 10 explorers per batch, incremental report 0-430, max 440 with multi-tenant; see [default/skills/production-readiness-audit/SKILL.md](default/skills/production-readiness-audit/SKILL.md)), etc.

### Skill Selection Criteria

Each skill has structured frontmatter that helps Claude Code determine which skill to use:

| Field         | Purpose                           | Example                                  |
| ------------- | --------------------------------- | ---------------------------------------- |
| `description` | WHAT the skill does               | "Four-phase debugging framework..."      |
| `trigger`     | WHEN to use (specific conditions) | "Bug reported", "Test failure observed"  |
| `skip_when`   | WHEN NOT to use (exclusions)      | "Root cause already known → just fix it" |
| `sequence`    | Workflow ordering (optional)      | `after: [prd-creation]`                  |
| `related`     | Similar/complementary skills      | `similar: [root-cause-tracing]`          |

**How Claude Code chooses skills:**

1. Checks `trigger` conditions against current context
2. Uses `skip_when` to differentiate from similar skills
3. Considers `sequence` for workflow ordering
4. References `related` for disambiguation when multiple skills match

---

## 🤖 Available Agents

Invoke via `Task tool with subagent_type: "..."`.

### Code Review (marsai-default)

**Always dispatch all 7 in parallel** (single message, 7 Task calls):

| Agent                          | Purpose                                      |
| ------------------------------ | -------------------------------------------- |
| `marsai:code-reviewer`           | Architecture, patterns, maintainability      |
| `marsai:business-logic-reviewer` | Domain correctness, edge cases, requirements |
| `marsai:security-reviewer`       | Vulnerabilities, OWASP, auth, validation     |
| `marsai:test-reviewer`           | Test coverage, quality, and completeness     |
| `marsai:nil-safety-reviewer`     | Nil/null pointer safety analysis             |
| `marsai:consequences-reviewer`   | Ripple effect, caller impact, downstream consequences |
| `marsai:dead-code-reviewer`      | Unused code, unreachable paths, dead exports          |

**Example:** Before merging, run all 7 parallel reviewers via `/marsai:codereview src/`

### Orchestration (marsai-default)

| Agent                  | Purpose                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `marsai:review-slicer`   | Groups large multi-themed PRs into thematic slices for focused review |

### Planning & Analysis (marsai-default)

| Agent                    | Purpose                                                  |
| ------------------------ | -------------------------------------------------------- |
| `marsai:write-plan`        | Generate implementation plans for zero-context execution |
| `marsai:codebase-explorer` | Deep architecture analysis (vs `Explore` for speed)      |

### Developer Specialists (marsai-dev-team)

Use when you need expert depth in specific domains:

| Agent                                   | Specialization               | Technologies                                       |
| --------------------------------------- | ---------------------------- | -------------------------------------------------- |
| `marsai:backend-engineer-golang`          | Go microservices & APIs      | Fiber, gRPC, PostgreSQL, MongoDB, Kafka, OAuth2    |
| `marsai:backend-engineer-typescript`      | TypeScript/Node.js backend   | Express, NestJS, Prisma, TypeORM, GraphQL          |
| `marsai:devops-engineer`                  | Infrastructure & CI/CD       | Docker, Kubernetes, Terraform, GitHub Actions      |
| `marsai:frontend-bff-engineer-typescript` | BFF & React/Next.js frontend | Next.js API Routes, Clean Architecture, DDD, React |
| `marsai:frontend-designer`                | Visual design & aesthetics   | Typography, motion, CSS, distinctive UI            |
| `marsai:frontend-engineer`                | General frontend development | React, TypeScript, CSS, component architecture     |
| `marsai:helm-engineer`                    | Helm chart specialist        | Helm charts, Kubernetes, Lerian conventions        |
| `marsai:prompt-quality-reviewer`          | AI prompt quality review     | Prompt engineering, clarity, effectiveness         |
| `marsai:qa-analyst`                       | Quality assurance            | Test strategy, automation, coverage                |
| `marsai:qa-analyst-frontend`              | Frontend QA specialist       | Accessibility, visual regression, E2E, performance |
| `marsai:sre`                              | Site reliability & ops       | Monitoring, alerting, incident response, SLOs      |
| `marsai:ui-engineer`                      | UI component specialist      | Design systems, accessibility, React               |

**Standards Compliance Output:** All marsai-dev-team agents include a `## Standards Compliance` output section with conditional requirement:

| Invocation Context      | Standards Compliance | Trigger                                   |
| ----------------------- | -------------------- | ----------------------------------------- |
| Direct agent call       | Optional             | N/A                                       |
| Via `marsai:dev-cycle`    | Optional             | N/A                                       |
| Via `marsai:dev-refactor` | **MANDATORY**        | Prompt contains `**MODE: ANALYSIS ONLY**` |

**How it works:**

1. `marsai:dev-refactor` dispatches agents with `**MODE: ANALYSIS ONLY**` in prompt
2. Agents detect this pattern and load MarsAI standards via WebFetch
3. Agents produce comparison tables: Current Pattern vs Expected Pattern
4. Output includes severity, location, and migration recommendations

**Example output when non-compliant:**

```markdown
## Standards Compliance

| Category | Current     | Expected        | Status | Location      |
| -------- | ----------- | --------------- | ------ | ------------- |
| Logging  | fmt.Println | lib-commons/zap | ⚠️     | service/\*.go |
```

**Cross-references:** CLAUDE.md (Standards Compliance section), `dev-team/skills/dev-refactor/SKILL.md`

---

## 📖 Common Workflows

### New Feature Development

1. **Design** → `/marsai:brainstorm feature-name`
2. **Plan** → `/marsai:pre-dev-feature feature-name` (or `marsai:pre-dev-full` if complex)
3. **Isolate** → `/marsai:worktree feature-branch`
4. **Implement** → Use `marsai:test-driven-development` skill
5. **Review** → `/marsai:codereview src/` (dispatches 7 reviewers)
6. **Commit** → `/marsai:commit "message"`

### Bug Investigation

1. **Investigate** → Use `marsai:systematic-debugging` skill
2. **Trace** → Use `marsai:root-cause-tracing` if needed
3. **Implement** → Use `marsai:test-driven-development` skill
4. **Verify** → Use `marsai:verification-before-completion` skill
5. **Review & Merge** → `/marsai:codereview` + `/marsai:commit`

### Code Review

```
/marsai:codereview [files-or-paths]
    ↓
Runs in parallel:
  • marsai:code-reviewer
  • marsai:business-logic-reviewer
  • marsai:security-reviewer
  • marsai:test-reviewer
  • marsai:nil-safety-reviewer
  • marsai:consequences-reviewer
  • marsai:dead-code-reviewer
    ↓
Consolidated report with recommendations
```

---

## 🎓 Mandatory Rules

These enforce quality standards:

1. **TDD is enforced** – Test must fail (RED) before implementation
2. **Skill check is mandatory** – Use `marsai:using-marsai` before any task
3. **Reviewers run parallel** – Never sequential review (use `/marsai:codereview`)
4. **Verification required** – Don't claim complete without evidence
5. **No incomplete code** – No "TODO" or placeholder comments
6. **Error handling required** – Don't ignore errors

---

## 💡 Best Practices

### Command Selection

| Situation                                              | Use This                |
| ------------------------------------------------------ | ----------------------- |
| New feature, unsure about design                       | `/marsai:brainstorm`      |
| Feature will take < 2 days                             | `/marsai:pre-dev-feature` |
| Feature will take ≥ 2 days or has complex dependencies | `/marsai:pre-dev-full`    |
| Need implementation tasks                              | `/marsai:write-plan`      |
| Before merging code                                    | `/marsai:codereview`      |

### Agent Selection

| Need                              | Agent to Use                                |
| --------------------------------- | ------------------------------------------- |
| General code quality review       | 7 parallel reviewers via `/marsai:codereview` |
| Large PR review (15+ files)       | Auto-sliced via `marsai:review-slicer`        |
| Implementation planning           | `marsai:write-plan`                           |
| Deep codebase analysis            | `marsai:codebase-explorer`                    |
| Go backend expertise              | `marsai:backend-engineer-golang`              |
| TypeScript/Node.js backend        | `marsai:backend-engineer-typescript`          |
| Infrastructure/DevOps             | `marsai:devops-engineer`                      |
| React/Next.js frontend & BFF      | `marsai:frontend-bff-engineer-typescript`     |
| General frontend development      | `marsai:frontend-engineer`                    |
| Visual design & aesthetics        | `marsai:frontend-designer`                    |
| Helm charts & Kubernetes          | `marsai:helm-engineer`                        |
| UI component development          | `marsai:ui-engineer`                          |
| AI prompt quality review          | `marsai:prompt-quality-reviewer`              |
| Backend quality assurance          | `marsai:qa-analyst`                           |
| Frontend quality assurance         | `marsai:qa-analyst-frontend`                  |
| Site reliability & operations     | `marsai:sre`                                  |

---

## 🔧 How MarsAI Works

### Session Startup

1. SessionStart hook runs automatically
2. All 54 skills are auto-discovered and available
3. `marsai:using-marsai` workflow is activated (skill checking is now mandatory)

### Agent Dispatching

```
Task tool:
  subagent_type: "marsai:code-reviewer"
  prompt: [context]
    ↓
Runs agent
    ↓
Returns structured output per agent's output_schema
```

### Parallel Review Pattern

```
Single message with 7 Task calls (not sequential):

Task #1: marsai:code-reviewer
Task #2: marsai:business-logic-reviewer
Task #3: marsai:security-reviewer
Task #4: marsai:test-reviewer
Task #5: marsai:nil-safety-reviewer
Task #6: marsai:consequences-reviewer
Task #7: marsai:dead-code-reviewer
    ↓
All run in parallel (saves ~15 minutes vs sequential)
    ↓
Consolidated report
```

### Environment Variables

| Variable                | Default | Purpose                                                |
| ----------------------- | ------- | ------------------------------------------------------ |
| `CLAUDE_PLUGIN_ROOT`    | (auto)  | Path to installed plugin directory                     |

---

## 📚 More Information

- **Full Documentation** → `default/skills/*/SKILL.md` files
- **Agent Definitions** → `default/agents/*.md` files
- **Commands** → `default/commands/*.md` files
- **Plugin Config** → `.claude-plugin/marketplace.json`
- **CLAUDE.md** → Project-specific instructions (checked into repo)

---

## ❓ Need Help?

- **How to use Claude Code?** → Ask about Claude Code features, MCP servers, slash commands
- **How to use MarsAI?** → Check skill names in this manual or in `marsai:using-marsai` skill
- **Feature/bug tracking?** → https://github.com/lerianstudio/marsai/issues
