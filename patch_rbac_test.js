const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'src', 'rbac_01.test.ts');
let content = fs.readFileSync(file, 'utf8');

const target = `});

describe('RBAC-01 Cross-Facility Patient Access Policy', () => {`;

const replacement = `let aptId_A = '';
});

describe('RBAC-01 Cross-Facility Patient Access Policy', () => {
  it('0. Setup Appointment A for queue test', async () => {
    // Get the appointment created in beforeAll for Patient A -> Fac A
    const apts = await request(app).get('/api/appointments/queue?facilityId=' + facAId + '&date=2030-01-01').set('Authorization', \`Bearer \${docAToken}\`);
    aptId_A = apts.body.queue[0].id;
  });

  describe('IDOR: Queue Update Isolation', () => {
    it('Doctor B tries to update Doctor A / Fac A appointment queue status -> DENIED', async () => {
      const res = await request(app).put(\`/api/appointments/\${aptId_A}/queue-status\`).set('Authorization', \`Bearer \${docBToken}\`).send({
        status: 'COMPLETED'
      });
      expect(res.status).toBe(403);
    });

    it('Doctor A tries to update Doctor A / Fac A appointment queue status -> ALLOWED', async () => {
      const res = await request(app).put(\`/api/appointments/\${aptId_A}/queue-status\`).set('Authorization', \`Bearer \${docAToken}\`).send({
        status: 'COMPLETED'
      });
      expect(res.status).toBe(200);
    });
  });`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
