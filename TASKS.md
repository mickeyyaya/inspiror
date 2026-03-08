# Inspiror Task Breakdown (TDD)

## Phase 1: Core Chat & Code Generation [x]
*(Completed)*

## Phase 1.5: Real-Time Streaming & "Hacker Mode" UI [ ]
**Goal:** Mesmerize kids by showing them exactly what the AI is building in real-time, character by character.

### Backend Tasks (Express API)
- [ ] Refactor `llmService.ts`: Instead of `await result.object`, return the full `result` stream object from `streamObject()`.
- [ ] Update `server.ts` `/api/generate`: Use Vercel AI SDK's streaming methods for Express. Call `result.pipeTextStreamToResponse(res)` to send chunked updates instead of a static JSON response.
- [ ] Update API Tests: Mock the streaming interface in `backend/tests/api.test.ts` to expect chunked data or stream initialization.

### Frontend Tasks (React UI)
- [ ] Run `npm install @ai-sdk/react` in the frontend directory.
- [ ] Refactor `App.tsx` state management: Replace the manual `fetch` logic with the `experimental_useObject` hook from `@ai-sdk/react` to automatically consume the `toTextStreamResponse`.
- [ ] UI - "Hacker Mode" Implementation: 
    - Bind `object?.code` (the streaming string) to the Hacker Mode `pre` tag overlay. This will cause the text to fly onto the screen like matrix code.
    - Bind `object?.reply` to the active chat bubble to create a typewriter effect for the AI's response.
- [ ] HTML Sandbox Safety: Ensure the `iframe`'s `srcDoc` uses a stable version of the code (e.g., only update `currentCode` when `isLoading` transitions to `false`). Do not feed partial HTML chunks into the iframe during generation to avoid visual glitching.
- [ ] Write tests ensuring `experimental_useObject` is called and UI renders partial streaming state.

## Phase 2: Contextual Memory & Prompt Scaffolding (Magic Buttons) [x]
*(Completed)*

## Phase 2.5: UX Polish & Auditory Feedback [ ]
**Goal:** Implement research findings on kids' UX (Visual Subtraction, Skeuomorphism, and Sound).

### Frontend Tasks - Audio Integration
- [ ] Source or generate 4 kid-friendly royalty-free sound effects (e.g., `send-pop.mp3`, `chip-click.mp3`, `success-chime.mp3`, `error-buzzer.mp3`) and add them to `public/sounds/`.
- [ ] Create a `useAudio` custom React hook to preload and play these sounds asynchronously without blocking the main thread.
- [ ] Hook `send-pop` into the `handleSend` function.
- [ ] Hook `chip-click` into the `handleChipClick` function.
- [ ] Hook `success-chime` into the completion block of the generation stream.
- [ ] Hook `error-buzzer` into the `window.onerror` iframe message listener.

### Frontend Tasks - Skeuomorphic UI
- [ ] Update the `SuggestionChips` styling: Add deep shadows and translation (e.g., `shadow-[0_4px_0_rgb(0,200,255)] active:shadow-none active:translate-y-[4px]`) so they feel like physical, clickable buttons.
- [ ] Apply similar tactile CSS logic to the main "Send" button and the floating chat toggle.
- [ ] Play/Edit Toggle: Add a prominent toggle at the top of the screen to switch between "Build Mode" (shows chat/hacker overlay) and "Play Mode" (hides UI, focuses iframe).

## Phase 3: Educational Auto-Fix Error Handling [x]
*(Completed)*

## Phase 4: Local Storage Persistence [x]
*(Completed)*

## Phase 5: Polish & Deployment [ ]
- [x] Add "Clear/Reset Project" button in chat header.
- [x] E2E test suite covering all features (18 Playwright tests).
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