const fs = require('fs');
const replaceFn = (str) => {
    return str.replace(/\\`/g, '`')
              .replace(/\\\$/g, '$')
              .replace(/\\\\n/g, '\\n');
};
let path = 'backend/src/care_management.controller.ts';
fs.writeFileSync(path, replaceFn(fs.readFileSync(path, 'utf8')));
