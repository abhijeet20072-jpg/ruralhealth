const fs = require('fs');
let code = fs.readFileSync('backend/src/auth.middleware.ts', 'utf8');

if (!code.includes('const queryToken = req.query.token')) {
  code = code.replace(
    'const token = authHeader.split(\' \')[1];',
    `let token = authHeader.split(' ')[1];\n  if (!token && req.query.token) { token = req.query.token as string; }`
  );
  code = code.replace(
    `if (!authHeader || !authHeader.startsWith('Bearer '))`,
    `const queryToken = req.query.token as string;\n  if (!queryToken && (!authHeader || !authHeader.startsWith('Bearer ')))`
  );
  fs.writeFileSync('backend/src/auth.middleware.ts', code);
}
