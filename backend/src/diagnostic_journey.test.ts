let adminBTokenStr = '';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';

let adminToken = '';
let docAToken = '';
let docBToken = '';
let patientToken = '';
let facilityA = '';
let facilityB = '';
let patientId = '';
let docAId = '';
let orderId = '';

beforeAll(async () => {
  // Clear data
  db.exec('DELETE FROM medical_records; DELETE FROM diagnostic_orders; DELETE FROM facility_diagnostics; DELETE FROM patients; DELETE FROM facility_staff; DELETE FROM facilities; DELETE FROM users;');
  
  // Create District Admin
  await request(app).post('/api/auth/__test_provision').send({ username: 'diag_admin', password: 'StrongP@ssw0rd!', role: 'ROLE_DISTRICT_ADMIN' });
  adminToken = (await request(app).post('/api/auth/login').send({ username: 'diag_admin', password: 'StrongP@ssw0rd!' })).body.token;

  // Create Facility A (Clinic)
  let res = await request(app).post('/api/facilities').set('Authorization', `Bearer ${adminToken}`).send({
    name: 'Clinic A', type: 'PHC', address: '123 Main'
  });
  facilityA = res.body.facilityId;

  // Create Facility B (Lab)
  res = await request(app).post('/api/facilities').set('Authorization', `Bearer ${adminToken}`).send({
    name: 'Lab B', type: 'CHC', address: '456 Lab Rd'
  });
  facilityB = res.body.facilityId;

  // Create Doctor A at Facility A
  res = await request(app).post('/api/auth/__test_provision').send({ username: 'doc_a', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' });
  docAId = res.body.userId;
  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityA, userId: docAId });
  docAToken = (await request(app).post('/api/auth/login').send({ username: 'doc_a', password: 'StrongP@ssw0rd!' })).body.token;

  // Create Doctor B at Facility B (Diagnostic Staff)
  res = await request(app).post('/api/auth/__test_provision').send({ username: 'doc_b', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' });
  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityB, userId: res.body.userId });
  docBToken = (await request(app).post('/api/auth/login').send({ username: 'doc_b', password: 'StrongP@ssw0rd!' })).body.token;

  // Create Patient
  res = await request(app).post('/api/auth/__test_provision').send({ username: 'diag_pat', password: 'StrongP@ssw0rd!', role: 'ROLE_CITIZEN' });
  patientToken = (await request(app).post('/api/auth/login').send({ username: 'diag_pat', password: 'StrongP@ssw0rd!' })).body.token;
  res = await request(app).post('/api/patients').set('Authorization', `Bearer ${patientToken}`).send({
    firstName: 'Diag', lastName: 'Patient', dateOfBirth: '1990-01-01', gender: 'MALE', phoneNumber: '9876543210'
  });
  
  // Create an admin for Facility B
  const adminBId = (await request(app).post('/api/auth/__test_provision').send({ username: 'admin_b', password: 'StrongP@ssw0rd!', role: 'ROLE_FACILITY_ADMIN' })).body.userId;
  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityB, userId: adminBId });
  adminBTokenStr = (await request(app).post('/api/auth/login').send({ username: 'admin_b', password: 'StrongP@ssw0rd!' })).body.token;

  patientId = res.body.patientId;
});

describe('Diagnostic Journey Workflow & Security', () => {
  it('1. Admin configures Facility B to offer CBC test', async () => {
    const res = await request(app).put('/api/diagnostics/facility').set('Authorization', `Bearer ${adminBTokenStr}`).send({
      testCode: 'CBC', isAvailable: true
    });
    expect(res.status).toBe(200);
  });

  it('2. Doctor A finds capable facilities for CBC', async () => {
    const res = await request(app).get('/api/diagnostics/facilities?testCode=CBC').set('Authorization', `Bearer ${docAToken}`);
    expect(res.status).toBe(200);
    expect(res.body.facilities.length).toBe(1);
    expect(res.body.facilities[0].id).toBe(facilityB);
  });

  it('3. Doctor A orders CBC for Patient at Facility B', async () => {
    const res = await request(app).post('/api/diagnostics/orders').set('Authorization', `Bearer ${docAToken}`).send({
      patientId, diagnosticFacilityId: facilityB, testCode: 'CBC', clinicalReason: 'Routine checkup'
    });
    expect(res.status).toBe(201);
    orderId = res.body.orderId;
  });

  it('4. Doctor A cannot order a test that is not offered', async () => {
    const res = await request(app).post('/api/diagnostics/orders').set('Authorization', `Bearer ${docAToken}`).send({
      patientId, diagnosticFacilityId: facilityB, testCode: 'XRAY_CHEST', clinicalReason: 'Pain'
    });
    expect(res.status).toBe(400); // Facility B doesn't offer XRAY_CHEST
  });

  it('5. Facility B views incoming orders', async () => {
    const res = await request(app).get('/api/diagnostics/orders').set('Authorization', `Bearer ${docBToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders.length).toBe(1);
    expect(res.body.orders[0].id).toBe(orderId);
    expect(res.body.orders[0].status).toBe('ORDERED');
  });

  it('6. Doctor A (wrong facility) cannot accept the order', async () => {
    const res = await request(app).put(`/api/diagnostics/orders/${orderId}/status`).set('Authorization', `Bearer ${docAToken}`).send({
      status: 'ACCEPTED'
    });
    expect(res.status).toBe(403);
  });

  it('7. Facility B accepts the order', async () => {
    const res = await request(app).put(`/api/diagnostics/orders/${orderId}/status`).set('Authorization', `Bearer ${docBToken}`).send({
      status: 'ACCEPTED'
    });
    expect(res.status).toBe(200);
  });

  it('8. Invalid state transition (ACCEPTED -> COMPLETED directly) is blocked', async () => {
    // Note: status schema doesn't even allow COMPLETED in PUT /status, but let's try RESULT_READY
    const res = await request(app).put(`/api/diagnostics/orders/${orderId}/status`).set('Authorization', `Bearer ${docBToken}`).send({
      status: 'RESULT_READY'
    });
    expect(res.status).toBe(400); // Zod blocks RESULT_READY in /status endpoint anyway, handled by recordResult
  });

  it('9. Facility B moves to IN_PROGRESS', async () => {
    await request(app).put(`/api/diagnostics/orders/${orderId}/status`).set('Authorization', `Bearer ${docBToken}`).send({ status: 'SAMPLE_COLLECTED' });
    const res = await request(app).put(`/api/diagnostics/orders/${orderId}/status`).set('Authorization', `Bearer ${docBToken}`).send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
  });

  it('10. Facility B records the result', async () => {
    const res = await request(app).post(`/api/diagnostics/orders/${orderId}/result`).set('Authorization', `Bearer ${docBToken}`).send({
      resultValue: 'Hb: 14 g/dL, WBC: 6000', resultInterpretation: 'Normal study'
    });
    expect(res.status).toBe(200);
  });

  it('11. Citizen views permitted diagnostic status/result', async () => {
    const res = await request(app).get('/api/diagnostics/orders').set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders[0].status).toBe('RESULT_READY');
  });

  it('12. Citizen cannot review result', async () => {
    const res = await request(app).post(`/api/diagnostics/orders/${orderId}/review`).set('Authorization', `Bearer ${patientToken}`).send({
      clinicalInterpretation: 'Looks good'
    });
    expect(res.status).toBe(403);
  });

  it('13. Doctor A reviews result and completes the loop', async () => {
    const res = await request(app).post(`/api/diagnostics/orders/${orderId}/review`).set('Authorization', `Bearer ${docAToken}`).send({
      clinicalInterpretation: 'Patient is healthy.'
    });
    expect(res.status).toBe(200);
  });

  it('14. Result becomes part of longitudinal EHR', async () => {
    const res = await request(app).get(`/api/records/patient/${patientId}`).set('Authorization', `Bearer ${docAToken}`);
    expect(res.status).toBe(200);
    const investigation = res.body.timeline.find((t: any) => t.recordType === 'INVESTIGATION');
    expect(investigation).toBeDefined();
    expect(investigation.notes).toContain('Value: Hb: 14 g/dL, WBC: 6000');
    expect(investigation.notes).toContain('Doctor Review: Patient is healthy.');
  });
});
