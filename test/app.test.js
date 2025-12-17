const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  it('should return application info', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('version');
    expect(response.body.message).toBe('🚀 CI/CD Demo Application');
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});