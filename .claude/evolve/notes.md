# Evolve Notes

## Cycle 2 — 2026-03-11
- **Items:** Backend Security Hardening + Mobile Responsive Layout
- **Type:** Security + UI/UX (first cycle using holistic 8-dimension audit)
- **Security:** CONDITIONAL PASS → PASS after fixes (3 MEDIUM issues fixed: currentCode validation, non-object guard, body limit)
- **Architecture:** WARN → PASS after fixes (breakpoint alignment, FAB touch target, opacity consistency)
- **Tests:** 62 total (10 backend + 52 frontend), all passing
- **Warnings deferred:** Rate limiter needs Redis for multi-instance; no helmet security headers; VITE_API_URL fallback in prod; whitespace-only content passes validation; empty messages array passes to LLM
- **Next cycle should consider:** Gamified Progression System (highest-impact feature gap), Educational Loading Screen, App.tsx decomposition (575 lines), content moderation on backend

## Cycle 3 — 2026-03-11
- **Items:** App.tsx Decomposition + Stability Fixes, Gamified Progression System, Branch Reconciliation
- **Type:** Architecture + Feature + Stability
- **Branch reconciliation:** Merged diverged feature/test-coverage into main (multi-project, i18n, voice, candy UI + security hardening + responsive)
- **Decomposition:** App.tsx 773 → 58 lines. Extracted 7 components: EditorView (282), ChatHeader (144), MessageList (134), MessageInput (70), PreviewPanel (70), BuildingOverlay (69), ConfettiBurst (59). Plus constants.ts (64) and utils/injectErrorCatcher.ts (30).
- **Stability fixes:** Reset confirmation dialog, messagesRef for stale closure, useMemo for injectErrorCatcher, postMessage origin validation, error message truncation (200 chars)
- **Gamification:** 8 achievements (builds, debugs, remixes, explores), 5 unlockable buddy avatars, badge gallery, achievement unlock modal, useAchievements hook with localStorage persistence
- **Security:** PASS after fixes (2 CRITICAL: postMessage origin validation + error truncation for prompt injection)
- **Tests:** 80 total (14 new useAchievements tests + 66 existing), all passing
- **Warnings deferred:** Rate limiter needs Redis; no helmet headers; whitespace validation; empty messages; VITE_API_URL fallback; experimental_useObject not migrated (stable export not available in current @ai-sdk/react version)
- **Next cycle should consider:** Educational Loading Screen, content moderation, helmet security headers, whitespace/empty message validation fixes, App.tsx further decomposition (EditorView still 282 lines)

## Cycle 4 — 2026-03-11
- **Items:** Quick Fixes Bundle (helmet, validation, achievement wiring) + Educational Loading Screen
- **Type:** Stability + Feature
- **Quick fixes:** Added helmet security headers, empty messages array rejection, whitespace-only content validation, wired achievement recordBuild/recordDebug/recordExplore into EditorView
- **Educational Loading Screen:** 18 coding facts in EN/TW/CN, cycling every 4s during code generation wait. BuildingOverlay rewritten with facts prop, fade-in animation, "Did you know?" cards
- **Security:** PASS (no new vulnerabilities found by review agents)
- **Architecture:** PASS (clean prop threading, isolated components)
- **Tests:** 98 total (86 frontend + 12 backend), all passing. 6 new BuildingOverlay tests + 2 new backend validation tests
- **Warnings deferred:** Rate limiter needs Redis for multi-instance; experimental_useObject not migrated; EditorView still 282 lines
- **Next cycle should consider:** Content moderation, EditorView decomposition, template gallery, share/export feature, onboarding tutorial

## Cycle 5 — 2026-03-11
- **Items:** Re-enable Look Inside CodePanel + Backend test script & zh-TW language hint
- **Type:** Feature regression fix + Stability
- **CodePanel:** Re-wired orphaned CodePanel component back into EditorView. Added "Look Inside" button to PreviewPanel with i18n labels (EN/TW/CN). Connected recordRemix achievement when user runs edited code.
- **Backend:** Fixed npm test script (was placeholder echo), added zh-TW Traditional Chinese branch to LLM language hint (was defaulting to English).
- **Security:** PASS (no new attack vectors — CodePanel was already built and tested)
- **Tests:** 98 total (86 frontend + 12 backend), all passing
- **Warnings deferred:** AchievementModal/BadgeGallery a11y (no dialog role, Escape key), no aria-live for streaming, useAudio cloneNode leak, translations.ts typed as any, font @font-face broken, ProjectCatalog delete no confirmation
- **Next cycle should consider:** A11y pass (dialog roles, aria-live, keyboard traps), useAudio memory leak fix, translations type safety, font loading fix, ProjectCatalog delete confirmation

## Cycle 6 — 2026-03-11
- **Items:** TranslationKeys type safety + A11y fixes (modals, streaming, i18n)
- **Type:** Type Safety + Accessibility
- **TranslationKeys:** Replaced `Record<Language, any>` with explicit `TranslationKeys` interface (47 keys). Compile-time checking for all 3 locales.
- **A11y:** Added `role="dialog"`, `aria-modal="true"`, `aria-labelledby` to AchievementModal and BadgeGallery. Added Escape key handlers and auto-focus management. Added `aria-live="polite"` to streaming reply in MessageList.
- **i18n modals:** Replaced 8 hardcoded English strings in AchievementModal and BadgeGallery with translation keys (EN/TW/CN). Fixed ChatHeader badge button aria-label.
- **Security:** PASS (no new vulnerabilities)
- **Architecture:** WARN → PASS after fixes (i18n consistency + tests added)
- **Tests:** 104 total (18 new: 7 AchievementModal + 7 BadgeGallery + 4 MessageList), all passing
- **Warnings deferred:** Focus trap not implemented (Tab can escape modals), useAudio cloneNode leak, font @font-face broken, ProjectCatalog delete no confirmation, EditorView still ~347 lines, flat TranslationKeys may need nesting at ~60+ keys, handleRunCode missing isLoading guard, CodePanel "Look Inside"/"Reset to AI Version"/"Run My Code" hardcoded English
- **Next cycle should consider:** Focus trap for modals, CodePanel i18n, handleRunCode isLoading guard, useAudio memory leak, ProjectCatalog delete confirmation, template gallery

## Cycle 7 — 2026-03-11
- **Items:** Visual Block Editor (Scratch-like logic blocks)
- **Type:** Major Feature (new architecture)
- **Block system:** Replaced monolithic HTML generation with structured Block[] system. Kids see draggable cards instead of raw code. Each block registers with canvas runtime engine (game.* API) and runs in error-isolated IIFE.
- **New files (14):** block.ts types, runtime engine (229 lines), compileBlocks compiler, substituteParams, BlockCard, ParamEditor, BlockEditor (dnd-kit), blockCategories, defaultBlocks, + 5 test files
- **Modified files (15):** llmService.ts (full rewrite for block generation), server.ts (convert-to-blocks endpoint), EditorView.tsx (block panel integration), PreviewPanel.tsx (block count), constants.ts (block schema), useProjects.ts (blocks state), project.ts (blocks field), + tests + docs
- **Security:** PASS after fixes (escapeJsString for block.id injection, sanitizeCss for style breakout, blockId regex validation, rate limiting on convert endpoint)
- **Code Review:** 2 issues found and fixed (legacy project overwrite on mount, conversionSchema using full generationSchema)
- **Tests:** 198 total (186 frontend + 12 backend), all passing
- **Warnings deferred:** 3 stale test mocks still use `code` field instead of `blocks`, setInterval in enemy-spawner example bypasses block-disable, draw loop empty catch, postMessage wildcard origin, hardcoded model name now in 2 places, "Close" button not i18n'd
- **Next cycle should consider:** Wire /api/convert-to-blocks frontend consumer for legacy migration, fix stale test mocks, replace setInterval example with game.onUpdate, i18n block panel strings, extract model name to constant

## Cycle 8 — 2026-03-12
- **Items:** Bundle of 5 quick fixes (stability, performance, UX)
- **Type:** Tech debt cleanup + Bug fixes
- **Fixes applied:**
  - Removed unused `@google/genai` dependency (carried since cycle 3)
  - Extracted Gemini model name to `GEMINI_MODEL` constant with env var override
  - Added Express global error handler `(err, req, res, next)` middleware
  - Added delete confirmation dialog to ProjectCatalog with i18n (EN/TW/CN)
  - Fixed `useAudio` cloneNode memory leak — bounded pool of 4 elements per sound
- **Tests:** 199 total (187 frontend + 12 backend), all passing. 1 new pool cycling test.
- **Code Review:** PR #2 created
- **Warnings deferred:** Schema duplication (frontend/backend), experimental_useObject migration, legacy project auto-conversion, content moderation (deferred to 2026-03-18), no E2E for block editor features, no CSP header, EditorView 436 lines, useVoice any types, prefers-reduced-motion missing
- **Next cycle should consider:** Schema deduplication or shared types, wire legacy auto-conversion, content moderation (after 03-18), E2E tests for block editor, migrate experimental_useObject

## Cycle 9 — 2026-03-12
- **Items:** A11y + type safety + legacy auto-conversion + dead code removal
- **Type:** Accessibility + Type Safety + Feature + Cleanup
- **A11y:** Added prefers-reduced-motion media query (disables all animations/transitions)
- **Type safety:** Replaced all 6 `any` types in useVoice.ts with proper SpeechRecognition interfaces
- **Legacy auto-conversion:** Wired /api/convert-to-blocks into EditorView — detects legacy projects on mount, calls API, parses JSON response, validates block schema, sets blocks + compiles. Shows converting overlay with i18n text.
- **Backend fixes:** Global error handler middleware, API key startup validation, convert endpoint returns plain JSON (not streaming), invalid language warning log
- **Dead code removal:** Deleted CodePanel.tsx + CodePanel.test.tsx (superseded by BlockEditor)
- **i18n:** Added confirm_delete, block_panel_close, converting_blocks keys in all 3 locales
- **Security review:** 1 HIGH fixed (block schema validation added), 1 pre-existing MEDIUM noted (postMessage origin)
- **Code review:** 2 HIGH fixed (streaming→JSON parse, missing zh-TW/zh-CN i18n keys)
- **Tests:** 187 total (175 frontend + 12 backend), all passing
- **Warnings deferred:** postMessage wildcard origin (pre-existing), schema duplication frontend/backend, focus trap not implemented, experimental_useObject migration, backend tsconfig missing test types
- **Next cycle should consider:** Schema deduplication, E2E tests for block editor, content moderation (after 03-18), focus trap for modals, onboarding tutorial, template gallery
