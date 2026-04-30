const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const res = await page.request.post('https://homolog.atrupe.com.br/api/auth/login', {
    data: {
      email: 'diretor_e2e_1777574581835@atrupe.com',
      password: 'Password123!'
    }
  });
  console.log('Status:', res.status());
  const body = await res.json().catch(() => null);
  console.log('Body:', body);
  await browser.close();
})();
