import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';
import crypto from 'crypto';

let doctorToken = '';

beforeAll(async () => {
  db.exec('DELETE FROM patients; DELETE FROM users;');
  
  // Create Doctor to perform patient management
  await request(app).post('/api/auth/__test_provision').send({ username: 'doc_workflow', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' });
  doctorToken = (await request(app).post('/api/auth/login').send({ username: 'doc_workflow', password: 'StrongP@ssw0rd!' })).body.token;
});

describe('Patient Workflow Regression Tests', () => {
  let createdPatientId = '';

  it('1. Register Patient with valid Indian phone number', async () => {
    const res = await request(app).post('/api/patients').set('Authorization', `Bearer ${doctorToken}`).send({
      firstName: 'Workflow',
      lastName: 'Test',
      dateOfBirth: '1990-05-15',
      gender: 'MALE',
      phoneNumber: '9876543210' // Valid
    });
    expect(res.status).toBe(201);
    expect(res.body.patientId).toBeDefined();
    createdPatientId = res.body.patientId;
  });

  it('2. Register Patient with invalid phone number should fail', async () => {
    const res = await request(app).post('/api/patients').set('Authorization', `Bearer ${doctorToken}`).send({
      firstName: 'Invalid',
      lastName: 'Phone',
      dateOfBirth: '1990-05-15',
      gender: 'MALE',
      phoneNumber: '12345' // Invalid
    });
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toContain('Invalid Indian mobile number');
  });

  it('3. Patient appears in patient search list', async () => {
    const res = await request(app).get('/api/patients/search').set('Authorization', `Bearer ${doctorToken}`);
    expect(res.status).toBe(200);
    const found = res.body.patients.find((p: any) => p.id === createdPatientId);
    expect(found).toBeDefined();
    expect(found.firstName).toBe('Workflow');
  });

  it('4. Correct patient details are fetched by ID', async () => {
    const res = await request(app).get(`/api/patients/${createdPatientId}`).set('Authorization', `Bearer ${doctorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.patient.id).toBe(createdPatientId);
    expect(res.body.patient.phoneNumber).toBe('9876543210');
  });

  it('5. Update patient details', async () => {
    const res = await request(app).put(`/api/patients/${createdPatientId}`).set('Authorization', `Bearer ${doctorToken}`).send({
      firstName: 'Workflow',
      lastName: 'Updated',
      dateOfBirth: '1990-05-15',
      gender: 'MALE',
      phoneNumber: '9999999999'
    });
    expect(res.status).toBe(200);

    const check = await request(app).get(`/api/patients/${createdPatientId}`).set('Authorization', `Bearer ${doctorToken}`);
    expect(check.body.patient.lastName).toBe('Updated');
    expect(check.body.patient.phoneNumber).toBe('9999999999');
  });
});
