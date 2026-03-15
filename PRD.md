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
*   **Multi-Project Support:** Users can create, open, and delete multiple projects from a Project Catalog screen. Each project has its own independent chat history and code state.
*   **Auto-Generated Titles:** Project titles are automatically derived from the first user message, so kids don't need to name their projects manually.
*   **Local Storage (No Accounts):** Projects and chat history will be saved directly in the browser's local storage to ensure privacy and remove friction (no sign-up required). Legacy single-project data is auto-migrated to the new multi-project format.

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

## 8. Competitive Landscape

### Direct Competitors (AI-Powered Builders for Kids)

| Platform | AI Buddy | Loading UX | Celebration | Key Differentiator |
|----------|----------|------------|-------------|-------------------|
| **Codorex** | Rex the Dino | Teaches coding facts during 20-40s wait | Minimal | Zero-signup, code transparency |
| **Upit** | AVA | Standard spinner | Contest prizes ($2,500) | Generates graphics + sound + code |
| **Rosebud** | Rosie | Live preview | Game jams | Repositioning toward creative/game-making audience (overlap with Inspiror); 3D vibe coding |
| **Kodable** | CatBot | Standard | Certificates | Dual-mode (text + audio), multilingual |
| **CodeCombat** | N/A (RPG heroes) | Quest progress | Loot drops, gear upgrades, XP | Learning IS the game |
| **Codedex** | N/A | Standard | Region unlocking on fantasy map | 8-bit pixel art identity |
| **Tynker** | N/A | Standard | Certificates | Block-to-text progression |
| **Tynker Copilot** | AI Copilot | Standard | Certificates | Fine-tuned Llama2-13B outputs block code directly; targets ages 6-12 |
| **Code Edu "Encode"** | AI tutor | Standard | Achievements | AI creative learning platform; new entrant targeting same audience |

### Inspiror's Competitive Advantages
1. **Real-time streaming hacker mode** - Kids see code being written live (Codorex shows static facts; we show the actual build)
2. **Zero-signup with local persistence** - Like Codorex, but with localStorage session continuity
3. **Confetti celebration loop** - Every successful build triggers confetti (vs. CodeCombat's loot drops)
4. **Animated AI buddy** - Bouncing/thinking avatar gives personality (vs. static emoji competitors)
5. **Animated welcome screen** - Particle-effect landing vs. boring "Your creation will appear here"

### Direct Competitor Alert: Tynker Copilot
Tynker launched an AI Copilot feature using a fine-tuned **Llama2-13B** model trained on block-code output. Unlike general-purpose LLMs, it generates Tynker block sequences directly from natural language prompts, targeting ages 6-12 — Inspiror's exact demographic. This makes Tynker Copilot the most direct competitive threat to the block editor feature. Key differences:
- Tynker's model outputs native block representations; Inspiror's `/api/convert-to-blocks` does a post-hoc conversion from HTML.
- Tynker has established school distribution (curriculum partnerships); Inspiror has zero-friction entry.
- Tynker Copilot is gated behind subscription plans; Inspiror's block editor is free.

### Dependency Risk: dnd-kit
The block editor uses **dnd-kit** for drag-and-drop. As of early 2026, dnd-kit maintainer activity has slowed significantly (see GitHub issue #1194). If the library is abandoned, migrating all drag-and-drop logic is a non-trivial effort. Mitigation: abstract dnd-kit behind an interface layer so the implementation can be swapped (to `@hello-pangea/dnd` or a native HTML5 DnD approach) without rewriting every component.

### Competitor Moves (Updated March 2026 — Cycle 19)

- **Code Edu "Encode"** — New AI creative learning platform entering the market directly targeting Inspiror's audience. Monitor feature set for differentiation opportunities.
- **Rosebud repositioning** — Rosebud is shifting focus toward the creative and game-making audience, increasing direct overlap with Inspiror's core use case. Their community flywheel (2.2M+ user-created games) remains a significant advantage.
- **Replit $400M Series D, pivoting away from K-12** — Replit raised $400M and is explicitly deprioritizing the K-12 segment. This opens a meaningful distribution opportunity for Inspiror in classrooms and educator channels that Replit is vacating.

### Compliance Note

- **COPPA 2025 — Deadline April 22, 2026** — The FTC's updated COPPA rules require platforms targeting children under 13 to implement reasonable content filtering and avoid data collection practices. Inspiror's local-storage-only approach covers data privacy, but content moderation guardrails in the system prompt must be in place before April 22, 2026. See TASKS.md Cycle 19 for the tracked item.

### Market Trends (Updated March 2026)
- **"Vibe coding" is Collins Word of the Year 2026** — mainstream awareness of AI-assisted coding is accelerating
- **Bolt.new hit $40M ARR** — proves massive demand for AI code generation platforms
- **Scratch 4.0 delayed to 2027-2028** — window of opportunity for next-gen tools to capture young creators
- **44% of children actively use generative AI** — target audience is already AI-literate, raising the bar for UX quality
- **Day-1 retention is the critical metric** — only 22% of new users return after Day 1; onboarding and first-session experience are the highest-leverage areas for retention improvement
- **Role-playing and cooperation mechanics most effective for ages 8-10** — research confirms interactive narrative and daily return incentives (streaks, buddy reactions) outperform passive reward systems for this cohort
- **PWA opportunity in classroom environments** — unreliable wifi in schools makes offline capability a meaningful differentiator for educator adoption
- **AI music generation goes mainstream (March 2026)** — Suno AI hit 100M users ($2.45B valuation); Google DeepMind Lyria 3 now live in Gemini app generating 30-second tracks from text prompts. No kids coding tool bundles AI-generated audio into the creation flow — genuine first-mover opportunity for Inspiror.
- **Community galleries are the #1 retention driver** — Scratch, Hopscotch, and Tynker all identify browsable project galleries as their top return-visit mechanic. Inspiror's local-only model is the single biggest architectural gap vs. competitors.
- **Child voice AI market growing** — Specialized child TTS voices (excited, curious, gentle) available via Speechgen, Resemble AI, Narakeet. Web Speech API provides zero-dependency STT/TTS in all modern browsers.

### Design Principles for Kids 8-14 (from competitive research)
- **Not too babyish** - They want to feel "grown up" and like real hackers/creators
- **Instant visual feedback** - Every action must produce visible change
- **Named AI character** with personality (nearly universal in competitors)
- **Bright, saturated colors** with rounded UI elements (current neon palette aligns)
- **Large touch targets** and clear visual hierarchy
- **Reward loops** - Small celebrations for every win

## 9. Next-Gen LLM Co-Working & Classroom Vision

### Research Summary (March 2026)

#### Child-AI Co-Creation Research

**MIT Scratch Copilot (IDC 2025)**
A study of 18 children ages 7-12 testing an AI coding assistant found that AI provides most value at the "blank canvas" phase — the exact moment Inspiror's suggestion chips target. Critically, 50% of older kids (ages 10-12) expressed anxiety about losing originality when AI generates code for them. This validates a core design principle: AI as helper, not replacer. The block-level accept/reject model (Phase 7.1) directly addresses this ownership anxiety.

**"Six Scaffolds" Framework (IJCCI, November 2025)**
Disney-inspired research on child-AI interaction design identified six interaction scaffolds: Signals, Sound, Synchrony, Sidekick, Storyplay, and Structure. These map directly to Inspiror's existing Buddy character design and provide a framework for extending it in Phase 7.

**AIStoryBot (ACM 2025)**
Creative co-authorship with AI was found to build both engagement AND AI literacy simultaneously — validating Inspiror's co-creation model over a tutoring or correction model.

**Graduated AI Agency by Age**
Research converges on three developmental bands:
- Ages 5-7: AI does, child directs
- Ages 8-10: AI suggests, child leads
- Ages 11-14: child critiques and remixes AI output

**Stanford SCALE Guardrails (August 2025)**
A framework for AI safety in education covering: prompt engineering, input threat detection, async content moderation agent, and human-in-the-loop review. Aligns with Inspiror's COPPA compliance work and Phase 7.2.

**CSTA 2026 Standards**
The first revision of K-12 CS standards to include AI literacy as a first-class component, across five categories. B2B school procurement will increasingly require demonstrated alignment with these standards.

#### Classroom & Training Market

- AI education market: $7.57B (2025) → $112B projected (2034)
- Leading platforms by scale: Code.org (2M+ classrooms), Khanmigo (1M+ students, 266 districts), Tynker, CodeMonkey, AIClub
- Dominant distribution model shifting from B2C parent to B2B school district with hybrid freemium
- Teacher dashboard now an essential B2B procurement requirement: real-time student activity, mastery tracking, assignment tools, at-risk alerts
- Standard lesson anatomy adopted across leading platforms: Hook (5 min) → Concept (10 min) → Guided Practice (15 min) → Creative Project (15-20 min) → Reflection (5 min)

#### Emerging Interaction Paradigms

- Voice-first coding for ages 5-8 is achievable via Web Speech API with zero external dependencies
- Multimodal inputs (drawing + voice + text) are active research at MIT Media Lab — TalkSketch (arXiv 2025) demonstrates real-time sketch + speech ideation
- AI autonomy levels emerging as a design pattern:
  - L1: respond only (current Inspiror model)
  - L2: proactive hints on inactivity
  - L3: active co-creation with guardrails

### Design Principles Derived from Research

1. AI as helper, not replacer — preserve child agency at all times
2. Graduated autonomy by age band (5-7 / 8-10 / 11-14)
3. Block-level negotiation to address co-creation ownership anxiety
4. Six Scaffolds (Signals, Sound, Synchrony, Sidekick, Storyplay, Structure) as Buddy design guide
5. Stanford SCALE guardrails: prompt engineering + threat detection + async moderation + human-in-loop
6. 5-phase lesson anatomy for structured classroom deployment
7. Teacher dashboard as prerequisite for B2B school distribution

---

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
| 11 | Auditory feedback (4 sounds) | Shipped | Pop, chip click, chime, buzzer with mute toggle |
| 12 | Play/Edit mode toggle | Shipped | Distinct Build vs Play modes with chat hidden in Play |
| 13 | Multi-project catalog | Shipped | Create, open, delete multiple projects with auto-titles |
| 14 | Legacy data migration | Shipped | Old single-project data auto-migrates to multi-project format |
| 15 | Visual block editor | Shipped | dnd-kit drag-and-drop block reordering, param sliders, live recompile |
| 16 | Block-to-code compiler | Shipped | `compileBlocks` runtime engine converts `BlockDefinition[]` to iframe-ready HTML |
| 17 | AI block conversion | Shipped | `/api/convert-to-blocks` endpoint decomposes existing code into editable blocks |

## 11. Future Enhancements
*   **"Look Inside" / Code Remixing:** Now partially addressed by the block editor. A deeper implementation would expose raw HTML/JS in a syntax-highlighted panel alongside the blocks view.
*   **Asset Upload & Personalization:** Allow kids to upload their own drawings or photos (e.g., "Make my pet dog the main character") to deeply personalize their creations.
*   **Gamified Progression:** Implement an achievement system (e.g., "Code Ninja badge unlocked for making 5 games!") and unlockable AI Buddy avatars to drive long-term retention.
*   **Visual block export:** Convert the generated code into Scratch-like blocks for further learning.
*   **Multiplayer collaboration:** Kids building together.
*   **Voice-guided coding tutorials:** Gemini 3 native TTS could enable the AI Buddy to speak instructions aloud, making the platform accessible to younger or pre-literate kids and creating an immersive audio learning experience.
*   **Multi-step agent code generation:** Vercel AI SDK 6 agent abstraction enables autonomous multi-step code generation workflows, where the AI can plan, build, test, and iterate without manual prompting at each step.
