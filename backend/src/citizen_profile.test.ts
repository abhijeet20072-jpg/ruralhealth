import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';
import crypto from 'crypto';

let citizenA_Token = '';
let citizenA_Id = '';

let citizenB_Token = '';
let citizenB_Id = '';

let adminToken = '';
let facilityId = '';
let staffToken = '';

let patientA_Id = '';
let patientB_Id = '';

beforeAll(async () => {
  db.exec('DELETE FROM emergency_cases; DELETE FROM referrals; DELETE FROM triage_assessments; DELETE FROM appointments; DELETE FROM medical_records; DELETE FROM patients; DELETE FROM facility_staff; DELETE FROM facilities; DELETE FROM users;');
  
  // Create Citizens
  await request(app).post('/api/auth/__test_provision').send({ username: 'citA', password: 'StrongP@ssw0rd!', role: 'ROLE_CITIZEN' });
  const logA = await request(app).post('/api/auth/login').send({ username: 'citA', password: 'StrongP@ssw0rd!' });
  citizenA_Token = logA.body.token;
  citizenA_Id = logA.body.user.id;

  await request(app).post('/api/auth/__test_provision').send({ username: 'citB', password: 'StrongP@ssw0rd!', role: 'ROLE_CITIZEN' });
  const logB = await request(app).post('/api/auth/login').send({ username: 'citB', password: 'StrongP@ssw0rd!' });
  citizenB_Token = logB.body.token;
  citizenB_Id = logB.body.user.id;

  // Create Admin and Staff
  await request(app).post('/api/auth/__test_provision').send({ username: 'admin', password: 'StrongP@ssw0rd!', role: 'ROLE_DISTRICT_ADMIN' });
  adminToken = (await request(app).post('/api/auth/login').send({ username: 'admin', password: 'StrongP@ssw0rd!' })).body.token;

  await request(app).post('/api/auth/__test_provision').send({ username: 'staff1', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' });
  staffToken = (await request(app).post('/api/auth/login').send({ username: 'staff1', password: 'StrongP@ssw0rd!' })).body.token;
});

describe('Citizen Patient Profile Creation', () => {

  it('1. Citizen A creates own profile (EXPECTED: 201)', async () => {
    const res = await request(app).post('/api/patients').set('Authorization', `Bearer ${citizenA_Token}`).send({
      firstName: 'Alice', lastName: 'Citizen', dateOfBirth: '1995-05-05', gender: 'FEMALE', phoneNumber: '9876543210'
    });
    expect(res.status).toBe(201);
    patientA_Id = res.body.patientId;

    // Verify ownership was forced
    const row = db.prepare('SELECT userId FROM patients WHERE id = ?').get(patientA_Id) as any;
    expect(row.userId).toBe(citizenA_Id);
  });

  it('2. Citizen A tries to create profile with Citizen B userId (EXPECTED: Ignored and forced to Citizen A, but should fail due to duplicate)', async () => {
    const res = await request(app).post('/api/patients').set('Authorization', `Bearer ${citizenA_Token}`).send({
      userId: citizenB_Id, // malicious injection attempt
      firstName: 'Alice 2', lastName: 'Citizen', dateOfBirth: '1995-05-05', gender: 'FEMALE', phoneNumber: '9876543211'
    });
    // Should be rejected because Citizen A already has a profile!
    expect(res.status).toBe(409);
  });

  it('3. Citizen A tries to create a second profile (EXPECTED: 409)', async () => {
    const res = await request(app).post('/api/patients').set('Authorization', `Bearer ${citizenA_Token}`).send({
      firstName: 'Alice 3', lastName: 'Citizen', dateOfBirth: '1995-05-05', gender: 'FEMALE', phoneNumber: '9876543212'
    });
    expect(res.status).toBe(409);
  });

  it('4. Citizen A reads own profile (EXPECTED: 200)', async () => {
    const res = await request(app).get(`/api/patients/${patientA_Id}`).set('Authorization', `Bearer ${citizenA_Token}`);
    expect(res.status).toBe(200);
  });

  it('5. Citizen A reads Patient B profile (EXPECTED: 403)', async () => {
    // First, let Citizen B create their profile
    const pB = await request(app).post('/api/patients').set('Authorization', `Bearer ${citizenB_Token}`).send({
      firstName: 'Bob', lastName: 'Citizen', dateOfBirth: '1990-01-01', gender: 'MALE', phoneNumber: '9876543213'
    });
    expect(pB.status).toBe(201);
    patientB_Id = pB.body.patientId;

    // Now Citizen A tries to read it
    const res = await request(app).get(`/api/patients/${patientB_Id}`).set('Authorization', `Bearer ${citizenA_Token}`);
    expect(res.status).toBe(403);
  });

  it('6. Citizen A updates own profile (EXPECTED: 200)', async () => {
    const res = await request(app).put(`/api/patients/${patientA_Id}`).set('Authorization', `Bearer ${citizenA_Token}`).send({
      firstName: 'Alice Updated'
    });
    expect(res.status).toBe(200);
  });

  it('7. Citizen A updates Patient B profile (EXPECTED: 403)', async () => {
    const res = await request(app).put(`/api/patients/${patientB_Id}`).set('Authorization', `Bearer ${citizenA_Token}`).send({
      firstName: 'Hacked'
    });
    expect(res.status).toBe(403);
  });

  it('8. Authorized facility staff creates patient profile (EXPECTED: 201)', async () => {
    const res = await request(app).post('/api/patients').set('Authorization', `Bearer ${staffToken}`).send({
      firstName: 'WalkIn', lastName: 'Patient', dateOfBirth: '1980-01-01', gender: 'MALE', phoneNumber: '9876543214'
    });
    expect(res.status).toBe(201);
    
    const row = db.prepare('SELECT userId FROM patients WHERE id = ?').get(res.body.patientId) as any;
    expect(row.userId).toBeNull(); // Staff-created patients have no app account initially
  });

});
