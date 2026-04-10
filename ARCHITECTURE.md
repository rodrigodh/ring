# MarsAI Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Marketplace Structure](#marketplace-structure)
3. [Component Hierarchy](#component-hierarchy)
4. [Core Components](#core-components)
5. [Data & Control Flow](#data--control-flow)
6. [Integration with Claude Code](#integration-with-claude-code)
7. [Execution Patterns](#execution-patterns)
8. [Component Relationships](#component-relationships)

## Overview

MarsAI is a **Claude Code plugin marketplace** that provides a comprehensive skills library and workflow system with **2 active plugins** (48 skills, 21 agents, 22 commands). It extends Claude Code's capabilities through structured, reusable patterns that enforce proven software engineering practices across the software delivery value chain.

### Architecture Philosophy

MarsAI operates on three core principles:

1. **Mandatory Workflows** - Critical skills (like marsai:using-marsai) enforce specific behaviors
2. **Parallel Execution** - Review systems run concurrently for speed
3. **Session Context** - Skills load automatically at session start
4. **Modular Plugins** - Specialized plugins for different domains and teams

### System Boundaries

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Claude Code                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                          MarsAI Marketplace                                  │  │
│  │  ┌──────────────────────┐  ┌──────────────────────┐                       │  │
│  │  │ marsai-default         │  │ marsai-dev-team        │                       │  │
│  │  │ Skills(22) Agents(10)│  │ Skills(32) Agents(12)│                       │  │
│  │  │ Cmds(14) Hooks/Lib   │  │ Cmds(9)              │                       │  │
│  │  └──────────────────────┘  └──────────────────────┘                       │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  Native Tools: Skill, Task, TodoWrite, SlashCommand                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Marketplace Structure

MarsAI is organized as a monorepo marketplace with multiple plugin collections:

```
ring/                                  # Monorepo root
├── .claude-plugin/
│   └── marketplace.json              # Multi-plugin registry (2 active plugins)
├── default/                          # Core plugin: marsai-default
└── dev-team/                         # Developer agents: marsai-dev-team
```

### Active Plugins

_Versions managed in `.claude-plugin/marketplace.json`_

| Plugin               | Description                          | Components                       |
| -------------------- | ------------------------------------ | -------------------------------- |
| **marsai-default**     | Core skills library                  | 22 skills, 10 agents, 14 commands |
| **marsai-dev-team**    | Developer agents                     | 26 skills, 11 agents, 8 commands |

## Component Hierarchy

### 1. Skills (`skills/`)

**Purpose:** Core instruction sets that define workflows and best practices

**Structure:**

```
skills/
├── {skill-name}/
│   └── SKILL.md           # Skill definition with frontmatter
├── shared-patterns/       # Reusable patterns across skills
│   ├── state-tracking.md
│   ├── failure-recovery.md
│   ├── exit-criteria.md
│   └── todowrite-integration.md
```

**Key Characteristics:**

- Self-contained directories with `SKILL.md` files
- YAML frontmatter: `name`, `description`, `when_to_use`
- Invoked via Claude's `Skill` tool
- Can reference shared patterns for common behaviors

### 2. Agents (`agents/`)

**Purpose:** Specialized agents that analyze code/designs or provide domain expertise using AI models

**Structure (marsai-default plugin):**

```
default/agents/
├── code-reviewer.md           # Foundation review (`marsai:code-reviewer`)
├── business-logic-reviewer.md # Correctness review (`marsai:business-logic-reviewer`)
├── security-reviewer.md       # Safety review (`marsai:security-reviewer`)
├── test-reviewer.md           # Test coverage and quality review (`marsai:test-reviewer`)
├── nil-safety-reviewer.md     # Null/nil safety analysis (`marsai:nil-safety-reviewer`)
├── consequences-reviewer.md   # Ripple effect review (`marsai:consequences-reviewer`)
├── dead-code-reviewer.md      # Dead code analysis (`marsai:dead-code-reviewer`)
├── review-slicer.md           # Thematic file grouping for large PRs (`marsai:review-slicer`)
├── write-plan.md              # Implementation planning (`marsai:write-plan`)
└── codebase-explorer.md       # Deep architecture analysis (`marsai:codebase-explorer`)
```

**Structure (marsai-dev-team plugin):**

```
dev-team/agents/
├── backend-engineer-typescript.md     # TypeScript backend specialist (`marsai:backend-engineer-typescript`)
├── devops-engineer.md                 # DevOps specialist (`marsai:devops-engineer`)
├── frontend-bff-engineer-typescript.md # BFF specialist (`marsai:frontend-bff-engineer-typescript`)
├── frontend-designer.md               # Visual design specialist (`marsai:frontend-designer`)
├── frontend-engineer.md               # Frontend engineer (`marsai:frontend-engineer`)
├── helm-engineer.md                   # Helm chart specialist (`marsai:helm-engineer`)
├── prompt-quality-reviewer.md         # Prompt quality specialist (`marsai:prompt-quality-reviewer`)
├── qa-analyst.md                      # Backend QA specialist (`marsai:qa-analyst`)
├── qa-analyst-frontend.md             # Frontend QA specialist (`marsai:qa-analyst-frontend`)
├── sre.md                             # Site reliability engineer (`marsai:sre`)
└── ui-engineer.md                     # UI component specialist (`marsai:ui-engineer`)
```

**Key Characteristics:**

- Invoked via Claude's `Task` tool with `subagent_type`
- Invoked with specialized subagent_type for domain-specific analysis
- Review agents run in parallel (7 reviewers dispatch simultaneously via `/marsai:codereview` command)
- Developer agents provide specialized domain expertise
- Return structured reports with severity-based findings

**Note:** Parallel review orchestration is handled by the `/marsai:codereview` command

**Standards Compliance Output (marsai-dev-team agents):**

All marsai-dev-team agents include a `## Standards Compliance` section in their output schema:

```yaml
- name: "Standards Compliance"
  pattern: "^## Standards Compliance"
  required: false # In schema, but MANDATORY when invoked from marsai:dev-refactor
  description: "MANDATORY when invoked from marsai:dev-refactor skill"
```

**Conditional Requirement: `invoked_from_dev_refactor`**

| Invocation Context            | Standards Compliance | Detection Mechanism                       |
| ----------------------------- | -------------------- | ----------------------------------------- |
| Direct agent call             | Optional             | N/A                                       |
| Via `marsai:dev-cycle` skill    | Optional             | N/A                                       |
| Via `marsai:dev-refactor` skill | **MANDATORY**        | Prompt contains `**MODE: ANALYSIS ONLY**` |

**How Enforcement Works:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  User invokes: /marsai:dev-refactor                          │
│         ↓                                                           │
│  marsai:dev-refactor skill dispatches agents with prompt:                  │
│  "**MODE: ANALYSIS ONLY** - Compare codebase with MarsAI standards"   │
│         ↓                                                           │
│  Agent detects "**MODE: ANALYSIS ONLY**" in prompt                  │
│         ↓                                                           │
│  Agent loads MarsAI standards via WebFetch                            │
│         ↓                                                           │
│  Agent produces Standards Compliance output (MANDATORY)             │
└─────────────────────────────────────────────────────────────────────┘
```

**Affected Agents:**

- `marsai:backend-engineer-typescript` → loads `typescript.md`
- `marsai:devops-engineer` → loads `devops.md`
- `marsai:frontend-bff-engineer-typescript` → loads `typescript.md`
- `marsai:frontend-designer` → loads `frontend.md`
- `marsai:qa-analyst` → loads `testing-*.md` (unit/fuzz/property/integration/chaos)
- `marsai:qa-analyst-frontend` → loads `frontend/testing-*.md` (accessibility/visual/e2e/performance)
- `marsai:sre` → loads `sre.md`

**Output Format (when non-compliant):**

```markdown
## Standards Compliance

### V4-Company/MarsAI Standards Comparison

| Category | Current Pattern | Expected Pattern | Status           | File/Location    |
| -------- | --------------- | ---------------- | ---------------- | ---------------- |
| Logging  | console.log     | structured logger| ⚠️ Non-Compliant | service/\*.ts    |

### Compliance Summary

- Total Violations: N
- Critical: N, High: N, Medium: N, Low: N

### Required Changes for Compliance

1. **Category Migration**
   - Replace: `current pattern`
   - With: `expected pattern`
   - Files affected: [list]
```

**Cross-References:**

- CLAUDE.md: Standards Compliance (Conditional Output Section)
- `dev-team/skills/dev-refactor/SKILL.md`: HARD GATES defining requirement
- `dev-team/hooks/session-start.sh`: Injects guidance at session start

### 3. Commands (`commands/`)

**Purpose:** Slash commands that provide shortcuts to skills/workflows

**Structure:**

```
default/commands/
├── brainstorm.md         # /marsai:brainstorm - Socratic design refinement
├── codereview.md         # /marsai:codereview - Parallel 7-reviewer dispatch
├── commit.md             # /marsai:commit - Git commit with trailers
├── create-handoff.md     # /marsai:create-handoff - Create session handoff
├── diagram.md            # /marsai:diagram - Generate Mermaid diagrams
├── execute-plan.md       # /marsai:execute-plan - Batch execution
├── explore-codebase.md   # /marsai:explore-codebase - Deep architecture analysis
├── interview-me.md       # /marsai:interview-me - Interactive interview
├── lint.md               # /marsai:lint - Run linters and fix issues
├── md-to-html.md         # /marsai:md-to-html - Markdown to HTML
├── release-guide.md      # /marsai:release-guide - Release guidance
├── visualize.md          # /marsai:visualize - Visual system explanations
├── worktree.md           # /marsai:worktree - Git worktree creation
└── write-plan.md         # /marsai:write-plan - Implementation planning

dev-team/commands/
├── dev-cancel.md           # /marsai:dev-cancel - Cancel dev cycle
├── dev-cycle.md            # /marsai:dev-cycle - 10-gate development cycle
├── dev-cycle-frontend.md   # /marsai:dev-cycle-frontend - 9-gate frontend cycle
├── dev-refactor.md         # /marsai:dev-refactor - Standards refactoring
├── dev-refactor-frontend.md # /marsai:dev-refactor-frontend - Frontend standards refactor
├── dev-report.md           # /marsai:dev-report - Development reporting
├── dev-service-discovery.md # /marsai:dev-service-discovery - Service hierarchy scan
├── dev-status.md           # /marsai:dev-status - Development status
└── migrate-v4.md           # /marsai:migrate-v4 - V4 migration

```

**Key Characteristics:**

- Simple `.md` files with YAML frontmatter
- Invoked via `/{command}` syntax
- Typically reference a corresponding skill
- Expand into full skill/agent invocation

### 4. Hooks (`hooks/`)

**Purpose:** Session lifecycle management and automatic initialization

**Structure:**

```
default/hooks/
├── hooks.json              # Hook configuration (SessionStart, UserPromptSubmit)
├── session-start.sh        # Main initialization script
├── generate-skills-ref.py  # Dynamic skill reference generator
└── claude-md-reminder.sh   # CLAUDE.md reminder on prompt submit
```

**Key Characteristics:**

- Triggers on SessionStart events (startup|resume, clear|compact)
- Triggers on UserPromptSubmit for reminders
- Injects skills context into Claude's memory
- Auto-generates skills quick reference from frontmatter
- Ensures mandatory workflows are loaded

### 5. Plugin Configuration (`.claude-plugin/`)

**Purpose:** Integration metadata for Claude Code marketplace

**Structure:**

```
.claude-plugin/
└── marketplace.json    # Multi-plugin registry
    ├── marsai-default     # Core skills library
    └── marsai-dev-team    # Developer agents
```

**marketplace.json Schema:**

```json
{
  "name": "marsai",
  "description": "...",
  "owner": { "name": "...", "email": "..." },
  "plugins": [
    {
      "name": "marsai-default",
      "version": "...",
      "source": "./default",
      "keywords": ["skills", "tdd", "debugging", ...]
    },
    {
      "name": "marsai-dev-team",
      "version": "...",
      "source": "./dev-team",
      "keywords": ["developer", "agents"]
    }
  ]
}
```

## Data & Control Flow

### Session Initialization Flow

```mermaid
sequenceDiagram
    participant User
    participant Claude Code
    participant hooks.json
    participant session-start.sh
    participant generate-skills-ref.py
    participant Claude Context

    User->>Claude Code: Start new session
    Claude Code->>hooks.json: Check SessionStart hooks
    hooks.json->>session-start.sh: Execute initialization
    session-start.sh->>generate-skills-ref.py: Generate skills overview
    generate-skills-ref.py-->>session-start.sh: Return formatted reference
    session-start.sh->>Claude Context: Inject skills + marsai:using-marsai content
    Claude Context-->>User: Session ready with skills loaded
```

### Skill Invocation Flow

```mermaid
sequenceDiagram
    participant User
    participant Claude
    participant Skill Tool
    participant SKILL.md
    participant TodoWrite

    User->>Claude: Request task
    Claude->>Claude: Check marsai:using-marsai mandatory workflow
    Claude->>Skill Tool: Invoke relevant skill
    Skill Tool->>SKILL.md: Load skill instructions
    SKILL.md-->>Claude: Return structured workflow
    Claude->>TodoWrite: Create task tracking (if multi-step)
    Claude->>User: Execute skill with progress updates
```

### Parallel Review Flow

```mermaid
sequenceDiagram
    participant User
    participant Claude
    participant Task Tool
    participant marsai:code-reviewer
    participant marsai:business-logic-reviewer
    participant marsai:security-reviewer
    participant marsai:test-reviewer
    participant marsai:nil-safety-reviewer
    participant marsai:consequences-reviewer
    participant DCR as marsai:dead-code-reviewer

    User->>Claude: /marsai:codereview
    Note over Claude: Command provides<br/>parallel review workflow

    Claude->>Task Tool: Dispatch 7 parallel tasks

    par Parallel Execution
        Task Tool->>marsai:code-reviewer: Review architecture
        and
        Task Tool->>marsai:business-logic-reviewer: Review correctness
        and
        Task Tool->>marsai:security-reviewer: Review vulnerabilities
        and
        Task Tool->>marsai:test-reviewer: Review test coverage
        and
        Task Tool->>marsai:nil-safety-reviewer: Review nil safety
        and
        Task Tool->>marsai:consequences-reviewer: Review ripple effects
        and
        Task Tool->>DCR: Review dead code
    end

    marsai:code-reviewer-->>Claude: Return findings
    marsai:business-logic-reviewer-->>Claude: Return findings
    marsai:security-reviewer-->>Claude: Return findings
    marsai:test-reviewer-->>Claude: Return findings
    marsai:nil-safety-reviewer-->>Claude: Return findings
    marsai:consequences-reviewer-->>Claude: Return findings
    DCR-->>Claude: Return findings

    Note over Claude: Aggregate & prioritize by severity
    Claude->>User: Consolidated report
```

## Integration with Claude Code

### Native Tool Integration

MarsAI leverages four primary Claude Code tools:

1. **Skill Tool**

   - Invokes skills by name: `skill: "marsai:test-driven-development"`
   - Skills expand into full instructions within conversation
   - Skill content becomes part of Claude's working context

2. **Task Tool**

   - Dispatches agents to subagent instances: `Task(subagent_type="marsai:code-reviewer")`
   - Enables parallel execution (multiple Tasks in one message)
   - Returns structured reports from independent analysis

3. **TodoWrite Tool**

   - Tracks multi-step workflows: `TodoWrite(todos=[...])`
   - Integrates with skills via shared patterns
   - Provides progress visibility to users

4. **SlashCommand Tool**
   - Executes commands: `SlashCommand(command="/marsai:brainstorm")`
   - Commands expand to skill/agent invocations
   - Provides user-friendly shortcuts

### Session Context Injection

At session start, MarsAI injects two critical pieces of context:

1. **Skills Quick Reference** - Auto-generated overview of all available skills
2. **marsai:using-marsai Skill** - Mandatory workflow that enforces skill checking

This context becomes part of Claude's memory for the entire session, ensumarsai:

- Claude knows which skills are available
- Mandatory workflows are enforced
- Skills are checked before any task

## Execution Patterns

### Pattern 1: Mandatory Skill Checking

```
User Request → marsai:using-marsai check → Relevant skill?
    ├─ Yes → Invoke skill → Follow workflow
    └─ No → Proceed with task
```

**Implementation:** The marsai:using-marsai skill is loaded at session start and contains strict instructions to check for relevant skills before ANY task.

### Pattern 2: Parallel Review Execution

```
Review Request → /marsai:codereview → marsai:review-slicer (classify)
    ├─ Small/focused PR → 7 Tasks in parallel (full diff)
    └─ Large/multi-theme PR → For EACH slice:
        ├─ marsai:code-reviewer           ─┐
        ├─ marsai:business-logic-reviewer  │
        ├─ marsai:security-reviewer        │
        ├─ marsai:test-reviewer            ┼─→ Merge + dedup → Handle by severity
        ├─ marsai:nil-safety-reviewer      │
        ├─ marsai:dead-code-reviewer       │
        └─ marsai:consequences-reviewer   ─┘
```

**Implementation:** The `marsai:review-slicer` agent classifies files into thematic slices for large PRs (15+ files). For each slice, all 7 reviewers dispatch in parallel via a single message with 7 Task tool calls. Results are merged and deduplicated before consolidation. Small PRs skip slicing entirely (zero overhead).

### Pattern 3: Skill-to-Command Mapping

```
User: /marsai:brainstorm
    ↓
SlashCommand Tool
    ↓
commands/brainstorm.md
    ↓
"Use and follow the marsai:brainstorming skill"
    ↓
Skill Tool: marsai:brainstorming
    ↓
skills/brainstorming/SKILL.md
```

**Implementation:** Commands are thin wrappers that immediately invoke corresponding skills.

### Pattern 4: Progressive Skill Execution

```
Complex Skill → TodoWrite tracking
    ├─ Phase 1: Understanding     [in_progress]
    ├─ Phase 2: Exploration       [pending]
    ├─ Phase 3: Design           [pending]
    └─ Phase 4: Documentation    [pending]
```

**Implementation:** Multi-phase skills use TodoWrite to track progress through structured workflows.

## Component Relationships

### Skills ↔ Agents

**Difference:**

- **Skills:** Instructions executed by current Claude instance
- **Agents:** Specialized reviewers executed by separate Claude instances

**Interaction:**

- Skills can invoke agents (e.g., marsai:requesting-code-review skill dispatches review agents)
- Agents don't typically invoke skills (they're independent analyzers)

### Skills ↔ Commands

**Relationship:** One-to-one or one-to-many mapping

- Most commands map directly to a single skill
- Some commands (like review) orchestrate multiple components

**Example Mappings:**

- `/marsai:brainstorm` → `marsai:brainstorming` skill
- `/marsai:write-plan` → `marsai:writing-plans` skill
- `/marsai:codereview` → dispatches 7 parallel review agents (`marsai:code-reviewer`, `marsai:business-logic-reviewer`, `marsai:security-reviewer`, `marsai:test-reviewer`, `marsai:nil-safety-reviewer`, `marsai:consequences-reviewer`, `marsai:dead-code-reviewer`)

### Skills ↔ Shared Patterns

**Relationship:** Inheritance/composition

- Skills reference shared patterns for common behaviors
- Patterns provide reusable workflows (state tracking, failure recovery)

**Example:**

```markdown
# In a skill:

See `skills/shared-patterns/todowrite-integration.md` for tracking setup
```

### Hooks ↔ Skills

**Relationship:** Initialization and context loading

- Hooks load skill metadata at session start
- generate-skills-ref.py scans all SKILL.md frontmatter
- session-start.sh injects marsai:using-marsai skill content

**Data Flow:**

```
SKILL.md frontmatter → generate-skills-ref.py → formatted overview → session context
```

### Agents ↔ Orchestrator

**Relationship:** Agent dispatch via Task tool

- Agents are invoked via `Task(subagent_type: "marsai:{agent-name}")`
- Review agents run in parallel for comprehensive analysis
- Agent specialization determines depth and quality of analysis

### TodoWrite ↔ Skills

**Relationship:** Progress tracking integration

- Multi-step skills create TodoWrite items
- Each phase updates todo status (pending → in_progress → completed)
- Provides user visibility into workflow progress

## Key Architectural Decisions

### 1. Parallel vs Sequential Reviews

**Decision:** Reviews run in parallel, not sequentially
**Rationale:** 3x faster feedback, comprehensive coverage, easier prioritization
**Implementation:** Single message with multiple Task calls

### 2. Session Context Injection

**Decision:** Load all skills metadata at session start
**Rationale:** Ensures Claude always knows available capabilities
**Trade-off:** Larger initial context vs. consistent skill awareness

### 3. Mandatory Workflows

**Decision:** Some skills (marsai:using-marsai) are non-negotiable
**Rationale:** Prevents common failures, enforces best practices
**Enforcement:** Loaded automatically, contains strict instructions

### 4. Skill vs Agent Separation

**Decision:** Skills for workflows, agents for analysis
**Rationale:** Different execution models (local vs. subagent)
**Benefit:** Clear separation of concerns

### 5. Frontmatter-Driven Discovery

**Decision:** All metadata in YAML frontmatter
**Rationale:** Single source of truth, easy parsing, consistent structure
**Usage:** Auto-generation of documentation, skill matching

## Extension Points

### Adding New Skills

1. Create `skills/{name}/SKILL.md` with frontmatter
2. Skills auto-discovered by generate-skills-ref.py
3. Available immediately after session restart

### Adding New Agents

1. Create `{plugin}/agents/{name}.md` with agent definition
2. Include YAML frontmatter: `name`, `description`, `version`
3. Invoke via Task tool with `subagent_type="marsai:{name}"`
4. Review agents can run in parallel via `/marsai:codereview`
5. Developer agents provide domain expertise via direct Task invocation

### Adding New Commands

1. Create `commands/{name}.md`
2. Reference skill or agent to invoke
3. Available via `/{name}`

### Adding Shared Patterns

1. Create `skills/shared-patterns/{pattern}.md`
2. Reference from skills that need the pattern
3. Maintains consistency across skills

### Adding New Plugins

1. Create plugin directory: `mkdir -p {plugin-name}/{skills,agents,commands,hooks,lib}`
2. Register in `.claude-plugin/marketplace.json`:
   ```json
   {
     "name": "ring-{plugin-name}",
     "version": "0.1.0",
     "source": "./{plugin-name}",
     "keywords": [...]
   }
   ```
   (Note: Initial version is 0.1.0, then managed via version bumps)
3. Create `{plugin-name}/hooks/hooks.json` for initialization
4. Add skills/agents following same structure as `default/`

## Performance Considerations

### Parallel Execution Benefits

- **3x faster reviews** - All reviewers run simultaneously
- **No blocking** - Independent agents don't wait for each other
- **Better resource utilization** - Multiple Claude instances work concurrently

### Context Management

- **Session start overhead** - One-time loading of skills context
- **Skill invocation** - Skills expand inline, no additional calls
- **Agent invocation** - Separate instances, clean context per agent

### Optimization Strategies

1. **Selective agent usage** - Only invoke relevant reviewers
2. **Skill caching** - Skills loaded once per session
3. **Parallel by default** - Never chain reviewers sequentially
4. **Early validation** - Preflight checks prevent wasted work

## Common Patterns and Anti-Patterns

### Patterns to Follow

✅ Check for relevant skills before any task
✅ Run reviewers in parallel for speed
✅ Use TodoWrite for multi-step workflows
✅ Reference shared patterns for consistency
✅ Specify models explicitly for agents

### Anti-Patterns to Avoid

❌ Skipping skill checks (violates marsai:using-marsai)
❌ Running reviewers sequentially (3x slower)
❌ Implementing without tests (violates TDD)
❌ Claiming completion without verification
❌ Hardcoding workflows instead of using skills

## Troubleshooting Guide

### Skills Not Loading

1. Check hooks/hooks.json configuration
2. Verify session-start.sh is executable
3. Ensure SKILL.md has valid frontmatter

### Parallel Reviews Not Working

1. Ensure all Task calls in single message
2. Verify agent names match exactly
3. Check agent names match exactly

### Commands Not Recognized

1. Verify command file exists in commands/
2. Check command name matches file name
3. Ensure proper frontmatter in command file

### Context Overflow

1. Consider selective skill loading
2. Use focused agent invocations
3. Clear completed todos regularly

## Summary

MarsAI's architecture is designed for:

- **Modularity** - Independent, composable components across multiple plugins
- **Performance** - Parallel execution wherever possible (3x faster reviews)
- **Reliability** - Mandatory workflows prevent failures
- **Extensibility** - Easy to add new skills/agents/commands/plugins
- **Scalability** - Marketplace structure supports product and team-specific plugins
- **Integration** - Seamless with Claude Code's native tools

### Current State

_Component counts reflect current state; plugin versions managed in `.claude-plugin/marketplace.json`_

| Component                 | Count      | Location               |
| ------------------------- | ---------- | ---------------------- |
| Active Plugins            | 2          | All plugin directories |
| Skills (marsai-default)     | 22         | `default/skills/`      |
| Skills (marsai-dev-team)    | 32         | `dev-team/skills/`     |
| **Total Skills**          | **54**     | **All plugins**        |
| Agents (marsai-default)     | 10         | `default/agents/`      |
| Agents (marsai-dev-team)    | 12         | `dev-team/agents/`     |
| **Total Agents**          | **22**     | **All plugins**        |
| Commands (marsai-default)   | 14         | `default/commands/`    |
| Commands (marsai-dev-team)  | 9          | `dev-team/commands/`   |
| **Total Commands**        | **23**     | **All plugins**        |
| Hooks                     | Per plugin | `{plugin}/hooks/`      |

The system achieves these goals through clear component separation, structured workflows, automatic context management, and a modular marketplace architecture, creating a robust foundation for AI-assisted software development.
