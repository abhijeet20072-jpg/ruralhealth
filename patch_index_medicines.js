const fs = require('fs');
const path = 'backend/src/index.ts';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import diagnosticRoutes from './diagnostic.routes';`;
const importReplace = `import diagnosticRoutes from './diagnostic.routes';\nimport medicineRoutes from './medicine.routes';`;
if(!code.includes('medicineRoutes')) code = code.replace(importFind, importReplace);

const useFind = `app.use('/api/diagnostics', diagnosticRoutes);`;
const useReplace = `app.use('/api/diagnostics', diagnosticRoutes);\napp.use('/api/medicines', medicineRoutes);`;
if(!code.includes('/api/medicines')) code = code.replace(useFind, useReplace);

fs.writeFileSync(path, code);
