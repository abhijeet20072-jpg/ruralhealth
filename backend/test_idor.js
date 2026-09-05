const request = require('supertest');
const { app } = require('./src/index');

async function run() {
  // Create 2 facilities
  let res = await request(app).post('/api/auth/register').send({ username: 'fadminA', password: 'StrongP@ssw0rd!', role: 'ROLE_FACILITY_ADMIN' });
  const adminAId = res.body.userId;
  res = await request(app).post('/api/auth/login').send({ username: 'fadminA', password: 'StrongP@ssw0rd!' });
  const tokenA = res.body.token;

  res = await request(app).post('/api/auth/register').send({ username: 'fadminB', password: 'StrongP@ssw0rd!', role: 'ROLE_FACILITY_ADMIN' });
  const adminBId = res.body.userId;
  res = await request(app).post('/api/auth/login').send({ username: 'fadminB', password: 'StrongP@ssw0rd!' });
  const tokenB = res.body.token;

  res = await request(app).post('/api/facilities').set('Authorization', `Bearer ${tokenA}`).send({ name: 'FacA', type: 'PHC', state: 'S', district: 'D', pincode: '1', latitude: 1, longitude: 1 });
  const facA = res.body.id;

  res = await request(app).post('/api/facilities').set('Authorization', `Bearer ${tokenB}`).send({ name: 'FacB', type: 'PHC', state: 'S', district: 'D', pincode: '2', latitude: 2, longitude: 2 });
  const facB = res.body.id;

  // Now admin A tries to fetch queue for FacB
  res = await request(app).get(`/api/appointments/queue?facilityId=${facB}&date=2026-10-10`).set('Authorization', `Bearer ${tokenA}`);
  console.log("Admin A -> FacB queue status:", res.status); // 200 or 403?
  
  process.exit(0);
}
run();
