const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const res = await page.request.post('https://homolog.atrupe.com.br/api/auth/login', {
    data: {
      email: 'contig.um@gmail.com',
      password: 'Atrupe123@'
    }
  });
  
  const roles = await page.request.get('https://homolog.atrupe.com.br/api/employee-role');
  const rolesData = await roles.json();
  const diretor = rolesData.data.data.find(r => r.name.includes('Diretor Financeiro E2E'));
  console.log('Role:', diretor?.name);
  if (diretor) {
    const roleId = diretor.id;
    const detail = await page.request.get('https://homolog.atrupe.com.br/api/employee-role/' + roleId);
    const detailData = await detail.json();
    console.log('Permissions:', detailData.data.permissions.filter(p => p.includes('fixed_expenses')));
  }
  await browser.close();
})();
