# TDD & Technical Design Document: Inspiror

## 1. Architecture Overview
Inspiror follows a client-server architecture:
*   **Frontend (Client):** React, TypeScript, Vite, Tailwind CSS. Handles the kid-friendly UI, chat interface, state management, and the sandboxed iframe for live previews.
*   **Backend (Server):** Node.js, Express, TypeScript. Acts as a secure proxy to the LLM (e.g., Gemini API), injecting system prompts and streaming structured responses back to the client in real-time.

## 2. Component Design (Frontend)

### `App` (Root — `App.tsx`)
*   **Responsibility:** Routes between `ProjectCatalog` (when no project is selected) and `EditorView` (when a project is open).
*   **Hooks:**
    *   `useProjects`: Manages multi-project state (CRUD, persistence, legacy migration).

### `ProjectCatalog` (`components/ProjectCatalog.tsx`)
*   **Responsibility:** Displays a grid of project cards with create, open, and delete actions. Shows empty state for new users.
*   **Features:**
    *   Projects sorted by `updatedAt` (most recent first).
    *   `timeAgo` helper for relative timestamps.
    *   Responsive grid: 1 col (mobile) → 2 (sm) → 3 (lg) → 4 (xl).

### `EditorView` (in `App.tsx`)
*   **Responsibility:** Full editor with chat panel, preview sandbox, hacker mode overlay, and confetti. Mounted with `key={project.id}` to reset state when switching projects.
*   **State:**
    *   `messages`: Array of chat messages (`ChatMessage` — `{ id, role, content }`).
    *   `currentCode`: String containing the generated HTML/CSS/JS payload.
    *   `isChatVisible`: Boolean to toggle the floating chat panel.
    *   `showConfetti`: Boolean to trigger confetti burst on completion.
    *   `inputValue`: String for the chat input field.
    *   `mode`: `"build" | "play"` — Build/Play mode toggle.
*   **Hooks:**
    *   `useObject` (from `@ai-sdk/react`): Manages streaming API calls, provides `object`, `submit`, `isLoading`.
    *   `useAudio`: Sound effects (pop, chip click, chime, buzzer) with mute toggle and localStorage persistence.
    *   `useRef(messagesEndRef)`: Auto-scroll anchor at bottom of message list.
    *   `useRef(prevIsLoadingRef)`: Tracks loading transitions for confetti trigger.
    *   `useRef(autoFixCountRef)`: Limits auto-fix retries to 2 consecutive attempts.
    *   `useRef(confettiTimerRef)`: Prevents confetti timer overlap on rapid generations.

### `ChatPanel` (inline in `EditorView`)
*   **Responsibility:** Displays the conversation history, suggestion chips, and input field.
*   **Components:**
    *   `MessageList`: Renders individual `MessageBubble` components with slide-in animations (`msg-user`, `msg-buddy` CSS classes).
    *   `SuggestionChips`: Renders clickable "Magic Buttons" with staggered pop-in animation (`chip-enter` CSS class with `animationDelay`).
    *   `StreamingReply`: Shows real-time `object?.reply` with typing cursor during generation.
    *   `MessageInput`: Text input with glow effect (`input-glow-active` CSS class when text present).

### `PreviewSandbox` (inline in `EditorView`)
*   **Responsibility:** Renders the generated code securely.
*   **Implementation:** An `<iframe>` using the `srcdoc` attribute bound to `currentCode`. Includes a sandbox attribute (`sandbox="allow-scripts"`) for safety. Error catcher script injected via `injectErrorCatcher()` for auto-fix flow.
*   **Default State:** Animated welcome screen with gradient background, floating particles, and "What will YOU create today?" text.

### `BuddyAvatar` (inline in chat header)
*   **Responsibility:** Animated emoji avatar in chat header.
*   **Implementation:** `buddy-avatar` CSS class (bounce animation, 2s loop) switches to `buddy-avatar-thinking` (wobble animation, 0.6s loop) when `isLoading` is true.

### Types (`types/project.ts`)
*   `ChatMessage`: `{ id: string, role: "user" | "assistant" | "system", content: string }`
*   `Project`: `{ id, title, createdAt, updatedAt, messages: ChatMessage[], currentCode: string }`

### Custom Hooks
*   **`useProjects`** (`hooks/useProjects.ts`): Multi-project CRUD, localStorage persistence, legacy data migration, auto-title extraction.
*   **`useAudio`** (`hooks/useAudio.ts`): Preloads 4 sound effects, provides play functions, mute toggle persisted to localStorage.

### `BlockEditor` (`components/BlockEditor.tsx`)
*   **Responsibility:** Renders the visual block panel and orchestrates drag-and-drop reordering. Integrates with `EditorView` via an `isOpen` prop and an `onBlocksChange` callback.
*   **Library:** dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`). Wrapped in a `DndContext` + `SortableContext` for sortable list semantics.
*   **State:** Owns the ordered `BlockDefinition[]` array. Delegates individual block mutations to `BlockCard` via an `onUpdateBlock` callback.
*   **Accessibility:** Custom `announcements` prop on `DndContext` with kid-friendly language. `aria-hidden` applied when panel is closed.
*   **Known risk:** dnd-kit maintenance activity has slowed (see issue #1194). Interface abstraction planned to allow library swap.

### `BlockCard` (`components/BlockCard.tsx`)
*   **Responsibility:** Renders a single draggable block card: category chip, block label, and a list of `ParamEditor` widgets for each parameter.
*   **Implementation:** Wraps `useSortable` from `@dnd-kit/sortable`. Applies `transform` and `transition` styles from `CSS.Transform.toString`.
*   **Props:** `block: BlockDefinition`, `onUpdate: (updated: BlockDefinition) => void`, `dragHandleProps`.

### `ParamEditor` (`components/ParamEditor.tsx`)
*   **Responsibility:** Renders a labeled range slider for a single numeric block parameter. Fires `onUpdate` on change, triggering a recompile.
*   **Performance note:** `onChange` is debounced at 50-100ms to avoid recompiling on every slider tick event.

### Block Runtime Engine
*   **Location:** `src/runtime/compileBlocks.ts`
*   **Purpose:** Converts an ordered `BlockDefinition[]` into a standalone HTML string that can be injected into the preview `<iframe>` via `srcdoc`.
*   **Pipeline:**
    1. `parseBlocks(blocks)` — validates each block's category and param types.
    2. `resolveParams(block)` — substitutes slider values into block templates.
    3. `assembleHTML(resolvedBlocks)` — wraps resolved snippets in a full HTML shell with the same error-catcher script used by the chat-based code path.
    4. Returns the assembled string; caller sets `iframe.srcdoc`.
*   **Template format:** Each `BlockDefinition` carries a `template` string with `{{paramName}}` placeholders. `resolveParams` does a single-pass string replacement.
*   **Minification:** `RUNTIME_ENGINE` shell (shared boilerplate injected into every iframe) is currently unminified. Minification is planned as a low-priority optimization.

### Block Data Model (`types/block.ts`)
```typescript
type BlockCategory = "motion" | "appearance" | "sound" | "control" | "event";

interface BlockParam {
  name: string;
  type: "number" | "color" | "string";
  value: number | string;
  min?: number;
  max?: number;
  step?: number;
}

interface BlockDefinition {
  id: string;          // stable UUID
  category: BlockCategory;
  label: string;       // human-readable, e.g. "Move right"
  template: string;    // code template with {{param}} placeholders
  params: BlockParam[];
}
```
*   **Schema duplication risk:** `BlockCategory` is currently defined in three places (frontend types, backend `llmService.ts`, Zod schema). Planned consolidation to a single source.

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

### `POST /api/convert-to-blocks`
*   **Request Body:**
    ```json
    {
      "code": "<!DOCTYPE html><html>...</html>"
    }
    ```
*   **Purpose:** Sends the current generated HTML/JS to Gemini and asks it to decompose the code into a `BlockDefinition[]` array. Enables legacy projects to enter the block editor without a full regeneration.
*   **Response:** A JSON array of `BlockDefinition` objects matching the shared schema.
*   **Security gap:** No rate limiter currently applied. `express-rate-limit` guard is a tracked HIGH issue.

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

### Phase 2.5: UX Polish & Visual Delight (COMPLETED)
*   **Frontend Test - Buddy Avatar:** Verify `.buddy-avatar` class renders by default and switches to `.buddy-avatar-thinking` during loading. (GREEN)
*   **Frontend Test - Chip Entrance:** Verify `.chip-enter` class on all 4 chips with staggered `animationDelay` (0ms, 100ms, 200ms, 300ms). (GREEN)
*   **Frontend Test - Message Animations:** Verify `.msg-buddy` class on assistant messages and `.msg-user` on user messages. (GREEN)
*   **Frontend Test - Input Glow:** Verify `.input-glow-active` class appears when input has text, absent when empty. (GREEN)
*   **Frontend Test - Welcome Screen:** Verify default iframe `srcdoc` contains "What will YOU create today?" and "particle". (GREEN)
*   **Frontend Test - Auto-scroll:** Verify `scrollIntoView` is called on render. (GREEN)
*   **Frontend Test - Auditory Feedback:** `useAudio` hook with 4 sounds, mute toggle, localStorage persistence. (GREEN)

### Phase 3: Educational Auto-Fix Error Handling (COMPLETED)
*   **Frontend Test 6:** Simulate an `error` event from the `PreviewSandbox` iframe. The app must catch it, display a friendly "Oops, fixing it!" assistant message, and automatically trigger a hidden generation request with the error details. (GREEN)

### Phase 4: Local Storage Persistence (COMPLETED)
*   **Frontend Test 7:** Verify that `messages` and `currentCode` are saved to `localStorage` when updated. (GREEN)
*   **Frontend Test 8:** Verify that the app initializes its state from `localStorage` on load instead of the default state. (GREEN)

### Phase 6: Visual Block Editor (COMPLETED)
*   **BlockEditor test — renders block list:** Verify `BlockCard` components render for each block in the `blocks` prop array. (GREEN planned)
*   **BlockEditor test — reorder via dnd-kit:** Simulate `DragEndEvent`; verify `onBlocksChange` called with reordered array. (GREEN planned)
*   **BlockCard test — renders params:** Verify a `ParamEditor` renders for each `BlockParam` in the block definition. (GREEN planned)
*   **BlockCard test — calls onUpdate on param change:** Simulate slider input; verify `onUpdate` called with updated `BlockDefinition`. (GREEN planned)
*   **ParamEditor test — renders range slider:** Verify `<input type="range">` renders with correct `min`, `max`, `step`, `value`. (GREEN planned)
*   **ParamEditor test — debounce fires onUpdate:** Simulate rapid slider events; verify `onUpdate` called at most once per debounce window. (GREEN planned)
*   **compileBlocks test — produces valid HTML:** Verify output string contains `<!DOCTYPE html>` and the resolved param values. (GREEN planned)
*   **compileBlocks test — substitutes all params:** Verify no `{{placeholder}}` strings remain in output. (GREEN planned)
*   **Backend test — `/api/convert-to-blocks` returns block array:** Mock Gemini response; verify endpoint returns `BlockDefinition[]` with correct shape. (GREEN planned)

### Phase 7 & Beyond: Deep Engagement (Future)
*   **Frontend Test:** Verify "Look Inside" panel toggles and allows code edits.
*   **Frontend Test:** Verify image upload converts to Base64 and attaches to prompt payload.
*   **Frontend Test:** Verify `gamesBuilt` state triggers achievement modals upon reaching thresholds.

## 5. Current Test Coverage

### Unit Tests (35+ tests - Vitest)

#### Project Catalog Tests
| # | Test | Status |
|---|------|--------|
| 1 | Shows catalog when no project is selected | GREEN |
| 2 | Shows empty state with create button | GREEN |
| 3 | Creates a new project and opens editor | GREEN |
| 4 | Shows project cards when projects exist | GREEN |
| 5 | Navigates back to catalog from editor | GREEN |
| 6 | Opens a project from catalog | GREEN |
| 7 | Deletes a project from catalog | GREEN |
| 8 | Migrates legacy data to a project | GREEN |

#### Editor View Tests
| # | Test | Status |
|---|------|--------|
| 9 | Renders initial chat greeting from AI Buddy | GREEN |
| 10 | Shows vivid Hacker Mode overlay during generation | GREEN |
| 11 | Renders suggestion chips and handles click | GREEN |
| 12 | Can toggle floating chat visibility | GREEN |
| 13 | Shows animated buddy avatar with bounce | GREEN |
| 14 | Switches buddy to thinking animation during loading | GREEN |
| 15 | Applies staggered animation delay to chips | GREEN |
| 16 | Applies slide-in animation classes to messages | GREEN |
| 17 | Applies glow class when input has text | GREEN |
| 18 | Renders animated welcome screen in default preview | GREEN |
| 19 | Renders reset button and resets to defaults | GREEN |
| 20 | Renders preview sandbox with error catcher | GREEN |
| 21 | Allows user to type and submit a message | GREEN |
| 22 | Calls scrollIntoView for auto-scroll | GREEN |
| 23 | Plays pop sound on message send | GREEN |
| 24 | Plays chip click sound on suggestion click | GREEN |
| 25 | Renders mute toggle and calls toggleMute | GREEN |
| 26 | Shows mode toggle defaulting to build mode | GREEN |
| 27 | Hides chat in play mode | GREEN |
| 28 | Returns to build mode with chat visible | GREEN |

#### Error Handling & Edge Case Tests
| # | Test | Status |
|---|------|--------|
| 29 | Handles stream onError callback | GREEN |
| 30 | Auto-fixes iframe errors, limits to 2 attempts | GREEN |
| 31 | Ignores iframe error if already loading | GREEN |
| 32 | Defaults to "Unknown error" if message missing | GREEN |
| 33 | Updates messages/code when stream finishes | GREEN |
| 34 | Handles partial finish object gracefully | GREEN |
| 35 | Falls back to default if JSON.parse throws | GREEN |
| 36 | handleSend does nothing if input is empty | GREEN |
| 37 | handleSend does nothing if isLoading is true | GREEN |
| 38 | onKeyDown ignores non-Enter keys | GREEN |
| 39 | Renders confetti burst after loading finishes | GREEN |
| 40 | Clears confetti timer on rapid generations | GREEN |

#### injectErrorCatcher Branch Tests
| # | Test | Status |
|---|------|--------|
| 41 | Injects after `<head>` if present | GREEN |
| 42 | Injects before `<body` if no head | GREEN |
| 43 | Injects after `<html` if no body or head | GREEN |
| 44 | Injects after doctype if no html tag | GREEN |
| 45 | Prepends script if no valid tags found | GREEN |

### Backend Tests (4 tests - Jest)
| # | Test | Status |
|---|------|--------|
| 1 | Route exists and doesn't return 404 | GREEN |
| 2 | Returns 400 if messages array missing | GREEN |
| 3 | Returns chunked stream when messages provided | GREEN |
| 4 | Accepts currentCode and passes to LLM system prompt | GREEN |

### E2E Tests (45+ tests - Playwright)
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
| 23 | Mute toggle switches icon | GREEN |
| 24 | Mode toggle switches build/play modes | GREEN |
| 25 | Play mode hides chat toggle button | GREEN |
| 26 | Confetti burst has 20 pieces with inline styles | GREEN |
| 27 | Confetti disappears after timeout | GREEN |
| 28 | Persists currentCode in localStorage | GREEN |
| 29 | Reset restores default code in iframe | GREEN |
| 30 | Reset clears localStorage | GREEN |
| 31 | Migrates old messages without IDs on reload | GREEN |
| 32 | Handles corrupted localStorage gracefully | GREEN |
| 33 | Mute state persists across page reloads | GREEN |
| 34 | Enter key on empty input does not send | GREEN |
| 35 | Input is cleared after sending a message | GREEN |
| 36 | Input glow deactivates when text is cleared | GREEN |
| 37 | User/assistant messages have correct CSS classes | GREEN |
| 38 | Initial greeting shows wave emoji | GREEN |
| 39 | Supports multi-turn conversation flow | GREEN |
| 40 | Suggestion chips have staggered animation delays | GREEN |
| 41 | Suggestion chips disappear after message sent | GREEN |
| 42 | Suggestion chips reappear after reset | GREEN |
| 43 | Play mode keeps iframe content visible | GREEN |
| 44 | Mode toggle is always visible in both modes | GREEN |
| 45 | Play mode does not show hacker overlay during loading | GREEN |
| 46 | Chat panel has aria-hidden attribute | GREEN |
| 47 | Chat panel is full-width on mobile viewport | GREEN |
| 48 | Chat panel has responsive width classes | GREEN |
| 49 | Page has SVG favicon | GREEN |
| 50 | Hacker mode shows BUILDING text and sparkles | GREEN |
| 51 | Hacker mode shows INITIALIZING MATRIX when no code | GREEN |
| 52 | Buddy avatar switches to thinking during loading | GREEN |
| 53 | Reset clears input field | GREEN |
| 54 | Each suggestion chip sends its specific label | GREEN |
| 55 | Page title is set correctly | GREEN |
| 56 | Iframe sandbox only allows scripts | GREEN |
| 57 | Messages have unique IDs in localStorage | GREEN |

## 6. Code Review Findings & Technical Debt

### Issues to Address (from code review)

| Severity | Issue | File | Status |
|----------|-------|------|--------|
| MEDIUM | `key={idx}` for message list - replaced with `crypto.randomUUID()` stable keys | `App.tsx` | DONE |
| MEDIUM | Confetti timer doesn't reset on rapid-fire generations - fixed with `confettiTimerRef` | `App.tsx` | DONE |
| MEDIUM | Hidden chat panel lacks `aria-hidden` - added `aria-hidden={!isChatVisible}` | `App.tsx` | DONE |
| LOW | Confetti CSS uses hardcoded `nth-child` selectors - refactored to inline styles | `index.css` | DONE |
| LOW | Favicon emoji may not render on all browsers/OS - replaced with SVG rocket | `index.html` | DONE |

## 7. Security Notes

- **Vite CVE-2025-58752:** Fixed in Vite 7.1.5+. Current project uses Vite 7.3.1, which includes the fix. Verify version on each dependency update to avoid regression.
- **React RSC CVEs (CVE-2025-55182):** Does not affect this project. Inspiror is client-side only with no React Server Components. No action required unless RSC is adopted in the future.

## 8. Technology Considerations

- **AI SDK 6 typed messages:** Vercel AI SDK 6 introduces typed `UIMessage` vs `ModelMessage` separation. Current project uses `experimental_useObject` from AI SDK. Future migration path: adopt the new message types to gain type safety and support for richer message payloads (tool calls, multi-modal content).
- **Gemini native TTS:** Gemini 3 provides native text-to-speech output, enabling audio responses from the AI Buddy. This could power voice-guided coding tutorials without requiring a separate TTS service.

## 9. Implementation Steps (Next)
1.  ~~**Phase 2.5:** Audio integration, Play/Edit toggle.~~ (DONE)
2.  ~~**Phase 5:** CSS media queries, Docker, Vercel deployment.~~ (DONE)
3.  ~~**Tech Debt:** Message keys, confetti timer, accessibility, favicon, CSS coupling.~~ (DONE)
4.  ~~**Multi-Project Support:** Project catalog, CRUD, legacy migration, auto-titles.~~ (DONE)
5.  ~~**Phase 6:** Visual block editor — BlockEditor, BlockCard, ParamEditor, compileBlocks runtime engine, `/api/convert-to-blocks`.~~ (DONE)
6.  **Cycle 7 Tech Debt (Next):** Write unit tests for block editor components; add rate limiter to `/api/convert-to-blocks`; remove dead `@google/genai` and orphaned `CodePanel.tsx`; debounce `compileBlocks`; wire legacy project auto-conversion.
7.  **Phase 7 (Future):** Gamified progression (badges, XP, buddy skins); image upload; voice-guided coding; publish & share.
