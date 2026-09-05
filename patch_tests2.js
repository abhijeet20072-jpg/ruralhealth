const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'src', 'appointment.test.ts');
let content = fs.readFileSync(file, 'utf8');

// Fix weak passwords
content = content.replace(/password123/g, 'StrongP@ssw0rd!');
// Also fix userId constraint bug for patient
content = content.replace(
  "db.prepare(`INSERT INTO patients (id, firstName, lastName, dateOfBirth, gender) VALUES (?, 'Test', 'Patient', '1990-01-01', 'MALE')`).run(patientId);",
  "const citUser = db.prepare(\"SELECT id FROM users WHERE username = 'cit1'\").get();\n  db.prepare(`INSERT INTO patients (id, userId, firstName, lastName, dateOfBirth, gender) VALUES (?, ?, 'Test', 'Patient', '1990-01-01', 'MALE')`).run(patientId, citUser.id);"
);

const newTests = `
describe('IDOR-01 Security Regression Tests: Facility Queue (getFacilityQueue)', () => {
  let tokenFacA = '';
  let tokenFacB = '';
  let tokenDistAdmin = '';
  let idFacA = '';
  let idFacB = '';

  beforeAll(async () => {
    // 1. Create Users
    await request(app).post('/api/auth/register').send({ username: 'fadminA_test', password: 'StrongP@ssw0rd!', role: 'ROLE_FACILITY_ADMIN' });
    const userA = db.prepare("SELECT id FROM users WHERE username = 'fadminA_test'").get().id;

    await request(app).post('/api/auth/register').send({ username: 'fadminB_test', password: 'StrongP@ssw0rd!', role: 'ROLE_FACILITY_ADMIN' });
    const userB = db.prepare("SELECT id FROM users WHERE username = 'fadminB_test'").get().id;

    await request(app).post('/api/auth/register').send({ username: 'dadmin_test', password: 'StrongP@ssw0rd!', role: 'ROLE_DISTRICT_ADMIN' });
    tokenDistAdmin = (await request(app).post('/api/auth/login').send({ username: 'dadmin_test', password: 'StrongP@ssw0rd!' })).body.token;

    // 2. Create Facilities
    idFacA = crypto.randomUUID();
    db.prepare("INSERT INTO facilities (id, name, type) VALUES (?, 'FacA', 'PHC')").run(idFacA);
    idFacB = crypto.randomUUID();
    db.prepare("INSERT INTO facilities (id, name, type) VALUES (?, 'FacB', 'PHC')").run(idFacB);

    // 3. Link Staff
    db.prepare("INSERT INTO facility_staff (facilityId, userId) VALUES (?, ?)").run(idFacA, userA);
    db.prepare("INSERT INTO facility_staff (facilityId, userId) VALUES (?, ?)").run(idFacB, userB);
    
    // Create new token to pick up the facilityId from the db
    tokenFacA = (await request(app).post('/api/auth/login').send({ username: 'fadminA_test', password: 'StrongP@ssw0rd!' })).body.token;
    tokenFacB = (await request(app).post('/api/auth/login').send({ username: 'fadminB_test', password: 'StrongP@ssw0rd!' })).body.token;
  });

  it('TEST 1 - FACILITY A -> FACILITY B: Should return 403 Forbidden', async () => {
    const res = await request(app).get(\`/api/appointments/queue?facilityId=\${idFacB}&date=2026-10-10\`).set('Authorization', \`Bearer \${tokenFacA}\`);
    expect(res.status).toBe(403);
    expect(res.body.queue).toBeUndefined();
  });

  it('TEST 2 - FACILITY A -> FACILITY A: Should return 200 OK', async () => {
    const res = await request(app).get(\`/api/appointments/queue?facilityId=\${idFacA}&date=2026-10-10\`).set('Authorization', \`Bearer \${tokenFacA}\`);
    expect(res.status).toBe(200);
    expect(res.body.queue).toBeDefined();
  });

  it('TEST 3 - FACILITY B -> FACILITY A: Should return 403 Forbidden', async () => {
    const res = await request(app).get(\`/api/appointments/queue?facilityId=\${idFacA}&date=2026-10-10\`).set('Authorization', \`Bearer \${tokenFacB}\`);
    expect(res.status).toBe(403);
    expect(res.body.queue).toBeUndefined();
  });

  it('TEST 4 - DISTRICT ADMIN: Should return 403 Forbidden', async () => {
    const res = await request(app).get(\`/api/appointments/queue?facilityId=\${idFacA}&date=2026-10-10\`).set('Authorization', \`Bearer \${tokenDistAdmin}\`);
    expect(res.status).toBe(403); // existing behavior
    expect(res.body.queue).toBeUndefined();
  });

  it('TEST 5 - MISSING FACILITY ID: Should return 400', async () => {
    const res = await request(app).get(\`/api/appointments/queue?date=2026-10-10\`).set('Authorization', \`Bearer \${tokenFacA}\`);
    expect(res.status).toBe(400);
  });

  it('TEST 6 - UNKNOWN FACILITY ID: Should return 403', async () => {
    const unknownId = crypto.randomUUID();
    const res = await request(app).get(\`/api/appointments/queue?facilityId=\${unknownId}&date=2026-10-10\`).set('Authorization', \`Bearer \${tokenFacA}\`);
    expect(res.status).toBe(403); // Because it doesn't match req.user.facilityId
  });
});
`;

content += '\n' + newTests;
fs.writeFileSync(file, content);
