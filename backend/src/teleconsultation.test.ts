import request from 'supertest';
import { app } from './index';
import { db } from './db';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_development_only_12345';

describe('Teleconsultation Security Module', () => {
  let docToken: string, docId = 'doc-123', facilityId = 'fac-123';
  let citizenToken: string, citizenId = 'cit-123', patientId = 'pat-123';
  let otherCitizenToken: string, otherPatientId = 'pat-999';
  let otherDocToken: string, otherDocId = 'doc-999', otherFacilityId = 'fac-999';
  let tcId: string;

  beforeAll(() => {
    // Generate valid tokens
    docToken = jwt.sign({ id: docId, username: 'dr_test', role: 'ROLE_DOCTOR_MO', facilityId }, JWT_SECRET);
    citizenToken = jwt.sign({ id: citizenId, username: 'cit_test', role: 'ROLE_CITIZEN', patientId }, JWT_SECRET);
    otherCitizenToken = jwt.sign({ id: 'cit-999', username: 'cit_999', role: 'ROLE_CITIZEN', patientId: otherPatientId }, JWT_SECRET);
    otherDocToken = jwt.sign({ id: otherDocId, username: 'dr_999', role: 'ROLE_DOCTOR_MO', facilityId: otherFacilityId }, JWT_SECRET);

    // Ensure users exist
    db.prepare("INSERT OR IGNORE INTO users (id, username, passwordHash, role) VALUES (?, 'dr_test', 'hash', 'ROLE_DOCTOR_MO')").run(docId);
    db.prepare("INSERT OR IGNORE INTO users (id, username, passwordHash, role) VALUES (?, 'cit_test', 'hash', 'ROLE_CITIZEN')").run(citizenId);
    db.prepare("INSERT OR IGNORE INTO users (id, username, passwordHash, role) VALUES (?, 'cit_999', 'hash', 'ROLE_CITIZEN')").run('cit-999');
    db.prepare("INSERT OR IGNORE INTO users (id, username, passwordHash, role) VALUES (?, 'dr_999', 'hash', 'ROLE_DOCTOR_MO')").run(otherDocId);
    
    db.prepare("INSERT OR IGNORE INTO facilities (id, name, type) VALUES (?, 'Test Fac', 'PHC')").run(facilityId);
    db.prepare("INSERT OR IGNORE INTO facilities (id, name, type) VALUES (?, 'Other Fac', 'PHC')").run(otherFacilityId);
    
    db.prepare("INSERT OR IGNORE INTO patients (id, userId, firstName, lastName, dateOfBirth, gender) VALUES (?, ?, 'John', 'Doe', '1990-01-01', 'M')").run(patientId, citizenId);
    db.prepare("INSERT OR IGNORE INTO patients (id, userId, firstName, lastName, dateOfBirth, gender) VALUES (?, ?, 'Jane', 'Doe', '1990-01-01', 'F')").run(otherPatientId, 'cit-999');
  });

  it('1. Create teleconsultation without consent blocks request', async () => {
    const res = await request(app).post('/api/teleconsultations')
      .set('Authorization', `Bearer ${docToken}`)
      .send({ patientId, doctorId: docId, facilityId, reason: 'Follow up', consentGranted: false });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Consent is strictly required');
  });

  it('2. Create valid teleconsultation', async () => {
    const res = await request(app).post('/api/teleconsultations')
      .set('Authorization', `Bearer ${docToken}`)
      .send({ patientId, doctorId: docId, facilityId, reason: 'Follow up', consentGranted: true });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    tcId = res.body.id;
  });

  it('3. Cross-patient access is rejected (IDOR)', async () => {
    const res = await request(app).get(`/api/teleconsultations/${tcId}`)
      .set('Authorization', `Bearer ${otherCitizenToken}`);
    expect(res.status).toBe(403);
  });

  it('4. Cross-facility doctor access is rejected (IDOR)', async () => {
    const res = await request(app).get(`/api/teleconsultations/${tcId}`)
      .set('Authorization', `Bearer ${otherDocToken}`);
    expect(res.status).toBe(403);
  });

  it('5. Generate Ticket (Auth) succeeds for valid participant', async () => {
    const res = await request(app).post(`/api/teleconsultations/${tcId}/ticket`)
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body.ticket).toBeDefined();
  });

  it('6. Generate Ticket fails for unauthorized participant', async () => {
    const res = await request(app).post(`/api/teleconsultations/${tcId}/ticket`)
      .set('Authorization', `Bearer ${otherCitizenToken}`);
    expect(res.status).toBe(403);
  });

  it('7. Signaling payload too large blocks request', async () => {
    const oversizedSdp = 'x'.repeat(1024 * 11); // 11KB
    const res = await request(app).post(`/api/teleconsultations/${tcId}/signaling`)
      .set('Authorization', `Bearer ${docToken}`)
      .send({ type: 'offer', sdp: oversizedSdp });
    expect(res.status).toBe(413);
  });

  it('8. Invalid state transition blocks', async () => {
    const res = await request(app).put(`/api/teleconsultations/${tcId}/status`)
      .set('Authorization', `Bearer ${docToken}`)
      .send({ status: 'COMPLETED', clinicalNotes: 'All good' });
    expect(res.status).toBe(400);
  });

  it('9. Status transitions follow state machine', async () => {
    let res = await request(app).put(`/api/teleconsultations/${tcId}/status`)
      .set('Authorization', `Bearer ${docToken}`)
      .send({ status: 'SCHEDULED' });
    expect(res.status).toBe(200);

    res = await request(app).put(`/api/teleconsultations/${tcId}/status`)
      .set('Authorization', `Bearer ${docToken}`)
      .send({ status: 'READY' });
    expect(res.status).toBe(200);

    res = await request(app).put(`/api/teleconsultations/${tcId}/status`)
      .set('Authorization', `Bearer ${docToken}`)
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
  });

  it('10. Patient cannot update status to anything except CANCELLED', async () => {
    const res = await request(app).put(`/api/teleconsultations/${tcId}/status`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ status: 'COMPLETED', clinicalNotes: 'Hacked' });
    expect(res.status).toBe(403);
  });

  it('11. Valid completion creates EHR record', async () => {
    const res = await request(app).put(`/api/teleconsultations/${tcId}/status`)
      .set('Authorization', `Bearer ${docToken}`)
      .send({ status: 'COMPLETED', clinicalNotes: 'Patient advised to rest' });
    expect(res.status).toBe(200);

    const records = db.prepare('SELECT * FROM medical_records WHERE patientId = ?').all(patientId);
    expect(records.length).toBeGreaterThan(0);
  });

  it('12. Signaling after completion blocks', async () => {
    const res = await request(app).post(`/api/teleconsultations/${tcId}/signaling`)
      .set('Authorization', `Bearer ${docToken}`)
      .send({ type: 'candidate', candidate: 'xyz' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Consultation is no longer active');
  });

});
