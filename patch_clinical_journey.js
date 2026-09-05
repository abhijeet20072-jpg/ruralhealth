const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'src', 'clinical_journey.test.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId, userId: doctorId });",
  "await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId, userId: doctorId });\n  doctorToken = (await request(app).post('/api/auth/login').send({ username: 'clin_doc', password: 'StrongP@ssw0rd!' })).body.token;"
);

content = content.replace(
  "await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: hackerFacilityId, userId: res.body.userId });",
  "await request(app).post('/api/facilities/assign-staff').set('Authorization', `Bearer ${adminToken}`).send({ facilityId: hackerFacilityId, userId: res.body.userId });\n  hackerToken = (await request(app).post('/api/auth/login').send({ username: 'clin_hacker', password: 'StrongP@ssw0rd!' })).body.token;"
);

fs.writeFileSync(file, content);
