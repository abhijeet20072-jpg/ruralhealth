const fs = require('fs');
const path = 'frontend/src/components/Layout.tsx';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import { Sidebar } from './Sidebar';`;
const importReplace = `import { Sidebar } from './Sidebar';\nimport { NotificationBell } from './NotificationBell';`;
if(!code.includes('NotificationBell')) code = code.replace(importFind, importReplace);

const userFind = `<div className="flex items-center space-x-4">
          <span className="hidden md:inline text-sm text-gray-300">Welcome, {user?.username}</span>`;
const userReplace = `<div className="flex items-center space-x-4">
          <NotificationBell />
          <span className="hidden md:inline text-sm text-gray-300">Welcome, {user?.username}</span>`;
if(!code.includes('<NotificationBell />')) code = code.replace(userFind, userReplace);

fs.writeFileSync(path, code);
