const fs = require('fs');
let code = fs.readFileSync('backend/src/auth.middleware.ts', 'utf8');

// Revert the queryToken changes to secure the primary JWT
code = code.replace(
  /const queryToken = req\.query\.token as string;\s*if \(!queryToken && \(!authHeader || !authHeader\.startsWith\('Bearer '\)\)\) {/g,
  `if (!authHeader || !authHeader.startsWith('Bearer ')) {`
);

code = code.replace(
  /let token = queryToken;\s*if \(!token && authHeader\) {\s*token = authHeader\.split\(' '\)\[1\];\s*}/g,
  `const token = authHeader.split(' ')[1];`
);

fs.writeFileSync('backend/src/auth.middleware.ts', code);
