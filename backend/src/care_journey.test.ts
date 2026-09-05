import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';

let adminToken = '';
let docAToken = '';
let docBToken = '';
let patientToken = '';
let patientId = '';
let facilityAId = '';
let facilityBId = '';

beforeAll(async () => {
  // Setup identical to emergency test
  db.exec('DELETE FROM care_plans; DELETE FROM follow_ups; DELETE FROM emergency_cases; DELETE FROM referrals; DELETE FROM patients; DELETE FROM facility_staff; DELETE FROM facilities; DELETE FROM users;');
  
  await request(app).post('/api/auth/__test_provision').send({ username: 'care_admin', password: 'StrongP@ssw0rd!', role: 'ROLE_DISTRICT_ADMIN' });
  adminToken = (await request(app).post('/api/auth/login').send({ username: 'care_admin', password: 'StrongP@ssw0rd!' })).body.token;

  facilityAId = (await request(app).post('/api/facilities').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Care Clinic A', type: 'PHC', address: '123' })).body.facilityId;
  facilityBId = (await request(app).post('/api/facilities').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Care Clinic B', type: 'CHC', address: '456' })).body.facilityId;

  const docAId = (await request(app).post('/api/auth/__test_provision').send({ username: 'care_doc_a', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' })).body.userId;
  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityAId, userId: docAId });
  docAToken = (await request(app).post('/api/auth/login').send({ username: 'care_doc_a', password: 'StrongP@ssw0rd!' })).body.token;

  const docBId = (await request(app).post('/api/auth/__test_provision').send({ username: 'care_doc_b', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' })).body.userId;
  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityBId, userId: docBId });
  docBToken = (await request(app).post('/api/auth/login').send({ username: 'care_doc_b', password: 'StrongP@ssw0rd!' })).body.token;

  await request(app).post('/api/auth/__test_provision').send({ username: 'care_pat', password: 'StrongP@ssw0rd!', role: 'ROLE_CITIZEN' });
  patientToken = (await request(app).post('/api/auth/login').send({ username: 'care_pat', password: 'StrongP@ssw0rd!' })).body.token;
  patientId = (await request(app).post('/api/patients').set('Authorization', `Bearer ${patientToken}`).send({
    firstName: 'Care', lastName: 'Patient', dateOfBirth: '1950-01-01', gender: 'MALE', phoneNumber: '9876543210'
  })).body.patientId;
});

describe('High-Risk & Chronic Care Management Journey', () => {
  let carePlanId = '';

  it('1. Doctor A enrolls a 76-year-old patient with Heart Failure (Computes HIGH/CRITICAL risk)', async () => {
    const res = await request(app).post('/api/care-plans/enroll').set('Authorization', `Bearer ${docAToken}`).send({
      patientId,
      condition: 'Congestive Heart Failure',
      comorbidities: ['Hypertension', 'Diabetes Type 2'],
      goals: 'Maintain BP < 130/80',
      initialFollowUpDays: 14 // should create a follow-up automatically
    });
    expect(res.status).toBe(201);
    expect(res.body.computedRisk).toBe('CRITICAL'); // Age > 65 (+1), 2 comorbidities (+2), 'heart' condition (+2) = 5
    expect(res.body.finalRisk).toBe('CRITICAL');
    carePlanId = res.body.planId;
  });

  it('2. IDOR Protection: Doctor B cannot update Doctor A\'s care plan', async () => {
    const res = await request(app).put(`/api/care-plans/${carePlanId}`).set('Authorization', `Bearer ${docBToken}`).send({
      status: 'ESCALATED'
    });
    expect(res.status).toBe(403);
  });

  it('3. Doctor A manually overrides risk and escalates plan', async () => {
    const res = await request(app).put(`/api/care-plans/${carePlanId}`).set('Authorization', `Bearer ${docAToken}`).send({
      status: 'ESCALATED',
      riskLevel: 'HIGH'
    });
    expect(res.status).toBe(200);
  });

  it('4. Prevent duplicate active enrollments for the exact same condition', async () => {
    const res = await request(app).post('/api/care-plans/enroll').set('Authorization', `Bearer ${docAToken}`).send({
      patientId,
      condition: 'Congestive Heart Failure'
    });
    expect(res.status).toBe(409);
  });

  it('5. Enroll in a second unrelated condition works', async () => {
    const res = await request(app).post('/api/care-plans/enroll').set('Authorization', `Bearer ${docAToken}`).send({
      patientId,
      condition: 'Chronic Kidney Disease',
      overrideRiskLevel: 'LOW'
    });
    expect(res.status).toBe(201);
    expect(res.body.finalRisk).toBe('LOW');
  });

  it('6. Doctor A discharges the Heart Failure care plan', async () => {
    const res = await request(app).put(`/api/care-plans/${carePlanId}`).set('Authorization', `Bearer ${docAToken}`).send({
      status: 'DISCHARGED'
    });
    expect(res.status).toBe(200);
  });

  it('7. Cannot mutate a discharged plan', async () => {
    const res = await request(app).put(`/api/care-plans/${carePlanId}`).set('Authorization', `Bearer ${docAToken}`).send({
      goals: 'New goals'
    });
    expect(res.status).toBe(400);
  });

  it('8. Citizen can securely view only their own care plans', async () => {
    const res = await request(app).get(`/api/care-plans/patient/${patientId}`).set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.carePlans.length).toBe(2);
    // Ensure facility visibility
    expect(res.body.carePlans[0].facilityName).toBe('Care Clinic A');
  });
});
