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

    // Loading state should show
    await expect(page.getByText("Building...")).toBeVisible();

    // Wait for response
    await expect(page.getByText("Here is your drawing app!")).toBeVisible({
      timeout: 5000,
    });

    // Loading should be gone
    await expect(page.getByText("Building...")).not.toBeVisible();
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
});
