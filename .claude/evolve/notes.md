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
