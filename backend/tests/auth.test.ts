import request from 'supertest';
import app from '../src/app';

// Auth validation tests — these hit express-validator before any DB call,
// so they run without a database connection.

describe('POST /api/v1/auth/register', () => {
  it('returns 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', username: 'testuser', password: 'Password1!' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.detail).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'email' })])
    );
  });

  it('returns 400 for password too short', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', username: 'testuser', password: 'Ab1!' });
    expect(res.status).toBe(400);
    expect(res.body.detail).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'password' })])
    );
  });

  it('returns 400 for password missing uppercase', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', username: 'testuser', password: 'password1!' });
    expect(res.status).toBe(400);
    expect(res.body.detail).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'password' })])
    );
  });

  it('returns 400 for password missing special character', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', username: 'testuser', password: 'Password1' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for username too short', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', username: 'x', password: 'Password1!' });
    expect(res.status).toBe(400);
    expect(res.body.detail).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'username' })])
    );
  });

  it('returns 400 for username with invalid characters', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', username: 'user name!', password: 'Password1!' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: 'Password1!' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty body', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});

describe('GET /unknown-route', () => {
  it('returns 404', async () => {
    const res = await request(app).get('/api/v1/unknown-route-xyz');
    expect(res.status).toBe(404);
  });
});
