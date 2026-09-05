const fs = require('fs');
const path = 'backend/src/citizen_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("await request(app).post('/api/facilities/assign')", "const assignRes = await request(app).post('/api/facilities/assign')");
code = code.replace("facilityId, userId: doctorId\n  });", "facilityId, userId: doctorId\n  });\n  console.log('AssignRes', assignRes.body);");

code = code.replace("expect(res.status).toBe(201);", "if(res.status !== 201) console.log('BookRes', res.body); expect(res.status).toBe(201);");

fs.writeFileSync(path, code);
