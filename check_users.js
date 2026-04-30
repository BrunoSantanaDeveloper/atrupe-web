const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://homolog.atrupe.com.br/login');
  await page.getByLabel(/e-?mail/i).fill('contig.um@gmail.com');
  await page.getByLabel(/senha/i).fill('Atrupe123@');
  await page.getByRole('button', { name: /entrar|login/i }).click();
  await page.waitForURL('**/dashboard');
  
  const res = await page.request.get('https://homolog.atrupe.com.br/api/user/employee?limit=100');
  const body = await res.json();
  const users = body.data || body;
  console.log('Total returned:', users.length);
  const active = users.filter(u => u.user && u.user.isActive);
  console.log('Active users:', active.map(u => u.user.email));
  await browser.close();
})();
