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

## Phase 2.5: UX Polish, Visual Delight & Auditory Feedback [x]
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

### Frontend Tasks - Audio Integration (COMPLETED)
- [x] Source or generate 4 kid-friendly royalty-free sound effects (e.g., `send-pop.mp3`, `chip-click.mp3`, `success-chime.mp3`, `error-buzzer.mp3`) and add them to `public/sounds/`.
- [x] Create a `useAudio` custom React hook to preload and play these sounds asynchronously without blocking the main thread.
- [x] Hook `send-pop` into the `handleSend` function.
- [x] Hook `chip-click` into the `handleChipClick` function.
- [x] Hook `success-chime` into the completion block of the generation stream.
- [x] Hook `error-buzzer` into the `window.onerror` iframe message listener.

### Frontend Tasks - Play/Edit Toggle (COMPLETED)
- [x] Add a prominent toggle at the top of the screen to switch between "Build Mode" (shows chat/hacker overlay) and "Play Mode" (hides UI, focuses iframe).

## Phase 3: Educational Auto-Fix Error Handling [x]
*(Completed)*

## Phase 4: Local Storage Persistence [x]
*(Completed)*

## Phase 5: Polish & Deployment [x]
- [x] Add "Clear/Reset Project" button in chat header.
- [x] E2E test suite covering all features (22 Playwright tests).
- [x] CSS Media Queries: Add Tailwind responsive classes for tablet/phone layouts.
- [x] Containerize the backend with a `Dockerfile` for easy deployment to Railway/Render.
- [x] Add `vercel.json` and configure Vite for zero-config Vercel deployment.

## Phase 5.5: Multi-Project Support [x]
**Goal:** Allow kids to manage multiple projects from a catalog, each with independent chat + code state.

### Frontend Tasks
- [x] Create `types/project.ts`: `ChatMessage` (with `id` field) and `Project` interfaces.
- [x] Create `hooks/useProjects.ts`: Multi-project CRUD hook with localStorage persistence.
- [x] Legacy data migration: Auto-migrate old `inspiror-messages` / `inspiror-currentCode` to new `inspiror_projects` format.
- [x] Auto-title extraction from first user message (truncated to 40 chars at word boundary).
- [x] Create `components/ProjectCatalog.tsx`: Grid of project cards with Open, Delete, and New Project actions. Responsive grid (1→4 cols). Empty state with rocket emoji.
- [x] Refactor `App.tsx`: Split into `App` (router between catalog and editor) + `EditorView` (full editor). Mount `EditorView` with `key={project.id}` to reset state per project.
- [x] Add "Back to Projects" button in chat header (`ArrowLeft` icon).
- [x] Unit tests: 8 project catalog tests (empty state, create, open, delete, migrate legacy, navigate back).
- [x] Expanded E2E test suite to 57 tests covering all new and existing features.
- [x] Expanded unit test suite to 45+ tests covering edge cases (error catcher branches, error handling, partial finishes, JSON parse failures).

## Phase 6: Visual Block Editor [x]
**Goal:** Add a Scratch-inspired visual block editor so kids can manipulate generated code through draggable blocks instead of raw text.

### Completed
- [x] `BlockEditor` component: dnd-kit-powered drag-and-drop block reordering with `DndContext` + `SortableContext`.
- [x] `BlockCard` component: visual card per block with color-coded category chips, param sliders, and live value display.
- [x] `ParamEditor` component: slider-based numeric param editing that recompiles the block to code on change.
- [x] `compileBlocks` runtime engine: converts `BlockDefinition[]` into a valid HTML/JS string executed in the preview iframe.
- [x] `BlockCategory` enum shared between frontend and backend schemas.
- [x] `/api/convert-to-blocks` backend endpoint: sends current code to Gemini, returns structured `BlockDefinition[]`.
- [x] Block panel slide-in UI integrated into `EditorView` with open/close toggle.
- [x] `recordRemix` hook wired to block edits so changes feed back into conversation history.

## Phase 7: Deep Engagement & Retention (Future) [ ]
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

## Cycle 7 Audit: Block Editor — New Issues [ ]

### CRITICAL / HIGH

- [ ] **No tests for BlockEditor, BlockCard, ParamEditor** — Three new components shipped with zero unit tests. Write Vitest tests for all three before any further feature work. (Code Quality)
- [ ] **No rate limiter on `/api/convert-to-blocks`** — New endpoint has no `express-rate-limit` guard; one kid spamming the button can exhaust the Gemini quota. Add per-IP rate limiting matching the `/api/generate` policy. (Security) [`server.ts`]
- [ ] **Remove dead `@google/genai` dependency** — Still present in `backend/package.json` after Cycle 3 audit; now confirmed unused. Remove to reduce install size and supply-chain surface. (Code Quality) [`backend/package.json`]
- [ ] **Debounce `compileBlocks` on param slider changes** — Every slider `onChange` event triggers a full recompile and iframe reload with no debounce. Add 50-100ms debounce to prevent jank on rapid slider drags. (Performance) [`ParamEditor`]
- [ ] **Add `aria-hidden` to block panel when closed** — Block panel stays in the DOM when closed; screen readers traverse off-screen block cards. Add `aria-hidden={!isBlockPanelOpen}`. (Accessibility) [`EditorView`]
- [ ] **Wire `/api/convert-to-blocks` into frontend for legacy project auto-conversion** — Existing projects that predate the block editor never get their code converted. Trigger conversion on first block panel open when `blocks` state is empty. (Architecture)
- [ ] **Extract Gemini model name to constant/env var in `llmService.ts`** — Model identifier still hardcoded as a string literal (carried from Cycle 3 audit). Extract to `GEMINI_MODEL` constant or environment variable. (Code Quality) [`llmService.ts`]
- [ ] **Remove orphaned `CodePanel.tsx`** — `CodePanel` was superseded by `BlockEditor` but the file was not deleted. Dead code increases bundle size and causes confusion. (Code Quality)

### MEDIUM

- [ ] **Migrate `experimental_useObject` to stable `useObject`** — Carried from Cycle 3 audit. AI SDK 6 promotes this to a stable export; the experimental import will break in a future release. (Code Quality) [`App.tsx`]
- [ ] **Add kid-friendly ARIA announcements for dnd-kit drag operations** — Default dnd-kit announcements are developer-facing ("Item 1 was picked up"). Replace with custom `announcements` prop using child-appropriate language ("Block picked up! Drop it where you want it to go."). (Accessibility) [`BlockEditor`]
- [ ] **Add block deletion to `BlockCard`** — There is currently no way to remove a block once it has been added. Add a delete button (trash icon, large touch target). (Playability) [`BlockCard`]
- [ ] **Add "Ask AI to add a block" button in block panel** — Kids can reorder and edit existing blocks but cannot add new ones without leaving the panel. Add a chat-passthrough button that sends a request to the AI Buddy. (Playability)
- [ ] **Block panel close button is hardcoded English** — `"Close"` label is not translated. Add i18n key. (i18n) [`BlockEditor`]
- [ ] **`CodePanel` hardcoded English strings** — Several strings in the now-orphaned `CodePanel.tsx` are not translated. Moot once the file is deleted, but confirm removal before de-prioritizing. (i18n) [`CodePanel.tsx`]
- [ ] **ProjectCatalog delete confirmation dialog** — Instant project deletion on button click with no undo. Catastrophic for kids (also noted in Cycle 3). (Playability) [`ProjectCatalog.tsx`]
- [ ] **`useMemo` for `sortedBlocks` in `BlockEditor`** — Block array is sorted on every render without memoization. Wrap in `useMemo` with `[blocks]` dependency. (Performance) [`BlockEditor`]
- [ ] **Abstract dnd-kit behind an interface layer** — dnd-kit issue #1194 and reduced maintainer activity signal maintenance risk. Wrapping drag-and-drop behind a `DragContext` interface allows a library swap without touching every component. (Architecture) [`BlockEditor`]
- [ ] **Focus trap for `AchievementModal` and `BadgeGallery`** — Modal dialogs do not trap keyboard focus; tab key escapes to background content. (Accessibility)
- [ ] **`useAudio` `cloneNode` memory leak** — Carried from Cycle 2/3 audits. `cloneNode` accumulates `HTMLAudioElement` instances on rapid interactions with no cleanup. (Performance) [`useAudio.ts`]
- [ ] **`handleRunCode` missing `isLoading` guard** — If a user triggers run while generation is in progress, the iframe state can become inconsistent. Add an `isLoading` guard matching the pattern used in `handleSend`. (Stability)
- [ ] **Add Express global error middleware** — Carried from Cycle 3 audit. Uncaught async errors in route handlers return empty responses. Add `(err, req, res, next)` middleware at the end of `server.ts`. (Stability) [`server.ts`]

### LOW

- [ ] **Block panel empty state message** — When no blocks are present (new project or failed conversion), the panel shows a blank area with no guidance. Add a short instructional message. (Playability) [`BlockEditor`]
- [ ] **Schema duplication for `BlockCategory`** — `BlockCategory` is defined in three places: frontend `types/`, backend `llmService.ts`, and the Zod schema. Extract to a single shared package or generate one from the other. (Code Quality)
- [ ] **Minify `RUNTIME_ENGINE` string** — The compiled runtime engine string embedded in each iframe is not minified, adding unnecessary bytes to every preview reload. (Performance)
- [ ] **Enforce Vitest coverage thresholds** — `vitest.config.ts` still lacks `coverage.thresholds` (carried from Cycle 3 audit). CI can pass with arbitrarily low coverage. (Code Quality) [`vitest.config.ts`]
- [ ] **Add high-contrast block color mode** — Scratch uses distinct, high-contrast block colors per category for accessibility. Add a toggle or auto-detect `prefers-contrast: more` for block panel colors. (Accessibility)

## Backlog: New Features [ ]

### Voice-Guided Coding with Gemini TTS
- [ ] Integrate Gemini 3 native TTS to let the AI Buddy speak instructions aloud
- [ ] Kids can hear the AI Buddy explain what it is building, making the experience accessible to younger or pre-literate users
- [ ] Requires audio playback controls (play/pause/stop) and volume adjustment

### Dark Mode Toggle
- [ ] Add a dark/light mode toggle in the UI header
- [ ] Tweens (10-14) prefer grown-up looking interfaces; dark mode signals "real developer" credibility
- [ ] Persist preference in localStorage

### Customizable Themes & Avatars
- [ ] Allow kids to pick from multiple color themes (neon, pastel, retro pixel, etc.)
- [ ] Let kids choose or unlock different AI Buddy avatars for self-expression
- [ ] Persist selections in localStorage per project or globally

### Educational Loading Screen
- [ ] Show coding facts, tips, or mini-challenges during generation wait times (inspired by Codorex's approach)
- [ ] Rotate through a curated list of age-appropriate coding trivia
- [ ] Replace or augment the current hacker mode overlay with educational content

## Technical Debt (from Code Review)

### Must Fix Before Next Feature
- [x] **Message list keys:** Replace `key={idx}` with stable keys (`crypto.randomUUID()` with migration) to prevent incorrect DOM reuse.
- [x] **Confetti timer reset:** Reset confetti timer on rapid-fire generations using `confettiTimerRef` with `clearTimeout`.
- [x] **Accessibility:** Add `aria-hidden={!isChatVisible}` to hidden chat panel so screen readers don't traverse off-screen content.

### Security & Dependencies
- [ ] **CVE audit:** Verify all dependencies for known CVEs (Vite 7.3.1 covers CVE-2025-58752; React RSC CVE-2025-55182 does not apply to client-side only)
- [ ] **Dependency update cadence:** Establish a regular schedule to run `npm audit` and update vulnerable packages across frontend, backend, and e2e

### Migration
- [ ] **Evaluate AI SDK 6 agent abstraction:** AI SDK 6 introduces typed `UIMessage` vs `ModelMessage` and agent workflows for multi-step code generation. Evaluate migration path from current `experimental_useObject` usage.

### Nice to Fix
- [x] **Confetti CSS coupling:** Refactored to use inline `style={{}}` on each confetti piece, removed `nth-child` selectors.
- [x] **Favicon fallback:** Replaced emoji favicon with SVG rocket shape for cross-browser reliability.

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

---

## Cycle 8 Audit [ ]

Audit covers: Safety, Security, Architecture, Code Quality, Performance, Accessibility, Playability, and i18n.
Audited against actual source on `main` branch (March 2026 — Cycle 8).

### HIGH

- [ ] **No content moderation in system prompt** — No guardrails against inappropriate content generation. Critical gap for a platform targeting ages 8-14. Add explicit safety instructions to `basePrompt` in `llmService.ts`. (Safety) [`llmService.ts`] *(carried from Cycle 2)*
- [ ] **`@google/genai` unused dependency** — `"@google/genai": "^1.44.0"` present in `backend/package.json`; project uses `@ai-sdk/google`. Dead dependency adds supply-chain risk and install weight. Remove it. (Security) [`backend/package.json`] *(carried from Cycle 3 and Cycle 7)*
- [ ] **Gemini model name hardcoded twice** — `google("gemini-3.1-flash-lite-preview")` appears at lines 250 and 291 of `llmService.ts`. Extract to a `GEMINI_MODEL` constant or `GEMINI_MODEL` env var to allow environment-specific overrides without code changes. (Code Quality) [`llmService.ts`] *(carried from Cycle 3 and Cycle 7)*
- [ ] **Schema duplication frontend/backend** — `generationSchema`, `blockSchema`, and `blockParamSchema` are defined identically in both `constants.ts` (frontend) and `llmService.ts` (backend). Any schema change must be applied in two places; divergence is inevitable. Extract to a shared package or generate one from the other. (Architecture)
- [ ] **`experimental_useObject` deprecation risk** — `EditorView.tsx` line 2 imports from the experimental path. Stable `useObject` is available in `@ai-sdk/react`. The experimental import will break on a future SDK release. (Code Quality) [`EditorView.tsx`] *(carried from Cycle 3 and Cycle 7)*
- [ ] **No Express global error handler** — Uncaught async errors in route handlers return empty responses to the client. Add a `(err, req, res, next)` middleware at the end of `server.ts`. (Stability) [`server.ts`] *(carried from Cycle 3 and Cycle 7)*
- [ ] **Project delete has no confirmation dialog** — `ProjectCatalog.tsx` line 133 deletes a project instantly on click with no undo. A mis-tap permanently destroys a kid's work. (Playability) [`ProjectCatalog.tsx`] *(carried from Cycle 3 and Cycle 7)*
- [ ] **Legacy project blocks mismatch** — Block panel shows `DEFAULT_BLOCKS` for projects created before the block editor instead of converting their code. The `/api/convert-to-blocks` endpoint exists but is never called on panel open for legacy projects. Trigger conversion on first block panel open when `blocks` state is empty. (Architecture) *(carried from Cycle 7)*
- [ ] **`useAudio` cloneNode memory leak** — `createPlayer` creates unbounded `HTMLAudioElement` clones on every play call with no cleanup. Accumulates on rapid interactions and is never released in the hook teardown. (Performance) [`useAudio.ts`] *(carried from Cycle 2, Cycle 3, and Cycle 7)*

### MEDIUM

- [ ] **Dead `CodePanel.tsx` and its tests** — `CodePanel` was superseded by `BlockEditor` but the file and associated tests were not deleted. Dead code increases bundle size and causes confusion. Remove both. (Code Quality) *(carried from Cycle 7)*
- [ ] **`useVoice.ts` has 6 `any` types** — Six `any` annotations in voice input hook; replace with proper `SpeechRecognition` and `SpeechRecognitionEvent` types from `@types/dom-speech-recognition`. (Code Quality) [`useVoice.ts`]
- [ ] **No `prefers-reduced-motion` media query** — CSS animations in `index.css` run unconditionally. Users who have enabled reduced motion in their OS settings still see all animations. Wrap keyframe animations in `@media (prefers-reduced-motion: no-preference)`. (Accessibility) [`index.css`]
- [ ] **Block panel "Close" button hardcoded English** — `"Close"` label is not passed through the i18n system. Add an i18n key. (i18n) [`BlockEditor`] *(carried from Cycle 7)*
- [ ] **No block deletion UI** — Once added, blocks cannot be removed from the panel. They accumulate indefinitely. Add a delete button to `BlockCard`. (Playability) *(carried from Cycle 7)*
- [ ] **Vitest coverage thresholds not enforced** — `vitest.config.ts` lacks `coverage.thresholds`; current branch coverage is 74.79%, below the 80% target. CI passes with arbitrarily low coverage. Add thresholds for `branches`, `functions`, `lines`, and `statements`. (Code Quality) [`vitest.config.ts`] *(carried from Cycle 3 and Cycle 7)*
- [ ] **`EditorView.tsx` is 436 lines** — Exceeds the 400-line soft ceiling. Extract block panel logic or param editor wiring into a dedicated hook or sub-component. (Code Quality) [`EditorView.tsx`]
- [ ] **No E2E tests for block editor, achievements, or voice features** — Three significant feature areas have no Playwright coverage. Add E2E tests for the block panel open/close flow, param slider interaction, and voice input toggle. (Code Quality)
- [ ] **No CSP header on frontend** — No `Content-Security-Policy` header is set. Add a CSP that restricts `script-src` and `frame-src` to prevent XSS and iframe injection attacks. (Security)
- [ ] **No startup validation of `GOOGLE_GENERATIVE_AI_API_KEY`** — The backend does not check for the presence of the API key at startup. Missing key causes a cryptic runtime error on the first request. Add a startup check that exits with a clear message if the key is absent. (Stability) [`server.ts`]
- [ ] **No focus management on block panel open/close** — Opening the block panel does not move keyboard focus into it; closing it does not return focus to the trigger button. (Accessibility) [`EditorView.tsx`]

### LOW

- [ ] **`ProjectCatalog` hardcodes bilingual "waiting for you!"** — The empty-state string is a hardcoded bilingual literal instead of an i18n key. Replace with the translation system. (i18n) [`ProjectCatalog.tsx`]
- [ ] **No "dirty" indicator after block edits** — After editing block params, the UI gives no visual cue that the project has unsaved or unsynced changes relative to the AI-generated code. (Playability)
- [ ] **`getWelcomeCode` 90-line template in `useProjects.ts`** — Large inline HTML template inflates the hook file. Extract to `src/constants/welcomeCode.ts`. (Code Quality) [`useProjects.ts`]
- [ ] **Color contrast of `#39ff14` neon green fails WCAG AA** — Neon green text on dark backgrounds does not meet the 4.5:1 contrast ratio. Replace with a WCAG-compliant green or add a high-contrast mode. (Accessibility) *(carried from Cycle 2)*
- [ ] **Block panel empty state has no guidance message** — When the panel is empty (new project or failed conversion), kids see a blank area with no instructions. Add a short message explaining how to populate blocks. (Playability) *(carried from Cycle 7)*

---

## Cycle 14 Audit [ ]

Audit covers: Security, Stability, Performance, UI/UX, Playability, Code Quality, Architecture.
Audited against actual source on `main` branch (March 2026 — Cycle 14).

### CRITICAL

- [ ] **`eval()` on LLM-generated check expressions** — `buildCheckRunner` in `compileBlocks.ts:46` emits `eval(checks[i])` where checks originate from LLM output. An untrusted check like `while(1){}` freezes the iframe permanently. Replace with a whitelist of safe intrinsic expressions or strip self-verification checks. (Security) [`compileBlocks.ts`]
- [ ] **postMessage wildcard `"*"` origin in all compiled output** — `compileBlocks.ts`, `engine.ts:196`, and `injectErrorCatcher.ts` all use `postMessage({...}, "*")`. Data-leak vector on shared hosting. Change to `window.location.origin`. (Security) *(re-prioritized from deferred)*

### HIGH

- [ ] **No fetch timeout on legacy conversion** — `useLegacyConversion.ts:50` fetch has no AbortController/timeout. `isConverting` hangs indefinitely if backend stalls. (Stability)
- [ ] **Achievement unlock race condition** — `useAchievements.ts:64` uses `setTimeout(0)` in setState updater, causing stale closures + skipped achievements on rapid unlocks. (Stability)
- [ ] **zh-CN untitled project never auto-renamed** — `useProjects.ts:282` checks zh-TW `"未命名項目"` but not zh-CN `"未命名项目"`. (Code Quality)
- [ ] **Unbounded localStorage writes during streaming** — `EditorView.tsx:279` calls `onUpdate` on every streaming token with no debounce (30-60 writes/sec). Causes jank on Safari iOS. (Performance)
- [ ] **"Blocks" label in PreviewPanel hardcoded English** — `PreviewPanel.tsx:81` shows "5 Blocks" for zh-TW/zh-CN users. (i18n)
- [ ] **"More ideas" shuffle button not translated** — `MessageList.tsx:108` hardcoded English. (i18n)
- [ ] **"Builder Buddy" app name not i18n** — `ChatHeader.tsx:74` hardcoded English. (i18n, may be intentional branding)

### MEDIUM

- [ ] **No unit tests for `useProjects.ts`** — Most critical data hook with zero test coverage. (Code Quality)
- [ ] **No project share/export** — Competitive gap vs Codorex, Rosebud, Upit. Export as HTML download is trivial. (Features)
- [ ] **Runtime engine 952 lines re-parsed on every compile** — `engine.ts` not minified, embedded verbatim in every srcDoc. (Performance)
- [ ] **`injectErrorCatcher` naive `</head>` search** — Can inject script in wrong position if CSS comment contains `</head>`. (Stability)
- [ ] **`useLegacyConversion` ignores language changes after mount** — Empty deps array with eslint-disable. (Architecture)
- [ ] **No undo/redo for block edits** — Kids lose work on accidental delete/reorder. (Playability)
- [ ] **localStorage quota exhaustion not handled** — `useProjects.ts:225` no try/catch on setItem. Silent data loss. (Stability)
- [ ] **`</script>` breakout not sanitized in block code** — `compileBlocks.ts:80` embeds block JS inside `<script>` without sanitizing `</script>` sequences. (Security)

---

## Cycle 16 Audit [ ]

Audit covers: Stability, Features, Performance, Accessibility, Code Quality, Security, Architecture.
Audited against actual source on `main` branch (March 2026 — Cycle 16).

### Stability (HIGH)

- [ ] **No unit tests for `useProjects.ts`** — The most critical data hook in the codebase has zero test coverage. A regression here silently corrupts all project persistence. Write Vitest unit tests covering CRUD, localStorage round-trips, legacy migration, and auto-title extraction. (Stability) [`hooks/useProjects.ts`] *(carried from Cycle 14)*
- [ ] **Vitest coverage thresholds not enforced** — `vitest.config.ts` has no `coverage.thresholds` configured; coverage can regress silently and CI will still pass. Add thresholds for `branches`, `functions`, `lines`, and `statements` at the 80% target. (Stability) [`vitest.config.ts`] *(carried from Cycle 3, 7, 8)*
- [ ] **localStorage write try/catch missing in `useProjects` and `useAchievements`** — `setItem` calls are not wrapped in try/catch; `QuotaExceededError` on Safari private browsing and iOS causes silent data loss with no user feedback. Add try/catch with a visible error toast on write failure. (Stability) [`hooks/useProjects.ts`, `hooks/useAchievements.ts`]

### Features (HIGH)

- [ ] **No export / share HTML download button** — Single biggest competitive gap vs. Codorex, Rosebud, and Upit. Exporting the current preview as a self-contained HTML file is trivially achievable with a Blob download link. Implement in `PreviewPanel` or `ChatHeader`. (Features)
- [ ] **No onboarding / first-run tutorial tooltips** — The block panel, play mode toggle, and voice input are entirely undiscoverable by new users. Add contextual tooltip popovers that appear on first use and can be dismissed permanently via localStorage flag. (Features)

### Performance (MEDIUM)

- [ ] **Extract and minify `RUNTIME_ENGINE` string** — `engine.ts` is 952 lines of unminified JavaScript re-injected into every iframe `srcDoc` on every block change. Extract the engine to a build artifact and minify it; this alone should reduce per-compile payload by ~70%. (Performance) [`runtime/engine.ts`] *(carried from Cycle 14)*
- [ ] **Lazy-load block editor and dnd-kit** — `BlockEditor`, `BlockCard`, `ParamEditor`, and the entire dnd-kit dependency are eagerly bundled even for users who never open the block panel. Add a dynamic `import()` split point so these load only when the block panel is first opened. (Performance)
- [ ] **Audio pools lazy-initialize on first interaction** — `useAudio` eagerly creates 16 `HTMLAudioElement` instances on component mount before the user has interacted with anything. Defer pool creation to the first `play()` call to avoid unnecessary DOM allocation and network requests on mount. (Performance) [`hooks/useAudio.ts`] *(carried from Cycle 8)*

### Accessibility (MEDIUM)

- [ ] **No focus trap in `AchievementModal` / `BadgeGallery`** — Tab key escapes these modal dialogs into background content, violating WCAG 2.1 SC 2.1.2. Implement a focus trap (e.g., via `focus-trap-react` or a custom hook) for all modal dialogs. (Accessibility) *(carried from Cycle 7, 8)*
- [ ] **No focus management on block panel open / close** — Opening the block panel does not move keyboard focus into it; closing it does not return focus to the trigger button. (Accessibility) [`EditorView.tsx`] *(carried from Cycle 8)*

### Code Quality (MEDIUM)

- [ ] **Zod schema duplication frontend / backend** — `generationSchema`, `blockSchema`, and `blockParamSchema` are defined identically in `frontend/src/constants.ts` and `backend/src/llmService.ts`. Extract to a shared package or generate one from the other to eliminate drift. (Code Quality) *(carried from Cycle 8)*
- [ ] **Extract prompt strings from `llmService.ts` to `backend/src/prompts/`** — System prompts and user prompt templates are inline in `llmService.ts`, making them hard to review, test, or iterate on independently. Move each prompt to a dedicated file under `backend/src/prompts/`. (Code Quality) [`backend/src/llmService.ts`]
- [ ] **`ProjectCatalog` bilingual hardcoded string and pluralization bug** — The empty-state copy is a hardcoded bilingual literal rather than an i18n key, and count-based pluralization ("1 projects") is not handled. Replace with the translation system and add a plural form. (Code Quality) [`components/ProjectCatalog.tsx`] *(carried from Cycle 8)*
- [ ] **`EditorView.tsx` still 413 lines** — Exceeds the 400-line soft ceiling. Extract the block panel wrapper into a `BlockPanelContainer` component and the callback wiring into a `useEditorCallbackRefs` hook. (Code Quality) [`components/EditorView.tsx`] *(carried from Cycle 8)*

### Security (MEDIUM)

- [ ] **No CSP headers in `vercel.json`** — No `Content-Security-Policy` response header restricts `script-src` or `frame-src`. Add a CSP in `vercel.json` headers config to limit XSS and iframe injection surface. (Security) [`vercel.json`] *(carried from Cycle 8)*
- [ ] **`convertToBlocks` prompt injection via raw user code** — The `/api/convert-to-blocks` route embeds raw user-authored HTML/JS directly into the LLM prompt without sanitization. A crafted project can override system instructions. Strip or escape code before embedding in the prompt. (Security) [`backend/src/llmService.ts`]
- [ ] **Run `npm audit` across all workspaces** — No audit has been run recently. Execute `npm audit` in `frontend/`, `backend/`, and `e2e/` and remediate any HIGH or CRITICAL advisories before the next release. (Security)

### Architecture (MEDIUM)

- [ ] **No block-chat provenance linking** — Blocks compiled and injected into the iframe have no reference back to the chat turn or AI generation that produced them (`blocksVersion` / `generatedAt` field missing). This makes debugging regressions and attributing block state to conversation history impossible. Add a provenance field to `BlockDefinition`. (Architecture)
- [ ] **`useLegacyConversion` language dependency missing from effect deps array** — The conversion effect uses `language` from context but omits it from its dependency array (suppressed with eslint-disable). A language switch after mount will not re-trigger conversion. Add `language` to the dependency array and handle re-conversion correctly. (Architecture) [`hooks/useLegacyConversion.ts`] *(carried from Cycle 14)*
