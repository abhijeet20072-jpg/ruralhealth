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
  db.exec('DELETE FROM emergency_cases; DELETE FROM referrals; DELETE FROM patients; DELETE FROM facility_staff; DELETE FROM facilities; DELETE FROM users;');
  
  // Create District Admin
  await request(app).post('/api/auth/__test_provision').send({ username: 'emerg_dist_admin', password: 'StrongP@ssw0rd!', role: 'ROLE_DISTRICT_ADMIN' });
  adminToken = (await request(app).post('/api/auth/login').send({ username: 'emerg_dist_admin', password: 'StrongP@ssw0rd!' })).body.token;

  // Create Facility A & B
  facilityAId = (await request(app).post('/api/facilities').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Em Clinic A', type: 'PHC', address: '123' })).body.facilityId;
  facilityBId = (await request(app).post('/api/facilities').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Em Clinic B', type: 'CHC', address: '456' })).body.facilityId;

  // Create Doctor A
  const docAId = (await request(app).post('/api/auth/__test_provision').send({ username: 'emerg_doc_a', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' })).body.userId;
  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityAId, userId: docAId });
  docAToken = (await request(app).post('/api/auth/login').send({ username: 'emerg_doc_a', password: 'StrongP@ssw0rd!' })).body.token;

  // Create Doctor B
  const docBId = (await request(app).post('/api/auth/__test_provision').send({ username: 'emerg_doc_b', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' })).body.userId;
  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityBId, userId: docBId });
  docBToken = (await request(app).post('/api/auth/login').send({ username: 'emerg_doc_b', password: 'StrongP@ssw0rd!' })).body.token;

  // Create Patient
  await request(app).post('/api/auth/__test_provision').send({ username: 'emerg_pat', password: 'StrongP@ssw0rd!', role: 'ROLE_CITIZEN' });
  patientToken = (await request(app).post('/api/auth/login').send({ username: 'emerg_pat', password: 'StrongP@ssw0rd!' })).body.token;
  patientId = (await request(app).post('/api/patients').set('Authorization', `Bearer ${patientToken}`).send({
    firstName: 'Emerg', lastName: 'Patient', dateOfBirth: '1995-01-01', gender: 'MALE', phoneNumber: '9876543210'
  })).body.patientId;
});

describe('Emergency & Escalation Journey', () => {

  let emergencyId = '';

  it('1. Doctor A creates an Emergency Case', async () => {
    const res = await request(app).post('/api/emergencies').set('Authorization', `Bearer ${docAToken}`).send({
      patientId,
      notes: 'Severe chest pain, suspected MI'
    });
    expect(res.status).toBe(201);
    emergencyId = res.body.emergencyId;
  });

  it('2. Doctor A acknowledges and escalates', async () => {
    // ACKNOWLEDGE
    let res = await request(app).put(`/api/emergencies/${emergencyId}/status`).set('Authorization', `Bearer ${docAToken}`).send({
      status: 'ACKNOWLEDGED'
    });
    expect(res.status).toBe(200);

    // ESCALATE
    res = await request(app).put(`/api/emergencies/${emergencyId}/status`).set('Authorization', `Bearer ${docAToken}`).send({
      status: 'ESCALATED'
    });
    expect(res.status).toBe(200);
  });

  it('3. IDOR: Doctor B (different facility) cannot update Doctor A\'s emergency', async () => {
    const res = await request(app).put(`/api/emergencies/${emergencyId}/status`).set('Authorization', `Bearer ${docBToken}`).send({
      status: 'TRANSFER_REQUESTED',
      destinationFacilityId: facilityBId
    });
    expect(res.status).toBe(403);
  });

  it('4. Doctor A requests transfer to Facility B', async () => {
    const res = await request(app).put(`/api/emergencies/${emergencyId}/status`).set('Authorization', `Bearer ${docAToken}`).send({
      status: 'TRANSFER_REQUESTED',
      destinationFacilityId: facilityBId
    });
    expect(res.status).toBe(200);
  });

  it('5. Doctor B (now destination) CAN accept the transfer', async () => {
    // Because Facility B is the destination, Doctor B should have access to update status
    const res = await request(app).put(`/api/emergencies/${emergencyId}/status`).set('Authorization', `Bearer ${docBToken}`).send({
      status: 'TRANSFER_ACCEPTED'
    });
    expect(res.status).toBe(200);
  });

  it('6. State Machine: Doctor B cannot skip IN_TRANSIT and go straight to RESOLVED', async () => {
    // Current is TRANSFER_ACCEPTED. Only IN_TRANSIT is valid from here. 
    // Actually, check my state machine:
    // (status === 'RESOLVED' && ['RECEIVED', 'ACKNOWLEDGED', 'ESCALATED', 'DETECTED'].includes(s))
    // From TRANSFER_ACCEPTED, it shouldn't be allowed to RESOLVE immediately without receiving.
    const res = await request(app).put(`/api/emergencies/${emergencyId}/status`).set('Authorization', `Bearer ${docBToken}`).send({
      status: 'RESOLVED'
    });
    expect(res.status).toBe(400); // Invalid transition
  });

  it('7. Complete the flow: IN_TRANSIT -> RECEIVED -> RESOLVED', async () => {
    let res = await request(app).put(`/api/emergencies/${emergencyId}/status`).set('Authorization', `Bearer ${docAToken}`).send({
      status: 'IN_TRANSIT' // Originating facility dispatches
    });
    expect(res.status).toBe(200);

    res = await request(app).put(`/api/emergencies/${emergencyId}/status`).set('Authorization', `Bearer ${docBToken}`).send({
      status: 'RECEIVED' // Dest facility receives
    });
    expect(res.status).toBe(200);

    res = await request(app).put(`/api/emergencies/${emergencyId}/status`).set('Authorization', `Bearer ${docBToken}`).send({
      status: 'RESOLVED' // Dest facility resolves
    });
    expect(res.status).toBe(200);
  });

  it('8. Cannot update a RESOLVED case', async () => {
    const res = await request(app).put(`/api/emergencies/${emergencyId}/status`).set('Authorization', `Bearer ${docBToken}`).send({
      status: 'ESCALATED'
    });
    expect(res.status).toBe(400);
  });

  it('9. Duplicate active emergency check prevents 2 active cases', async () => {
    // First, Doctor A creates a new active emergency
    let res = await request(app).post('/api/emergencies').set('Authorization', `Bearer ${docAToken}`).send({ patientId });
    expect(res.status).toBe(201);
    
    // Trying to create another one should fail 409
    res = await request(app).post('/api/emergencies').set('Authorization', `Bearer ${docAToken}`).send({ patientId });
    expect(res.status).toBe(409);
  });

  it('10. Citizen can securely view their own emergencies', async () => {
    const res = await request(app).get(`/api/emergencies/patient/${patientId}`).set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.emergencies.length).toBe(2); // The resolved one, and the new active one
  });

});
