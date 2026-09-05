const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/ReferralDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<h1 className="text-3xl font-bold text-slate-800 mb-6">
        {isDistrictAdmin ? 'District Overdue Referrals' : 'Referral Management'}
      </h1>`,
  `<div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {isDistrictAdmin ? 'District Overdue Referrals' : 'Referrals'}
        </h1>
        <p className="text-slate-500 mt-2">{isDistrictAdmin ? 'Escalated cases requiring intervention.' : 'Manage incoming and outgoing patient transfers.'}</p>
      </div>`
);

content = content.replace(
  `className="bg-white rounded-lg shadow overflow-hidden"`,
  `className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"`
);

content = content.replace(
  `divide-gray-200`,
  `divide-slate-200`
);
content = content.replace(
  `divide-gray-200`,
  `divide-slate-200`
);

content = content.replace(
  `{referrals.length === 0 && <div className="p-8 text-center text-slate-500">No active referrals found for this view.</div>}`,
  `{referrals.length === 0 && <div className="p-12 text-center flex flex-col items-center justify-center">
          <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No active referrals</h3>
          <p className="text-slate-500">There are no referrals matching this criteria.</p>
        </div>}`
);

fs.writeFileSync(file, content);
