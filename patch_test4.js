const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'src', 'appointment.test.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "it('TEST 4 - DISTRICT ADMIN: Should return 200 OK', async () => {\n    const res = await request(app).get(`/api/appointments/queue?facilityId=${idFacA}&date=2026-10-10`).set('Authorization', `Bearer ${tokenDistAdmin}`);\n    expect(res.status).toBe(200);\n    expect(res.body.queue).toBeDefined();\n  });",
  "it('TEST 4 - DISTRICT ADMIN: Should return 403 Forbidden', async () => {\n    const res = await request(app).get(`/api/appointments/queue?facilityId=${idFacA}&date=2026-10-10`).set('Authorization', `Bearer ${tokenDistAdmin}`);\n    expect(res.status).toBe(403);\n    expect(res.body.queue).toBeUndefined();\n  });"
);

fs.writeFileSync(file, content);
