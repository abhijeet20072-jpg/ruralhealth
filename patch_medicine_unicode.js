const fs = require('fs');
const path = 'backend/src/medicine.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const replaceFn = (str) => {
    return str.replace(/\\`/g, '`')
              .replace(/\\\$/g, '$')
              .replace(/\\\\n/g, '\\n');
};

code = replaceFn(code);

fs.writeFileSync(path, code);
