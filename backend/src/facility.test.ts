import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';

let adminToken = '';
let citizenToken = '';
let createdFacilityId = '';

beforeAll(async () => {
  db.exec('DELETE FROM facility_staff; DELETE FROM facilities; DELETE FROM users;');
  
  // Create Admin
  await request(app).post('/api/auth/register').send({
    username: 'facility_admin', password: 'password123', role: 'ROLE_FACILITY_ADMIN'
  });
  const adminRes = await request(app).post('/api/auth/login').send({
    username: 'facility_admin', password: 'password123'
  });
  adminToken = adminRes.body.token;

  // Create Citizen
  await request(app).post('/api/auth/register').send({
    username: 'citizen_user', password: 'password123', role: 'ROLE_CITIZEN'
  });
  const citizenRes = await request(app).post('/api/auth/login').send({
    username: 'citizen_user', password: 'password123'
  });
  citizenToken = citizenRes.body.token;
});

describe('Healthcare Facility Management Module', () => {

  it('1. Permissions (Citizen cannot create facility)', async () => {
    const res = await request(app)
      .post('/api/facilities')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ name: 'Unauthorized PHC', type: 'PHC' });
    expect(res.status).toBe(403);
  });

  it('2. Invalid facility data', async () => {
    const res = await request(app)
      .post('/api/facilities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'A', type: 'INVALID_TYPE' }); // Name too short, invalid enum
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid facility data');
  });

  it('3. Facility creation', async () => {
    const res = await request(app)
      .post('/api/facilities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Village Sub-Centre Alpha',
        type: 'SUB_CENTRE',
        latitude: 28.7041,
        longitude: 77.1025,
        emergencyAvailability: true,
        services: ['Vaccination', 'Maternal Care'],
        medicineStatus: 'AVAILABLE'
      });
    expect(res.status).toBe(201);
    expect(res.body.facilityId).toBeDefined();
    createdFacilityId = res.body.facilityId;
  });

  it('4. Facility with incomplete information', async () => {
    const res = await request(app)
      .post('/api/facilities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Minimal PHC',
        type: 'PHC'
      });
    expect(res.status).toBe(201);
    // Should default medicineStatus to UNKNOWN, diagnostics to false
  });

  it('5. Facility update', async () => {
    const res = await request(app)
      .put(`/api/facilities/${createdFacilityId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        medicineStatus: 'LOW_STOCK',
        operatingHours: '24/7'
      });
    expect(res.status).toBe(200);

    // Verify update
    const fetchRes = await request(app).get(`/api/facilities/${createdFacilityId}`).set('Authorization', `Bearer ${citizenToken}`);
    expect(fetchRes.body.facility.medicineStatus).toBe('LOW_STOCK');
    expect(fetchRes.body.facility.operatingHours).toBe('24/7');
  });

  it('6. Unavailable facility', async () => {
    const res = await request(app)
      .get('/api/facilities/invalid-id')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(404);
  });

  it('7. Facility search (Nearby / Query)', async () => {
    const res = await request(app)
      .get('/api/facilities/search?query=Alpha&lat=28.7000&lng=77.1000&radius=10')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body.facilities.length).toBeGreaterThan(0);
    expect(res.body.facilities[0].name).toBe('Village Sub-Centre Alpha');
    expect(res.body.facilities[0].distance).toBeDefined();
  });

});
