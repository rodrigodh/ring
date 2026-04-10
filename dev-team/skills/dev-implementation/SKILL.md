---
name: marsai:dev-implementation
description: |
  Gate 0 of the development cycle. Executes code implementation using the appropriate
  specialized agent based on task content and project language. Handles TDD workflow
  with RED-GREEN phases. Follows project standards defined in docs/PROJECT_RULES.md.

trigger: |
  - Gate 0 of development cycle
  - Tasks loaded at initialization
  - Ready to write code
skip_when: |
  - Not inside a development cycle (marsai:dev-cycle or marsai:dev-refactor)
  - Task is documentation-only, configuration-only, or non-code
  - Implementation already completed for the current gate

sequence:
  before: [marsai:dev-devops]

related:
  complementary: [marsai:dev-cycle, marsai:test-driven-development, marsai:requesting-code-review]

input_schema:
  required:
    - name: unit_id
      type: string
      description: "Task or subtask identifier being implemented"
    - name: requirements
      type: string
      description: "Task requirements or acceptance criteria"
    - name: language
      type: string
      enum: [typescript, python]
      description: "Programming language for implementation"
    - name: service_type
      type: string
      enum: [api, worker, batch, cli, frontend, bff]
      description: "Type of service being implemented"
  optional:
    - name: technical_design
      type: string
      description: "Path to technical design document"
    - name: existing_patterns
      type: array
      items: string
      description: "Existing code patterns to follow"
    - name: project_rules_path
      type: string
      default: "docs/PROJECT_RULES.md"
      description: "Path to project rules file"

output_schema:
  format: markdown
  required_sections:
    - name: "Implementation Summary"
      pattern: "^## Implementation Summary"
      required: true
    - name: "TDD Results"
      pattern: "^## TDD Results"
      required: true
    - name: "Files Changed"
      pattern: "^## Files Changed"
      required: true
    - name: "Handoff to Next Gate"
      pattern: "^## Handoff to Next Gate"
      required: true
  metrics:
    - name: result
      type: enum
      values: [PASS, FAIL, PARTIAL]
    - name: agent_used
      type: string
    - name: tdd_red_status
      type: enum
      values: [completed, failed]
    - name: tdd_green_status
      type: enum
      values: [completed, failed]
    - name: files_created
      type: integer
    - name: files_modified
      type: integer
    - name: tests_added
      type: integer

verification:
  automated:
    - command: "npm run build 2>&1 | grep -c 'error'"
      description: "TypeScript compiles"
      success_pattern: "^0$"
  manual:
    - "TDD RED phase failure output captured before implementation"
    - "Implementation follows project standards from PROJECT_RULES.md"

---

# Code Implementation (Gate 0)

## Overview

This skill executes the implementation phase of the development cycle:
- Selects the appropriate specialized agent based on task content
- Applies project standards from docs/PROJECT_RULES.md
- Follows TDD methodology (RED → GREEN → REFACTOR)
- Documents implementation decisions

## CRITICAL: Role Clarification

**This skill ORCHESTRATES. Agents IMPLEMENT.**

| Who | Responsibility |
|-----|----------------|
| **This Skill** | Select agent, prepare prompts, track state, validate outputs |
| **Implementation Agent** | Write tests, write code, follow standards |

---

## Step 1: Validate Input

<verify_before_proceed>
- unit_id exists
- requirements exists
- language is valid (typescript|python)
- service_type is valid (api|worker|batch|cli|frontend|bff)
</verify_before_proceed>

```text
REQUIRED INPUT (from marsai:dev-cycle orchestrator):
- unit_id: [task/subtask being implemented]
- requirements: [acceptance criteria or task description]
- language: [typescript|python]
- service_type: [api|worker|batch|cli|frontend|bff]

OPTIONAL INPUT:
- technical_design: [path to design doc]
- existing_patterns: [patterns to follow]
- project_rules_path: [default: docs/PROJECT_RULES.md]

if any REQUIRED input is missing:
  → STOP and report: "Missing required input: [field]"
  → Return to orchestrator with error
```

## Step 2: Validate Prerequisites

<block_condition>
- PROJECT_RULES.md does not exist at project_rules_path
</block_condition>

If condition is true, STOP and return error to orchestrator.

```text
1. Check PROJECT_RULES.md exists:
   Read tool → project_rules_path (default: docs/PROJECT_RULES.md)
   
   if not found:
     → STOP with blocker: "Cannot implement without project standards"
     → Return error to orchestrator

2. Select implementation agent based on language:
   
   | Language | Service Type | Agent |
   |----------|--------------|-------|
   | typescript | api, worker | marsai:backend-engineer-typescript |
   | typescript | frontend, bff | frontend-bff-engineer-typescript |
   
   Store: selected_agent = [agent name]
```

## Step 3: Initialize Implementation State

```text
implementation_state = {
  unit_id: [from input],
  agent: selected_agent,
  tdd_red: {
    status: "pending",
    test_file: null,
    failure_output: null
  },
  tdd_green: {
    status: "pending",
    implementation_files: [],
    pass_output: null
  },
  files_created: [],
  files_modified: [],
  commit_sha: null
}
```

## Step 4: Gate 0.1 - TDD-RED (Write Failing Test)

<dispatch_required agent="[selected_agent]">
Write failing test for unit_id following TDD-RED methodology.
</dispatch_required>

```yaml
Task:
  subagent_type: "[selected_agent]"  # e.g., "marsai:backend-engineer-typescript"
  description: "TDD-RED: Write failing test for [unit_id]"
  prompt: |
    ⛔ TDD-RED PHASE: Write a FAILING Test

    ## Input Context
    - **Unit ID:** [unit_id]
    - **Requirements:** [requirements]
    - **Language:** [language]
    - **Service Type:** [service_type]

    ## Project Standards
    Read and follow: [project_rules_path]

    ## MarsAI Standards Reference
    For TS: `https://raw.githubusercontent.com/V4-Company/marsai/main/dev-team/docs/standards/typescript.md`

    ## Frontend TDD Policy (React/Next.js only)
    If the component is purely visual/presentational (layout, styling, animations,
    static display with no behavioral logic), TDD-RED is NOT required.
    Instead, implement the component directly and defer testing to Gate 4 (Visual
    Testing / Snapshots). Report: "Visual-only component → TDD-RED skipped, Gate 4 snapshots apply."

    Behavioral components (custom hooks, form validation, state management,
    conditional rendering, API integration) MUST follow TDD-RED below.

    ## Your Task
    1. Write a test that captures the expected behavior
    2. The test MUST FAIL (no implementation exists yet)
    3. Run the test and capture the FAILURE output

    ## Requirements for Test
    - Follow project naming conventions from PROJECT_RULES.md
    - Use describe/it blocks (TS)
    - Test the happy path and edge cases
    - Include meaningful assertion messages

    ## Required Output Format

    ### Test File
    **Path:** [path/to/test_file]
    
    ```[language]
    [test code]
    ```

    ### Test Execution
    **Command:** [test command]
    **Result:** FAIL (expected)

    ### Failure Output (MANDATORY)
    ```
    [paste actual test failure output here]
    ```

    ⛔ HARD GATE: You MUST include actual failure output.
    Without failure output, TDD-RED is not complete.
```

## Step 5: Validate TDD-RED Output

<block_condition>
- failure_output is missing
- failure_output does not contain "FAIL"
</block_condition>

If any condition is true, re-dispatch agent with clarification.

```text
Parse agent output:

1. Extract test file path
2. Extract failure output

if failure_output is missing or does not contain "FAIL":
  → STOP: "TDD-RED incomplete - no failure output captured"
  → Re-dispatch agent with clarification

if failure_output contains "FAIL":
  → implementation_state.tdd_red = {
      status: "completed",
      test_file: [extracted path],
      failure_output: [extracted output]
    }
  → Proceed to Step 6
```

## Step 6: Gate 0.2 - TDD-GREEN (Implementation)

**PREREQUISITE:** `implementation_state.tdd_red.status == "completed"`

<dispatch_required agent="[selected_agent]">
Implement code to make test pass following TDD-GREEN methodology.
</dispatch_required>

```yaml
Task:
  subagent_type: "[selected_agent]"
  description: "TDD-GREEN: Implement code to pass test for [unit_id]"
  prompt: |
    ⛔ TDD-GREEN PHASE: Make the Test PASS

    ## Input Context
    - **Unit ID:** [unit_id]
    - **Requirements:** [requirements]
    - **Language:** [language]
    - **Service Type:** [service_type]

    ## TDD-RED Results (from previous phase)
    - **Test File:** [implementation_state.tdd_red.test_file]
    - **Failure Output:**
    ```
    [implementation_state.tdd_red.failure_output]
    ```

    ## Project Standards
    Read and follow: [project_rules_path]

    ## MarsAI Standards Reference (Modular — Load by Task Type)
    
    ### TypeScript
    URL: `https://raw.githubusercontent.com/V4-Company/marsai/main/dev-team/docs/standards/typescript.md`

    ## ⛔ FILE SIZE ENFORCEMENT (MANDATORY)
    See [shared-patterns/file-size-enforcement.md](../shared-patterns/file-size-enforcement.md)
    - You MUST NOT create or modify files to exceed 300 lines (including test files)
    - If implementing a feature would push a file past 300 lines, you MUST split it proactively
    - Split by responsibility boundaries (not arbitrary line counts)
    - **TypeScript:** Split files stay in the same module/directory; update barrel exports (index.ts) if needed; verify with `tsc --noEmit && npm test`
    - Test files MUST be split to match source files
    - Files > 300 lines = loop back for split. Files > 500 lines = HARD BLOCK.
    - Reference: typescript.md → File Organization (MANDATORY)

    ## ⛔ CRITICAL: all MarsAI Standards Apply (no DEFERRAL)
    
    **You MUST check ALL sections from the modules you loaded.** Not just telemetry — ALL of them.
    See MarsAI Standards for mandatory requirements including (but not limited to):
    - License headers on all source files
    - Structured JSON logging with trace_id correlation
    - OpenTelemetry instrumentation (spans in every function)
    - Error handling (no panic, wrap with context, sentinel errors)
    - Context propagation
    - Input validation (validator v10)
    - SQL safety (parameterized queries)
    - Secret redaction in logs
    - HTTP status code consistency (201 create, 200 update)
    - Handler constructor pattern (DI via constructor)
    - File organization (≤300 lines per file)
    - Function design (single responsibility, max 20-30 lines)
    - Database naming (snake_case)

    **⛔ HARD GATE:** If you output "DEFERRED" for any MarsAI Standard → Implementation is INCOMPLETE.

    ## Your Task
    1. Write MINIMAL code to make the test pass
    2. Follow all MarsAI Standards (logging, tracing, error handling)
    3. **Instrument all code with telemetry** (100% of handlers, services, repositories)
    4. Run the test and capture the PASS output

    ## ⛔ MANDATORY: Telemetry Instrumentation (NON-NEGOTIABLE)

    <cannot_skip>
    - 90%+ instrumentation coverage required
    - WebFetch standards file before implementation
    - Follow exact patterns from standards
    - Output Standards Coverage Table with evidence
    </cannot_skip>

    **every function that does work MUST be instrumented with telemetry.**
    This is not optional. This is not "nice to have". This is REQUIRED.

    ### What "Instrumented" Means
    1. **Extract logger/tracer from context** (not create new ones)
    2. **Create a child span** for the operation
    3. **Defer span.End()** immediately
    4. **Use structured logging** correlated with trace
    5. **Handle errors with span attribution** (business vs technical)

    ### Language-Specific Patterns (MANDATORY)

    **⛔ HARD GATE: Agent MUST WebFetch standards files BEFORE writing any code.**
    
    | Language | Standards Modules | REQUIRED Sections to WebFetch |
    |----------|-------------------|-------------------------------|
    | **TypeScript** | `typescript.md` | ALL 15 sections from `standards-coverage-table.md` → `marsai:backend-engineer-typescript` |

    **⛔ NON-NEGOTIABLE: Agent MUST implement EXACTLY the patterns from standards. no deviations. no shortcuts.**

    | Requirement | Enforcement |
    |-------------|-------------|
    | WebFetch modular standards files | MANDATORY before implementation |
    | Follow exact patterns | REQUIRED - copy structure from standards |
    | Output Standards Coverage Table | REQUIRED - with file:line evidence for ALL loaded sections |
    | 90%+ instrumentation coverage | HARD GATE - implementation REJECTED if below |
    | All loaded sections ✅ or N/A | HARD GATE - any ❌ = REJECTED |

    ### ⛔ FORBIDDEN Patterns (HARD BLOCK)
    
    **Agent MUST WebFetch standards and check Anti-Patterns table. Violations = REJECTED.**

    - **TypeScript:** `typescript.md` → "Anti-Patterns" table - MUST check all rows

    **If agent uses any forbidden pattern → Implementation is INVALID. Start over.**

    ### Verification (MANDATORY)
    
    **Agent MUST output Standards Coverage Table per `standards-coverage-table.md`.**
    
    - all sections MUST show ✅ or N/A
    - any ❌ = Implementation REJECTED
    - Missing table = Implementation INCOMPLETE

    ## Required Output Format

    ### Implementation Files
    | File | Action | Lines |
    |------|--------|-------|
    | [path] | Created/Modified | +/-N |

    ### Code
    **Path:** [path/to/implementation_file]
    
    ```[language]
    [implementation code]
    ```

    ### Test Execution
    **Command:** [test command]
    **Result:** PASS

    ### Pass Output (MANDATORY)
    ```
    [paste actual test pass output here]
    ```

    ### Standards Coverage Table (MANDATORY)
    
    **Standards Modules Loaded:** [list modules WebFetched]
    **Total Sections Checked:** [N]
    
    | # | Section (from standards) | Status | Evidence |
    |---|------------------------|--------|----------|
    | 1 | [section name] | ✅/⚠️/❌/N/A | file:line or reason |
    | ... | ... | ... | ... |
    
    **Completeness:** [N] sections checked / [N] total = ✅ Complete
    
    ⛔ This table is MANDATORY. Missing table = Implementation INCOMPLETE.
    ⛔ Any ❌ = Implementation REJECTED. Fix before proceeding.

    ### Standards Compliance Summary
    
    **Quick reference derived from the Standards Coverage Table above.**
    If any item is ❌ here, it MUST also appear as ❌ in the Coverage Table with file:line evidence.
    
    - License Headers: ✅/❌
    - Structured Logging: ✅/❌
    - OpenTelemetry Spans: ✅/❌
    - Error Handling: ✅/❌
    - Context Propagation: ✅/❌
    - Input Validation: ✅/❌/N/A
    - SQL Safety: ✅/❌/N/A
    - File Size (≤300 lines): ✅/❌

    ### Commit
    **SHA:** [commit hash after implementation]
```

## Step 7: Validate TDD-GREEN Output

```text
Parse agent output:

1. Extract implementation files
2. Extract pass output
3. Extract standards compliance
4. Extract commit SHA

if pass_output is missing or does not contain "PASS":
  → STOP: "TDD-GREEN incomplete - test not passing"
  → Re-dispatch agent with error details

if Standards Coverage Table is missing:
  → STOP: "Standards Coverage Table not provided - implementation INCOMPLETE"
  → Re-dispatch agent: "You MUST output a Standards Coverage Table with one row per section from the modules you loaded. See standards-coverage-table.md for format."

if any section in Standards Coverage Table is ❌:
  → STOP: "Standards not met - [list ❌ sections with evidence]"
  → Re-dispatch agent to fix specific sections

if any standards compliance summary is ❌:
  → STOP: "Standards not met - [list failing standards]"
  → Re-dispatch agent to fix

if pass_output contains "PASS" and all standards ✅ and Standards Coverage Table complete:
  → Run file-size verification (see shared-patterns/file-size-enforcement.md):
    TS: find . \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/build/*" ! -path "*/generated/*" ! -path "*/__mocks__/*" ! -name "*.d.ts" ! -name "*.gen.ts" -exec wc -l {} + | awk '$1 > 300 && $NF != "total" {print}' | sort -rn
  
  if any file > 500 lines:
    → HARD BLOCK: "File [path] has [N] lines (max 500). MUST split before proceeding."
    → Re-dispatch agent with split instructions from shared-patterns/file-size-enforcement.md

  if any file > 300 lines:
    → LOOP BACK: "File [path] has [N] lines (max 300). Split by responsibility boundaries."
    → Re-dispatch agent with file path and split strategy suggestion

  → Run linting verification (R4 — quality.md mandates 14 linters):
    TypeScript: if eslint config exists, run: npx eslint . --ext .ts,.tsx
  
  if linting fails:
    → Re-dispatch agent: "Linting failed. Fix all lint issues before proceeding. Output: [lint errors]"
  
  → Run license header check (R5 — core.md License Headers MANDATORY):
    For each file in [files_created + files_modified] matching *.ts, *.tsx:
      Check first 10 lines for: copyright|licensed|spdx|license (case-insensitive)
      If not found → flag as missing

  if any file missing license header:
    → Re-dispatch agent: "Missing license headers in: [file list]. Add license headers per core.md → License Headers (MANDATORY)."

  if all checks pass:
    → implementation_state.tdd_green = {
        status: "completed",
        implementation_files: [extracted files],
        pass_output: [extracted output],
        commit_sha: [extracted SHA],
        file_size: "PASS",
        linting: "PASS",
        license_headers: "PASS"
      }
    → Proceed to Step 8
```

## Step 8: Prepare Output

```text
Generate skill output:

## Implementation Summary
**Status:** PASS
**Unit ID:** [unit_id]
**Agent:** [selected_agent]
**Commit:** [commit_sha]

## TDD Results
| Phase | Status | Output |
|-------|--------|--------|
| RED | ✅ | [first line of failure_output] |
| GREEN | ✅ | [first line of pass_output] |

## Files Changed
| File | Action | Lines |
|------|--------|-------|
[table from implementation_files]

**Files Created:** [count]
**Files Modified:** [count]
**Tests Added:** [count]

## Standards Compliance
- Structured Logging: ✅
- OpenTelemetry Spans: ✅
- Error Handling: ✅
- Context Propagation: ✅
- File Size (≤300 lines): ✅
## Handoff to Next Gate
- Implementation status: COMPLETE
- Code compiles: ✅
- Tests pass: ✅
- Standards met: ✅
- Ready for Gate 1 (DevOps): YES
- Environment needs: [list any new deps, env vars, services]
```

---

## Severity Calibration

| Severity | Criteria | Examples |
|----------|----------|----------|
| **CRITICAL** | TDD bypassed, no test exists, security vulnerability | Skipped RED phase, missing test file, exposed credentials |
| **HIGH** | Standards non-compliance, missing observability | No telemetry spans, missing error handling, raw OTel usage |
| **MEDIUM** | Code quality issues, incomplete implementation | Partial telemetry coverage, non-standard patterns |
| **LOW** | Style improvements, documentation gaps | Naming conventions, missing comments |

Report all severities. CRITICAL = immediate block. HIGH = fix before proceeding. MEDIUM = fix in iteration. LOW = document.

---

## Pressure Resistance

See [shared-patterns/shared-pressure-resistance.md](../shared-patterns/shared-pressure-resistance.md) for universal pressure scenarios.

| User Says | Your Response |
|-----------|---------------|
| "Skip TDD, just implement" | "TDD is MANDATORY. Dispatching agent for RED phase." |
| "Code exists, just add tests" | "DELETE existing code. TDD requires test-first." |
| "Add observability later" | "Observability is part of implementation. Agent MUST add it now." |

---

## Anti-Rationalization Table

See [shared-patterns/shared-anti-rationalization.md](../shared-patterns/shared-anti-rationalization.md) for universal anti-rationalizations.

### Gate 0-Specific Anti-Rationalizations

| Rationalization | Why It's WRONG | Required Action |
|-----------------|----------------|-----------------|
| "Test passes on first run" | Passing test ≠ TDD. Test MUST fail first. | **Rewrite test to fail first** |
| "Skip RED, go straight to GREEN" | RED proves test validity | **Execute RED phase first** |
| "I'll add observability later" | Later = never. Observability is part of GREEN. | **Add logging + tracing NOW** |
| "Minimal code = no logging" | Minimal = pass test. Logging is a standard, not extra. | **Include observability** |
| "DEFERRED to later tasks" | DEFERRED = FAILED. Standards are not deferrable. | **Implement all standards NOW** |
| "c.JSON() works the same" | Direct framework breaks response standardization | **Use standard response helpers** |
| "This function is too simple for spans" | Simple ≠ exempt. all functions need spans. | **Add span to every function** |
| "Telemetry adds overhead" | Observability is non-negotiable for production | **Instrument 100% of code paths** |

## Agent Selection Guide

| Language | Service Type | Condition | Agent |
|----------|--------------|-----------|-------|
| TypeScript | API, Worker | - | `marsai:backend-engineer-typescript` |
| TypeScript | Frontend, BFF | No product-designer outputs | `marsai:frontend-bff-engineer-typescript` |
| TypeScript | Frontend | ux-criteria.md exists | `marsai:ui-engineer` |
| React/CSS | Design, Styling | - | `marsai:frontend-designer` |

**ui-engineer Selection:**
When implementing frontend features with product-designer outputs (ux-criteria.md, user-flows.md, wireframes/), use `marsai:ui-engineer` instead of `marsai:frontend-bff-engineer-typescript`. The ui-engineer specializes in translating design specifications into production code while ensuring all UX criteria are satisfied.

---

## Execution Report Format

```markdown
## Implementation Summary
**Status:** [PASS|FAIL|PARTIAL]
**Unit ID:** [unit_id]
**Agent:** [agent]
**Duration:** [Xm Ys]

## TDD Results
| Phase | Status | Output |
|-------|--------|--------|
| RED | ✅/❌ | [summary] |
| GREEN | ✅/❌ | [summary] |

## Files Changed
| File | Action | Lines |
|------|--------|-------|
| [path] | [Created/Modified] | [+/-N] |

## Standards Compliance
- Structured Logging: ✅/❌
- OpenTelemetry Spans: ✅/❌
- Error Handling: ✅/❌
- Context Propagation: ✅/❌

## Handoff to Next Gate
- Implementation status: [COMPLETE|PARTIAL]
- Ready for Gate 1: [YES|no]
- Environment needs: [list]
```
