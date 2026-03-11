---
name: evolve-loop
description: "Self-evolving development cycle: Research → Prioritize → Implement → Review → Merge → Loop. Works with any project, language, or LLM."
---

# Evolve Loop

A continuous evolution cycle that autonomously researches, prioritizes, implements, reviews, tests, and ships features — then loops back to start again. Designed for long-running autonomous development.

Incorporates patterns from [autonomous-loops](https://github.com/affaan-m/everything-claude-code/blob/main/skills/autonomous-loops/SKILL.md): de-sloppify, model routing, cross-iteration context, separate context windows, and completion signals.

## When to Use

- Running autonomous improvement loops on a codebase
- Combining with `/loop 30m /evolve-loop` for continuous evolution
- Shipping incremental features without human intervention (bypass-permissions mode)
- Keeping project docs and competitive analysis current

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  EVOLVE LOOP (one cycle)                                │
│                                                         │
│  Phase 0: AUTO-DETECT (once)                            │
│  └─ language, tests, docs, domain, monorepo structure   │
│                                                         │
│  Phase 1: RESEARCH (parallel)                           │
│  ├─ Explore agent (model: sonnet) → read all .md docs   │
│  ├─ Research agent (model: sonnet) → WebSearch trends    │
│  ├─ WAIT for both ──────────────────────────────────┐   │
│  └─ Doc-updater agent → update PRD/TDD/TASKS        │   │
│      └─ GATE: commit doc updates                     │   │
│                                                         │
│  Phase 2: PRIORITIZE                                    │
│  ├─ Planner agent (model: opus) → pick top 1-2 features │
│  └─ GATE: user approval (skip in autonomous mode)       │
│                                                         │
│  Phase 3: IMPLEMENT (in worktree)                       │
│  ├─ wt switch --create feature/<name>                   │
│  ├─ TDD agent (model: sonnet) → RED/GREEN/REFACTOR      │
│  ├─ De-sloppify agent → cleanup test/code slop          │
│  ├─ REVIEW BARRIER ─────────────────────────────────┐   │
│  │  Launch ALL reviewers in parallel (separate ctx): │   │
│  │  ├─ E2E runner agent (model: sonnet)              │   │
│  │  ├─ Security reviewer agent (model: sonnet)       │   │
│  │  └─ Architecture reviewer (model: opus)           │   │
│  │  WAIT for ALL to complete before proceeding.      │   │
│  │  Collect all findings into a single review report.│   │
│  └───────────────────────────────────────────────────┘   │
│  ├─ GATE: fix ALL blocking issues from reviewers        │
│  └─ GATE: full test suite passes                        │
│                                                         │
│  Phase 4: CODE REVIEW + MERGE                           │
│  ├─ gh pr create                                        │
│  ├─ /code-review (Skill: "code-review:code-review")     │
│  ├─ WAIT for code review to complete                    │
│  ├─ GATE: fix CRITICAL/HIGH issues                      │
│  ├─ wt merge (squash + rebase + cleanup)                │
│  ├─ GATE: full test suite on default branch              │
│  └─ git push + update .claude/evolve/ + log completion   │
│                                                         │
│  Phase 5: LOOP or STOP                                  │
│  ├─ Update .claude/evolve/NOTES.md with cycle summary    │
│  ├─ Check completion signal (3 consecutive "nothing to  │
│  │   do" → STOP)                                        │
│  └─ Proceed to Phase 1                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 0: Auto-Detection (Run Once)

Before Phase 1, detect the project context. Read available config files to determine:

| Detection | Sources | Examples |
|-----------|---------|----------|
| Language/framework | `package.json`, `go.mod`, `requirements.txt`, `Cargo.toml`, `pom.xml` | React+Vite, Go, Django |
| Test commands | Scripts in config, Makefile, CI files | `vitest`, `pytest`, `go test` |
| Project docs | `Glob("**/*.md")` excluding `node_modules`, `vendor`, `.git` | PRD, README, TASKS |
| Domain & competitors | README, PRD, package description | Infer target audience |
| Monorepo structure | Top-level directories | `frontend/`, `backend/`, `packages/` |

Store these as context for all subsequent phases.

---

## Cycle Memory: `.claude/evolve/state.json`

To avoid repeating the same searches, re-evaluating rejected tasks, or retrying failed approaches, maintain a structured state file at `.claude/evolve/state.json`:

```json
{
  "lastUpdated": "2025-03-11T10:00:00Z",
  "research": {
    "queries": [
      {
        "query": "kids math game gamification trends 2025",
        "date": "2025-03-10",
        "keyFindings": ["spaced repetition trending", "AI tutors growing"],
        "ttlDays": 7
      }
    ]
  },
  "evaluatedTasks": [
    {
      "task": "Add multiplayer mode",
      "date": "2025-03-10",
      "decision": "rejected",
      "reason": "Too complex for current architecture, revisit after v2",
      "revisitAfter": "2025-04-01"
    },
    {
      "task": "Add sound effects",
      "date": "2025-03-09",
      "decision": "completed",
      "cycle": 3
    }
  ],
  "failedApproaches": [
    {
      "feature": "WebSocket real-time sync",
      "date": "2025-03-10",
      "approach": "Socket.io with Redis pub/sub",
      "error": "Redis connection pooling issues in serverless",
      "alternative": "Consider SSE or polling instead"
    }
  ],
  "nothingToDoCount": 0
}
```

**Rules:**
- Read `.claude/evolve/state.json` at the start of every phase (if it exists)
- Write updates at the end of Phase 1 (research), Phase 2 (task decisions), Phase 3 (implementation outcomes), and Phase 5 (cycle wrap-up)
- Research queries have a TTL (default 7 days) — skip queries whose findings are still fresh
- Rejected tasks have an optional `revisitAfter` date — skip them until that date passes
- Failed approaches are logged with error context so the next cycle tries a different strategy
- Completed tasks are never re-proposed by the planner

---

## Phase 1: Research & Update Docs

**Steps 0-2 run (0 first, then 1-2 in parallel). Step 3 waits for both to complete.**

0. **Load state** — Read `.claude/evolve/state.json` if it exists. Extract: recent research queries (skip if TTL not expired), completed tasks (never re-propose), rejected tasks (skip until `revisitAfter`), failed approaches (avoid retrying same strategy).

1. **Explore agent** (model: sonnet) — Read ALL `.md` files in the project. Also read `.claude/evolve/notes.md` if it exists (cross-iteration context from previous cycles). Evaluate the project holistically across ALL dimensions, not just new features:

   - **Features:** What's built, what's missing, gaps vs competitors
   - **Performance:** Bundle size, load times, render performance, memory leaks, unnecessary re-renders
   - **Stability:** Error handling coverage, edge cases, crash scenarios, test coverage gaps
   - **UI/UX:** Responsiveness (mobile/tablet/desktop), accessibility (a11y), visual consistency, interaction polish, animation smoothness
   - **Playability/Usability:** User flow friction, onboarding clarity, discoverability of features, cognitive load for target audience
   - **Code quality:** Tech debt, outdated dependencies, dead code, file organization, type safety
   - **Security:** Exposed secrets, unvalidated inputs, dependency vulnerabilities
   - **Architecture:** Scalability bottlenecks, coupling issues, missing abstractions

   Summarize findings per dimension with severity (CRITICAL/HIGH/MEDIUM/LOW).

2. **Research agent** (model: sonnet, general-purpose with WebSearch) — **First check `.claude/evolve/state.json` research queries.** Skip any search whose TTL has not expired (default 7 days). For remaining topics, search based on auto-detected context:
   - Latest trends in the project's domain and target audience
   - Competitor updates (found in docs, or inferred from domain)
   - UX/DX best practices relevant to the project type
   - Performance optimization techniques for the project's stack
   - New libraries, tools, or APIs that could improve the stack
   - Security advisories for the project's dependencies
   After searching, **update `.claude/evolve/state.json`** with new queries, dates, and key findings.

3. **WAIT** for steps 1 and 2 to complete. Then launch a **doc-updater agent** with combined findings to update:
   - `PRD.md` (or equivalent) — new insights, competitive landscape
   - Design docs (`TDD_DESIGN.md`, `ARCHITECTURE.md`, etc.) — technical considerations
   - `TASKS.md` / `TODO.md` / `BACKLOG.md` — newly discovered improvements across ALL dimensions (features, performance, stability, UI/UX, security, etc.)
   - If no task file exists, create `TASKS.md`

4. **GATE: Commit** doc updates: `docs: update project docs with latest research findings`

---

## Phase 2: Prioritize Features

1. **Planner agent** (model: opus for deep reasoning) — Read all updated project documentation, `.claude/evolve/notes.md`, AND `.claude/evolve/state.json`. The planner MUST:
   - **Skip completed tasks** — anything in `evaluatedTasks` with `decision: "completed"`
   - **Skip rejected tasks** — anything with `decision: "rejected"` whose `revisitAfter` date has not passed
   - **Avoid failed approaches** — check `failedApproaches` and propose alternative strategies if the same feature area comes up
   - Output: Top 1-2 highest-impact items to work on. These can be ANY type of improvement:
     - **New features** (user-facing functionality)
     - **Performance fixes** (bundle size, load time, render optimization)
     - **Stability improvements** (error handling, edge cases, test coverage)
     - **UI/UX polish** (responsiveness, accessibility, visual consistency, interaction design)
     - **Playability/Usability** (user flow improvements, onboarding, discoverability)
     - **Tech debt reduction** (refactoring, dependency updates, dead code removal)
     - **Security hardening** (vulnerability fixes, input validation, dependency patches)
   - Rationale (user value, complexity, tech debt reduction, competitive differentiation)
   - Acceptance criteria (testable bullet points)
   - Estimated complexity (S/M/L)
   - **Update `.claude/evolve/state.json`** — add newly evaluated tasks with their decisions and reasons

2. **GATE: Approval**
   - **Autonomous mode** (bypass-permissions enabled): proceed directly to Phase 3 with ALL prioritized items. After completing Phase 4 for the first item, immediately return to Phase 3 for the next item. Continue until ALL items from this cycle's prioritization are implemented, reviewed, and merged. Do NOT stop between items — the goal is to ship everything the planner selected in one continuous pass.
   - **Interactive mode**: present proposed items, wait for user confirmation before each item
   - If user says no → record the task as `rejected` in `.claude/evolve/state.json` with reason and `revisitAfter` date, then STOP the cycle

3. **Completion signal check**: If the planner finds nothing meaningful to prioritize, increment `nothingToDoCount` in `.claude/evolve/state.json`. If this counter reaches 3 consecutive cycles → STOP the loop entirely and inform the user: "No features left to implement. The project has converged."

---

## Phase 3: Implement in Worktree

Each feature gets an isolated worktree via **worktrunk**.

### Step 1: Create worktree

```bash
wt switch --create feature/<short-feature-name>
```

### Step 2: TDD implementation

Launch a **tdd-guide agent** (model: sonnet) in the worktree:
- Write unit tests first (RED)
- Verify tests fail
- Implement minimal code to pass (GREEN)
- Refactor (IMPROVE)
- Target: 98%+ unit test coverage

### Step 3: De-sloppify pass

> Rather than adding negative instructions which have downstream quality effects, add a separate de-sloppify pass. Two focused agents outperform one constrained agent.

Launch a **separate de-sloppify agent** (fresh context window — NOT the same agent that wrote the code) to:

- Review all changes in the working tree
- Remove tests that verify language/framework behavior rather than business logic
- Remove redundant type checks the type system already enforces
- Remove over-defensive error handling for impossible states
- Remove `console.log` statements and commented-out code
- Keep all business logic tests
- Run the test suite after cleanup to ensure nothing breaks

This step is critical because the TDD agent tends to over-test. The cleanup agent has no author bias since it runs in a separate context window.

### Step 4: Review barrier (CRITICAL — all reviewers must complete)

Launch ALL review agents **in parallel**, each in its own **separate context window** (separate Agent calls). Reviewers must NOT be the same agent that wrote the code — this eliminates author bias.

**Read-only enforcement:** Reviewer agents should only use read-only tools (`Read`, `Grep`, `Glob`, `Bash` for analysis commands). They must NOT use `Edit` or `Write` — reviewers report findings, they don't fix code. Fixes happen in Step 5 by the implementation agent.

**WAIT for every agent to return before proceeding.** Do NOT move to step 5 until all results are collected.

| Agent | Model | Evaluates |
|-------|-------|-----------|
| E2E runner | sonnet | Generate + run E2E tests (if applicable to project type) |
| Security reviewer | sonnet | XSS, injection, secrets, OWASP Top 10 |
| Architecture reviewer | opus | Scalability, debuggability, maintainability, performance, consistency (via `/arch-review`) |

**Collect all findings into a unified review report:**

```
REVIEW BARRIER REPORT
=====================
E2E Tests:      [PASS/FAIL] (X tests generated, Y passing)
Security:       [PASS/FAIL] (X issues: H high, M medium, L low)
Architecture:   [PASS/WARN/FAIL] (scores: S/D/M/P/C out of 5)

Blocking Issues:
1. [source] description + file:line
2. ...

Warnings:
1. [source] description
2. ...
```

### Step 5: Fix blocking issues

If ANY reviewer returned FAIL or blocking issues:
- Fix all blocking issues
- Re-run the specific reviewer(s) that failed
- Repeat until all reviewers pass or warn

### Step 6: Full test suite

Run ALL auto-detected test commands. Every suite must pass:
- Unit tests with coverage >= 98%
- Integration tests (if they exist)
- E2E tests (if they exist)
- Linting / type checking (if configured)

If tests fail → fix and re-run. Do NOT proceed to Phase 4 with failing tests.

**If implementation fails after 3 attempts**, do NOT keep retrying:
- Log the failed approach in `.claude/evolve/state.json` under `failedApproaches` with error context and suggested alternative
- Mark the task as `rejected` with `revisitAfter` set to 7 days from now
- Skip to Phase 5 (loop) instead of Phase 4

---

## Phase 4: Code Review, Merge & Push

### Step 1: Create PR

```bash
gh pr create --title "feat: <description>" --body "<summary>"
```

If no remote is configured, skip PR creation and proceed to local merge.

### Step 2: Code review

Invoke `/code-review` via Skill tool (`skill: "code-review:code-review"`).
- 4 parallel review agents (CLAUDE.md compliance, bug scan, git history)
- Only high-confidence issues (score 80+) flagged
- **WAIT** for code review to complete
- Fix any CRITICAL or HIGH issues before proceeding

### Step 3: Merge via worktrunk

```bash
wt merge
```

This automatically: squashes commits, rebases if behind, fast-forward merges, removes worktree and branch.

**If merge conflicts occur:**
- Resolve carefully, preserving both feature and default-branch changes
- Re-run full test suite after resolution
- Complete the merge

### Step 4: Post-merge verification

**GATE:** Run full test suite on the default branch after merge. If tests fail, fix before pushing.

### Step 5: Push and log

```bash
git push origin <default-branch>
```

Log completion in `TASKS.md` (or equivalent) with date, feature name, and coverage stats.

### Step 6: CI auto-recovery (conditional)

If `.github/workflows/` exists (i.e., CI is configured):

1. Run `gh run watch` to monitor the triggered CI run
2. If CI passes → proceed to Phase 5
3. If CI fails:
   - Read failure logs: `gh run view <run-id> --log-failed`
   - Fix the failing step (test, lint, build, etc.)
   - Commit the fix and push again
   - Repeat up to **3 attempts**
   - After 3 failures → STOP the cycle and report the persistent CI failure

If no `.github/workflows/` directory exists → skip this step entirely.

---

## Phase 5: Loop

### Step 1: Update cycle memory

**Update `.claude/evolve/state.json`:**
- Mark implemented tasks as `completed` in `evaluatedTasks`
- Reset `nothingToDoCount` to 0 (if a feature was shipped this cycle)
- Update `lastUpdated` timestamp

**Update `.claude/evolve/notes.md`** — this file bridges context between cycles (each `claude -p` or new session starts fresh — this file is the memory):

```markdown
## Cycle N — <date>
- **Feature:** <what was built>
- **Coverage:** <X%>
- **Security:** <PASS/WARN> (X issues fixed)
- **Architecture:** <PASS/WARN> (avg score X/5)
- **Code Review:** <X issues found, Y fixed>
- **Warnings deferred:** <list of WARN items tracked as tech debt>
- **Next cycle should consider:** <suggestions from this cycle's findings>
```

Append to the file — do not overwrite previous entries. This gives future cycles full history.

### Step 2: Output cycle summary

```
CYCLE COMPLETE
==============
Feature:      <what was built>
Coverage:     <X%>
Security:     <PASS/WARN> (X issues fixed)
Architecture: <PASS/WARN> (avg score X/5)
Code Review:  <X issues found, Y fixed>
Commits:      <list of commits>
```

### Step 3: Continue or stop

- If completion signal triggered (3 consecutive "nothing to do") → STOP
- If context window approaching limits → output summary, suggest `/evolve-loop` in fresh session
- **Autonomous mode** (bypass-permissions enabled): ALWAYS proceed to Phase 1 automatically. Never pause for confirmation between cycles. The loop runs continuously until an exit condition is met (completion signal, context exhaustion, or max cycles).
- **Interactive mode**: proceed to Phase 1

---

## Model Routing Strategy

Route each step to the most cost-effective model for the task:

| Step | Recommended Model | Rationale |
|------|------------------|-----------|
| Research / Explore | sonnet | Fast retrieval, wide search |
| Planning / Prioritization | opus | Deep reasoning about tradeoffs |
| TDD Implementation | sonnet | Fast, capable coding |
| De-sloppify cleanup | sonnet | Focused refactoring |
| E2E / Security review | sonnet | Pattern matching, checklist-driven |
| Architecture review | opus | Deep structural analysis |
| Code review (`/code-review`) | (uses its own routing) | Plugin-managed |

Use the `model` parameter on Agent tool calls to route. If the model parameter is not available, use the default model — routing is a recommendation, not a requirement.

---

## Cross-Iteration Context: `.claude/evolve/notes.md`

The critical bridge between cycles. Each cycle reads this file at Phase 1 and writes to it at Phase 5.

**Why this matters:** Each `/evolve-loop` invocation (or `claude -p` call) starts with a fresh context window. Without `.claude/evolve/notes.md`, the next cycle has no memory of what was already built, what warnings were deferred, or what the previous cycle recommended.

**Rules:**
- Always append, never overwrite
- Keep entries concise (5-10 lines per cycle)
- Include deferred warnings so they don't get lost
- Include "next cycle should consider" recommendations

---

## Exit Conditions

Always have at least one exit condition to prevent infinite resource consumption:

| Condition | How to Set |
|-----------|-----------|
| Manual stop | User interrupts or says "stop" |
| Completion signal | 3 consecutive cycles where planner finds nothing → auto-stop |
| Max cycles | Use `/loop` with a finite cron (auto-expires after 3 days) |
| No features left | Planner agent finds nothing to prioritize → increment counter |
| Context exhaustion | Context window approaching limit → suggest restart |

---

## Combining with Other Patterns

| Combination | How |
|-------------|-----|
| **Continuous loop** | `/loop 30m /evolve-loop` — runs every 30 minutes |
| **Sequential pipeline** | Chain `claude -p` calls for each phase instead of interactive |
| **Model routing** | Use `--model opus` for planning, default for implementation |
| **Parallel features** | Run multiple `/evolve-loop` in separate worktrees (advanced) |
| **Verification** | Integrate `/verify` as an additional gate before merge |
| **Continuous Claude** | Use `continuous-claude` for the merge loop, evolve-loop for research |

---

## Anti-Patterns

1. **Proceeding before reviewers finish** — The review barrier exists because late-arriving findings cause rework after merge. Always WAIT for all agents.
2. **Using negative instructions instead of de-sloppify** — Don't say "don't test type systems." Let the TDD agent be thorough, then add a separate cleanup pass. Two focused agents > one constrained agent.
3. **Same context window for author and reviewer** — The reviewer should never be the agent that wrote the code. Use separate Agent calls to eliminate author bias.
4. **No cross-iteration context** — Without `.claude/evolve/notes.md`, each cycle rediscovers the same issues and may re-implement completed features.
5. **No exit condition** — Always set max-cycles, completion signal, or rely on the 3-day cron auto-expiry.
6. **Fixing in the wrong phase** — Fix code issues in Phase 3 (worktree), not Phase 4 (after merge). Cheaper to fix before landing.
7. **Ignoring WARN verdicts** — Track them in `.claude/evolve/notes.md` as tech debt. They accumulate and become blockers.
8. **Retrying the same failure** — If a reviewer or test keeps failing on the same issue, don't just retry. Capture error context and feed it to the next attempt with the specific failure details.
