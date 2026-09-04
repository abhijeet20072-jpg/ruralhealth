const fs = require('fs');
let code = fs.readFileSync('frontend/index.html', 'utf8');

if (!code.includes('manifest.json')) {
  code = code.replace(
    '</head>',
    `  <link rel="manifest" href="/manifest.json" />\n</head>`
  );
  
  code = code.replace(
    '</body>',
    `  <script>\n    if ('serviceWorker' in navigator) {\n      window.addEventListener('load', () => {\n        navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW registration failed:', err));\n      });\n    }\n  </script>\n</body>`
  );
  
  fs.writeFileSync('frontend/index.html', code);
}
