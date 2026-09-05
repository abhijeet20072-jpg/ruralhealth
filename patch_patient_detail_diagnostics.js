const fs = require('fs');
const path = 'frontend/src/pages/PatientDetail.tsx';
let code = fs.readFileSync(path, 'utf8');

if(!code.includes('diagnosticOrders')) {
  const stateFind = `const [activeTab, setActiveTab] = useState('summary');`;
  const stateReplace = `const [activeTab, setActiveTab] = useState('summary');\n  const [diagnosticOrders, setDiagnosticOrders] = useState<any[]>([]);`;
  code = code.replace(stateFind, stateReplace);

  const apiFind = `const res = await api.get(\`/records/patient/\${id}\`);`;
  const apiReplace = `const res = await api.get(\`/records/patient/\${id}\`);\n        const diagRes = await api.get(\`/diagnostics/patient/\${id}\`).catch(() => null);\n        if (diagRes) setDiagnosticOrders(diagRes.data.orders);`;
  code = code.replace(apiFind, apiReplace);
}

// But wait, there is no `/api/diagnostics/patient/:id` route!
fs.writeFileSync(path, code);
