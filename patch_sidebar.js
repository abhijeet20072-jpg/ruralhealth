const fs = require('fs');
const path = require('path');

const sidebarPath = path.join(__dirname, 'frontend', 'src', 'components', 'Sidebar.tsx');
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

sidebarContent = sidebarContent.replace(
  `bg-gray-900 text-white min-h-[calc(100vh-4rem)]`,
  `bg-slate-900 border-r border-slate-800 text-slate-300 min-h-[calc(100vh-4.5rem)]` // 4.5rem because header has subtitle now maybe it's slightly taller
);

sidebarContent = sidebarContent.replace(
  `p-4 border-b border-gray-800`,
  `p-4 border-b border-slate-800/50`
);

sidebarContent = sidebarContent.replace(
  `isActive(item.path) ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'`,
  `isActive(item.path) ? 'bg-cyan-900/40 border-l-2 border-cyan-400 text-cyan-50 shadow-sm' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'`
);

sidebarContent = sidebarContent.replace(
  `block px-4 py-2.5 rounded transition-all font-medium text-sm`,
  `block px-4 py-2.5 rounded-r-md transition-all font-medium text-sm`
);

fs.writeFileSync(sidebarPath, sidebarContent);
