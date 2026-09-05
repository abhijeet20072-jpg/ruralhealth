import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';
import crypto from 'crypto';

let docAToken = '';
let docBToken = '';
let docAId = '';
let docBId = '';
let facAId = '';
let facBId = '';

let patientAId = '';
let patAToken = '';

let patientBId = '';
let aptId_A = '';
let patBToken = '';

let adminToken = '';

beforeAll(async () => {
  db.exec('DELETE FROM emergency_cases; DELETE FROM referrals; DELETE FROM triage_assessments; DELETE FROM appointments; DELETE FROM medical_records; DELETE FROM patients; DELETE FROM facility_staff; DELETE FROM facilities; DELETE FROM users;');
  
  // Admin to create facilities
  await request(app).post('/api/auth/__test_provision').send({ username: 'rbac_admin', password: 'StrongP@ssw0rd!', role: 'ROLE_FACILITY_ADMIN' });
  adminToken = (await request(app).post('/api/auth/login').send({ username: 'rbac_admin', password: 'StrongP@ssw0rd!' })).body.token;

  // Facilities
  facAId = (await request(app).post('/api/facilities').set('Authorization', `Bearer ${adminToken}`).send({ name: 'FacA', type: 'PHC', address: 'A', emergencyAvailability: true })).body.facilityId;
  facBId = (await request(app).post('/api/facilities').set('Authorization', `Bearer ${adminToken}`).send({ name: 'FacB', type: 'PHC', address: 'B', emergencyAvailability: true })).body.facilityId;

  // Doctor A
  docAId = (await request(app).post('/api/auth/__test_provision').send({ username: 'doc_a', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' })).body.userId;
  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facAId, userId: docAId });
  docAToken = (await request(app).post('/api/auth/login').send({ username: 'doc_a', password: 'StrongP@ssw0rd!' })).body.token;

  // Doctor B
  docBId = (await request(app).post('/api/auth/__test_provision').send({ username: 'doc_b', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' })).body.userId;
  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facBId, userId: docBId });
  docBToken = (await request(app).post('/api/auth/login').send({ username: 'doc_b', password: 'StrongP@ssw0rd!' })).body.token;

  // Patient A
  await request(app).post('/api/auth/__test_provision').send({ username: 'pat_a', password: 'StrongP@ssw0rd!', role: 'ROLE_CITIZEN' });
  patAToken = (await request(app).post('/api/auth/login').send({ username: 'pat_a', password: 'StrongP@ssw0rd!' })).body.token;
  const pA = await request(app).post('/api/patients').set('Authorization', `Bearer ${patAToken}`).send({ firstName: 'A', lastName: 'A', dateOfBirth: '1990-01-01', gender: 'MALE', phoneNumber: '9876543210' }); console.log('pA:', pA.body); patientAId = pA.body.patientId;

  // Patient B
  await request(app).post('/api/auth/__test_provision').send({ username: 'pat_b', password: 'StrongP@ssw0rd!', role: 'ROLE_CITIZEN' });
  patBToken = (await request(app).post('/api/auth/login').send({ username: 'pat_b', password: 'StrongP@ssw0rd!' })).body.token;
  const pB = await request(app).post('/api/patients').set('Authorization', `Bearer ${patBToken}`).send({ firstName: 'B', lastName: 'B', dateOfBirth: '1990-01-01', gender: 'MALE', phoneNumber: '9876543211' }); console.log('pB:', pB.body); patientBId = pB.body.patientId;

  // Establish relationship A -> FacA (by booking appointment)
  await request(app).post('/api/appointments/book').set('Authorization', `Bearer ${patAToken}`).send({ patientId: patientAId, facilityId: facAId, doctorId: docAId, date: '2030-01-01', timeSlot: '10:00' });
  
  // Establish relationship B -> FacB (by booking appointment)
  await request(app).post('/api/appointments/book').set('Authorization', `Bearer ${patBToken}`).send({ patientId: patientBId, facilityId: facBId, doctorId: docBId, date: '2030-01-01', timeSlot: '10:00' });
});

describe('RBAC-01 Cross-Facility Patient Access Policy', () => {
  it('0. Setup Appointment A for queue test', async () => {
    // Get the appointment created in beforeAll for Patient A -> Fac A
    const apts = await request(app).get('/api/appointments/queue?facilityId=' + facAId + '&date=2030-01-01').set('Authorization', `Bearer ${docAToken}`);
    aptId_A = apts.body.queue[0].id;
  });

  describe('IDOR: Queue Update Isolation', () => {
    it('Doctor B tries to update Doctor A / Fac A appointment queue status -> DENIED', async () => {
      const res = await request(app).put(`/api/appointments/${aptId_A}/queue-status`).set('Authorization', `Bearer ${docBToken}`).send({
        status: 'COMPLETED'
      });
      expect(res.status).toBe(403);
    });

    it('Doctor A tries to update Doctor A / Fac A appointment queue status -> ALLOWED', async () => {
      const res = await request(app).put(`/api/appointments/${aptId_A}/queue-status`).set('Authorization', `Bearer ${docAToken}`).send({
        status: 'COMPLETED'
      });
      expect(res.status).toBe(200);
    });
  });

  // GET /api/records/patient/:patientId
  describe('EHR/Medical Records Endpoint', () => {
    it('1. Doctor A accesses Patient A -> ALLOWED', async () => {
      const res = await request(app).get(`/api/records/patient/${patientAId}`).set('Authorization', `Bearer ${docAToken}`);
      expect(res.status).toBe(200);
      expect(res.body.timeline).toBeDefined();
    });

    it('2. Doctor A accesses Patient B -> DENIED (403)', async () => {
      const res = await request(app).get(`/api/records/patient/${patientBId}`).set('Authorization', `Bearer ${docAToken}`);
      expect(res.status).toBe(403);
      expect(res.body.patient).toBeUndefined();
    });

    it('3. Doctor B accesses Patient A -> DENIED (403)', async () => {
      const res = await request(app).get(`/api/records/patient/${patientAId}`).set('Authorization', `Bearer ${docBToken}`);
      expect(res.status).toBe(403);
    });

    it('4. Citizen A accesses Patient B -> DENIED (403)', async () => {
      const res = await request(app).get(`/api/records/patient/${patientBId}`).set('Authorization', `Bearer ${patAToken}`);
      expect(res.status).toBe(403);
    });

    it('5. Citizen A accesses Patient A -> ALLOWED', async () => {
      const res = await request(app).get(`/api/records/patient/${patientAId}`).set('Authorization', `Bearer ${patAToken}`);
      expect(res.status).toBe(200);
    });
  });

  // GET /api/triage/patient/:patientId
  describe('Triage Endpoint', () => {
    it('Doctor A accesses Patient B Triage -> DENIED', async () => {
      const res = await request(app).get(`/api/triage/patient/${patientBId}`).set('Authorization', `Bearer ${docAToken}`);
      expect(res.status).toBe(403);
    });
  });

  // Cross-facility Referral
  describe('Cross-facility Access via Referral', () => {
    it('6. Doctor B refers Patient B to Fac A. Doctor A now accesses Patient B -> ALLOWED', async () => {
      // Create triage for Pat B at Fac B
      let res = await request(app).post('/api/triage/assess').set('Authorization', `Bearer ${docBToken}`).send({
        patientId: patientBId, symptoms: ['Headache'], vitals: { temperature: 37 }
      });
      const triageId = res.body.triageId;

      // Doctor B refers Patient B to Fac A
      res = await request(app).post('/api/referrals').set('Authorization', `Bearer ${docBToken}`).send({
        priority: 'URGENT',
        patientId: patientBId, referringFacilityId: facBId, receivingFacilityId: facAId, triageId, reason: 'Specialist'
      });
      expect(res.status).toBe(201);

      // Now Doctor A (Fac A) requests Pat B EHR
      res = await request(app).get(`/api/records/patient/${patientBId}`).set('Authorization', `Bearer ${docAToken}`);
      expect(res.status).toBe(200); // Because a referral exists receiving at Fac A
    });
  });

  // Emergency workflow
  describe('Cross-facility Access via Emergency', () => {
    it('7. Patient A has an emergency at Fac B. Doctor B now accesses Patient A -> ALLOWED', async () => {
      // Patient A goes to Fac B for an emergency
      const res = await request(app).post('/api/emergencies').set('Authorization', `Bearer ${docBToken}`).send({
        patientId: patientAId, facilityId: facBId, type: 'ACCIDENT', severity: 'CRITICAL', notes: 'Urgent'
      });
      expect(res.status).toBe(201);

      // Doctor B should now be able to fetch Patient A's EHR
      const rec = await request(app).get(`/api/records/patient/${patientAId}`).set('Authorization', `Bearer ${docBToken}`);
      expect(rec.status).toBe(200);
    });
  });

});
