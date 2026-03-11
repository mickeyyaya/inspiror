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
*   **Auditory Feedback:** Every significant action (sending a message, clicking a Magic Button, receiving a response, finishing a build) should feature satisfying, kid-friendly sound effects (e.g., pops, clicks, or magical chimes).
*   **Prompt Scaffolding (Magic Buttons):** To prevent "Blank Canvas Syndrome," the chat interface must provide clickable "Suggestion Chips" or "Mad Libs" style starters (e.g., "Make a bouncing ball", "Create a neon clock"). These empower kids to start exploring immediately without needing to type a perfect prompt.
*   **Guiding Prompts:** If a user's prompt is too vague (e.g., "make a game"), the AI should ask scaffolding questions (e.g., "Cool! What kind of game? Does it have spaceships or animals?").
*   **Educational Error Handling (Auto-Fix Communicated):** If the generated code causes a JavaScript error in the sandbox, the app will catch it, send it back to the AI. The AI will communicate the issue gracefully and educationally to the kid (e.g., "Oops, your character fell through the floor because of gravity! Let me fix that real quick...") and automatically attempt to resolve it. This fosters AI literacy without frustration.

### 4.2. Live Visual Preview (The "Sandbox")
*   **Instant Rendering:** A dedicated panel that immediately displays the output of the AI's generated code as a single, unified HTML file (containing inline CSS/JS).
*   **Safe Execution:** Code must run in an isolated, secure environment (a sandboxed `<iframe>`) to prevent security risks.
*   **Visual Appeal:** The application will use a **Vibrant Neon** color palette (high contrast, energetic colors like hot pink, electric blue, lime green) to maximize appeal to kids.
*   **Progress Indicators & Real-Time "Hacker" Streaming:** To keep kids mesmerized and show them exactly what the AI is building, the platform MUST use **streaming generation**. Instead of a static loading spinner, the AI's chat replies must stream in real-time (typing effect), and the generated code must stream visibly on screen (like a fast-typing "Hacker Mode" overlay) before it instantly compiles into the final Live Preview. This demystifies the AI and makes it feel incredibly alive.
*   **Layout & Responsiveness:** On larger screens, the Live Preview will take up the **full screen**, and the Chat interface will be a **floating window** overlaid on top that can be **completely turned off (hidden)** by the user to view their creation without distractions. On mobile devices, the layout will gracefully adapt to ensure usability.

### 4.3. Iterative Development & Persistence
*   **Iterative Visual Scaffolding (Step-by-Step):** If a child requests a complex project (e.g., "Make a Mario game"), the AI MUST NOT build the entire game at once. It must break the project down into small, visible steps. For example: Turn 1 builds the background and character. Turn 2 adds gravity and jumping. Turn 3 adds enemies. This ensures the child understands how the game is built and feels like an active participant rather than a passive observer.
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

## 8. Market Opportunity

### Replit K-12 Exit (Fall 2024)

Replit deprecated Teams for Education in Fall 2024, explicitly exiting the K-12 classroom market to focus on adult developers (Replit Agent drove 10x revenue growth). This created a direct displacement gap: educators and students who built workflows around Replit now need an alternative. Inspiror is positioned to fill this gap — the combination of zero-signup, conversational AI, and kid-friendly UX directly addresses what Replit abandoned.

**Action items:** Target displaced Replit educators in marketing. Consider a lightweight "Classroom Mode" or teacher dashboard (see TASKS.md backlog) as a medium-term feature.

### AI Literacy Trend (2024-2025)

Global student AI usage jumped from 66% (2024) to 92% (2025). The education consensus is shifting from "learn to code" to "learn to guide and evaluate AI." Inspiror's chat-to-code model aligns directly with this trajectory — kids are learning the most relevant skill: prompting, iterating, and evaluating AI output.

### UX Research Signal (CHI 2025)

AI tutor mascots with expressive faces and emotional responses significantly improve student engagement. Personalized adaptive gamification (progress tied to the individual's history) outperforms generic badge systems. Both findings directly inform the Expressive AI Buddy and Gamified Progression backlog items.

### Cycle 3 Audit Confirmation (March 2026)

The Cycle 3 holistic audit (46 issues across 8 dimensions) confirmed that **Gamified Progression** and **Educational Loading Screen** remain the highest-value unbuilt features for competitive differentiation:

- Gamified Progression directly closes the gap against CodeCombat (loot drops, gear upgrades) and Codedex (fantasy map region unlocking), which are the two strongest engagement moats among competitors.
- Educational Loading Screen directly closes the gap against Codorex (Rex the Dino teaches coding facts during the 20-40s wait), which is the clearest example of turning idle time into learning time.

Both features are tracked in TASKS.md under Backlog > HIGH PRIORITY and Phase 6. No change to priority order from Cycle 2.

---

## 9. Competitive Landscape

*Last updated: March 2026*

### Direct Competitors (AI-Powered Builders for Kids)

| Platform | AI Buddy | Loading UX | Celebration | Key Differentiator |
|----------|----------|------------|-------------|-------------------|
| **Codorex** | Rex the Dino | Teaches coding facts during 20-40s wait | Minimal | Zero-signup, code transparency |
| **Upit** | AVA | Standard spinner | Contest prizes ($2,500) | Generates graphics + sound + code |
| **Rosebud** | Rosie | Live preview | Game jams | Pivoted to "vibe coding" games; 3D enhancements; 2.2M+ user-created games; added tipping/monetization |
| **Kodable** | CatBot | Standard | Certificates | Dual-mode (text + audio), multilingual |
| **CodeCombat** | N/A (RPG heroes) | Quest progress | Loot drops, gear upgrades, XP | Learning IS the game |
| **Codedex** | N/A | Standard | Region unlocking on fantasy map | 8-bit pixel art identity |
| **Tynker** | N/A | Standard | Certificates | Block-to-text progression |

### Competitor Status Updates (March 2026)

| Competitor | Update |
|-----------|--------|
| **Rosebud AI** | Pivoted to "vibe coding" games; added 3D enhancements; 2.2M+ user-created games; introduced tipping and creator monetization. Growing community flywheel is their moat. |
| **Bolt.new** | Switched default LLM to Claude Sonnet 4.6; added built-in database, auth, and analytics. Now a professional full-stack tool — no longer competing for kids. |
| **Replit** | Exited K-12 education (Teams for Education deprecated Fall 2024); 10x revenue growth driven by Replit Agent targeting adult developers. Left a gap Inspiror can fill. |
| **OpenAI Codex** | CLI and desktop app released; GPT-5.3-Codex with parallel agents. Targeting professional developers — not kids. |

### Inspiror's Competitive Advantages
1. **Real-time streaming hacker mode** - Kids see code being written live (Codorex shows static facts; we show the actual build)
2. **Zero-signup with local persistence** - Like Codorex, but with localStorage session continuity
3. **Confetti celebration loop** - Every successful build triggers confetti (vs. CodeCombat's loot drops)
4. **Animated AI buddy** - Bouncing/thinking avatar gives personality (vs. static emoji competitors)
5. **Animated welcome screen** - Particle-effect landing vs. boring "Your creation will appear here"

### Design Principles for Kids 8-14 (from competitive research)
- **Not too babyish** - They want to feel "grown up" and like real hackers/creators
- **Instant visual feedback** - Every action must produce visible change
- **Named AI character** with personality (nearly universal in competitors)
- **Bright, saturated colors** with rounded UI elements (current neon palette aligns)
- **Large touch targets** and clear visual hierarchy
- **Reward loops** - Small celebrations for every win

## 10. UI/UX Improvements (Implemented)

Based on competitive research, the following improvements have been shipped:

| # | Improvement | Status | Impact |
|---|------------|--------|--------|
| 1 | Streaming hacker mode with pulsing core | Shipped | Kids see code being built in real-time |
| 2 | Confetti burst on completion | Shipped | "TA-DA!" payoff moment after every build |
| 3 | Message slide-in animations | Shipped | Chat feels alive with left/right slide-ins |
| 4 | Auto-scroll to latest message | Shipped | Basic UX fix, no manual scrolling needed |
| 5 | Animated buddy avatar (bounce + thinking) | Shipped | Buddy feels alive, wobbles when thinking |
| 6 | Staggered chip entrance | Shipped | Suggestion buttons pop in with overshoot |
| 7 | Animated welcome preview | Shipped | Gradient + floating particles first impression |
| 8 | Chat panel toggle | Shipped | Smooth show/hide for distraction-free play |
| 9 | Page title + favicon branding | Shipped | "Inspiror - Build Anything!" with rocket icon |
| 10 | Input glow effect | Shipped | Cyan glow intensifies as kids type |

## 11. Future Enhancements
*   **"Look Inside" / Code Remixing:** A Scratch-like feature to expose the generated HTML/JS in a safe, readable panel so kids can learn how the AI built the game and manually tweak variables (e.g., speed, color).
*   **Asset Upload & Personalization:** Allow kids to upload their own drawings or photos (e.g., "Make my pet dog the main character") to deeply personalize their creations.
*   **Gamified Progression:** Implement an achievement system (e.g., "Code Ninja badge unlocked for making 5 games!") and unlockable AI Buddy avatars to drive long-term retention.
*   **Auditory Feedback:** Sound effects for send, chip click, success, and error events (sourced as royalty-free MP3s).
*   **Play/Edit Toggle:** Distinct visual mode for "Playing" vs "Building."
*   **Visual block export:** Convert the generated code into Scratch-like blocks for further learning.
*   **Multiplayer collaboration:** Kids building together.
