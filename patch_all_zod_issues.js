const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fileRoute = path.resolve(dir, file);
        const stat = fs.statSync(fileRoute);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fileRoute));
        } else if (fileRoute.endsWith('.ts')) {
            results.push(fileRoute);
        }
    });
    return results;
}

const files = walk('backend/src');
files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    if (code.includes('err.errors')) {
        code = code.replace(/err\.errors/g, 'err.issues');
        fs.writeFileSync(file, code);
        console.log('Patched', file);
    }
});
