const fs = require('fs');
const path = 'backend/src/citizen_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("facilityId = res.body.id;", "facilityId = res.body.id || res.body.facilityId; console.log('FacRes', res.body);");
code = code.replace("patientId = res.body.patientId;", "patientId = res.body.patientId || res.body.id; console.log('PatRes', res.body);");

fs.writeFileSync(path, code);
