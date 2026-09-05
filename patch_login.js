const fs = require('fs');
const path = require('path');

const loginPath = path.join(__dirname, 'frontend', 'src', 'pages', 'Login.tsx');
let loginContent = fs.readFileSync(loginPath, 'utf8');

loginContent = loginContent.replace(
  `<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>`,
  `<div className="text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Arogya Connect</h1>
            <p className="mt-2 text-sm text-slate-500 font-medium tracking-wide">Connecting Every Community to Care.</p>
            <h2 className="mt-6 text-xl font-semibold text-slate-800">Sign in to your account</h2>
          </div>`
);
loginContent = loginContent.replace(
  `placeholder="Username or ABHA ID"`,
  `placeholder="Username"`
);
loginContent = loginContent.replace(/bg-blue-600/g, 'bg-cyan-600');
loginContent = loginContent.replace(/hover:bg-blue-700/g, 'hover:bg-cyan-700');
loginContent = loginContent.replace(/text-blue-600/g, 'text-cyan-600');
loginContent = loginContent.replace(/hover:text-blue-500/g, 'hover:text-cyan-700');
loginContent = loginContent.replace(/ring-blue-500/g, 'ring-cyan-500');
loginContent = loginContent.replace(/border-blue-500/g, 'border-cyan-500');
loginContent = loginContent.replace(/text-gray-900/g, 'text-slate-900');
loginContent = loginContent.replace(/text-gray-500/g, 'text-slate-500');

fs.writeFileSync(loginPath, loginContent);
