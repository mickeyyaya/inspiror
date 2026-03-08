import request from "supertest";
import { app } from "../src/server";
import { streamObject } from "ai";

jest.mock("ai", () => ({
  streamObject: jest.fn().mockReturnValue({
    pipeTextStreamToResponse: (res: any) => {
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
    const callArgs = mockedStreamObject.mock.calls[0]![0] as any;
    const systemMessage = callArgs.messages.find(
      (m: any) => m.role === "system",
    );
    expect(systemMessage?.content).toContain(currentCode);
  });

  it("should handle internal server errors from the LLM service", async () => {
    mockedStreamObject.mockImplementationOnce(() => {
      throw new Error("Mocked API failure");
    });

    const res = await request(app)
      .post("/api/generate")
      .send({
        messages: [{ role: "user", content: "test message" }],
      });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal server error during generation");
  });
});
