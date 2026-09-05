const fs = require('fs');
const path = 'backend/src/index.ts';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import teleconsultationRoutes from './teleconsultation.routes';`;
const importReplace = `import teleconsultationRoutes from './teleconsultation.routes';\nimport consultationRoutes from './consultation.routes';`;
code = code.replace(importFind, importReplace);

fs.writeFileSync(path, code);
