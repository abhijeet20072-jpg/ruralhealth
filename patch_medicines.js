const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/FacilityMedicines.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Facility Medicine Inventory</h1>`,
  `<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Medicine Inventory</h1>
          <p className="text-slate-500 mt-2">Manage facility pharmaceutical stock levels and low-stock alerts.</p>
        </div>`
);

content = content.replace(
  `className="bg-cyan-600 text-white px-4 py-2 rounded font-bold"`,
  `className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-md font-semibold shadow-sm transition-colors"`
);

content = content.replace(
  `className="bg-white rounded-xl shadow overflow-hidden"`,
  `className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"\n      <div className="overflow-x-auto">`
);

content = content.replace(
  `{inventory.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No inventory records found.</div>
        )`,
  `{inventory.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No medicines in inventory</h3>
            <p className="text-slate-500">Add medicines to start tracking stock.</p>
          </div>
        )`
);

content = content.replace(
  `</table>
        )}
      </div>`,
  `</table>
        )}
        </div>
      </div>`
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
  `bg-green-100 text-green-800`,
  `bg-emerald-100 text-emerald-800 border border-emerald-200`
);
content = content.replace(
  `bg-yellow-100 text-yellow-800`,
  `bg-amber-100 text-amber-800 border border-amber-200`
);
content = content.replace(
  `bg-red-100 text-red-800`,
  `bg-rose-100 text-rose-800 border border-rose-200`
);

fs.writeFileSync(file, content);
