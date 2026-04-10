# MarsAI Workflows Reference

This document contains detailed workflow instructions for adding skills, agents, hooks, and other MarsAI components.

---

## Adding a New Skill

### For Core MarsAI Skills

1. Create directory:

   ```bash
   mkdir default/skills/your-skill-name/
   ```

2. Write `default/skills/your-skill-name/SKILL.md` with frontmatter:

   ```yaml
   ---
   name: your-skill-name
   description: |
     Brief description of WHAT the skill does (method/technique).

   trigger: |
     - Specific condition that mandates this skill
     - Another trigger condition

   skip_when: |
     - When NOT to use → alternative skill
     - Another exclusion

   sequence:
     after: [prerequisite-skill] # Optional: ordering
     before: [following-skill]

   related:
     similar: [differentiate-from] # Optional: disambiguation
     complementary: [pairs-well-with]
   ---
   ```

3. Test with:

   ```
   Skill tool: "marsai:testing-skills-with-subagents"
   ```

4. Skill auto-loads next SessionStart via `default/hooks/generate-skills-ref.py`

### Production Readiness Audit (marsai-default)

The **production-readiness-audit** skill (`marsai:production-readiness-audit`) evaluates codebase production readiness across **27 dimensions** in 5 categories. **Invocation:** use the Skill tool or the `/marsai:production-readiness-audit` command when preparing for production, conducting security/quality reviews, or assessing technical debt. **Batch behavior:** runs 10 explorer agents per batch and appends results incrementally to a single report file (`docs/audits/production-readiness-{date}-{time}.md`) to avoid context bloat. **Output:** 27-dimension scored report (0–270) with severity ratings and standards cross-reference. Implementation details: [default/skills/production-readiness-audit/SKILL.md](../default/skills/production-readiness-audit/SKILL.md).

### For Product/Team-Specific Skills

1. Create plugin directory:

   ```bash
   mkdir -p product-xyz/{skills,agents,commands,hooks}
   ```

2. Add to `.claude-plugin/marketplace.json`:

   ```json
   {
     "name": "ring-product-xyz",
     "description": "Product XYZ specific skills",
     "version": "0.1.0",
     "source": "./product-xyz"
   }
   ```

3. Follow same skill structure as default plugin

---

## Modifying Hooks

1. Edit `default/hooks/hooks.json` for trigger configuration

2. Scripts in `default/hooks/`:

   - `session-start.sh` - Runs on startup
   - `claude-md-bootstrap.sh` - CLAUDE.md context

3. Test hook output:

   ```bash
   bash default/hooks/session-start.sh
   ```

   Must output JSON with `additionalContext` field

4. SessionStart hooks run on:

   - `startup|resume`
   - `clear|compact`

5. Note: `${CLAUDE_PLUGIN_ROOT}` resolves to plugin root (`default/` for core plugin)

---

## Plugin-Specific Using-\* Skills

Each plugin auto-loads a `using-{plugin}` skill via SessionStart hook to introduce available agents and capabilities:

### Default Plugin

- `marsai:using-marsai` → ORCHESTRATOR principle, mandatory workflow
- Always injected, always mandatory
- Located: `default/skills/using-marsai/SKILL.md`

### MarsAI Dev Team Plugin

- `marsai:using-dev-team` → 10 specialist developer agents
- Auto-loads when marsai-dev-team plugin is enabled
- Located: `dev-team/skills/using-dev-team/SKILL.md`
- Agents (invoke as `marsai:{agent-name}`):
  - marsai:backend-engineer-golang
  - marsai:backend-engineer-typescript
  - marsai:devops-engineer
  - marsai:frontend-bff-engineer-typescript
  - marsai:frontend-designer
  - marsai:frontend-engineer
  - marsai:prompt-quality-reviewer
  - marsai:qa-analyst
  - marsai:sre
  - marsai:ui-engineer

### Hook Configuration

- Each plugin has: `{plugin}/hooks/hooks.json` + `{plugin}/hooks/session-start.sh`
- SessionStart hook executes, outputs additionalContext with skill reference
- Only plugins in marketplace.json get loaded (conditional)

---

## Creating Review Agents

1. Add to `default/agents/your-reviewer.md` with output_schema (see [AGENT_DESIGN.md](AGENT_DESIGN.md))

2. Reference in `default/skills/requesting-code-review/SKILL.md:85`

3. Dispatch via Task tool:

   ```
   subagent_type="marsai:your-reviewer"
   ```

4. **MUST run in parallel** with other reviewers (single message, multiple Tasks)

---

## Development Cycle (10-gate)

The **marsai:dev-cycle** skill orchestrates task execution through **10 gates** (Gates 0–9, with Gate 0.5 for delivery verification): implementation (Gate 0) → delivery verification (Gate 0.5) → devops (Gate 1) → SRE (Gate 2) → unit-testing (Gate 3) → fuzz-testing (Gate 4) → property-testing (Gate 5) → integration-testing (Gate 6) → chaos-testing (Gate 7) → review (Gate 8) → validation (Gate 9). Multi-tenant adaptation is integrated into Gate 0. All gates are MANDATORY. Invoke with `/marsai:dev-cycle [tasks-file]` or Skill tool `marsai:dev-cycle`. State is persisted to `docs/marsai:dev-cycle/current-cycle.json`. See [dev-team/skills/dev-cycle/SKILL.md](../dev-team/skills/dev-cycle/SKILL.md) for full protocol.

---

## Parallel Code Review

### Instead of sequential (140 min)

```python
review1 = Task("marsai:code-reviewer")           # 20 min
review2 = Task("marsai:business-logic-reviewer") # 20 min
review3 = Task("marsai:security-reviewer")       # 20 min
review4 = Task("marsai:test-reviewer")           # 20 min
review5 = Task("marsai:nil-safety-reviewer")     # 20 min
review6 = Task("marsai:consequences-reviewer")   # 20 min
review7 = Task("marsai:dead-code-reviewer")      # 20 min
```

### Run parallel (20 min total)

```python
Task.parallel([
    ("marsai:code-reviewer", prompt),
    ("marsai:business-logic-reviewer", prompt),
    ("marsai:security-reviewer", prompt),
    ("marsai:nil-safety-reviewer", prompt),
    ("marsai:test-reviewer", prompt),
    ("marsai:consequences-reviewer", prompt),
    ("marsai:dead-code-reviewer", prompt)
])  # Single message, 7 tool calls
```

### Key rule

Always dispatch all 7 reviewers in a single message with multiple Task tool calls.

---

## Related Documents

- [CLAUDE.md](../CLAUDE.md) - Main project instructions (references this document)
- [AGENT_DESIGN.md](AGENT_DESIGN.md) - Agent output schemas
- [PROMPT_ENGINEERING.md](PROMPT_ENGINEERING.md) - Language patterns
