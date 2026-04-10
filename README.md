# MarsAI

A Claude Code plugin that enforces proven engineering practices through automated workflows, specialized agents, and mandatory gates.

## Install

```bash
git clone https://github.com/V4-Company/marsai.git ~/marsai
cd ~/marsai
./install-symlinks.sh
```

Restart Claude Code. Skills load automatically.

## How to use

### Build a feature

```
/write-plan          # plan it
/execute-plan        # build it step by step
```

### Build with the full pipeline (tests, devops, review — all automated)

```
/dev-cycle tasks.md              # backend: 8 gates
/dev-cycle-frontend tasks.md     # frontend: 9 gates
```

You can also skip the tasks file and just describe what you want:

```
/dev-cycle "Add JWT authentication with refresh tokens"
```

### Other common commands

| Command | What it does |
|---------|---|
| `/codereview` | Run 7 parallel code reviewers on your changes |
| `/commit` | Smart commit with conventional format |
| `/dev-refactor` | Analyze codebase against standards and fix |
| `/brainstorm` | Refine a rough idea into a design |
| `/explore-codebase` | Deep dive into unfamiliar code |
| `/worktree` | Isolate work in a git worktree |

## Dev Cycle Gates

When you run `/dev-cycle`, it walks through these gates automatically:

| Gate | What happens |
|------|---|
| 0 | **Implementation** — writes code using TDD (test first, then code) |
| 0.5 | **Delivery verification** — checks what was requested was actually built |
| 1 | **DevOps** — Dockerfile, docker-compose, env vars |
| 2 | **SRE** — validates logging, tracing, health checks |
| 3 | **Unit testing** — ensures 85%+ coverage |
| 4 | **Integration testing** — tests with real containers |
| 5 | **Chaos testing** — breaks things on purpose to verify graceful degradation |
| 6 | **Code review** — 7 reviewers in parallel |
| 7 | **Validation** — final check, asks for your approval |

Each gate dispatches a specialist agent. If a gate finds problems, it fixes them before moving on.

The frontend cycle (`/dev-cycle-frontend`) replaces gates 4-5 with accessibility, visual testing, E2E, and performance gates.

## Agents

You don't call these directly — the dev-cycle dispatches them. But you can if needed.

**Reviewers** (dispatched by `/codereview`):

| Agent | Focus |
|-------|---|
| `marsai:code-reviewer` | Architecture, patterns, quality |
| `marsai:business-logic-reviewer` | Domain correctness, edge cases |
| `marsai:security-reviewer` | Vulnerabilities, OWASP |
| `marsai:test-reviewer` | Test coverage, assertions |
| `marsai:nil-safety-reviewer` | Null pointer risks |
| `marsai:consequences-reviewer` | Ripple effects beyond changed files |
| `marsai:dead-code-reviewer` | Orphaned code detection |

**Developers** (dispatched by `/dev-cycle`):

| Agent | Focus |
|-------|---|
| `marsai:backend-engineer-typescript` | TypeScript backend |
| `marsai:frontend-engineer` | React/Next.js |
| `marsai:frontend-bff-engineer-typescript` | BFF layer |
| `marsai:devops-engineer` | Docker, infra |
| `marsai:sre` | Observability |
| `marsai:qa-analyst` | Backend testing |
| `marsai:qa-analyst-frontend` | Frontend testing (a11y, visual, E2E, perf) |
| `marsai:helm-engineer` | Helm charts |
| `marsai:frontend-designer` | UI/UX design specs |
| `marsai:ui-engineer` | Design system components |

## Project structure

```
marsai/
├── default/              # Core plugin (22 skills, 10 agents, 14 commands)
│   ├── skills/           # Skill definitions (markdown + frontmatter)
│   ├── agents/           # Reviewer and planning agents
│   ├── commands/         # Slash command definitions
│   └── hooks/            # Session startup hooks
├── dev-team/             # Developer plugin (26 skills, 11 agents, 8 commands)
│   ├── skills/           # Dev cycle gate skills
│   ├── agents/           # Specialist developer agents
│   ├── commands/         # Dev workflow commands
│   └── docs/standards/   # TypeScript, DevOps, SRE, Helm, Frontend standards
├── CLAUDE.md             # Project rules for Claude Code
├── install-symlinks.sh   # Links plugins into ~/.claude/
└── install-marsai.sh     # One-liner installer
```

## License

MIT
