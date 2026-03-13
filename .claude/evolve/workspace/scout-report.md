# Scout Report — Cycle 18

## Discovery Summary

- **Scan mode:** Incremental (cycles 1-17 completed, reading notes.md + changed files)
- **Files analyzed:** 12 (notes.md, TASKS.md, PRD.md, state.json, achievements.ts, useAchievements.ts, EditorView.tsx [header only], hooks/ and components/ listings)
- **Research:** Performed — one new search on kid engagement/retention in coding games (2025-2026)
- **Instincts applied:** 4 (from instincts/personal)
- **Goal:** "Exploring new features to add to the game that kids will love"

### What's Already Built (17 cycles)
Core: chat + streaming + block editor + multi-project + i18n (EN/zh-TW/zh-CN) + voice input + HTML export. Gamification: 8 achievements, 5 unlockable buddy avatars (dog/cat/dragon/robot/unicorn), badge gallery, educational loading screen with 18 coding facts. Visual delight: confetti, animations, sound effects, hacker mode. Stability: security hardening, debounced saves, achievement queue, fetch timeout, 323 tests passing at 80%+ coverage.

### What's Missing vs. Competitors (gap analysis from TASKS.md + PRD.md)
- No **onboarding/first-run tutorial** — block panel, voice input, play mode are completely undiscoverable
- No **expressive buddy emotions** — buddy only bounces or wobbles; no "proud" on success, "worried" on error, "curious" when asking questions (CHI 2025 research cites expressive mascots as top engagement driver)
- No **template gallery** — kids start from scratch or blank canvas; Codorex, Roblox Studio, and Tynker all offer starter templates that lower barrier and drive first-session success
- No **publish/share link** — export as HTML file exists but no "show a friend" shareable URL (Rosebud's biggest community flywheel)
- No **daily/streak mechanic** — nothing that rewards kids for returning the next day
- No **"My Games" portfolio thumbnail gallery** — projects exist but no visual showcase, no sense of ownership pride

---

## Research Findings

**Query:** "most engaging features kids coding games 2025 2026 retention what makes kids come back scratch roblox"

Key findings from Pinecone Academy, Tynker, EdTech Impact, create-learn.us:

1. **Immediate visual feedback** — every action must produce visible change; delay kills engagement (already strong in Inspiror)
2. **Gamification and reward loops** — achievements + incremental unlocks drive return visits; but generic badges ("5 builds") are weaker than narrative-tied rewards ("You unlocked Dragon Buddy!")
3. **Creative freedom with a prompt** — starter templates that kids can immediately personalize beat blank-canvas every time; Scratch templates and Roblox starter packs are cited as top retention hooks
4. **Social and competitive elements** — "show a friend" and community galleries are the #1 reason kids return to Scratch (7M+ active users), Roblox, and Tynker after initial session
5. **Progressive difficulty** — content that grows with the child; Inspiror currently has no progression path beyond unlocking avatars at fixed build counts
6. **Expressive characters** — mascots that react emotionally (Duolingo Owl's streak panic, Tamagotchi urgency) keep kids invested in the character's "feelings" and feel guilty leaving
7. **Surprise/delight moments** — unexpected unlocks, Easter eggs, and "wow" moments that kids want to share

**Source ranking for Inspiror:**
- Highest-ROI gaps: expressive buddy emotions, starter templates, first-run onboarding
- Already covered: immediate feedback, confetti, sound, achievements, streaming hacker mode

Sources consulted:
- https://pinecone.academy/blog/5-fun-coding-games-that-will-keep-your-kids-engaged-in-2025
- https://www.tynker.com/blog/top-coding-games-for-kids/
- https://www.create-learn.us/blog/coding-apps-for-kids/

---

## Proposed Tasks (ordered by impact)

### Task 1: Expressive Buddy Emotions
- **Slug:** expressive-buddy-emotions
- **Type:** Feature
- **Complexity:** S
- **Why kids will love it:** The Builder Buddy currently only bounces (idle) or wobbles (thinking). Adding "proud" (wiggle + star sparkle on successful build), "worried" (shake + sweat drop on error), and "curious" (head-tilt + question mark pulse when asking scaffolding questions) makes the buddy feel alive and emotionally connected. CHI 2025 research shows expressive mascots significantly improve engagement and session length. Kids feel like the buddy *cares* about their project — which drives return visits. This is the same mechanic that makes Duolingo's owl one of the most recognized retention drivers in edtech.
- **Implementation approach:**
  - Add three new CSS keyframe animations in `index.css`: `buddy-proud` (quick double-bounce + scale pulse), `buddy-worried` (rapid left-right shake), `buddy-curious` (gentle 15deg tilt oscillation)
  - Extend the `BuildingOverlay` / `ChatHeader` buddy avatar to accept an `emotion` prop: `"idle" | "thinking" | "proud" | "worried" | "curious"`
  - Wire `"proud"` to the `onFinish` completion event in `EditorView` (where confetti fires), auto-revert to `"idle"` after 2.5s
  - Wire `"worried"` to `useAutoFix`'s error detection event, auto-revert after 2s
  - Wire `"curious"` to assistant messages that end with `?` (scaffolding questions from the LLM)
  - Add emotion-state overlay badges (tiny floating emoji: ⭐ for proud, 💦 for worried, ❓ for curious) using absolute-positioned span tags — `prefers-reduced-motion` guard already in place via existing media query
- **Acceptance Criteria:**
  - [ ] Buddy displays the `buddy-proud` animation class for 2.5s after each successful build (confetti moment)
  - [ ] Buddy displays the `buddy-worried` animation class when an auto-fix error is detected
  - [ ] Buddy displays the `buddy-curious` animation class when the last assistant message ends with `?`
  - [ ] All three animations are wrapped in `@media (prefers-reduced-motion: no-preference)` (existing pattern)
  - [ ] `emotion` prop is typed and defaults to `"idle"` — no TypeScript `any`
  - [ ] Unit tests for emotion state transitions in ChatHeader or a new `BuddyAvatar` component (Vitest, 80%+ coverage maintained)
- **Files to modify:**
  - `frontend/src/index.css` — add 3 keyframe animations
  - `frontend/src/components/ChatHeader.tsx` — add `emotion` prop + conditional class application
  - `frontend/src/components/EditorView.tsx` — wire emotion state, add `buddyEmotion` state variable
  - `frontend/src/hooks/useAutoFix.ts` — expose error event callback for worried state
- **Eval:** written to `evals/expressive-buddy-emotions.md`

### Task 2: Starter Template Gallery
- **Slug:** starter-template-gallery
- **Type:** Feature
- **Complexity:** M
- **Why kids will love it:** The biggest drop-off in any creative tool is the blank-canvas moment. Kids who don't know what to build leave. A gallery of 6-8 vivid, named starter templates ("Catch the Star", "Draw & Erase", "Bouncing Emoji", "Quiz Wizard", "Whack-a-Mole", "Neon Clock") gives kids an immediate win: pick a template, see it running instantly, then tell the Buddy what to change. This is exactly how Roblox Studio starter packs and Scratch's "Explore" section drive first-session success. The template gallery sits on the ProjectCatalog screen as a second tab or row, making it the first thing new users see. Each template is a pre-built `Block[]` array (same format as existing `DEFAULT_BLOCKS`) — no new backend endpoint needed.
- **Implementation approach:**
  - Create `frontend/src/constants/starterTemplates.ts` with 6 template objects: `{ id, title, emoji, description, blocks: Block[] }`. Each template's blocks array is a hand-crafted valid `BlockDefinition[]` using the existing block schema (same as `defaultBlocks.ts` pattern).
  - Add a "Start from a Template" section to `ProjectCatalog.tsx` — a horizontally scrollable row of 6 template cards above the "My Projects" grid. Each card shows a large emoji, template name, and one-line description.
  - On template card click: call `createProject()` from `useProjects`, then immediately call `updateProject()` to set the template's `blocks` array, then navigate to the editor. The editor loads with the template's compiled code already visible in the iframe.
  - Add i18n keys for template names + descriptions in all 3 locales (EN/zh-TW/zh-CN) using existing `translations.ts` pattern.
  - Templates are pure frontend constants — no network request, instant load.
- **Acceptance Criteria:**
  - [ ] At least 6 starter templates are defined in `starterTemplates.ts` with valid `Block[]` arrays that compile without error
  - [ ] Template section renders on `ProjectCatalog` screen with emoji, name, and description per card
  - [ ] Clicking a template card creates a new project, sets blocks, and navigates to the editor with preview visible immediately
  - [ ] Template names and descriptions are translated in all 3 locales
  - [ ] Unit tests: at least 6 tests covering template rendering, click navigation, project creation, and i18n key presence
  - [ ] No TypeScript `any` types in new code
  - [ ] Frontend test suite still passes at 80%+ coverage
- **Files to modify/create:**
  - `frontend/src/constants/starterTemplates.ts` — new file
  - `frontend/src/components/ProjectCatalog.tsx` — add template section
  - `frontend/src/i18n/translations.ts` — add template i18n keys
  - `frontend/src/components/ProjectCatalog.test.tsx` — new test file (or add to existing)
- **Eval:** written to `evals/starter-template-gallery.md`

### Task 3: First-Run Onboarding Tooltips
- **Slug:** first-run-onboarding
- **Type:** Feature
- **Complexity:** S
- **Why kids will love it:** The block panel, voice input button, play mode toggle, and badge gallery are completely undiscoverable. A first-time kid lands in the editor and sees a chat interface — they don't know there's a whole block editor, they can speak to the buddy, or they can go full-screen play mode. Three focused tooltip popovers (one per undiscovered feature, shown sequentially on first launch, dismissible, never shown again) guide kids to the "wow" moments fast. Research shows that reducing time-to-delight is the #1 predictor of retention in kids' apps. This is also the single item most consistently flagged across TASKS.md audit cycles 8, 9, 13, 16, and 17 as a HIGH-priority gap.
- **Implementation approach:**
  - Create a `useOnboarding` hook that reads/writes a `inspiror-onboarding-v1` localStorage key. State: `{ step: 0 | 1 | 2 | 3 }` where 0 = not started, 1-3 = tooltip steps, 3 = done. Hook exposes `currentStep`, `advanceStep()`, `skipAll()`.
  - Three tooltip steps: (1) Block Editor — points to the blocks toggle button with "Try building with colorful blocks!" message; (2) Voice Input — points to the mic button with "You can talk to your Buddy!"; (3) Play Mode — points to the Play toggle with "Hide the chat and play your game full screen!".
  - Render tooltips as absolutely-positioned `<div>` overlays with a pulsing arrow pointer, dismiss button ("Got it!"), and skip-all link ("Skip tour"). Dark semi-transparent backdrop not needed — lightweight non-blocking style.
  - Only trigger onboarding on the first project open (check `step === 0` on `EditorView` mount).
  - Add i18n keys for all tooltip strings in all 3 locales.
  - `prefers-reduced-motion` guard: skip the pulsing animation but still show the tooltip text.
- **Acceptance Criteria:**
  - [ ] Three tooltip steps appear sequentially on first editor open for a new user
  - [ ] Tooltips are positioned near their target UI element (blocks button, mic button, play toggle)
  - [ ] "Got it!" advances to the next step; step 3 "Got it!" sets done and never shows again
  - [ ] "Skip tour" sets done immediately and never shows again (localStorage persisted)
  - [ ] Onboarding does NOT show on subsequent project opens (localStorage flag respected)
  - [ ] All tooltip strings exist in EN, zh-TW, and zh-CN translations
  - [ ] Unit tests for `useOnboarding`: initial state, advanceStep, skipAll, persistence across mount
  - [ ] Frontend test suite still passes at 80%+ coverage
- **Files to modify/create:**
  - `frontend/src/hooks/useOnboarding.ts` — new hook
  - `frontend/src/hooks/useOnboarding.test.ts` — new tests
  - `frontend/src/components/EditorView.tsx` — mount useOnboarding, render tooltip overlay
  - `frontend/src/i18n/translations.ts` — add onboarding i18n keys
- **Eval:** written to `evals/first-run-onboarding.md`

---

## Deferred

- **Publish/share link:** HIGH impact for social virality, but requires a backend storage solution (database + URL shortener). Too large for a single Builder pass and requires infrastructure decisions outside frontend scope. Revisit when backend is extended.
- **Daily streak / return-visit mechanic:** Meaningful but requires designing the full UX loop (streak counter, broken-streak recovery, push notification consent). Medium complexity with high design risk — would benefit from user research first.
- **Content moderation:** Deferred until 2026-03-18 per state.json. Do not pick up before that date.
- **EditorView further decomposition (404 lines):** Worthwhile tech debt but not kid-facing — doesn't advance the engagement goal.
- **Focus trap for modals:** A11y debt, not engagement. Still important but lower priority vs. delight features.

---

## Ledger Entry

```json
{"ts":"2026-03-13T10:15:00Z","cycle":18,"role":"scout","type":"discovery","data":{"scanMode":"incremental","filesAnalyzed":12,"researchPerformed":true,"tasksSelected":3,"instinctsApplied":4}}
```
