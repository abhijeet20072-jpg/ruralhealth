import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';

let adminToken = '';
let facilityAdminAId = '';
let facilityAdminAToken = '';
let facilityAdminBId = '';
let facilityAdminBToken = '';
let docAToken = '';
let patientToken = '';
let facilityA = '';
let facilityB = '';
let patientId = '';

beforeAll(async () => {
  // Clear relevant data
  db.exec('DELETE FROM inventory_audit_logs; DELETE FROM facility_inventory; DELETE FROM medical_records; DELETE FROM patients; DELETE FROM facility_staff; DELETE FROM facilities; DELETE FROM users;');
  
  // Create District Admin
  await request(app).post('/api/auth/__test_provision').send({ username: 'med_dist_admin', password: 'StrongP@ssw0rd!', role: 'ROLE_DISTRICT_ADMIN' });
  adminToken = (await request(app).post('/api/auth/login').send({ username: 'med_dist_admin', password: 'StrongP@ssw0rd!' })).body.token;

  // Create Facility A
  let res = await request(app).post('/api/facilities').set('Authorization', `Bearer ${adminToken}`).send({
    name: 'Pharma A', type: 'PHC', address: '123 Main'
  });
  facilityA = res.body.facilityId;

  // Create Facility B
  res = await request(app).post('/api/facilities').set('Authorization', `Bearer ${adminToken}`).send({
    name: 'Pharma B', type: 'CHC', address: '456 Pharma Rd'
  });
  facilityB = res.body.facilityId;

  // Create Admin A for Facility A
  facilityAdminAId = (await request(app).post('/api/auth/__test_provision').send({ username: 'med_admin_a', password: 'StrongP@ssw0rd!', role: 'ROLE_FACILITY_ADMIN' })).body.userId;
  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityA, userId: facilityAdminAId });
  facilityAdminAToken = (await request(app).post('/api/auth/login').send({ username: 'med_admin_a', password: 'StrongP@ssw0rd!' })).body.token;

  // Create Admin B for Facility B
  facilityAdminBId = (await request(app).post('/api/auth/__test_provision').send({ username: 'med_admin_b', password: 'StrongP@ssw0rd!', role: 'ROLE_FACILITY_ADMIN' })).body.userId;
  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityB, userId: facilityAdminBId });
  facilityAdminBToken = (await request(app).post('/api/auth/login').send({ username: 'med_admin_b', password: 'StrongP@ssw0rd!' })).body.token;

  // Create Doctor A at Facility A
  const docAId = (await request(app).post('/api/auth/__test_provision').send({ username: 'med_doc_a', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' })).body.userId;
  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityA, userId: docAId });
  docAToken = (await request(app).post('/api/auth/login').send({ username: 'med_doc_a', password: 'StrongP@ssw0rd!' })).body.token;

  // Create Patient
  res = await request(app).post('/api/auth/__test_provision').send({ username: 'med_pat', password: 'StrongP@ssw0rd!', role: 'ROLE_CITIZEN' });
  patientToken = (await request(app).post('/api/auth/login').send({ username: 'med_pat', password: 'StrongP@ssw0rd!' })).body.token;
  res = await request(app).post('/api/patients').set('Authorization', `Bearer ${patientToken}`).send({
    firstName: 'Med', lastName: 'Patient', dateOfBirth: '1995-01-01', gender: 'MALE', phoneNumber: '9876543210'
  });
  patientId = res.body.patientId;
});

describe('Medicine Availability & Coordination', () => {

  it('1. Fetch Medicine Catalog via Search', async () => {
    const res = await request(app).get('/api/medicines/catalog?q=Para').set('Authorization', `Bearer ${docAToken}`);
    expect(res.status).toBe(200);
    expect(res.body.catalog.length).toBeGreaterThan(0);
    expect(res.body.catalog[0].medicineId).toBe('MED_PARA_500');
  });

  it('2. Facility Admin A configures stock for Paracetamol', async () => {
    const res = await request(app).put('/api/medicines/inventory').set('Authorization', `Bearer ${facilityAdminAToken}`).send({
      medicineId: 'MED_PARA_500', quantity: 100, threshold: 20
    });
    expect(res.status).toBe(200);
  });

  it('3. Facility Admin B configures stock for Amoxicillin', async () => {
    const res = await request(app).put('/api/medicines/inventory').set('Authorization', `Bearer ${facilityAdminBToken}`).send({
      medicineId: 'MED_AMOX_500', quantity: 50, threshold: 10
    });
    expect(res.status).toBe(200);
  });

  it('4. Attempt Facility Admin A -> Facility B stock modification MUST FAIL (IDOR)', async () => {
    // Admin A sends a request, but the backend natively applies req.user.facilityId (Facility A).
    // So this will just update Facility A's stock for Amoxicillin, it physically CANNOT update Facility B.
    // Let's verify that Facility A's inventory updates, not B.
    const res = await request(app).put('/api/medicines/inventory').set('Authorization', `Bearer ${facilityAdminAToken}`).send({
      medicineId: 'MED_AMOX_500', quantity: 0, threshold: 10
    });
    expect(res.status).toBe(200);
    
    // Check Facility B inventory to ensure it remains 50
    const invB = await request(app).get('/api/medicines/inventory').set('Authorization', `Bearer ${facilityAdminBToken}`);
    const amox = invB.body.inventory.find((i: any) => i.medicineId === 'MED_AMOX_500');
    expect(amox.quantity).toBe(50);
  });

  it('5. Doctor attempts to modify stock MUST FAIL (RBAC)', async () => {
    const res = await request(app).put('/api/medicines/inventory').set('Authorization', `Bearer ${docAToken}`).send({
      medicineId: 'MED_PARA_500', quantity: 500, threshold: 20
    });
    expect(res.status).toBe(403);
  });

  it('6. Attempt negative stock MUST FAIL', async () => {
    const res = await request(app).put('/api/medicines/inventory').set('Authorization', `Bearer ${facilityAdminAToken}`).send({
      medicineId: 'MED_PARA_500', quantity: -10, threshold: 20
    });
    expect(res.status).toBe(400);
  });

  it('7. Attempt invalid medicine ID MUST FAIL', async () => {
    const res = await request(app).put('/api/medicines/inventory').set('Authorization', `Bearer ${facilityAdminAToken}`).send({
      medicineId: 'MED_FAKE_999', quantity: 10, threshold: 5
    });
    expect(res.status).toBe(400);
  });

  it('8. Verify current facility availability (Doctor A at Facility A views Paracetamol)', async () => {
    const res = await request(app).get('/api/medicines/inventory').set('Authorization', `Bearer ${docAToken}`);
    expect(res.status).toBe(200);
    const para = res.body.inventory.find((i: any) => i.medicineId === 'MED_PARA_500');
    expect(para.quantity).toBe(100);
    expect(para.status).toBe('AVAILABLE');
  });

  it('9. Verify configured available facility (Doctor A checks Amoxicillin globally)', async () => {
    // Facility A has Amoxicillin at 0 quantity (from Test 4). Facility B has 50.
    const res = await request(app).get('/api/medicines/availability?medicineId=MED_AMOX_500').set('Authorization', `Bearer ${docAToken}`);
    expect(res.status).toBe(200);
    expect(res.body.facilities.length).toBe(1);
    expect(res.body.facilities[0].id).toBe(facilityB); // Facility A is excluded because quantity == 0
  });

  it('10. Doctor prescribes medicine and Citizen views it securely', async () => {
    // Mocking the creation of a PRESCRIPTION record
    const { db } = await import('./db');
    const crypto = await import('crypto');
    db.prepare(`
      INSERT INTO medical_records (id, patientId, doctorId, facilityId, recordType, notes, data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), patientId, (await request(app).get('/api/auth/me').set('Authorization', `Bearer ${docAToken}`)).body.user.id, facilityA, 'PRESCRIPTION', 'Medicines prescribed', JSON.stringify([
      { medicine: 'MED_AMOX_500', dosage: '500mg', frequency: '1-0-1', duration: '5 Days' }
    ]));

    // Citizen views their medicines
    const res = await request(app).get(`/api/medicines/patient/${patientId}`).set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.prescriptions.length).toBe(1);
    expect(res.body.prescriptions[0].medicine).toBe('MED_AMOX_500');
  });

  it('11. Citizen attempts to view another patient\'s medicines MUST FAIL', async () => {
    const res = await request(app).get(`/api/medicines/patient/00000000-0000-0000-0000-000000000000`).set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(403);
  });

});
