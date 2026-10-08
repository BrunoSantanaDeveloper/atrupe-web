## 1. Base

- [x] 1.1 `tailwind.config.ts`: `spacing`/`size` tokens `icon-sm` 16,
      `icon-md` 20, `icon-lg` 24
      → Feito: `size-icon-sm|md|lg` gerados por `iconSpacing` de `src/lib/icon-sizes.ts`, a mesma fonte do `Icon` (o botão usa as classes).
- [x] 1.2 `src/components/ui/icon.tsx`: `Icon` (`icon`, `size="sm|md|lg"`,
      `label?`, `className`) com traço por tamanho e `aria-hidden` quando sem
      `label`
      → Feito: `src/components/ui/icon.tsx`; teste `e2e/ui/icones.spec.ts` confere 16/20/24 e traço 1,5 no grande.
- [x] 1.3 `src/consts/icones.ts`: `ICONE` com os gestos da tabela §4.5 e o
      tipo `Gesto`
      → Feito, com um gesto a mais: `cancelar` (`IconBan`) para venda, adiantamento e movimentação, que não apagam e por isso não usam a lixeira; tabela §4.5 atualizada.
- [x] 1.4 Vitrine `/sandbox/icones`: os três tamanhos em botão, célula, menu,
      sidebar e estado vazio; o dicionário com nome do gesto; pictogramas e
      logos
      → Feito: `/sandbox/icones`.
- [x] 1.5 `ui/button.tsx`: envolver `LeftIcon`/`RightIcon` e o spinner com
      `Icon` no tamanho do `size` (`sm`→sm, demais→md); remover
      `leftIconSize`/`rightIconSize` (3 chamadas) e `LoaderCircle` (Lucide →
      `IconLoader2`)
      → Feito com desvio: o botão força o tamanho do SVG por classe (`[&_svg]:size-icon-*`) e passa `size`/`stroke` ao `LeftIcon`/`RightIcon`/spinner, sem embrulhar em `Icon`; mesmo resultado e vale para ícone passado como filho. `leftIconSize`/`rightIconSize` e `LoaderCircle` saíram.
- [x] 1.6 `common/ActionButton.tsx`: ícone `md` em botão e em link; aceitar
      `gesto` além de `icon`
      → Feito: `gesto` ou `Icon`; link com `target=_blank` só em `newTab`, com `rel`.

## 2. Kit sai do Lucide

- [x] 2.1 Migrar para Tabler: `ui/select.tsx` (`Check`, `ChevronDown`,
      `ChevronUp`), `ui/accordion.tsx`, `ui/dropdown-menu.tsx`,
      `ui/checkbox.tsx`, `ui/calendar.tsx`, `ui/calendar-rac.tsx`,
      `ui/sheet.tsx` (`X` → `IconX`, rótulo "Fechar"), `ui/command.tsx`,
      `ui/pagination.tsx`, `ui/input-otp.tsx`, `ui/toast.tsx` (sai em
      `interacao-e-movimento`), `ui/radio-group.tsx`, `ui/hover-card.tsx`,
      `ui/drawer.tsx`, `ui/file-uploader.tsx`
      → Feito: 32 importações migradas com alias; rótulo "Fechar" na gaveta.
- [x] 2.2 `layout/UserDropdown.tsx:31`, `common/TabsNavigation.tsx` +
      `components/LucideIcon.tsx`: `TabNavType.icon` passa a componente
      Tabler; apagar `LucideIcon.tsx`; atualizar os consumidores
      (`cadastros/clientes/[id]/layout.tsx`, `fornecedores/[id]/layout.tsx`,
      `base-de-custos/layout.tsx`, `precificacao/layout.tsx`, `relatorios`)
      → Feito com desvio: `TabsNavigation` e `LucideIcon` não tinham consumidor e foram apagados em vez de migrados.
- [x] 2.3 `grep -rl "lucide-react" src` vazio; remover a dependência do
      `package.json`; lint `no-restricted-imports` para `lucide-react`
      → Feito: `grep lucide src` vazio, dependência fora do `package.json`, lint `no-restricted-imports` provado com arquivo de teste.

## 3. Tamanhos por contexto

- [x] 3.1 Codemod `icon-size`: em JSX de ícone Tabler (`<Icon[A-Z]\w+`),
      trocar `size={N}` / `className="h-N w-N|size-N"` por `<Icon size=…>`
      segundo o contêiner: dentro de `Button size="sm"|"iconSm"|"iconXs"` →
      `sm`; `TableCell`, `DropdownMenuItem`, `Input` adornment, `Badge` →
      `sm` em badge e `md` nos demais; `SidebarComponent`, `Topbar`,
      `EmptyState`, `FeaturedIcon` → `lg`; sem contexto → `md`
      → Feito com desvio na heurística: Button pelo `size` do botão, Badge `sm`, item de menu `md`, FeaturedIcon intocado; fora desses contextos o tamanho atual arredonda ao token mais próximo (não `TableCell`→`md` nem sidebar→`lg`). 418 ícones em 169 arquivos. As 33 ilustrações de 28–64 px foram tratadas uma a uma: spinners a 24 px, círculos feitos à mão e estados vazios viram `FeaturedIcon lg`, ícones de linha e de upload a 24 px. Exceções comentadas: play do vídeo, ponto do radio, ponto de etiqueta e marca do `FormToggleCard`.
- [x] 3.2 `layout/SidebarComponent.tsx:355-362,503`, `MobileSidebar.tsx:279`:
      ícones de módulo e de subitem ambos `lg`/`md` conforme §4.8 (módulo 20,
      subitem 20); item Academy sem SVG 34×34 nem `iconColor`
      → Feito: módulo e subitem a 20 px (§4.8) nas duas barras, inclusive pictogramas, via `IconComponent size`; Start da Academy com `IconRocket` e sem `iconColor`.
- [x] 3.3 `common/Topbar.tsx:91`, `ui/dialog.tsx:50`, `ui/sheet.tsx:68`:
      ícone de voltar e de fechar em `md` com alvo de 36 px
      → Feito: Topbar já ganhava 20 px do botão de ícone; X de diálogo e gaveta a 20 px num alvo de 36 px.
- [x] 3.4 `strokeWidth`/`stroke-1` manuais (`PartialBlockAlert.tsx:32` e
      demais `grep -rn "strokeWidth\|stroke-1"`) → removidos (o `Icon` define)
      → Feito nos ícones Tabler; o que resta de `strokeWidth` está em caminhos de SVG desenhados à mão (ilustrações, gráficos) e na marca do checkbox.
- [x] 3.5 Lint: `size={\d+}` em componente `Icon[A-Z]` proibido fora de
      `ui/icon.tsx`
      → Feito: `no-restricted-syntax` recusa `size={N}` e `h-N`/`w-N`/`size-N` em `Icon*`; zero violações; provado com arquivo de teste.

## 4. Dicionário aplicado (glifos ambíguos)

- [x] 4.1 Lupa → olho/linha clicável: `cadastros/clientes/components/ClientsTable/ClientsData.tsx:232`,
      `cadastros/fornecedores/.../SuppliersData.tsx:117`,
      `producao/projetos/components/Projects.tsx:108`,
      `vendas/ordens-de-servico/.../OrdersData.tsx:337`,
      `financeiro/.../TransactionsData.tsx` (detalhes),
      `financeiro/controle-de-caixa/components/CashControl.tsx:468-471`
      (apagar a frase "abre na lupa"), `CashDayDetail.tsx:158`
      (`FeaturedIcon` do relatório → `IconReportMoney`); "Consultar dados de
      cliente" (`Clients.tsx:175-205`) → `IconId` com rótulo
      → Feito, mais a agenda de entrega ("Ver ordem de serviço"). "Consultar dados de cliente" virou botão com rótulo "Consultar CPF/CNPJ" e `IconId`.
- [x] 4.2 Impressora só imprime: `producao/projetos/[id]/components/ProjectDetail.tsx:158-162`
      ("Ficha de produção" → `IconFileText` + chevron);
      `vendas/ordens-de-servico/.../OrdersData.tsx:344-366` ("Via do cliente"
      impressora, "Ficha de produção" documento); `relatorios/**/print/*PrintButton.tsx`
      → `IconDownload` "Exportar"
      → Feito: os sete botões de relatório eram só ícone e sem nome; viraram "Exportar" com rótulo.
- [x] 4.3 Nota fiscal: `OrdersData.tsx:383-429` (`IconFileInvoice` ver DANFE,
      `IconSend` emitir); `nota-fiscal/emitir/components/InvoiceResultsTable.tsx:1355,1367`
      (`IconRefresh` consultar SEFAZ, `IconRepeat` reprocessar), `:1500,1519`
      (emitir = `IconSend` com rótulo em `botoes-e-acoes`)
      → Feito; "Consolidar em NF-e/NFS-e" também usa `IconSend`.
- [x] 4.4 Financeiro: `producao/agenda-de-entrega/.../DeliveryScheduleData.tsx:336,355`
      e `financeiro/frente-de-caixa/components/PDV.tsx:417` (`IconReceipt`
      faturar, `IconCalendarDollar` editar parcelas); polegares de
      `consts/receivables.ts` → `IconCash`/`IconCashBanknoteOff`;
      `PDV.tsx:424,633` (cancelar venda `IconBan`, descartar `IconTrash`)
      → Feito; polegares saíram também dos diálogos de pagamento e dos totais do fluxo; status cancelado usa `IconBan`.
- [x] 4.5 Lixeira só exclui: `configuracoes/financeiro/contas-bancarias/components/BankAccounts.tsx:234-241`
      (inativar → `IconBan`); `configuracoes/financeiro/folhas-de-pagamento/.../PayrollItems.tsx:282-298`
      (cancelar adiantamento → `IconBan`); `configuracoes/vendas/series-de-venda/components/Main.tsx:133-176`
      (eraser → `IconTrash` com tom destrutivo)
      → Feito.
- [x] 4.6 Diversos: `financeiro/despesas-fixas/components/FixedExpenses.tsx:98-99`
      (`IconPackageOff` → `IconReceipt2`); `financeiro/controle-de-caixa/components/CashControl.tsx:623,631`
      (fechar caixa `IconLock`, lançar ajuste `IconAdjustments`);
      `configuracoes/.../CompanyInfo/index.tsx:101`, `NewCompanyInfo.tsx:211`
      (`IconBuilding` como o hub); `base-de-custos/despesas-administrativas/components/SummaryCards.tsx:48`
      (`IconCurrencyReal`); `vendas/.../OrderItems.tsx:276` (`IconCurrencyReal`
      como em `QuotationItems`); `consts/nav.ts:436-437` (Produção
      configurações ≠ Processos); `cadastros/.../NewClient/index.tsx:340`
      (lápis em modo edição)
      → Feito; configuração de Produção com `IconBuildingFactory2`.
- [x] 4.7 `vendas/orcamentos/.../QuotationsData.tsx:270,278`: "⚡" →
      `Badge` "Venda rápida" com `IconBolt`
      → Feito: `QuickSaleBadge` fora do trecho truncado.
- [x] 4.8 `configuracoes/nota-fiscal/cfop/components/CfopFormModal.tsx:122-136,222`:
      SVGs à mão → Tabler; remover comentários residuais (`:143-146`)
      → Feito.
- [x] 4.9 `aria-hidden` em ícones decorativos ao lado de texto: codemod em
      `<Icon…/>` sem `label` já cobre; revisar `dashboard/components/Quotations.tsx:89`
      e cards de KPI
      → Feito: 233 ícones Tabler diretos ganharam `aria-hidden` por codemod; o gatilho de ajuda da quantidade ganhou rótulo. O nome "Editar <registro>" da ação de linha fica com `botoes-e-acoes` 2.6, que reescreve o `ActionButton`; aqui o nome é o tooltip.

## 5. Ícones customizados e FeaturedIcon

- [x] 5.1 Dividir `assets/icons/CustomIcons.tsx`: pictogramas (setores,
      `ResourceKindIcon`, `IconReceitaFederal`) → `assets/icons/pictogramas/*.tsx`
      com `currentColor`, sem `width/height` fixos; logos de bancos e meios de
      pagamento → `assets/logos/*.svg` + `Logo` (`<Image>` com `alt`)
      → Feito com desvio: logos ficaram como componentes SVG com `role="img"` e `aria-label` em vez de `<Image>`, para herdar o tamanho do contêiner; exports renomeados para `LogoX` (a proposta previa os mesmos nomes) porque logo não é ícone.
- [x] 5.2 Atualizar os 10 consumidores (`BankCard`, `member-select`,
      `ResourceKindIcon`, `SidebarComponent` Academy, fiscal)
      → Feito: 10 consumidores; `BankCard` e `member-select` não usavam `CustomIcons`.
- [x] 5.3 `ui/featured-icon.tsx`: API `tone` × `size` (32/40/48), estilo
      único; remover `bg-blue-light`, `shadow-sm` em ghost, 48 variantes
      → Feito: `tone` × `size`, sempre círculo, glifo pelo `Icon`; `data-slot="featured-icon"`.
- [x] 5.4 Codemod: remover `FeaturedIcon` de `DialogHeader` (168 usos;
      cabeçalho vira título + descrição); migrar usos em `EmptyState`,
      `ConfirmDialog`, onboarding e `CustomButton` para a API nova
      → Feito: 156 usos saíram de `DialogHeader`/`SheetHeader`; os 30 de `AlertDialogHeader` (confirmação) ficaram; 140 migrados por codemod; `CustomButton` e o alerta global passam a `iconTone`. `mx-auto` ganhou `flex` para centralizar.
- [x] 5.5 KPIs (`dashboard/**`, `base-de-custos/**/SummaryCards.tsx`,
      `relatorios/**/SummaryCards.tsx`, `SectorCardsGrid.tsx:36-41`): ícone
      `md` em `text-tertiary`, sem círculo colorido decorativo
      → Feito: ícone `md` em `text-gray-600` (cor do papel terciário) sem círculo, inclusive `SectorCardsGrid` e saldos de entidade.

## 6. Fechamento

- [x] 6.1 Capturas: `svgSizes` por rota só com 16/20/24 (fora pictogramas);
      `iconOnlyNoLabel` = 0 nas rotas migradas
      → Feito com métrica nova: as capturas ganharam `iconSizes` (só `svg.tabler-icon`). Nas 79 rotas, os ícones do Tabler ficaram todos em 16/20/24, salvo um spinner medido no meio do giro; SVGs fora da escala caíram de 1009 para 159 (o resto é gráfico, logo e ilustração). Botões sem nome: 243 → 242; os que sobram são de `botoes-e-acoes` 5.2. Evidência em `design/evidencia/icones-depois.json` e `icones-diff.txt`. A rodada achou ícones espremidos em botões só de ícone com borda (padding de 10 px) e o `ResourceKindIcon` em 14 px; corrigidos com padding de 8 px, `[&_svg]:shrink-0` no botão e `ICON_SIZE.sm`.
- [x] 6.2 `design.md` da raiz §2.6 com tamanhos, dicionário e ponteiro para
      `/sandbox/icones`
      → Feito: `design.md` §2.6.