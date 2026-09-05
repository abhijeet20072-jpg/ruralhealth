const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'backend', 'src', 'auth.routes.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace("import { register, login, me, logout } from './auth.controller';", "import { register, login, me, logout, testProvision } from './auth.controller';");

fs.writeFileSync(file, content);
