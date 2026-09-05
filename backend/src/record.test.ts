import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';
import crypto from 'crypto';

let doctor1Token = '';
let doctor2Token = '';
let citizenToken = '';

let patientId = '';
let facility1Id = '';
let facility2Id = '';

beforeAll(async () => {
  db.exec('DELETE FROM medical_records; DELETE FROM audit_logs; DELETE FROM facility_staff; DELETE FROM facilities; DELETE FROM patients; DELETE FROM users;');
  
  // Register Users
  await request(app).post('/api/auth/__test_provision').send({ username: 'doc1', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' });
  doctor1Token = (await request(app).post('/api/auth/login').send({ username: 'doc1', password: 'StrongP@ssw0rd!' })).body.token;
  const doc1Id = db.prepare("SELECT id FROM users WHERE username = 'doc1'").get().id;

  await request(app).post('/api/auth/__test_provision').send({ username: 'doc2', password: 'StrongP@ssw0rd!', role: 'ROLE_SPECIALIST' });
  doctor2Token = (await request(app).post('/api/auth/login').send({ username: 'doc2', password: 'StrongP@ssw0rd!' })).body.token;
  const doc2Id = db.prepare("SELECT id FROM users WHERE username = 'doc2'").get().id;

  await request(app).post('/api/auth/__test_provision').send({ username: 'cit1', password: 'StrongP@ssw0rd!', role: 'ROLE_CITIZEN' });
  citizenToken = (await request(app).post('/api/auth/login').send({ username: 'cit1', password: 'StrongP@ssw0rd!' })).body.token;

  // Facilities
  facility1Id = crypto.randomUUID();
  db.prepare(`INSERT INTO facilities (id, name, type) VALUES (?, 'PHC Alpha', 'PHC')`).run(facility1Id);
  facility2Id = crypto.randomUUID();
  db.prepare(`INSERT INTO facilities (id, name, type) VALUES (?, 'District Beta', 'DISTRICT_HOSPITAL')`).run(facility2Id);

  // Mappings
  db.prepare(`INSERT INTO facility_staff (facilityId, userId) VALUES (?, ?)`).run(facility1Id, doc1Id);
  db.prepare(`INSERT INTO facility_staff (facilityId, userId) VALUES (?, ?)`).run(facility2Id, doc2Id);
  doctor1Token = (await request(app).post('/api/auth/login').send({ username: 'doc1', password: 'StrongP@ssw0rd!' })).body.token;
  doctor2Token = (await request(app).post('/api/auth/login').send({ username: 'doc2', password: 'StrongP@ssw0rd!' })).body.token;

  // Patient
  patientId = crypto.randomUUID();
  const cit = db.prepare("SELECT id FROM users WHERE username = 'cit1'").get(); db.prepare(`INSERT INTO patients (id, userId, firstName, lastName, dateOfBirth, gender) VALUES (?, ?, 'Test', 'Patient', '1990-01-01', 'MALE')`).run(patientId, cit.id);
});

describe('Longitudinal Medical Record Module', () => {

  it('1. Unauthorized access (Citizen cannot read or write records)', async () => {
    // Write
    let res = await request(app).post('/api/records').set('Authorization', `Bearer ${citizenToken}`).send({
      patientId, facilityId: facility1Id, recordType: 'CONSULTATION', notes: 'Bad'
    });
    expect(res.status).toBe(403);
    // Read
    const otherPatientId = crypto.randomUUID();
    res = await request(app).get(`/api/records/patient/${otherPatientId}`).set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(403);
  });

  it('2. Invalid data handling', async () => {
    const res = await request(app).post('/api/records').set('Authorization', `Bearer ${doctor1Token}`).send({
      patientId, facilityId: facility1Id, recordType: 'NOT_REAL', notes: ''
    });
    expect(res.status).toBe(400); // Zod invalid enum, empty notes
  });

  it('3. Doctor trying to write at unassigned facility', async () => {
    const res = await request(app).post('/api/records').set('Authorization', `Bearer ${doctor1Token}`).send({
      patientId, facilityId: facility2Id, recordType: 'CONSULTATION', notes: 'Valid notes'
    });
    expect(res.status).toBe(403); // doc1 is not in facility2
    expect(res.body.error).toContain('not authorized to create records for this facility');
  });

  it('4. Record creation (Authorized)', async () => {
    const res = await request(app).post('/api/records').set('Authorization', `Bearer ${doctor1Token}`).send({
      patientId, facilityId: facility1Id, recordType: 'CONSULTATION', notes: 'Patient has mild fever.',
      data: { temp: 38 }
    });
    expect(res.status).toBe(201);
  });

  it('5. Chronological ordering & Facility-to-facility access', async () => {
    // Doctor 2 adds a prescription slightly later
    await new Promise(r => setTimeout(r, 1000));
    await request(app).post('/api/records').set('Authorization', `Bearer ${doctor2Token}`).send({
      patientId, facilityId: facility2Id, recordType: 'PRESCRIPTION', notes: 'Prescribed Paracetamol 500mg'
    });

    // Doctor 2 fetches the timeline
    const res = await request(app).get(`/api/records/patient/${patientId}`).set('Authorization', `Bearer ${doctor2Token}`);
    expect(res.status).toBe(200);
    expect(res.body.timeline.length).toBe(2);
    
    // Most recent first (DESC order)
    expect(res.body.timeline[0].recordType).toBe('PRESCRIPTION');
    expect(res.body.timeline[0].facilityName).toBe('District Beta');
    
    // Older record from facility 1 visible to facility 2
    expect(res.body.timeline[1].recordType).toBe('CONSULTATION');
    expect(res.body.timeline[1].facilityName).toBe('PHC Alpha');
  });

  it('6. Traceability / Record Integrity via Audit Logs', () => {
    const logs = db.prepare('SELECT * FROM audit_logs WHERE action IN (?, ?)').all('CREATE_MEDICAL_RECORD', 'VIEW_MEDICAL_TIMELINE');
    expect(logs.length).toBeGreaterThanOrEqual(3); // 2 creates, 1 view
  });

});
