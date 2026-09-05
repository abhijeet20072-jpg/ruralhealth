const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/MedicalRecords.tsx');
let content = fs.readFileSync(file, 'utf8');

const getIconStr = `
const getTypeStyles = (type: string) => {
  switch(type) {
    case 'CONSULTATION': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    case 'TRIAGE': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'PRESCRIPTION': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'DIAGNOSTIC': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'REFERRAL': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'EMERGENCY': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};
`;

// Insert helper before component
content = content.replace(
  `export const MedicalRecords: React.FC = () => {`,
  `${getIconStr}\nexport const MedicalRecords: React.FC = () => {`
);

content = content.replace(
  `<div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-cyan-100 text-cyan-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    <span className="font-bold text-xs">{record.recordType.charAt(0)}</span>
                  </div>`,
  `<div className={\`flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 \${getTypeStyles(record.recordType)}\`}>
                    <span className="font-bold text-xs">{record.recordType.charAt(0)}</span>
                  </div>`
);

content = content.replace(
  `<div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border shadow-sm">`,
  `<div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">`
);

content = content.replace(
  `<span className="font-bold text-cyan-700">{record.recordType.replace('_', ' ')}</span>`,
  `<span className={\`font-bold text-sm tracking-wide uppercase \${getTypeStyles(record.recordType).split(' ')[1]}\`}>{record.recordType.replace('_', ' ')}</span>`
);

fs.writeFileSync(file, content);
