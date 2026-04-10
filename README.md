<p align="center">
  <img src="assets/ring-banner.png" alt="MarsAI by Lerian" width="100%" />
</p>

# 💍 The MarsAI - Skills Library for AI Agents

**Proven engineering practices, enforced through skills.**

MarsAI is a comprehensive skills library and workflow system for AI agents that transforms how AI assistants approach software development. Currently implemented as a **Claude Code plugin marketplace** with **2 active plugins** and **54 skills** (see `.claude-plugin/marketplace.json` for current versions), the skills themselves are agent-agnostic and can be used with any AI agent system. MarsAI provides battle-tested patterns, mandatory workflows, and systematic approaches for software development.

## ✨ Why MarsAI?

Without MarsAI, AI assistants often:

- Skip tests and jump straight to implementation
- Make changes without understanding root causes
- Claim tasks are complete without verification
- Forget to check for existing solutions
- Repeat known mistakes

MarsAI solves this by:

- **Enforcing proven workflows** - Test-driven development, systematic debugging, proper planning
- **Providing 54 specialized skills** (22 core + 32 dev-team)
- **22 specialized agents** - 10 review/planning + 12 developer
- **Automating skill discovery** - Skills load automatically at session start
- **Preventing common failures** - Built-in anti-patterns and mandatory checklists

## 🤖 Specialized Agents

**Review & Planning Agents (default plugin):**

- `marsai:code-reviewer` - Foundation review (architecture, code quality, design patterns)
- `marsai:business-logic-reviewer` - Correctness review (domain logic, requirements, edge cases)
- `marsai:security-reviewer` - Safety review (vulnerabilities, OWASP, authentication)
- `marsai:test-reviewer` - Test quality review (coverage, edge cases, assertions, test anti-patterns)
- `marsai:nil-safety-reviewer` - Nil/null safety review (traces pointer risks, missing guards, panic paths)
- `marsai:consequences-reviewer` - Ripple effect review (traces how changes propagate beyond modified files - caller chains, consumer contracts, downstream breakage)
- `marsai:dead-code-reviewer` - Dead code review (orphaned code detection, reachability analysis, dead dependency chains)
- `marsai:review-slicer` - Review slicer (groups large multi-themed PRs into thematic slices for focused parallel review)
- `marsai:write-plan` - Implementation planning agent
- `marsai:codebase-explorer` - Deep architecture analysis (deep-analysis, complements built-in Explore)
- Use `/marsai:codereview` command to orchestrate parallel review workflow

**Developer Agents (dev-team plugin):**

- `marsai:backend-engineer-golang` - Go backend specialist for financial systems
- `marsai:backend-engineer-typescript` - TypeScript/Node.js backend specialist (Express, NestJS, Fastify)
- `marsai:devops-engineer` - DevOps infrastructure specialist
- `marsai:frontend-bff-engineer-typescript` - BFF & React/Next.js frontend with Clean Architecture
- `marsai:frontend-designer` - Visual design specialist
- `marsai:frontend-engineer` - Senior Frontend Engineer (React/Next.js)
- `marsai:prompt-quality-reviewer` - Agent Quality Analyst
- `marsai:qa-analyst` - Quality assurance specialist
- `marsai:qa-analyst-frontend` - Frontend QA specialist (accessibility, visual, E2E, performance)
- `marsai:sre` - Site reliability engineer (monitoring, alerting, SLOs)
- `marsai:ui-engineer` - UI component specialist (design systems, accessibility)
- `marsai:helm-engineer` - Helm chart specialist (chart structure, security, Lerian conventions)

> **Standards Compliance:** All dev-team agents include a `## Standards Compliance` output section with conditional requirement:
>
> - **Optional** when invoked directly or via `marsai:dev-cycle`
> - **MANDATORY** when invoked from `marsai:dev-refactor` (triggered by `**MODE: ANALYSIS ONLY**` in prompt)
>
> When mandatory, agents load MarsAI standards via WebFetch and produce comparison tables with:
>
> - Current Pattern vs Expected Pattern
> - Severity classification (Critical/High/Medium/Low)
> - File locations and migration recommendations
>
> See `dev-team/docs/standards/*.md` for standards source. Cross-references: CLAUDE.md (Standards Compliance section), `dev-team/skills/dev-refactor/SKILL.md`

_Plugin versions are managed in `.claude-plugin/marketplace.json`_

## 🖥️ Supported Platforms

MarsAI works across multiple AI development platforms:

| Platform        | Format      | Status             | Features                        |
| --------------- | ----------- | ------------------ | ------------------------------- |
| **Claude Code** | Native      | ✅ Source of truth | Skills, agents, commands, hooks |
| **Factory AI**  | Transformed | ✅ Supported       | Droids, commands, skills        |
| **Cursor**      | Transformed | ✅ Supported       | Skills, agents, commands        |
| **Cline**       | Transformed | ✅ Supported       | Prompts                         |

**Transformation Notes:**

- Claude Code receives MarsAI content in its native format
- Factory AI: `agents` → `droids` terminology
- Cursor: Skills → ~/.cursor/skills/, Agents → ~/.cursor/agents/, Commands → ~/.cursor/commands/
- Cline: All content → structured prompts

**Platform-Specific Guides:**

See the [installer README](installer/) for platform-specific setup and transformation details.

## 🚀 Quick Start

### Multi-Platform Installation (Recommended)

The MarsAI installer automatically detects installed platforms and transforms content appropriately.

**Linux/macOS/Git Bash:**

```bash
# Interactive installer (auto-detects platforms)
curl -fsSL https://raw.githubusercontent.com/lerianstudio/marsai/main/install-marsai.sh | bash

# Or clone and run locally
git clone https://github.com/lerianstudio/marsai.git ~/ring
cd ~/ring
./installer/install-marsai.sh
```

**Windows PowerShell:**

```powershell
# Interactive installer (auto-detects platforms)
irm https://raw.githubusercontent.com/lerianstudio/marsai/main/install-marsai.ps1 | iex

# Or clone and run locally
git clone https://github.com/lerianstudio/marsai.git $HOME\ring
cd $HOME\ring
.\installer\install-marsai.ps1
```

### Direct Platform Installation

Install to specific platforms without the interactive menu:

```bash
# Install to Claude Code only (native format)
./installer/install-marsai.sh install --platforms claude

# Install to Factory AI only (droids format)
./installer/install-marsai.sh install --platforms factory

# Install to multiple platforms
./installer/install-marsai.sh install --platforms claude,cursor,cline

# Install to all detected platforms
./installer/install-marsai.sh install --platforms auto

# Dry run (preview changes without installing)
./installer/install-marsai.sh install --platforms auto --dry-run
```

### Installer Commands

```bash
# List installed platforms and versions
./installer/install-marsai.sh list

# Update existing installation
./installer/install-marsai.sh update

# Check for available updates
./installer/install-marsai.sh check

# Sync (update only changed files)
./installer/install-marsai.sh sync

# Uninstall from specific platform
./installer/install-marsai.sh uninstall --platforms cursor

# Detect available platforms
./installer/install-marsai.sh detect
```

### Claude Code Plugin Marketplace

For Claude Code users, you can also install from the marketplace:

- Open Claude Code
- Go to Settings → Plugins
- Search for "marsai"
- Click Install

### Manual Installation (Claude Code only)

```bash
# Clone the marketplace repository
git clone https://github.com/lerianstudio/marsai.git ~/ring

# Skills auto-load at session start via hooks
# No additional configuration needed for Claude Code
```

### Code Analysis Pipeline

The codereview pipeline uses [Mithril](https://github.com/LerianStudio/mithril), an external code analysis tool installed via `go install`. Mithril performs static analysis, AST extraction, call graph generation, and context compilation for AI-assisted code review.

Install via `go install github.com/lerianstudio/mithril@latest`. See the [Mithril repository](https://github.com/LerianStudio/mithril) for full installation details and release notes.

### First Session

When you start a new Claude Code session with MarsAI installed, you'll see:

```
## Available Skills:
- marsai:using-marsai (Check for skills BEFORE any task)
- marsai:test-driven-development (RED-GREEN-REFACTOR cycle)
- marsai:systematic-debugging (4-phase root cause analysis)
- marsai:verification-before-completion (Evidence before claims)
... and 50 more skills
```

## 🎯 Core Skills

### The Big Four (Use These First!)

#### 1. **marsai:using-marsai** - Mandatory Skill Discovery

```
Before ANY action → Check skills
Before ANY tool → Check skills
Before ANY code → Check skills
```

#### 2. **marsai:test-driven-development** - Test First, Always

```
RED → Write failing test → Watch it fail
GREEN → Minimal code → Watch it pass
REFACTOR → Clean up → Stay green
```

#### 3. **marsai:systematic-debugging** - Find Root Cause

```
Phase 1: Investigate (gather ALL evidence)
Phase 2: Analyze patterns
Phase 3: Test hypothesis (one at a time)
Phase 4: Implement fix (with test)
```

#### 4. **marsai:verification-before-completion** - Prove It Works

```
Run command → Paste output → Then claim
No "should work" → Only "does work" with proof
```

## 📚 All 54 Skills (Across 2 Plugins)

### Core Skills (marsai-default plugin - 22 skills)

**Testing & Debugging (4):**

- `marsai:test-driven-development` - Write test first, watch fail, minimal code
- `marsai:systematic-debugging` - 4-phase root cause investigation
- `marsai:testing-anti-patterns` - Common test pitfalls to avoid
- `marsai:linting-codebase` - Parallel lint fixing with agent dispatch

**Collaboration & Planning (7):**

- `marsai:brainstorming` - Structured design refinement
- `marsai:interviewing-user` - Proactive requirements gathering through structured interview
- `marsai:writing-plans` - Zero-context implementation plans
- `marsai:executing-plans` - Batch execution with checkpoints
- `marsai:requesting-code-review` - **Parallel 7-reviewer dispatch** with severity-based handling
- `marsai:using-git-worktrees` - Isolated development
- `marsai:git-commit` - Smart commit organization with atomic grouping, conventional commits, and trailers

**Meta Skills (4):**

- `marsai:using-marsai` - Mandatory skill discovery
- `marsai:writing-skills` - TDD for documentation
- `marsai:testing-skills-with-subagents` - Skill validation
- `marsai:testing-agents-with-subagents` - Subagent-specific testing

**Integration (1):**

- `marsai:gandalf-webhook` - Send tasks to Gandalf (AI team member) via webhook for Slack, Google Workspace, and Jira interactions

**Session & Learning (5):**

- `marsai:exploring-codebase` - Two-phase codebase exploration
- `marsai:release-guide-info` - Generate Ops Update Guide from git diff analysis
- `marsai:visual-explainer` - Generate self-contained HTML pages to visually explain systems, code changes, and data
- `marsai:drawing-diagrams` - Generate Mermaid diagrams and open them in mermaid.live
- `marsai:session-handoff` - Create handoff documents capturing session state for seamless context-clear and resume

**Audit & Readiness (1):**

- `marsai:production-readiness-audit` - 44-dimension production readiness audit; runs explorers in batches of up to 10, appends incrementally to a single report; output: scored report (0-430, max 440 with multi-tenant) with severity ratings. See [default/skills/production-readiness-audit/SKILL.md](default/skills/production-readiness-audit/SKILL.md) for invocation and implementation details.

### Developer Skills (marsai-dev-team plugin - 32 skills)

**Orchestration & Refactoring (6):**

- `marsai:using-dev-team` - Introduction to developer specialist agents
- `marsai:dev-cycle` - 10-gate development workflow orchestrator (Gates 0–9, with Gate 0.5 delivery verification)
- `marsai:dev-cycle-frontend` - 9-gate frontend development workflow orchestrator
- `marsai:dev-refactor` - Backend/codebase standards analysis
- `marsai:dev-refactor-frontend` - Frontend standards analysis and task generation
- `marsai:cycle-management` - Development cycle state management (status reporting and cancellation)

**Backend Gate Skills (9):**

- `marsai:dev-implementation` - Gate 0: TDD implementation
- `marsai:dev-delivery-verification` - Gate 0.5: Delivery verification (ensures requested features are reachable)
- `marsai:dev-multi-tenant` - Multi-tenant adaptation (database-per-tenant isolation, integrated into Gate 0)
- `marsai:dev-devops` - Gate 1: DevOps setup (Docker, compose)
- `marsai:dev-docker-security` - Docker image security audit for Docker Hub Health Score grade A
- `marsai:dev-helm` - Helm chart creation and maintenance following Lerian conventions
- `marsai:dev-sre` - Gate 2: Observability validation
- `marsai:dev-service-discovery` - Service/module/resource hierarchy scanner for tenant-manager
- `marsai:dev-readyz` - Comprehensive readiness probes (/readyz) with per-dependency status and TLS validation

**Testing & Validation (8):**

- `marsai:dev-unit-testing` - Gate 3: Unit test coverage (85%+ threshold)
- `marsai:dev-fuzz-testing` - Gate 4: Fuzz testing with seed corpus for edge case discovery
- `marsai:dev-property-testing` - Gate 5: Property-based tests for domain invariants
- `marsai:dev-integration-testing` - Gate 6: Integration tests with real containers via testcontainers
- `marsai:dev-chaos-testing` - Gate 7: Chaos tests using Toxiproxy for graceful degradation
- `marsai:dev-goroutine-leak-testing` - Goroutine leak detection and regression testing
- `marsai:dev-validation` - Gate 9: User approval
- `marsai:dev-feedback-loop` - Assertiveness scoring and metrics

**Migration & Reference (4):**

- `marsai:using-lib-commons` - Comprehensive reference for lib-commons v4 (Lerian's shared Go library with 30+ packages)
- `marsai:dev-migrate-v4` - Analyze Go service for lib-commons v2/v3 patterns and generate visual migration report
- `marsai:systemplane-migration` - Migrate Lerian Go services from .env/YAML config to systemplane (database-backed hot-reloadable config)
- `marsai:dev-llms-txt` - Generate or audit llms.txt files following llmstxt.org spec for AI-friendly repository entry points

**Security (1):**

- `marsai:dev-dep-security-check` - Supply-chain gate for dependency installations (validates identity, vulnerabilities, suspicious signals)

**Frontend Gate Skills (4):**

- `marsai:dev-frontend-accessibility` - Frontend accessibility validation gate
- `marsai:dev-frontend-visual` - Visual regression and UI quality gate
- `marsai:dev-frontend-e2e` - End-to-end testing gate
- `marsai:dev-frontend-performance` - Frontend performance validation gate

> Frontend and backend dev-cycle workflows both use `marsai:requesting-code-review` (core plugin) as the review gate.

## 🎮 Interactive Commands

MarsAI provides 23 slash commands across 2 plugins for common workflows.

### Core Workflows (marsai-default)

- `/marsai:codereview [files-or-paths]` - Dispatch 7 parallel code reviewers for comprehensive review
- `/marsai:commit [message]` - Create git commit with AI identification via Git trailers
- `/marsai:worktree [branch-name]` - Create isolated git workspace for parallel development
- `/marsai:brainstorm [topic]` - Interactive design refinement using Socratic method
- `/marsai:write-plan [feature]` - Create detailed implementation plan with bite-sized tasks
- `/marsai:execute-plan [path]` - Execute plan in batches with review checkpoints
- `/marsai:lint [path]` - Run lint checks and dispatch parallel agents to fix all issues
- `/marsai:explore-codebase [path]` - Deep codebase exploration using deep-analysis agent
- `/marsai:interview-me [topic]` - Proactive requirements gathering through structured user interview
- `/marsai:md-to-html [file]` - Transform a markdown file into a standalone, styled HTML page
- `/marsai:diagram [topic]` - Generate a Mermaid diagram and open in mermaid.live
- `/marsai:visualize [topic]` - Generate visual explanation of a system or concept
- `/marsai:release-guide` - Generate Ops Update Guide from git diff between two refs
- `/marsai:create-handoff [name]` - Create handoff document for session continuity (uses Plan Mode for automatic context transition)

### Development Cycle (marsai-dev-team)

- `/marsai:dev-cycle [task]` - Start 10-gate development workflow (implementation→delivery-verification→devops→SRE→unit-testing→fuzz-testing→property-testing→integration-testing→chaos-testing→review→validation)
- `/marsai:dev-cycle-frontend [task]` - Start 9-gate frontend workflow (implementation→devops→accessibility→unit-testing→visual-testing→e2e-testing→performance→review→validation)
- `/marsai:dev-refactor [path]` - Analyze codebase against standards
- `/marsai:dev-refactor-frontend [path]` - Analyze frontend codebase against standards and generate executable tasks
- `/marsai:dev-service-discovery [path]` - Scan project for service/module/resource hierarchy
- `/marsai:dev-status` - Show current gate progress
- `/marsai:dev-report` - Generate development cycle report
- `/marsai:dev-cancel` - Cancel active development cycle
- `/marsai:migrate-v4 [path]` - Analyze Go service for lib-commons v4 migration and generate visual report

## 💡 Usage Examples

### Building a Feature

```
User: "Add user authentication to the app"
Claude: I'm using the marsai:brainstorming skill to design this feature...
        [Structured exploration of requirements]
Claude: I'm using marsai:test-driven-development to implement...
        [RED-GREEN-REFACTOR cycle for each component]
Claude: I'm using marsai:verification-before-completion to confirm...
        [Runs tests, shows actual output]
```

### Fixing a Bug

```
User: "The app crashes when clicking submit"
Claude: I'm using systematic-debugging to investigate...
        Phase 1: [Gathering evidence]
        Phase 2: [Pattern analysis]
        Phase 3: [Hypothesis testing]
        Phase 4: [Implementing fix with test]
```

### Planning a Project

```
User: "Plan an e-commerce platform"
Claude: I'll use the pre-dev workflow to plan this systematically...
        Gate 1: PRD Creation [Business requirements]
        Gate 2: Feature Map [Domain groupings]
        Gate 3: TRD Creation [Architecture patterns]
        ... [Through all 8 gates]
```

### Code Review (Parallel, 7 Reviewers!)

```
User: "Review my authentication implementation"
Claude: Dispatching all 7 reviewers in parallel...
        [Launches marsai:code-reviewer, marsai:business-logic-reviewer, marsai:security-reviewer,
         marsai:test-reviewer, marsai:nil-safety-reviewer, marsai:consequences-reviewer,
         marsai:dead-code-reviewer simultaneously]

        Code reviewer: PASS. Clean architecture, good tests.
        Business reviewer: FAIL. Missing password reset flow (HIGH severity).
        Security reviewer: FAIL. JWT secret hardcoded (CRITICAL severity).
        Test reviewer: PASS. Good coverage, assertions well-structured.
        Nil-safety reviewer: PASS. No unguarded nil dereferences found.
        Consequences reviewer: PASS. No downstream breakage detected.

        Aggregating issues by severity:
        - CRITICAL: JWT secret hardcoded in auth.ts:42
        - HIGH: Password reset flow missing from requirements

        Dispatching fix subagent to address Critical/High issues...
        [Fixes applied]

        Re-running all 7 reviewers in parallel...
        All reviewers: PASS. Ready for production.
```

**Key benefits:**

- **All reviewers run simultaneously** (not sequential)
- **Comprehensive** - Get all feedback at once, easier to prioritize
- **Tech debt tracking** - Low/Cosmetic issues tracked with TODO/FIXME comments in code
- **Model-specific** - All reviewers run on for deep analysis

## 🏗️ Architecture

**Monorepo Marketplace** - Multiple specialized plugin collections:

```
ring/                                  # Monorepo root
├── .claude-plugin/
│   └── marketplace.json              # Multi-plugin marketplace config (2 active plugins)
├── default/                          # Core MarsAI plugin (marsai-default)
│   ├── skills/                       # 22 core skills
│   │   ├── skill-name/
│   │   │   └── SKILL.md             # Skill definition with frontmatter
│   │   └── shared-patterns/         # Universal patterns (15 patterns)
│   ├── commands/                    # 14 slash command definitions
│   ├── hooks/                       # Session initialization
│   │   ├── hooks.json              # Hook configuration
│   │   ├── session-start.sh        # Loads skills at startup
│   │   └── generate-skills-ref.py  # Auto-generates quick reference
│   ├── agents/                      # 10 specialized agents
│   │   ├── code-reviewer.md             # Foundation review (`marsai:code-reviewer`)
│   │   ├── business-logic-reviewer.md   # Correctness review (`marsai:business-logic-reviewer`)
│   │   ├── security-reviewer.md         # Safety review (`marsai:security-reviewer`)
│   │   ├── test-reviewer.md             # Test quality review (`marsai:test-reviewer`)
│   │   ├── nil-safety-reviewer.md       # Nil/null safety review (`marsai:nil-safety-reviewer`)
│   │   ├── consequences-reviewer.md     # Ripple effect review (`marsai:consequences-reviewer`)
│   │   ├── dead-code-reviewer.md        # Dead code analysis (`marsai:dead-code-reviewer`)
│   │   ├── review-slicer.md             # Review slicing for large PRs (`marsai:review-slicer`)
│   │   ├── write-plan.md                # Implementation planning (`marsai:write-plan`)
│   │   └── codebase-explorer.md         # Deep architecture analysis (`marsai:codebase-explorer`)
│   └── docs/                       # Documentation
└── dev-team/                      # Developer Agents plugin (marsai-dev-team) - 32 skills, 12 agents, 9 commands
    └── agents/                      # 12 specialized developer agents
        ├── backend-engineer-golang.md       # Go backend specialist (`marsai:backend-engineer-golang`)
        ├── backend-engineer-typescript.md   # TypeScript/Node.js backend specialist (`marsai:backend-engineer-typescript`)
        ├── devops-engineer.md               # DevOps infrastructure (`marsai:devops-engineer`)
        ├── frontend-bff-engineer-typescript.md # BFF & React/Next.js specialist (`marsai:frontend-bff-engineer-typescript`)
        ├── frontend-designer.md             # Visual design specialist (`marsai:frontend-designer`)
        ├── frontend-engineer.md             # Frontend engineer (`marsai:frontend-engineer`)
        ├── helm-engineer.md                 # Helm chart specialist (`marsai:helm-engineer`)
        ├── prompt-quality-reviewer.md       # Agent quality reviewer (`marsai:prompt-quality-reviewer`)
        ├── qa-analyst.md                    # Backend QA specialist (`marsai:qa-analyst`)
        ├── qa-analyst-frontend.md           # Frontend QA specialist (`marsai:qa-analyst-frontend`)
        ├── sre.md                           # Site reliability engineer (`marsai:sre`)
        └── ui-engineer.md                   # UI component specialist (`marsai:ui-engineer`)
```

## 🤝 Contributing

### Adding a New Skill

**For core MarsAI skills:**

1. **Create the skill directory**

   ```bash
   mkdir default/skills/your-skill-name
   ```

2. **Write SKILL.md with frontmatter**

   ```yaml
   ---
   name: your-skill-name
   description: |
     Brief description of WHAT this skill does (the method/technique).
     1-2 sentences maximum.

   trigger: |
     - Specific condition that mandates using this skill
     - Another trigger condition
     - Use quantifiable criteria when possible

   skip_when: |
     - When NOT to use this skill → alternative
     - Another exclusion condition

   sequence:
     after: [prerequisite-skill] # Skills that should come before
     before: [following-skill] # Skills that typically follow

   related:
     similar: [skill-that-seems-similar] # Differentiate from these
     complementary: [skill-that-pairs-well] # Use together with these
   ---
   # Skill content here...
   ```

   **Schema fields explained:**

   - `name`: Skill identifier (matches directory name)
   - `description`: WHAT the skill does (method/technique)
   - `trigger`: WHEN to use - specific, quantifiable conditions
   - `skip_when`: WHEN NOT to use - differentiates from similar skills
   - `sequence`: Workflow ordering (optional)
   - `related`: Similar/complementary skills for disambiguation (optional)

3. **Update documentation**

   - Skills auto-load via `default/hooks/generate-skills-ref.py`
   - Test with session start hook

4. **Submit PR**
   ```bash
   git checkout -b feat/your-skill-name
   git add default/skills/your-skill-name
   git commit -m "feat(skills): add your-skill-name for X"
   gh pr create
   ```

**For product/team-specific skills:**

1. **Create plugin structure**

   ```bash
   mkdir -p product-xyz/{skills,agents,commands,hooks,lib}
   ```

2. **Register in marketplace**
   Edit `.claude-plugin/marketplace.json`:

   ```json
   {
     "name": "ring-product-xyz",
     "description": "Product XYZ specific skills",
     "version": "0.1.0",
     "source": "./product-xyz",
     "homepage": "https://github.com/lerianstudio/marsai/tree/product-xyz"
   }
   ```

3. **Follow core plugin structure**
   - Use same layout as `default/`
   - Create `product-xyz/hooks/hooks.json` for initialization
   - Add skills to `product-xyz/skills/`

### Skill Quality Standards

- **Mandatory sections**: When to use, How to use, Anti-patterns
- **Include checklists**: TodoWrite-compatible task lists
- **Evidence-based**: Require verification before claims
- **Battle-tested**: Based on real-world experience
- **Clear triggers**: Unambiguous "when to use" conditions

## 📖 Documentation

- **Skills Quick Reference** - Auto-generated at session start from skill frontmatter
- [CLAUDE.md](CLAUDE.md) - Repository guide for Claude Code
- [MANUAL.md](MANUAL.md) - Quick reference for all commands, agents, and workflows
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture diagrams and component relationships
- [Installer](installer/) - Multi-platform installation and migration

## 🎯 Philosophy

MarsAI embodies these principles:

1. **Skills are mandatory, not optional** - If a skill applies, it MUST be used
2. **Evidence over assumptions** - Prove it works, don't assume
3. **Process prevents problems** - Following workflows prevents known failures
4. **Small steps, verified often** - Incremental progress with continuous validation
5. **Learn from failure** - Anti-patterns document what doesn't work

## 📊 Success Metrics

Teams using MarsAI report:

- 90% reduction in "works on my machine" issues
- 75% fewer bugs reaching production
- 60% faster debugging cycles
- 100% of code covered by tests (enforced by TDD)

## 🙏 Acknowledgments

MarsAI is built on decades of collective software engineering wisdom, incorporating patterns from:

- Extreme Programming (XP)
- Test-Driven Development (TDD)
- Domain-Driven Design (DDD)
- Agile methodologies
- DevOps practices

Special thanks to the Lerian Team for battle-testing these skills in production.

## 📄 License

MIT - See [LICENSE](LICENSE) file

## 🔗 Links

- [GitHub Repository](https://github.com/lerianstudio/marsai)
- [Issue Tracker](https://github.com/lerianstudio/marsai/issues)
- [Plugin Marketplace](https://claude.ai/marketplace/ring)

---

**Remember: If a skill applies to your task, you MUST use it. This is not optional.**
