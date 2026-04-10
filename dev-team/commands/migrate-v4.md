---
name: marsai:migrate-v4
description: Analyze Go service for lib-commons v2/v3 patterns and generate visual migration report + tasks for marsai:dev-cycle
argument-hint: "[path] [--tasks] [--execute]"
---

Analyze a Go service for lib-commons v2/v3 usage and generate a visual migration report with tasks for marsai:dev-cycle.

## ⛔ PRE-EXECUTION CHECK (EXECUTE FIRST)

**Before loading the skill, you MUST check:**

```
Does go.mod exist and contain lib-commons?
├── go.mod exists AND contains "lib-commons/v2" or "lib-commons/v3" → Load skill: marsai:dev-migrate-v4
├── go.mod exists AND contains "lib-commons/v4" → Report: "Already on v4. Run /marsai:dev-refactor for compliance check."
├── go.mod exists but NO lib-commons → Report: "No lib-commons dependency. Nothing to migrate."
└── No go.mod → Report: "Not a Go project. This skill only applies to Go services."
```

## Usage

```
/marsai:migrate-v4                     # Analyze current directory, visual report only
/marsai:migrate-v4 --tasks             # Also generate tasks.md for marsai:dev-cycle
/marsai:migrate-v4 --execute           # Generate tasks AND hand off to marsai:dev-cycle
/marsai:migrate-v4 /path/to/service    # Analyze specific path
```

## Flags

| Flag | Description |
|------|-------------|
| `--tasks` | Generate `migration-v4-tasks.md` compatible with `marsai:dev-cycle` |
| `--execute` | Generate tasks AND automatically dispatch `marsai:dev-cycle` to execute migration |
| `--dry-run` | Show analysis only, no file generation |

## Process

1. Scans `go.mod` for current lib-commons version
2. Finds ALL v2/v3 patterns across the codebase (imports, logging, config, bootstrap, telemetry, etc.)
3. Maps each finding to the v4 equivalent from MarsAI standards
4. Generates interactive HTML migration report (opened in browser)
5. Optionally generates `tasks.md` in `marsai:dev-cycle` format
6. Optionally dispatches `marsai:dev-cycle` to execute all migration tasks through gates

## Output

- **Visual report**: `~/.agent/diagrams/{service-name}-v4-migration.html`
- **Tasks file**: `docs/pre-dev/{service-name}/migration-v4-tasks.md` (with `--tasks` or `--execute`)
- **Dev cycle**: Automatic handoff to `marsai:dev-cycle` (with `--execute`)

## Related Commands

| Command | When to Use |
|---------|-------------|
| `/marsai:dev-refactor` | General standards compliance (not migration-specific) |
| `/marsai:dev-cycle` | Execute migration tasks after this skill generates them |
| `/marsai:migrate-v4 --execute` | Shortcut: generate + execute in one command |

## Prerequisites

- Go project with `go.mod`
- `lib-commons/v2` or `lib-commons/v3` as dependency
- `docs/PROJECT_RULES.md` recommended (not blocking)

## MANDATORY: Load Full Skill

```
Use Skill tool: marsai:dev-migrate-v4
```
