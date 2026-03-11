import request from "supertest";
import { app } from "../src/server";
import { streamObject } from "ai";

jest.mock("ai", () => ({
  streamObject: jest.fn().mockReturnValue({
    pipeTextStreamToResponse: (res: { status: (code: number) => { send: (body: string) => void } }) => {
      res.status(200).send('{"reply":"Mocked reply from AI buddy","code":"<html>mocked code</html>"}');
    }
  }),
}));

const mockedStreamObject = streamObject as jest.MockedFunction<typeof streamObject>;

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

  it("should accept currentCode and pass it to the LLM system prompt", async () => {
    const currentCode = "<html><body><h1>Existing App</h1></body></html>";
    await request(app)
      .post("/api/generate")
      .send({
        messages: [{ role: "user", content: "Change the title" }],
        currentCode,
      });

    expect(mockedStreamObject).toHaveBeenCalledTimes(1);
    const callArgs = mockedStreamObject.mock.calls[0]![0] as Record<string, unknown>;
    const messages = callArgs.messages as Array<{ role: string; content: string }>;
    const systemMessage = messages.find(
      (m) => m.role === "system",
    );
    expect(systemMessage?.content).toContain(currentCode);
  });

  // --- Input validation tests ---

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

    const res = await request(app)
      .post("/api/generate")
      .send({ messages });

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

  it("should accept valid messages with both user and assistant roles", async () => {
    const res = await request(app)
      .post("/api/generate")
      .send({
        messages: [
          { role: "user", content: "hello" },
          { role: "assistant", content: "hi there" },
          { role: "user", content: "make a game" },
        ],
      });

    expect(res.status).toBe(200);
  });

  // --- CORS tests ---

  it("should include CORS headers in response", async () => {
    const res = await request(app)
      .options("/api/generate")
      .set("Origin", "http://localhost:5173");

    expect(res.headers["access-control-allow-origin"]).toBeDefined();
  });
});
