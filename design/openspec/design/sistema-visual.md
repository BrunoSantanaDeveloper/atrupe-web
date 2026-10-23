# Sistema visual — design compartilhado

Uma arquitetura visual, decidida uma vez, implementada por catorze mudanças
(mapa na seção 5). Cada mudança liga este arquivo no seu `design.md` e cobre
só a sua fatia. Este arquivo morre quando a última delas arquivar; o que
sobrevive são as specs em `design/openspec/specs/`.

Idioma dos exemplos de classe e de arquivo: o do código. Caminhos relativos a
`src/` do front, salvo indicação.

## 1. Como o diagnóstico foi feito

| Fonte                                                                                                                                                                                               | O que cobriu                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Varredura estática de `src/**/*.tsx` (887 arquivos, 112 páginas, ~204 mil linhas)                                                                                                                   | contagem de classes de tamanho, peso, cor, raio, sombra, `hover:`, `focus-visible:`, `transition`, hexadecimais, paletas padrão do Tailwind, bibliotecas de ícone, componentes usados e componentes mortos                                                                                                                                                                                                                              |
| Leitura módulo a módulo do JSX real (vendas, dashboard, relatórios, financeiro, nota fiscal, configurações, cadastros, produção, estoque, base de custos, precificação, shell, autenticação, admin) | evidência `arquivo:linha` de cada problema; o que está bom e deve ficar                                                                                                                                                                                                                                                                                                                                                                 |
| Telas reais (Playwright, 1440×900, conta de teste em `localhost`)                                                                                                                                   | confirmação visual e métricas renderizadas: tamanhos de fonte por página, altura das linhas de tabela, botões sem nome acessível, `title=` nativo                                                                                                                                                                                                                                                                                       |
| Referências comparadas                                                                                                                                                                              | SAP Fiori (object page, shell bar, densidade), Shopify Polaris (índice de configurações, IndexTable, BulkActions, ContextualSaveBar, Banner, tamanhos de Modal), Atlassian (Lozenge, foco, estado vazio), Salesforce Lightning (highlights panel), Stripe Dashboard (hierarquia tipográfica, números tabulares, filtros), Linear (linha clicável + menu "⋯", autosave, teclado), Odoo (smart buttons) e Untitled UI (base do kit atual) |

Resultado renderizado que resume a queixa "fontes do mesmo tamanho" (57 rotas
capturadas; tabela completa em `design/evidencia/auditoria-ui-antes.md`):
14 px = 49,7 % e 12 px = 40,1 % dos textos visíveis; 18 px (título da página e
seu subtítulo, do mesmo tamanho) = 3,6 %; 16 px = 3,5 %; 20 px = 2,4 % (nome do
usuário na barra lateral); 24 px = 0,6 %. Seis rotas não têm `h1`; 140 botões
visíveis não têm nome acessível; as linhas de tabela medem 57 px (126 linhas)
ou 73 px (43 linhas). Os rótulos dos módulos da barra lateral são `<h3>` de
16 px peso 400.

## 2. Diagnóstico — estado encontrado

### 2.1 Tipografia e hierarquia

- A escala Untitled existe (`tailwind.config.ts:440-464`, display-2xl…xs, xl…xs com
  altura de linha) mas é quase inédita: `text-display-*` tem 8 usos; as páginas
  usam `text-sm` (1 435), `text-xs` (631), `text-base` (164), `text-lg` (130).
- Não há primitivo Heading/Text. `<h1>` existe em 24 das 112 páginas, com quatro
  tamanhos (`text-2xl` ×11, `text-xl` ×5, `display-sm` ×4, `text-lg` ×3);
  `<h2>` com cinco (`text-xl` 26, `text-lg` 18, `text-sm` 15, `text-2xl` 8,
  `text-3xl` 3).
- Título da página (`common/Topbar.tsx:99`) é `text-lg` 18 px — o mesmo tamanho
  do subtítulo (`:110`, um `<h3>` sempre renderizado) e do `DialogTitle`
  (`ui/dialog.tsx:109`). `CardTitle` é 16 px (`ui/card.tsx:38`) e os títulos de
  linha dos hubs de configurações também (`configuracoes/components/CompanySettingsList.tsx:48,81-88`).
- Coisas maiores que o título da página: KPIs `text-2xl` no editor de composição
  (`configuracoes/produtos/[id]/composicao/components/AssemblyEditor.tsx:2007-2033`),
  nome do colaborador `text-xl` na folha (`configuracoes/financeiro/folhas-de-pagamento/components/Main.tsx:306`),
  `h2` de seção `text-xl` na assinatura (`(blank-layout-pages)/assinatura/page.tsx:694`
  com `h1` `text-lg` em `:622`).
- Hierarquia invertida em tabelas agrupadas: níveis 1–3 do plano de contas em
  `text-xs` enquanto a folha é `text-sm font-medium`
  (`configuracoes/financeiro/plano-de-contas/components/TableData.tsx:95-186`);
  o perfil de vendedor (entidade principal) é a linha de grupo de 12 px
  (`configuracoes/vendas/perfil-de-vendedor/components/Main.tsx:121-135`);
  subcategoria de materiais em caixa alta acima do setor
  (`configuracoes/produtos/materiais/components/Materials.tsx:222-227`).
- Abaixo de 12 px: `text-[10px]` ×34 e `text-[11px]` ×26 (`layout/SidebarComponent.tsx:384`,
  `ui/status-tag.tsx:35`, `nota-fiscal/.../InvoicePayment.tsx:437-467`).
- Caixa alta ad hoc: `tracking-wider` ×60 e `tracking-wide` ×33, em oito
  combinações diferentes de classe.
- Cinzas de texto secundário usados como sinônimos: `text-gray` (= gray-500),
  `-500` (463), `-700` (423), `-600` (258), `-400` (218), `text-muted-foreground`
  (88, classe inexistente) — muitas vezes na mesma tabela.
- `leading-none` em texto que quebra (`ui/dialog.tsx:109`, `ui/card.tsx:39`,
  `ui/label.tsx:10`). 72 chaves `fontFamily` apontando para variáveis que não
  existem (`tailwind.config.ts:316-389`, 0 usos). `text-md` e `text-base` são o
  mesmo 16/24; `text-2xl` = `display-xs`.
- Dinheiro sem numeral tabular: `tabular-nums` tem 23 usos num ERP.
- Títulos de aba do navegador iguais em todas as sub-páginas ("Base de custos",
  "Precificação").

### 2.2 Cores e contraste

- **Defeito de fundação:** os tokens são strings `rgba()` (`app/globals.css:140-289`)
  mapeadas como `var(--x)` sem `<alpha-value>` (`tailwind.config.ts:122-314`).
  Qualquer `/NN` em cor do sistema não gera CSS: o CSS compilado não tem
  `.bg-gray-900\/80`, `.bg-white\/90`, `.bg-black\/80`. Consequência: os
  véus de modal, sheet e drawer não escurecem (`ui/dialog.tsx:24`,
  `ui/alert-dialog.tsx:23`, `ui/sheet.tsx:24`, `ui/drawer.tsx:31`);
  `bg-gray-50/50` ×16 e `bg-white/30` ×6 não fazem nada.
- Classes que não existem e silenciosamente não fazem nada:
  `text-muted-foreground` ×88, `bg-primary` ×9, `bg-background` ×7,
  `bg-blue-light` (`ui/badge.tsx:36`, `ui/featured-icon.tsx:56`),
  `bg-blue-green*` (`ui/badge.tsx:44-47`), `scrollbar-thin`
  (`common/TablePagination.tsx:68`), `text-lG` (`financeiro/fluxo-financeiro/components/TransactionsTotals.tsx:120-163`).
- Sem camada semântica: todo componente usa a rampa crua (`text-gray`,
  `bg-brand-25`, `border-gray-300`); o tema escuro inverte rampas
  (`globals.css:326`).
- 481 hexadecimais em 67 arquivos, a maioria igual a um token: `#667085` ×48
  (gray-500), `#1D2939` ×39 (gray-800), `#12B76A` ×23 (success-500),
  `#344054` ×19 (gray-700). `#FF4201` ×41, todos em `admin/**` (faixa
  "Super Admin" no Topbar, `admin/sistema/planos/page.tsx:97`; formulário de
  cupons `admin/sistema/cupons/page.tsx:488-775`) — não é cor da paleta.
- 218 classes de paletas padrão do Tailwind (`blue` 100, `red` 73, `amber` 47,
  `green` 41, `emerald` 25, `indigo` 24, `orange` 19…), concentradas na nota
  fiscal, relatórios e importações.
- `borderColor.DEFAULT = var(--gray-500)` (`tailwind.config.ts:112`): todo
  `border` nu vira cinza médio (79 ocorrências estáticas).
- Dicionários de status que discordam: PENDING é "Pendente" amarelo em
  `consts/financial.ts:7-12`, "Não realizado" cinza em `consts/receivables.ts:23-56`
  (igual a OVERDUE, mesmo ícone de polegar) e "Em aberto" em
  `financeiro/fluxo-financeiro/components/FinancialFlowTable/FinancialFlowFilter.tsx:139`;
  "Concluído" e "Finalizado" são o mesmo verde
  (`producao/agenda-de-entrega/components/DeliveryScheduleTable/DeliveryScheduleData.tsx:241-245`);
  "Fechado" (estado normal de folha e caixa) é amarelo de aviso
  (`consts/payroll.ts:7-8`, `consts/cashControl.ts:18-19`); AUTHORIZED é
  "Autorizada" num lugar e "Emitida" noutro; enum cru "OVERDOWN" vaza
  (`.../PayrollMovement.tsx:102-104`); `text-${item.color}` dinâmico sem
  safelist (`.../Stages/StageStatus.tsx:93-98`).
- Dinheiro é verde por padrão: `text-success-700` em todos os valores de
  orçamentos, inclusive rejeitados (`vendas/orcamentos/components/QuotationsTable/QuotationsData.tsx:285`),
  ordens (`.../OrdersData.tsx:268`), relatórios (`relatorios/vendas/components/SalesTable.tsx:164`),
  resultado por setor mesmo negativo (`.../SectorCardsGrid.tsx:48-50`); descontos
  em laranja de aviso (`.../QuotationItems.tsx:342,690`); produtividade abaixo
  de 100 % em vermelho enquanto o rodapé diz "isso não é erro"
  (`producao/produtividade/components/Productivity.tsx:100-118`); "Nova despesa"
  é botão vermelho sólido (`financeiro/_components/transactions/NewTransaction/index.tsx:208-214`).
- Contraste reprovado: links `text-success` no login (~2,4:1,
  `(auth)/login/components/LoginForm.tsx:135,156`); "Sem usuário" `text-gray-300`
  (`configuracoes/.../colaboradores-e-usuarios/components/TableData.tsx:168-175`);
  trilho do Switch desligado gray-100 sobre branco (~1,1:1, `ui/switch.tsx:20-22`);
  aba ativa `brand-300` sobre branco (~2:1, `ui/tabs.tsx:141,202`); faixa de
  rótulo do Topbar `text-white opacity-60` sobre `bg-brand-200` (~1,3:1,
  `common/Topbar.tsx:76,119`); faixa admin branco sobre `#FF4201` (~3,2:1);
  desabilitado `bg-gray-100 text-gray-300` em todo botão (~1,4:1, `ui/button.tsx:10`);
  `#6CE9A6` nos gráficos com comentário no próprio código dizendo que reprova
  (`relatorios/vendas/components/RankingBarChart.tsx:67-70`).
- Cinco estilos de anel de foco: botão 4 px gray-600 com offset, input brand-50,
  aba gray-400 2 px, badge gray-950 (em div não interativa), fechar do diálogo
  gray-950. Tokens `focus-ring-4px-primary-*` ainda no roxo do Untitled
  (`globals.css:199-200,300,302`).
- Gráficos: paletas hexadecimais duplicadas por arquivo, legendas que não batem
  com as séries (`relatorios/vendas/components/ApprovedRejectedChart.tsx:29-41` vs
  `:164-179`; `relatorios/financeiro/components/FinancialChart.tsx:39-51` vs
  `:278-297`); `--chart-*` sem valor escuro.

### 2.3 Botões e ações

- `ui/button.tsx:13-92`: 31 variantes em três gerações (legado 5 tons × 4;
  "Figma" primary/secondary/destructive × 3; glass; input/link/none/raw).
  Uso real em 856 `<Button>`: padrão implícito 284, `neutralOutline` 277,
  `outline` 65, `neutralGhost` 45, `ghost` 39, `error` 18, `primary` 2,
  `destructive` 2, `secondary` 0; 14 variantes nunca usadas.
- Duas primárias (`default` brand-500 e `primary` brand-600); secundária com
  borda de 2 px e rótulo gray-500 que parece desabilitado; `outline` verde
  usado 65 vezes como secundária, competindo com a primária; hover mais escuro
  que o pressionado nas variantes light; desabilitado força caixa cinza até em
  ghost e link; ícone padrão 24 px em botão de 40 e de 32 px (`:157-158`);
  `isLoading` muda a largura e não marca `aria-busy` (`:170-189`).
- **"Configurar, Configurar, Configurar":** `configuracoes/components/CompanySettingsList.tsx:97-116`
  põe um botão primário "Configurar →" em cada linha de hub (6 em Empresa e
  sistema, 6 em Financeiro, até 6 em Vendas, 2 em Nota fiscal); as linhas com
  `cta` próprio repetem o rótulo (`.../CompanyInfo/index.tsx:94-96`,
  `.../MeasureDefaultsDialog.tsx:141-143`, `.../CreditLimit.tsx:164-166`);
  Importações tem 6 "Importar →" idênticos (`configuracoes/importacoes/components/ImportSettingsClient.tsx:24-65`);
  um nível abaixo, cada empresa (`.../NewCompanyInfo.tsx:328-336`) e cada
  documento fiscal (`.../EmissorListItem.tsx:457-479,712-716`) têm o seu
  "Configurar"; "Corrigir >" por pendência (`.../FiscalPendenciasAlert.tsx:171-178`);
  "Configurar" primário repetido por item não configurado da NF-e
  (`nota-fiscal/emitir/[orderId]/components/InvoiceItems.tsx:199-209`);
  "Aprovar"/"Fechar caixa"/"Abrir caixa" primários por conta
  (`financeiro/controle-de-caixa/components/CashControl.tsx:284-343`).
- Muralhas de ícones por linha: 5 em orçamentos (`.../QuotationsData.tsx:357-410`),
  até 8 em ordens com duas impressoras idênticas lado a lado (`.../OrdersData.tsx:333-470`),
  6 na agenda de entrega (`.../DeliveryScheduleData.tsx:325-443`), 5 nas
  movimentações (`financeiro/_components/transactions/TransactionsTable/TransactionsData.tsx:281-406`),
  4 em produtos (`.../ProductsData.tsx:425-461`), 4 em produção
  (`configuracoes/producao/components/ProductionSettings.tsx:252-290`), dois
  lápis idênticos em colaboradores (`.../TableData.tsx:216-242`). Linhas nunca
  são clicáveis; o nome em negrito não é link.
- A ação principal da tela é ícone sem rótulo: "Receber" no PDV é polegar
  fantasma (`financeiro/frente-de-caixa/components/PDV.tsx:383-403`), "Emitir
  nota fiscal" é ícone de recibo (`nota-fiscal/emitir/components/InvoiceResultsTable.tsx:1500,1519`),
  "Lançar" é um "+" (`financeiro/despesas-fixas/components/FixedExpenses.tsx:473-478`),
  definir carga horária é um relógio (`base-de-custos/mao-de-obra/components/LaborCosts.tsx:136-140`).
- Páginas de detalhe sem ação primária: Prévia/Reabrir/Rejeitar/Concluir/Aprovar
  são o mesmo azulejo branco de 70 px (`vendas/orcamentos/[quotationId]/components/QuotationActions/index.tsx:47-85`,
  `common/CustomButton.tsx:41`); "Emitir NF-e" é azulejo cinza igual a
  "Cancelar digitação" (`nota-fiscal/emitir/[orderId]/components/InvoiceFormHeader.tsx:125-151`);
  "Inativar cadastro" vermelho sólido é o botão mais chamativo do cliente, sem
  "Editar" ao lado (`cadastros/clientes/[id]/components/ClientActions.tsx:117-123`).
- Botões sem nome acessível: recolher sidebar (`layout/SidebarComponent.tsx:260`),
  menu do usuário (`layout/UserDropdown.tsx:56`), ajuda (`common/HelpButton.tsx:34-40`),
  voltar do Topbar (`common/Topbar.tsx:83-93`), exportar (`common/ExportDataButton.tsx:125-132`),
  mostrar senha (`common/form/FormInput.tsx:122-131`), lápis de cliente e
  fornecedor (`.../NewClient/index.tsx:433-441`, `.../NewSupplier.tsx:253-261`),
  lixeiras de endereço e contato, "+" e "X" da assinatura
  (`.../SubscriptionSummaryCards.tsx:125-132,176-182`, o "+" sem `onClick`).
- Destrutivo inconsistente: confirmação verde com ícone de check
  (`ui/alert-dialog.tsx:110`, `common/GlobalAlertDialog.tsx:65`, status de
  orçamento, motivos, origens), `bg-red-600` manual (emissores, CFOP,
  naturezas), `variant="error"` em 7 lugares; rejeitar orçamento sem confirmação
  quando não há motivos (`.../RejectQuotation.tsx:91-99`), excluir despesa fixa
  sem confirmação (`.../FixedExpenses.tsx:165-180`), rascunho de NF sem
  confirmação (`.../InvoiceResultsTable.tsx:1416-1423`), inativar série sem
  confirmação (`.../series-de-venda/components/Main.tsx:148-166`); "Cancelar"
  ao lado de "Cancelar movimentação" (`.../CancelTransaction/Alert.tsx:159,167`),
  "Voltar" descarta e "Cancelar" confirma (`.../CancelOrderButton.tsx:233-243`),
  "Fechar" como primária num diálogo em que "Fechar" significa fechar o caixa
  (`.../CashDayDetail.tsx:287-289`).
- Vocabulário: "Novo" / "Cadastrar" / "Adicionar" / "Acrescentar" / "Criar";
  "Excluir" / "Remover" / "Retirar" / "Apagar"; "Cancelar" / "Voltar" / "Fechar"
  para o mesmo gesto; "Desativar" na dica e "Inativar" no diálogo; "Salvar"
  duas vezes no mesmo formulário (`.../QuickSaleSettingsForm.tsx:244-246,368-370`)
  e quatro mecanismos de salvar numa página (`AssemblyEditor.tsx:1941-2497`);
  botões de desenvolvimento no rodapé ("Teste", "Trigger":
  `.../NewTransaction/index.tsx:346-357`, `.../NewPaymentCondition/index.tsx:476-487`,
  `.../NewProduct.tsx:807-817`).

### 2.4 Espaçamento e layout

- Linhas de tabela renderizadas com 57 px e 73 px (`ui/table.tsx:98` é
  `py-4 px-6`, sem opção de densidade); Polaris usa ~44 px, Fiori compacto 32.
- Sidebar de 296 px (96 recolhida) com ~224 px de cromo antes do primeiro item
  (logo h-28 + bloco do usuário h-28) e uma régua por item
  (`layout/SidebarComponent.tsx:212,219,287,337,427`).
- `div { scrollbar-gutter: stable }` global (`globals.css:17-21`) força
  paddings assimétricos: `main` `pl-6 pr-2` (`(app-sidebar)/layout.tsx:19`),
  corpo do diálogo `p-6 pr-2` (`ui/dialog.tsx:80`).
- 52 valores distintos de `max-w` em `DialogContent` (500 ×17, 640 ×13, 560 ×11,
  950, 855, 644, 692, 695, 578, 1040, "fit"…); sem prop de tamanho; 950 px
  para uma única textarea (`.../ItemActions/Notes/index.tsx:80-84`,
  `.../transactions/Actions/Notes/index.tsx:79`); 886 px para três selects
  (`.../MeasureDefaultsDialog.tsx:145`); diálogo de 855 que salta para 1180 ao
  trocar de aba (`.../NewProduct.tsx:463-468`); formulários de 15 campos,
  matrizes de permissão e editores de fluxo dentro de diálogo
  (`.../PaymentConditions/index.tsx:245-345`, `.../Permissions/index.tsx:384`,
  `.../QuotationComposeModal.tsx:386-406`); diálogo sobre diálogo
  (`.../CompanyInfo/index.tsx` → `NewCompanyInfo.tsx:207-208`;
  `.../TransactionDetails/index.tsx:117,378-400`; consulta de CNPJ com três
  diálogos em sequência). `ui/sheet.tsx` e `ui/drawer.tsx` têm 0 usos.
- Grades de formulário remendadas: `flex-[1_0_250px]` dentro de `grid-cols-2`
  (`.../GeneralInfoTab.tsx:288-291`), `<div></div>` vazios para alinhar
  (`.../AddressTab.tsx:91,111`; rodapés de `Notes`, `ScheduleDate`,
  `Delivery`, `QuickSaleCheckout`), `leading-[44px] mt-5` para alinhar o índice
  da parcela (`.../InstallmentsForm.tsx:78`, `.../Installments.tsx:115`),
  `pr-20` para alinhar um cabeçalho (`.../setores/components/Main.tsx:117`),
  `grid-cols-3` sem breakpoint, `grid-cols-12` com um único filho.
- Estados vazios com altura presa à janela (`common/TableEmptyState.tsx:30,71,94`,
  `h-[calc(100vh-170px)]`), que forçam rolagem dentro de cards abaixo de abas e
  KPIs.
- Hubs: cada linha é um card branco separado por 16 px em vez de uma lista
  agrupada com divisórias (`CompanySettingsList.tsx:44-46`).
- Seis raios em superfícies parecidas (`rounded` 247, `-md` 104, `-lg` 387,
  `-xl` 105, `-2xl` 21, `[10px]`); conteúdo do menu `rounded-md` e submenu
  `rounded-lg` (`ui/dropdown-menu.tsx:50,68`).
- Quatro estilos de linha de grupo em tabelas (text-xs cinza; font-medium;
  texto puro; linha inteira pintada); separador depois de cada linha de quatro
  campos no detalhe do cliente (`.../DetailCardRowItem.tsx:17,23`).

### 2.5 Ícones

- Tabler em 458 arquivos, Lucide em 35 — 16 deles são primitivos do kit (spinner
  do botão, chevrons de select e accordion, dropdown, checkbox, calendário, X do
  sheet). `components/LucideIcon.tsx:2,24` importa o mapa inteiro do Lucide para
  um único consumidor (`common/TabsNavigation.tsx`).
- `assets/icons/CustomIcons.tsx`: 32 ícones de 34×34 fixos com 13 cores
  cravadas, misturando pictogramas de domínio com logos de bancos.
- Sem tokens de tamanho: 24 (padrão Tabler) domina em botões de 40 e 32 px;
  `size={16|14|18|20|22|13}` e `h-4|5|6|7` convivem; `strokeWidth` 2, 1,5 e 1.
- Mesmo glifo, significados diferentes: lupa = consultar CNPJ, ver detalhes e
  buscar (`cadastros/clientes`); impressora = imprimir e navegar para a ficha
  (`.../ProjectDetail.tsx:158-162`); `IconFileInvoice` = ver DANFE e emitir NF
  (`.../OrdersData.tsx:383-429`); `IconRefreshDot` = faturar e editar parcelas
  (`.../DeliveryScheduleData.tsx:336,355`); lixeira = excluir, inativar
  (`.../BankAccounts.tsx:234-241`) e cancelar adiantamento; `IconRefresh` =
  consultar SEFAZ e reprocessar; `IconPackageOff` para despesas; lupa como ícone
  de relatório (`.../CashDayDetail.tsx:158`); `IconXboxXFilled` como ícone de
  erro dos avisos (`ui/sonner.tsx`).
- `ui/featured-icon.tsx`: 48 variantes; 315 usos, 168 como decoração de
  cabeçalho de diálogo; `bg-blue-light` inexistente; tamanho `lg` sem SVG.
- Ícones decorativos sem `aria-hidden` (`dashboard/components/Quotations.tsx:89`
  e vários), SVGs escritos à mão (`.../CfopFormModal.tsx:122-136`), emoji "⚡"
  como único marcador de venda rápida (`.../QuotationsData.tsx:270,278`).

### 2.6 Hover, foco e movimento

- Nos módulos, 0 classes `focus-visible`; 96 no total do projeto contra 108
  `focus:` (anel aparece ao clicar com o mouse em `ui/select.tsx:22`).
- Mais de 50 `<button>` crus (cards-rádio, chips, abas, renomear) sem anel de
  foco; abas sublinhadas removem o outline e não põem anel (`ui/tabs.tsx:131`).
- Linhas de tabela e cards com link sem hover, sem `cursor-pointer` e sem foco
  (`.../CompanySettingsList.tsx:64-69`, `.../CostSummaryView.tsx:132-133`);
  affordances só no hover (lápis de renomear `opacity-0 group-hover:opacity-100`,
  `.../ProcessEditor.tsx:604-623`, `AssemblyEditor.tsx:968-980`); botões
  invisíveis mas focáveis (`opacity-0`: `.../Financial.tsx:180,241,302`,
  `.../EditInstallments/index.tsx:344-346`; `w-0 overflow-hidden`:
  `.../DeliveryScheduleData.tsx:290-321`); `group-hover:` sem `group`
  (`.../IssueInvoice.tsx:258,306`).
- Movimento: 0 `motion-reduce`/`prefers-reduced-motion`; `transition-all` ×79
  animando largura e layout; sidebar e sheet em 500 ms
  (`SidebarComponent.tsx:211-351`, `ui/sheet.tsx:34`); erro de aba com
  `animate-pulse` (`.../NewCompanyInfo.tsx:195`); 600 ms artificiais depois de
  excluir (`.../FixedExpenses.tsx:165-180`).
- Hover gray-50 e selecionado gray-100 indistinguíveis em tabela (`ui/table.tsx:68`).

### 2.7 Componentes usados para a tarefa errada

- **Tabelas:** sem API numérica (298 `text-right` ad hoc), sem cabeçalho fixo,
  sem ordenação, sem densidade; duas paginações (`common/TablePagination.tsx`,
  URL, 28 arquivos; `TablePaginationControlled.tsx`, 1 arquivo, com "Proxima"
  sem acento) sem "1–20 de 340" nem tamanho de página; `href="#"` focável nos
  desabilitados; `<table>` cru com cabeçalho em caixa alta (CFOP, naturezas,
  cupons) e "tabelas" de `div` (`.../CreditLimitTab.tsx:68-108`,
  `.../CreditLimit.tsx:209-213`); `colSpan` errado em sete lugares; última
  página calculada no navegador como `total/10`.
- **Formulários:** `placeholder={label}` repete o rótulo (`common/form/FormInput.tsx:73`),
  "Digite aqui" em quase todo campo; `autoComplete="off"` por padrão quebra
  gerenciadores de senha (`:74`); sem API de obrigatório (0 `required`, 2 "\*"
  manuais, 12 "(opcional)"); rótulo fica vermelho no erro (`ui/form.tsx:100`);
  três estilos de desabilitado; dois motores de calendário (react-day-picker e
  react-aria) e quatro seletores de data; três implementações de campo em reais
  e `type="number"` com ponto decimal (`.../CashCountCheck.tsx:36-44`,
  `.../EditPriceModal.tsx:307-367`); `Switch` dentro de formulário salvo
  depois (`.../NewTransaction/index.tsx:339-342`, `.../CreditLimitTab.tsx:94-101`,
  `.../ScheduleDate/index.tsx:155-173`); `Select` com duas opções onde cabe
  segmentado (`.../NewItem/index.tsx:145-157`, `.../NewPaymentCondition/index.tsx:269-275`,
  `.../CfopFormModal.tsx:201`, `"1 - Saida"/"0 - Nao"` em `.../InvoiceEmissionConfigSection.tsx:248-249,407-408`);
  cards-rádio reinventados cinco vezes sem `role` (`ProposalPrint.tsx:147-170`,
  `ItemForm.tsx:112-124`, `QuotationProdDetailModal.tsx:541-556`,
  `QuickSaleSettingsForm.tsx:262-292`, `AccountDialog.tsx:212-239`,
  `CancelSubscriptionDialog.tsx:125-136`) com `common/radio-card.tsx` já
  existindo; `title=` nativo em 436 lugares em vez de Tooltip; `<input type=color>`
  cru; sliders somados a campos para o mesmo valor.
- **Sobreposições:** tudo é diálogo centralizado (0 Sheet); detalhe de 900 px
  que abre outros diálogos por cima; wizard de duas etapas sem indicador;
  8 abas roláveis dentro de um modal (`.../EmissorFormModal.tsx:393,424-430`);
  "Salvar" dentro de aba de modal que já tem "Salvar" (`.../CertificadoTab.tsx:189-198`);
  27 diálogos com `DialogDescription hidden`; sem guarda de alterações não
  salvas em nenhum dos 73 diálogos de configurações.
- **Feedback:** dois sistemas de aviso — `sonner` montado (249 arquivos) e o
  `use-toast` do shadcn não montado mas chamado em
  `configuracoes/produtos/components/ProductFiscalData/ProductStRules.tsx:26,125,157-177`
  (quatro avisos perdidos); erros somem sozinhos como sucessos; `ui/alert.tsx`
  sem variante info/sucesso e caixas amarelas feitas à mão (`.../DocumentosTabs.tsx:279`,
  `.../InutilizarNfceDialog.tsx:118-120`, `.../IssueInvoiceForm.tsx:713-721`);
  três padrões de estado vazio (`ui/empty-state.tsx` 8 usos, `TableEmptyState`
  58, ad hoc) mais parágrafos cinzas; `ui/spinner` 0 usos contra 43 spinners
  em linha e 21 "Carregando…"; esqueleto que não aparece sobre o fundo da página
  (`ui/skeleton.tsx` gray-100 sobre gray-100); esqueleto para sempre quando a
  requisição falha (`.../ProjectDetail.tsx:109`, `.../ProductionSheet.tsx:40`,
  `.../PricingSummaryView.tsx:53`, `.../ManagerBoard.tsx:89,262`); erro mostrado
  como "nenhum dado" (`dashboard/**` sem `isError`); um estado de carregamento
  compartilhado gira todos os botões da lista (`.../FinancialFlowData.tsx:457`,
  `.../InvoiceEntry.tsx:70,204-208`).
- **Camada "Figma DS" só no sandbox:** `ui/table-cells.tsx` (413 linhas),
  `ui/data-table.tsx`, `ui/status-tag.tsx` (hex e rótulos em inglês "Draft",
  "Ready for Dev"), `ui/resource-card.tsx`, `ui/list-item.tsx`,
  `common/form-input.tsx` (759 linhas, sem ref nem react-hook-form),
  `common/date-picker.tsx`, `common/nav-menu.tsx`.
- **Marcação interna de revisão em produção:** títulos pintados de azul ou
  vermelho por `review="new"|"todo"` (`common/Topbar.tsx:48-50,97-101`,
  `consts/revisao.ts`) em Estoque, Produção, Base de custos, Precificação,
  Patrimônios, composição e resultado de orçamento, hub financeiro; cards
  `ReviewTodo` visíveis (`.../DeliverySchedule.tsx:113-118`, `.../Materials.tsx:366-369`);
  legenda de revisão na sidebar (`SidebarComponent.tsx:581-598`).
- Código morto que alguém vai copiar: `QuickAccess`, `Revenues`, `Expenses`,
  `PeriodFilter`, `FiscalSetupModal` (703 linhas) no dashboard; `DatePicker.tsx`
  (react-aria), `OpenCashAction.tsx`, `EmitirTabsWrapper.tsx`,
  `ClientSearchSidebar.tsx`, `EmitNfeDialog.tsx`, `EmitNfseButton.tsx`,
  `GenericDialog.tsx`, `ToastVariant.tsx`, `TableRowNoResults.tsx`,
  `date-range-picker.tsx`, `alert-banner.tsx`, `GestaoNotasClient`; ~95 linhas
  de navegação comentada.

### 2.8 Navegação e cabeçalhos

- 0 breadcrumbs; voltar só por `previousPage` (45 usos); 79 das 112 páginas
  usam `Topbar`, o resto monta o cabeçalho à mão (`.../InvoiceFormHeader.tsx:93-120`,
  `.../IssueNfseForm.tsx:751-814`); o dashboard não tem título
  (`dashboard/components/Dashboard.tsx:95-101`).
- Rótulo do hub ≠ título da página ≠ URL: "Pagamentos" → "Condições de pagamento"
  em `configuracoes-de-pagamento/condicoes-de-pagamento`; "Bancos e contas" →
  "Contas bancárias"; "Dados do Emissor" → "Emissores de nota fiscal";
  "Setores" → "Configuração de setores"; "Séries de venda" → "Série de vendas";
  Materiais/Processos/Produtos sob "Cadastros" na sidebar mas em
  `/configuracoes/produtos/...` (`consts/nav.ts:276-299`); Cargos só alcançável
  por botão secundário de Colaboradores; hubs misturam "abre página" e "abre
  modal" atrás do mesmo botão.
- Páginas de detalhe sem cabeçalho de resumo: total, validade, status e cliente
  do orçamento dentro de cinco accordions fechados por padrão
  (`.../Quotation.tsx:203-238`, `.../Summary.tsx:164`, total em
  `.../PaymentConditions.tsx:175`, "Subtotal" ignorando o desconto em `:167`);
  ordem de serviço idem; cliente só com nome, PF/PJ e status
  (`cadastros/clientes/[id]/layout.tsx:94-108`); projeto com status escondido
  no card "Venda" (`.../ProjectDetail.tsx:186-206`); folha com o período como
  título e a pessoa como subtítulo (`.../PayrollDetail.tsx:93-94`).
- Abas de detalhe quebradas: "Cadastro" aponta para `/cadastro` mas a rota é
  `dados`, e a aba ativa nunca muda porque `params.tab` não existe
  (`cadastros/clientes/[id]/layout.tsx:109-114`, `cadastros/fornecedores/[id]/layout.tsx:95-101`).
- Três posições de abas (Topbar, pílulas no layout, dentro do `CardHeader`) e
  três convenções de contador (oculto no zero, sempre, "(n)" em texto); duas
  barras de abas idênticas como filtros lado a lado (`.../Comparison.tsx:95-120`).
- Sidebar: ativo por `pathname.includes` (substring), sem `aria-current`,
  grupo destacado quando aberto e não quando contém a rota ativa, subitens de
  12 px, chevron sempre verde, menu do celular sem `role=dialog`, sem foco preso
  nem Esc nem bloqueio de rolagem (`layout/MobileSidebar.tsx:187-226`), lógica
  de permissão duplicada e divergente entre desktop e celular
  (`MobileSidebar.tsx:95-166` vs `SidebarComponent.tsx:96-195`).
- Três telas de "sem permissão" (card com h3, `div p-4`, nada) e páginas que
  ficam em branco (`financeiro/fluxo-financeiro/page.tsx:16-19`); filtros do
  fluxo escondidos de quem só visualiza (`.../FinancialFlowFilter.tsx:102`).

### 2.9 O que está bom e fica

- Rampas completas do Untitled como variáveis CSS; abordagem `-fill` para
  sólidos no escuro; escala de fonte com alturas de linha corretas; sombras com
  valores do DS; `Input`/`Select`/data compartilham h-10, borda e foco;
  `ui/form.tsx` liga `aria-invalid` e `aria-describedby`.
- `Topbar` (voltar, badge, abas com contador) em 79 páginas, `TableSkeleton`
  em 50, `TableEmptyState` em 58 — adoção alta torna a correção barata.
- `ActionButton` sempre com Tooltip e `aria-label` nomeando o objeto
  ("Precificar {nome}"); `useAlertDialog` com texto de consequência; barras de
  seleção em massa fixas (`TransactionsData.tsx:420`, `InvoiceResultsTable.tsx:1538`).
- Menu "⋯" da NFC-e com rótulo, separadores e item destrutivo vermelho por
  último (`InvoiceResultsTable.tsx:1270-1391`) — é o padrão de ação por linha.
- Card de status da venda rápida (`QuickSaleCheckout.tsx:497-622`): manchete
  com badge, total em 3xl, trilha de etapas e uma única ação primária — é o
  padrão de cabeçalho de objeto.
- Tabelas de composição, resultado, DFC, financeiro e comissões alinham números
  à direita; `InvoiceItems.tsx:223-248` usa `tabular-nums`; DFC tem primeira
  coluna fixa.
- Padrão "título + descrição + controle" em `AccountDialog.tsx:340-360`,
  `QuickSaleSettingsForm.tsx:160-168` e nos cards de `AssetDetail` — é o
  modelo das páginas de configuração.
- Autosave com carimbo ("Salvo automaticamente às HH:MM",
  `AssemblyEditor.tsx:2474-2481`), aviso de alterações pendentes ao fechar e
  renomear em linha com Enter/Esc (`:943-960`).
- Sonner com ícones Tabler e tema; recolhimento da sidebar em cookie sem piscar;
  `ThemeToggleGroup` com hidratação; Pagination com rótulos em português e
  `aria-current`; `PermissionGate` nas ações; `ModeSelector` com `radiogroup`.
- Uma biblioteca de aviso (sonner) e uma de ícone (Tabler) dominam — a
  consolidação é remover exceções, não migrar.

## 3. Princípios

1. **Hierarquia antes de decoração.** Cada tela tem um título maior que tudo,
   um subtítulo menor que o corpo e, no máximo, uma ação primária visível.
2. **Uma coisa, um jeito.** Um botão secundário, um anel de foco, um estado
   vazio, um seletor de data, um campo de dinheiro, uma paginação, um menu de
   linha, um dicionário de status, um dicionário de ícones.
3. **A linha é a unidade.** Linha clicável abre o registro; uma ação em linha
   visível no máximo; o resto no menu "⋯". Nunca mais de dois ícones por linha.
4. **Cor tem significado.** Verde = sucesso ou ação primária; vermelho =
   destrutivo ou atrasado; amarelo = atenção; azul = informação ou em andamento;
   cinza = neutro, pendente, rascunho. Dinheiro é neutro. Nunca só a cor.
5. **Texto explica, ícone acompanha.** Ícone sozinho só em ações de linha e no
   cromo, sempre com nome acessível e dica.
6. **Denso, mas respirável.** É um ERP: linha de 44 px, grade de 4 px, cards
   agrupados, sem ar demais nem de menos.
7. **Todo estado existe.** Carregando (esqueleto com forma), vazio (com ação),
   sem resultado (com "limpar filtros"), erro (com tentar de novo), sem
   permissão (um componente só).
8. **Acessível por padrão.** Foco visível em tudo que é interativo, nome
   acessível em todo controle, contraste 4,5:1 em texto, 3:1 em ícones e
   bordas de controle, movimento reduzido respeitado.
9. **Página > painel lateral > diálogo.** O menor contêiner que cabe: diálogo
   para confirmar e criar coisas pequenas; Sheet para ver e editar um registro
   sem sair da lista; página para fluxos longos. Diálogo nunca abre diálogo.
10. **Só token.** Nenhum hexadecimal, nenhuma paleta padrão do Tailwind, nenhuma
    classe que não compila. Lint impede regressão.

## 4. Sistema-alvo

Decisões tomadas uma vez. Cada mudança implementa a sua fatia e não repete
este texto; detalha apenas o que é só dela.

### 4.1 Papéis tipográficos

Família Inter, `font-feature-settings: "tnum"` ligado em células numéricas e
KPIs. Tamanho mínimo 12 px. Caixa alta só no papel `eyebrow`.

| Papel           | Classe                                | Tamanho/linha | Peso | Cor            | Onde                                                                           |
| --------------- | ------------------------------------- | ------------- | ---- | -------------- | ------------------------------------------------------------------------------ |
| `page-title`    | `text-display-xs`                     | 24/32         | 600  | text-primary   | Topbar, uma vez por página                                                     |
| `page-subtitle` | `text-sm`                             | 14/20         | 400  | text-tertiary  | abaixo do título, `<p>`                                                        |
| `section-title` | `text-lg`                             | 18/28         | 600  | text-primary   | `h2` de seção de página                                                        |
| `card-title`    | `text-md`                             | 16/24         | 600  | text-primary   | `CardTitle`, cabeçalho de painel                                               |
| `dialog-title`  | `text-lg`                             | 18/28         | 600  | text-primary   | `DialogTitle`, `SheetTitle`                                                    |
| `object-title`  | `text-display-xs`                     | 24/32         | 600  | text-primary   | nome da entidade no cabeçalho de detalhe                                       |
| `kpi-value`     | `text-display-xs` + `tabular-nums`    | 24/32         | 600  | text-primary   | valor de KPI; herói `display-sm` 30/38                                         |
| `kpi-label`     | `text-sm`                             | 14/20         | 500  | text-tertiary  | rótulo de KPI                                                                  |
| `body`          | `text-sm`                             | 14/20         | 400  | text-secondary | corpo, células                                                                 |
| `body-strong`   | `text-sm`                             | 14/20         | 600  | text-primary   | identificador principal da linha                                               |
| `secondary`     | `text-sm`                             | 14/20         | 400  | text-tertiary  | linha de apoio na célula                                                       |
| `caption`       | `text-xs`                             | 12/18         | 400  | text-tertiary  | metadados, carimbos                                                            |
| `label`         | `text-sm`                             | 14/20         | 500  | text-secondary | rótulo de campo                                                                |
| `helper`        | `text-sm`                             | 14/20         | 400  | text-tertiary  | ajuda e erro (erro em text-error)                                              |
| `eyebrow`       | `text-xs uppercase tracking-[0.04em]` | 12/18         | 600  | text-tertiary  | único uso de caixa alta: cabeçalho de grupo em tabela e de seção em formulário |
| `table-header`  | `text-xs`                             | 12/18         | 500  | text-tertiary  | `TableHead`                                                                    |
| `nav-item`      | `text-sm`                             | 14/20         | 500  | text-secondary | sidebar (ativo 600 text-brand)                                                 |
| `nav-group`     | `eyebrow`                             | 12/18         | 600  | text-tertiary  | rótulo de seção da sidebar                                                     |

Primitivos: `Heading` (`as` + `size`) e `Text` (`variant`) em `ui/typography.tsx`;
`Topbar`, `CardTitle`, `DialogTitle`, `SheetTitle`, `TableHead`, `FormLabel`,
`FormDescription`, `FormMessage` passam a usar os papéis. Regra de lint:
`text-[Npx]` proibido; `uppercase` só via `eyebrow`.

### 4.2 Tokens semânticos e cor

Os tokens de rampa continuam (`--gray-500`…), mas passam a guardar canais
(`102 112 133`) e o Tailwind os mapeia com `rgb(var(--gray-500) / <alpha-value>)`
— isso devolve `/NN` a todas as cores. Sobre as rampas entra uma camada
semântica, a única que componentes e páginas usam:

| Token                                                                    | Claro                                                                  | Papel                                                   |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------- |
| `text-primary`                                                           | gray-900                                                               | títulos, identificadores                                |
| `text-secondary`                                                         | gray-700                                                               | corpo, rótulos                                          |
| `text-tertiary`                                                          | gray-600                                                               | apoio, legendas, cabeçalho de tabela                    |
| `text-placeholder`                                                       | gray-500                                                               | placeholder; nunca texto informativo                    |
| `text-disabled`                                                          | gray-400                                                               | só em controle desabilitado                             |
| `text-brand`                                                             | brand-700                                                              | links, item ativo                                       |
| `text-on-brand`                                                          | white                                                                  | texto sobre primária                                    |
| `bg-page`                                                                | gray-100                                                               | área de conteúdo (igual ao Figma)                       |
| `bg-surface`                                                             | white                                                                  | card, tabela, diálogo, sidebar                          |
| `bg-surface-subtle`                                                      | gray-50                                                                | cabeçalho de tabela, hover de linha, faixa de grupo     |
| `bg-surface-selected`                                                    | brand-25                                                               | linha e item de navegação selecionados                  |
| `border-default`                                                         | gray-200                                                               | divisórias, cards (vira o `DEFAULT`)                    |
| `border-strong`                                                          | gray-300                                                               | controles (input, select, botão secundário)             |
| `border-focus`                                                           | brand-300                                                              | borda de controle focado                                |
| `ring-focus`                                                             | brand-100 (4 px)                                                       | anel de foco único de todo o sistema                    |
| `scrim`                                                                  | gray-900 / 60 %                                                        | véu de diálogo e sheet                                  |
| `tone-{success,warning,error,info,neutral,brand}-{bg,border,text,solid}` | 50 / 200 / 700 / 600 das rampas (`blue` para info, `gray` para neutro) | status, alertas, badges, botões de tom                  |
| `chart-1…6`                                                              | brand-500, blue-500, warning-400, error-400, purple-500, gray-400      | séries; `chart-positive`/`chart-negative` para variação |

Os valores escuros destes tokens são definidos junto com `tema-claro-escuro`
(que já inverte as rampas); a camada semântica é o ponto de contato entre os
dois trabalhos, e por isso `cores-e-contraste` só começa quando o tema escuro
estiver arquivado.

**Dicionário de estados** (um lugar, `consts/status.ts`, consumido por badge,
tab e filtro; cada estado tem rótulo, tom e ícone):

| Tom     | Estados de domínio                                                                                   |
| ------- | ---------------------------------------------------------------------------------------------------- |
| success | pago, recebido, aprovado, autorizado/emitido, ativo, concluído, fechado (caixa/folha, estado normal) |
| neutral | pendente, rascunho, em aberto, não realizado, inativo, arquivado                                     |
| warning | provisionado, parcial, aguardando aprovação, reaberto, vence hoje, contingência                      |
| error   | atrasado, vencido, rejeitado, cancelado, bloqueado, inutilizado                                      |
| info    | em andamento, em digitação, enviado, processando                                                     |

Dinheiro: cor neutra (`text-primary`) por padrão; negativo em `tone-error-text`
com sinal; verde só em variação positiva lado a lado com a negativa. Descontos
não são "aviso". Resultado negativo nunca é verde.

Contraste: texto ≥ 4,5:1, ícones e bordas de controle ≥ 3:1; `text-gray-300`
e `text-gray-400` deixam de ser usados em texto; links em `text-brand`.
Desabilitado: `bg-gray-50 border-gray-200 text-gray-400` para controles com
fundo; `text-gray-400` para ghost e link (sem caixa).

Faixa "Super Admin" do Topbar vira `tone="admin"` em `orange-600` com texto
branco (≥ 4,5:1). Cor de gráfico só por token; legenda lê o mesmo token da
série. Nenhum hexadecimal fora de `globals.css`; regra de lint
`no-restricted-syntax` para `#[0-9a-f]{6}` em `className` e para classes das
paletas padrão (`red-`, `amber-`, `emerald-`, `blue-`…, exceto via tokens).

### 4.3 Botões e hierarquia de ação

Um sistema de 4 níveis × 2 tons, mais link:

| Variante                                                         | Visual                                                                                        | Uso                                                          |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `primary`                                                        | brand-600, texto branco, hover brand-700, active brand-800                                    | a ação principal da tela (no máximo uma visível por região)  |
| `secondary`                                                      | surface, borda 1 px border-strong, texto text-secondary, `shadow-xs`, hover bg-surface-subtle | todas as outras ações com rótulo                             |
| `tertiary`                                                       | sem borda, texto text-secondary, hover bg-surface-subtle                                      | ações em linha, barras de ferramentas, "Cancelar" de diálogo |
| `link`                                                           | texto text-brand, sublinhado no hover                                                         | navegação em texto                                           |
| `destructive` / `destructive-secondary` / `destructive-tertiary` | tons error                                                                                    | excluir, cancelar objeto, inativar                           |

Tamanhos `sm` 32 / `md` 36 (padrão) / `lg` 40 / `xl` 44 (só autenticação e
checkout), texto `text-sm` em todos; ícone 16 no `sm`, 20 nos demais; versão
`icon` quadrada em cada tamanho. Carregando mantém a largura (spinner
sobreposto), `aria-busy`, sem trocar o texto por "Salvando…". Desabilitado
por variante (4.2). Foco: `ring-focus`. Ícone à esquerda por padrão; à direita
só em "Avançar →" de wizard. Sem ícone de check em confirmações.

As variantes legadas (`default`, `outline`, `light`, `ghost`, `neutral*`,
`success*`, `warning*`, `error*`, `glass*`, `none`, `raw`, `input*`) saem por
codemod: `default`/`primary` → `primary`; `neutralOutline`/`outline`/
`secondary*`/`*Outline` → `secondary`; `neutralGhost`/`ghost`/`*Ghost`/`link`
em contexto de ação → `tertiary`; `error`/`destructive` → `destructive`;
`errorOutline`/`errorGhost`/`errorLight` → `destructive-secondary`/`-tertiary`;
`success*`/`warning*`/`*Light` → `secondary` + ícone de tom quando o tom
importava. `CustomButton` (azulejo de 70 px) deixa de ser botão de ação:
vira `ChoiceCard` nos poucos lugares em que é escolha.

**Ação por linha** (`RowActions`): a linha inteira abre o registro (hover
`bg-surface-subtle`, `cursor-pointer`, foco visível, Enter abre); no máximo
uma ação em linha visível (`tertiary icon` 32 px com Tooltip e `aria-label`),
o resto num `DropdownMenu` "⋯" com rótulos, separadores e destrutivo em
vermelho por último. Checkbox de seleção só quando há ação em massa, com
barra de seleção neutra (o botão destrutivo é vermelho, a barra não).

**Ação de página** (`PageHeader`): até uma `primary`, até duas `secondary`
com rótulo e um menu "Mais ações" para o resto; destrutivo nunca no cabeçalho
de detalhe, só no menu ou numa seção "Zona de risco" no fim.

**Vocabulário** (`consts/acoes.ts` para os rótulos compartilhados):

| Gesto                         | Rótulo                                                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| criar                         | "Novo <objeto>" (botão de página), "Adicionar <objeto>" (dentro de um formulário/lista)                                     |
| gravar                        | "Salvar" ("Salvar e continuar" só em wizard)                                                                                |
| sair sem gravar               | "Cancelar" (diálogo e formulário); "Fechar" só em diálogo de leitura; "Voltar" só entre etapas                              |
| apagar de vez                 | "Excluir <objeto>" + confirmação destrutiva                                                                                 |
| tirar de uma lista sem apagar | "Remover"                                                                                                                   |
| desativar / reativar          | "Inativar" / "Reativar"                                                                                                     |
| confirmar ação destrutiva     | verbo + objeto ("Cancelar venda", "Excluir cliente"); o botão de desistir é "Manter <objeto>" ou "Voltar", nunca "Cancelar" |
| importar / exportar           | "Importar <objeto>" / "Exportar" (menu PDF/Excel)                                                                           |
| configurar em hub             | nenhum botão: a linha é o link, com chevron                                                                                 |

Confirmações: `ConfirmDialog` com `tone="destructive"` (ícone de alerta em
`tone-error`, botão `destructive`) ou `tone="default"` (sem triângulo de
aviso para aprovar, reabrir, concluir); descrição sempre diz a consequência
("Os 3 orçamentos deste cliente continuam no histórico").

### 4.4 Espaçamento, layout e contêineres

Grade de 4 px. Tokens: `space-1` 4, `-2` 8, `-3` 12, `-4` 16, `-5` 20, `-6`
24, `-8` 32, `-10` 40, `-12` 48.

| Lugar                                | Valor                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------- |
| gutter da área de conteúdo           | 24 (todos os lados; `scrollbar-gutter` sai do global e vai só para `main`) |
| entre seções de página               | 24                                                                         |
| entre cabeçalho da página e conteúdo | 20                                                                         |
| padding de card                      | 20 (conteúdo) / 16 (cabeçalho compacto)                                    |
| entre cards de uma grade             | 16                                                                         |
| pilha de campos                      | 16; entre grupos de campos 32 com `eyebrow`                                |
| gap em linha (botões, chips)         | 8                                                                          |
| linha de tabela                      | 44 (`py-2.5 px-4`); `density="compact"` 36; cabeçalho 40                   |
| padding de diálogo                   | 24; rodapé 16/24                                                           |
| sidebar                              | 264 expandida / 64 recolhida; item 36 de altura; sem régua por item        |

Diálogos ganham `size`: `sm` 400 (confirmação), `md` 560 (formulário curto,
padrão), `lg` 720 (formulário em duas colunas), `xl` 960 (tabelas), `full`.
`Sheet` ganha `size`: `md` 480, `lg` 640, `xl` 800. Qualquer `max-w-[…]`
em `DialogContent` é proibido por lint. Raios: `control` 8 (botão, input,
chip), `container` 12 (card, diálogo, sheet, menu), `pill` 9999 (badge,
avatar). `rounded`/`-md`/`-2xl`/`[10px]` saem.

Formulários: grade de 12 colunas (`FormGrid`), campos `col-span-12|6|4|3`;
sem `flex-[1_0_250px]`, sem `<div/>` vazio, sem `leading-[44px]`; endereço na
ordem CEP → Rua → Número → Complemento → Bairro → Cidade/UF. Estados vazios
dimensionam pelo conteúdo (`py-12`), nunca pela janela.

### 4.5 Ícones

Uma biblioteca: Tabler (os primitivos do kit trocam o Lucide; `LucideIcon.tsx`
e `components/LucideIcon` saem). Tamanhos por token: `icon-sm` 16 (texto em
linha, botão `sm`, chips), `icon-md` 20 (botões `md`/`lg`, ações de linha,
inputs, menus), `icon-lg` 24 (sidebar, cabeçalhos, estados vazios); `stroke`
2 até 20 e 1,5 em 24+. Componente `Icon` aplica tamanho por contexto e
`aria-hidden` quando decorativo. `CustomIcons` se divide em pictogramas de
domínio (tamanho fluido, `currentColor`) e logos de bancos/pagamento
(`assets/logos/`, nunca "ícone"). `FeaturedIcon` fica com 3 tamanhos × 6 tons
e é usado em estados vazios, confirmações e onboarding — não em cabeçalhos de
diálogo.

Dicionário (um glifo, um gesto; `consts/icones.ts`):

| Gesto                                            | Ícone                                                                                          |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| abrir/ver                                        | `IconEye` (nunca a lupa)                                                                       |
| buscar                                           | `IconSearch` (só em campo de busca)                                                            |
| editar                                           | `IconPencil`                                                                                   |
| excluir                                          | `IconTrash`                                                                                    |
| inativar/reativar                                | `IconBan` / `IconRotateClockwise`                                                              |
| cancelar (venda, adiantamento, movimentação)     | `IconBan` (não apaga, então não é lixeira)                                                     |
| duplicar                                         | `IconCopy`                                                                                     |
| histórico                                        | `IconHistory`                                                                                  |
| imprimir                                         | `IconPrinter` (só imprime)                                                                     |
| exportar / importar                              | `IconDownload` / `IconUpload`                                                                  |
| emitir NF                                        | `IconSend`; ver NF `IconFileInvoice`; consultar status `IconRefresh`; reprocessar `IconRepeat` |
| navegar para ficha/documento                     | `IconFileText` + chevron                                                                       |
| receber / pagar                                  | no financeiro, polegar para cima / para baixo (a "mãozinha" do legado, decisão do produto de 23/10/2026); no PDV, `IconCash` |
| faturar                                          | `IconReceipt`; editar parcelas `IconCalendarDollar`                                            |
| menu de linha                                    | `IconDotsVertical`                                                                             |
| novo                                             | `IconPlus`                                                                                     |
| avançar / voltar                                 | `IconChevronRight` / `IconArrowLeft`                                                           |
| observação                                       | `IconNote`; anexo `IconPaperclip`                                                              |
| erro / aviso / sucesso / info (avisos e alertas) | `IconCircleX` / `IconAlertTriangle` / `IconCircleCheck` / `IconInfoCircle`                     |

### 4.6 Interação e movimento

- **Hover** em tudo que é clicável: linha → `bg-surface-subtle`; card-link →
  `border-strong` + `shadow-sm` + chevron; link → sublinhado; botão por
  variante. `cursor-pointer` só em interativo e sempre que interativo.
- **Foco:** um único `ring-focus` (4 px brand-100 + `border-focus`) via
  `focus-visible:`; nunca `focus:`; nunca `outline-none` sem anel; abas,
  cards-rádio, chips, linhas e itens de menu incluídos; elementos `opacity-0`
  ou `w-0` saem do DOM ou ganham `inert`.
- **Affordance nunca só no hover:** lápis de renomear sempre visível em
  `tertiary`; dicas em qualquer ícone sozinho.
- **Movimento:** tokens `--motion-fast` 100 ms (hover de cor), `--motion-base`
  150 ms (botão, input, chevron), `--motion-slow` 250 ms (sheet, diálogo,
  sidebar, accordion), `ease-out` na entrada e `ease-in` na saída; animam-se
  cor, opacidade, transformação e sombra — nunca `transition-all`, largura ou
  altura (exceto accordion por `height` do Radix). `@media (prefers-reduced-motion)`
  zera durações e o pulso do esqueleto. Sem `animate-pulse` em erro de
  validação; sem esperas artificiais.
- **Carregamento:** esqueleto com a forma do conteúdo para página, tabela e
  cards (`aria-busy`); spinner só dentro de botão ou ao lado de texto curto;
  "Carregando…" sozinho não existe. Carregamento por item, nunca estado
  compartilhado que gira a lista toda.
- **Avisos:** só sonner; sucesso 4 s; erro 8 s com botão de fechar e, quando
  bloqueia a tarefa, `Alert` fixo na tela em vez de aviso; ícones por tom do
  dicionário de 4.5; `use-toast`, `toaster.tsx` e `ToastVariant` saem.
- **Alterações não salvas:** formulários em diálogo/sheet avisam antes de
  fechar com `isDirty`; páginas de edição longa usam barra de salvar fixa
  ("Você tem alterações não salvas · Descartar · Salvar") ou autosave com
  carimbo, nunca os dois.

### 4.7 Componentes adequados à tarefa

| Tarefa                                                      | Componente                                                                                                                                                                                                                                                             | Em vez de                                                           |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| listar registros                                            | `Table` com `density`, `numeric` em `TableHead`/`TableCell` (direita + `tabular-nums`), `sticky` opcional, `sortable` com `aria-sort`, seleção, `Pagination` única com "1–20 de 340", tamanho de página e estados embutidos (`loading`, `empty`, `error`, `noResults`) | `<table>` cru, "tabelas" de div, duas paginações, `colSpan` manual  |
| ação em linha                                               | `RowActions` (4.3)                                                                                                                                                                                                                                                     | 3–8 ícones por linha                                                |
| cabeçalho de página                                         | `PageHeader` (breadcrumb ou voltar, título, subtítulo, status, metadados, ações, abas)                                                                                                                                                                                 | Topbar com `label`, cabeçalhos à mão                                |
| cabeçalho de detalhe                                        | `ObjectHeader` (nome, status, 3–5 números-chave sempre visíveis, ações)                                                                                                                                                                                                | accordions fechados com o total escondido                           |
| hub de configurações                                        | `SettingsList` (grupo em um card, linha = link com ícone, título, descrição, chevron, badge de estado)                                                                                                                                                                 | card por linha + botão "Configurar"                                 |
| página de configuração                                      | `SettingsSection` (título + descrição + controle; salvar em barra fixa ou autosave)                                                                                                                                                                                    | formulário solto em diálogo                                         |
| ver/editar um registro sem sair da lista                    | `Sheet` (`size`)                                                                                                                                                                                                                                                       | diálogo de 900 px que abre diálogos                                 |
| fluxo longo (NF, cadastro completo, condições de pagamento) | página com `SectionNav` lateral e resumo fixo, ou wizard com `Stepper`                                                                                                                                                                                                 | diálogo com 8 abas, duas etapas sem indicador                       |
| confirmar                                                   | `ConfirmDialog` com `tone`                                                                                                                                                                                                                                             | AlertDialog verde, `bg-red-600`, nada                               |
| escolher entre 2–4 opções                                   | `SegmentedControl` (ou `RadioCard` quando precisa de descrição)                                                                                                                                                                                                        | `Select` com 2 opções, botões coloridos como toggle, `<button>` cru |
| ligar algo com efeito imediato                              | `Switch` (com rótulo e feedback "Salvo")                                                                                                                                                                                                                               | Switch dentro de formulário salvo depois → `Checkbox`               |
| data                                                        | `DatePicker` único (react-day-picker, campo digitável, presets) e `DateRangePicker` com presets                                                                                                                                                                        | 4 seletores, `input type=date`                                      |
| dinheiro / percentual                                       | `MoneyInput` e `PercentInput` únicos (máscara pt-BR, `inputMode=decimal`)                                                                                                                                                                                              | 3 máscaras, `type=number`                                           |
| dica                                                        | `Tooltip`                                                                                                                                                                                                                                                              | `title=`                                                            |
| status                                                      | `Badge` do dicionário (`StatusBadge status="OVERDUE"`)                                                                                                                                                                                                                 | badge ad hoc, polegares, pontos coloridos, enum cru                 |
| aviso na tela                                               | `Alert` (`info`, `success`, `warning`, `error`) e `Banner` de topo                                                                                                                                                                                                     | caixas amarelas à mão                                               |
| vazio / sem resultado / erro / sem permissão                | `EmptyState` (`kind="empty\|no-results\|error\|forbidden"`) com ação                                                                                                                                                                                                   | três padrões + parágrafos cinzas                                    |
| cor de etiqueta definida pelo usuário                       | `ColorPicker` com paleta e texto calculado por contraste                                                                                                                                                                                                               | `<input type=color>` + `text-white`                                 |
| navegação entre sub-rotas                                   | `Tabs` de link no `PageHeader` (contador só quando > 0), nunca dentro de `CardHeader`                                                                                                                                                                                  | abas em três lugares                                                |
| caminho                                                     | `Breadcrumb`                                                                                                                                                                                                                                                           | nada                                                                |

### 4.8 Navegação e cabeçalhos

- `PageHeader` em 100 % das páginas: breadcrumb (módulo › página › registro)
  quando há mais de um nível, senão nada; título `page-title`; subtítulo
  `page-subtitle`; `StatusBadge` e metadados quando é detalhe; ações (4.3);
  abas de sub-rota abaixo. Título do documento = "Página · Módulo · Atrupe".
- Sidebar 264 px com rótulos de seção (`eyebrow`), item 36 px, ícone 20,
  ativo por segmento de rota com `aria-current="page"`, grupo pai marcado
  quando contém a rota ativa, chevron neutro, recolhida 64 px com flyout por
  grupo, transição 150 ms, conta do usuário no rodapé, logo em 56 px.
- Celular: `Sheet` lateral (`role=dialog`, foco preso, Esc, rolagem
  bloqueada) e cabeçalho com título da página e voltar; uma única lógica de
  permissão compartilhada.
- Rótulo do item de navegação = título da página = último segmento da URL
  (tabela de renomeações em `navegacao-e-cabecalhos`).
- Sem permissão: `EmptyState kind="forbidden"` com quem pedir; página nunca
  em branco. 404 e erro de carregamento com ação.
- Marcação de revisão (`review`, `ReviewTodo`, legenda) sai do produto; vive só
  em `/sandbox`.

## 5. Mapa de mudanças

| Onda | Mudança                            | Entrega                                                                                                                                                                                           | Depende de                                                               |
| ---- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 0    | `tema-claro-escuro` (em andamento) | tokens escuros e seletor                                                                                                                                                                          | —                                                                        |
| 1    | `cores-e-contraste`                | canais + `<alpha-value>`, camada semântica, dicionário de estados, dinheiro neutro, contraste, gráficos, lint de hex/paleta                                                                       | `tema-claro-escuro` (mesmos arquivos `globals.css`/`tailwind.config.ts`) |
| 1    | `tipografia-e-hierarquia`          | papéis, `Heading`/`Text`, Topbar/Card/Dialog/Table/Form nos papéis, eyebrow, mínimo 12 px, títulos de aba                                                                                         | — (toca classes, não tokens de cor)                                      |
| 1    | `icones`                           | Tabler único, tokens de tamanho, `Icon`, dicionário de glifos, `FeaturedIcon` enxuto, logos separados                                                                                             | —                                                                        |
| 2    | `botoes-e-acoes`                   | sistema de 4 níveis, codemod de variantes, `RowActions`, `ConfirmDialog`, vocabulário, fim do "Configurar" repetido                                                                               | `cores-e-contraste`, `icones`                                            |
| 2    | `espacamento-e-layout`             | grade e tokens de espaço, densidade de tabela, `size` em Dialog/Sheet, raios, `FormGrid`, gutter, sidebar 264                                                                                     | `tipografia-e-hierarquia`                                                |
| 2    | `interacao-e-movimento`            | hover/foco únicos, tokens de movimento, reduced-motion, política de carregamento e avisos, guarda de não salvo                                                                                    | `cores-e-contraste` (ring e scrim)                                       |
| 2    | `componentes-adequados`            | `Table` com API, paginação única, `Sheet`, `SegmentedControl`, `RadioCard`, `DatePicker`/`MoneyInput` únicos, `StatusBadge`, `Alert`/`EmptyState` únicos, `Breadcrumb`, Tooltip em vez de `title` | `botoes-e-acoes`, `espacamento-e-layout`                                 |
| 2    | `navegacao-e-cabecalhos`           | `PageHeader`, `ObjectHeader`, sidebar e menu móvel, renomeações, sem permissão, fim da marcação de revisão                                                                                        | `tipografia-e-hierarquia`, `componentes-adequados` (Breadcrumb)          |
| 3    | `telas-configuracoes`              | hubs como lista, páginas em vez de modal, NF no DS, modelos de salvar                                                                                                                             | `navegacao-e-cabecalhos`, `componentes-adequados`                        |
| 3    | `telas-vendas`                     | listas, detalhe com `ObjectHeader`, diálogos redimensionados, composição                                                                                                                          | `navegacao-e-cabecalhos`, `componentes-adequados`                        |
| 3    | `telas-financeiro-e-caixa`         | status único, dinheiro, ações de linha, PDV, caixa, folha                                                                                                                                         | idem                                                                     |
| 3    | `telas-nota-fiscal`                | emissão como página com seções, lista única, tokens                                                                                                                                               | idem                                                                     |
| 3    | `telas-cadastros-producao-custos`  | abas de detalhe, formulários, kanban, agenda, estoque, custos, precificação                                                                                                                       | idem                                                                     |
| 3    | `telas-dashboard-e-relatorios`     | título e hierarquia de KPIs, gráficos por token, filtros, estados                                                                                                                                 | idem                                                                     |

As arestas e as ondas vivem em `design/openspec/in-flight.md`; aqui só a
razão: a onda 1 muda o que todas as telas herdam sem tocar nas telas; a onda
2 cria os componentes que a onda 3 usa; a onda 3 é por módulo para caber em
PRs revisáveis e ser paralelizável entre pessoas.

## 6. Como verificar

- **Captura de telas:** `e2e/ui/capturas.spec.ts` (criado em
  `tipografia-e-hierarquia`) percorre todas as rotas estáticas com a conta de
  teste, salva PNG 1440×900 e um `audit.json` com: tamanhos de fonte visíveis
  por página, cabeçalhos com tamanho/peso, botões repetidos, botões sem nome
  acessível, `title=` nativo, altura das linhas de tabela, tamanhos de SVG.
  Serve de "antes/depois" de cada onda.
- **Lint:** regras de `className` (hex, paleta padrão, `text-[Npx]`,
  `max-w-[…]` em `DialogContent`, `transition-all`, `title=` em botão,
  `uppercase` fora de `eyebrow`); `eslint-plugin-jsx-a11y` em erro para
  `control-has-associated-label`, `click-events-have-key-events`,
  `no-noninteractive-element-interactions`.
- **Contraste:** `axe-core` no Playwright em cada rota capturada
  (`color-contrast`, `button-name`, `link-name`, `focus-order-semantics`).
- **Tokens que não compilam:** teste que compara as classes usadas em `src/`
  com as geradas no CSS de produção e falha em classe desconhecida.
- **Revisão visual:** `/sandbox/sistema` (vitrine) com todos os papéis
  tipográficos, tons, botões, tabela, cabeçalhos e estados lado a lado, no
  claro e no escuro.

## 7. Fora de escopo

- Regras de negócio, fluxos e permissões (repositório `atrupe-regras`). Os
  defeitos funcionais encontrados pela auditoria (aba de cliente apontando para
  rota inexistente, "hoje" em UTC, mesma chamada duas vezes no dashboard,
  `Subtotal` ignorando desconto, botões sem `onClick`) entram nas mudanças de
  tela apenas quando a correção é de interface; os demais vão como lista de
  "achados fora de escopo" no `proposal.md` da mudança para o outro OpenSpec
  decidir.
- O tema escuro em si (`tema-claro-escuro`). Esta arquitetura só define os
  tokens semânticos sobre os quais o escuro passa a ser expresso.
- Telas de `/sandbox` e `/admin` além da faixa de cor e dos tokens.
- Conteúdo e redação de ajuda, vídeos, Academy.
