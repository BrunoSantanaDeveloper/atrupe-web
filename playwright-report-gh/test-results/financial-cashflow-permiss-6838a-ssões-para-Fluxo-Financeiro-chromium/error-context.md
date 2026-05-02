# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: financial/cashflow-permissions.spec.ts >> Validação de Permissões: Acesso ao Fluxo Financeiro >> Admin deve preparar o cargo e liberar permissões para Fluxo Financeiro
- Location: e2e/financial/cashflow-permissions.spec.ts:10:7

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('option', { name: 'Diretor Flow E2E' }) resolved to 4 elements:
    1) <div role="option" tabindex="-1" aria-selected="false" data-state="unchecked" aria-labelledby="radix-:r3t:" data-radix-collection-item="" class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 transition-colors duration-200 ease-in-out">…</div> aka getByRole('option', { name: 'Diretor Flow E2E' }).first()
    2) <div role="option" tabindex="-1" aria-selected="false" data-state="unchecked" aria-labelledby="radix-:r46:" data-radix-collection-item="" class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 transition-colors duration-200 ease-in-out">…</div> aka getByRole('option', { name: 'Diretor Flow E2E' }).nth(1)
    3) <div role="option" tabindex="-1" aria-selected="false" data-state="unchecked" aria-labelledby="radix-:r4j:" data-radix-collection-item="" class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 transition-colors duration-200 ease-in-out">…</div> aka getByRole('option', { name: 'Diretor Flow E2E' }).nth(2)
    4) <div role="option" tabindex="-1" aria-selected="false" data-state="unchecked" aria-labelledby="radix-:r4o:" data-radix-collection-item="" class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 transition-colors duration-200 ease-in-out">…</div> aka getByRole('option', { name: 'Diretor Flow E2E' }).nth(3)

Call log:
  - waiting for getByRole('option', { name: 'Diretor Flow E2E' })

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - img [ref=e4]
    - generic [ref=e8]:
      - generic [ref=e9]: Você está em ambiente de Desenvolvimento / Homologação
      - generic [ref=e10]: As alterações feitas aqui não serão refletidas em produção!
    - button [ref=e11] [cursor=pointer]:
      - img [ref=e12]
  - generic [ref=e16]:
    - complementary [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e20]:
          - link [ref=e21] [cursor=pointer]:
            - /url: /dashboard
            - img [ref=e22]
            - img [ref=e23]
          - button [ref=e24] [cursor=pointer]:
            - img [ref=e25]
        - generic [ref=e29]:
          - generic [ref=e30]:
            - generic [ref=e32]: P
            - generic [ref=e33]:
              - paragraph [ref=e34]: Patricia
              - paragraph [ref=e35]: Admin
          - button [ref=e36] [cursor=pointer]:
            - img [ref=e37]
        - navigation [ref=e44]:
          - generic [ref=e45]:
            - heading [level=3] [ref=e47]:
              - button [ref=e48] [cursor=pointer]:
                - generic [ref=e49]:
                  - img [ref=e50]
                  - generic [ref=e53]: Vendas
                - img [ref=e54]
            - heading [level=3] [ref=e57]:
              - button [ref=e58] [cursor=pointer]:
                - generic [ref=e59]:
                  - img [ref=e60]
                  - generic [ref=e63]: Financeiro
                - img [ref=e64]
            - heading [level=3] [ref=e67]:
              - button [ref=e68] [cursor=pointer]:
                - generic [ref=e69]:
                  - img [ref=e70]
                  - generic [ref=e75]: Nota Fiscal
                - img [ref=e76]
            - heading [level=3] [ref=e79]:
              - button [ref=e80] [cursor=pointer]:
                - generic [ref=e81]:
                  - img [ref=e82]
                  - generic [ref=e85]: Cadastros
                - img [ref=e86]
            - heading [level=3] [ref=e89]:
              - button [ref=e90] [cursor=pointer]:
                - generic [ref=e91]:
                  - img [ref=e92]
                  - generic [ref=e96]: Relatórios
                - img [ref=e97]
            - generic [ref=e99]:
              - heading [level=3] [ref=e100]:
                - button [expanded] [ref=e101] [cursor=pointer]:
                  - generic [ref=e102]:
                    - img [ref=e103]
                    - generic [ref=e106]: Configurações
                  - img [ref=e107]
              - region [ref=e109]:
                - list [ref=e111]:
                  - listitem [ref=e112]:
                    - link [ref=e113] [cursor=pointer]:
                      - /url: /configuracoes/empresa-e-sistema
                      - generic [ref=e114]:
                        - img [ref=e115]
                        - generic [ref=e117]: Empresa e sistema
                  - listitem [ref=e118]:
                    - link [ref=e119] [cursor=pointer]:
                      - /url: /configuracoes/produtos
                      - generic [ref=e120]:
                        - img [ref=e121]
                        - generic [ref=e126]: Produtos
                  - listitem [ref=e127]:
                    - link [ref=e128] [cursor=pointer]:
                      - /url: /configuracoes/financeiro
                      - generic [ref=e129]:
                        - img [ref=e130]
                        - generic [ref=e133]: Financeiro
                  - listitem [ref=e134]:
                    - link [ref=e135] [cursor=pointer]:
                      - /url: /configuracoes/nota-fiscal
                      - generic [ref=e136]:
                        - img [ref=e137]
                        - generic [ref=e139]: Nota Fiscal
                  - listitem [ref=e140]:
                    - link [ref=e141] [cursor=pointer]:
                      - /url: /configuracoes/vendas
                      - generic [ref=e142]:
                        - img [ref=e143]
                        - generic [ref=e146]: Vendas
                  - listitem [ref=e147]:
                    - link [ref=e148] [cursor=pointer]:
                      - /url: /configuracoes/importacoes
                      - generic [ref=e149]:
                        - img [ref=e150]
                        - generic [ref=e153]: Importações
            - heading [level=3] [ref=e155]:
              - button [ref=e156] [cursor=pointer]:
                - generic [ref=e157]:
                  - img [ref=e158]
                  - generic [ref=e161]: Academy
                - img [ref=e162]
    - main [ref=e164]:
      - generic [ref=e165]:
        - generic [ref=e166]:
          - generic [ref=e167]:
            - generic [ref=e169]:
              - link [ref=e170] [cursor=pointer]:
                - /url: /configuracoes/empresa-e-sistema
                - img [ref=e171]
              - heading [level=1] [ref=e174]: Colaboradores e usuários
            - generic [ref=e175]:
              - button [ref=e176] [cursor=pointer]:
                - img [ref=e177]
              - link [ref=e180] [cursor=pointer]:
                - /url: /configuracoes/empresa-e-sistema/cargos
                - img [ref=e181]
                - text: Cargos
              - button [expanded] [ref=e184] [cursor=pointer]:
                - img [ref=e185]
                - text: Novo colaborador
          - tablist [ref=e188]:
            - tab [selected] [ref=e189] [cursor=pointer]:
              - generic [ref=e190]: Ativos
              - generic [ref=e191]: "21"
            - tab [ref=e192] [cursor=pointer]:
              - generic [ref=e193]: Inativos
            - tab [ref=e194] [cursor=pointer]:
              - generic [ref=e195]: Todos
              - generic [ref=e196]: "21"
        - generic [ref=e198]:
          - generic [ref=e200]:
            - generic [ref=e201]:
              - generic [ref=e202]: Buscar
              - generic [ref=e203]:
                - img [ref=e205]
                - searchbox [ref=e208]
            - button [ref=e209] [cursor=pointer]:
              - img [ref=e210]
          - table [ref=e215]:
            - rowgroup [ref=e216]:
              - row [ref=e217]:
                - columnheader [ref=e218]: Colaborador
                - columnheader [ref=e219]: Usuário
                - columnheader [ref=e220]: Status colaborador
                - columnheader [ref=e221]: Status usuário
                - columnheader [ref=e222]
            - rowgroup [ref=e223]:
              - row [ref=e224]:
                - cell [ref=e225]: Comercial
              - row [ref=e226]:
                - cell [ref=e227]:
                  - generic [ref=e228]:
                    - generic [ref=e230]: DT
                    - generic [ref=e231]:
                      - generic [ref=e232]: Diretor E2E Test
                      - generic [ref=e233]: Diretor Financeiro E2E 1777573224432
                - cell [ref=e234]:
                  - paragraph [ref=e235]: Diretor Test
                  - paragraph [ref=e236]: diretor_e2e_1777574581835@atrupe.com
                - cell [ref=e237]:
                  - generic [ref=e238]: Ativo
                - cell [ref=e240]:
                  - generic [ref=e241]: Inativo
                - cell [ref=e243]:
                  - generic [ref=e244]:
                    - button [ref=e246] [cursor=pointer]:
                      - img [ref=e247]
                    - button [ref=e251] [cursor=pointer]:
                      - img [ref=e252]
                    - button [ref=e257] [cursor=pointer]:
                      - img [ref=e258]
              - row [ref=e261]:
                - cell [ref=e262]:
                  - generic [ref=e263]:
                    - generic [ref=e265]: DT
                    - generic [ref=e266]:
                      - generic [ref=e267]: Diretor E2E Test
                      - generic [ref=e268]: Diretor Financeiro E2E 1777572982226
                - cell [ref=e269]:
                  - paragraph [ref=e270]: Sem usuário
                - cell [ref=e271]:
                  - generic [ref=e272]: Ativo
                - cell [ref=e274]: "-"
                - cell [ref=e275]:
                  - generic [ref=e276]:
                    - button [ref=e278] [cursor=pointer]:
                      - img [ref=e279]
                    - button [ref=e283] [cursor=pointer]:
                      - img [ref=e284]
                    - button [ref=e288] [cursor=pointer]:
                      - img [ref=e289]
              - row [ref=e292]:
                - cell [ref=e293]:
                  - generic [ref=e294]:
                    - generic [ref=e296]: DT
                    - generic [ref=e297]:
                      - generic [ref=e298]: Diretor E2E Test
                      - generic [ref=e299]: Diretor Financeiro E2E 1777571759283
                - cell [ref=e300]:
                  - paragraph [ref=e301]: Diretor Test
                  - paragraph [ref=e302]: diretor_e2e_1777572882806@atrupe.com
                - cell [ref=e303]:
                  - generic [ref=e304]: Ativo
                - cell [ref=e306]:
                  - generic [ref=e307]: Inativo
                - cell [ref=e309]:
                  - generic [ref=e310]:
                    - button [ref=e312] [cursor=pointer]:
                      - img [ref=e313]
                    - button [ref=e317] [cursor=pointer]:
                      - img [ref=e318]
                    - button [ref=e323] [cursor=pointer]:
                      - img [ref=e324]
              - row [ref=e327]:
                - cell [ref=e328]:
                  - generic [ref=e329]:
                    - generic [ref=e331]: DT
                    - generic [ref=e332]:
                      - generic [ref=e333]: Diretor E2E Test
                      - generic [ref=e334]: Diretor Financeiro E2E 1777572721914
                - cell [ref=e335]:
                  - paragraph [ref=e336]: Sem usuário
                - cell [ref=e337]:
                  - generic [ref=e338]: Ativo
                - cell [ref=e340]: "-"
                - cell [ref=e341]:
                  - generic [ref=e342]:
                    - button [ref=e344] [cursor=pointer]:
                      - img [ref=e345]
                    - button [ref=e349] [cursor=pointer]:
                      - img [ref=e350]
                    - button [ref=e354] [cursor=pointer]:
                      - img [ref=e355]
              - row [ref=e358]:
                - cell [ref=e359]:
                  - generic [ref=e360]:
                    - generic [ref=e362]: DT
                    - generic [ref=e363]:
                      - generic [ref=e364]: Diretor E2E Test
                      - generic [ref=e365]: Diretor Financeiro E2E 1777570101495
                - cell [ref=e366]:
                  - paragraph [ref=e367]: Diretor Test
                  - paragraph [ref=e368]: diretor_e2e_1777571828140@atrupe.com
                - cell [ref=e369]:
                  - generic [ref=e370]: Ativo
                - cell [ref=e372]:
                  - generic [ref=e373]: Inativo
                - cell [ref=e375]:
                  - generic [ref=e376]:
                    - button [ref=e378] [cursor=pointer]:
                      - img [ref=e379]
                    - button [ref=e383] [cursor=pointer]:
                      - img [ref=e384]
                    - button [ref=e389] [cursor=pointer]:
                      - img [ref=e390]
              - row [ref=e393]:
                - cell [ref=e394]:
                  - generic [ref=e395]:
                    - generic [ref=e397]: DT
                    - generic [ref=e398]:
                      - generic [ref=e399]: Diretor E2E Test
                      - generic [ref=e400]: Diretor Financeiro E2E 1777572215830
                - cell [ref=e401]:
                  - paragraph [ref=e402]: Sem usuário
                - cell [ref=e403]:
                  - generic [ref=e404]: Ativo
                - cell [ref=e406]: "-"
                - cell [ref=e407]:
                  - generic [ref=e408]:
                    - button [ref=e410] [cursor=pointer]:
                      - img [ref=e411]
                    - button [ref=e415] [cursor=pointer]:
                      - img [ref=e416]
                    - button [ref=e420] [cursor=pointer]:
                      - img [ref=e421]
              - row [ref=e424]:
                - cell [ref=e425]:
                  - generic [ref=e426]:
                    - generic [ref=e428]: DT
                    - generic [ref=e429]:
                      - generic [ref=e430]: Diretor E2E Test
                      - generic [ref=e431]: Diretor Financeiro E2E 1777572882806
                - cell [ref=e432]:
                  - paragraph [ref=e433]: Sem usuário
                - cell [ref=e434]:
                  - generic [ref=e435]: Ativo
                - cell [ref=e437]: "-"
                - cell [ref=e438]:
                  - generic [ref=e439]:
                    - button [ref=e441] [cursor=pointer]:
                      - img [ref=e442]
                    - button [ref=e446] [cursor=pointer]:
                      - img [ref=e447]
                    - button [ref=e451] [cursor=pointer]:
                      - img [ref=e452]
              - row [ref=e455]:
                - cell [ref=e456]:
                  - generic [ref=e457]:
                    - generic [ref=e459]: DT
                    - generic [ref=e460]:
                      - generic [ref=e461]: Diretor E2E Test
                      - generic [ref=e462]: Diretor Financeiro E2E 1777574016823
                - cell [ref=e463]:
                  - paragraph [ref=e464]: Sem usuário
                - cell [ref=e465]:
                  - generic [ref=e466]: Ativo
                - cell [ref=e468]: "-"
                - cell [ref=e469]:
                  - generic [ref=e470]:
                    - button [ref=e472] [cursor=pointer]:
                      - img [ref=e473]
                    - button [ref=e477] [cursor=pointer]:
                      - img [ref=e478]
                    - button [ref=e482] [cursor=pointer]:
                      - img [ref=e483]
              - row [ref=e486]:
                - cell [ref=e487]:
                  - generic [ref=e488]:
                    - generic [ref=e490]: DT
                    - generic [ref=e491]:
                      - generic [ref=e492]: Diretor E2E Test
                      - generic [ref=e493]: Diretor Financeiro E2E 1777571828140
                - cell [ref=e494]:
                  - paragraph [ref=e495]: Diretor Test
                  - paragraph [ref=e496]: diretor_e2e_1777572982226@atrupe.com
                - cell [ref=e497]:
                  - generic [ref=e498]: Ativo
                - cell [ref=e500]:
                  - generic [ref=e501]: Inativo
                - cell [ref=e503]:
                  - generic [ref=e504]:
                    - button [ref=e506] [cursor=pointer]:
                      - img [ref=e507]
                    - button [ref=e511] [cursor=pointer]:
                      - img [ref=e512]
                    - button [ref=e517] [cursor=pointer]:
                      - img [ref=e518]
              - row [ref=e521]:
                - cell [ref=e522]:
                  - generic [ref=e523]:
                    - generic [ref=e525]: DT
                    - generic [ref=e526]:
                      - generic [ref=e527]: Diretor E2E Test
                      - generic [ref=e528]: Diretor Financeiro E2E 1777574826596
                - cell [ref=e529]:
                  - paragraph [ref=e530]: Sem usuário
                - cell [ref=e531]:
                  - generic [ref=e532]: Ativo
                - cell [ref=e534]: "-"
                - cell [ref=e535]:
                  - generic [ref=e536]:
                    - button [ref=e538] [cursor=pointer]:
                      - img [ref=e539]
                    - button [ref=e543] [cursor=pointer]:
                      - img [ref=e544]
                    - button [ref=e548] [cursor=pointer]:
                      - img [ref=e549]
          - navigation [ref=e553]:
            - list [ref=e554]:
              - listitem [ref=e555]:
                - link:
                  - /url: "#"
                  - img
                  - generic: Anterior
              - list [ref=e556]:
                - listitem [ref=e557]:
                  - link [ref=e558] [cursor=pointer]:
                    - /url: "?status=ativos&page=1"
                    - text: "1"
                - listitem [ref=e559]:
                  - link [ref=e560] [cursor=pointer]:
                    - /url: "?status=ativos&page=2"
                    - text: "2"
                - listitem [ref=e561]:
                  - link [ref=e562] [cursor=pointer]:
                    - /url: "?status=ativos&page=3"
                    - text: "3"
              - listitem [ref=e563]:
                - link [ref=e564] [cursor=pointer]:
                  - /url: "?status=ativos&page=2"
                  - generic [ref=e565]: Próximo
                  - img [ref=e566]
  - region "Notifications alt+T"
  - alert [ref=e568]
  - dialog [ref=e570]:
    - heading [level=2] [ref=e572]:
      - generic [ref=e573]:
        - img [ref=e575]
        - generic [ref=e577]: Novo colaborador
    - generic [ref=e579]:
      - generic [ref=e580]:
        - generic [ref=e581]: Nome
        - textbox [ref=e582]:
          - /placeholder: Nome
          - text: Diretor E2E Test 1777742065644
      - generic [ref=e583]:
        - generic [ref=e584]: Setor
        - combobox [ref=e585] [cursor=pointer]:
          - generic: Comercial
          - img [ref=e586]
        - combobox [ref=e588]
      - generic [ref=e589]:
        - generic [ref=e590]: Cargo
        - combobox [expanded] [ref=e591] [cursor=pointer]:
          - generic: Cargo
          - img [ref=e592]
        - combobox [ref=e594]
    - generic [ref=e595]:
      - generic [ref=e597]:
        - checkbox [checked] [ref=e598] [cursor=pointer]:
          - generic:
            - img
        - generic [ref=e599]: Inserir outro depois deste
      - generic [ref=e600]:
        - button [expanded] [ref=e601] [cursor=pointer]: Cancelar
        - button [ref=e602] [cursor=pointer]:
          - text: Salvar
          - img [ref=e603]
    - button [ref=e606] [cursor=pointer]:
      - img [ref=e607]
      - generic [ref=e610]: Fechar
  - listbox [ref=e612]:
    - group [ref=e613]:
      - option "Gerente Comercial" [active] [ref=e614]:
        - generic [ref=e616]: Gerente Comercial
      - option "Diretor Flow E2E" [ref=e617]:
        - generic [ref=e619]: Diretor Flow E2E
      - option "Diretor Financeiro E2E 1777569927554" [ref=e620]:
        - generic [ref=e622]: Diretor Financeiro E2E 1777569927554
      - option "Diretor Financeiro E2E 1777570101495" [ref=e623]:
        - generic [ref=e625]: Diretor Financeiro E2E 1777570101495
      - option "Diretor Financeiro E2E 1777575063465" [ref=e626]:
        - generic [ref=e628]: Diretor Financeiro E2E 1777575063465
      - option "Diretor Financeiro E2E 1777573224432" [ref=e629]:
        - generic [ref=e631]: Diretor Financeiro E2E 1777573224432
      - option "Diretor Financeiro E2E 1777570528069" [ref=e632]:
        - generic [ref=e634]: Diretor Financeiro E2E 1777570528069
      - option "Diretor Financeiro E2E 1777575703349" [ref=e635]:
        - generic [ref=e637]: Diretor Financeiro E2E 1777575703349
      - option "Diretor Financeiro E2E 1777739901299" [ref=e638]:
        - generic [ref=e640]: Diretor Financeiro E2E 1777739901299
      - option "Diretor Financeiro E2E 1777574581835" [ref=e641]:
        - generic [ref=e643]: Diretor Financeiro E2E 1777574581835
      - option "Diretor Flow E2E" [ref=e644]:
        - generic [ref=e646]: Diretor Flow E2E
      - option "Diretor Financeiro E2E 1777570830240" [ref=e647]:
        - generic [ref=e649]: Diretor Financeiro E2E 1777570830240
      - option "Diretor Financeiro E2E 1777571759283" [ref=e650]:
        - generic [ref=e652]: Diretor Financeiro E2E 1777571759283
      - option "Diretor Financeiro E2E 1777572982226" [ref=e653]:
        - generic [ref=e655]: Diretor Financeiro E2E 1777572982226
      - option "Diretor Financeiro E2E 1777574826596" [ref=e656]:
        - generic [ref=e658]: Diretor Financeiro E2E 1777574826596
      - option "Diretor Financeiro E2E 1777576151150" [ref=e659]:
        - generic [ref=e661]: Diretor Financeiro E2E 1777576151150
      - option "Diretor Financeiro E2E 1777572215830" [ref=e662]:
        - generic [ref=e664]: Diretor Financeiro E2E 1777572215830
      - option "Diretor Financeiro E2E 1777571828140" [ref=e665]:
        - generic [ref=e667]: Diretor Financeiro E2E 1777571828140
      - option "Diretor Financeiro E2E 1777570606636" [ref=e668]:
        - generic [ref=e670]: Diretor Financeiro E2E 1777570606636
      - option "Teste E2E Inspect" [ref=e671]:
        - generic [ref=e673]: Teste E2E Inspect
      - option "Vendedor" [ref=e674]:
        - generic [ref=e676]: Vendedor
      - option "Diretor Financeiro E2E 1777572721914" [ref=e677]:
        - generic [ref=e679]: Diretor Financeiro E2E 1777572721914
      - option "Diretor Financeiro E2E 1777572882806" [ref=e680]:
        - generic [ref=e682]: Diretor Financeiro E2E 1777572882806
      - option "Diretor Flow E2E" [ref=e683]:
        - generic [ref=e685]: Diretor Flow E2E
      - option "Diretor Financeiro Teste" [ref=e686]:
        - generic [ref=e688]: Diretor Financeiro Teste
      - option "Diretor Financeiro E2E 1777575560848" [ref=e689]:
        - generic [ref=e691]: Diretor Financeiro E2E 1777575560848
      - option "Diretor Financeiro E2E 1777575899210" [ref=e692]:
        - generic [ref=e694]: Diretor Financeiro E2E 1777575899210
      - option "Diretor Financeiro E2E 1777574016823" [ref=e695]:
        - generic [ref=e697]: Diretor Financeiro E2E 1777574016823
      - option "Diretor Flow E2E" [ref=e698]:
        - generic [ref=e700]: Diretor Flow E2E
      - option "Diretor Financeiro E2E 1777571327980" [ref=e701]:
        - generic [ref=e703]: Diretor Financeiro E2E 1777571327980
      - option "Teste E2E Inspect" [ref=e704]:
        - generic [ref=e706]: Teste E2E Inspect
    - img [ref=e708]
```

# Test source

```ts
  17  |     await page.waitForTimeout(1500);
  18  |   }
  19  | 
  20  |   const oldRows = page.getByRole('row', { name: /Diretor E2E/i });
  21  |   const count = await oldRows.count();
  22  | 
  23  |   for (let i = 0; i < count; i++) {
  24  |     await oldRows.nth(i).getByRole('button').nth(1).click({ force: true });
  25  |     await page.waitForTimeout(500);
  26  | 
  27  |     const inativarBtn = page.getByRole('button', { name: /^Inativar$/i }).first();
  28  |     if (await inativarBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  29  |       await inativarBtn.click();
  30  |       await page.getByRole('alertdialog').getByRole('button', { name: /^Inativar$/i }).click();
  31  |       await page.waitForTimeout(1000);
  32  |     } else {
  33  |       await page.keyboard.press('Escape');
  34  |       await page.waitForTimeout(500);
  35  |     }
  36  |   }
  37  | 
  38  |   // 2. Libera cota inativando o 'Maycon João'
  39  |   await searchInput.fill('Maycon João');
  40  |   await page.getByLabel('Botão de busca').click();
  41  |   await page.waitForTimeout(1500);
  42  | 
  43  |   const mayconRow = page.getByRole('row', { name: /Maycon João/i }).first();
  44  |   if (await mayconRow.isVisible({ timeout: 2000 }).catch(() => false)) {
  45  |     await mayconRow.getByRole('button').nth(1).click({ force: true });
  46  |     await page.waitForTimeout(500);
  47  |     const inativarBtn = page.getByRole('button', { name: /^Inativar$/i }).first();
  48  |     if (await inativarBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  49  |       await inativarBtn.click();
  50  |       await page.getByRole('alertdialog').getByRole('button', { name: /^Inativar$/i }).click();
  51  |       await page.waitForTimeout(1000);
  52  |     } else {
  53  |       await page.keyboard.press('Escape');
  54  |       await page.waitForTimeout(500);
  55  |     }
  56  |   }
  57  | }
  58  | 
  59  | /**
  60  |  * Cria um cargo, atribui todas as permissões visíveis e cria um usuário E2E.
  61  |  * Retorna os dados para login do usuário criado.
  62  |  */
  63  | export async function setupE2EUserWithFullPermissions(page: Page, roleName: string, userEmail: string, userPassword = 'Password123!') {
  64  |   // ── 1. Criar o Cargo
  65  |   await page.goto('/configuracoes/empresa-e-sistema/cargos');
  66  |   await page.waitForLoadState('domcontentloaded');
  67  |   await page.waitForTimeout(1500);
  68  | 
  69  |   await page.getByRole('button', { name: 'Novo cargo' }).click();
  70  |   await page.getByRole('combobox', { name: 'Setor' }).click();
  71  |   await page.getByRole('option', { name: 'Comercial' }).click();
  72  |   await page.getByPlaceholder('Cargo').fill(roleName);
  73  | 
  74  |   const insertOutro = page.getByRole('checkbox', { name: /inserir outro/i });
  75  |   if (await insertOutro.isChecked()) await insertOutro.uncheck();
  76  | 
  77  |   await page.getByRole('button', { name: 'Salvar' }).click();
  78  |   await expect(page.getByText(/salvo|sucesso|criado/i).first()).toBeVisible({ timeout: 10000 });
  79  | 
  80  |   // ── 1.5. Atribuir Permissões
  81  |   await page.getByPlaceholder('Buscar por...').fill(roleName);
  82  |   await page.getByLabel('Botão de busca').click();
  83  |   await page.waitForTimeout(1500);
  84  | 
  85  |   const cargoRow = page.locator('div').filter({ hasText: roleName }).filter({ has: page.getByRole('button') }).last();
  86  |   await expect(cargoRow).toBeVisible({ timeout: 10000 });
  87  |   await cargoRow.getByRole('button').nth(1).click({ force: true });
  88  | 
  89  |   const dialog = page.getByRole('dialog');
  90  |   await expect(dialog).toBeVisible({ timeout: 10000 });
  91  |   await page.waitForTimeout(2000);
  92  | 
  93  |   await dialog.locator('button[role="checkbox"]').evaluateAll((checkboxes) => {
  94  |     checkboxes.forEach((cb) => {
  95  |       if (!cb.hasAttribute('disabled') && cb.getAttribute('aria-checked') !== 'true') {
  96  |         (cb as HTMLElement).click();
  97  |       }
  98  |     });
  99  |   });
  100 | 
  101 |   await dialog.getByRole('button', { name: 'Salvar' }).click();
  102 |   await expect(page.getByText(/salvas?|sucesso|permiss/i).first()).toBeVisible({ timeout: 10000 });
  103 | 
  104 |   // ── 2. Criar Colaborador
  105 |   await page.goto('/configuracoes/empresa-e-sistema/colaboradores-e-usuarios');
  106 |   await page.waitForLoadState('domcontentloaded');
  107 |   await page.waitForTimeout(1500);
  108 | 
  109 |   await page.getByRole('button', { name: 'Novo colaborador' }).click();
  110 |   await page.getByLabel('Nome').fill(`Diretor E2E Test ${Date.now()}`);
  111 | 
  112 |   await page.getByRole('combobox', { name: 'Setor' }).click();
  113 |   await page.getByRole('option', { name: 'Comercial' }).click();
  114 | 
  115 |   await page.waitForTimeout(800);
  116 |   await page.getByRole('combobox', { name: 'Cargo' }).click();
> 117 |   await page.getByRole('option', { name: roleName }).click();
      |                                                      ^ Error: locator.click: Error: strict mode violation: getByRole('option', { name: 'Diretor Flow E2E' }) resolved to 4 elements:
  118 | 
  119 |   const insertOutroEmp = page.getByRole('checkbox', { name: /inserir outro/i });
  120 |   if (await insertOutroEmp.isChecked()) await insertOutroEmp.uncheck();
  121 | 
  122 |   await page.getByRole('button', { name: 'Salvar' }).click();
  123 |   await expect(page.getByText(/salvo|sucesso|criado|colaborador/i).first()).toBeVisible({ timeout: 10000 });
  124 | 
  125 |   // ── 3. Criar Usuário Vinculado
  126 |   const empSearch = page.getByPlaceholder('Buscar por...');
  127 |   if (await empSearch.isVisible({ timeout: 3000 }).catch(() => false)) {
  128 |     await empSearch.fill('Diretor E2E Test');
  129 |     await page.getByLabel('Botão de busca').click();
  130 |     await page.waitForTimeout(1500);
  131 |   }
  132 | 
  133 |   const employeeRow = page.getByRole('row', { name: /Diretor E2E Test/i }).first();
  134 |   await expect(employeeRow).toBeVisible({ timeout: 10000 });
  135 |   await employeeRow.getByRole('button').nth(1).click({ force: true });
  136 | 
  137 |   const userDialog = page.getByRole('dialog');
  138 |   await expect(userDialog).toBeVisible({ timeout: 10000 });
  139 |   await userDialog.getByLabel('Email').fill(userEmail);
  140 |   await userDialog.locator('input[name="password"]').fill(userPassword);
  141 |   await userDialog.locator('input[name="confirmPassword"]').fill(userPassword);
  142 | 
  143 |   await userDialog.getByRole('button', { name: 'Salvar' }).click();
  144 |   await expect(page.getByText(/usuário criado|sucesso|salvo/i).first()).toBeVisible({ timeout: 10000 });
  145 | 
  146 |   return { email: userEmail, password: userPassword, roleName };
  147 | }
  148 | 
```