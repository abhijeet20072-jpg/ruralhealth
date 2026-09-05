const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/FacilityMedicines.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `{inventory.length === 0 && <div className="p-8 text-center text-slate-500">No medicines configured yet.</div>}
      </div>`,
  `{inventory.length === 0 && <div className="p-8 text-center text-slate-500">No medicines configured yet.</div>}
      </div>
      </div>`
);

fs.writeFileSync(file, content);
