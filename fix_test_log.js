const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'src', 'rbac_01.test.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "patientAId = (await request(app).post('/api/patients').set('Authorization', `Bearer ${patAToken}`).send({ firstName: 'A', lastName: 'A', dateOfBirth: '1990-01-01', gender: 'MALE', phoneNumber: '9876543210' })).body.patientId;",
  "const pA = await request(app).post('/api/patients').set('Authorization', `Bearer ${patAToken}`).send({ firstName: 'A', lastName: 'A', dateOfBirth: '1990-01-01', gender: 'MALE', phoneNumber: '9876543210' }); console.log('pA:', pA.body); patientAId = pA.body.patientId;"
);

content = content.replace(
  "patientBId = (await request(app).post('/api/patients').set('Authorization', `Bearer ${patBToken}`).send({ firstName: 'B', lastName: 'B', dateOfBirth: '1990-01-01', gender: 'MALE', phoneNumber: '9876543211' })).body.patientId;",
  "const pB = await request(app).post('/api/patients').set('Authorization', `Bearer ${patBToken}`).send({ firstName: 'B', lastName: 'B', dateOfBirth: '1990-01-01', gender: 'MALE', phoneNumber: '9876543211' }); console.log('pB:', pB.body); patientBId = pB.body.patientId;"
);

content = content.replace(
  "res = await request(app).post('/api/referrals').set('Authorization', `Bearer ${docBToken}`).send({",
  "res = await request(app).post('/api/referrals').set('Authorization', `Bearer ${docBToken}`).send({\n        priority: 'URGENT',"
);

fs.writeFileSync(file, content);
