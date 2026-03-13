import request from "supertest";
import { app } from "../src/server";
import { streamObject } from "ai";

jest.mock("ai", () => ({
  streamObject: jest.fn().mockReturnValue({
    pipeTextStreamToResponse: (res: {
      status: (code: number) => { send: (body: string) => void };
    }) => {
      res
        .status(200)
        .send(
          '{"reply":"Mocked reply from AI buddy","code":"<html>mocked code</html>"}',
        );
    },
  }),
}));

const mockedStreamObject = streamObject as jest.MockedFunction<
  typeof streamObject
>;

describe("Security headers", () => {
  it("should include Content-Security-Policy header with correct directives", async () => {
    const res = await request(app).post("/api/generate").send({ messages: [] });
    const csp = res.headers["content-security-policy"];
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });
});

describe("POST /api/generate", () => {
  beforeEach(() => {
    mockedStreamObject.mockClear();
  });

  it("should exist and not return 404", async () => {
    const res = await request(app).post("/api/generate").send({ messages: [] });
    expect(res.status).not.toBe(404);
  });

  it("should return 400 if messages array is missing", async () => {
    const res = await request(app).post("/api/generate").send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "messages array is required");
  });

  it("should return a chunked stream when messages are provided", async () => {
    const res = await request(app)
      .post("/api/generate")
      .send({
        messages: [{ role: "user", content: "test message" }],
      });

    expect(res.status).toBe(200);
    expect(res.text).toContain("Mocked reply from AI buddy");
  });

  it("should accept currentBlocks and pass it to the LLM system prompt", async () => {
    const currentBlocks = JSON.stringify([
      { id: "bg", type: "setup", label: "Background" },
    ]);
    await request(app)
      .post("/api/generate")
      .send({
        messages: [{ role: "user", content: "Change the title" }],
        currentBlocks,
      });

    expect(mockedStreamObject).toHaveBeenCalledTimes(1);
    const callArgs = mockedStreamObject.mock.calls[0]![0] as Record<
      string,
      unknown
    >;
    const messages = callArgs.messages as Array<{
      role: string;
      content: string;
    }>;
    const systemMessage = messages.find((m) => m.role === "system");
    expect(systemMessage?.content).toContain(currentBlocks);
  });

  it("should reject messages with invalid role", async () => {
    const res = await request(app)
      .post("/api/generate")
      .send({
        messages: [{ role: "hacker", content: "bad role" }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid.*role/i);
  });

  it("should reject messages with content exceeding 5000 characters", async () => {
    const res = await request(app)
      .post("/api/generate")
      .send({
        messages: [{ role: "user", content: "x".repeat(5001) }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/content.*exceed/i);
  });

  it("should reject requests with more than 50 messages", async () => {
    const messages = Array.from({ length: 51 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `message ${i}`,
    }));

    const res = await request(app).post("/api/generate").send({ messages });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/too many messages/i);
  });

  it("should reject messages missing content field", async () => {
    const res = await request(app)
      .post("/api/generate")
      .send({
        messages: [{ role: "user" }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/content.*required/i);
  });

  it("should reject non-object items in messages array", async () => {
    const res = await request(app)
      .post("/api/generate")
      .send({
        messages: [null, 42, "string"],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/must be an object/i);
  });

  it("should reject empty messages array", async () => {
    const res = await request(app).post("/api/generate").send({ messages: [] });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/at least one message/i);
  });

  it("should reject whitespace-only message content", async () => {
    const res = await request(app)
      .post("/api/generate")
      .send({
        messages: [{ role: "user", content: "   " }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/content.*required/i);
  });

  it("should reject currentBlocks exceeding size limit", async () => {
    const res = await request(app)
      .post("/api/generate")
      .send({
        messages: [{ role: "user", content: "hello" }],
        currentBlocks: "x".repeat(50001),
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/currentBlocks.*exceed/i);
  });
});

describe("POST /api/convert-to-blocks", () => {
  const mockBlock = {
    id: "test-block",
    type: "setup",
    label: "Test",
    emoji: "🔧",
    enabled: true,
    params: [],
    code: "game.setBackground('#000');",
    order: 0,
  };

  beforeEach(() => {
    mockedStreamObject.mockClear();
  });

  it("should return 200 with blocks on valid request", async () => {
    mockedStreamObject.mockReturnValueOnce({
      object: Promise.resolve({ blocks: [mockBlock] }),
    } as ReturnType<typeof streamObject>);

    const res = await request(app)
      .post("/api/convert-to-blocks")
      .send({ code: "<html><body>hello</body></html>", language: "en-US" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("blocks");
    expect(res.body.blocks).toHaveLength(1);
    expect(res.body.blocks[0]).toMatchObject({ id: "test-block" });
  });

  it("should pass code and language to streamObject", async () => {
    mockedStreamObject.mockReturnValueOnce({
      object: Promise.resolve({ blocks: [mockBlock] }),
    } as ReturnType<typeof streamObject>);

    await request(app)
      .post("/api/convert-to-blocks")
      .send({ code: "const x = 1;", language: "zh-TW" });

    expect(mockedStreamObject).toHaveBeenCalledTimes(1);
    const callArgs = mockedStreamObject.mock.calls[0]![0] as Record<
      string,
      unknown
    >;
    const messages = callArgs.messages as Array<{
      role: string;
      content: string;
    }>;
    const userMessage = messages.find((m) => m.role === "user");
    expect(userMessage?.content).toContain("const x = 1;");
  });

  it("should default language to en-US when an invalid language is supplied", async () => {
    mockedStreamObject.mockReturnValueOnce({
      object: Promise.resolve({ blocks: [mockBlock] }),
    } as ReturnType<typeof streamObject>);

    const res = await request(app)
      .post("/api/convert-to-blocks")
      .send({ code: "var x = 1;", language: "fr-FR" });

    expect(res.status).toBe(200);
    // The endpoint logs a warning and defaults — it should still succeed
    expect(res.body).toHaveProperty("blocks");
  });

  it("should return 400 when code is missing", async () => {
    const res = await request(app)
      .post("/api/convert-to-blocks")
      .send({ language: "en-US" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/code.*required/i);
  });

  it("should return 400 when code is not a string", async () => {
    const res = await request(app)
      .post("/api/convert-to-blocks")
      .send({ code: 12345, language: "en-US" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/code.*required/i);
  });

  it("should return 400 when code exceeds 50000 characters", async () => {
    const res = await request(app)
      .post("/api/convert-to-blocks")
      .send({ code: "x".repeat(50001), language: "en-US" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/code.*exceed/i);
  });

  it("should return 500 when the LLM service throws", async () => {
    mockedStreamObject.mockReturnValueOnce({
      object: Promise.reject(new Error("LLM failure")),
    } as ReturnType<typeof streamObject>);

    const res = await request(app)
      .post("/api/convert-to-blocks")
      .send({ code: "var x = 1;", language: "en-US" });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
  });
});
