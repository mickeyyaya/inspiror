# Product Requirements Document (PRD): Inspiror

## 1. Product Overview
**Name:** Inspiror
**Purpose:** An interactive, conversational platform that empowers children to build visual proof-of-concept (POC) apps and games simply by talking to an AI assistant.
**Goal:** Lower the barrier to entry for programming by providing immediate, tangible visual feedback through natural language, fostering creativity and computational thinking. The experience must be simple, visually appealing, fun, and highly attractive to kids.

## 2. Problem Statement
Traditional text-based programming can be intimidating and syntax-heavy for children. While block-based languages (like Scratch) help, they still require an understanding of programming logic and structure. Kids often have grand ideas but lack the technical skills to visualize them quickly. They need a tool that bridges the gap between imagination and a working prototype through a natural, conversational interface.

## 3. Target Audience
*   **Primary:** Children aged 8-14 who have an interest in games, apps, and creation but may not have formal coding experience.
*   **Secondary:** Parents and educators looking for safe, engaging educational tools to introduce technical concepts.

## 4. Key Features & Requirements

### 4.1. Conversational Interface (The "AI Buddy")
*   **Kid-Friendly Persona & Avatar:** The AI must act as an encouraging, patient mentor, represented visually as a **Cute Animal**. It should use simple language, avoid heavy jargon, and praise the user's creativity. The tone should be fun and energetic.
*   **Prompt Scaffolding (Magic Buttons):** To prevent "Blank Canvas Syndrome," the chat interface must provide clickable "Suggestion Chips" or "Mad Libs" style starters (e.g., "Make a bouncing ball", "Create a neon clock"). These empower kids to start exploring immediately without needing to type a perfect prompt.
*   **Guiding Prompts:** If a user's prompt is too vague (e.g., "make a game"), the AI should ask scaffolding questions (e.g., "Cool! What kind of game? Does it have spaceships or animals?").
*   **Error Handling (Auto-Fix Communicated):** If the generated code causes a JavaScript error in the sandbox, the app will catch it, send it back to the AI. The AI will communicate the issue gracefully to the kid (e.g., "Oops, I made a little mistake! Let me fix that real quick...") and automatically attempt to resolve it without frustrating the user.

### 4.2. Live Visual Preview (The "Sandbox")
*   **Instant Rendering:** A dedicated panel that immediately displays the output of the AI's generated code as a single, unified HTML file (containing inline CSS/JS).
*   **Safe Execution:** Code must run in an isolated, secure environment (a sandboxed `<iframe>`) to prevent security risks.
*   **Visual Appeal:** The application will use a **Vibrant Neon** color palette (high contrast, energetic colors like hot pink, electric blue, lime green) to maximize appeal to kids.
*   **Progress Indicators:** It is crucial to always show a **live, visual building status** (e.g., showing exactly what part of the app is being constructed or displaying a live progress bar/sequence) while the AI is "thinking" to keep kids entertained and aware of the progress.
*   **Layout & Responsiveness:** On larger screens, the Live Preview will take up the **full screen**, and the Chat interface will be a **floating window** overlaid on top that can be **completely turned off (hidden)** by the user to view their creation without distractions. On mobile devices, the layout will gracefully adapt to ensure usability.

### 4.3. Iterative Development & Persistence
*   **Contextual Memory:** The AI must remember the state of the application and the history of the conversation so the child can make incremental changes.
*   **Undo/Redo:** Ability to revert a change if the AI misunderstands or the child doesn't like the result.
*   **Local Storage (No Accounts):** Projects and chat history will be saved directly in the browser's local storage to ensure privacy and remove friction (no sign-up required).

### 4.4. Safety & Moderation
*   **Content Filtering:** Strict guardrails to prevent the generation or discussion of inappropriate, harmful, or unsafe content.
*   **Data Privacy:** No collection of personally identifiable information (PII) from children.

### 4.5. Export and Sharing
*   **Shareable Link (Future):** Generate a read-only link so kids can show their creations to parents and friends.

## 5. User Flow
1.  **Onboarding:** User lands on the app and is greeted by a colorful AI Buddy: "Hi! I'm your builder buddy. What do you want to create today?"
2.  **Ideation:** The user types their idea: "I want a drawing app."
3.  **Generation & Rendering:** The AI generates the initial HTML/JS/CSS structure (as a single file), updates the Live Preview window, and replies: "Here is a blank canvas! What color should the brush be?"
4.  **Iteration:** The user chats to refine the app. The AI updates the code, and the Live Preview refreshes.
5.  **Completion:** The user plays with their functioning, visual POC.

## 6. Technical Approach
*   **Architecture:** Client-Server model.
*   **Frontend:** React (TypeScript) built with Vite. Styling will use **Tailwind CSS** to rapidly iterate on a kid-friendly, playful UI.
*   **Backend:** Node.js/Express server to securely communicate with the LLM API (e.g., Google Gemini API).
*   **Code Execution:** The frontend takes the code payload from the LLM and injects it into a sandboxed `<iframe>` using the `srcdoc` attribute. The payload will be a single HTML string containing embedded `<style>` and `<script>` tags for simplicity and robust rendering.

## 7. Success Metrics
*   Number of completed POC sessions.
*   Average length of a session (number of conversational turns).
*   User retention (returning users).

## 8. Future Enhancements
*   Visual block export (convert the generated code into Scratch-like blocks for further learning).
*   Multiplayer collaboration (kids building together).
*   Asset generation (generating custom sprites or sounds via AI).
