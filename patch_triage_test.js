const fs = require('fs');
const path = 'backend/src/clinical_journey.test.ts';
let code = fs.readFileSync(path, 'utf8');

const triageFind = `symptoms: 'High fever, cough', vitals: 'Temp: 102F', urgencyLevel: 'URGENT', recommendedAction: 'Consult Doctor'`;
const triageReplace = `symptoms: ['Fever', 'Cough'], vitals: { temperature: 39.5, heartRate: 110 }`;
code = code.replace(triageFind, triageReplace);

fs.writeFileSync(path, code);
