# TDD & Technical Design Document: Inspiror

## 1. Architecture Overview
Inspiror follows a client-server architecture:
*   **Frontend (Client):** React, TypeScript, Vite, Tailwind CSS. Handles the kid-friendly UI, chat interface, state management, and the sandboxed iframe for live previews.
*   **Backend (Server):** Node.js, Express, TypeScript. Acts as a secure proxy to the LLM (e.g., Gemini API), injecting system prompts and streaming structured responses back to the client in real-time.

## 2. Component Design (Frontend)

### `App` (Root)
*   **Responsibility:** Layout container (Full screen preview with a floating chat window that can be hidden/turned off on desktop; stacked or adaptive on mobile). Manages global state (messages, current code).
*   **State:**
    *   `messages`: Array of chat messages (`{ role: 'user' | 'assistant', content: string }`).
    *   `currentCode`: String containing the generated HTML/CSS/JS payload.
    *   `isGenerating`: Boolean to control the display of visual loading animations.

### `ChatPanel`
*   **Responsibility:** Displays the conversation history, suggestion chips, and input field.
*   **Components:**
    *   `MessageList`: Renders individual `MessageBubble` components.
    *   `SuggestionChips`: Renders clickable "Magic Buttons" (e.g., "Make a bouncing ball") to help kids start without blank-canvas syndrome.
    *   `MessageInput`: Text input (and future voice input) for the user to type ideas.
    *   `LoadingAnimation`: A playful, animated component shown when `isGenerating` is true.

### `PreviewSandbox`
*   **Responsibility:** Renders the generated code securely.
*   **Implementation:** An `<iframe>` using the `srcdoc` attribute bound to `currentCode`. Includes a sandbox attribute (e.g., `sandbox="allow-scripts"`) for safety.

## 3. API Contract (Backend)

### `POST /api/generate`
*   **Request Body:**
    ```json
    {
      "messages": [
         { "role": "user", "content": "I want a drawing app" }
      ],
      "currentCode": "<html>...</html>" // Optional: For context on edits
    }
    ```
*   **Response:**
    A chunked **Stream** of the JSON object using Vercel AI SDK's `streamObject`. The client receives partial updates of:
    ```json
    {
      "reply": "Here is a...",
      "code": "<!DOCTYPE html><html..."
    }
    ```

## 4. Test-Driven Development (TDD) Strategy

We use **Vitest** and **React Testing Library** for the frontend, and **Jest** + **Supertest** for the backend.

### Phase 1: Core Chat & Code Generation (COMPLETED)
*   **Backend Test 1-3:** Route existence, input validation, LLM Provider mocking. (GREEN)
*   **Frontend Test 1-4:** Render initial chat, user input, loading animation, hide/show chat toggle, and iframe rendering. (GREEN)

### Phase 1.5: Real-Time Streaming & "Hacker Mode" UI (TODO)
*   **Backend Test:** Ensure `/api/generate` returns a streamed chunked response using Vercel AI SDK.
*   **Frontend Test:** Ensure the `experimental_useObject` hook processes the stream, rendering the "Hacker Mode" overlay with `object?.code` and updating the active chat bubble with `object?.reply`. 

### Phase 2: Contextual Memory & Prompt Scaffolding (COMPLETED)
*   **Backend Test 4:** Ensure `POST /api/generate` accepts `currentCode` in the request body and passes it to the LLM system prompt. (GREEN)
*   **Frontend Test 5:** Ensure the frontend sends `currentCode` alongside `messages` when making the API call. (GREEN)
*   **Frontend Test 5b:** Ensure "Suggestion Chips" (Magic Buttons) render when the chat is empty or waiting for initial input, and clicking one populates and submits the input. (GREEN)

### Phase 2.5: UX Polish & Auditory Feedback (TODO)
*   **Frontend Test:** Mock HTML5 Audio API and verify `useAudio` hook triggers correctly on message send, chip click, success, and error events.

### Phase 3: Educational Auto-Fix Error Handling (COMPLETED)
*   **Frontend Test 6:** Simulate an `error` event from the `PreviewSandbox` iframe. The app must catch it, display a friendly "Oops, fixing it!" assistant message, and automatically trigger a hidden generation request with the error details. (GREEN)

### Phase 4: Local Storage Persistence (COMPLETED)
*   **Frontend Test 7:** Verify that `messages` and `currentCode` are saved to `localStorage` when updated. (GREEN)
*   **Frontend Test 8:** Verify that the app initializes its state from `localStorage` on load instead of the default state. (GREEN)

### Phase 5 & 6: Deployment & Deep Engagement (Future)
*   **Frontend Test:** Verify "Look Inside" panel toggles and allows code edits.
*   **Frontend Test:** Verify image upload converts to Base64 and attaches to prompt payload.
*   **Frontend Test:** Verify `gamesBuilt` state triggers achievement modals upon reaching thresholds.

## 5. Implementation Steps (TDD Loop)
1.  **Phase 1.5 (Next):** Implement `pipeTextStreamToResponse` on backend, `experimental_useObject` on frontend, and bind partial streaming states to Hacker Mode UI.
2.  **Phase 2.5:** Implement `useAudio` hook for sound effects and add skeuomorphic CSS classes to buttons.
3.  **Phase 5:** Finalize E2E tests, optimize for mobile screens, and configure Vercel/Railway deployments.
4.  **Phase 6:** Implement sliding code editor, image upload logic, and gamified achievement hooks.
