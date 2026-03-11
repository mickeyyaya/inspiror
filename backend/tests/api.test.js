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
            res.status(200).send('{"reply":"Mocked reply from AI buddy","code":"<html>mocked code</html>"}');
        }
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
    it("should accept currentCode and pass it to the LLM system prompt", async () => {
        const currentCode = "<html><body><h1>Existing App</h1></body></html>";
        await (0, supertest_1.default)(server_1.app)
            .post("/api/generate")
            .send({
            messages: [{ role: "user", content: "Change the title" }],
            currentCode,
        });
        expect(mockedStreamObject).toHaveBeenCalledTimes(1);
        const callArgs = mockedStreamObject.mock.calls[0][0];
        const systemMessage = callArgs.messages.find((m) => m.role === "system");
        expect(systemMessage?.content).toContain(currentCode);
    });
});
//# sourceMappingURL=api.test.js.map