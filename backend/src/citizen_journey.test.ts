import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';

let citizenToken = '';
let citizenId = '';
let patientId = '';
let facilityId = '';
let doctorId = '';
let doctorToken = '';

beforeAll(async () => {
  // Clear data
  db.exec('DELETE FROM appointments; DELETE FROM referrals; DELETE FROM teleconsultations; DELETE FROM patients; DELETE FROM facility_staff; DELETE FROM facilities; DELETE FROM users;');
  
  // 1. Create a Citizen
  let res = await request(app).post('/api/auth/__test_provision').send({ username: 'citizen_journey', password: 'StrongP@ssw0rd!', role: 'ROLE_CITIZEN' });
  citizenId = res.body.userId;
  citizenToken = (await request(app).post('/api/auth/login').send({ username: 'citizen_journey', password: 'StrongP@ssw0rd!' })).body.token;

  // 2. Create Patient Profile for Citizen
  res = await request(app).post('/api/patients').set('Authorization', `Bearer ${citizenToken}`).send({
    firstName: 'Journey', lastName: 'Test', dateOfBirth: '1990-01-01', gender: 'FEMALE', phoneNumber: '9876543210'
  });
  patientId = res.body.patientId || res.body.id; 

  // 3. Create a Facility Admin & Facility
  await request(app).post('/api/auth/__test_provision').send({ username: 'fac_admin', password: 'StrongP@ssw0rd!', role: 'ROLE_FACILITY_ADMIN' });
  const adminToken = (await request(app).post('/api/auth/login').send({ username: 'fac_admin', password: 'StrongP@ssw0rd!' })).body.token;
  
  res = await request(app).post('/api/facilities').set('Authorization', `Bearer ${adminToken}`).send({
    name: 'Journey Hospital', type: 'PHC', address: '123 Rural Rd', emergencyAvailability: true
  });
  facilityId = res.body.id || res.body.facilityId; 

  // 4. Create Doctor and Assign to Facility
  res = await request(app).post('/api/auth/__test_provision').send({ username: 'doc_journey', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' });
  doctorId = res.body.userId;
  const assignRes = await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({
    facilityId, userId: doctorId
  });
  
});

describe('Complete Citizen Journey Regression', () => {
  let createdAppointmentId = '';
  
  it('1. Citizen finds facility', async () => {
    const res = await request(app).get('/api/facilities/search').set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body.facilities.length).toBe(1);
    expect(res.body.facilities[0].id).toBe(facilityId);
  });

  it('2. Citizen views facility details and sees staff', async () => {
    const res = await request(app).get(`/api/facilities/${facilityId}`).set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body.facility.staff.length).toBe(1);
    expect(res.body.facility.staff[0].id).toBe(doctorId);
  });

  it('3. Citizen obtains availability for doctor', async () => {
    const res = await request(app).get(`/api/appointments/availability?doctorId=${doctorId}&date=2026-10-10`);
    expect(res.status).toBe(200);
    expect(res.body.availableSlots.length).toBeGreaterThan(0);
    expect(res.body.availableSlots).toContain('10:00');
  });

  it('4. Citizen books appointment successfully', async () => {
    const res = await request(app).post('/api/appointments/book').set('Authorization', `Bearer ${citizenToken}`).send({
      patientId, facilityId, doctorId, date: '2026-10-10', timeSlot: '10:00'
    });
    expect(res.status).toBe(201);
    createdAppointmentId = res.body.appointmentId;
  });

  it('5. Prevent double booking same slot', async () => {
    const res = await request(app).post('/api/appointments/book').set('Authorization', `Bearer ${citizenToken}`).send({
      patientId, facilityId, doctorId, date: '2026-10-10', timeSlot: '10:00'
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Patient already has an active appointment on this date.');
  });

  it('6. Citizen retrieves own appointment history', async () => {
    const res = await request(app).get(`/api/appointments/patient/${patientId}`).set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
    expect(res.body.history.length).toBe(1);
    expect(res.body.history[0].id).toBe(createdAppointmentId);
  });

  it('7. Verify unauthorized access fails (IDOR)', async () => {
    // Create another citizen
    await request(app).post('/api/auth/__test_provision').send({ username: 'hacker_citizen', password: 'StrongP@ssw0rd!', role: 'ROLE_CITIZEN' });
    const hackerToken = (await request(app).post('/api/auth/login').send({ username: 'hacker_citizen', password: 'StrongP@ssw0rd!' })).body.token;

    // Hacker tries to view victim's appointments
    let res = await request(app).get(`/api/appointments/patient/${patientId}`).set('Authorization', `Bearer ${hackerToken}`);
    expect(res.status).toBe(403);
    
    // Hacker tries to view victim's EHR timeline
    res = await request(app).get(`/api/records/patient/${patientId}`).set('Authorization', `Bearer ${hackerToken}`);
    expect(res.status).toBe(403);
    
    // Hacker tries to view victim's referrals
    res = await request(app).get(`/api/referrals/patient/${patientId}`).set('Authorization', `Bearer ${hackerToken}`);
    expect(res.status).toBe(403);
  });
  
  it('8. Verify authorized EHR timeline access', async () => {
    // Note: timeline might be empty since no records, but should be 200, not 403.
    const res = await request(app).get(`/api/records/patient/${patientId}`).set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
  });
  
  it('9. Verify authorized Referrals access', async () => {
    const res = await request(app).get(`/api/referrals/patient/${patientId}`).set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toBe(200);
  });
});
