# Inspiror Task Breakdown (TDD)

## Phase 1: Core Chat & Code Generation [x]
- [x] Scaffold Frontend (React, Vite, Tailwind CSS, Vitest)
- [x] Scaffold Backend (Node.js, Express, Jest, Supertest)
- [x] Implement LLM Provider Pattern (Vercel AI SDK + Zod)
- [x] Create API endpoint `POST /api/generate` with mocked tests
- [x] Build Chat UI with floating window layout and neon styling
- [x] Implement Full-Screen Sandbox (`iframe` with `srcDoc`)
- [x] Add "Building..." loading indicator and AI Avatar
- [x] Verify Green Phase (Frontend & Backend tests passing)

## Phase 1.5: Real-Time Streaming & "Hacker Mode" UI [ ]
**Goal:** Mesmerize kids by showing them exactly what the AI is building in real-time, character by character.

### Backend Tasks
- [x] Refactor `llmService.ts` to use `streamObject` instead of `generateObject` (Partially done, but currently awaits the full object).
- [ ] Refactor `/api/generate` in `server.ts` to return `result.toTextStreamResponse()` back to the client.
- [ ] Update `backend/tests/api.test.ts` to expect a stream.

### Frontend Tasks
- [x] Build the "Hacker Mode" UI overlay (Glowing matrix style, "BUILDING..." text, disappears on completion).
- [ ] Install `@ai-sdk/react`.
- [ ] Refactor `App.tsx` to use the `experimental_useObject` (or `useChat`) hook to consume the stream and update the UI in real-time.
- [ ] Only update the actual `iframe srcDoc` when the code generation is substantially complete (to prevent broken HTML flashes).
- [ ] Ensure tests pass (Green Phase).

## Phase 2: Contextual Memory & Prompt Scaffolding (Magic Buttons) [x]
**Goal:** Prevent blank-canvas syndrome and allow iterative code edits.

### Backend Tasks
- [x] Add `currentCode?: string` to the request payload validation in `/api/generate`.
- [x] Update `backend/tests/api.test.ts` to mock and expect `currentCode`.
- [x] Update `llmService.ts` system prompt to receive and inject `currentCode` if provided, so the AI understands what it is modifying.

### Frontend Tasks
- [x] Create Suggestion Chips with 4 predefined visual prompts (bouncing ball, neon paint, glowing clock, space adventure).
- [x] Update `App.test.tsx` to verify that Suggestion Chips render when the chat history only contains the initial greeting.
- [x] Update `App.test.tsx` to verify clicking a chip sends the message and chips disappear.
- [x] Update `App.test.tsx` to verify that `currentCode` is included in the `fetch` payload to the backend.
- [x] Implement the UI changes in `App.tsx` and ensure tests pass (Green Phase).

## Phase 2.5: UX Polish & Auditory Feedback [ ]
**Goal:** Implement research findings on kids' UX (Visual Subtraction, Skeuomorphism, and Sound).

### Frontend Tasks
- [ ] Add satisfying, kid-friendly sound effects for clicks, message sends, and generation completion.
- [ ] Implement Skeuomorphic depth to buttons (Magic Buttons, Send button) to make them look tactile and clickable.
- [ ] Ensure "Visual Subtraction" by keeping the UI clean and flat without nested menus.

## Phase 3: Educational Auto-Fix Error Handling [x]
**Goal:** Automatically detect errors and use them as teachable moments for the child.

### Frontend Tasks
- [x] Add tests in `App.test.tsx` simulating a JavaScript runtime `error` event originating from the `iframe`.
- [x] Inject a hidden script into the `currentCode` before rendering it in the `iframe` that listens for `window.onerror` and uses `window.parent.postMessage` to send the error string up to the React app.
- [x] Implement a `window.addEventListener('message')` in `App.tsx` to catch these sandbox errors.
- [x] When an error is caught: 
    - Auto-append a hidden message to the API: "The following error occurred: [ERROR]. Explain it simply and fix it."
    - Display a friendly, educational system message to the user (e.g., "Oops! The gravity broke your code. I'm fixing it now...").
    - Set `isGenerating` to true and fetch the correction.
- [x] Ensure tests pass (Green Phase).

## Phase 4: Local Storage Persistence [x]
**Goal:** Ensure kids don't lose their work if the page is refreshed, without requiring accounts.

### Frontend Tasks
- [x] Add tests verifying that `localStorage.getItem` is called on initial render.
- [x] Add tests verifying that `localStorage.setItem` is called whenever `messages` or `currentCode` state changes.
- [x] Implement localStorage persistence in `App.tsx` to persist and load data.
- [x] Ensure tests pass (Green Phase).

## Phase 5: Polish & Deployment [x]
- [x] Add "Clear/Reset Project" button in chat header.
- [x] E2E test suite covering all features (18 Playwright tests).
- [ ] Implement responsive UI checks for specific tablet/mobile screen sizes.
- [ ] Configure deployment pipelines (e.g., Vercel for Frontend, Render/Railway for Backend).

## Phase 6: Deep Engagement & Retention (Future) [ ]
**Goal:** Implement features that keep kids coming back based on research of platforms like Scratch and Roblox.
- [ ] **"Look Inside" / Code Remixing:** Add a toggle to slide open a safe, readable panel displaying the generated HTML/JS. Allow kids to manually tweak numbers (like a character's jump height) and see the instant result.
- [ ] **Asset Upload (Personalization):** Add an image upload button to the chat so kids can feed their own drawings or photos into the AI to use as sprites.
- [ ] **Gamified Progression:** Implement an achievement system (e.g., earning a "Code Ninja" badge for building 5 games) and unlockable AI Buddy avatars (e.g., unlocking a Dragon buddy) stored in LocalStorage.
