const fs = require('fs');
const path = 'frontend/src/components/Sidebar.tsx';
let code = fs.readFileSync(path, 'utf8');

const citFind = `<Link to="/citizen/referrals" className="block px-4 py-2 hover:bg-green-700 rounded transition-colors">My Referrals</Link>`;
const citReplace = citFind + `\n          <Link to="/citizen/diagnostics" className="block px-4 py-2 hover:bg-green-700 rounded transition-colors">My Diagnostics</Link>`;
if(!code.includes('/citizen/diagnostics')) code = code.replace(citFind, citReplace);

const docFind = `<Link to="/teleconsultation/queue" className="block px-4 py-2 hover:bg-green-700 rounded transition-colors">Teleconsultation</Link>`;
const docReplace = docFind + `\n          <Link to="/diagnostics/orders" className="block px-4 py-2 hover:bg-green-700 rounded transition-colors">Lab / Diagnostics</Link>`;
if(!code.includes('/diagnostics/orders')) code = code.replace(docFind, docReplace);

fs.writeFileSync(path, code);
