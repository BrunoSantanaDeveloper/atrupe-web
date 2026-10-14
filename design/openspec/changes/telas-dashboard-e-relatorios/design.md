# Design — telas de painel e relatórios

Arquitetura compartilhada: `../../design/sistema-visual.md`.

## Context

Resumo do relatório de módulo (arquivos sob `src/app/(app-sidebar)/`):

- Painel: `dashboard/components/Dashboard.tsx:95-133` (sem título; 10 KPIs
  iguais; grade com órfão `:128-132`; "Acesso restrito" próprio `:103-113`),
  `SalesOverview.tsx:36-135` × `Quotations.tsx:32-91` (mesma API, "Não
  aprovados" ≠ "Não aprovadas", `text-xs` × `text-sm`, `FeaturedIcon` só num
  card), `FinancialOverview.tsx:116-143`, `DashboardPeriodFilter.tsx:26-38`
  (`Button none` + `Badge`), `SalesEvolution/Chart.tsx:44-54` e
  `TopClients/Chart.tsx:51-61` (bons, mas sem `isError`),
  `FiscalOnboardingBanner.tsx:44-47`; mortos: `QuickAccess`, `Revenues`,
  `Expenses`, `PeriodFilter`, `FiscalSetupModal` (703 linhas).
- Relatórios: títulos (`SalesReport.tsx:51`, `FinancialReport.tsx:43`,
  `DfcReport.tsx:43`…), ações (`*PrintButton.tsx:124-130` ícone sem nome
  com PDF/Excel), `space-y-5` × `-4`; vendas (`ApprovedRejectedChart.tsx:29-87`
  hex + legenda divergente + ignora período; `RankingBarChart.tsx:67-70`
  comentário de contraste; `QuotationsOriginChart`/`OrdersOriginChart`
  sem vazio; `SalesEvolutionChart.tsx:31-36,232`; `FiltersBar.tsx:71-213`
  período duplo, cliente fora da URL, ícone sem nome, Dialog no celular;
  `SalesTable.tsx:99-367` filtro local, "%"/"100%", `toFixed`, verde à
  esquerda, sem vazio; `SummaryCards.tsx:72-136` seis iguais, `null` em
  erro); financeiro (`FinancialReport.tsx:49-54` Tabs; `FinancialChart.tsx:39-51,278-297`;
  `FinancialTable.tsx:105-113,206`; `SummaryCards.tsx:59-78` gênero); DFC
  (`SummaryCards.tsx:90`, `DfcTable.tsx:141-192` negativos por nome,
  botão cru; `ChartsSection.tsx:41-172`); comissões (`CommissionTable.tsx:163-299`,
  `ModeSelector.tsx:41-80` bom); projeção (`SummaryCards.tsx:43-58`); setor
  (`SectorCardsGrid.tsx:36-140`).
- Bom: gráficos do painel com `var(--chart-brand)`, esqueleto e vazio;
  toggle de valores; tabelas de DFC/financeiro/comissões alinham números;
  DFC com coluna fixa; `ModeSelector` com `radiogroup`; filtros móveis em
  diálogo.

## Goals / Non-Goals

**Goals:**
- O painel diz em 3 segundos como vai o negócio (dois números grandes com
  variação) e cada relatório tem o mesmo esqueleto (título, período,
  exportar, KPIs, gráfico, tabela).
- Gráficos legíveis e consistentes nos dois temas.

**Non-Goals:**
- Novas métricas, novos relatórios, regras de cálculo.
- Layout do PDF exportado.

## Decisions

### 1. Esqueleto do relatório

`common/ReportPage.tsx`: `PageHeader` (título, `DateRangePicker` com
presets, "Exportar ▾" secundária com PDF/Excel via `ExportDataButton`,
"Relatório avançado" terciária quando existir), `KpiRow` (um `KpiCard` herói
+ até 4 normais), seção de gráficos, seção de tabela. Filtros na URL
(`useReportFilters`), inclusive cliente; filtros móveis em `Sheet`.

### 2. Um filtro por tela

A tabela obedece ao período da página; onde hoje há "Filtrar período por"
na tabela (`SalesTable.tsx:210-218`), vira a base de data da página
(`SegmentedControl` "Por aprovação | Por emissão") que afeta KPIs, gráficos
e tabela. Gráficos que não obedecem ao período (`ApprovedRejectedChart`)
ou passam a obedecer ou dizem "Últimos 6 meses" no título — decisão com
regras; default: obedecer.

### 3. Gráficos

`ui/chart.tsx` com `ChartConfig` por token (`cores-e-contraste` 6.x);
`ChartLegend` da config; `ChartEmpty`/`ChartError` embutidos no
`ChartContainer`; donuts com valor e percentual na legenda; eixos e grade
por token. `#6CE9A6` e demais hex saem.

### 4. Painel

`PageHeader` "Painel" + `SegmentedControl` de período (Hoje, 7 dias, Mês,
Personalizado → `DateRangePicker`); `KpiRow` com dois heróis (`display-sm`,
delta com seta e cor pareada) e quatro normais; "Vendas" (um card: aprovados,
rejeitados, em digitação, ticket médio, com a definição única de "Não
aprovados" exibida como tooltip); "Financeiro"; gráficos em grade 2/1;
rankings em 3/1; `Banner` fiscal; `QueryState` em cada card.

### 5. Tabelas de relatório

`Table numeric` com cabeçalhos fixos durante o carregamento (sem "%" →
"100%"), `EmptyState kind="no-results"`, `Pagination` em `CardFooter`,
`Money` neutro (negativo com sinal), `formatPercent`. DFC: `TableRow
expandable` com `aria-expanded` e alvo de 32 px; negativos pelo sinal do
valor; `Money`.

## Risks / Trade-offs

- [Fundir os cards do painel muda a disposição a que o usuário se acostumou]
  → nota de versão; a informação continua toda lá, uma vez.
- [Heróis do painel exigem decisão de produto] → default faturamento e
  resultado; fácil trocar (prop).
- [Gráficos obedecerem ao período pode exigir mudança de API] → achado
  registrado; fallback: título com o período real.

## Migration Plan

PRs: (1) painel; (2) `ReportPage` + relatório de vendas; (3) financeiro +
DFC; (4) comissões + projeção + setor; (5) limpeza de código morto.

## Achados fora de escopo

- "Não aprovados"; KPIs herói; período de "Aprovados × rejeitados"; "Ticket
  médio"; classificação de negativos no DFC.

## Open Questions

- Heróis do painel (decisão 4): confirmar; não muda a spec.
