const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.controller.ts'));

for (const file of files) {
  const content = fs.readFileSync(path.join(srcDir, file), 'utf8');
  console.log(`\n--- ${file} ---`);
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('req.body.patientId') || line.includes('req.body.facilityId') || line.includes('req.params.patientId')) {
      console.log(`L${i+1}: ${line.trim()}`);
    }
  }
}
