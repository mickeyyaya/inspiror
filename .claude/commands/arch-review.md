# /arch-review - Architecture Review

## Description
Comprehensive architecture review of implementation changes. Evaluates scalability, debuggability, maintainability, performance, and consistency. Acts as the senior architect overseeing all implementations before they merge to the default branch. Works with any language, framework, or project type.

## When to Use
- Automatically invoked by `/evolve-loop` Phase 3, step 4
- Manually before any significant merge to the default branch
- When refactoring or adding new modules

## Review Dimensions

### 1. Scalability
- Can this handle 10x load without architectural changes?
- Are there N+1 query patterns or unbounded loops?
- Is state management scalable (storage limits, memory growth, cache eviction)?
- Are external calls batched/debounced/paginated appropriately?
- Would this bottleneck under concurrent usage?

### 2. Debuggability
- Are errors surfaced with enough context to diagnose?
- Is there structured logging at key decision points?
- Can you trace a request from entry point through processing to response?
- Are error boundaries / recovery mechanisms in place?
- Do async operations have timeout/retry visibility?
- Are error messages actionable (not generic "something went wrong")?

### 3. Maintainability
- Does the change follow existing project conventions?
- Is coupling between modules minimal?
- Are files under 400 lines? Functions under 50 lines?
- Is the code self-documenting (clear naming, obvious flow)?
- Would a new developer understand this without extra context?
- Are there any "magic numbers" or hardcoded values?
- Is there unnecessary duplication?

### 4. Performance
- Are expensive operations minimized (caching, memoization, lazy loading)?
- Are network calls efficient (no redundant fetches, proper caching)?
- Is bundle/binary size impacted? Any heavy dependencies added?
- Are hot paths optimized (avoid allocation in loops, use efficient data structures)?
- Is there unnecessary re-computation or re-rendering?

### 5. Consistency
- Does this follow the patterns documented in project design docs?
- Are new types/interfaces/structs placed in the correct location?
- Does error handling match existing patterns?
- Is the i18n/l10n pattern followed for new user-facing strings (if applicable)?
- Are naming conventions consistent with the rest of the codebase?

### 6. Security
- Defer to security-reviewer agent for deep analysis
- Quick check: no secrets, validated inputs, sanitized outputs
- Are dependencies from trusted sources with no known CVEs?

## Output Format

The architecture review MUST output a structured verdict:

```
## Architecture Review Verdict

### Overall: PASS | WARN | FAIL

### Scores (1-5):
- Scalability: X/5
- Debuggability: X/5
- Maintainability: X/5
- Performance: X/5
- Consistency: X/5

### Blocking Issues (must fix before merge):
- [ ] Issue description + file:line + suggested fix

### Warnings (should fix, not blocking):
- [ ] Warning description + file:line

### Commendations (good patterns to preserve):
- Pattern description

### Recommendation:
MERGE / FIX_THEN_MERGE / REDESIGN
```

## Rules
- FAIL verdict = blocks the merge in `/evolve-loop`. Must fix before proceeding.
- WARN verdict = can proceed but issues should be tracked as tech debt.
- PASS verdict = merge freely.
- A score below 3 in any dimension = automatic WARN.
- A score of 1 in any dimension = automatic FAIL.

## Agent Configuration
When launching this as an agent, use:
- `subagent_type: "everything-claude-code:architect"`
- Give it access to: the diff (`git diff <default-branch>...HEAD`), and all project documentation files
- It should read all changed files, not just the diff
