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

## Cycle 10 — 2026-03-12
- **Items:** Collision callback leak fix + stale test mock migration
- **Type:** Bug fix + Test integrity
- **Collision leak:** `game.off(blockId)` now filters `collisionCallbacks` array, preventing unbounded accumulation of stale collision handlers. Without this fix, disabled/re-registered blocks would have their collision callbacks checked every frame indefinitely.
- **Stale mocks:** Updated 5 test mock return values from deprecated `{ code: "<html>..." }` to `{ blocks: [...] }` matching the actual `generationSchema`. Tests now exercise the real block-compilation path.
- **experimental_useObject:** Checked — stable `useObject` export not yet available in installed `@ai-sdk/react`. Deferred to revisit after 2026-04-01.
- **Security:** PASS (no issues)
- **Code Review:** PASS (1 MEDIUM fixed: confetti timer mocks missing `blocks: []`)
- **Tests:** 188 total (176 frontend + 12 backend), all passing
- **Warnings deferred:** postMessage wildcard origin, schema duplication, focus trap, EditorView 489 lines, window.confirm usage, i18n gaps (hardcoded English strings), bundle splitting, game.playSound stub, English-only chips
- **Next cycle should consider:** Focus trap for modals (WCAG), i18n remaining hardcoded strings, EditorView decomposition (extract useAutoFix + useLegacyConversion hooks), schema deduplication, E2E block editor tests

## Cycle 11 — 2026-03-13
- **Task:** useVoice.ts Test Coverage + Backend /api/convert-to-blocks Tests
- **Type:** Test coverage (stability)
- **Coverage:** useVoice.ts: 39% → 98.41% statements, 97.05% branches. Backend overall: 69.44% → 86.27% statements, 83.05% branches.
- **Review:** WARN (1 HIGH: vacuous assertion in synthRef test, 2 MEDIUM: language default not verified in mock args, imprecise mock event shape)
- **E2E:** PASS (all acceptance criteria met)
- **Security:** PASS (no issues, 0 npm vulnerabilities)
- **Eval:** PASS (13/13 checks)
- **Research:** COPPA 2025 compliance deadline April 22 2026 (CRITICAL), Azure/OpenAI content moderation tools, dnd-kit maintenance risk, block-based coding best practices, PWA opportunity
- **Deploy:** SUCCESS (commit 3ea6304, merged to main)
- **Instincts extracted:** 1 (speech-api-mocking: use function declarations not arrows for constructor mocks)
- **Operator:** READY → CONTINUE → pending post-cycle
- **Next cycle should consider:** Content moderation (deferred to 2026-03-18), suggestion chip i18n, block deletion UX, focus trap, EditorView decomposition, schema deduplication, COPPA compliance audit

## Cycle 12 — 2026-03-13
- **Task:** i18n Bug Fixes + Block Deletion
- **Type:** Bug fix (i18n) + Feature (usability)
- **i18n fixes:** Removed dead English fallback from confirm_reset, removed English-only greeting detection heuristic (now structural check only)
- **Block deletion:** Added Trash2 delete button to BlockCard with onDelete prop, handleDelete in BlockEditor with filter + reindex pattern, instant delete (no confirmation, Scratch model)
- **Coverage:** 7 new tests (4 BlockCard delete + 3 BlockEditor delete)
- **Review:** WARN (1 MEDIUM: handleDelete uses `blocks` not `sortedBlocks` — non-blocking, low practical risk)
- **E2E:** PASS (all acceptance criteria met)
- **Security:** PASS (0 vulnerabilities)
- **Eval:** PASS (10/10 checks)
- **Research:** Suggestion chip i18n patterns (Scratch uses react-intl + Transifex, static JSON vs LLM-generated)
- **Deploy:** SUCCESS (commit ef15200, merged to main)
- **Instincts extracted:** 1 (structural-detection-over-content: prefer structural checks over content matching for locale safety)
- **Tests:** 232 total (213 frontend + 19 backend), all passing
- **Next cycle should consider:** Content moderation (deferred deadline 2026-03-18 approaching), suggestion chip i18n, game.playSound no-op fix, focus trap for modals, handleDelete sortedBlocks fix, EditorView decomposition, schema deduplication

## Cycle 13 — 2026-03-13
- **Tasks:** Block Panel i18n, Suggestion Chip i18n, EditorView Hook Extraction
- **Audit:** PASS (all 3 tasks)
- **Eval:** 3/3 passed
- **Shipped:** YES (3 commits: 8dc84ff, e506860, a063922)
- **Instincts:** 2 extracted (optional-t-prop-with-fallback, ref-sync-for-extracted-hooks)
- **Details:**
  - Block Panel i18n: Added 7 translation keys (block_panel_title, block_enable/disable, block_expand/collapse_params, param_on/off) to all 3 locales. Optional `t` prop with English fallbacks.
  - Suggestion Chip i18n: Added 40 zh-TW + 40 zh-CN translated suggestion chips. getSuggestions(language) helper, pickRandomChips(language) wire-up in EditorView + MessageList.
  - Hook Extraction: Extracted useAutoFix (135 lines, 8 tests) and useLegacyConversion (80 lines, 7 tests) from EditorView. Reduced EditorView from 486 → 404 lines.
- **Tests:** 249+ frontend + 19 backend, all passing
- **Next cycle should consider:** Content moderation (deferred to 2026-03-18), EditorView further decomposition (404 → target 360), schema deduplication, focus trap for modals, game.playSound stub

## Cycle 14 — 2026-03-13
- **Tasks:** Security hardening (eval removal + postMessage origin + script sanitization) + i18n regressions (Blocks label, More ideas) + zh-CN auto-rename bug
- **Type:** Security + i18n + Bug fix
- **Security fixes:**
  - Replaced `eval()` in self-verification checks with allowlisted function closures (7 safe patterns: game.getEntity, game.get, game.allEntities, typeof checks)
  - Tightened operator regex from `[><=!]+` to explicit `(?:===|!==|==|!=|>=|<=|>|<)`
  - Changed `postMessage("*")` → `window.location.origin` in compileBlocks.ts, engine.ts, injectErrorCatcher.ts
  - Added `sanitizeScript()` for `</script>` breakout prevention in block code and check expressions
- **i18n fixes:** Added `blocks_count` and `more_ideas` translation keys for all 3 locales. Made `moreIdeasText` required prop.
- **Bug fix:** Added zh-CN `"未命名项目"` to auto-rename conditions in useProjects.ts
- **Security review:** PASS (no CRITICAL/HIGH issues remaining)
- **Code review:** 1 CRITICAL fixed (check expressions needed sanitizeScript), 2 HIGH addressed (operator regex + moreIdeasText prop)
- **Tests:** 258 frontend + 19 backend = 277 total, all passing
- **Deploy:** SUCCESS (commit 1f9b8a5, merged to main, pushed)
- **Next cycle should consider:** Content moderation (deferred to 2026-03-18), useProjects.test.ts, project export/share feature, auto-fix error context i18n

## Cycle 15 — 2026-03-13
- **Tasks:** Stability bundle (fetch timeout + achievement queue + save debounce)
- **Type:** Stability + Performance
- **Fixes:**
  - Added 15s AbortController timeout on legacy conversion fetch (prevents indefinite isConverting hang)
  - Fixed achievement unlock race condition: replaced single `justUnlocked` with a queue (`pendingUnlocksRef`), `dismissUnlock` now shows next queued achievement
  - Debounced localStorage writes for currentCode+blocks by 300ms (prevents 30-60 writes/sec during LLM streaming, fixes Safari iOS jank)
- **Security:** No new issues
- **Tests:** 258 frontend + 19 backend = 277 total, all passing. Updated 1 test (`waitFor` for debounced save).
- **Deploy:** SUCCESS (commit 9762f47, merged to main, pushed)
- **Next cycle should consider:** Content moderation (deferred to 2026-03-18), useProjects.test.ts, project export/share feature, auto-fix error context i18n, schema deduplication

## Cycle 16 — 2026-03-13
- **Tasks:** HTML export button + localStorage safety (safeSave + saveError banner)
- **Type:** Feature + Stability
- **Export:** Added download button to PreviewPanel (candy green, bottom-left) that exports project as self-contained .html file. sanitizeFilename handles CJK, special chars, consecutive hyphens, truncation.
- **Storage safety:** Created safeSave() utility wrapping localStorage.setItem in try/catch. Replaced all bare setItem calls in useProjects and useAchievements. useProjects exposes saveError state. App.tsx renders persistent red alert banner with role="alert" when storage is full.
- **Review fixes:** Replaced .shift() array mutation with destructuring in useAchievements (immutability rule). Added consecutive hyphen collapse. Removed duplicated fallback string.
- **Security:** PASS (no CRITICAL/HIGH issues — download of LLM-generated HTML is intentional)
- **Code Review:** 2 HIGH fixed (saveError UI wiring, immutability violation), 3 MEDIUM addressed
- **Tests:** 270 frontend + 19 backend = 289 total, all passing. 12 new tests.
- **Deploy:** SUCCESS (commit b01825c, merged to main, pushed)
- **Next cycle should consider:** useProjects unit tests (still zero coverage on critical hook), Vitest coverage thresholds, onboarding/first-run tutorial, focus trap for modals, schema deduplication, EditorView further decomposition

## Cycle 17 — 2026-03-13
- **Tasks:** useProjects unit tests (34 tests) + Vitest coverage thresholds (80%)
- **Type:** Test coverage + CI enforcement
- **Coverage:** useProjects.ts went from 0% → 97%+ statement coverage. 34 tests covering: initial state (4), legacy migration (5), createProject (2), openProject (2), deleteProject (3), goToCatalog (1), updateProject (6), updateCurrentProject (2), extractTitle edges (2), migrateRawMessages edges (1), resetCurrentProject (1), saveError (3), DEFAULT_CODE (2).
- **Thresholds:** Vitest coverage thresholds enforced at 80% for branches/functions/lines/statements. Prevents future coverage regression.
- **Review fixes:** Added afterEach localStorage mock cleanup (was leaking across tests), added updateCurrentProject tests (both active + no-op paths), added edge case tests for extractTitle, migrateRawMessages, openProject non-existent ID, saveError null-ID path.
- **Security:** PASS (no issues)
- **Tests:** 304 frontend + 19 backend = 323 total, all passing
- **Deploy:** SUCCESS (commit 2ee5379, merged to main, pushed)
- **Next cycle should consider:** Content moderation (deferred deadline 2026-03-18 approaching), onboarding/first-run tutorial, focus trap for modals, schema deduplication, EditorView further decomposition (404 lines), template gallery

## Cycle 18 — 2026-03-13
- **Goal:** Exploring new features kids will love
- **Tasks:** Expressive Buddy Emotions + Starter Template Gallery
- **Type:** Feature (kid engagement)
- **Buddy Emotions:** 3 new CSS keyframe animations (proud/worried/curious) wired to build success, auto-fix errors, and LLM questions. Overlay emojis (⭐💦❓). Auto-revert timers. prefers-reduced-motion guarded. BuddyEmotion type exported from ChatHeader.
- **Template Gallery:** 6 starter templates (Catch the Star, Bouncing Emoji, Color Mixer, Counting Game, Magic Wand, Emoji Rain) as Block[] arrays on ProjectCatalog. Horizontally scrollable candy-neubrutalism cards. Click creates project with template blocks + compiled preview. i18n in all 3 locales.
- **Audit fixes:** Added emotionTimerRef cleanup useEffect on unmount (MEDIUM), added eslint-disable rationale comment (LOW).
- **Security:** PASS (both tasks — template blocks are static, sanitizeScript applied by compiler)
- **Tests:** 343 frontend + 19 backend = 362 total, all passing. 39 new tests (12 ChatHeader + 3 useAutoFix + 11 starterTemplates + 14 ProjectCatalog).
- **Deploy:** SUCCESS (commits fdeb33d + 0d48da8, merged to main, pushed)
- **Next cycle should consider:** First-run onboarding tooltips (most deferred HIGH item), daily streak/return mechanic, content moderation (after 2026-03-18), publish/share link, focus trap for modals

## Cycle 19 — 2026-03-13
- **Tasks:** Focus trap for modals (WCAG 2.1) + First-run onboarding tooltips
- **Type:** Accessibility + Feature (Day-1 retention)
- **Focus trap:** New `useFocusTrap` hook traps Tab/Shift+Tab within modal dialogs. Wired into AchievementModal and BadgeGallery. Closes WCAG 2.1 SC 2.1.2 violation (5 cycles overdue).
- **Onboarding:** 3-step tooltip tour (suggestion chips → voice input → block panel). `useOnboarding` hook with localStorage persistence. `OnboardingTooltip` component with positioned arrows, Escape dismiss, ARIA dialog role, auto-focus. i18n in EN/zh-TW/zh-CN (8 keys).
- **Review fixes:** Removed dead `arrowSide:"left"` branch, unused `onboarding_step_of` key, exported `TOTAL_STEPS` as shared constant, added Escape handler + ARIA + focus management to tooltip.
- **Security:** PASS (0 CRITICAL, 0 HIGH — no user input, static content only)
- **Architecture:** WARN (step count duplication fixed, EditorView 477 lines pre-existing)
- **Tests:** 365 frontend + 19 backend = 384 total, all passing. 22 new tests (6 useFocusTrap + 8 useOnboarding + 8 OnboardingTooltip).
- **Deploy:** SUCCESS (commit 30e9595, pushed to main)
- **Next cycle should consider:** WCAG contrast audit (candy-green #39ff14), publish/share feature, content moderation (after 2026-03-18), EditorView decomposition (477 lines), schema deduplication, daily streak mechanic

## Cycle 20 — 2026-03-13
- **Tasks:** EditorView decomposition (extract 3 hooks)
- **Type:** Code quality / Maintainability
- **Hooks extracted:** `useBuddyEmotion` (curious detection + timed triggers), `useCompileBlocks` (debounced compilation with legacy skip), `usePersistProject` (immediate message save + debounced code/blocks save)
- **Impact:** EditorView.tsx reduced from 477 → 419 lines. Each hook independently testable with clear single responsibility.
- **Schema dedup deferred:** Backend uses CJS with hand-compiled .js files, no build pipeline — cross-package Zod imports impractical until backend gets proper tooling.
- **Security:** PASS (pure refactoring, no new surface area)
- **Tests:** 381 frontend + 19 backend = 400 total, all passing. 16 new tests (7+5+4).
- **Deploy:** SUCCESS (commit 00f5ac2, pushed to main)
- **Next cycle should consider:** Publish/share feature, content moderation (after 2026-03-18), daily streak mechanic, keyboard shortcuts, progressive difficulty/surprise unlocks

## Cycle 21 — 2026-03-13
- **Tasks:** Replace window.confirm with custom ConfirmDialog
- **Type:** UI/UX polish + Accessibility + i18n
- **ConfirmDialog:** Candy-neubrutalism styled dialog with focus trap, Escape dismiss, scrim click cancel, auto-focus on cancel (safe default for destructive actions). ARIA dialog role + aria-modal. i18n confirm/cancel labels in EN/zh-TW/zh-CN.
- **Removed:** All `window.confirm` calls (2 call sites: reset + delete). Zero occurrences remaining.
- **Security:** PASS (no new surface area, static UI component)
- **Tests:** 390 frontend + 19 backend = 409 total. 9 new ConfirmDialog tests, 2 existing tests updated.
- **Deploy:** SUCCESS (commit c6f5b19, pushed to main)
- **Next cycle should consider:** Publish/share feature (L), daily streak mechanic, keyboard shortcuts, progressive difficulty/surprise unlocks

## Cycle 22 — 2026-03-13
- **Tasks:** Web Share API + Copy HTML to clipboard
- **Type:** Feature (sharing/engagement)
- **Share button:** Uses navigator.share() with file attachment (mobile). Falls back to text-only share when canShare rejects files. Hidden on browsers without Web Share API support.
- **Copy HTML button:** Copies currentCode to clipboard via navigator.clipboard.writeText(). Shows "Copied!" feedback with checkmark icon for 2s.
- **Utilities:** New shareHtml.ts with canWebShare(), shareProject(), copyHtmlToClipboard(). AbortError (user cancel) silently caught.
- **i18n:** 5 new keys in EN/zh-TW/zh-CN (share_project, aria_share, copy_html, aria_copy_html, copied_feedback)
- **Security:** PASS (no user input, browser-native APIs only)
- **Tests:** 400 frontend + 19 backend = 419 total. 10 new tests.
- **Deploy:** SUCCESS (commit 18e491b, pushed to main)
- **Next cycle should consider:** Daily streak mechanic, keyboard shortcuts, progressive difficulty/surprise unlocks, dark mode, PWA offline support

## Cycle 23 — 2026-03-13
- **Tasks:** Daily streak mechanic
- **Type:** Feature (retention/engagement)
- **Streak hook:** useStreak tracks consecutive visit days in localStorage. Increments on consecutive days, resets after 1+ day gap, no-op on same day.
- **Badge UI:** 🔥 N day streak! badge rendered on ProjectCatalog header for streaks >= 2. Candy-neubrutalism chip style.
- **i18n:** streak_days key in EN/zh-TW/zh-CN
- **Keyboard shortcuts deferred:** Enter-to-send already exists. Ctrl+Enter redundant. Deferred to future cycle if users request it.
- **Security:** PASS (localStorage only, no PII)
- **Tests:** 406 frontend + 19 backend = 425 total. 6 new tests.
- **Deploy:** SUCCESS (commit 947ae5c, pushed to main)
- **Next cycle should consider:** Progressive difficulty/surprise unlocks, dark mode, PWA offline, block categories/colors, error boundary improvements

## Cycle 24 — 2026-03-13
- **Tasks:** Hidden surprise achievements (mystery badges)
- **Type:** Feature (gamification/engagement)
- **Block categories/colors:** Skipped — already implemented in Cycle 7 (BlockCard has color bands, 10 categories with distinct colors)
- **Surprise achievements:** 3 new hidden achievements (Remix Master, Explorer Pro, Bug Hunter) with hidden? field on Achievement interface. BadgeGallery shows locked hidden achievements as ❓/??? with "Keep playing to discover!" text. Reveals actual icon/title/description once earned.
- **Security:** PASS (static data, no user input)
- **Tests:** 408 frontend + 19 backend = 427 total. 2 new tests.
- **Deploy:** SUCCESS (commit a6accfb, pushed to main)
- **Next cycle should consider:** Dark mode, PWA offline, error boundary, Escape key close for block panel, project renaming UX

## Cycle 25 — 2026-03-13
- **Tasks:** ErrorBoundary component + Escape key close for block panel
- **Type:** Stability + UX polish
- **ErrorBoundary:** Class component wrapping entire App in main.tsx. Kid-friendly crash UI with emoji, reassuring text ("your projects are saved"), and reload button. Candy-neubrutalism styled.
- **Escape key:** useEffect in EditorView closes block panel on Escape keydown when panel is open. Listener cleaned up when panel closes.
- **Security:** PASS (no user input, no data flow)
- **Tests:** 412 frontend (4 new ErrorBoundary tests). All pass.
- **Deploy:** SUCCESS (commit f518958, pushed to main)
- **Next cycle should consider:** Dark mode, PWA offline, project renaming UX, content moderation (after 2026-03-18), keyboard shortcuts panel

## Cycle 26 — 2026-03-13
- **Tasks:** Self-host Comic Neue font + active streak updates on build
- **Type:** Bug fix + Privacy/COPPA + Engagement fix
- **Font fix:** Replaced broken Google Fonts @font-face (was pointing to CSS URL, not font file) with self-hosted TTF files in public/fonts/. Eliminates external request to Google (COPPA privacy concern for kids app). Font now actually loads correctly.
- **Streak fix:** Added recordActivity() callback to useStreak hook. Previously streak only computed on mount — if a child kept a tab open overnight and built the next day, streak wouldn't update. Now wired to build events via onBuild prop in EditorView → App.tsx.
- **Security:** PASS (removed external data collection, no new attack surface)
- **Tests:** 414 frontend (2 new streak tests). All pass.
- **Deploy:** SUCCESS (commit 60c702e, pushed to main)
- **Next cycle should consider:** Dark mode, PWA offline, project renaming, Gemini model validation at startup, schema dedup (frontend/backend)

## Cycle 27 — 2026-03-13
- **Tasks:** Inline project rename + Gemini model startup log
- **Type:** Feature (UX) + Stability
- **Rename:** Double-click or pencil icon on project cards triggers inline rename input. Enter/blur commits, Escape cancels. Wired through onRename prop → updateProject. i18n for aria label in all 3 locales.
- **Model log:** Backend logs configured Gemini model at startup for visibility/debugging.
- **Security:** PASS (rename is local state only, maxLength=60 on input)
- **Tests:** 415 frontend (1 new rename test). All pass.
- **Deploy:** SUCCESS (commit 16571d6, pushed to main)
- **Next cycle should consider:** Dark mode, PWA offline, schema dedup, hardcoded strings i18n, PreviewPanel/MessageInput tests

## Cycle 28 — 2026-03-13
- **Tasks:** i18n project count strings + PWA manifest with app icon
- **Type:** i18n fix + PWA foundation
- **i18n fix:** Replaced hardcoded "project"/"projects"/"waiting for you!"/"正在等著你！" with proper TranslationKeys (project_count_one, project_count_many, projects_waiting). zh-CN now shows correct text instead of zh-TW.
- **PWA:** Added manifest.json with app metadata, SVG icon, theme-color meta, description meta, apple-touch-icon link. Enables install prompt on mobile and home screen icon.
- **Security:** PASS (static assets only)
- **Tests:** 415 frontend. All pass.
- **Deploy:** SUCCESS (commit 3afd050, pushed to main)
- **Next cycle should consider:** Service worker for offline, dark mode, schema dedup, Builder Buddy i18n, PreviewPanel tests

## Cycle 29 — 2026-03-13
- **Tasks:** i18n Builder Buddy name in ChatHeader
- **Type:** i18n fix
- **Fix:** Replaced hardcoded "Builder Buddy" string in ChatHeader.tsx with t.buddy_name. Added buddy_name key to all 3 locales: EN "Builder Buddy", zh-TW "小幫手", zh-CN "小帮手". Previously zh-TW/zh-CN users saw English text in the header.
- **Security:** PASS (static string replacement only)
- **Tests:** 415 frontend. All pass.
- **Deploy:** SUCCESS (commit ea6a4d0, pushed to main)
- **Next cycle should consider:** Service worker for offline caching, dark mode, schema dedup (frontend/backend Zod schemas), PreviewPanel/MessageInput unit tests, content moderation (after 2026-03-18)

## Cycle 30 — 2026-03-13
- **Tasks:** PreviewPanel + ProjectCatalog unit tests (59 tests) + Service Worker PWA + pre-existing TS fixes
- **Type:** Test coverage + Feature (PWA) + Tech debt
- **Test coverage:** PreviewPanel 50% → 91.66% stmts, ProjectCatalog 72% → 100% stmts. 25 PreviewPanel tests (download/share/copy/loading/chat visibility/block count/overlay). 34 ProjectCatalog tests (CRUD/delete flow/rename/streak/language/templates/sorting/timeAgo/empty state).
- **PWA:** Added vite-plugin-pwa with Workbox. Service worker precaches app shell (12 entries, 654KB). NetworkFirst for API with 10s timeout. Kid-friendly update banner. Manifest generated by plugin (removed manual manifest.json).
- **TS fixes:** Fixed 20+ pre-existing type errors: missing buddy_name in ChatHeader tests, wrong "en" literals (→ "en-US"), incorrect Block shape (params:{} → params:[], missing fields), unused imports, missing afterEach.
- **Security:** PASS (no issues — test files + PWA static config)
- **Tests:** 458 frontend + 19 backend = 477 total, all passing
- **Deploy:** SUCCESS (commit 2ef18e2, pushed to main)
- **Next cycle should consider:** Dark mode, CSP headers, content moderation (after 2026-03-18), block panel inert when closed (a11y), useLegacyConversion isValidBlock tightening, schema dedup, unbounded particles cap

## Cycle 31 — 2026-03-13
- **Tasks:** isValidBlock hardening + block panel inert (a11y)
- **Type:** Stability + Accessibility
- **Validation:** isValidBlock now checks all 8 required Block fields + valid BlockCategory + valid param entries. Prevents malformed LLM/storage data from crashing block compiler.
- **A11y:** Added `inert` attribute to block panel container when closed. Keyboard Tab no longer reaches invisible off-screen buttons. Fixes WCAG 2.1 SC 2.4.3.
- **Tests:** 475 frontend + 19 backend = 494 total. 17 new isValidBlock unit tests + 1 integration test.
- **Deploy:** SUCCESS (commit ec49ab5, pushed to main)
- **Next cycle should consider:** Dark mode, CSP headers, content moderation (after 2026-03-18), schema dedup, VITE_API_URL fallback fix

## Cycle 32 — 2026-03-13
- **Tasks:** Particle array cap + time-ago singular/plural fix
- **Type:** Performance + Bug fix
- **Particle cap:** Added MAX_PARTICLES=500 constant to runtime engine. burst() and trail() loops now break early when limit reached. Prevents unbounded array growth from rapid particle calls in kids' game loops.
- **Time-ago fix:** timeAgo in ProjectCatalog now uses plural translation keys (time_mins_ago/time_hours_ago/time_days_ago) when count > 1, singular when count === 1. Added space between number and unit. 6 new singular/plural test cases.
- **Security:** PASS (no user input involved)
- **Tests:** 478 frontend + 19 backend = 497 total, all passing. Coverage 95.46%.
- **Deploy:** SUCCESS (commit 91d7497, pushed to main)
- **Next cycle should consider:** Dark mode, content moderation (after 2026-03-18), schema dedup, llmService.ts refactor, WCAG contrast fix (#a8e6cf)

## Cycle 33 — 2026-03-13
- **Tasks:** CSP headers + VITE_API_URL env warning + useStreak safeSave
- **Type:** Security + Stability
- **CSP:** Explicit Content-Security-Policy via helmet: default-src 'self', frame-ancestors 'self' (clickjacking), object-src 'none', script-src 'self', style-src 'self' 'unsafe-inline' (Tailwind). Deferred since Cycle 2 (11 cycles).
- **Env warning:** console.warn when VITE_API_URL is unset in non-dev mode. Prevents silent API failure in production deployments.
- **safeSave:** useStreak.writeStreak now uses safeSave utility (consistent with useProjects/useAchievements).
- **Security:** PASS (CSP now active — defense-in-depth against XSS)
- **Tests:** 478 frontend + 20 backend = 498 total, all passing. 1 new CSP header test.
- **Deploy:** SUCCESS (commit 41168c2, pushed to main)
- **Next cycle should consider:** Dark mode (candy dark), content moderation (after 2026-03-18), schema dedup, llmService.ts refactor, handleDelete sortedBlocks fix

## Cycle 34 — 2026-03-13
- **Tasks:** WCAG AA contrast fix + template title localization
- **Type:** Accessibility + Bug fix
- **Contrast:** Darkened --color-candy-green from #a8e6cf (1.9:1) to #2ecc71 (3.7:1+). Updated all UI chrome references (PWA banner, project cards, PreviewPanel fallback). In-game decorative colors kept lighter.
- **Template titles:** Fixed handleCreateFromTemplate using template.id ("catch-the-star") instead of translations[language][template.titleKey] ("Catch the Star" / "接住星星"). Added language to useCallback deps.
- **Security:** PASS
- **Tests:** 478 frontend + 20 backend = 498 total, all passing.
- **Deploy:** SUCCESS (commit 96cec34, pushed to main)
- **Next cycle should consider:** Dark mode (candy dark), content moderation (after 2026-03-18), schema dedup, EditorView decomposition

## Cycle 35 — 2026-03-13
- **Tasks:** handleDelete sortedBlocks fix + llmService prompt extraction
- **Type:** Bug fix + Code quality
- **handleDelete:** Fixed BlockEditor.handleDelete to filter from sortedBlocks instead of unsorted blocks prop. Previously, deleting a block after drag-reorder would silently revert the user's ordering. Added test for delete-after-reorder.
- **Prompt extraction:** Extracted RUNTIME_API_REFERENCE (125 lines) and BLOCK_EXAMPLES (190 lines) from llmService.ts into backend/src/prompts/. llmService.ts reduced from 518 to 246 lines.
- **Security:** PASS
- **Tests:** 479 frontend + 20 backend = 499 total, all passing.
- **Deploy:** SUCCESS (commit e547f71, pushed to main)
- **Next cycle should consider:** Dark mode (candy dark), content moderation (after 2026-03-18), schema dedup, EditorView decomposition, "" in postMessage origins

## Cycle 36 — 2026-03-13
- **Tasks:** BlockPanelDrawer extraction + postMessage origin tightening
- **Type:** Refactoring + Security
- **BlockPanelDrawer:** Extracted block panel drawer from EditorView.tsx into standalone BlockPanelDrawer.tsx (~65 lines). Includes Escape key handler, inert/aria-hidden attributes, close button. 6 unit tests added. EditorView reduced by ~40 lines.
- **postMessage origins:** Removed empty string "" from allowed origins in useAutoFix.ts. srcdoc iframes send origin "null" (string), not "". Updated all App.test.tsx MessageEvent constructors to use origin: "null".
- **Security:** PASS
- **Tests:** 485 frontend + 20 backend = 505 total, all passing.
- **Deploy:** SUCCESS (commit 98b7d6b, pushed to main)
- **Next cycle should consider:** Dark mode (candy dark), content moderation (after 2026-03-18), schema dedup, EditorView further decomposition (still ~420 lines), getWelcomeCode memoization

## Cycle 37 — 2026-03-14
- **Tasks:** Fix broken starter templates (game.updateText + game.onTapAnywhere + entity-specific taps)
- **Type:** Bug fix (CRITICAL — 4 of 6 templates broken at runtime)
- **Engine additions:** Added `game.updateText(id, text)` to update text entity content. Added `game.onTapAnywhere(blockId, fn)` for global tap handling (pushes fn directly, consistent with onTap).
- **Tap fix:** Added `wasDragging` guard in `handlePointerUp` — drag-end events no longer fire tap/onTapAnywhere callbacks. Previously, releasing a drag in counting-game would increment the counter.
- **Template fixes:** Catch the Star checks `entity._id === "star"` before scoring (was scoring on any tap). Color Mixer uses single `onTap` with entity identity loop (was registering 6 callbacks that all fired). Counting Game and Magic Wand pass blockId as first arg to `onTapAnywhere`.
- **API reference:** Updated `runtimeApiReference.ts` with `updateText` and `onTapAnywhere` docs, plus entity identity checking guidance for `onTap`.
- **Security:** PASS (no CRITICAL/HIGH — canvas fillText is not a DOM sink, entity._id is engine-owned)
- **Code Review:** WARN → PASS after 2 HIGH fixes (drag-tap suppression, wrapper closure removal)
- **Tests:** 492 frontend + 20 backend = 512 total, all passing. 7 new tests.
- **Deploy:** SUCCESS (commit 447016f, pushed to main)
- **Next cycle should consider:** Content moderation (after 2026-03-18), dark mode (candy dark), prefers-reduced-motion for buddy-bounce animations, WCAG AA contrast (candy-green 3.7:1 → 4.5:1), schema dedup

## Cycle 38 — 2026-03-14
- **Tasks:** Quality bundle (console.log removal + i18n error context + h-dvh fix)
- **Type:** Code quality + i18n + Bug fix
- **console.log:** Removed `console.log` from useAutoFix production path (was logging auto-fix count on every sandbox error). `console.error` and `console.warn` kept for actual error reporting.
- **i18n error context:** Replaced hardcoded English auto-fix error prompt with `error_block_fix` translation key using `{blockId}` and `{error}` placeholders. Added translations for EN/zh-TW/zh-CN. LLM now receives localized error context.
- **h-dvh:** Fixed ProjectCatalog `h-screen` → `h-dvh` for mobile viewport consistency (matches EditorView, prevents scroll gap on mobile browsers with dynamic address bars).
- **Note:** prefers-reduced-motion for buddy-bounce is already handled by the global `@media (prefers-reduced-motion: reduce)` catch-all at index.css line 289 which forces `animation-duration: 0.01ms !important` on all elements. WCAG AA contrast for #2ecc71 with dark text (#222) is ~7.6:1, well above 4.5:1. Both items confirmed non-issues.
- **Security:** PASS (no new surface area)
- **Tests:** 492 frontend + 20 backend = 512 total, all passing.
- **Deploy:** SUCCESS (commit bc722e7, pushed to main)
- **Next cycle should consider:** Content moderation (after 2026-03-18), dark mode (candy dark), schema dedup, EditorView decomposition, empty-state guidance for disabled blocks

## Cycle 39 — 2026-03-14
- **Tasks:** Block editor UX (drag hint + all-disabled nudge + memoize getWelcomeCode)
- **Type:** Feature (UX) + Performance
- **Block editor hint:** Added "Drag to reorder · tap to toggle" subtitle in BlockEditor header. i18n in EN/zh-TW/zh-CN. Hidden when no blocks present.
- **All-disabled nudge:** Shows lightbulb emoji + "Enable a block to see your creation!" when all blocks have `enabled: false`. Addresses silent failure where kids disable all blocks and see blank preview.
- **getWelcomeCode memoization:** Wrapped in `useMemo(() => getWelcomeCode(language), [language])` — was re-building 60-line HTML string on every useProjects render.
- **Security:** PASS (static UI, no user input)
- **Tests:** 497 frontend + 20 backend = 517 total, all passing. 5 new tests.
- **Deploy:** SUCCESS (commit b59d62b, pushed to main)
- **Next cycle should consider:** Content moderation (after 2026-03-18), dark mode (candy dark), schema dedup, EditorView decomposition (still ~420 lines)

## Cycle 40 — 2026-03-14
- **Tasks:** i18n remaining hardcoded aria labels
- **Type:** Accessibility + i18n
- **Keys added:** `aria_delete_block`, `aria_logic_blocks`, `aria_shuffle`, `aria_preview_sandbox` in EN/zh-TW/zh-CN.
- **Wired:** BlockCard delete button, BlockEditor list container, MessageList shuffle button (via new `ariaShuffleLabel` prop), PreviewPanel iframe title.
- **Note:** Verified that prefers-reduced-motion and WCAG contrast are non-issues (global catch-all rule handles motion, dark-on-green contrast is 7.6:1).
- **Security:** PASS (static strings only)
- **Tests:** 497 frontend + 20 backend = 517 total, all passing.
- **Deploy:** SUCCESS (commit 50cd349, pushed to main)
- **Next cycle should consider:** Content moderation (after 2026-03-18), dark mode (candy dark), schema dedup, EditorView decomposition

## Cycle 41 — 2026-03-14
- **Tasks:** Buddy Coaching Tips ("Cognitive Mirror" system for AI co-creation pedagogy)
- **Type:** Major Feature (AI literacy + pedagogy)
- **Research conducted:** 7 web searches on AI co-creation pedagogy, prompt scaffolding, metacognition, OECD AI literacy, Scratch Copilot, gamification. Sources: ACM IDC 2025, MIT/arXiv, OECD, Frontiers, ScienceDirect, Nature Human Behaviour, Taylor & Francis, PMC, UNESCO.
- **Key insight:** The Cognitive Mirror pattern (post-generation reflection) is the #1 metacognitive intervention per Frontiers 2025. Ages 8-14 are the critical AI literacy window per OECD.
- **Implementation:** Backend: optional `tip` field in generationSchema + coaching section in system prompt. Frontend: tip chat bubbles with candy-yellow styling + 💡 emoji + i18n (EN/zh-TW/zh-CN).
- **Tests:** 500 frontend + 20 backend = 520 total, all passing. 3 new tests.
- **Deploy:** SUCCESS (commit ca8458c, pushed to main)
- **Roadmap identified:** Prompt Scaffold Templates (M), AI Contribution Transparency (M), AI Skill Passport (M), Iterative Refinement Challenges (L)
- **Next cycle should consider:** Prompt scaffold templates, AI collaboration achievements, content moderation (after 2026-03-18)

## Cycle 42 — 2026-03-14
- **Tasks:** AI collaboration achievements (3 new badges)
- **Type:** Feature (gamification + AI literacy)
- **New badges:** "Great Describer" (📝, 5 detailed prompts), "Iteration Master" (🔄, 10 iterations), "Tip Collector" (💡, 5 coaching tips). Rewards AI collaboration process behaviors over outcomes (Taylor & Francis 2025).
- **New stat types:** `describes`, `iterates`, `tips` added to AchievementState. recordDescribe fires on 20+ char prompts. recordIterate fires on builds with prior messages. recordTip fires when Buddy returns a tip.
- **Tests:** 506 frontend + 20 backend = 526 total, all passing. 6 new tests.
- **Deploy:** SUCCESS (commit c5780f1, pushed to main)
- **Next cycle should consider:** Prompt scaffold templates (fill-in-the-blank → fading), AI contribution transparency, content moderation (after 2026-03-18)

## Cycle 43 — 2026-03-14
- **Tasks:** Prompt scaffold templates (fill-in-the-blank → fading)
- **Type:** Feature (AI literacy + prompt training)
- **Scaffold chips:** 6 templates per language with ___ blanks (EN/zh-TW/zh-CN). Click fills input without submitting — child completes blanks themselves. Distinct dashed purple border + pencil emoji + "Fill in the blanks!" hint.
- **Progressive fading:** Scaffolds shown when `stats.describes < 5`, hidden once the child demonstrates prompt skill via detailed prompts. Vygotsky ZPD pattern.
- **Tests:** 509 frontend + 20 backend = 529 total, all passing. 3 new tests.
- **Deploy:** SUCCESS (commit 402b748, pushed to main)
- **Next cycle should consider:** AI contribution transparency ("Who Made This?"), content moderation (after 2026-03-18), dark mode

## Cycle 44 — 2026-03-14
- **Tasks:** Block origin tracking ("Who Made This?" transparency)
- **Type:** Feature (AI literacy + ownership)
- **Origin field:** Added `BlockOrigin` type (`"ai" | "template" | "remix"`) to Block interface. Blocks tagged at creation: `"ai"` from LLM in onFinish, `"template"` from starter templates, `"remix"` on param changes.
- **Origin badge:** Visual emoji badge on each BlockCard — 🤖 AI / 📋 Template / ✏️ Remix with distinct colors and title tooltips. No badge when origin is undefined (backward compat with existing projects).
- **Research basis:** MIT Scratch Copilot 2025 — 50% of kids worry about losing originality. OECD AI Literacy Framework — "creativity" defined as maintaining human authorship while collaborating with AI.
- **Tests:** 513 frontend + 20 backend = 533 total, all passing. 4 new tests.
- **Deploy:** SUCCESS (commit 3670525, pushed to main)
- **Next cycle should consider:** AI Skill Passport (6 OECD competency badges), content moderation (after 2026-03-18), dark mode, iterative refinement challenges

## Cycle 45 — 2026-03-14
- **Tasks:** AI skill summary card on ProjectCatalog
- **Type:** Feature (AI literacy visibility)
- **Skill card:** Shows 4 AI collaboration stats (builds, detailed prompts, iterations, tips earned) as a compact card on the project catalog page. Reads from localStorage snapshot of achievement state. Candy-neubrutalism purple-header card.
- **Visibility:** Only shown when child has 1+ build or 1+ detailed prompt. Zero-state users see nothing extra.
- **i18n:** 5 new keys (skill_card_title, skill_builds, skill_describes, skill_iterates, skill_tips) in EN/zh-TW/zh-CN.
- **Tests:** 513 frontend + 20 backend = 533 total, all passing.
- **Deploy:** SUCCESS (commit d204759, pushed to main)
- **Next cycle should consider:** Full AI Skill Passport (6 OECD competencies with levels), iterative refinement challenges, content moderation (after 2026-03-18), dark mode

## Cycle 46 — 2026-03-14
- **Tasks:** Buddy personality variants + personalized returning user greetings
- **Type:** Feature (innovation — kid delight + engagement)
- **Personalities:** 5 distinct buddy personalities (dog=friendly, cat=witty, dragon=bold, robot=analytical, unicorn=magical) with per-avatar speech style, catchphrases, greeting flavor, streak celebrations, and tip prefixes in EN/zh-TW/zh-CN.
- **LLM integration:** Personality prompt injected into system prompt via `avatarId` passed from frontend → backend. Each avatar influences AI tone, tips, and responses.
- **Greetings:** 5 greeting tiers (new_user, returning, active, streak_champion, veteran) based on build count + streak days. Personalized with avatar name, catchphrase, and stats. Used for initial greeting and reset.
- **New files:** `buddyPersonalities.ts` (frontend constants), `greetingTiers.ts` (greeting logic), `buddyPersonalities.ts` (backend prompts)
- **Tests:** 534 frontend + 20 backend = 554 total, all passing. 25 new tests (4 personality + 17 greeting + 4 updated App tests).
- **Deploy:** SUCCESS (commit 735322a, pushed to main)
- **Next cycle should consider:** Dark mode ("candy dark"), session recap screen, daily challenge/quests, visible progress bar on catalog, sound block completion

## Cycle 47 — 2026-03-14
- **Tasks:** Buddy progress bar on catalog + session recap after builds
- **Type:** Feature (innovation — engagement + reflection)
- **Progress bar:** Shows "X more builds to unlock [next avatar]!" with animated candy-purple fill bar on project catalog. Uses BUDDY_AVATARS thresholds. Shows "All buddies unlocked!" at 20+ builds. Has `role="progressbar"` with aria attributes.
- **Session recap:** Modal appears every 3rd build with 4 stat cards (builds, messages, blocks, tips), block origin badges (AI/template/remix), and buddy-personalized congratulation. Dismissible via button or backdrop click.
- **New files:** BuddyProgressBar.tsx, SessionRecap.tsx + tests for both
- **i18n:** 14 new keys in EN/zh-TW/zh-CN (progress_*, recap_*)
- **Tests:** 548 frontend + 20 backend = 568 total, all passing. 14 new tests.
- **Deploy:** SUCCESS (commit e449cd4, pushed to main)
- **Next cycle should consider:** Dark mode ("candy dark"), daily challenge/quests, sound block completion, play mode HUD, project card thumbnails

## Cycle 48 — 2026-03-14
- **Tasks:** Daily challenge system with rotating quests
- **Type:** Feature (innovation — engagement + return visits)
- **Daily challenges:** 14 curated challenges (bouncing rainbow, virtual pet, fireworks show, maze runner, emoji catcher, beat visualizer, space dodge, creative canvas, whack-a-mole, snow globe, countdown, bubble pop, memory match, lava floor) rotate by day-of-year. Shown as a vibrant gradient card on project catalog.
- **Difficulty levels:** easy/medium/hard with color-coded badges (green/yellow/orange)
- **Challenge flow:** Accept → creates new project → prompt pre-filled in input → kid can hit send
- **Completion tracking:** localStorage date-gated — each challenge marked completed per-day, card shows "Completed!" when done
- **i18n:** 3 new keys + all 14 challenge titles/prompts in EN/zh-TW/zh-CN
- **New files:** dailyChallenges.ts (constants), DailyChallengeCard.tsx (component), dailyChallenges.test.ts (11 tests)
- **Tests:** 559 frontend + 20 backend = 579 total, all passing
- **Deploy:** SUCCESS (commit 04ff700, pushed to main)
- **Next cycle should consider:** Sound block completion, play mode HUD, dark mode (multi-cycle), project card thumbnails, "remix this" on templates

## Cycle 49 — 2026-03-14
- **Tasks:** Sound block support (playTone/playNote LLM prompt examples)
- **Type:** Feature (innovation — audio in creations)
- **Changes:** Added 2 sound block examples (collision tone with frequency/duration params, tap note with musical note enum param) to backend block examples prompt. Updated system prompt to instruct AI to include sound effects for collisions, pickups, and celebrations using "sound" type blocks.
- **Runtime already supports:** game.playTone(freq, duration, opts), game.playNote(note, duration, opts), AudioContext synthesis with sine/triangle/square/sawtooth wave types.
- **Block category:** sound type already defined with lime green color and 🔊 emoji in blockCategories.ts.
- **Tests:** 559 frontend + 20 backend = 579 total, all passing
- **Deploy:** SUCCESS (commit d4382ae, pushed to main)
- **Next cycle should consider:** Play mode HUD, "remix this" on templates, project card thumbnails, dark mode (multi-cycle refactor)

## Cycle 50 — 2026-03-14
- **Tasks:** Play mode HUD (tap/drag instructions on fullscreen)
- **Type:** Feature (innovation — UX polish)
- **HUD overlay:** 3-second instructional overlay appears when chat is hidden (play mode) showing "Tap to interact!" + "Drag things around to play". Auto-fades using CSS animation (60% visible, then fades to 0). Clears immediately when chat is re-shown or during loading.
- **CSS animation:** New `fade-out-delayed` keyframe + `.animate-fade-out` class. Respects `prefers-reduced-motion`.
- **i18n:** 2 new keys (play_hud_tap, play_hud_drag) in EN/zh-TW/zh-CN.
- **Tests:** 559 frontend + 20 backend = 579 total, all passing.
- **Deploy:** SUCCESS (commit 1864b80, pushed to main)
- **5-cycle innovate session complete.** Shipped: buddy personalities, personalized greetings, progress bar, session recap, daily challenges, sound blocks, play mode HUD.
- **Remaining backlog:** Dark mode (multi-cycle refactor), "remix this" on templates, project card thumbnails, content moderation (COPPA deadline April 22), community gallery

## Cycle 51 — 2026-03-15
- **Tasks:** Critical LLM quality — self-verification allowlist, broken examples, API docs
- **Type:** Fix (LLM quality — CRITICAL)
- **Self-verification:** Expanded allowlist from 7 to 15 patterns. Previously ALL suggested check examples failed the allowlist — verification was a complete no-op. Now accepts: typeof game.get, entity property access (.width/.height/.x/.y/.value), game.get !== null, game.width()/height().
- **Broken examples fixed:** tap-note had double-quoting (always played A4), collision-sound used wrong entity IDs (never fired). Replaced with 3 working sound examples.
- **API docs:** Documented collision per-frame behavior, physics auto-step, timer stacking, onTap/onTapAnywhere identity, addEntity merge behavior. Added rules 7-9.
- **Tests:** 563 frontend + 20 backend = 583 total. 4 new allowlist tests.

## Cycle 52 — 2026-03-15
- **Tasks:** Engine robustness — collision debouncing + timer idempotency
- **Type:** Fix (engine — HIGH)
- **Collision debouncing:** onCollision and onOverlap now fire once per contact, wait until entities separate before firing again. Eliminates score/pickup glitches from per-frame firing.
- **Timer idempotency:** game.every() auto-clears existing intervals for the same blockId. Prevents exponential timer stacking on hot reload.
- **API docs:** Updated collision and timer docs to reflect new behavior. Removed workaround instructions.

## Cycle 53 — 2026-03-15
- **Tasks:** 3 new block examples (tap-to-spawn, overlap collection, game over)
- **Type:** Feature (LLM quality — examples)
- **New examples:** Tap-to-spawn (entity creation at tap location with sound + particles), overlap collection (circle collision with repositioning), game over (win condition with victory screen + celebratory melody).
- **Impact:** LLM now has correct worked examples for the 3 most commonly requested game patterns.

## Cycle 54 — 2026-03-15
- **Tasks:** Common mistakes section + expanded self-check in LLM prompt
- **Type:** Fix (LLM quality — prompt)
- **Common mistakes:** 8 explicit anti-patterns: double movement, wrong blockId, missing null checks, entity ID typos, string param double-quoting, empty canvas, collision without entities, physics on static elements.
- **Self-check:** Expanded from 10 to 13 items: entity existence for collisions, double-movement, string param quoting.

## Cycle 55 — 2026-03-15
- **Tasks:** Canvas-relative coordinates for game.on mouse/touch events
- **Type:** Fix (engine — MEDIUM)
- **Fix:** game.on() now enriches mouse/touch events with e._canvasX and e._canvasY computed from canvas getBoundingClientRect. Fixes drawing apps and pointer-based games that used raw window coordinates.
- **API docs:** Documented _canvasX/_canvasY properties.
- **Tests:** 563 frontend + 20 backend = 583 total, all passing.
- **5-cycle LLM quality session complete.** Fixed: self-verification (was no-op), broken examples, collision spam, timer stacking, missing game patterns, common mistake prevention, mouse coordinates.

## Cycle 56 — 2026-03-15
- **Tasks:** Mandatory interactivity in system prompt + reordered block examples + API reference restructured
- **Type:** Fix (LLM interactivity — CRITICAL)
- **System prompt:** Added "EVERY CREATION MUST BE INTERACTIVE" CRITICAL rule requiring tap/click/drag handlers with multi-sensory feedback (burst + tween + sound) for ALL creation types. Updated self-check items 9-10.
- **Block examples:** Reordered — interactive examples first (tap-to-spawn, drag, tap-sound, tap-color-change). Added "INTERACTIVE:" labels. New tap-color-change example for passive animations.
- **API reference:** Touch & Pointer section moved from position 8 to position 2 with "ALWAYS include" label.

## Cycle 57 — 2026-03-15
- **Tasks:** Rich interactive feedback in all 6 starter templates
- All templates now have burst + tween + sound on tap. Previously bouncing-emoji and emoji-rain were 100% passive. All now show "Tap to..." hint text.

## Cycle 58 — 2026-03-15
- **Tasks:** Interactive default blocks
- New projects now show dark background + yellow title + sparkles + tap-anywhere magic (colorful burst + rising tone + screen shake). Previously entirely passive.

## Cycle 59 — 2026-03-15
- **Tasks:** Interactive suggestion chips
- Updated 5 ambiguous chips in EN/zh-TW/zh-CN to emphasize tap interaction (clock, ocean, todo, volcano, weather).

## Cycle 60 — 2026-03-15
- **Tasks:** Pulsing interaction hint block example + context-aware hints
- Added "ALWAYS INCLUDE: Interaction Hint" as first block example with pulsing opacity. System prompt now requires context-specific hints.
- **5-cycle interactivity session complete.** Every layer now mandates interaction: prompt, examples, templates, defaults, chips.

## Cycle 61 — 2026-03-15
- **Theme:** Next-Gen LLM Co-Working Model & Training Class for Kids
- **Deep research:** MIT Scratch Copilot (IDC 2025), Six Scaffolds framework, Stanford SCALE guardrails, AI education market ($7.57B→$112B), CSTA 2026 standards, classroom platform analysis
- **Item 1: Block-Level Accept/Reject Negotiation** — After AI generates blocks, each arrives as "pending" with individual Accept/Reject buttons. Preview shows immediately; child reviews in auto-opened block panel. Accept All / Reject All banner. Addresses MIT finding that 50% of kids worry about losing originality.
- **Item 2: Classroom Mode** — URL-parameter-driven (`?mode=class&lesson=physics`). 5 topics (physics/art/music/animals/space), 8 lesson-scoped chips per topic in 3 languages. Skips project catalog, shows lesson badge in header. No auth needed — COPPA-friendly.
- **Docs updated:** PRD.md (Section 9: Next-Gen Co-Working Vision), TASKS.md (Phase 8: 9 new task groups), RESEARCH_FINDINGS.md (Section 9: 8 academic papers + market data)
- **Tests:** 563 frontend + 20 backend = 583, all passing
- **Next cycle should consider:** Content moderation pipeline (COPPA deadline April 22), dark mode ("candy dark"), mobile layout bottom-sheet, bundle optimization

## Cycle 62 — 2026-03-15
- **Theme:** Next-Gen LLM Co-Working Model & Training Class for Kids (continued)
- **Item 1: Content Moderation Pipeline** — Client-side blocklist (47 blocked words, 12 code patterns), input scanning in handleSend with kid-friendly rejection messages, code pattern stripping for eval/fetch/cookies/external URLs. AI disclosure label in ChatHeader. 25 new tests.
- **Item 2: Proactive Follow-Up Suggestions** — After each build, 2-3 contextual chips appear based on block categories present (e.g., collision → "Add explosion effect"). 10 categories × 2-3 suggestions × 3 languages. 7 new tests.
- **Tests:** 595 total (595 frontend), all passing
- **COPPA progress:** Input filtering + AI disclosure done. Still needed: server-side output filtering, parental consent flow (Phase 8.2 partially complete)
- **Next cycle should consider:** Dark mode ("candy dark"), mobile layout bottom-sheet, per-block undo, session summary on catalog

## Cycle 63 — 2026-03-15
- **Item 1: Lesson Plan Templates** — 6 curated lesson plans in ProjectCatalog (Gravity Bounce, Quiz Game, Music Maker, Virtual Pet, Rocket Launch, Story Chooser). Each has age range badge, pre-filled prompt, and lesson-scoped chips. i18n in 3 languages.
- **Item 2: Candy Dark Mode** — CSS variable-based dark mode via `[data-dark="true"]` selectors. Moon/sun toggle in ChatHeader. localStorage persistence + prefers-color-scheme default. FOUC prevention inline script. Deep navy surfaces (#1a1b2e) with vivid candy accents preserved.
- **Tests:** 595 total, all passing
- **Next cycle should consider:** Mobile layout bottom-sheet, per-block undo, session summary on catalog, bundle optimization

## Cycle 64 — 2026-03-15
- **Item 1: Mobile Tab Bar** — Bottom tab bar (Chat/Preview) on screens <640px. Both panels render but only active tab visible. Desktop layout unchanged. `flex-col sm:flex-row` approach.
- **Item 2: Per-Block Undo** — 10-entry history stack. Each block change pushes state to history. Undo button in block panel footer. History managed via `blocksHistory` state array.
- **Tests:** 595 total, all passing

## Cycle 65 — 2026-03-15
- **Item 1: Bundle Optimization** — 4 manual chunks: vendor-react (0KB tree-shaken), vendor-ai (125KB/36KB gzip), vendor-dnd (49KB/16KB gzip), vendor-icons (16KB/6KB gzip). App chunk: 394KB/120KB gzip. Workbox max file size increased for large theme PNGs.
- **Item 2: Session Stats on Project Cards** — Projects now track totalBuilds, totalMessages, blockCategories. Stats badges on project cards in catalog. Persisted via usePersistProject.
- **Tests:** 595 total, all passing
- **5-cycle deep research session complete.** 10 features shipped across Cycles 61-65 covering co-creation, classroom, moderation, UX, and performance.
