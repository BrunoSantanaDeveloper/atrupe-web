## 1. Painel

- [ ] 1.1 `dashboard/components/Dashboard.tsx`: `PageHeader` "Painel" com
      `SegmentedControl` de período (Hoje, 7 dias, Mês, Personalizado →
      `DateRangePicker`) substituindo `DashboardPeriodFilter.tsx`; grades
      4/2/1 (KPIs), 2/1 (gráficos), 3/1 (rankings) sem órfão nem
      `flex-[1_1_540px]`; `EmptyState kind="forbidden"` padrão
- [ ] 1.2 `KpiRow`: dois heróis (`display-sm`, delta com seta e cor
      pareada vs período anterior — faturamento e resultado por padrão) +
      normais em `KpiCard` (`kpi-label` 14 px uniforme, ícone neutro,
      `aria-hidden`)
- [ ] 1.3 Fundir `Quotations.tsx` em `SalesOverview.tsx` (uma chamada,
      uma `queryKey`); definição única de "Não aprovados" com Tooltip;
      `FinancialOverview.tsx` no mesmo `KpiCard`
- [ ] 1.4 `QueryState` com `isError` em todos os cards e gráficos
      (`SalesEvolution`, `TopClients`, `SalesBySeller`, overviews)
- [ ] 1.5 `FiscalOnboardingBanner.tsx` → `Banner` do kit com botão de ação
- [ ] 1.6 Remover `QuickAccess.tsx`, `Revenues.tsx`, `Expenses.tsx`,
      `PeriodFilter.tsx`, `FiscalSetupModal.tsx`

## 2. Esqueleto de relatório

- [ ] 2.1 `common/ReportPage.tsx` (`PageHeader` + `DateRangePicker` com
      presets + "Exportar ▾" via `ExportDataButton` com rótulo + "Relatório
      avançado" opcional + `KpiRow` + seções) e `lib/useReportFilters.ts`
      (URL); filtros móveis em `Sheet`
- [ ] 2.2 Aplicar em `relatorios/vendas`, `financeiro`, `dfc`, `comissoes`,
      `projecao-de-caixa`, `resultado-por-setor`; títulos: "Relatório de
      vendas", "Relatório financeiro", "Demonstrativo de fluxo de caixa
      (DFC)", "Comissões", "Projeção de caixa", "Resultado por setor";
      `space-y-6` único; remover `relatorios/*/components/print/*PrintButton.tsx`
      (ex.: `SalesReportPrintButton.tsx:124-130`, impressora sem nome que abre
      PDF/Excel) em favor do "Exportar ▾" do `ReportPage`
- [ ] 2.3 `relatorios/layout.tsx:14`: `EmptyState kind="forbidden"`

## 3. Relatório de vendas

- [ ] 3.1 `FiltersBar.tsx`: um `DateRangePicker` com presets (sem select de
      período); cliente na URL; `Combobox` de cliente; ícone de filtro com
      nome; filtros móveis em `Sheet`
- [ ] 3.2 `SalesTable.tsx`: período da página + base de data como
      `SegmentedControl` no cabeçalho da página (afeta cards, gráficos e
      tabela); cabeçalhos estáveis; `formatPercent`; `Money numeric`;
      `EmptyState`; `Pagination` em `CardFooter`; `text-primary-700` →
      token; "(Total do cliente)"
- [ ] 3.3 `SummaryCards.tsx`: `KpiRow` com herói (faturamento) e normais;
      "Ticket médio" único; erro como estado (não `null`)
- [ ] 3.4 Gráficos (`ApprovedRejectedChart`, `RankingBarChart`,
      `QuotationsOriginChart`, `OrdersOriginChart`, `SalesEvolutionChart`):
      `ChartConfig` por token, legenda da config (valor e % nas roscas),
      `ChartEmpty`/`ChartError`; `ApprovedRejected` obedece ao período (ou
      título "Últimos 6 meses" até a API permitir); remover hex e `'#888'`

## 4. Financeiro, DFC, comissões, projeção, setor

- [ ] 4.1 `FinancialReport.tsx`: abas Receitas/Despesas como `Tabs` de link
      no `PageHeader`; `FinancialChart.tsx` por token com legenda da config;
      `FinancialTable.tsx`: `Money` neutro (status pelo badge; pago ≠
      pendente), `EmptyState`; `SummaryCards.tsx` com concordância
      ("Recebidas/Pagas/Confirmadas/Vencidas")
- [ ] 4.2 DFC: `SummaryCards.tsx:90`, `DfcTable.tsx` com `Money` (negativo
      pelo valor), `TableRow expandable` com botão nomeado e
      `aria-expanded`, `sticky="first-column"` mantido; `ChartsSection.tsx`
      por token (grade/eixo `chart-grid`/`chart-axis`)
- [ ] 4.3 Comissões: `CommissionTable.tsx` filtros na URL, selects com a
      mesma largura, `Pagination` em `CardFooter`, `EmptyState`;
      `ModeSelector.tsx` como `RadioCard`/`SegmentedControl` do kit
      (mantendo a semântica boa)
- [ ] 4.4 Projeção de caixa: `SummaryCards.tsx` em `KpiCard`, caixa de
      frase, negativo sinalizado; `CashFlowReport.tsx` com `ReportPage`
- [ ] 4.5 Resultado por setor: `SectorCardsGrid.tsx` com `KpiCard`
      (`FeaturedIcon`/ícone neutro, `Money` com sinal, total em herói),
      `EmptyState` em vez de `null`

## 5. Fechamento

- [ ] 5.1 Capturas antes/depois do painel e dos seis relatórios, nos dois
      temas; contraste das séries ≥ 3:1 verificado na vitrine
- [ ] 5.2 `e2e/journey/*` e novos `e2e/reports/*.spec.ts`: filtro na URL,
      exportar com menu, período único afetando tabela, estado de erro no
      painel
