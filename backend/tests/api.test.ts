import request from 'supertest';
import { app } from '../src/server';
import { generateObject } from 'ai';

// Mock the ai package so we don't hit the real API during tests
jest.mock('ai', () => ({
  generateObject: jest.fn().mockResolvedValue({
    object: {
      reply: 'Mocked reply from AI buddy',
      code: '<html>mocked code</html>'
    }
  })
}));

const mockedGenerateObject = generateObject as jest.MockedFunction<typeof generateObject>;

describe('POST /api/generate', () => {
  beforeEach(() => {
    mockedGenerateObject.mockClear();
  });

  it('should exist and not return 404', async () => {
    const res = await request(app).post('/api/generate').send({ messages: [] });
    expect(res.status).not.toBe(404);
  });

  it('should return 400 if messages array is missing', async () => {
    const res = await request(app).post('/api/generate').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'messages array is required');
  });

  it('should return a valid structure when messages are provided', async () => {
    const res = await request(app).post('/api/generate').send({
      messages: [{ role: 'user', content: 'test message' }]
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reply', 'Mocked reply from AI buddy');
    expect(res.body).toHaveProperty('code', '<html>mocked code</html>');
  });

  // Phase 2: Contextual Memory
  it('should accept currentCode and pass it to the LLM system prompt', async () => {
    const currentCode = '<html><body><h1>Existing App</h1></body></html>';
    await request(app).post('/api/generate').send({
      messages: [{ role: 'user', content: 'Change the title' }],
      currentCode,
    });

    expect(mockedGenerateObject).toHaveBeenCalledTimes(1);
    const callArgs = mockedGenerateObject.mock.calls[0]![0] as {
      messages: Array<{ role: string; content: string }>;
    };
    const systemMessage = callArgs.messages.find(
      (m: { role: string; content: string }) => m.role === 'system'
    );
    expect(systemMessage?.content).toContain(currentCode);
  });
});
