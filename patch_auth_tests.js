const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, 'backend', 'src');
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.test.ts'));

for (const file of files) {
  const filePath = path.join(testDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace '/api/auth/register' with '/api/auth/__test_provision' globally
  content = content.replaceAll("'/api/auth/register'", "'/api/auth/__test_provision'");

  fs.writeFileSync(filePath, content);
}

// Now we need to write the regression tests specifically for AUTH-01 in auth.test.ts
// And revert the ones in auth.test.ts testing the actual register endpoint to use '/api/auth/register'
