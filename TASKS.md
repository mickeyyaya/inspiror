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
- [ ] Refactor `/api/generate` in `server.ts` to use `streamObject` instead of `generateObject`.
- [ ] Return a `toTextStreamResponse()` back to the client.
- [ ] Update `backend/tests/api.test.ts` to expect a stream.

### Frontend Tasks
- [ ] Install `@ai-sdk/react`.
- [ ] Refactor `App.tsx` to use the `experimental_useObject` (or `useChat`) hook to consume the stream.
- [ ] Build the "Hacker Mode" UI: When generating, display a glowing, matrix-style overlay showing the `currentCode` streaming in real-time.
- [ ] Render the AI's chat reply as a typewriter effect as the stream comes in.
- [ ] Only update the actual `iframe srcDoc` when the code generation is substantially complete (to prevent broken HTML flashes).
- [ ] Ensure tests pass (Green Phase).

## Phase 2: Contextual Memory & Prompt Scaffolding (Magic Buttons) [ ]
**Goal:** Prevent blank-canvas syndrome and allow iterative code edits.

### Backend Tasks
- [ ] Add `currentCode?: string` to the request payload validation in `/api/generate`.
- [ ] Update `backend/tests/api.test.ts` to mock and expect `currentCode`.
- [ ] Update `llmService.ts` system prompt to receive and inject `currentCode` if provided, so the AI understands what it is modifying.

### Frontend Tasks
- [ ] Create a `SuggestionChips` React component with 3-4 predefined visual prompts (e.g., "🎨 Draw a Neon Paint App").
- [ ] Update `App.test.tsx` to verify that `SuggestionChips` render when the chat history only contains the initial greeting.
- [ ] Update `App.test.tsx` to verify clicking a chip auto-populates the input and sends the message.
- [ ] Update `App.test.tsx` to verify that `currentCode` is included in the `fetch` payload to the backend.
- [ ] Implement the UI changes in `App.tsx` and ensure tests pass (Green Phase).

## Phase 3: Auto-Fix Error Handling [ ]
**Goal:** Automatically detect and fix JavaScript errors that occur inside the generated sandbox.

### Frontend Tasks
- [ ] Add tests in `App.test.tsx` simulating a JavaScript runtime `error` event originating from the `iframe`.
- [ ] Inject a hidden script into the `currentCode` before rendering it in the `iframe` that listens for `window.onerror` and uses `window.parent.postMessage` to send the error string up to the React app.
- [ ] Implement a `window.addEventListener('message')` in `App.tsx` to catch these sandbox errors.
- [ ] When an error is caught: 
    - Auto-append a hidden message to the API: "The following error occurred: [ERROR]. Fix it."
    - Display a friendly system message to the user: "Oops, I made a little mistake! Let me fix that real quick..."
    - Set `isGenerating` to true and fetch the correction.
- [ ] Ensure tests pass (Green Phase).

## Phase 4: Local Storage Persistence [ ]
**Goal:** Ensure kids don't lose their work if the page is refreshed, without requiring accounts.

### Frontend Tasks
- [ ] Add tests verifying that `localStorage.getItem` is called on initial render.
- [ ] Add tests verifying that `localStorage.setItem` is called whenever `messages` or `currentCode` state changes.
- [ ] Implement a custom hook `useLocalStorageState` (or `useEffect` logic) in `App.tsx` to persist and load data.
- [ ] Ensure tests pass (Green Phase).

## Phase 5: Polish & Deployment (Future)
- [ ] Add "Clear/Reset Project" button.
- [ ] Implement responsive UI checks for specific tablet/mobile screen sizes.
- [ ] Configure deployment pipelines (e.g., Vercel for Frontend, Render/Railway for Backend).
