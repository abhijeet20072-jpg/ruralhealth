import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './index';
import { db } from './db';

let adminToken = '';
let docToken = '';
let docBToken = '';
let patientToken = '';
let patientId = '';
let facilityId = '';
let facilityBId = '';
let docAId = '';

beforeAll(async () => {
  // Clear relevant data
  db.exec('DELETE FROM notifications; DELETE FROM follow_ups; DELETE FROM patients; DELETE FROM facility_staff; DELETE FROM facilities; DELETE FROM users;');
  
  // Create District Admin
  await request(app).post('/api/auth/__test_provision').send({ username: 'notif_dist_admin', password: 'StrongP@ssw0rd!', role: 'ROLE_DISTRICT_ADMIN' });
  adminToken = (await request(app).post('/api/auth/login').send({ username: 'notif_dist_admin', password: 'StrongP@ssw0rd!' })).body.token;

  // Create Facility A & B
  facilityId = (await request(app).post('/api/facilities').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Clinic A', type: 'PHC', address: '123' })).body.facilityId;
  facilityBId = (await request(app).post('/api/facilities').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Clinic B', type: 'PHC', address: '456' })).body.facilityId;

  // Create Doctor A
  docAId = (await request(app).post('/api/auth/__test_provision').send({ username: 'notif_doc_a', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' })).body.userId;
  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId, userId: docAId });
  docToken = (await request(app).post('/api/auth/login').send({ username: 'notif_doc_a', password: 'StrongP@ssw0rd!' })).body.token;

  // Create Doctor B
  const docBId = (await request(app).post('/api/auth/__test_provision').send({ username: 'notif_doc_b', password: 'StrongP@ssw0rd!', role: 'ROLE_DOCTOR_MO' })).body.userId;
  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityBId, userId: docBId });
  docBToken = (await request(app).post('/api/auth/login').send({ username: 'notif_doc_b', password: 'StrongP@ssw0rd!' })).body.token;

  // Create Patient
  await request(app).post('/api/auth/__test_provision').send({ username: 'notif_pat', password: 'StrongP@ssw0rd!', role: 'ROLE_CITIZEN' });
  patientToken = (await request(app).post('/api/auth/login').send({ username: 'notif_pat', password: 'StrongP@ssw0rd!' })).body.token;
  const pRes = (await request(app).post('/api/patients').set('Authorization', `Bearer ${patientToken}`).send({
    firstName: 'Notif', lastName: 'Patient', dateOfBirth: '1995-01-01', gender: 'MALE', phoneNumber: '9876543210'
  }));
  if(!pRes.body.patientId) console.log('PATIENT ERROR:', pRes.body);
  patientId = pRes.body.patientId;
});

describe('Notifications & Follow-Ups Journey', () => {

  it('1. Citizen books appointment -> receives APPOINTMENT_CONFIRMED notification', async () => {
    // Book Appointment
    const res = await request(app).post('/api/appointments/book').set('Authorization', `Bearer ${patientToken}`).send({
      patientId, facilityId, doctorId: docAId, date: '2026-10-10', timeSlot: '10:00'
    });
    if(res.status !== 201) console.log(res.body); expect(res.status).toBe(201);
    const appointmentId = res.body.appointmentId;

    // Check notifications
    const notifs = await request(app).get('/api/notifications').set('Authorization', `Bearer ${patientToken}`);
    expect(notifs.status).toBe(200);
    expect(notifs.body.notifications.length).toBe(1);
    expect(notifs.body.notifications[0].type).toBe('APPOINTMENT_CONFIRMED');
    expect(notifs.body.notifications[0].relatedEntityId).toBe(appointmentId);
  });

  it('2. Citizen unread count is correct, marks read', async () => {
    let unread = await request(app).get('/api/notifications/unread-count').set('Authorization', `Bearer ${patientToken}`);
    expect(unread.body.count).toBe(1);

    const notifs = await request(app).get('/api/notifications').set('Authorization', `Bearer ${patientToken}`);
    const id = notifs.body.notifications[0].id;

    // Mark read
    const res = await request(app).put(`/api/notifications/${id}/read`).set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(200);

    unread = await request(app).get('/api/notifications/unread-count').set('Authorization', `Bearer ${patientToken}`);
    expect(unread.body.count).toBe(0);
  });

  let followUpId = '';
  it('3. Doctor A creates a follow-up for Patient', async () => {
    // Due tomorrow
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const res = await request(app).post('/api/notifications/follow-ups').set('Authorization', `Bearer ${docToken}`).send({
      patientId,
      reason: 'Check BP',
      dueDate: tomorrow,
      priority: 'HIGH'
    });
    expect(res.status).toBe(201);
    followUpId = res.body.followUpId;
  });

  it('4. Facility isolation: Doctor B cannot update Doctor A\'s follow-up status', async () => {
    const res = await request(app).put(`/api/notifications/follow-ups/${followUpId}/status`).set('Authorization', `Bearer ${docBToken}`).send({
      status: 'COMPLETED'
    });
    expect(res.status).toBe(404); // Not found for Facility B
  });

  it('5. Admin Reconciliation job detects due follow-up and notifies patient idempotently', async () => {
    // Run job
    let res = await request(app).post('/api/notifications/reconcile').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    // Patient should have a FOLLOW_UP_DUE notification
    let notifs = await request(app).get('/api/notifications').set('Authorization', `Bearer ${patientToken}`);
    expect(notifs.body.notifications.find((n: any) => n.type === 'FOLLOW_UP_DUE')).toBeDefined();

    const countBefore = notifs.body.notifications.length;

    // Run job again (Idempotency check)
    res = await request(app).post('/api/notifications/reconcile').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    notifs = await request(app).get('/api/notifications').set('Authorization', `Bearer ${patientToken}`);
    expect(notifs.body.notifications.length).toBe(countBefore); // No new duplicates!
  });

  it('6. Doctor A updates follow-up to COMPLETED', async () => {
    const res = await request(app).put(`/api/notifications/follow-ups/${followUpId}/status`).set('Authorization', `Bearer ${docToken}`).send({
      status: 'COMPLETED',
      notes: 'BP is normal now'
    });
    expect(res.status).toBe(200);
  });

  it('7. Invalid transition: Cannot update COMPLETED follow-up', async () => {
    const res = await request(app).put(`/api/notifications/follow-ups/${followUpId}/status`).set('Authorization', `Bearer ${docToken}`).send({
      status: 'PENDING'
    });
    expect(res.status).toBe(400); // Invalid transition
  });

});
