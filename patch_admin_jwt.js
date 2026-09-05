const fs = require('fs');
const path = 'backend/src/diagnostic_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "adminBTokenStr = (await request(app).post('/api/auth/login').send({ username: 'admin_b', password: 'StrongP@ssw0rd!' })).body.token;\n  await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityB, userId: adminBId });",
  "await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: facilityB, userId: adminBId });\n  adminBTokenStr = (await request(app).post('/api/auth/login').send({ username: 'admin_b', password: 'StrongP@ssw0rd!' })).body.token;"
);

fs.writeFileSync(path, code);
