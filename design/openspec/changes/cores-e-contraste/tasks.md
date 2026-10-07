## 1. Tokens em canais e opacidade

- [ ] 1.1 `globals.css`: converter todas as variáveis de rampa de `rgba(r, g, b, 1)`
      para `r g b` em `:root` e `.dark` (inclusive `--gray-60`, `-fill`,
      `--surface`, `--scrollbar-thumb`, `--focus-ring`)
- [ ] 1.2 `tailwind.config.ts`: cada entrada de `colors` passa a
      `'rgb(var(--x) / <alpha-value>)'`; `ringColor`, `borderColor`,
      `backgroundColor`, `textColor`, `fill`, `stroke` herdam de `colors`
- [ ] 1.3 Migrar leituras diretas de `var(--x)` fora do config (`grep -rn "var(--" src --include=*.css --include=*.tsx --include=*.ts`):
      scrollbar em `globals.css`, `ui/chart.tsx`, `common/charts/**`,
      `TrialExpiredAlert`, `PartialBlockAlert`, `PrintQuotation/**`,
      `fiscal/preview/**` → `rgb(var(--x))`
- [ ] 1.4 Verificar no CSS compilado que `.bg-gray-900\/60`, `.bg-surface\/50`
      existem; capturas de diálogo, sheet e drawer com véu visível
- [ ] 1.5 Remover de `tailwind.config.ts` os aliases de sombra duplicados
      (`shadow-shadow-*`), as sombras `portfolio-mockup-*`, os `focus-ring-4px-*`
      e `*-focused-*` roxos, e `logo: '#EF4123'` (vira `--logo` em `globals.css`
      só se algum consumidor existir; hoje não há)

## 2. Camada semântica

- [ ] 2.1 `globals.css`: variáveis semânticas em `:root` e `.dark` conforme a
      tabela §4.2 do `sistema-visual.md` (`--text-primary`…, `--bg-page`…,
      `--border-default`…, `--ring-focus`, `--scrim`, `--tone-<tom>-<papel>`
      para success/warning/error/info/neutral/brand/admin, `--chart-1…6`,
      `--chart-positive|negative|grid|axis`)
- [ ] 2.2 `tailwind.config.ts`: `textColor` (`primary`, `secondary`, `tertiary`,
      `placeholder`, `disabled`, `brand`, `on-brand`), `backgroundColor`
      (`page`, `surface`, `surface-subtle`, `surface-selected`, `scrim`),
      `borderColor` (`DEFAULT` = default, `strong`, `focus`), `ringColor`
      (`focus`), `colors.tone-*` e `colors.chart-*`
- [ ] 2.3 Plugin `typography-roles` (de `tipografia-e-hierarquia`) passa a
      apontar as cores dos papéis para os tokens semânticos
- [ ] 2.4 Vitrine `/sandbox/cores`: todos os tokens semânticos e tons nos dois
      temas, com o valor de contraste calculado ao lado de cada par texto/fundo

## 3. Kit

- [ ] 3.1 Classe utilitária `focus-ring` (plugin) = `focus-visible:outline-none
      focus-visible:ring-4 focus-visible:ring-focus focus-visible:border-focus`;
      aplicar em `ui/button.tsx:10`, `ui/input.tsx:63`, `ui/select.tsx:22`
      (trocar `focus:` por `focus-visible:`), `ui/tabs.tsx:131,154`,
      `ui/checkbox.tsx`, `ui/radio-group.tsx`, `ui/switch.tsx`, `ui/dialog.tsx:50`,
      `ui/dropdown-menu.tsx`, `ui/accordion.tsx`, `ui/pagination.tsx`,
      `ui/toggle.tsx`, `ui/toggle-group.tsx`; remover o anel de `ui/badge.tsx:7`
      (div não interativa)
- [ ] 3.2 `ui/button.tsx:10`: desabilitado por variante — com fundo:
      `disabled:bg-surface-subtle disabled:border-default disabled:text-disabled`;
      ghost/link: `disabled:text-disabled` apenas (a consolidação de variantes
      fica em `botoes-e-acoes`; aqui só a cor)
- [ ] 3.3 `ui/switch.tsx:20-22`: trilho desligado `bg-gray-200 border
      border-strong`; remover `intent` com `bg-[#7b61ff]`
- [ ] 3.4 `ui/tabs.tsx:141,202`: ativo `text-brand` (brand-700) e borda
      `brand-600`; remover intents `success`/`dark` com brand-300
- [ ] 3.5 `ui/dialog.tsx:24`, `ui/alert-dialog.tsx:23`, `ui/sheet.tsx:24`,
      `ui/drawer.tsx:31`: véu `bg-scrim` (gray-900/60) sem `backdrop-blur`
- [ ] 3.6 `ui/tooltip.tsx`: bolha e seta no mesmo token (`bg-gray-900-fill`
      → `tone-neutral-solid`), consistente no escuro
- [ ] 3.7 `ui/skeleton.tsx`: `bg-gray-200` sobre superfície e `bg-gray-200/70`
      sobre página; remover `mix-blend-multiply`
- [ ] 3.8 `ui/sonner.tsx`: ícones por tom do dicionário (`IconCircleCheck`,
      `IconAlertCircle`, `IconAlertTriangle`, `IconInfoCircle`) — sai
      `IconXboxXFilled`
- [ ] 3.9 `common/Topbar.tsx:76,119`: faixa `label` com `bg-tone-brand-bg`
      e `text-tone-brand-text`; `tone="admin"` (`bg-tone-admin-solid`,
      `text-on-brand`) substitui `classNames.label='bg-[#FF4201]'` nas 9
      páginas de `admin/**`
- [ ] 3.10 `common/charts/*.tsx:40,51,75`: remover `border-dashed border-[#7b61ff]`

## 4. Dicionário de estados e dinheiro

- [ ] 4.1 `src/consts/status.ts`: `STATUS` com rótulo, tom e ícone para todas
      as chaves usadas em `consts/receivables.ts`, `financial.ts`,
      `payroll.ts`, `cashControl.ts`, `cashAccounts.ts`, `ordersStatusObj`,
      `quotationStatus*`, `deliveryStatus*`, `invoiceStatus*`, `assetStatus*`,
      `projectStatus*`; função `statusOf(key)` com fallback "Desconhecido"/neutro
- [ ] 4.2 Resolver os conflitos e registrar a decisão no cabeçalho do arquivo:
      PENDING ("Pendente", neutro) em recebíveis/financeiro/fluxo; OVERDUE
      ("Atrasada", erro) distinto de PENDING; DONE "Concluído" / FINISHED
      "Entregue" (até o OpenSpec de regras responder); AUTHORIZED "Autorizada"
      em lista e seção; CLOSED "Fechado" (sucesso); REOPENED "Reaberto"
      (aviso); PROVISIONED "Provisionado" (aviso); "Devolução" com o mesmo tom
      em lista e formulário
- [ ] 4.3 Os `consts/*` existentes passam a derivar de `STATUS` mantendo os
      exports; remover os mapas locais (`Delivery.tsx:62-67` deixa de usar
      `ordersStatusObj`; `PayrollMovement.tsx:102-104` ganha OVERDUE e
      PROVISIONED via dicionário)
- [ ] 4.4 `consts/receivables.ts:23-56`: estado deixa de ser polegar; ícone e
      rótulo do dicionário (o componente `StatusBadge` chega em
      `componentes-adequados`; aqui `Badge` com `dot` e tom)
- [ ] 4.5 `common/Money.tsx`: `<Money value negative? variant="default|delta" />`
      com formatação pt-BR, `numeric`, cor primária, erro para negativo,
      verde/vermelho pareados só em `delta`
- [ ] 4.6 Codemod `money-neutral`: trocar `text-success-700|text-green-*|
      text-red-*|text-error-*|text-warning-600` envolvendo `formatCurrency`/
      `toLocaleString('pt-BR'…)` por `<Money>` em: `vendas/orcamentos/.../QuotationsData.tsx:285`,
      `OrdersData.tsx:268`, `relatorios/vendas/components/SalesTable.tsx:164`,
      `relatorios/financeiro/components/FinancialTable.tsx:105-113`,
      `relatorios/resultado-por-setor/components/SectorCardsGrid.tsx:48-50,68-70`,
      `QuotationItems.tsx:342,690`, `OrderItems.tsx:188,350`,
      `[orderId]/components/Financial.tsx:168-174,229-235,290-296`,
      `financeiro/_components/transactions/TransactionsTable/TransactionsData.tsx:259-266`,
      `nota-fiscal/emitir/components/InvoiceResultsTable.tsx:983,1116`,
      `configuracoes/produtos/components/ProductsTable/ProductsData.tsx:412`,
      `configuracoes/financeiro/folhas-de-pagamento/components/Main.tsx:463-466`,
      `precificacao/components/EditPriceModal.tsx:419,427`,
      `relatorios/dfc/**`, `relatorios/projecao-de-caixa/**`
- [ ] 4.7 `producao/produtividade/components/Productivity.tsx:100-106,161-167`:
      eficiência < 100 % em cor primária com seta de direção; sem vermelho
- [ ] 4.8 `base-de-custos/comparativo/components/Comparison.tsx:211-219`:
      "acima do previsto" em tom de aviso, "abaixo" neutro, com ícone
- [ ] 4.9 `financeiro/_components/transactions/NewTransaction/index.tsx:208-214`
      e `fluxo-financeiro/components/FinancialFlow.tsx:249-266`: "Nova
      despesa"/"Nova receita" em cor de marca com ícone de tipo (uma primária
      "Novo lançamento" com menu fica para `telas-financeiro-e-caixa`)
- [ ] 4.10 `producao/.../Stages/StageStatus.tsx:93-98`: trocar `text-${item.color}`
      por `tone` do dicionário (sem classe dinâmica)

## 5. Codemods de cor

- [ ] 5.1 Tabela `scripts/codemods/hex-to-token.json` com os 30 hex mais
      frequentes → token (`#667085`→gray-500, `#1D2939`→gray-800,
      `#12B76A`→success-500, `#344054`→gray-700, `#252e3b`→gray-800,
      `#9098A6`→gray-400, `#F43535`→error-500, `#F2B720`→warning-400,
      `#7AC31C`→success-400, `#5869FF`/`#8358FE`/`#7b61ff`→purple-500…);
      codemod aplica em `className`, `style`, `fill`, `stroke`, `color`
- [ ] 5.2 Codemod `palette-to-tone`: `red-*`→`tone-error-*`,
      `amber|yellow-*`→`tone-warning-*`, `green|emerald-*`→`tone-success-*`,
      `blue|indigo-*`→`tone-info-*`, `purple|violet-*`→`purple-*` (rampa
      existe), `orange-*`→`orange-*`, `neutral|slate|zinc-*`→`gray-*`,
      `rose|pink-*`→`rose-*`; mapeamento 50→bg, 200/300→border, 600/700→text,
      500/600 sólido→solid
- [ ] 5.3 À mão (~60 hex restantes): `admin/sistema/cupons/page.tsx:488-775`
      (todo o formulário → tokens e kit), `ui/status-tag.tsx:25-107`
      (→ tons), `common/form-input.tsx:17-35` (TOKEN hex → classes),
      `assets/icons/CustomIcons.tsx` (fills → `currentColor`, ver `icones`),
      `consts/nav.ts:458` (`iconColor`), `relatorios/**` gráficos (tarefa 6),
      `ui/chart.tsx`, `common/charts/**`
- [ ] 5.4 Codemod `unknown-classes`: `text-muted-foreground`→`text-tertiary`,
      `bg-primary`→`bg-tone-brand-solid`, `bg-background`→`bg-surface`,
      `bg-blue-light`→`bg-tone-info-bg`, `bg-blue-green*`→`bg-tone-success-bg`,
      `scrollbar-thin`→remover, `text-lG`→`type-kpi-value`
- [ ] 5.5 Rampa crua fora de `src/components/ui` → semântico: codemod com
      tabela (`text-gray-900`→`text-primary`, `-700`→`text-secondary`,
      `-600|-500|text-gray`→`text-tertiary`, `-400|-300` em texto →
      `text-tertiary` (revisar), `bg-white`→`bg-surface`, `bg-gray-50`→
      `bg-surface-subtle`, `bg-gray-100` de página→`bg-page`, `border-gray-200`→
      `border`, `border-gray-300`→`border-strong`, `bg-brand-25`→
      `bg-surface-selected`); rodar `tsc` e capturas
- [ ] 5.6 Textos informativos em `text-gray-300/400` corrigidos à mão onde o
      codemod não decide: `colaboradores-e-usuarios/components/TableData.tsx:168-175`,
      `Permissions/index.tsx:542,612`, `plano-de-contas/.../TableData.tsx:218-248`,
      `TransactionDetails/index.tsx:312-315`, `PaymentConditions/index.tsx:318,326`,
      `InvoiceFormHeader.tsx:109`, `InvoiceItems.tsx:263,275`,
      `RejectQuotation.tsx:136-140`, `QuotationProdDetailModal.tsx:493`,
      `AdminExpensesData.tsx:84`
- [ ] 5.7 `(auth)/login/components/LoginForm.tsx:135,156`: links `text-brand`;
      `(blank-layout-pages)/assinatura/concluir/page.tsx:313,347,395`: títulos
      em tons; `configurar-fiscal/page.tsx:325,417,483`: `text-tertiary`

## 6. Gráficos

- [ ] 6.1 `ui/chart.tsx`: `ChartConfig` padrão lendo `var(--chart-n)`;
      `ChartLegend` renderiza a partir da `config` (sem swatch manual)
- [ ] 6.2 `relatorios/vendas/components/ApprovedRejectedChart.tsx:29-41,164-179`,
      `RankingBarChart.tsx:67-70`, `QuotationsOriginChart.tsx:26-30`,
      `OrdersOriginChart.tsx:26-30`, `SalesEvolutionChart.tsx:31-36,232`,
      `relatorios/financeiro/components/FinancialChart.tsx:39-51,278-297`,
      `relatorios/dfc/components/ChartsSection.tsx:41,52,172`,
      `dashboard/components/**/Chart.tsx`, `common/charts/**`: séries e
      legendas por token; remover `BAR_COLOR '#099260'` e `'#888'`
- [ ] 6.3 Verificar contraste ≥ 3:1 de `--chart-1…6` sobre `bg-surface` nos
      dois temas (vitrine `/sandbox/charts`)

## 7. Lint, teste e fechamento

- [ ] 7.1 `.eslintrc.json`: `no-restricted-syntax` para hex em JSX
      (`className`, `style`, `fill`, `stroke`, `color`) e para classes das
      paletas padrão; exceções via comentário só em `src/app/globals.css`
      e `ui/chart.tsx` (nenhuma esperada)
- [ ] 7.2 `scripts/check-unknown-classes.mjs` + job no CI: classes usadas em
      `src/**/*.tsx` × classes geradas pelo Tailwind; falha em desconhecida
- [ ] 7.3 `e2e/ui/axe.spec.ts`: `axe-core` em cada rota capturada, regras
      `color-contrast`, `button-name`, `link-name`; nos dois temas
- [ ] 7.4 Capturas antes/depois anexadas; `design.md` da raiz §2.1 ganha a
      tabela de tokens semânticos e o dicionário de estados
