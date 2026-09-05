const fs = require('fs');
const path = 'backend/src/index.ts';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import consultationRoutes from './consultation.routes';`;
const importReplace = `import consultationRoutes from './consultation.routes';\nimport diagnosticRoutes from './diagnostic.routes';`;
if(!code.includes('diagnosticRoutes')) code = code.replace(importFind, importReplace);

const useFind = `app.use('/api/consultation', consultationRoutes);`;
const useReplace = `app.use('/api/consultation', consultationRoutes);\napp.use('/api/diagnostics', diagnosticRoutes);`;
if(!code.includes('/api/diagnostics')) code = code.replace(useFind, useReplace);

fs.writeFileSync(path, code);
