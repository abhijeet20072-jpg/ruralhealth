const fs = require('fs');
const path = 'backend/src/diagnostic.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const replaceFn = (str) => {
    return str.replace(/\\`/g, '`')
              .replace(/\\\$/g, '$')
              .replace(/\\\\n/g, '\\n');
};

const startIndex = code.indexOf('let ehrNotes =');
const endIndex = code.indexOf('db.prepare(', startIndex);

const oldBlock = code.substring(startIndex, endIndex);
const newBlock = replaceFn(oldBlock);

code = code.substring(0, startIndex) + newBlock + code.substring(endIndex);

fs.writeFileSync(path, code);
