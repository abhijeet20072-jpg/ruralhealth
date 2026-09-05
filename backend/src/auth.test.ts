import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';

beforeAll(() => {
  db.exec('DELETE FROM users;');
});

let userToken = '';
let adminToken = '';

describe('Authentication & Authorization Module', () => {
  
  it('1. Successful registration (Public)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'test_citizen',
        password: 'StrongP@ssw0rd!' // no role provided
      });
    expect(res.status).toBe(201);
    
    // Verify database directly
    const row = db.prepare('SELECT role FROM users WHERE username = ?').get('test_citizen') as any;
    expect(row.role).toBe('ROLE_CITIZEN');
  });

  it('2. Duplicate registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'test_citizen',
        password: 'NewStr0ngP@ss!'
      });
    expect(res.status).toBe(400);
  });

  it('3. Successful login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test_citizen',
        password: 'StrongP@ssw0rd!'
      });
    expect(res.status).toBe(200);
    userToken = res.body.token;
  });

  describe('AUTH-01 Public Registration Security (Malicious Roles)', () => {
    it('Registration with role = ROLE_DISTRICT_ADMIN must NOT create admin', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'hack_dist_admin', password: 'StrongP@ssw0rd!', role: 'ROLE_DISTRICT_ADMIN'
      });
      expect(res.status).toBe(201);
      const row = db.prepare('SELECT role FROM users WHERE username = ?').get('hack_dist_admin') as any;
      expect(row.role).toBe('ROLE_CITIZEN');
    });

    it('Registration with role = ROLE_FACILITY_ADMIN must NOT create admin', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'hack_fac_admin', password: 'StrongP@ssw0rd!', role: 'ROLE_FACILITY_ADMIN'
      });
      const row = db.prepare('SELECT role FROM users WHERE username = ?').get('hack_fac_admin') as any;
      expect(row.role).toBe('ROLE_CITIZEN');
    });

    it('Registration with role = ROLE_DOCTOR_MO must NOT create doctor', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'hack_doc', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO'
      });
      const row = db.prepare('SELECT role FROM users WHERE username = ?').get('hack_doc') as any;
      expect(row.role).toBe('ROLE_CITIZEN');
    });

    it('Registration with role = ROLE_CHO must NOT create CHO', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'hack_cho', password: 'StrongP@ssw0rd!', role: 'ROLE_CHO'
      });
      const row = db.prepare('SELECT role FROM users WHERE username = ?').get('hack_cho') as any;
      expect(row.role).toBe('ROLE_CITIZEN');
    });

    it('Registration with role = ROLE_ASHA must NOT create ASHA', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'hack_asha', password: 'StrongP@ssw0rd!', role: 'ROLE_ASHA'
      });
      const row = db.prepare('SELECT role FROM users WHERE username = ?').get('hack_asha') as any;
      expect(row.role).toBe('ROLE_CITIZEN');
    });

    it('Tampered role with unknown values remains safe', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'hack_unknown', password: 'StrongP@ssw0rd!', role: 'SUPER_HACKER'
      });
      const row = db.prepare('SELECT role FROM users WHERE username = ?').get('hack_unknown') as any;
      expect(row.role).toBe('ROLE_CITIZEN');
    });
  });

  describe('Internal Test Provisioning (__test_provision)', () => {
    it('Existing privileged synthetic/test account creation must continue working', async () => {
      const res = await request(app).post('/api/auth/__test_provision').send({
        username: 'test_admin_real', password: 'StrongP@ssw0rd!', role: 'ROLE_FACILITY_ADMIN'
      });
      expect(res.status).toBe(201);
      
      const row = db.prepare('SELECT role FROM users WHERE username = ?').get('test_admin_real') as any;
      expect(row.role).toBe('ROLE_FACILITY_ADMIN');

      const loginRes = await request(app).post('/api/auth/login').send({
        username: 'test_admin_real', password: 'StrongP@ssw0rd!'
      });
      adminToken = loginRes.body.token;
    });

    it('Role restrictions works correctly', async () => {
      // Citizen
      let res = await request(app).get('/api/auth/admin').set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
      
      // Admin
      res = await request(app).get('/api/auth/admin').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });
});
