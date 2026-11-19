const request = require('supertest');
const app = require('../src/app');

describe('Health and System Endpoints', () => {
  it('GET / should return root application metadata', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('project');
    expect(res.body.status).toBe('ONLINE');
  });

  it('GET /api/health should respond with operational status', async () => {
    const res = await request(app).get('/api/health');
    // May be 200 (if DB connected) or 503 (if DB offline in CI/test environment without local postgres)
    expect([200, 503]).toContain(res.statusCode);
    const body = res.body;
    expect(body).toHaveProperty('message');
  });

  it('GET /non-existent-route should return structured 404 JSON', async () => {
    const res = await request(app).get('/api/non-existent-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Endpoint not found');
  });
});
