import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';

let clinicalToken = '';
let citizenToken = '';
let createdPatientId = '';

beforeAll(async () => {
  db.exec('DELETE FROM audit_logs; DELETE FROM patients; DELETE FROM users;');
  
  // Create Clinical User (ASHA)
  await request(app).post('/api/auth/__test_provision').send({
    username: 'asha_worker', password: 'StrongP@ssw0rd!', role: 'ROLE_ASHA'
  });
  const clinicalRes = await request(app).post('/api/auth/login').send({
    username: 'asha_worker', password: 'StrongP@ssw0rd!'
  });
  clinicalToken = clinicalRes.body.token;

  // Create Citizen
  await request(app).post('/api/auth/__test_provision').send({
    username: 'citizen_joe', password: 'StrongP@ssw0rd!', role: 'ROLE_CITIZEN'
  });
  const citizenRes = await request(app).post('/api/auth/login').send({
    username: 'citizen_joe', password: 'StrongP@ssw0rd!'
  });
  citizenToken = citizenRes.body.token;
});

describe('Patient Registration & Profile Module', () => {

  it('1. Unauthorized access (Citizen cannot access patients)', async () => {
    const res = await request(app)
      .get('/api/patients/search')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(403);
  });

  it('2. Invalid patient data', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${clinicalToken}`)
      .send({ firstName: 'A', lastName: 'B', dateOfBirth: 'invalid-date', gender: 'ALIEN' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid patient data');
  });

  it('3. Successful registration (Authorized)', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${clinicalToken}`)
      .send({
        abhaId: 'ABHA-1234-5678',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-05-15',
        gender: 'MALE',
        phoneNumber: '9876543210',
        bloodGroup: 'O+',
        allergies: ['Penicillin']
      });
    expect(res.status).toBe(201);
    expect(res.body.patientId).toBeDefined();
    createdPatientId = res.body.patientId;
  });

  it('4. Duplicate patient (ABHA ID conflict)', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${clinicalToken}`)
      .send({
        abhaId: 'ABHA-1234-5678', // Same ABHA
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: '1982-01-01',
        gender: 'FEMALE'
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('already exists');
  });

  it('5. Patient search', async () => {
    const res = await request(app)
      .get('/api/patients/search?query=John')
      .set('Authorization', `Bearer ${clinicalToken}`);
    expect(res.status).toBe(200);
    expect(res.body.patients.length).toBeGreaterThan(0);
    expect(res.body.patients[0].firstName).toBe('John');
    // Ensure sensitive details like allergies are NOT in the search list (only basic info)
    expect(res.body.patients[0].allergies).toBeUndefined();
  });

  it('6. Profile viewing (Authorized)', async () => {
    const res = await request(app)
      .get(`/api/patients/${createdPatientId}`)
      .set('Authorization', `Bearer ${clinicalToken}`);
    expect(res.status).toBe(200);
    expect(res.body.patient.bloodGroup).toBe('O+');
    expect(res.body.patient.allergies).toContain('Penicillin');
  });

  it('7. Profile update', async () => {
    const res = await request(app)
      .put(`/api/patients/${createdPatientId}`)
      .set('Authorization', `Bearer ${clinicalToken}`)
      .send({
        emergencyContactName: 'Jane Doe',
        allergies: ['Penicillin', 'Peanuts']
      });
    expect(res.status).toBe(200);

    const fetchRes = await request(app).get(`/api/patients/${createdPatientId}`).set('Authorization', `Bearer ${clinicalToken}`);
    expect(fetchRes.body.patient.emergencyContactName).toBe('Jane Doe');
    expect(fetchRes.body.patient.allergies).toContain('Peanuts');
  });

  it('8. Audit log verification', () => {
    // We check the DB directly to ensure logs were written
    const logs = db.prepare('SELECT * FROM audit_logs WHERE resourceId = ?').all(createdPatientId);
    expect(logs.length).toBeGreaterThanOrEqual(3); // Register, View, Update
    const actions = logs.map((l: any) => l.action);
    expect(actions).toContain('REGISTER_PATIENT');
    expect(actions).toContain('VIEW_PATIENT_PROFILE');
    expect(actions).toContain('UPDATE_PATIENT');
  });

});
