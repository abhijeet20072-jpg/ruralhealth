const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend', 'src', 'pages', 'Register.tsx');
let content = fs.readFileSync(file, 'utf8');

// The field starts at:
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
// and ends at:
//           </div>

const fieldRegex = /<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Role<\/label>[\s\S]*?<\/div>\s*<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Password<\/label>/m;
content = content.replace(fieldRegex, `<div>\n            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>`);

// Also change the request to not include 'role' explicitly, though the backend forces it anyway.
content = content.replace(
  "await axios.post('http://localhost:3000/api/auth/register', { username, password, role });",
  "await axios.post('http://localhost:3000/api/auth/register', { username, password });"
);

fs.writeFileSync(file, content);
