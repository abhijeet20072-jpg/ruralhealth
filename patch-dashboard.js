const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Dashboard.tsx', 'utf8');

if (!code.includes('to="/teleconsultations"')) {
  code = code.replace(
    '{ name: \'Referrals\', href: \'/referrals\', icon: \'🔄\' },',
    `{ name: 'Referrals', href: '/referrals', icon: '🔄' },
      { name: 'Teleconsultations', href: '/teleconsultations', icon: '📹' },`
  );
  fs.writeFileSync('frontend/src/pages/Dashboard.tsx', code);
}
