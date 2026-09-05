import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';
import crypto from 'crypto';

let referringToken = '';
let receivingToken = '';
let adminToken = '';

let patientId = '';
let refFacilityId = '';
let recFacilityId = '';
let refDocId = '';
let recDocId = '';

let activeReferralId = '';

beforeAll(async () => {
  db.exec('DELETE FROM referrals; DELETE FROM facility_staff; DELETE FROM facilities; DELETE FROM patients; DELETE FROM users;');
  
  // Referring Doctor (e.g. MO at PHC)
  await request(app).post('/api/auth/__test_provision').send({ username: 'refDoc', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' });
  referringToken = (await request(app).post('/api/auth/login').send({ username: 'refDoc', password: 'StrongP@ssw0rd!' })).body.token;
  refDocId = db.prepare("SELECT id FROM users WHERE username = 'refDoc'").get().id;

  // Receiving Specialist (e.g. at District Hospital)
  await request(app).post('/api/auth/__test_provision').send({ username: 'recDoc', password: 'StrongP@ssw0rd!', role: 'ROLE_SPECIALIST' });
  receivingToken = (await request(app).post('/api/auth/login').send({ username: 'recDoc', password: 'StrongP@ssw0rd!' })).body.token;
  recDocId = db.prepare("SELECT id FROM users WHERE username = 'recDoc'").get().id;

  // District Admin
  await request(app).post('/api/auth/__test_provision').send({ username: 'admin1', password: 'StrongP@ssw0rd!', role: 'ROLE_DISTRICT_ADMIN' });
  adminToken = (await request(app).post('/api/auth/login').send({ username: 'admin1', password: 'StrongP@ssw0rd!' })).body.token;

  // Facilities
  refFacilityId = crypto.randomUUID();
  db.prepare(`INSERT INTO facilities (id, name, type) VALUES (?, 'PHC Local', 'PHC')`).run(refFacilityId);
  recFacilityId = crypto.randomUUID();
  db.prepare(`INSERT INTO facilities (id, name, type) VALUES (?, 'District Main', 'DISTRICT_HOSPITAL')`).run(recFacilityId);

  // Mappings
  db.prepare(`INSERT INTO facility_staff (facilityId, userId) VALUES (?, ?)`).run(refFacilityId, refDocId);
  db.prepare(`INSERT INTO facility_staff (facilityId, userId) VALUES (?, ?)`).run(recFacilityId, recDocId);

  // Patient
  patientId = crypto.randomUUID();
  db.prepare(`INSERT INTO patients (id, firstName, lastName, dateOfBirth, gender) VALUES (?, 'John', 'Referral', '1990-01-01', 'MALE')`).run(patientId);
});

describe('Referral Management Module', () => {

  it('1. Missing receiving facility', async () => {
    const res = await request(app).post('/api/referrals').set('Authorization', `Bearer ${referringToken}`).send({
      patientId, referringFacilityId: refFacilityId, receivingFacilityId: crypto.randomUUID(), reason: 'Need X-Ray', priority: 'ROUTINE'
    });
    expect(res.status).toBe(404);
  });

  it('2. Referral Lifecycle (Create -> Accept -> Complete)', async () => {
    // CREATE (by referring)
    let res = await request(app).post('/api/referrals').set('Authorization', `Bearer ${referringToken}`).send({
      patientId, referringFacilityId: refFacilityId, receivingFacilityId: recFacilityId, reason: 'Advanced Cardiology', priority: 'URGENT'
    });
    expect(res.status).toBe(201);
    activeReferralId = res.body.referralId;

    // ACCEPT (by receiving)
    res = await request(app).put(`/api/referrals/${activeReferralId}/status`).set('Authorization', `Bearer ${receivingToken}`).send({
      status: 'ACCEPTED'
    });
    expect(res.status).toBe(200);

    // FALSE COMPLETION (missing follow-up notes)
    res = await request(app).put(`/api/referrals/${activeReferralId}/status`).set('Authorization', `Bearer ${receivingToken}`).send({
      status: 'COMPLETED'
    });
    expect(res.status).toBe(400); // Bad Request

    // PROPER COMPLETION
    res = await request(app).put(`/api/referrals/${activeReferralId}/status`).set('Authorization', `Bearer ${receivingToken}`).send({
      status: 'COMPLETED', followUpNotes: 'Patient treated successfully. Released.'
    });
    expect(res.status).toBe(200);
  });

  it('3. Duplicate referral prevented', async () => {
    // Create an active referral
    await request(app).post('/api/referrals').set('Authorization', `Bearer ${referringToken}`).send({
      patientId, referringFacilityId: refFacilityId, receivingFacilityId: recFacilityId, reason: 'Test Dup', priority: 'ROUTINE'
    });

    // Try again while first is active
    const res = await request(app).post('/api/referrals').set('Authorization', `Bearer ${referringToken}`).send({
      patientId, referringFacilityId: refFacilityId, receivingFacilityId: recFacilityId, reason: 'Test Dup 2', priority: 'ROUTINE'
    });
    expect(res.status).toBe(409); // Conflict
  });

  it('4. Unauthorized status changes', async () => {
    // Get the active referral from previous step
    const activeRef: any = db.prepare("SELECT id FROM referrals WHERE status = 'CREATED'").get();
    
    // Referring trying to Accept
    let res = await request(app).put(`/api/referrals/${activeRef.id}/status`).set('Authorization', `Bearer ${referringToken}`).send({ status: 'ACCEPTED' });
    expect(res.status).toBe(403);

    // Receiving trying to Cancel
    res = await request(app).put(`/api/referrals/${activeRef.id}/status`).set('Authorization', `Bearer ${receivingToken}`).send({ status: 'CANCELLED' });
    expect(res.status).toBe(403);
  });

  it('5. Cancelled referral', async () => {
    const activeRef: any = db.prepare("SELECT id FROM referrals WHERE status = 'CREATED'").get();
    // Only referring can cancel
    const res = await request(app).put(`/api/referrals/${activeRef.id}/status`).set('Authorization', `Bearer ${referringToken}`).send({ status: 'CANCELLED' });
    expect(res.status).toBe(200);
  });

  it('6. Rejected referral', async () => {
    // Create new
    const creRes = await request(app).post('/api/referrals').set('Authorization', `Bearer ${referringToken}`).send({
      patientId, referringFacilityId: refFacilityId, receivingFacilityId: recFacilityId, reason: 'Test Reject', priority: 'ROUTINE'
    });
    
    // Receiving rejects
    const res = await request(app).put(`/api/referrals/${creRes.body.referralId}/status`).set('Authorization', `Bearer ${receivingToken}`).send({ status: 'REJECTED' });
    expect(res.status).toBe(200);
  });

  it('7. Overdue referral dashboard', async () => {
    // Force a referral to be overdue in DB
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO referrals (id, patientId, referringFacilityId, receivingFacilityId, referringDoctorId, reason, priority, status, dueDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-1 day'))
    `).run(id, patientId, refFacilityId, recFacilityId, refDocId, 'Overdue Test', 'URGENT', 'CREATED');

    const res = await request(app).get('/api/referrals/overdue').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.overdue.length).toBeGreaterThanOrEqual(1);
    expect(res.body.overdue.some((r: any) => r.id === id)).toBe(true);
  });

  it('8. Network failure handling during update', async () => {
    const activeRef: any = db.prepare("SELECT id FROM referrals WHERE status = 'CREATED' LIMIT 1").get();
    
    // Inject mock network error message that controller checks
    const mockDbUpdate = vi.spyOn(db, 'prepare').mockImplementationOnce(() => {
      throw new Error('network simulation failure');
    });

    const res = await request(app).put(`/api/referrals/${activeRef?.id}/status`).set('Authorization', `Bearer ${referringToken}`).send({ status: 'CANCELLED' });
    expect(res.status).toBe(500);
    expect(res.body.error).toContain('Network failure');
    
    mockDbUpdate.mockRestore();
  });

});
