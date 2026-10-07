## 1. Base

- [ ] 1.1 `tailwind.config.ts`: `spacing`/`size` tokens `icon-sm` 16,
      `icon-md` 20, `icon-lg` 24
- [ ] 1.2 `src/components/ui/icon.tsx`: `Icon` (`icon`, `size="sm|md|lg"`,
      `label?`, `className`) com traço por tamanho e `aria-hidden` quando sem
      `label`
- [ ] 1.3 `src/consts/icones.ts`: `ICONE` com os gestos da tabela §4.5 e o
      tipo `Gesto`
- [ ] 1.4 Vitrine `/sandbox/icones`: os três tamanhos em botão, célula, menu,
      sidebar e estado vazio; o dicionário com nome do gesto; pictogramas e
      logos
- [ ] 1.5 `ui/button.tsx`: envolver `LeftIcon`/`RightIcon` e o spinner com
      `Icon` no tamanho do `size` (`sm`→sm, demais→md); remover
      `leftIconSize`/`rightIconSize` (3 chamadas) e `LoaderCircle` (Lucide →
      `IconLoader2`)
- [ ] 1.6 `common/ActionButton.tsx`: ícone `md` em botão e em link; aceitar
      `gesto` além de `icon`

## 2. Kit sai do Lucide

- [ ] 2.1 Migrar para Tabler: `ui/select.tsx` (`Check`, `ChevronDown`,
      `ChevronUp`), `ui/accordion.tsx`, `ui/dropdown-menu.tsx`,
      `ui/checkbox.tsx`, `ui/calendar.tsx`, `ui/calendar-rac.tsx`,
      `ui/sheet.tsx` (`X` → `IconX`, rótulo "Fechar"), `ui/command.tsx`,
      `ui/pagination.tsx`, `ui/input-otp.tsx`, `ui/toast.tsx` (sai em
      `interacao-e-movimento`), `ui/radio-group.tsx`, `ui/hover-card.tsx`,
      `ui/drawer.tsx`, `ui/file-uploader.tsx`
- [ ] 2.2 `layout/UserDropdown.tsx:31`, `common/TabsNavigation.tsx` +
      `components/LucideIcon.tsx`: `TabNavType.icon` passa a componente
      Tabler; apagar `LucideIcon.tsx`; atualizar os consumidores
      (`cadastros/clientes/[id]/layout.tsx`, `fornecedores/[id]/layout.tsx`,
      `base-de-custos/layout.tsx`, `precificacao/layout.tsx`, `relatorios`)
- [ ] 2.3 `grep -rl "lucide-react" src` vazio; remover a dependência do
      `package.json`; lint `no-restricted-imports` para `lucide-react`

## 3. Tamanhos por contexto

- [ ] 3.1 Codemod `icon-size`: em JSX de ícone Tabler (`<Icon[A-Z]\w+`),
      trocar `size={N}` / `className="h-N w-N|size-N"` por `<Icon size=…>`
      segundo o contêiner: dentro de `Button size="sm"|"iconSm"|"iconXs"` →
      `sm`; `TableCell`, `DropdownMenuItem`, `Input` adornment, `Badge` →
      `sm` em badge e `md` nos demais; `SidebarComponent`, `Topbar`,
      `EmptyState`, `FeaturedIcon` → `lg`; sem contexto → `md`
- [ ] 3.2 `layout/SidebarComponent.tsx:355-362,503`, `MobileSidebar.tsx:279`:
      ícones de módulo e de subitem ambos `lg`/`md` conforme §4.8 (módulo 20,
      subitem 20); item Academy sem SVG 34×34 nem `iconColor`
- [ ] 3.3 `common/Topbar.tsx:91`, `ui/dialog.tsx:50`, `ui/sheet.tsx:68`:
      ícone de voltar e de fechar em `md` com alvo de 36 px
- [ ] 3.4 `strokeWidth`/`stroke-1` manuais (`PartialBlockAlert.tsx:32` e
      demais `grep -rn "strokeWidth\|stroke-1"`) → removidos (o `Icon` define)
- [ ] 3.5 Lint: `size={\d+}` em componente `Icon[A-Z]` proibido fora de
      `ui/icon.tsx`

## 4. Dicionário aplicado (glifos ambíguos)

- [ ] 4.1 Lupa → olho/linha clicável: `cadastros/clientes/components/ClientsTable/ClientsData.tsx:232`,
      `cadastros/fornecedores/.../SuppliersData.tsx:117`,
      `producao/projetos/components/Projects.tsx:108`,
      `vendas/ordens-de-servico/.../OrdersData.tsx:337`,
      `financeiro/.../TransactionsData.tsx` (detalhes),
      `financeiro/controle-de-caixa/components/CashControl.tsx:468-471`
      (apagar a frase "abre na lupa"), `CashDayDetail.tsx:158`
      (`FeaturedIcon` do relatório → `IconReportMoney`); "Consultar dados de
      cliente" (`Clients.tsx:175-205`) → `IconId` com rótulo
- [ ] 4.2 Impressora só imprime: `producao/projetos/[id]/components/ProjectDetail.tsx:158-162`
      ("Ficha de produção" → `IconFileText` + chevron);
      `vendas/ordens-de-servico/.../OrdersData.tsx:344-366` ("Via do cliente"
      impressora, "Ficha de produção" documento); `relatorios/**/print/*PrintButton.tsx`
      → `IconDownload` "Exportar"
- [ ] 4.3 Nota fiscal: `OrdersData.tsx:383-429` (`IconFileInvoice` ver DANFE,
      `IconSend` emitir); `nota-fiscal/emitir/components/InvoiceResultsTable.tsx:1355,1367`
      (`IconRefresh` consultar SEFAZ, `IconRepeat` reprocessar), `:1500,1519`
      (emitir = `IconSend` com rótulo em `botoes-e-acoes`)
- [ ] 4.4 Financeiro: `producao/agenda-de-entrega/.../DeliveryScheduleData.tsx:336,355`
      e `financeiro/frente-de-caixa/components/PDV.tsx:417` (`IconReceipt`
      faturar, `IconCalendarDollar` editar parcelas); polegares de
      `consts/receivables.ts` → `IconCash`/`IconCashBanknoteOff`;
      `PDV.tsx:424,633` (cancelar venda `IconBan`, descartar `IconTrash`)
- [ ] 4.5 Lixeira só exclui: `configuracoes/financeiro/contas-bancarias/components/BankAccounts.tsx:234-241`
      (inativar → `IconBan`); `configuracoes/financeiro/folhas-de-pagamento/.../PayrollItems.tsx:282-298`
      (cancelar adiantamento → `IconBan`); `configuracoes/vendas/series-de-venda/components/Main.tsx:133-176`
      (eraser → `IconTrash` com tom destrutivo)
- [ ] 4.6 Diversos: `financeiro/despesas-fixas/components/FixedExpenses.tsx:98-99`
      (`IconPackageOff` → `IconReceipt2`); `financeiro/controle-de-caixa/components/CashControl.tsx:623,631`
      (fechar caixa `IconLock`, lançar ajuste `IconAdjustments`);
      `configuracoes/.../CompanyInfo/index.tsx:101`, `NewCompanyInfo.tsx:211`
      (`IconBuilding` como o hub); `base-de-custos/despesas-administrativas/components/SummaryCards.tsx:48`
      (`IconCurrencyReal`); `vendas/.../OrderItems.tsx:276` (`IconCurrencyReal`
      como em `QuotationItems`); `consts/nav.ts:436-437` (Produção
      configurações ≠ Processos); `cadastros/.../NewClient/index.tsx:340`
      (lápis em modo edição)
- [ ] 4.7 `vendas/orcamentos/.../QuotationsData.tsx:270,278`: "⚡" →
      `Badge` "Venda rápida" com `IconBolt`
- [ ] 4.8 `configuracoes/nota-fiscal/cfop/components/CfopFormModal.tsx:122-136,222`:
      SVGs à mão → Tabler; remover comentários residuais (`:143-146`)
- [ ] 4.9 `aria-hidden` em ícones decorativos ao lado de texto: codemod em
      `<Icon…/>` sem `label` já cobre; revisar `dashboard/components/Quotations.tsx:89`
      e cards de KPI

## 5. Ícones customizados e FeaturedIcon

- [ ] 5.1 Dividir `assets/icons/CustomIcons.tsx`: pictogramas (setores,
      `ResourceKindIcon`, `IconReceitaFederal`) → `assets/icons/pictogramas/*.tsx`
      com `currentColor`, sem `width/height` fixos; logos de bancos e meios de
      pagamento → `assets/logos/*.svg` + `Logo` (`<Image>` com `alt`)
- [ ] 5.2 Atualizar os 10 consumidores (`BankCard`, `member-select`,
      `ResourceKindIcon`, `SidebarComponent` Academy, fiscal)
- [ ] 5.3 `ui/featured-icon.tsx`: API `tone` × `size` (32/40/48), estilo
      único; remover `bg-blue-light`, `shadow-sm` em ghost, 48 variantes
- [ ] 5.4 Codemod: remover `FeaturedIcon` de `DialogHeader` (168 usos;
      cabeçalho vira título + descrição); migrar usos em `EmptyState`,
      `ConfirmDialog`, onboarding e `CustomButton` para a API nova
- [ ] 5.5 KPIs (`dashboard/**`, `base-de-custos/**/SummaryCards.tsx`,
      `relatorios/**/SummaryCards.tsx`, `SectorCardsGrid.tsx:36-41`): ícone
      `md` em `text-tertiary`, sem círculo colorido decorativo

## 6. Fechamento

- [ ] 6.1 Capturas: `svgSizes` por rota só com 16/20/24 (fora pictogramas);
      `iconOnlyNoLabel` = 0 nas rotas migradas
- [ ] 6.2 `design.md` da raiz §2.6 com tamanhos, dicionário e ponteiro para
      `/sandbox/icones`
