const fs = require('fs');
const path = 'frontend/src/context/ConnectivityContext.tsx';
let code = fs.readFileSync(path, 'utf8');

const typeFind = `'CREATE_TRIAGE' | 'CREATE_MEDICAL_RECORD' | 'UPDATE_APPOINTMENT_STATUS' | 'CREATE_REFERRAL' | 'UPDATE_TELECONSULTATION_STATUS'`;
const typeReplace = `'CREATE_TRIAGE' | 'CREATE_MEDICAL_RECORD' | 'UPDATE_APPOINTMENT_STATUS' | 'CREATE_REFERRAL' | 'UPDATE_TELECONSULTATION_STATUS' | 'COMPLETE_CONSULTATION'`;

code = code.replace(typeFind, typeReplace);
fs.writeFileSync(path, code);

const pManagePath = 'frontend/src/pages/PatientManage.tsx';
let pmCode = fs.readFileSync(pManagePath, 'utf8');
pmCode = pmCode.replace("const payload = {", "// const payload = {");
fs.writeFileSync(pManagePath, pmCode);

