const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.tsx', 'utf8');

if (!code.includes('ConnectivityProvider')) {
  code = code.replace(
    'import { AuthProvider } from \'./context/AuthContext\';',
    `import { AuthProvider } from './context/AuthContext';\nimport { ConnectivityProvider } from './context/ConnectivityContext';`
  );

  code = code.replace(
    '<AuthProvider>',
    `<AuthProvider>\n      <ConnectivityProvider>`
  );

  code = code.replace(
    '</AuthProvider>',
    `      </ConnectivityProvider>\n    </AuthProvider>`
  );

  fs.writeFileSync('frontend/src/App.tsx', code);
}
