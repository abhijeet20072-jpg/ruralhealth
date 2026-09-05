const fs = require('fs');

const replaceFn = (str) => {
    return str.replace(/\\`/g, '`')
              .replace(/\\\$/g, '$')
              .replace(/\\\\n/g, '\\n');
};

let path = 'backend/src/notification.controller.ts';
fs.writeFileSync(path, replaceFn(fs.readFileSync(path, 'utf8')));

path = 'backend/src/notification.service.ts';
fs.writeFileSync(path, replaceFn(fs.readFileSync(path, 'utf8')));
