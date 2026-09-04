const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' }).catch(e => console.log('GOTO ERROR', e));
  
  // Set fake token
  await page.evaluate(() => {
    localStorage.setItem('sih_token', 'fake-token');
    localStorage.setItem('sih_user', JSON.stringify({ id: '1', role: 'ROLE_ADMIN', username: 'admin' }));
  });
  
  // Reload to dashboard
  await page.goto('http://localhost:5174/dashboard', { waitUntil: 'networkidle0' });
  
  const content = await page.content();
  console.log('BODY LENGTH:', content.length);
  
  await browser.close();
})();
