# Inspiror Task Breakdown (TDD)

## Phase 1: Core Chat & Code Generation [x]
*(Completed)*

## Phase 1.5: Real-Time Streaming & "Hacker Mode" UI [x]
**Goal:** Mesmerize kids by showing them exactly what the AI is building in real-time, character by character.

### Backend Tasks (Express API)
- [x] Refactor `llmService.ts`: Instead of `await result.object`, return the full `result` stream object from `streamObject()`.
- [x] Update `server.ts` `/api/generate`: Use Vercel AI SDK's streaming methods for Express. Call `result.pipeTextStreamToResponse(res)` to send chunked updates instead of a static JSON response.
- [x] Update API Tests: Mock the streaming interface in `backend/tests/api.test.ts` to expect chunked data or stream initialization.

### Frontend Tasks (React UI)
- [x] Run `npm install @ai-sdk/react` in the frontend directory.
- [x] Refactor `App.tsx` state management: Replace the manual `fetch` logic with the `experimental_useObject` hook from `@ai-sdk/react` to automatically consume the `toTextStreamResponse`.
- [x] UI - "Hacker Mode" Implementation:
    - Bind `object?.code` (the streaming string) to the Hacker Mode `pre` tag overlay. This will cause the text to fly onto the screen like matrix code.
    - Bind `object?.reply` to the active chat bubble to create a typewriter effect for the AI's response.
- [x] HTML Sandbox Safety: Ensure the `iframe`'s `srcDoc` uses a stable version of the code (e.g., only update `currentCode` when `isLoading` transitions to `false`). Do not feed partial HTML chunks into the iframe during generation to avoid visual glitching.
- [x] Write tests ensuring `experimental_useObject` is called and UI renders partial streaming state.

## Phase 2: Contextual Memory, Iterative Scaffolding & Magic Buttons [x]
**Goal:** Prevent blank-canvas syndrome and force the AI to build step-by-step (Iterative Visual Scaffolding).
*(Completed)*

## Phase 2.5: UX Polish, Visual Delight & Auditory Feedback [~]
**Goal:** Implement research findings on kids' UX (Visual Subtraction, Skeuomorphism, Animations, and Sound).

### Frontend Tasks - Visual Delight (COMPLETED)
- [x] Confetti burst: CSS-only confetti (20 pieces) triggered when `isLoading` transitions false. Auto-clears after 2s.
- [x] Message slide-in animations: `msg-user` slides from right, `msg-buddy` slides from left (300ms ease-out).
- [x] Auto-scroll: `useRef` + `useEffect` scrolls to `messagesEndRef` on new messages.
- [x] Animated buddy avatar: `buddy-avatar` bounce (2s) switches to `buddy-avatar-thinking` wobble (0.6s) during loading.
- [x] Staggered chip entrance: `chip-enter` pop-in (scale 0.5→1.05→1.0) with 100ms delay per chip.
- [x] Animated welcome preview: Gradient background + 15 floating colored particles + "What will YOU create today?" rainbow text.
- [x] Input glow effect: `input-glow-active` cyan box-shadow when input has text.
- [x] Page title: "Inspiror - Build Anything!" with rocket emoji favicon.
- [x] Hacker mode pulsing core: Dual blur circles (cyan/pink) + spinning Sparkles + gradient "BUILDING" text.
- [x] Skeuomorphic buttons: 3D shadows with `active:translate-y-[4px]` press effect on chips and send button.

### Frontend Tasks - Audio Integration (TODO)
- [ ] Source or generate 4 kid-friendly royalty-free sound effects (e.g., `send-pop.mp3`, `chip-click.mp3`, `success-chime.mp3`, `error-buzzer.mp3`) and add them to `public/sounds/`.
- [ ] Create a `useAudio` custom React hook to preload and play these sounds asynchronously without blocking the main thread.
- [ ] Hook `send-pop` into the `handleSend` function.
- [ ] Hook `chip-click` into the `handleChipClick` function.
- [ ] Hook `success-chime` into the completion block of the generation stream.
- [ ] Hook `error-buzzer` into the `window.onerror` iframe message listener.

### Frontend Tasks - Play/Edit Toggle (TODO)
- [ ] Add a prominent toggle at the top of the screen to switch between "Build Mode" (shows chat/hacker overlay) and "Play Mode" (hides UI, focuses iframe).

## Phase 3: Educational Auto-Fix Error Handling [x]
*(Completed)*

## Phase 4: Local Storage Persistence [x]
*(Completed)*

## Phase 5: Polish & Deployment [ ]
- [x] Add "Clear/Reset Project" button in chat header.
- [x] E2E test suite covering all features (22 Playwright tests).
- [ ] CSS Media Queries: Add Tailwind classes (`md:`, `lg:`) to ensure the floating chat window scales down properly on tablets (e.g., iPad screens) and switches to a stacked layout on phones.
- [ ] Containerize the backend with a `Dockerfile` for easy deployment to Railway/Render.
- [ ] Add `vercel.json` and configure Vite for zero-config Vercel deployment.

## Phase 6: Deep Engagement & Retention (Future) [ ]
**Goal:** Implement features that keep kids coming back based on research of platforms like Scratch and Roblox.

### Feature 1: "Look Inside" / Code Remixing
- [ ] State: Add `isCodePanelOpen` boolean state.
- [ ] UI: Build a sliding panel (right-aligned, Tailwind `translate-x`) containing a lightweight code editor (like `react-simple-code-editor` or `monaco-editor`).
- [ ] Logic: Bind editor to an `editableCode` state. Add a "Run My Code" button that syncs `editableCode` back to `currentCode` and updates the iframe directly, bypassing the AI, allowing kids to learn by tweaking numbers.

### Feature 2: Asset Upload (Personalization)
- [ ] UI: Add an `<input type="file" accept="image/*">` hidden behind a 📎 "Upload Image" icon button next to the chat input.
- [ ] Logic: Write a `FileReader` utility to convert uploaded images into Base64 Data URIs.
- [ ] State: Show a small thumbnail preview of the selected image above the input box.
- [ ] API: Modify the message payload to include the Base64 string, instructing the LLM to use the string as an `<img src="...">` in the game's HTML.

### Feature 3: Gamified Progression
- [ ] Data: Create an `achievements.ts` constants file defining badges (e.g., `{ id: 'first_game', title: 'Code Ninja', threshold: 1, icon: '🥷' }`).
- [ ] State: Track a `gamesBuilt` integer in `localStorage`. Increment this every time `isGenerating` completes successfully.
- [ ] Logic: Create a `useAchievements` hook that checks `gamesBuilt` against thresholds. If a new threshold is crossed, trigger a global `react-confetti` overlay and display a congratulatory modal.
- [ ] UI: Add an "Avatar/Badges" menu where kids can swap their AI Buddy (🐶) for newly unlocked avatars (e.g., 🐉 Dragon, 🤖 Robot).

## Technical Debt (from Code Review)

### Must Fix Before Next Feature
- [ ] **Message list keys:** Replace `key={idx}` with stable keys (content hash or uuid) to prevent incorrect DOM reuse when iframe error handler inserts messages non-append.
- [ ] **Confetti timer reset:** Reset confetti timer on rapid-fire generations so first timer doesn't prematurely hide confetti from second build.
- [ ] **Accessibility:** Add `aria-hidden={!isChatVisible}` to hidden chat panel so screen readers don't traverse off-screen content.

### Nice to Fix
- [ ] **Confetti CSS coupling:** Refactor hardcoded `nth-child` selectors to use inline `style={{}}` like welcome particles, decoupling from `CONFETTI_COUNT`.
- [ ] **Favicon fallback:** Replace emoji favicon with a real SVG rocket shape for cross-browser reliability (Firefox Linux renders blank).

## Backlog (March 2026)

### HIGH PRIORITY

- [ ] **Gamified Progression System** — Badges, XP, unlockable buddy skins, and a visible skill progression map. Direct competitive gap vs. CodeCombat (loot + gear) and Codedex (fantasy map with region unlocking). See Phase 6 Feature 3 for initial implementation sketch.
- [ ] **Educational Loading Screen** — Teach coding facts (variable definitions, loop concepts, etc.) during the 20-40s AI generation wait time. Direct competitive gap vs. Codorex (Rex the Dino teaches facts during wait). High perceived value for educators.

### MEDIUM PRIORITY

- [ ] **Expressive AI Buddy** — Expand emotion states beyond bounce/think: proud animation on successful build, encouraging on debug/error, curious head-tilt when asking questions. Supported by CHI 2025 research: expressive mascots significantly improve engagement.
- [ ] **"My Games" Gallery / Portfolio** — Personal showcase screen listing all completed projects with thumbnails. Gives kids a sense of ownership and a portfolio to share with parents/teachers.
- [ ] **Upgrade to AI SDK 6 stable API** — Replace `experimental_useObject` import with stable `useObject` from `@ai-sdk/react`. Also adopt agent abstraction and tool approval system for future multi-step workflows.

### LOW PRIORITY

- [ ] **Parent / Teacher Dashboard** — Lightweight classroom-management view: see student projects, monitor session frequency, set content guardrails. Capitalizes directly on Replit's K-12 exit (Fall 2024).
- [ ] **Publish & Share Feature** — Generate a public read-only URL for a completed game. Word-of-mouth growth driver; inspired by Rosebud's community flywheel (2.2M+ user-created games).

### SECURITY

- [ ] Run `npm audit` in `frontend/` and `backend/`.
- [ ] Verify React >= 19.2.1 (CVE-2025-55182 precaution).
- [ ] Verify Vite >= 7.0.8 (CVE-2025-58752 fix).

---

## Branch Reconciliation Note

**IMPORTANT (March 2026):** The `feature/test-coverage` branch diverged from `main` and is missing features that exist on `main`: multi-project support (ProjectCatalog, useProjects), multi-language i18n (EN/TW/CN), and voice input. Before merging `feature/test-coverage` into `main`, these features must be reconciled — either cherry-picked forward or merged carefully to avoid regression. Do NOT merge `feature/test-coverage` directly without a diff review against `main`.

**Cycle 3 Audit Update:** The divergence is now confirmed as a mutual exclusion — the two branches are supersets of each other in different dimensions. `feature/test-coverage` has higher test coverage and stability fixes; `main` has multi-project, i18n, and voice input. A proper reconciliation merge (not a simple fast-forward) is required before any new feature work proceeds.

---

## 8-Dimension Audit Findings (March 2026 — Cycle 3)

Audit covers: Performance, Stability, UI/UX, Playability, Code Quality, Security, Architecture, and Accessibility.
Audited against actual source on both `feature/test-coverage` and `main` branches.
Total issues found: 46 across 8 dimensions.

### CRITICAL

- [ ] **Branch divergence — mutual exclusive supersets** — `feature/test-coverage` and `main` have diverged so that each is a superset of the other. Neither branch can be deployed as-is without losing significant work. Must reconcile before any new feature work. (Architecture / Process)
- [ ] **EditorView defined as local function inside App component** — On `feature/test-coverage`, `EditorView` is declared as a function inside `App`, causing React to treat it as a new component type on every render. This forces a full unmount/remount of `EditorView` (including the iframe) on every state change. Extract `EditorView` as a top-level module export. (Stability) [`App.tsx`]

### HIGH — Must Fix

- [ ] **Race condition in iframe error handler (stale closure)** — The `window.addEventListener('message', ...)` handler in the iframe error catcher closes over the `messages` array at registration time. Auto-fix calls use stale conversation context; if multiple messages have been added since registration, the LLM receives an outdated history. Use a ref (`messagesRef`) to always read the latest value. (Stability) [`App.tsx`]
- [ ] **`currentCode` not updated on user remix** — When the user edits code in `CodePanel` and runs it, `App.currentCode` retains the last AI-generated version. The next AI generation call ignores all user edits. Lift editor state or introduce a shared `useCurrentCode` hook. (Architecture) [`App.tsx`, `CodePanel`] *(also listed in Cycle 2)*
- [ ] **Audio `cloneNode` memory leak** — `useAudio.ts` creates cloned `HTMLAudioElement` nodes on every play call that are never released. Accumulates on rapid interactions; no cleanup in the hook teardown. (Performance) [`useAudio.ts`] *(also listed in Cycle 2)*
- [ ] **Suggestion chips disappear forever after first message** — Chips are hidden after the user's first interaction and never shown again, even after a reset. They should reappear when the conversation is cleared. (Playability) [`App.tsx`] *(noted in Cycle 2 as LOW, re-classified HIGH)*
- [ ] **`experimental_useObject` not migrated to stable** — AI SDK 6 promotes `experimental_useObject` to the stable `useObject` export. The current import will eventually break. (Code Quality) [`App.tsx`] *(also listed in Cycle 2)*
- [ ] **Reset without confirmation** — "Clear/Reset Project" instantly destroys conversation and code with no undo or confirmation dialog. Catastrophic data loss for kids. (Playability) *(also listed in Cycle 2)*

### MEDIUM

- [ ] **`injectErrorCatcher` called every render** — The function is called inline in JSX without `useMemo`, recomputing the injected string on every state change. Wrap in `useMemo` with `[currentCode]` dependency. (Performance) [`App.tsx`] *(also listed in Cycle 2)*
- [ ] **Audio eager loading on mount** — `useAudio` fires 4 network requests for sound files before the user has interacted with anything. Lazy-load on first use or after first interaction. (Performance) [`useAudio.ts`] *(also listed in Cycle 2 as LOW, re-classified MEDIUM)*
- [ ] **No focus management on chat open/close** — Keyboard users lose focus context when the chat panel toggles. Focus should move to the chat input on open and to the toggle button on close. (Accessibility) *(also listed in Cycle 2)*
- [ ] **`CodePanel` missing `aria-hidden`** — When the code panel is closed, it remains in the DOM without `aria-hidden`, allowing screen readers to traverse off-screen content. (Accessibility) [`App.tsx`]
- [ ] **No Express error handler middleware** — Uncaught async errors in route handlers are not caught by a global error handler; Express logs them but the client receives an empty response. Add a `(err, req, res, next)` middleware at the end of `server.ts`. (Stability) [`server.ts`]
- [ ] **Backend `package.json` test script incorrect** — The `test` script in `backend/package.json` does not correctly invoke Jest for the TypeScript source. Verify it runs `npx jest` or `ts-jest` against `tests/` and that it is wired to CI. (Code Quality) [`backend/package.json`]
- [ ] **`@google/genai` unused dependency** — `@google/genai` is listed in `backend/package.json` but Inspiror uses `@ai-sdk/google`. The unused package adds install weight and a potential supply-chain surface. Remove it. (Code Quality) [`backend/package.json`]
- [ ] **Hardcoded model name in `llmService.ts`** — The Gemini model identifier is hardcoded as a string literal. Extract to a named constant or environment variable (`GEMINI_MODEL`) so it can be swapped per environment without a code change. (Code Quality) [`llmService.ts`]

### LOW

- [ ] **Vitest coverage thresholds not enforced** — `vitest.config.ts` does not set `coverage.thresholds`, so CI can pass even if coverage drops below 80%. Add thresholds for `branches`, `functions`, `lines`, and `statements`. (Code Quality) [`vitest.config.ts`]
- [ ] **`App.css` empty/unused** — The file exists but contains no styles. It is imported in `main.tsx`, adding a pointless network request. Either delete it or consolidate with `index.css`. (Code Quality) [`App.css`]

---

## 8-Dimension Audit Findings (March 2026 — Cycle 2)

Audit covers: Performance, Stability, UI/UX, Playability, Code Quality, Security, Architecture, and Accessibility.
Audited against actual source on `feature/test-coverage` branch.

### CRITICAL

- [ ] **No mobile layout** — `ChatPanel` is `w-96` (384px fixed), overflows on phones and tablets. Kids use tablets heavily. Add responsive stacked layout for screens <640px. (UI/UX) [`App.tsx:453`]

### HIGH — Must Fix

- [ ] **Hardcoded localhost API URL** — `api: "http://localhost:3001/api/generate"` breaks any deployment. Replace with `import.meta.env.VITE_API_URL`. (Stability) [`App.tsx:208`]
- [ ] **CORS fully open** — `app.use(cors())` allows any origin. Restrict to deployed frontend origin via `ALLOWED_ORIGIN` env var. (Security) [`server.ts:7`]
- [ ] **No input validation on backend** — No message count limit, no content length limit, no role validation. Attackers can send huge payloads to inflate LLM costs. (Security) [`server.ts:10-14`]
- [ ] **No rate limiting** — No per-IP rate limit on `/api/generate`. Add `express-rate-limit`. (Security) [`server.ts`]
- [ ] **Audio cloneNode memory leak** — `useAudio.ts` creates cloned `HTMLAudioElement` nodes that are never released. Accumulates on rapid interactions. (Performance) [`useAudio.ts:17-23`]
- [ ] **Race condition in iframe error handler** — Handler captures stale `messages` state in closure. Auto-fix sends outdated context to the LLM. (Stability) [`App.tsx:285-326`]
- [ ] **Partial code persisted during streaming** — `currentCode` written to localStorage on every change including mid-stream; a cancelled stream saves invalid HTML. (Stability) [`App.tsx:332-334`]
- [ ] **`currentCode` not updated on user remix** — When user edits in CodePanel and runs, `App.currentCode` stays as the AI version. Next AI generation ignores user edits. (Architecture) [`App.tsx:262-265`]
- [ ] **Reset button has no confirmation** — Instantly destroys conversation and code with no undo. Catastrophic for kids. (Playability)
- [ ] **App.tsx is 575 lines** — Violates the 400-line rule. TDD_DESIGN envisioned 6 separate components (`ChatPanel`, `PreviewSandbox`, `BuddyAvatar`, `SuggestionChips`, `MessageInput`, `StreamingReply`) — none have been extracted. (Code Quality)
- [ ] **No content moderation** — User input goes directly to Gemini with no guardrails. Kids can prompt inappropriate content. (Security) [`llmService.ts`]
- [ ] **Color contrast likely fails WCAG AA** — Green `#39ff14` on dark background. No contrast audit performed. (UI/UX)

### MEDIUM

- [ ] **`injectErrorCatcher` runs every render** — Called inline in JSX without `useMemo`. Recomputes string injection on every state change. (Performance) [`App.tsx:349`]
- [ ] **No focus management on chat open/close** — Keyboard users lose focus context when chat panel toggles. (UI/UX)
- [ ] **Hacker Mode "BUILDING" has no educational content** — 20-40s dead wait time with no learning value. Competitors teach during wait. (Playability)
- [ ] **"Look Inside" shows raw HTML** — Overwhelming for 8-10 year olds. No syntax highlighting or annotations. (Playability)
- [ ] **No onboarding/tutorial** — First-time users see a greeting and 4 chips, with no explanation of features. (Playability)
- [ ] **Error messages too technical for kids** — Raw JS error strings shown verbatim in conversation. (Playability)
- [ ] **No "dirty" indicator after code edit** — Kids cannot tell whether they are viewing their own code or AI-generated code. (Playability)
- [ ] **`experimental_useObject` is stale** — AI SDK 6 exports a stable `useObject`. (Code Quality)
- [ ] **Backend has no middleware architecture** — No auth, sanitization, or rate-limiting layers. Everything runs in a single route handler. (Architecture)
- [ ] **Shared types/constants not extracted** — `ChatMessage`, `STORAGE_KEYS`, and `SUGGESTION_CHIPS` are all defined inline in `App.tsx`. (Code Quality)

### LOW

- [ ] **Confetti timer not cleared on unmount** — Potential state update on an unmounted component. (Stability)
- [ ] **No E2E test for auto-fix flow** — Critical feature path is untested at the E2E level. (Stability)
- [ ] **Audio files loaded eagerly on mount** — 4 network requests before the user interacts with anything. (Performance)
- [ ] **Unicode escapes for emojis** — Use raw emoji chars instead of `\u{1F3C0}` escape sequences. (Code Quality)
- [ ] **DEFAULT_CODE is 60 lines of HTML inline in App.tsx** — Extract to a separate `defaultCode.ts` file. (Code Quality)
- [ ] **Suggestion chips disappear forever after first message** — Could reasonably reappear after a reset. (Playability)
- [ ] **Emoji favicon fails on Firefox Linux** — Known; no SVG fallback provided. (UI/UX)

---

## Worktree Workflow

When implementing features in worktrees:
1. Create worktree branch from `main`
2. Implement feature with TDD (RED → GREEN → REFACTOR)
3. Before merging back to `main`:
   - [ ] All unit tests pass (`cd frontend && npx vitest run`)
   - [ ] All backend tests pass (`cd backend && npx jest`)
   - [ ] All E2E tests pass (`npx playwright test`)
   - [ ] Code review agent run with no CRITICAL or HIGH issues
   - [ ] No `any` types in production code
   - [ ] No hardcoded secrets
   - [ ] Lint passes with no errors
4. Merge to `main` only after all checks pass
5. After successful merge, delete the worktree and its branch:
   ```bash
   git worktree remove <worktree-path>
   git branch -d <branch-name>
   ```
