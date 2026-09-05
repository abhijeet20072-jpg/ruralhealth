const fs = require('fs');
const path = 'backend/src/diagnostic_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

const t1Find = `const res = await request(app).put('/api/diagnostics/facility').set('Authorization', \`Bearer \${docBToken}\`).send({`;
const t1Replace = `// docB doesn't have admin rights. Let's create an admin for Facility B.
    const adminBToken = (await request(app).post('/api/auth/register').send({ username: 'admin_b', password: 'StrongP@ssw0rd!', role: 'ROLE_FACILITY_ADMIN' })).body.userId;
    const adminBTokenStr = (await request(app).post('/api/auth/login').send({ username: 'admin_b', password: 'StrongP@ssw0rd!' })).body.token;
    await request(app).post('/api/facilities/assign-staff').set('Authorization', \`Bearer \${adminToken}\`).send({ facilityId: facilityB, userId: adminBToken });
    const res = await request(app).put('/api/diagnostics/facility').set('Authorization', \`Bearer \${adminBTokenStr}\`).send({`;
code = code.replace(t1Find, t1Replace);

fs.writeFileSync(path, code);
