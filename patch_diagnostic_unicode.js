const fs = require('fs');
const path = 'backend/src/diagnostic.controller.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/\\`Test: \\\$\\{order.testName\\}\\\\n\\`/g, "\`Test: ${order.testName}\\n\`");
code = code.replace(/\\`Value: \\\$\\{order.resultValue\\}\\\\n\\`/g, "\`Value: ${order.resultValue}\\n\`");
code = code.replace(/\\`Qualitative: \\\$\\{order.resultQualitative\\}\\\\n\\`/g, "\`Qualitative: ${order.resultQualitative}\\n\`");
code = code.replace(/\\`Lab Note: \\\$\\{order.resultInterpretation\\}\\\\n\\`/g, "\`Lab Note: ${order.resultInterpretation}\\n\`");
code = code.replace(/\\`Doctor Review: \\\$\\{parsed.clinicalInterpretation\\}\\`/g, "\`Doctor Review: ${parsed.clinicalInterpretation}\`");

fs.writeFileSync(path, code);
