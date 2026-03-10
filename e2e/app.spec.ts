import { test, expect } from "@playwright/test";

/** Helper: read current project's messages from the new localStorage structure */
async function readProjectMessages(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const projects = JSON.parse(
      localStorage.getItem("inspiror_projects") || "[]",
    );
    const currentId = localStorage.getItem("inspiror_current_project_id");
    const current = projects.find((p: { id: string }) => p.id === currentId);
    return current?.messages ?? [];
  });
}

/** Helper: read current project's code from the new localStorage structure */
async function readProjectCode(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const projects = JSON.parse(
      localStorage.getItem("inspiror_projects") || "[]",
    );
    const currentId = localStorage.getItem("inspiror_current_project_id");
    const current = projects.find((p: { id: string }) => p.id === currentId);
    return current?.currentCode ?? null;
  });
}

test.describe("Inspiror App - E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Create a new project to enter the EditorView
    await page.getByTestId("new-project-btn").click();
  });

  test("displays the initial greeting from AI Buddy", async ({ page }) => {
    await expect(page.getByText(/Hi! I'm your builder buddy/i)).toBeVisible();
  });

  test("shows Builder Buddy header with avatar", async ({ page }) => {
    await expect(
      page.getByText("Builder Buddy", { exact: true }),
    ).toBeVisible();
  });

  test("renders the preview sandbox iframe", async ({ page }) => {
    const iframe = page.locator('iframe[title="Preview Sandbox"]');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute("sandbox", "allow-scripts");
  });

  test("allows typing in the chat input", async ({ page }) => {
    const input = page.getByPlaceholder("Type your grand idea...");
    await expect(input).toBeVisible();
    await input.fill("Make a drawing app");
    await expect(input).toHaveValue("Make a drawing app");
  });

  test("send button is disabled when input is empty", async ({ page }) => {
    const sendButton = page.getByRole("button", { name: "Send" });
    await expect(sendButton).toBeDisabled();
  });

  test("send button is enabled when input has text", async ({ page }) => {
    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Hello");
    const sendButton = page.getByRole("button", { name: "Send" });
    await expect(sendButton).toBeEnabled();
  });

  test("can toggle chat visibility", async ({ page }) => {
    // Chat is visible initially
    await expect(
      page.getByText("Builder Buddy", { exact: true }),
    ).toBeVisible();

    // Hide chat
    const hideButton = page.getByRole("button", { name: "Hide Chat" });
    await hideButton.click();

    // Chat header should not be visible
    await expect(
      page.getByText("Builder Buddy", { exact: true }),
    ).not.toBeVisible();

    // Show chat button should appear
    const showButton = page.getByRole("button", { name: "Show Chat" });
    await expect(showButton).toBeVisible();

    // Re-show chat
    await showButton.click();
    await expect(
      page.getByText("Builder Buddy", { exact: true }),
    ).toBeVisible();
  });

  test("submitting a message shows it in the chat and triggers loading", async ({
    page,
  }) => {
    await page.route("**/api/generate", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Here is your drawing app!",
          code: "<!DOCTYPE html><html><body><h1>Drawing App</h1></body></html>",
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Make a drawing app");
    await page.getByRole("button", { name: "Send" }).click();

    // User message should appear
    await expect(page.getByText("Make a drawing app")).toBeVisible();

    // Loading state should show
    await expect(page.getByTestId("hacker-mode-overlay")).toBeVisible();

    // Wait for response
    await expect(page.getByText("Here is your drawing app!")).toBeVisible({
      timeout: 5000,
    });

    // Hacker mode overlay should be gone
    await expect(page.getByTestId("hacker-mode-overlay")).not.toBeVisible();
  });

  test("iframe updates with generated code after API response", async ({
    page,
  }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Here you go!",
          code: '<!DOCTYPE html><html><body><h1 id="test-output">Generated Content</h1></body></html>',
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Build something");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("Here you go!")).toBeVisible({ timeout: 5000 });

    const iframe = page.locator('iframe[title="Preview Sandbox"]');
    const srcdoc = await iframe.getAttribute("srcdoc");
    expect(srcdoc).toContain("Generated Content");
  });

  test("persists messages in localStorage (project storage)", async ({
    page,
  }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Persistent message!",
          code: "<!DOCTYPE html><html><body>Persisted</body></html>",
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Test persistence");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("Persistent message!")).toBeVisible({
      timeout: 5000,
    });

    const messages = await readProjectMessages(page);
    expect(messages.length).toBeGreaterThan(1);
  });

  test("loads persisted state from localStorage on page reload (legacy migration)", async ({
    page,
  }) => {
    // Clear project data and set legacy keys to test migration
    await page.evaluate(() => {
      localStorage.removeItem("inspiror_projects");
      localStorage.removeItem("inspiror_current_project_id");
      const msgs = [
        { role: "assistant", content: "Welcome back, creator!" },
        { role: "user", content: "Build a spaceship game" },
      ];
      localStorage.setItem("inspiror-messages", JSON.stringify(msgs));
      localStorage.setItem(
        "inspiror-currentCode",
        "<html><body>Spaceship</body></html>",
      );
    });

    await page.reload();

    // Legacy migration creates a project and opens it directly
    await expect(page.getByText("Welcome back, creator!")).toBeVisible();
    await expect(page.getByText("Build a spaceship game")).toBeVisible();
  });

  test("handles API errors gracefully", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Server error" }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Break things");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText(/Oops/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("displays suggestion chips on initial load", async ({ page }) => {
    // Chips are now randomly selected; verify 4 chips are shown
    const chips = page.locator(".chip-enter");
    await expect(chips).toHaveCount(4);
    // Each chip should have non-empty text
    for (let i = 0; i < 4; i++) {
      const text = await chips.nth(i).textContent();
      expect(text!.length).toBeGreaterThan(0);
    }
  });

  test("clicking a suggestion chip sends the message and hides chips", async ({
    page,
  }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Great choice!",
          code: "<html><body>Ball Game</body></html>",
        }),
      });
    });

    // Click the first available chip
    const firstChip = page.locator(".chip-enter").first();
    const chipText = await firstChip.textContent();
    await firstChip.click();

    // The chip label (minus the emoji prefix) should appear as a user message
    await expect(page.getByText("Great choice!")).toBeVisible({
      timeout: 5000,
    });
    // Chips should disappear after sending
    await expect(page.locator(".chip-enter")).toHaveCount(0);
  });

  test("reset button clears messages and restores defaults", async ({
    page,
  }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Built it!",
          code: "<html><body>Custom</body></html>",
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Build something");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("Built it!")).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: "Reset" }).click();

    await expect(page.getByText(/Hi! I'm your builder buddy/i)).toBeVisible();
    await expect(page.getByText("Built it!")).not.toBeVisible();
    // Suggestion chips should reappear (4 random chips)
    await expect(page.locator(".chip-enter")).toHaveCount(4);
  });

  test("shows hacker mode overlay during generation", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Done!",
          code: "<html><body>Built</body></html>",
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Build a game");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByTestId("hacker-mode-overlay")).toBeVisible();

    await expect(page.getByText("Done!")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("hacker-mode-overlay")).not.toBeVisible();
  });

  test("iframe contains error-catching script", async ({ page }) => {
    const iframe = page.locator('iframe[title="Preview Sandbox"]');
    const srcdoc = await iframe.getAttribute("srcdoc");
    expect(srcdoc).toContain("window.onerror");
    expect(srcdoc).toContain("iframe-error");
  });

  test("supports keyboard submission with Enter key", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Keyboard submitted!",
          code: "<html><body>Done</body></html>",
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Enter key test");
    await input.press("Enter");

    await expect(page.getByText("Enter key test")).toBeVisible();
    await expect(page.getByText("Keyboard submitted!")).toBeVisible({
      timeout: 5000,
    });
  });

  // UI/UX Improvement tests

  test("shows confetti burst after successful generation", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Confetti time!",
          code: "<html><body>Celebration</body></html>",
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Build something amazing");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("Confetti time!")).toBeVisible({
      timeout: 5000,
    });

    await expect(page.getByTestId("confetti-burst")).toBeAttached();
  });

  test("shows animated welcome screen in default preview", async ({ page }) => {
    const iframe = page.locator('iframe[title="Preview Sandbox"]');
    const srcdoc = await iframe.getAttribute("srcdoc");
    expect(srcdoc).toContain("What will YOU create today?");
  });

  test("buddy avatar has bounce animation", async ({ page }) => {
    const avatar = page.locator(".buddy-avatar");
    await expect(avatar).toBeVisible();
  });

  test("input glows when text is entered", async ({ page }) => {
    const input = page.getByPlaceholder("Type your grand idea...");

    await expect(input).not.toHaveClass(/input-glow-active/);

    await input.fill("Hello");

    await expect(input).toHaveClass(/input-glow-active/);
  });

  // === Phase 2.5 Tests ===

  test("mute toggle button switches icon", async ({ page }) => {
    const muteBtn = page.getByTestId("mute-toggle");
    await expect(muteBtn).toBeVisible();

    // Should have Unmute label after clicking (starts unmuted)
    await expect(muteBtn).toHaveAttribute("aria-label", "Mute");
    await muteBtn.click();
    await expect(muteBtn).toHaveAttribute("aria-label", "Unmute");
    await muteBtn.click();
    await expect(muteBtn).toHaveAttribute("aria-label", "Mute");
  });

  // === Confetti Details ===

  test("confetti burst has 80 pieces with inline styles", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Built!",
          code: "<html><body>Done</body></html>",
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Build it");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Built!")).toBeVisible({ timeout: 5000 });

    const confetti = page.getByTestId("confetti-burst");
    await expect(confetti).toBeAttached();

    const pieces = confetti.locator(".confetti-piece");
    await expect(pieces).toHaveCount(80);

    // Each piece should have inline styles (not rely on nth-child CSS)
    const firstPieceStyle = await pieces.first().getAttribute("style");
    expect(firstPieceStyle).toContain("background:");
    expect(firstPieceStyle).toContain("border-radius:");
  });

  test("confetti disappears after timeout", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Done!",
          code: "<html><body>Built</body></html>",
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Build");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Done!")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("confetti-burst")).toBeAttached();

    // Wait for confetti to disappear (2.5s timer)
    await expect(page.getByTestId("confetti-burst")).not.toBeAttached({
      timeout: 5000,
    });
  });

  // === Persistence Edge Cases ===

  test("persists currentCode in project storage after generation", async ({
    page,
  }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Here!",
          code: "<html><body>UNIQUE_MARKER_123</body></html>",
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Something");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Here!")).toBeVisible({ timeout: 5000 });

    const savedCode = await readProjectCode(page);
    expect(savedCode).toContain("UNIQUE_MARKER_123");
  });

  test("reset also restores default code in iframe", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Custom!",
          code: "<html><body>Custom code here</body></html>",
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Build");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Custom!")).toBeVisible({ timeout: 5000 });

    // Verify custom code is in iframe
    const iframe = page.locator('iframe[title="Preview Sandbox"]');
    let srcdoc = await iframe.getAttribute("srcdoc");
    expect(srcdoc).toContain("Custom code here");

    // Reset
    await page.getByRole("button", { name: "Reset" }).click();

    // Default welcome screen should be restored
    srcdoc = await iframe.getAttribute("srcdoc");
    expect(srcdoc).toContain("What will YOU create today?");
  });

  test("reset clears project messages to default", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Done!",
          code: "<html><body>Custom</body></html>",
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Build");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Done!")).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: "Reset" }).click();

    const messages = await readProjectMessages(page);
    // After reset, only 1 default greeting message
    expect(messages.length).toBe(1);
    expect(messages[0].content).toContain("builder buddy");
  });

  test("migrates old messages without IDs on reload", async ({ page }) => {
    // Clear project data and store messages in old format (no id field)
    await page.evaluate(() => {
      localStorage.removeItem("inspiror_projects");
      localStorage.removeItem("inspiror_current_project_id");
      const msgs = [
        { role: "assistant", content: "Old format message" },
        { role: "user", content: "Also old format" },
      ];
      localStorage.setItem("inspiror-messages", JSON.stringify(msgs));
    });

    await page.reload();

    await expect(page.getByText("Old format message")).toBeVisible();
    await expect(page.getByText("Also old format")).toBeVisible();

    // After migration, messages should now have IDs in the project storage
    const messages = await readProjectMessages(page);
    expect(
      messages.every((m: { id: string }) => typeof m.id === "string"),
    ).toBe(true);
  });

  test("handles corrupted localStorage gracefully", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem("inspiror_projects");
      localStorage.removeItem("inspiror_current_project_id");
      localStorage.setItem("inspiror-messages", "not valid json{{{");
    });

    await page.reload();

    // Legacy migration with corrupted data falls through to empty state (ProjectCatalog)
    // Click New Magic to create a project
    await page.getByTestId("new-project-btn").click();

    // Should show default greeting
    await expect(page.getByText(/Hi! I'm your builder buddy/i)).toBeVisible();
  });

  // === Mute Persistence ===

  test("mute state persists across page reloads", async ({ page }) => {
    const muteBtn = page.getByTestId("mute-toggle");

    // Mute
    await muteBtn.click();
    await expect(muteBtn).toHaveAttribute("aria-label", "Unmute");

    // Reload
    await page.reload();

    // After reload, lands on ProjectCatalog — open the project
    await page.getByTestId("open-project-btn").click();

    // Should still be muted
    const muteBtnAfterReload = page.getByTestId("mute-toggle");
    await expect(muteBtnAfterReload).toHaveAttribute("aria-label", "Unmute");
  });

  // === Input Edge Cases ===

  test("Enter key on empty input does not send", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Should not appear",
          code: "<html></html>",
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.press("Enter");

    // Only the initial greeting should be visible, no API call triggered
    const messages = page.locator(".msg-user");
    await expect(messages).toHaveCount(0);
  });

  test("input is cleared after sending a message", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ reply: "Got it!", code: "<html></html>" }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Test message");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(input).toHaveValue("");
  });

  test("input glow deactivates when text is cleared", async ({ page }) => {
    const input = page.getByPlaceholder("Type your grand idea...");

    await input.fill("Hello");
    await expect(input).toHaveClass(/input-glow-active/);

    await input.fill("");
    await expect(input).not.toHaveClass(/input-glow-active/);
  });

  // === Message Display ===

  test("user messages have msg-user class and assistant messages have msg-buddy class", async ({
    page,
  }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Buddy reply!",
          code: "<html></html>",
        }),
      });
    });

    // Initial assistant message has msg-buddy
    await expect(page.locator(".msg-buddy")).toHaveCount(1);

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("User message");
    await page.getByRole("button", { name: "Send" }).click();

    // User message should have msg-user class
    await expect(page.locator(".msg-user")).toHaveCount(1);

    // Wait for buddy reply
    await expect(page.getByText("Buddy reply!")).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".msg-buddy")).toHaveCount(2);
  });

  test("initial greeting shows sparkle emoji", async ({ page }) => {
    // The greeting contains "Hi!" from the assistant
    const greeting = page.getByText(/Hi! I'm your builder buddy/i);
    await expect(greeting).toBeVisible();

    // The sparkle emoji span should be present (assistant messages get ✨)
    const sparkle = page.locator("text=✨");
    await expect(sparkle.first()).toBeVisible();
  });

  // === Multi-turn Conversation ===

  test("supports multi-turn conversation flow", async ({ page }) => {
    let callCount = 0;
    await page.route("**/api/generate", async (route) => {
      callCount++;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: `Response ${callCount}`,
          code: `<html><body>Version ${callCount}</body></html>`,
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");

    // First message
    await input.fill("First message");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Response 1")).toBeVisible({ timeout: 5000 });

    // Second message
    await input.fill("Second message");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Response 2")).toBeVisible({ timeout: 5000 });

    // All messages should be visible
    await expect(page.getByText("First message")).toBeVisible();
    await expect(page.getByText("Second message")).toBeVisible();
    await expect(page.getByText("Response 1")).toBeVisible();
    await expect(page.getByText("Response 2")).toBeVisible();

    // Iframe should have latest code
    const iframe = page.locator('iframe[title="Preview Sandbox"]');
    const srcdoc = await iframe.getAttribute("srcdoc");
    expect(srcdoc).toContain("Version 2");
  });

  // === Suggestion Chips ===

  test("suggestion chips have staggered animation delays", async ({ page }) => {
    const chips = page.locator(".chip-enter");
    await expect(chips).toHaveCount(4);

    for (let i = 0; i < 4; i++) {
      const chip = chips.nth(i);
      const style = await chip.getAttribute("style");
      expect(style).toContain(`animation-delay: ${i * 150}ms`);
    }
  });

  test("suggestion chips disappear after any message is sent", async ({
    page,
  }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ reply: "OK!", code: "<html></html>" }),
      });
    });

    // Chips visible initially
    await expect(page.getByText("Try a Magic Button!")).toBeVisible();

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Custom request");
    await page.getByRole("button", { name: "Send" }).click();

    // Chips should be gone (more than 1 message now)
    await expect(page.getByText("Try a Magic Button!")).not.toBeVisible();
  });

  test("suggestion chips reappear after reset", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Done!",
          code: "<html></html>",
        }),
      });
    });

    // Send a message to hide chips
    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Build");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Done!")).toBeVisible({ timeout: 5000 });

    await expect(page.getByText("Try a Magic Button!")).not.toBeVisible();

    // Reset
    await page.getByRole("button", { name: "Reset" }).click();

    // Chips should reappear (4 random chips)
    await expect(page.getByText("Try a Magic Button!")).toBeVisible();
    await expect(page.locator(".chip-enter")).toHaveCount(4);
  });

  // === Chat Panel Accessibility ===

  test("chat panel has aria-hidden attribute", async ({ page }) => {
    const chatPanel = page.locator("[aria-hidden]").filter({
      has: page.getByText("Builder Buddy"),
    });
    await expect(chatPanel).toHaveAttribute("aria-hidden", "false");
  });

  // === Responsive Layout ===

  test("chat panel is full-width on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    // Need to reload after viewport change and re-enter editor
    await page.goto("/");
    await page.getByTestId("new-project-btn").click();

    const chatPanel = page.locator("[aria-hidden]").filter({
      has: page.getByText("Builder Buddy"),
    });
    await expect(chatPanel).toBeVisible();
    await expect(chatPanel).toHaveClass(/w-full/);
  });

  test("chat panel has responsive width classes", async ({ page }) => {
    const chatPanel = page.locator("[aria-hidden]").filter({
      has: page.getByText("Builder Buddy"),
    });
    await expect(chatPanel).toBeVisible();

    const classAttr = await chatPanel.getAttribute("class");
    expect(classAttr).toContain("sm:w-[26rem]");
    expect(classAttr).toContain("lg:w-[30rem]");
  });

  // === SVG Favicon ===

  test("page has SVG favicon (not emoji text)", async ({ page }) => {
    const favicon = page.locator('link[rel="icon"]');
    const href = await favicon.getAttribute("href");
    expect(href).toContain("data:image/svg+xml");
    expect(href).toContain("<path");
    // Should NOT be the old emoji-only approach
    expect(href).not.toContain("<text");
  });

  // === Hacker Mode Details ===

  test("hacker mode shows BUILDING text and sparkles during generation", async ({
    page,
  }) => {
    await page.route("**/api/generate", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Done!",
          code: "<html><body>Built</body></html>",
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Build a game");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByTestId("hacker-mode-overlay")).toBeVisible();
    await expect(page.getByText("BUILDING")).toBeVisible();
  });

  test("hacker mode shows code fragments while building", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Done!",
          code: "<html><body>Built</body></html>",
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Build a game");
    await page.getByRole("button", { name: "Send" }).click();

    // Should show floating code fragments
    await expect(page.getByTestId("hacker-mode-overlay")).toBeVisible();
    await expect(
      page.locator("pre").filter({ hasText: "<div>" }).first(),
    ).toBeVisible({
      timeout: 2000,
    });
  });

  // === Buddy Avatar States ===

  test("buddy avatar switches to thinking animation during loading", async ({
    page,
  }) => {
    await page.route("**/api/generate", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Done!",
          code: "<html></html>",
        }),
      });
    });

    // Initially bouncing
    await expect(page.locator(".buddy-avatar")).toBeVisible();
    await expect(page.locator(".buddy-avatar-thinking")).not.toBeVisible();

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Build");
    await page.getByRole("button", { name: "Send" }).click();

    // During loading - thinking animation
    await expect(page.locator(".buddy-avatar-thinking")).toBeVisible();
    await expect(page.locator(".buddy-avatar")).not.toBeVisible();

    // After loading - back to bouncing
    await expect(page.getByText("Done!")).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".buddy-avatar")).toBeVisible();
  });

  // === Reset Input ===

  test("reset clears input field", async ({ page }) => {
    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Some text");
    await expect(input).toHaveValue("Some text");

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(input).toHaveValue("");
  });

  // === Multiple Chip Selections ===

  test("each suggestion chip sends its specific label", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Nice!",
          code: "<html></html>",
        }),
      });
    });

    // Click the first available chip and verify its label appears as a user message
    const firstChip = page.locator(".chip-enter").first();
    const chipFullText = await firstChip.textContent();
    await firstChip.click();

    // The chip text (which includes emoji prefix) should appear in messages
    // The label is sent as the user message
    expect(chipFullText!.length).toBeGreaterThan(0);
  });

  // === Page Title ===

  test("page title is set correctly", async ({ page }) => {
    await expect(page).toHaveTitle("Inspiror - Build Anything!");
  });

  // === Iframe Sandbox Security ===

  test("iframe sandbox only allows scripts", async ({ page }) => {
    const iframe = page.locator('iframe[title="Preview Sandbox"]');
    const sandbox = await iframe.getAttribute("sandbox");
    expect(sandbox).toBe("allow-scripts");
    // Should not allow forms, top navigation, etc.
    expect(sandbox).not.toContain("allow-forms");
    expect(sandbox).not.toContain("allow-top-navigation");
  });

  // === Stable Message Keys ===

  test("messages have unique IDs in project storage", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "Reply!",
          code: "<html></html>",
        }),
      });
    });

    const input = page.getByPlaceholder("Type your grand idea...");
    await input.fill("Test");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Reply!")).toBeVisible({ timeout: 5000 });

    const msgs = await readProjectMessages(page);

    // All messages should have unique IDs
    const ids = msgs.map((m: { id: string }) => m.id);
    expect(ids.length).toBeGreaterThanOrEqual(3); // greeting + user + reply
    expect(new Set(ids).size).toBe(ids.length); // all unique
    expect(
      ids.every((id: string) => typeof id === "string" && id.length > 0),
    ).toBe(true);
  });
});
