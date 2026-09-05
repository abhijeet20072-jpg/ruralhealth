const fs = require('fs');
let path = 'frontend/src/components/Layout.tsx';
let code = fs.readFileSync(path, 'utf8');

const find = `<div className="text-indigo-100 text-sm hidden md:block">`;
const replace = `<NotificationBell />\n              ` + find;
if(!code.includes('<NotificationBell />')) code = code.replace(find, replace);

fs.writeFileSync(path, code);
