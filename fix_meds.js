const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/FacilityMedicines.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      <div className="overflow-x-auto">>`,
  `<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">`
);

fs.writeFileSync(file, content);
