const fs = require('fs');
const path = 'backend/src/citizen_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("citizenId = res.body.id;", "citizenId = res.body.userId;");
code = code.replace("doctorId = res.body.id;", "doctorId = res.body.userId;");

fs.writeFileSync(path, code);
