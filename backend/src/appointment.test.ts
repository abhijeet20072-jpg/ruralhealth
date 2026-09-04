import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';
import crypto from 'crypto';

let citizenToken = '';
let doctorToken = '';
let patientId = '';
let facilityId = '';
let doctorId = '';

beforeAll(async () => {
  db.exec('DELETE FROM appointments; DELETE FROM facility_staff; DELETE FROM facilities; DELETE FROM patients; DELETE FROM users;');
  
  // Create citizen
  await request(app).post('/api/auth/register').send({ username: 'cit1', password: 'password123', role: 'ROLE_CITIZEN' });
  citizenToken = (await request(app).post('/api/auth/login').send({ username: 'cit1', password: 'password123' })).body.token;

  // Create Doctor
  await request(app).post('/api/auth/register').send({ username: 'doc1', password: 'password123', role: 'ROLE_DOCTOR_MO' });
  doctorToken = (await request(app).post('/api/auth/login').send({ username: 'doc1', password: 'password123' })).body.token;
  doctorId = db.prepare("SELECT id FROM users WHERE username = 'doc1'").get().id;

  // Create Patient
  patientId = crypto.randomUUID();
  db.prepare(`INSERT INTO patients (id, firstName, lastName, dateOfBirth, gender) VALUES (?, 'Test', 'Patient', '1990-01-01', 'MALE')`).run(patientId);

  // Create Facility
  facilityId = crypto.randomUUID();
  db.prepare(`INSERT INTO facilities (id, name, type) VALUES (?, 'Test Clinic', 'PHC')`).run(facilityId);

  // Link Doctor to Facility
  db.prepare(`INSERT INTO facility_staff (facilityId, userId) VALUES (?, ?)`).run(facilityId, doctorId);
});

describe('Appointment & Queue Management Module', () => {

  it('1. Facility closed (Sunday)', async () => {
    const res = await request(app).post('/api/appointments/book').set('Authorization', `Bearer ${citizenToken}`).send({
      patientId, facilityId, doctorId, date: '2026-09-06', timeSlot: '10:00' // Sep 6, 2026 is a Sunday
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('closed on Sundays');
  });

  it('2. Invalid appointment time', async () => {
    const res = await request(app).post('/api/appointments/book').set('Authorization', `Bearer ${citizenToken}`).send({
      patientId, facilityId, doctorId, date: '2026-09-07', timeSlot: '10:07'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid appointment time slot');
  });

  it('3. Doctor unavailable at facility', async () => {
    const res = await request(app).post('/api/appointments/book').set('Authorization', `Bearer ${citizenToken}`).send({
      patientId, facilityId: crypto.randomUUID(), doctorId, date: '2026-09-07', timeSlot: '10:00'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Doctor is not available');
  });

  it('4. Successful booking & Token generation', async () => {
    const res = await request(app).post('/api/appointments/book').set('Authorization', `Bearer ${citizenToken}`).send({
      patientId, facilityId, doctorId, date: '2026-09-07', timeSlot: '10:00'
    });
    expect(res.status).toBe(201);
    expect(res.body.tokenNumber).toBe(1);
    expect(res.body.appointmentId).toBeDefined();
  });

  it('5. Prevent double booking (same slot, same doctor)', async () => {
    const otherPatientId = crypto.randomUUID();
    db.prepare(`INSERT INTO patients (id, firstName, lastName, dateOfBirth, gender) VALUES (?, 'P2', 'Last', '1990-01-01', 'MALE')`).run(otherPatientId);

    const res = await request(app).post('/api/appointments/book').set('Authorization', `Bearer ${citizenToken}`).send({
      patientId: otherPatientId, facilityId, doctorId, date: '2026-09-07', timeSlot: '10:00'
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toContain('already booked');
  });

  it('6. Duplicate appointment (Same patient, same day)', async () => {
    const res = await request(app).post('/api/appointments/book').set('Authorization', `Bearer ${citizenToken}`).send({
      patientId, facilityId, doctorId, date: '2026-09-07', timeSlot: '10:15'
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toContain('already has an active appointment');
  });

  it('7. Cancelled appointment frees up capacity', async () => {
    // Get the first appointment
    const apt: any = db.prepare(`SELECT id FROM appointments WHERE patientId = ?`).get(patientId);
    
    // Cancel it
    const cancelRes = await request(app).put(`/api/appointments/${apt.id}/cancel`).set('Authorization', `Bearer ${citizenToken}`);
    expect(cancelRes.status).toBe(200);

    // Try booking same slot again (should work now because previous is cancelled)
    const res = await request(app).post('/api/appointments/book').set('Authorization', `Bearer ${citizenToken}`).send({
      patientId, facilityId, doctorId, date: '2026-09-07', timeSlot: '10:00'
    });
    expect(res.status).toBe(201);
    expect(res.body.tokenNumber).toBe(2); // Sequential token works
  });

  it('8. Queue position and estimated wait time', async () => {
    const apt: any = db.prepare(`SELECT id FROM appointments WHERE patientId = ? AND status != 'CANCELLED'`).get(patientId);
    const res = await request(app).get(`/api/appointments/${apt.id}/queue-status`).set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body.peopleAhead).toBe(0);
    expect(res.body.estimatedWaitTime).toBe('0 minutes'); // 0 ahead = 0 mins
  });

  it('9. Staff queue management', async () => {
    const apt: any = db.prepare(`SELECT id FROM appointments WHERE patientId = ? AND status != 'CANCELLED'`).get(patientId);
    const res = await request(app).put(`/api/appointments/${apt.id}/queue-status`).set('Authorization', `Bearer ${doctorToken}`).send({
      queueStatus: 'IN_CONSULTATION'
    });
    expect(res.status).toBe(200);

    const queueRes = await request(app).get(`/api/appointments/queue?facilityId=${facilityId}&date=2026-09-07`).set('Authorization', `Bearer ${doctorToken}`);
    expect(queueRes.status).toBe(200);
    expect(queueRes.body.queue[0].queueStatus).toBe('IN_CONSULTATION');
  });

});
