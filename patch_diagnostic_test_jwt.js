const fs = require('fs');
const path = 'backend/src/diagnostic_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

// For Doctor A
code = code.replace(
  "docAToken = (await request(app).post('/api/auth/login').send({ username: 'doc_a', password: 'StrongP@ssw0rd!' })).body.token;\n  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityA, userId: docAId });",
  "await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityA, userId: docAId });\n  docAToken = (await request(app).post('/api/auth/login').send({ username: 'doc_a', password: 'StrongP@ssw0rd!' })).body.token;"
);

// For Doctor B
code = code.replace(
  "docBToken = (await request(app).post('/api/auth/login').send({ username: 'doc_b', password: 'StrongP@ssw0rd!' })).body.token;\n  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityB, userId: res.body.userId });",
  "await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityB, userId: res.body.userId });\n  docBToken = (await request(app).post('/api/auth/login').send({ username: 'doc_b', password: 'StrongP@ssw0rd!' })).body.token;"
);

fs.writeFileSync(path, code);
