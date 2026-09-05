const fs = require('fs');
const path = 'backend/src/citizen_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("await request(app).post('/api/facilities/assign')", "await request(app).post('/api/facilities/assign-staff')");

fs.writeFileSync(path, code);
