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
    *   `isChatVisible`: Boolean to toggle the floating chat panel.
    *   `showConfetti`: Boolean to trigger confetti burst on completion.
    *   `inputValue`: String for the chat input field.
*   **Hooks:**
    *   `useObject` (from `@ai-sdk/react`): Manages streaming API calls, provides `object`, `submit`, `isLoading`.
    *   `useRef(messagesEndRef)`: Auto-scroll anchor at bottom of message list.
    *   `useRef(prevIsLoadingRef)`: Tracks loading transitions for confetti trigger.

### `ChatPanel`
*   **Responsibility:** Displays the conversation history, suggestion chips, and input field.
*   **Components:**
    *   `MessageList`: Renders individual `MessageBubble` components with slide-in animations (`msg-user`, `msg-buddy` CSS classes).
    *   `SuggestionChips`: Renders clickable "Magic Buttons" with staggered pop-in animation (`chip-enter` CSS class with `animationDelay`).
    *   `StreamingReply`: Shows real-time `object?.reply` with typing cursor during generation.
    *   `MessageInput`: Text input with glow effect (`input-glow-active` CSS class when text present).

### `PreviewSandbox`
*   **Responsibility:** Renders the generated code securely.
*   **Implementation:** An `<iframe>` using the `srcdoc` attribute bound to `currentCode`. Includes a sandbox attribute (`sandbox="allow-scripts"`) for safety. Error catcher script injected for auto-fix flow.
*   **Default State:** Animated welcome screen with gradient background, floating particles, and "What will YOU create today?" text.

### `BuddyAvatar`
*   **Responsibility:** Animated emoji avatar in chat header.
*   **Implementation:** `buddy-avatar` CSS class (bounce animation, 2s loop) switches to `buddy-avatar-thinking` (wobble animation, 0.6s loop) when `isLoading` is true.

## 3. API Contract (Backend)

### `POST /api/generate`
*   **Request Body:**
    ```json
    {
      "messages": [
         { "role": "user", "content": "I want a drawing app" }
      ],
      "currentCode": "<html>...</html>"
    }
    ```
*   **System Prompt Requirements:** The LLM is strictly instructed to follow **Iterative Visual Scaffolding**. It must not generate a complex app in one turn. Instead, it generates a foundational visual layer, explains it, and asks the user what to add next.
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

### Phase 1.5: Real-Time Streaming & "Hacker Mode" UI (COMPLETED)
*   **Backend Test:** Ensure `/api/generate` returns a streamed chunked response using Vercel AI SDK. (GREEN)
*   **Frontend Test:** Ensure the `experimental_useObject` hook processes the stream, rendering the "Hacker Mode" overlay with `object?.code` and updating the active chat bubble with `object?.reply`. (GREEN)

### Phase 2: Contextual Memory & Prompt Scaffolding (COMPLETED)
*   **Backend Test 4:** Ensure `POST /api/generate` accepts `currentCode` in the request body and passes it to the LLM system prompt. (GREEN)
*   **Frontend Test 5:** Ensure the frontend sends `currentCode` alongside `messages` when making the API call. (GREEN)
*   **Frontend Test 5b:** Ensure "Suggestion Chips" (Magic Buttons) render when the chat is empty or waiting for initial input, and clicking one populates and submits the input. (GREEN)

### Phase 2.5: UX Polish & Visual Delight (PARTIALLY COMPLETED)
*   **Frontend Test - Buddy Avatar:** Verify `.buddy-avatar` class renders by default and switches to `.buddy-avatar-thinking` during loading. (GREEN)
*   **Frontend Test - Chip Entrance:** Verify `.chip-enter` class on all 4 chips with staggered `animationDelay` (0ms, 100ms, 200ms, 300ms). (GREEN)
*   **Frontend Test - Message Animations:** Verify `.msg-buddy` class on assistant messages and `.msg-user` on user messages. (GREEN)
*   **Frontend Test - Input Glow:** Verify `.input-glow-active` class appears when input has text, absent when empty. (GREEN)
*   **Frontend Test - Welcome Screen:** Verify default iframe `srcdoc` contains "What will YOU create today?" and "particle". (GREEN)
*   **Frontend Test - Auto-scroll:** Verify `scrollIntoView` is called on render. (GREEN)
*   **Frontend Test - Auditory Feedback:** Mock HTML5 Audio API and verify `useAudio` hook triggers correctly. (TODO)

### Phase 3: Educational Auto-Fix Error Handling (COMPLETED)
*   **Frontend Test 6:** Simulate an `error` event from the `PreviewSandbox` iframe. The app must catch it, display a friendly "Oops, fixing it!" assistant message, and automatically trigger a hidden generation request with the error details. (GREEN)

### Phase 4: Local Storage Persistence (COMPLETED)
*   **Frontend Test 7:** Verify that `messages` and `currentCode` are saved to `localStorage` when updated. (GREEN)
*   **Frontend Test 8:** Verify that the app initializes its state from `localStorage` on load instead of the default state. (GREEN)

### Phase 5 & 6: Deployment & Deep Engagement (Future)
*   **Frontend Test:** Verify "Look Inside" panel toggles and allows code edits.
*   **Frontend Test:** Verify image upload converts to Base64 and attaches to prompt payload.
*   **Frontend Test:** Verify `gamesBuilt` state triggers achievement modals upon reaching thresholds.

## 5. Current Test Coverage

### Unit Tests (14 tests - Vitest)
| # | Test | Status |
|---|------|--------|
| 1 | Renders initial chat greeting | GREEN |
| 2 | Shows vivid Hacker Mode overlay during generation | GREEN |
| 3 | Renders suggestion chips and handles click | GREEN |
| 4 | Can toggle floating chat visibility | GREEN |
| 5 | Shows animated buddy avatar with bounce | GREEN |
| 6 | Switches buddy to thinking animation during loading | GREEN |
| 7 | Applies staggered animation delay to chips | GREEN |
| 8 | Applies slide-in animation classes to messages | GREEN |
| 9 | Applies glow class when input has text | GREEN |
| 10 | Renders animated welcome screen in default preview | GREEN |
| 11 | Renders reset button | GREEN |
| 12 | Renders preview sandbox with error catcher | GREEN |
| 13 | Allows user to type and submit a message | GREEN |
| 14 | Calls scrollIntoView for auto-scroll | GREEN |

### Backend Tests (4 tests - Jest)
| # | Test | Status |
|---|------|--------|
| 1 | Route exists and doesn't return 404 | GREEN |
| 2 | Returns 400 if messages array missing | GREEN |
| 3 | Returns chunked stream when messages provided | GREEN |
| 4 | Accepts currentCode and passes to LLM system prompt | GREEN |

### E2E Tests (22 tests - Playwright)
| # | Test | Status |
|---|------|--------|
| 1 | Displays initial greeting | GREEN |
| 2 | Shows Builder Buddy header with avatar | GREEN |
| 3 | Renders preview sandbox iframe | GREEN |
| 4 | Allows typing in chat input | GREEN |
| 5 | Send button disabled when empty | GREEN |
| 6 | Send button enabled with text | GREEN |
| 7 | Can toggle chat visibility | GREEN |
| 8 | Submitting message shows in chat + triggers loading | GREEN |
| 9 | Iframe updates with generated code | GREEN |
| 10 | Persists messages in localStorage | GREEN |
| 11 | Loads persisted state on reload | GREEN |
| 12 | Handles API errors gracefully | GREEN |
| 13 | Displays suggestion chips on initial load | GREEN |
| 14 | Clicking chip sends message and hides chips | GREEN |
| 15 | Reset button clears and restores defaults | GREEN |
| 16 | Shows hacker mode overlay during generation | GREEN |
| 17 | Iframe contains error-catching script | GREEN |
| 18 | Supports keyboard submission with Enter | GREEN |
| 19 | Shows confetti burst after generation | GREEN |
| 20 | Shows animated welcome screen in default preview | GREEN |
| 21 | Buddy avatar has bounce animation | GREEN |
| 22 | Input glows when text is entered | GREEN |

## 6. Code Review Findings & Technical Debt

### Issues to Address (from code review)

| Severity | Issue | File | Status |
|----------|-------|------|--------|
| MEDIUM | `key={idx}` for message list - array index keys cause incorrect DOM reuse when messages are inserted non-append (iframe error handler) | `App.tsx` | TODO |
| MEDIUM | Confetti timer doesn't reset on rapid-fire generations - first timer hides confetti prematurely | `App.tsx` | TODO |
| MEDIUM | Hidden chat panel lacks `aria-hidden` - screen readers traverse off-screen content | `App.tsx` | TODO |
| LOW | Confetti CSS uses hardcoded `nth-child` selectors coupled to `CONFETTI_COUNT` constant | `index.css` | TODO |
| LOW | Favicon emoji may not render on all browsers/OS (Firefox Linux) | `index.html` | TODO |

## 7. Security Advisories (March 2026)

| CVE / Advisory | Severity | Description | Inspiror Impact | Action |
|---------------|----------|-------------|-----------------|--------|
| CVE-2025-55182 "React2Shell" | CVSS 10.0 Critical | RCE in React Server Components (RSC). | Inspiror uses client-side React with no RSC — NOT directly affected. | Upgrade to React 19.2.1+ as a precaution. |
| CVE-2025-58752 | High | Vite serves HTML files regardless of `server.fs` settings in Vite < 7.0.7. | Affects dev server. Verify current Vite version and upgrade to 7.0.8+ if below threshold. | Run `npm ls vite` and upgrade if needed. |
| Express | No critical CVEs | No critical new CVEs at time of writing. | No immediate action required. | Run `npm audit` periodically to stay current. |
| @ai-sdk/react | No known CVEs | No known CVEs at time of writing. | No immediate action required. | Monitor with `npm audit`. |

**Recommended immediate action:** Run `npm audit` in both `frontend/` and `backend/`. Confirm React >= 19.2.1 and Vite >= 7.0.8.

## 8. SDK Updates (March 2026)

### Vercel AI SDK 6

- **Agent abstraction:** First-class agent primitives with tool approval flows.
- **Stable `useObject`:** `experimental_useObject` is now the stable `useObject` export — Inspiror's frontend currently uses the `experimental_` prefix and should be updated.
- **MCP support:** Model Context Protocol integration for external tool/data sources.
- **Migration note:** Replace `import { experimental_useObject } from '@ai-sdk/react'` with `import { useObject } from '@ai-sdk/react'` (see TASKS.md backlog).

### Gemini Updates (March 2026)

| Model | Change |
|-------|--------|
| Gemini 3.1 Flash-Lite | 2.5x faster TTFT, 45% faster output, $0.25/1M input tokens |
| `thinking_level` parameter | New parameter to tune cost vs. quality per request — useful for scaffolding cheap vs. complex turns |
| Thought Signatures | Maintain chain-of-reasoning across multi-turn sessions, improving iterative scaffolding coherence |

**Migration note:** Update `backend/src/llmService.ts` to pass `thinking_level` where appropriate (e.g., low for simple error-fix turns, high for initial project generation).

## 9. Architecture Audit (March 2026)

### Component Decomposition — Overdue

`App.tsx` has grown to 575 lines and contains layout, state management, event handling, streaming logic, iframe error catching, localStorage serialization, and audio triggering. The component design from Section 2 envisioned six distinct components that have not been extracted:

| Component | Responsibility | Current State |
|-----------|---------------|---------------|
| `ChatPanel` | Conversation history, input, chips | Inline in `App.tsx` |
| `PreviewSandbox` | Sandboxed iframe + error catcher injection | Inline in `App.tsx` |
| `BuddyAvatar` | Animated avatar with state-driven CSS class | Inline in `App.tsx` |
| `SuggestionChips` | Staggered chip rendering and click handling | Inline in `App.tsx` |
| `MessageInput` | Controlled input with glow effect | Inline in `App.tsx` |
| `StreamingReply` | Real-time partial reply with typing cursor | Inline in `App.tsx` |

Recommended extraction order (highest impact first): `PreviewSandbox` (contains complex iframe + error handler logic), then `ChatPanel`, then the remaining four.

### currentCode State Duplication

`App.currentCode` and the `CodePanel`'s internal editable state are not kept in sync. When a user edits code in `CodePanel` and runs it, `App.currentCode` retains the last AI-generated version. The next AI generation call therefore ignores the user's edits entirely. Resolution requires either lifting `CodePanel` editor state into `App` or introducing a `useCurrentCode` shared context/hook.

### Backend Middleware Layer — Missing

The Express server handles all concerns (CORS, input parsing, LLM proxying) inside a single route handler with no middleware chain. Required additions before production deployment:

1. `express-rate-limit` — per-IP request throttling on `/api/generate`
2. Restricted CORS origin — replace `cors()` with `cors({ origin: process.env.ALLOWED_ORIGIN })`
3. Input validation middleware — enforce message count cap, per-message content length limit, and valid role values (`user` | `assistant` only)
4. Content moderation hook — block or sanitize prompts before forwarding to the LLM

### AI SDK Migration

`experimental_useObject` was a provisional export. AI SDK 6 promotes it to the stable `useObject` export. Migration is a one-line import change with no API surface changes:

```ts
// Before
import { experimental_useObject } from '@ai-sdk/react'

// After
import { useObject } from '@ai-sdk/react'
```

Replace the hook reference name throughout `App.tsx` and update the corresponding test mock in `App.test.tsx`.

## 10. Implementation Steps (Next)
1.  **Phase 2.5 (Next):** Implement `useAudio` hook for sound effects, add Play/Edit toggle.
2.  **Phase 5:** CSS media queries for mobile/tablet, Docker containerization, Vercel deployment.
3.  **Phase 6:** Sliding code editor ("Look Inside"), image upload, gamified achievements.
4.  **Tech Debt:** Address code review findings (message keys, confetti timer, accessibility).
