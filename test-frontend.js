const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' }).catch(e => console.log('GOTO ERROR', e));
  
  const content = await page.content();
  console.log('BODY:', content.substring(0, 500));
  
  await browser.close();
})();
