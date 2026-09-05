const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'frontend/src'));
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace blue with cyan
  content = content.replace(/bg-blue-/g, 'bg-cyan-');
  content = content.replace(/text-blue-/g, 'text-cyan-');
  content = content.replace(/border-blue-/g, 'border-cyan-');
  content = content.replace(/ring-blue-/g, 'ring-cyan-');
  content = content.replace(/hover:bg-blue-/g, 'hover:bg-cyan-');
  content = content.replace(/hover:text-blue-/g, 'hover:text-cyan-');
  content = content.replace(/hover:border-blue-/g, 'hover:border-cyan-');
  
  // Replace gray with slate for professional clinical surfaces
  content = content.replace(/bg-gray-/g, 'bg-slate-');
  content = content.replace(/text-gray-/g, 'text-slate-');
  content = content.replace(/border-gray-/g, 'border-slate-');
  content = content.replace(/hover:bg-gray-/g, 'hover:bg-slate-');
  content = content.replace(/hover:text-gray-/g, 'hover:text-slate-');

  // Fix up specific hardcoded strings that shouldn't have been replaced if any
  
  fs.writeFileSync(file, content);
}
console.log("Global replacements applied.");
