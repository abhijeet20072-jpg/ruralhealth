const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'src', 'appointment.test.ts');
let content = fs.readFileSync(file, 'utf8');

// Fix Test 5
content = content.replace(
  "const res = await request(app).post('/api/appointments/book').set('Authorization', `Bearer ${citizenToken}`).send({\n      patientId: otherPatientId",
  "const res = await request(app).post('/api/appointments/book').set('Authorization', `Bearer ${doctorToken}`).send({\n      patientId: otherPatientId"
);

// Fix Test 9 (and others by refreshing doctorToken)
content = content.replace(
  "db.prepare(`INSERT INTO facility_staff (facilityId, userId) VALUES (?, ?)`).run(facilityId, doctorId);",
  "db.prepare(`INSERT INTO facility_staff (facilityId, userId) VALUES (?, ?)`).run(facilityId, doctorId);\n  doctorToken = (await request(app).post('/api/auth/login').send({ username: 'doc1', password: 'StrongP@ssw0rd!' })).body.token;"
);

fs.writeFileSync(file, content);
