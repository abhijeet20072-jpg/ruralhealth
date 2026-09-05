const fs = require('fs');
const path = require('path');

const registerPath = path.join(__dirname, 'frontend', 'src', 'pages', 'Register.tsx');
let registerContent = fs.readFileSync(registerPath, 'utf8');

registerContent = registerContent.replace(
  `<h2 className="text-2xl font-bold mb-6 text-center text-cyan-700">Create Account</h2>`,
  `<div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Arogya Connect</h1>
          <p className="text-xs text-slate-500 font-medium mb-4 tracking-wide">Connecting Every Community to Care.</p>
          <h2 className="text-xl font-bold text-slate-800">Create Account</h2>
        </div>`
);

fs.writeFileSync(registerPath, registerContent);
