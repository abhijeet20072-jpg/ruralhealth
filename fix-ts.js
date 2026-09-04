const fs = require('fs');
let codeRoom = fs.readFileSync('frontend/src/pages/TeleconsultationRoom.tsx', 'utf8');
codeRoom = codeRoom.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('frontend/src/pages/TeleconsultationRoom.tsx', codeRoom);

let codeList = fs.readFileSync('frontend/src/pages/TeleconsultationsList.tsx', 'utf8');
codeList = codeList.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('frontend/src/pages/TeleconsultationsList.tsx', codeList);
