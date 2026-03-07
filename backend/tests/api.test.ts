import request from 'supertest';
import { app } from '../src/server';

// Mock the ai package so we don't hit the real API during tests
jest.mock('ai', () => ({
  generateObject: jest.fn().mockResolvedValue({
    object: {
      reply: 'Mocked reply from AI buddy',
      code: '<html>mocked code</html>'
    }
  })
}));

describe('POST /api/generate', () => {
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
});
