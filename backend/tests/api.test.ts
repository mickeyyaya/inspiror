import request from "supertest";
import { app } from "../src/server";
import { streamObject } from "ai";
import { Readable } from "stream";

// Mock the ai package so we don't hit the real API during tests
jest.mock("ai", () => ({
  streamObject: jest.fn().mockReturnValue({
    fullStream: (async function* () {
      yield {
        type: "object",
        object: {
          reply: "Mocked reply from AI buddy",
          code: "<html>mocked code</html>",
        },
      };
    })(),
    object: Promise.resolve({
      reply: "Mocked reply from AI buddy",
      code: "<html>mocked code</html>",
    }),
    textStream: (async function* () {
      yield '{"reply":"Mocked reply from AI buddy","code":"<html>mocked code</html>"}';
    })(),
    toTextStreamResponse: jest.fn().mockReturnValue(
      new Response(
        '{"reply":"Mocked reply from AI buddy","code":"<html>mocked code</html>"}',
        {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        },
      ),
    ),
  }),
}));

const mockedStreamObject = streamObject as jest.MockedFunction<
  typeof streamObject
>;

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

  it("should return a valid structure when messages are provided", async () => {
    const res = await request(app)
      .post("/api/generate")
      .send({
        messages: [{ role: "user", content: "test message" }],
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("reply", "Mocked reply from AI buddy");
    expect(res.body).toHaveProperty("code", "<html>mocked code</html>");
  });

  // Phase 2: Contextual Memory
  it("should accept currentCode and pass it to the LLM system prompt", async () => {
    const currentCode = "<html><body><h1>Existing App</h1></body></html>";
    await request(app)
      .post("/api/generate")
      .send({
        messages: [{ role: "user", content: "Change the title" }],
        currentCode,
      });

    expect(mockedStreamObject).toHaveBeenCalledTimes(1);
    const callArgs = mockedStreamObject.mock.calls[0]![0] as {
      messages: Array<{ role: string; content: string }>;
    };
    const systemMessage = callArgs.messages.find(
      (m: { role: string; content: string }) => m.role === "system",
    );
    expect(systemMessage?.content).toContain(currentCode);
  });
});
