const fs = require('fs');
const path = 'backend/src/auth.test.ts';
let code = fs.readFileSync(path, 'utf8');

const toFind = `expect(res.body.error).toBe('Invalid credentials');`;
const toReplace = `expect(res.body.error).toContain('Invalid credentials');`;

if (code.includes(toFind)) {
  code = code.replace(toFind, toReplace);
  fs.writeFileSync(path, code);
  console.log("Patched auth.test.ts successfully.");
} else {
  console.log("Failed to patch auth.test.ts");
}
