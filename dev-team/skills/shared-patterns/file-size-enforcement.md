# File Size Enforcement (MANDATORY)

## Standard Reference

**Source:** `typescript.md` → File Organization (MANDATORY)
**Rule:** Max 200-300 lines per file. If longer, split by responsibility boundaries.

This is a **HARD GATE** — not a suggestion.

---

## Thresholds

| Lines | Action |
|-------|--------|
| ≤ 300 | ✅ Compliant |
| 301-500 | ⚠️ WARNING — Must split before proceeding (301+ triggers gate loop-back) |
| > 500 | ❌ BLOCKING — Must split before gate can pass |

**These thresholds apply to ALL source files** (`*.ts`, `*.tsx`) **including test files**. Auto-generated files (`*.gen.ts`, `*.generated.ts`, `*.d.ts`) are exempt.

**Gate 0 enforcement:** Any non-exempt file > 300 lines after implementation = loop back to agent with split instructions. This is not just a 500-line hard block — the 300-line cap is enforced.

---

## When to Check

| Context | Check Point |
|---------|-------------|
| **marsai:dev-cycle Gate 0** | After implementation agent completes — verify no file exceeds 300 lines; >300 = loop back; >500 = hard block |
| **marsai:dev-cycle Gate 0.5** | Delivery verification MUST run file-size verification command and fail if any file > 300 lines |
| **marsai:dev-cycle Gate 8** | Code reviewers MUST flag any file > 300 lines as a MEDIUM+ issue |
| **marsai:dev-refactor Step 4** | Agents MUST flag files > 300 lines as ISSUE-XXX |
| **marsai:dev-implementation** | Agent MUST NOT create files > 300 lines. If a task would make a file exceed 300 lines, agent MUST split proactively |

---

## Verification Commands

```bash
# TypeScript projects — excludes node_modules, dist, build, generated, declaration files, mocks
find . \( -name "*.ts" -o -name "*.tsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*" \
  ! -path "*/out/*" \
  ! -path "*/.next/*" \
  ! -path "*/generated/*" \
  ! -path "*/__generated__/*" \
  ! -path "*/__mocks__/*" \
  ! -path "*/mocks/*" \
  ! -name "*.d.ts" \
  ! -name "*.gen.ts" \
  ! -name "*.generated.ts" \
  ! -name "*.mock.ts" \
  -exec wc -l {} + | awk '$1 > 300 && $NF != "total" {print}' | sort -rn
```

---

## Split Strategy

When a file exceeds the threshold, split by **responsibility boundaries** (not arbitrary line counts):

### TypeScript

| Pattern | Split Into |
|---------|-----------|
| Service with CRUD + validation + helpers | `*.service.ts`, `*.validator.ts`, `*.helpers.ts` |
| Controller with routes + middleware + handlers | `*.controller.ts`, `*.middleware.ts` |
| Large module barrel | Split into sub-modules by domain concept |
| Large test file | Split test file to mirror source file split |

**TypeScript rules:**
1. Split files stay in the **same module/directory** — update barrel exports (`index.ts`) if needed
2. Split by logical responsibility (class methods can be extracted to separate service/helper files)
3. Test files split to match: `foo.service.ts` → `foo.service.spec.ts`
4. Run `tsc --noEmit && npm test` after each split to verify

---

## Agent Instructions

### For marsai:dev-implementation (Gate 0) — TypeScript

Include in TypeScript implementation agent prompts:

```
⛔ FILE SIZE ENFORCEMENT (MANDATORY):
- You MUST NOT create or modify files to exceed 300 lines (including test files)
- If implementing a feature would push a file past 300 lines, you MUST split it proactively
- Split by logical responsibility (not arbitrary line counts)
- Update barrel exports (index.ts) if needed after splitting
- Test files MUST be split to match source files
- After splitting, verify: tsc --noEmit && npm test
- Files > 300 lines = loop back for split. Files > 500 lines = HARD BLOCK.

Reference: typescript.md → File Organization (MANDATORY)
```

### For marsai:dev-refactor (Step 4 agents)

Include in ALL analysis agent prompts:

```
⛔ FILE SIZE ENFORCEMENT (MANDATORY):
- Any source file > 300 lines (including test files) MUST be flagged as ISSUE-XXX
- Files 301-500 lines: severity HIGH
- Files > 500 lines: severity CRITICAL
- Files > 1000 lines: severity CRITICAL with explicit decomposition plan
- Include line count and proposed split in the finding
- Each file split = one ISSUE-XXX (not grouped)
```

---

## Anti-Rationalization

| Rationalization | Why It's WRONG | Required Action |
|-----------------|----------------|-----------------|
| "It's all one struct, can't split" | Methods on the same struct can live in different files (same package) | **Split by method responsibility** |
| "File will be split later" | Later = never. Split NOW during implementation. | **Split before gate passes** |
| "It's only 350 lines" | 350 > 300 = non-compliant. Standards are not negotiable. | **Split before proceeding** |
| "Splitting adds complexity" | Large files ARE complexity. Small focused files reduce cognitive load. | **Split by responsibility** |
| "Tests will break" | Split test files to match. Same package = same access. | **Split tests alongside source** |
| "Auto-generated code is large" | Auto-generated files (generated types, mocks) are exempt. | **Check if truly auto-generated** |
| "This is a temporary file" | Temporary becomes permanent. Standards apply to all files. | **Split or delete** |
| "Test files don't count" | Large test files are equally hard to maintain. Same threshold applies. | **Split test files to match source** |
