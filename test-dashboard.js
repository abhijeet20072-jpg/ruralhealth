const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle0' }).catch(e => console.log('GOTO ERROR', e));
  
  // Login
  await page.type('input[name="username"]', 'admin');
  await page.type('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(e => console.log('WAIT NAV ERROR', e));
  
  const content = await page.content();
  console.log('BODY LENGTH:', content.length);
  
  await browser.close();
})();
