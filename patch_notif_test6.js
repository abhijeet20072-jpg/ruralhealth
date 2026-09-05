const fs = require('fs');
let path = 'backend/src/notification_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "patientId = (await request(app).post('/api/patients')", 
  "const pRes = (await request(app).post('/api/patients')");
  
code = code.replace(
  "gender: 'MALE', phoneNumber: '9876543210'\n  })).body.patientId;",
  "gender: 'MALE', phoneNumber: '9876543210'\n  }));\n  if(!pRes.body.patientId) console.log('PATIENT ERROR:', pRes.body);\n  patientId = pRes.body.patientId;"
);

fs.writeFileSync(path, code);
