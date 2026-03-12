"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../src/server");
const ai_1 = require("ai");
jest.mock("ai", () => ({
    streamObject: jest.fn().mockReturnValue({
        pipeTextStreamToResponse: (res) => {
            res
                .status(200)
                .send('{"reply":"Mocked reply from AI buddy","code":"<html>mocked code</html>"}');
        },
    }),
}));
const mockedStreamObject = ai_1.streamObject;
describe("POST /api/generate", () => {
    beforeEach(() => {
        mockedStreamObject.mockClear();
    });
    it("should exist and not return 404", async () => {
        const res = await (0, supertest_1.default)(server_1.app).post("/api/generate").send({ messages: [] });
        expect(res.status).not.toBe(404);
    });
    it("should return 400 if messages array is missing", async () => {
        const res = await (0, supertest_1.default)(server_1.app).post("/api/generate").send({});
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error", "messages array is required");
    });
    it("should return a chunked stream when messages are provided", async () => {
        const res = await (0, supertest_1.default)(server_1.app)
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
        await (0, supertest_1.default)(server_1.app)
            .post("/api/generate")
            .send({
            messages: [{ role: "user", content: "Change the title" }],
            currentBlocks,
        });
        expect(mockedStreamObject).toHaveBeenCalledTimes(1);
        const callArgs = mockedStreamObject.mock.calls[0][0];
        const messages = callArgs.messages;
        const systemMessage = messages.find((m) => m.role === "system");
        expect(systemMessage?.content).toContain(currentBlocks);
    });
    it("should reject messages with invalid role", async () => {
        const res = await (0, supertest_1.default)(server_1.app)
            .post("/api/generate")
            .send({
            messages: [{ role: "hacker", content: "bad role" }],
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid.*role/i);
    });
    it("should reject messages with content exceeding 5000 characters", async () => {
        const res = await (0, supertest_1.default)(server_1.app)
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
        const res = await (0, supertest_1.default)(server_1.app).post("/api/generate").send({ messages });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/too many messages/i);
    });
    it("should reject messages missing content field", async () => {
        const res = await (0, supertest_1.default)(server_1.app)
            .post("/api/generate")
            .send({
            messages: [{ role: "user" }],
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/content.*required/i);
    });
    it("should reject non-object items in messages array", async () => {
        const res = await (0, supertest_1.default)(server_1.app)
            .post("/api/generate")
            .send({
            messages: [null, 42, "string"],
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/must be an object/i);
    });
    it("should reject empty messages array", async () => {
        const res = await (0, supertest_1.default)(server_1.app).post("/api/generate").send({ messages: [] });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/at least one message/i);
    });
    it("should reject whitespace-only message content", async () => {
        const res = await (0, supertest_1.default)(server_1.app)
            .post("/api/generate")
            .send({
            messages: [{ role: "user", content: "   " }],
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/content.*required/i);
    });
    it("should reject currentBlocks exceeding size limit", async () => {
        const res = await (0, supertest_1.default)(server_1.app)
            .post("/api/generate")
            .send({
            messages: [{ role: "user", content: "hello" }],
            currentBlocks: "x".repeat(50001),
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/currentBlocks.*exceed/i);
    });
});
//# sourceMappingURL=api.test.js.map