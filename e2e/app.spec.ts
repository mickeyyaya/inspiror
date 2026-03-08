import { test, expect } from "@playwright/test";

test.describe("Inspiror App - E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
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
    const input = page.getByPlaceholder("Type your idea here...");
    await expect(input).toBeVisible();
    await input.fill("Make a drawing app");
    await expect(input).toHaveValue("Make a drawing app");
  });

  test("send button is disabled when input is empty", async ({ page }) => {
    const sendButton = page.getByRole("button", { name: "Send" });
    await expect(sendButton).toBeDisabled();
  });

  test("send button is enabled when input has text", async ({ page }) => {
    const input = page.getByPlaceholder("Type your idea here...");
    await input.fill("Hello");
    const sendButton = page.getByRole("button", { name: "Send" });
    await expect(sendButton).toBeEnabled();
  });

  test("can toggle chat visibility via CSS slide animation", async ({
    page,
  }) => {
    // Chat panel is visible initially
    const chatPanel = page.locator(".chat-panel");
    await expect(chatPanel).toHaveClass(/chat-panel-visible/);

    // Hide chat
    const hideButton = page.getByRole("button", { name: "Hide Chat" });
    await hideButton.click();

    // Chat panel should have hidden class (slid off-screen)
    await expect(chatPanel).toHaveClass(/chat-panel-hidden/);

    // Show chat button should appear
    const showButton = page.getByRole("button", { name: "Show Chat" });
    await expect(showButton).toBeVisible();

    // Re-show chat
    await showButton.click();
    await expect(chatPanel).toHaveClass(/chat-panel-visible/);
  });

  test("submitting a message shows it in the chat and triggers loading", async ({
    page,
  }) => {
    // Intercept the API call to prevent real LLM calls
    await page.route("**/api/generate", async (route) => {
      // Delay to verify loading state is shown
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

    const input = page.getByPlaceholder("Type your idea here...");
    await input.fill("Make a drawing app");
    await page.getByRole("button", { name: "Send" }).click();

    // User message should appear
    await expect(page.getByText("Make a drawing app")).toBeVisible();

    // Loading state should show (hacker mode overlay or chat indicator)
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

    const input = page.getByPlaceholder("Type your idea here...");
    await input.fill("Build something");
    await page.getByRole("button", { name: "Send" }).click();

    // Wait for the reply to confirm API responded
    await expect(page.getByText("Here you go!")).toBeVisible({ timeout: 5000 });

    // Verify the iframe was updated via srcdoc
    const iframe = page.locator('iframe[title="Preview Sandbox"]');
    const srcdoc = await iframe.getAttribute("srcdoc");
    expect(srcdoc).toContain("Generated Content");
  });

  test("persists messages in localStorage", async ({ page }) => {
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

    const input = page.getByPlaceholder("Type your idea here...");
    await input.fill("Test persistence");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("Persistent message!")).toBeVisible({
      timeout: 5000,
    });

    // Check localStorage
    const savedMessages = await page.evaluate(() =>
      localStorage.getItem("inspiror-messages"),
    );
    expect(savedMessages).not.toBeNull();
    const parsed = JSON.parse(savedMessages!);
    expect(parsed.length).toBeGreaterThan(1);
  });

  test("loads persisted state from localStorage on page reload", async ({
    page,
  }) => {
    // Set localStorage before navigating
    await page.evaluate(() => {
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

    // Reload to trigger state initialization from localStorage
    await page.reload();

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

    const input = page.getByPlaceholder("Type your idea here...");
    await input.fill("Break things");
    await page.getByRole("button", { name: "Send" }).click();

    // Should show the friendly error message
    await expect(page.getByText(/Oops, I made a little mistake/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("displays suggestion chips on initial load", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /bouncing ball/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /neon paint/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /glowing clock/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /space adventure/i }),
    ).toBeVisible();
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

    await page.getByRole("button", { name: /bouncing ball/i }).click();

    // User message from chip should appear
    await expect(page.getByText("Make a bouncing ball game")).toBeVisible();

    // After response, chips should be gone
    await expect(page.getByText("Great choice!")).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByRole("button", { name: /bouncing ball/i }),
    ).not.toBeVisible();
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

    const input = page.getByPlaceholder("Type your idea here...");
    await input.fill("Build something");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("Built it!")).toBeVisible({ timeout: 5000 });

    // Click reset
    await page.getByRole("button", { name: "Reset" }).click();

    // Initial greeting should reappear
    await expect(page.getByText(/Hi! I'm your builder buddy/i)).toBeVisible();
    // Custom message should be gone
    await expect(page.getByText("Built it!")).not.toBeVisible();
    // Suggestion chips should reappear
    await expect(
      page.getByRole("button", { name: /bouncing ball/i }),
    ).toBeVisible();
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

    const input = page.getByPlaceholder("Type your idea here...");
    await input.fill("Build a game");
    await page.getByRole("button", { name: "Send" }).click();

    // Hacker mode overlay should appear
    await expect(page.getByTestId("hacker-mode-overlay")).toBeVisible();

    // After response, overlay should disappear
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

    const input = page.getByPlaceholder("Type your idea here...");
    await input.fill("Enter key test");
    await input.press("Enter");

    await expect(page.getByText("Enter key test")).toBeVisible();
    await expect(page.getByText("Keyboard submitted!")).toBeVisible({
      timeout: 5000,
    });
  });

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

    const input = page.getByPlaceholder("Type your idea here...");
    await input.fill("Build something amazing");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText("Confetti time!")).toBeVisible({
      timeout: 5000,
    });

    // Confetti should appear after generation completes
    await expect(page.getByTestId("confetti-burst")).toBeVisible();
  });

  test("shows animated welcome screen in default preview", async ({ page }) => {
    const iframe = page.locator('iframe[title="Preview Sandbox"]');
    const srcdoc = await iframe.getAttribute("srcdoc");
    expect(srcdoc).toContain("What will YOU create today?");
  });

  test("shows matrix rain columns during generation", async ({ page }) => {
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

    const input = page.getByPlaceholder("Type your idea here...");
    await input.fill("Build a game");
    await page.getByRole("button", { name: "Send" }).click();

    // Matrix rain columns should appear during hacker mode
    await expect(page.locator(".matrix-column").first()).toBeVisible();
    await expect(page.locator(".scanline-overlay")).toBeVisible();
  });

  test("buddy avatar has bounce animation", async ({ page }) => {
    const avatar = page.locator(".buddy-avatar");
    await expect(avatar).toBeVisible();
  });

  test("input glows when text is entered", async ({ page }) => {
    const input = page.getByPlaceholder("Type your idea here...");

    // No glow initially
    await expect(input).not.toHaveClass(/input-glow-active/);

    // Type text
    await input.fill("Hello");

    // Should have glow
    await expect(input).toHaveClass(/input-glow-active/);
  });
});
