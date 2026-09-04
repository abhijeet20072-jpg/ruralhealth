const fs = require('fs');
let code = fs.readFileSync('backend/src/index.ts', 'utf8');

if (!code.includes('import { processSync }')) {
  code = code.replace(
    'import teleconsultationRoutes from \'./teleconsultation.routes\';',
    `import teleconsultationRoutes from './teleconsultation.routes';
import { processSync } from './sync.controller';
import { clinicalAuth } from './auth.middleware';`
  );

  code = code.replace(
    'app.use(\'/api/teleconsultations\', teleconsultationRoutes);',
    `app.use('/api/teleconsultations', teleconsultationRoutes);
app.post('/api/sync', clinicalAuth, processSync);`
  );

  fs.writeFileSync('backend/src/index.ts', code);
}
