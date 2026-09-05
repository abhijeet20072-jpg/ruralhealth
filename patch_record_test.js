const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'src', 'record.test.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "db.prepare(`INSERT INTO facility_staff (facilityId, userId) VALUES (?, ?)`).run(facility2Id, doc2Id);",
  "db.prepare(`INSERT INTO facility_staff (facilityId, userId) VALUES (?, ?)`).run(facility2Id, doc2Id);\n  doctor1Token = (await request(app).post('/api/auth/login').send({ username: 'doc1', password: 'StrongP@ssw0rd!' })).body.token;\n  doctor2Token = (await request(app).post('/api/auth/login').send({ username: 'doc2', password: 'StrongP@ssw0rd!' })).body.token;"
);

// We should also patch the user ID for Patient creation if it's there
content = content.replace(
  "db.prepare(`INSERT INTO patients (id, firstName, lastName, dateOfBirth, gender) VALUES (?, 'Test', 'Patient', '1990-01-01', 'MALE')`).run(patientId);",
  "const cit = db.prepare(\"SELECT id FROM users WHERE username = 'cit1'\").get(); db.prepare(`INSERT INTO patients (id, userId, firstName, lastName, dateOfBirth, gender) VALUES (?, ?, 'Test', 'Patient', '1990-01-01', 'MALE')`).run(patientId, cit.id);"
);


fs.writeFileSync(file, content);
