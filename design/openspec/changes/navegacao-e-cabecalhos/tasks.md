## 1. Navegação

- [ ] 1.1 `lib/navigation.ts`: `useNavigation()` (filtro por permissão,
      módulo, limites de plano — mover de `SidebarComponent.tsx:96-195`,
      incluindo `requireAllPermissions`), `isActive(item, pathname)` por
      segmento, `activeParent`; testes unitários com os casos de
      `MobileSidebar.tsx:95-166` que divergiam (`role === 'Admin'` vs
      `isAdmin`)
- [ ] 1.2 `consts/nav.ts`: seções com rótulo (`section: 'Operação' | …`),
      Cargos como item, Materiais/Processos/Produtos com `path` em
      `/cadastros/*`, Produção (configurações) com ícone próprio, sem
      `iconColor`, remover os ~95 linhas comentadas
- [ ] 1.3 `layout/SidebarComponent.tsx`: usar `useNavigation`; medidas de
      `espacamento-e-layout` 6.5; seção `eyebrow`; `aria-current="page"`;
      grupo "contém ativo"; chevron neutro (`accordion.tsx:37` sem
      `text-brand`/`font-bold`); recolhida com Tooltip e flyout (`Popover`
      lateral) para grupos; botão de recolher 36 px com `aria-label` e
      `aria-expanded`, fora da área do logo; conta do usuário no rodapé
      (nome, empresa, plano, menu); remover a legenda de revisão
      (`:581-598`)
- [ ] 1.4 `layout/UserDropdown.tsx`: vira o menu da conta (perfil, tema,
      sair) com `Link`s; `aria-label` no gatilho; ícones Tabler
- [ ] 1.5 `layout/MobileSidebar.tsx` → `Sheet side="left"` com a mesma lista
      (`useNavigation`), perfil e sair como itens; `layout/MobileHeader.tsx`
      com título da página (contexto do `PageHeader`), voltar e botão de
      menu com `aria-expanded`
- [ ] 1.6 `common/HelpButton.tsx`: `aria-label`, `align="end"`, item "Vídeo"
      só quando há vídeo, número de suporte em configuração

## 2. Cabeçalho de página

- [ ] 2.1 `common/PageHeader.tsx`: `breadcrumb`, `title`, `subtitle`,
      `status`, `meta`, `primary`, `secondary[]`, `more[]`, `tabs[]`
      (links com `aria-current`, `count` oculto no zero), `tone="default|admin"`,
      `HelpButton` sempre; contexto `PageHeaderContext` para o cabeçalho
      móvel; breadcrumb gerado de `consts/nav.ts` quando não informado
- [ ] 2.2 `common/ObjectHeader.tsx`: `PageHeader` + `object-title`,
      `StatusBadge`, `meta` 3–5 (`kpi-label`/valor compacto), ações
- [ ] 2.3 Codemod `topbar-to-pageheader`: `Topbar` → `PageHeader`
      (`previousPage` → breadcrumb; `primaryCta`/`secondaryCta` → `primary`/
      `secondary`; `badge` → `status`; `supportText` → `subtitle`; `tabs` +
      `paramName` → `tabs` com `?status`; `label`/`classNames` → `tone`
      nas 9 páginas admin; `review` removido); apagar `Topbar.tsx` ao fim
- [ ] 2.4 Páginas sem `Topbar` (33) → `PageHeader`: `dashboard/components/Dashboard.tsx:95-101`
      ("Painel" + período), `nota-fiscal/emitir/[orderId]/components/InvoiceFormHeader.tsx:93-120`,
      `nota-fiscal/emitir-nfse/[orderId]/components/IssueNfseForm.tsx:751-814`,
      `nota-fiscal/emitir/avulsa/**`, `nota-fiscal/emitir/consolidado/page.tsx`
      (sem `window.history.back()`), `configuracoes/nota-fiscal/**`
      (`EmissoresListClient.tsx:368`, `CfopListClient.tsx:188`),
      `admin/**`, `academy/**`, `(blank-layout-pages)/assinatura/**`
      (`h1` próprio), `relatorios/**` (títulos uniformes: "Relatório de
      vendas", "Relatório financeiro", "Demonstrativo de fluxo de caixa
      (DFC)", "Comissões", "Projeção de caixa", "Resultado por setor")
- [ ] 2.5 Lint: `<h1` fora de `PageHeader`/`ObjectHeader`/`typography.tsx`
      proibido em `src/app/**`

## 3. Cabeçalho de objeto nas páginas de detalhe

- [ ] 3.1 `vendas/orcamentos/[quotationId]/components/Quotation.tsx:203-238`
      + `QuotationActions`: `ObjectHeader` (número, cliente, status, total,
      validade, vendedor, itens); accordions abertos por padrão; o estado
      "aprovado para não admin" (`:124-153`) ganha cabeçalho e voltar
- [ ] 3.2 `vendas/ordens-de-servico/[orderId]/components/Order.tsx:132-156`
      + `OrderActions`: total, recebido, entrega, NF
- [ ] 3.3 `cadastros/clientes/[id]/layout.tsx:94-114` e
      `cadastros/fornecedores/[id]/layout.tsx:95-101`: `ObjectHeader`
      (em aberto, último pedido/compra, limite, responsável); abas por
      `useSelectedLayoutSegment` apontando para `dados` (corrige `/cadastro`
      e a aba ativa); "Editar" primária
- [ ] 3.4 `producao/projetos/[id]/components/ProjectDetail.tsx:186-206`:
      status, progresso n/m, entrega no cabeçalho; `producao/projetos/[id]/ficha`
      com breadcrumb; nomes "Projeto" em todo lugar (não "Venda"/"Ordem")
- [ ] 3.5 `financeiro/folha-de-pagamento/[payrollId]/components/PayrollDetail.tsx:93-94`:
      colaborador como título, período como subtítulo, total no `meta`
- [ ] 3.6 `configuracoes/empresa-e-sistema/patrimonios/[id]/components/AssetDetail.tsx:164-190`:
      valor, depreciação, setor; "Editar" primária
- [ ] 3.7 Nota fiscal em edição (`InvoiceFormHeader`, `IssueNfseForm`,
      `StandaloneNfeForm`): número/série, ambiente (sempre visível, não só
      ≥ `xl`), total (fixo, não colapsável), "Emitir" primária em rodapé
      fixo (`SaveBar`)
- [ ] 3.8 `vendas/orcamentos/[quotationId]/composicao` e `/resultado`:
      breadcrumb até o orçamento; títulos "Composição"/"Resultado" com
      subtítulo "Orçamento #X"; voltar para o orçamento
      (`QuotationComposition.tsx:274-276`, `QuotationResult.tsx:87`)

## 4. Rótulos, rotas e abas

- [ ] 4.1 Renomeações da tabela do `design.md` §6 em `consts/nav.ts`, hubs
      (`CompanySettingsClient`, `FinanceSettingsClient`, `SalesSettingsClient`,
      `FiscalSettingsClient`), `metadata.title` e `PageHeader`; `next.config.mjs`
      com `redirects()` permanentes para `configuracoes-de-pagamento/condicoes-de-pagamento`
      → `condicoes-de-pagamento`, `configuracoes/produtos/{materiais,processos}`
      → `cadastros/*`, `configuracoes/produtos` (catálogo) → `cadastros/produtos`
- [ ] 4.2 Mover pastas: `configuracoes/produtos/materiais` → `cadastros/materiais`;
      `configuracoes/produtos/processos` → `cadastros/processos`; catálogo de
      produtos → `cadastros/produtos`; `configuracoes/produtos` vira hub de
      configurações de produto (padrões, grupos, biblioteca, importação)
- [ ] 4.3 `setores/components/Main.tsx:97` ("Setores"), `series-de-venda/Main.tsx:76`
      ("Séries de venda"), `FiscalSettingsClient.tsx:17,20`,
      `BankAccounts.tsx:268`, `Projects.tsx:72` vs `page.tsx:10`
      ("Projetos"), `SummaryCards` "Ticket médio" (um nome)
- [ ] 4.4 Abas de status: aba padrão = primeira (`cadastros/clientes/page.tsx:15`
      + `Clients.tsx:172` "Todos" primeiro ou "Ativos" primeiro e padrão;
      `ordens-de-servico/page.tsx:15` vs `Orders.tsx:207-211`;
      `Quotations.tsx:244` rótulo "Concluídos" para DONE); `count` oculto no
      zero (`Depreciation.tsx:81-94`)
- [ ] 4.5 Hubs com o mesmo gesto: linhas que abriam diálogo
      (`CompanyInfo`, `MeasureDefaults`, `CreditLimit`) passam a abrir página
      (`telas-configuracoes` cria as páginas; aqui a navegação aponta para
      elas)

## 5. Estados de página e marcação de revisão

- [ ] 5.1 `common/PermissionGate.tsx`: fallback padrão = `PageHeader` da rota
      + `EmptyState kind="forbidden"`; `mode="actions"` para esconder só
      ações (filtros visíveis: `FinancialFlowFilter.tsx:102`); remover os
      fallbacks ad hoc (lista em `componentes-adequados` 4.5)
- [ ] 5.2 `(app-sidebar)/not-found.tsx` e `error.tsx` (e por módulo onde
      há `notFound()`), com `PageHeader` e ações; substituir textos soltos
      (`QuotationComposition.tsx:263`, `QuotationResult.tsx:58`)
- [ ] 5.3 Remover `consts/revisao.ts`, `common/ReviewTodo.tsx`,
      `review` de `Topbar`/`PageHeader`, `ReviewTodo` em `DeliverySchedule.tsx:113-118`
      e `Materials.tsx:366-369`, `review:'todo'` em `CompanySettingsList.tsx:84`
      e `FinanceSettingsClient.tsx:38`, `review="new"` em `Assets.tsx:105`,
      `AssetGroups.tsx:110`, `AssetDetail.tsx:164`, `QuotationComposition.tsx:274`,
      `QuotationResult.tsx:87` e demais (`grep -rn "review=" src/app`);
      `/sandbox/revisao` como novo lar se o time quiser manter

## 6. Fechamento

- [ ] 6.1 `e2e/ui/navegacao.spec.ts`: item ativo e pai marcados em 10 rotas;
      breadcrumb e voltar em 5 detalhes; abas de cliente/fornecedor; menu
      móvel (Esc, foco); redirects das URLs antigas
- [ ] 6.2 Capturas: toda rota com `h1` do `PageHeader`; nenhuma com título
      azul/vermelho
- [ ] 6.3 `design.md` da raiz §3.12 e §4.1 com `PageHeader`/`ObjectHeader`
      e a navegação nova
