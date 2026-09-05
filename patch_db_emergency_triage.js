const fs = require('fs');
let path = 'backend/src/db.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("FOREIGN KEY (triageId) REFERENCES triage(id)", "FOREIGN KEY (triageId) REFERENCES triage_assessments(id)");

fs.writeFileSync(path, code);
