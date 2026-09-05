import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';
import crypto from 'crypto';

let ashaToken = '';
let patientId = '';

beforeAll(async () => {
  db.exec('DELETE FROM triage_assessments; DELETE FROM patients; DELETE FROM users;');
  
  // Create clinical worker
  await request(app).post('/api/auth/__test_provision').send({ username: 'asha1', password: 'StrongP@ssw0rd!', role: 'ROLE_ASHA' });
  ashaToken = (await request(app).post('/api/auth/login').send({ username: 'asha1', password: 'StrongP@ssw0rd!' })).body.token;

  // Create Patient
  patientId = crypto.randomUUID();
  db.prepare(`INSERT INTO patients (id, firstName, lastName, dateOfBirth, gender) VALUES (?, 'Test', 'Patient', '1990-01-01', 'MALE')`).run(patientId);
});

describe('Digital Triage Module', () => {

  it('1. Normal case (Routine)', async () => {
    const res = await request(app).post('/api/triage/assess').set('Authorization', `Bearer ${ashaToken}`).send({
      patientId,
      vitals: { temperature: 37, heartRate: 80, spO2: 98 },
      symptoms: ['mild headache']
    });
    expect(res.status).toBe(201);
    expect(res.body.result.urgencyLevel).toBe('ROUTINE');
    expect(res.body.disclaimer).toContain('NOT a medical diagnosis');
  });

  it('2. Potentially urgent case (High Temperature)', async () => {
    const res = await request(app).post('/api/triage/assess').set('Authorization', `Bearer ${ashaToken}`).send({
      patientId,
      vitals: { temperature: 39.5, heartRate: 90 },
      symptoms: ['fever']
    });
    expect(res.status).toBe(201);
    expect(res.body.result.urgencyLevel).toBe('URGENT');
  });

  it('3. Emergency indicators (Low SpO2 & chest pain)', async () => {
    const res = await request(app).post('/api/triage/assess').set('Authorization', `Bearer ${ashaToken}`).send({
      patientId,
      vitals: { spO2: 88 },
      symptoms: ['chest pain', 'sweating']
    });
    expect(res.status).toBe(201);
    expect(res.body.result.urgencyLevel).toBe('EMERGENCY');
    expect(res.body.result.recommendedAction).toContain('Immediate medical attention');
  });

  it('4. Conflicting information takes highest severity', async () => {
    // Normal temp but has a critical emergency symptom (unconscious)
    const res = await request(app).post('/api/triage/assess').set('Authorization', `Bearer ${ashaToken}`).send({
      patientId,
      vitals: { temperature: 37 }, // Routine vital
      symptoms: ['unconscious'] // Emergency symptom
    });
    expect(res.status).toBe(201);
    expect(res.body.result.urgencyLevel).toBe('EMERGENCY'); // Engine must prefer emergency
  });

  it('5. Missing information (Only symptoms, no vitals)', async () => {
    const res = await request(app).post('/api/triage/assess').set('Authorization', `Bearer ${ashaToken}`).send({
      patientId,
      symptoms: ['cough']
    });
    expect(res.status).toBe(201);
    expect(res.body.result.urgencyLevel).toBe('ROUTINE');
  });

  it('6. Invalid inputs (Negative heart rate)', async () => {
    const res = await request(app).post('/api/triage/assess').set('Authorization', `Bearer ${ashaToken}`).send({
      patientId,
      vitals: { heartRate: -10 }
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid input data');
  });

});
