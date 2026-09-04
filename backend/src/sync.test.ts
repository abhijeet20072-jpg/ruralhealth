import request from 'supertest';
import { app } from './index';
import { db } from './db';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { describe, it, expect, beforeAll } from 'vitest';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_development_only_12345';

describe('Offline Sync Module', () => {
  let docToken: string, docId = 'doc-sync', facilityId = 'fac-sync', patientId = 'pat-sync';
  
  beforeAll(() => {
    docToken = jwt.sign({ id: docId, username: 'dr_sync', role: 'ROLE_DOCTOR_MO', facilityId }, JWT_SECRET);
    
    db.prepare("INSERT OR IGNORE INTO users (id, username, passwordHash, role) VALUES (?, 'dr_sync', 'hash', 'ROLE_DOCTOR_MO')").run(docId);
    db.prepare("INSERT OR IGNORE INTO facilities (id, name, type) VALUES (?, 'Sync Fac', 'PHC')").run(facilityId);
    db.prepare("INSERT OR IGNORE INTO patients (id, firstName, lastName, dateOfBirth, gender) VALUES (?, 'Sync', 'Test', '1990-01-01', 'M')").run(patientId);
  });

  it('1. Syncing valid offline operations works', async () => {
    const triageOpId = crypto.randomUUID();
    const ehrOpId = crypto.randomUUID();

    const res = await request(app).post('/api/sync')
      .set('Authorization', `Bearer ${docToken}`)
      .send({
        operations: [
          {
            id: triageOpId,
            type: 'CREATE_TRIAGE',
            timestamp: new Date().toISOString(),
            payload: {
              patientId,
              symptoms: 'Fever offline',
              urgencyLevel: 'ROUTINE',
              recommendedAction: 'Rest'
            }
          },
          {
            id: ehrOpId,
            type: 'CREATE_MEDICAL_RECORD',
            timestamp: new Date().toISOString(),
            payload: {
              patientId,
              recordType: 'NOTES',
              notes: 'Draft notes created offline'
            }
          }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.results.length).toBe(2);
    if (res.body.results[0].status !== 'SUCCESS') console.log(res.body.results[0]); expect(res.body.results[0].status).toBe('SUCCESS');
    expect(res.body.results[1].status).toBe('SUCCESS');

    const triage = db.prepare('SELECT * FROM triage_assessments WHERE symptoms = ?').get('Fever offline');
    expect(triage).toBeDefined();
    
    const ehr = db.prepare('SELECT * FROM medical_records WHERE notes = ?').get('Draft notes created offline');
    expect(ehr).toBeDefined();
  });

  it('2. Syncing exactly the same operations returns SUCCESS (Idempotent)', async () => {
    // Requires resetting the ID to a known one to test replay
    const replayId = crypto.randomUUID();
    
    await request(app).post('/api/sync')
      .set('Authorization', `Bearer ${docToken}`)
      .send({
        operations: [{
            id: replayId,
            type: 'CREATE_MEDICAL_RECORD',
            timestamp: new Date().toISOString(),
            payload: { patientId, recordType: 'NOTES', notes: 'First Time' }
        }]
      });

    // Replay attack / offline retry
    const res = await request(app).post('/api/sync')
      .set('Authorization', `Bearer ${docToken}`)
      .send({
        operations: [{
            id: replayId,
            type: 'CREATE_MEDICAL_RECORD',
            timestamp: new Date().toISOString(),
            payload: { patientId, recordType: 'NOTES', notes: 'First Time' }
        }]
      });

    expect(res.status).toBe(200);
    if (res.body.results[0].status !== 'SUCCESS') console.log(res.body.results[0]); expect(res.body.results[0].status).toBe('SUCCESS');
    expect(res.body.results[0].message).toContain('Idempotent');

    // Make sure we didn't insert a second one
    const count: any = db.prepare('SELECT COUNT(*) as c FROM medical_records WHERE notes = ?').get('First Time');
    expect(count.c).toBe(1);
  });

  it('3. Invalid payloads are rejected individually without crashing batch', async () => {
    const validId = crypto.randomUUID();
    const invalidId = crypto.randomUUID();

    const res = await request(app).post('/api/sync')
      .set('Authorization', `Bearer ${docToken}`)
      .send({
        operations: [
          {
            id: invalidId,
            type: 'CREATE_TRIAGE',
            timestamp: new Date().toISOString(),
            payload: { patientId } // missing required fields
          },
          {
            id: validId,
            type: 'CREATE_MEDICAL_RECORD',
            timestamp: new Date().toISOString(),
            payload: { patientId, recordType: 'NOTES', notes: 'Batch valid' }
          }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.results[0].id).toBe(invalidId);
    expect(res.body.results[0].status).toBe('FAILED');
    expect(res.body.results[1].id).toBe(validId);
    expect(res.body.results[1].status).toBe('SUCCESS');
  });

});
