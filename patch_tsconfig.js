const fs = require('fs');
let path = 'backend/tsconfig.json';
let config = JSON.parse(fs.readFileSync(path, 'utf8'));
config.include = ["src/**/*"];
fs.writeFileSync(path, JSON.stringify(config, null, 2));
