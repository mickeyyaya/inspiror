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

## Phase 1.5: Real-Time Streaming & "Hacker Mode" UI [x]
**Goal:** Mesmerize kids by showing them exactly what the AI is building in real-time, character by character.

### Backend Tasks
- [x] Refactor `llmService.ts` to use `streamObject` instead of `generateObject`.
- [x] Update `backend/tests/api.test.ts` to mock `streamObject`.

### Frontend Tasks
- [x] Build the "Hacker Mode" UI: When generating, display a glowing, matrix-style overlay showing the `currentCode` in real-time.
- [x] Add "BUILDING..." text with spinning sparkles icon on the overlay.
- [x] Overlay disappears when generation completes.
- [x] Ensure tests pass (Green Phase).

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

## Phase 3: Auto-Fix Error Handling [x]
**Goal:** Automatically detect and fix JavaScript errors that occur inside the generated sandbox.

### Frontend Tasks
- [x] Add tests in `App.test.tsx` simulating a JavaScript runtime `error` event originating from the `iframe`.
- [x] Inject a hidden error-catching script into the `currentCode` before rendering it in the `iframe` that listens for `window.onerror` and uses `window.parent.postMessage` to send the error string up to the React app.
- [x] Implement a `window.addEventListener('message')` in `App.tsx` to catch these sandbox errors.
- [x] When an error is caught:
    - Auto-append a hidden message to the API: "The following error occurred: [ERROR]. Fix it."
    - Display a friendly system message to the user: "Oops, I made a little mistake! Let me fix that real quick..."
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
