## 1. Instrumento de verificação (antes)

- [ ] 1.1 Criar `e2e/ui/capturas.spec.ts`: percorre as rotas estáticas de
      `src/app/(app-sidebar)` com a sessão do `global-setup`, grava
      `test-results/ui/<rota>.png` (1440×900) e `audit.json` com, por rota:
      tamanhos de fonte visíveis e contagem, cabeçalhos `h1`–`h6` com
      tamanho/peso/texto, botões repetidos (mesmo texto ≥ 3), botões sem nome
      acessível, `title=` nativo visível, altura das linhas de `tbody tr`,
      tamanhos de SVG
- [ ] 1.2 Rodar e guardar o `audit.json` de referência em
      `design/evidencia/tipografia-antes.json` (anexar no PR, não versionar PNG)
- [ ] 1.3 Script `scripts/ui-audit-diff.mjs` que compara dois `audit.json` e
      lista, por rota, os tamanhos de fonte que apareceram/sumiram

## 2. Escala e utilitários

- [ ] 2.1 Em `tailwind.config.ts`: remover as 72 chaves `fontFamily` mortas
      (`*-font-family`); manter `fontSize` do Untitled; marcar `base` como
      alias de `md` (mesmo valor) e registrar regra de lint de aviso para
      `text-base`
- [ ] 2.2 Plugin Tailwind `typography-roles` que registra `.type-<papel>` para
      os 18 papéis da tabela §4.1 do `sistema-visual.md` (tamanho, linha,
      peso, `letter-spacing`, `text-transform`, `font-variant-numeric` em
      `kpi-value`/`numeric`, cor por `theme('colors.gray.*')` até os tokens
      semânticos existirem)
- [ ] 2.3 `globals.css`: `body { font-feature-settings: "cv11" }` (Inter) e
      classe `.numeric { font-variant-numeric: tabular-nums }`
- [ ] 2.4 `src/components/ui/typography.tsx`: `Heading` (`as`, `role`,
      `className`) e `Text` (`as`, `role`, `className`), tipados com a união
      dos papéis
- [ ] 2.5 Vitrine `/sandbox/tipografia`: todos os papéis lado a lado com nome,
      tamanho e exemplo em contexto (título + subtítulo + card + tabela + KPI)

## 3. Kit nos papéis

- [ ] 3.1 `common/Topbar.tsx`: `h1` → `type-page-title`; `supportText` →
      `<p class="type-page-subtitle">`; contêiner `min-h-12`; remover o
      `title=` com legenda de revisão do `h1` (a remoção completa da marcação
      fica em `navegacao-e-cabecalhos`)
- [ ] 3.2 `ui/card.tsx`: `CardTitle` → `h3` + `type-card-title` (sem
      `leading-none tracking-tight`); `CardDescription` → `type-secondary`
- [ ] 3.3 `ui/dialog.tsx`, `ui/sheet.tsx`, `ui/alert-dialog.tsx`: títulos →
      `type-dialog-title` (sem `leading-none`), descrições → `type-secondary`
- [ ] 3.4 `ui/table.tsx`: `TableHead` → `type-table-header`; `TableCell` →
      `type-body`; prop `numeric` em `TableHead`/`TableCell` (alinha à direita
      + `.numeric`); novo `TableGroupRow` com `colSpan` por contexto do
      `Table` e texto `type-eyebrow`
- [ ] 3.5 `ui/form.tsx`, `ui/label.tsx`: `FormLabel` → `type-label` (sem
      `leading-none`, sem vermelho no erro); `FormDescription` →
      `type-helper`; `FormMessage` → `type-helper` + cor de erro
- [ ] 3.6 `ui/empty-state.tsx`, `common/TableEmptyState.tsx`: título →
      `type-card-title`, descrição → `type-secondary`
- [ ] 3.7 `ui/badge.tsx`, `ui/status-tag.tsx`: tamanho mínimo 12 px
      (`type-caption` peso 500); remover `text-[10px]`/`[11px]`
- [ ] 3.8 `layout/SidebarComponent.tsx`, `layout/MobileSidebar.tsx`: rótulos
      de módulo deixam de ser `<h3>` (`<span class="type-nav-item">`);
      subitens `type-nav-item` (14 px) em vez de 12 px; badge fiscal em
      `type-caption`
- [ ] 3.9 `common/CustomButton.tsx`: título `type-body-strong`, legenda
      `type-caption` abaixo (ordem título › legenda)

## 4. Codemods

- [ ] 4.1 Codemod `cardtitle-override`: remover `text-base|text-gray-700|font-semibold|text-xl|font-bold`
      de `className` de `CardTitle`/`DialogTitle`/`SheetTitle` (57 + 20
      ocorrências); manter apenas classes de layout (`flex`, `gap-*`, `pr-*`)
- [ ] 4.2 Codemod `uppercase-to-eyebrow`: toda `className` com `uppercase`
      vira `type-eyebrow` removendo `text-xs|text-[10px]|text-[11px]|text-sm|
      tracking-wide|tracking-wider|font-medium|font-semibold|font-bold|
      text-gray-\d+` da mesma string (176 ocorrências); revisar por
      amostragem os 32 `text-xs text-gray-500 font-medium uppercase tracking-wider`
      e os 11 `text-sm font-bold text-gray-700 uppercase … border-b`
      (estes viram `section-title` quando são seção de página)
- [ ] 4.3 Codemod `min-12px`: `text-[10px]`/`text-[11px]` → `type-caption`;
      `text-[13px]` → `type-body` (inclui os casos da nota fiscal:
      `InvoiceItems.tsx:211`, `InvoicePayment.tsx:437-467`,
      `NfseCamposAdicionaisSection.tsx:153`)
- [ ] 4.4 Codemod `heading-roles`: `<h1 class="text-2xl font-bold …">` e
      variantes → `<Heading as="h1" role="page-title">` nas 12 páginas que
      não usam `Topbar`; `<h2 class="text-xl|text-lg …">` → `section-title`;
      `<h3 class="text-sm font-semibold text-gray-500|400">` →
      `type-eyebrow` quando é rótulo de grupo, `card-title` quando é título
- [ ] 4.5 Codemod `kpi-roles`: valores `text-2xl|text-xl font-bold` em cards
      de resumo → `type-kpi-value`; rótulos → `type-kpi-label` (dashboard,
      base de custos, relatórios, composição, processos, fluxo financeiro —
      inclui corrigir `text-lG` em `TransactionsTotals.tsx:120-163`)
- [ ] 4.6 Codemod `numeric-cells`: `TableHead`/`TableCell` com `text-right`
      → prop `numeric` (298 ocorrências)
- [ ] 4.7 Rodar `tsc`, lint e as capturas; comparar `audit.json` com o de
      referência (nenhuma rota com fonte < 12 px; `h1` 24 px em todas; sem
      `h3` na sidebar)

## 5. Hierarquias invertidas (correções pontuais)

- [ ] 5.1 `configuracoes/financeiro/plano-de-contas/components/TableData.tsx:86-186`:
      nível 1 em `TableGroupRow`, níveis 2–3 `body-strong`, folha `body`;
      remover a pintura de linha inteira em success-100/error-100
- [ ] 5.2 `configuracoes/vendas/perfil-de-vendedor/components/Main.tsx:121-193`:
      perfil como linha de dado (`body-strong`), vendedores abaixo; sem
      células vazias
- [ ] 5.3 `configuracoes/produtos/materiais/components/Materials.tsx:194-227`:
      setor em `TableGroupRow`, subcategoria `body-strong` sem caixa alta
- [ ] 5.4 `configuracoes/financeiro/folhas-de-pagamento/components/Main.tsx:306,469`:
      nome do colaborador `object-title` só no cabeçalho de detalhe
      (`PayrollDetail`), `body-strong` na lista; total em `kpi-value`
- [ ] 5.5 `configuracoes/produtos/[id]/composicao/components/AssemblyEditor.tsx:2007-2033`
      e `configuracoes/produtos/processos/[id]/components/ProcessEditor.tsx:494,500`:
      KPIs em `kpi-value`/`kpi-label` (iguais entre si)
- [ ] 5.6 `(blank-layout-pages)/assinatura/page.tsx:622,694-801`: `h1`
      `page-title`, `h2` `section-title`
- [ ] 5.7 `nota-fiscal/emitir/components/InvoiceResultsTable.tsx`,
      `configuracoes/nota-fiscal/**`: `h2` duplicando o `h1` removido
      (`EmissoresListClient.tsx:368`, `CfopListClient.tsx:188`); rótulos
      `uppercase tracking-wider text-xs` em `InvoiceTotalsSection.tsx:79-136`,
      `InvoiceRecipientSection.tsx:125`, `InvoiceEmissionConfigSection.tsx:126`,
      `EmissorListItem.tsx:357,643-702`, `AssemblyDialogs.tsx:338-369`,
      `NextStepDialog.tsx:256` → `type-eyebrow` só quando são rótulos de
      seção; rótulos de campo voltam para `label`
- [ ] 5.8 `producao/agenda-de-entrega/.../DeliveryScheduleData.tsx:212`:
      cabeçalho de data em `TableGroupRow` (eyebrow) em vez de `text-xs`
      fraco sobre `bg-gray-100`
- [ ] 5.9 `cadastros/clientes/[id]/components/DetailCard.tsx:29`,
      `cadastros/fornecedores/[id]/components/DetailCard.tsx`: um único
      `DetailCard` em `common/`, `CardTitle` padrão
- [ ] 5.10 Casos de Title Case → sentence case nos rótulos listados em
      `sistema-visual.md` §2.1 e nos relatórios de módulo ("Pré-Cadastros",
      "Sem Responsável", "Histórico do Orçamento", "Tipo de Registro",
      "Emissão de Nota Fiscal", "Valor Comissão", "Valor Total", "Período de
      Teste", "Valor Padrão" (`ExpensesData.tsx:81`), "Valor Total"
      (`DiscountAndTotal.tsx:312`), "Valor Comissão"
      (`PaymentConditions/index.tsx:293`), "Importar Clientes", "Configurações Fiscais",
      "Dados do Emissor", "Remover Configuração", "Nova Natureza", "Receitas
      Previstas", "Saldo de Caixa Previsto", "(Total do Cliente)")

## 6. Títulos de documento

- [ ] 6.1 `lib/metadata.ts`: `pageTitle(...parts)` → "A · B · Atrupe";
      `layout.tsx` raiz com `title.template = "%s · Atrupe"`
- [ ] 6.2 Layouts de módulo (`base-de-custos`, `precificacao`, `cadastros/*/[id]`,
      `configuracoes/*`) com `title.template = "%s · <Módulo>"`
- [ ] 6.3 Toda `page.tsx` com `metadata.title` próprio (hoje repetido em
      `base-de-custos/*` e `precificacao/*`); dashboard ganha título "Painel"

## 7. Lint e fechamento

- [ ] 7.1 `.eslintrc.json`: `no-restricted-syntax` para `text-\[\d+px\]`,
      `uppercase` fora de `type-eyebrow`, `leading-none` em `className` de
      título, `font-bold` fora de `kpi-value`; `text-base` como aviso
- [ ] 7.2 Rodar as capturas de novo; anexar `tipografia-depois.json` e o diff
      no PR; conferir que cada rota tem exatamente um `h1`
- [ ] 7.3 Atualizar `design.md` (raiz do front) §2.2 com a tabela de papéis e
      um ponteiro para `/sandbox/tipografia`
