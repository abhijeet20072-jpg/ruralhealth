const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Appointments.tsx', 'utf8');
code = code.replace(/const fetchFacilities = async \(\) => \{[\s\S]*?\} catch \(err\) \{\}\n  \};\n/g, '');
code = code.replace(/fetchFacilities\(\);\n/g, '');
fs.writeFileSync('frontend/src/pages/Appointments.tsx', code);
