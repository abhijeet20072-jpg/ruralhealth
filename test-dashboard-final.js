const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  // We should be redirected to /login because no token
  await page.waitForSelector('input[name="username"]');
  
  // We can't log in without backend, but let's fake a token in localStorage
  await page.evaluate(() => {
    localStorage.setItem('token', 'fake-token'); // use 'token' because api.ts uses it
  });
  
  // Reload
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
  
  const content = await page.content();
  
  if (content.includes('Role-Based Access Test')) {
    console.log('FAIL: Old dashboard string found!');
  } else {
    console.log('SUCCESS: Old dashboard string NOT found.');
  }
  
  if (content.includes('Welcome to SIH Healthcare')) {
    console.log('SUCCESS: New dashboard string found.');
  } else {
    console.log('FAIL: New dashboard string NOT found!');
  }
  
  await browser.close();
})();
