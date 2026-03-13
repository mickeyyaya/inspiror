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
