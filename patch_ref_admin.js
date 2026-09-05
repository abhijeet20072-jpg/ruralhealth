const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/ReferralDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<h3 className="text-lg font-medium text-slate-900 mb-1">No active referrals</h3>
          <p className="text-slate-500">There are no referrals matching this criteria.</p>`,
  `<h3 className="text-lg font-medium text-slate-900 mb-1">{isDistrictAdmin ? 'No Escalations' : 'No active referrals'}</h3>
          <p className="text-slate-500">{isDistrictAdmin ? 'There are currently no overdue referrals requiring district intervention.' : 'There are no referrals matching this criteria.'}</p>`
);

content = content.replace(
  `<div className="p-4 bg-red-100 text-red-700 rounded mb-6">{error}</div>`,
  `<div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-medium mb-6 shadow-sm">{error}</div>`
);

fs.writeFileSync(file, content);
