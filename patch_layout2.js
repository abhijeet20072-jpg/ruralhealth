const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/components/Layout.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<span className="flex items-center text-green-300">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span> Online
                  </span>`,
  `<span className="flex items-center text-emerald-400 font-semibold text-sm">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span> Online
                  </span>`
);
fs.writeFileSync(file, content);
