const fs = require('fs');
const path = 'backend/src/diagnostic_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

const t1Find = `describe('Diagnostic Journey Workflow & Security', () => {
  it('1. Admin configures Facility B to offer CBC test', async () => {
    // docB doesn't have admin rights. Let's create an admin for Facility B.
    const adminBToken = (await request(app).post('/api/auth/register').send({ username: 'admin_b', password: 'StrongP@ssw0rd!', role: 'ROLE_FACILITY_ADMIN' })).body.userId;
    const adminBTokenStr = (await request(app).post('/api/auth/login').send({ username: 'admin_b', password: 'StrongP@ssw0rd!' })).body.token;
    await request(app).post('/api/facilities/assign-staff').set('Authorization', \`Bearer \${adminToken}\`).send({ facilityId: facilityB, userId: adminBToken });
    const res = await request(app).put('/api/diagnostics/facility').set('Authorization', \`Bearer \${adminBTokenStr}\`).send({
      testCode: 'CBC', isAvailable: true
    });
    expect(res.status).toBe(200);
  });`;

const beforeAllEnd = `patientId = res.body.patientId;
});`;

const adminBCode = `
  // Create an admin for Facility B
  const adminBId = (await request(app).post('/api/auth/register').send({ username: 'admin_b', password: 'StrongP@ssw0rd!', role: 'ROLE_FACILITY_ADMIN' })).body.userId;
  adminBTokenStr = (await request(app).post('/api/auth/login').send({ username: 'admin_b', password: 'StrongP@ssw0rd!' })).body.token;
  await request(app).post('/api/facilities/assign-staff').set('Authorization', \`Bearer \${adminToken}\`).send({ facilityId: facilityB, userId: adminBId });
`;

code = code.replace(beforeAllEnd, adminBCode + "\n  " + beforeAllEnd);
code = "let adminBTokenStr = '';\n" + code;

const newT1 = `describe('Diagnostic Journey Workflow & Security', () => {
  it('1. Admin configures Facility B to offer CBC test', async () => {
    const res = await request(app).put('/api/diagnostics/facility').set('Authorization', \`Bearer \${adminBTokenStr}\`).send({
      testCode: 'CBC', isAvailable: true
    });
    expect(res.status).toBe(200);
  });`;

code = code.replace(t1Find, newT1);

fs.writeFileSync(path, code);
