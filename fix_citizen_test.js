const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'src', 'record.test.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "res = await request(app).get(`/api/records/patient/${patientId}`).set('Authorization', `Bearer ${citizenToken}`);",
  "const otherPatientId = crypto.randomUUID();\n    res = await request(app).get(`/api/records/patient/${otherPatientId}`).set('Authorization', `Bearer ${citizenToken}`);"
);

fs.writeFileSync(file, content);
