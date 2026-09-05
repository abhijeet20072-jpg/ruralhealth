const fs = require('fs');
const path = 'backend/src/citizen_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("expect(res.body.error).toBe('Slot unavailable');", "expect(res.body.error).toBe('Patient already has an active appointment on this date.');");

fs.writeFileSync(path, code);
