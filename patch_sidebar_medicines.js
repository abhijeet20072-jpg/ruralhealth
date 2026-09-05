const fs = require('fs');
const path = 'frontend/src/components/Sidebar.tsx';
let code = fs.readFileSync(path, 'utf8');

const diagFind = `<Link to="/my-diagnostics" className="block px-4 py-2 hover:bg-green-700 rounded transition-colors">My Diagnostics</Link>`;
const diagReplace = diagFind + `\n          <Link to="/my-medicines" className="block px-4 py-2 hover:bg-green-700 rounded transition-colors">My Medicines</Link>`;
if(!code.includes('/my-medicines')) code = code.replace(diagFind, diagReplace);

const staffDiagFind = `<Link to="/diagnostics/orders" className="block px-4 py-2 hover:bg-green-700 rounded transition-colors">Lab / Diagnostics</Link>`;
const staffDiagReplace = staffDiagFind + `\n          <Link to="/medicines/inventory" className="block px-4 py-2 hover:bg-green-700 rounded transition-colors">Pharmacy / Medicines</Link>`;
if(!code.includes('/medicines/inventory')) code = code.replace(staffDiagFind, staffDiagReplace);

fs.writeFileSync(path, code);
