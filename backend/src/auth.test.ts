import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';
import fs from 'fs';
import path from 'path';

// Clean test db before running
beforeAll(() => {
  db.exec('DELETE FROM users;');
});

let userToken = '';
let adminToken = '';

describe('Authentication & Authorization Module', () => {
  
  it('1. Successful registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'test_citizen',
        password: 'password123',
        role: 'ROLE_CITIZEN'
      });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
    expect(res.body.userId).toBeDefined();
  });

  it('2. Duplicate registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'test_citizen',
        password: 'newpassword',
        role: 'ROLE_CITIZEN'
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Username already exists');
  });

  it('3. Successful login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test_citizen',
        password: 'password123'
      });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('test_citizen');
    userToken = res.body.token;
  });

  it('4. Incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test_citizen',
        password: 'wrongpassword'
      });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('5. Unauthorized access (Missing token)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('No token provided');
  });

  it('6. Authorized access (Valid token)', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('test_citizen');
  });

  it('7. Role restrictions (Citizen trying to access Admin)', async () => {
    const res = await request(app)
      .get('/api/auth/admin')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Insufficient role permissions');
  });

  it('7b. Role restrictions (Admin accessing Admin)', async () => {
    // Register & Login Admin
    await request(app).post('/api/auth/register').send({
      username: 'test_admin', password: 'password123', role: 'ROLE_FACILITY_ADMIN'
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      username: 'test_admin', password: 'password123'
    });
    adminToken = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/admin')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Welcome to the admin dashboard');
  });

  it('8. Logout / Session invalidation', async () => {
    // Note: stateless JWT, token is removed on client side.
    // The server just acknowledges the request.
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out successfully');
  });

});
