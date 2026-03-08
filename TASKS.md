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
- [x] **Message list keys:** Replace `key={idx}` with stable keys (`crypto.randomUUID()` with migration) to prevent incorrect DOM reuse.
- [x] **Confetti timer reset:** Reset confetti timer on rapid-fire generations using `confettiTimerRef` with `clearTimeout`.
- [x] **Accessibility:** Add `aria-hidden={!isChatVisible}` to hidden chat panel so screen readers don't traverse off-screen content.

### Nice to Fix
- [x] **Confetti CSS coupling:** Refactored to use inline `style={{}}` on each confetti piece, removed `nth-child` selectors.
- [x] **Favicon fallback:** Replaced emoji favicon with SVG rocket shape for cross-browser reliability.

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
