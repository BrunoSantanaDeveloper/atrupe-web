## 1. Tabela

- [ ] 1.1 `ui/table.tsx`: `TableContext` (density, columns, sort, selection);
      `TableHead numeric sortable sortKey`; `TableCell numeric`; `TableGroupRow`,
      `TableEmptyRow` com `colSpan` por contexto; `Table sticky="header|first-column"`;
      `Table state={{loading,error,empty,noResults}} skeletonRows emptyState`
      renderizando `TableSkeleton`/`EmptyState` no `tbody`
- [ ] 1.2 `Table selectable` + `SelectionBar` (de `botoes-e-acoes`): checkbox
      de cabeçalho com estado indeterminado; linhas não selecionáveis ficam sem
      checkbox mas o "selecionar tudo" diz "n de m selecionáveis"
- [ ] 1.3 `common/TableSkeleton.tsx`: colunas reais via contexto; remover
      `cols+1`, blocos de ação fixos, `w-32`
- [ ] 1.4 `ui/pagination.tsx` + `common/Pagination.tsx`: API única
      (`total`, `page`, `pageSize`, `onPageChange`, `onPageSizeChange`,
      `mode="url"|"controlled"`, `paramName`), intervalo "1–20 de 340",
      seletor 10/20/50, janela 1 … n−1 n, `Button tertiary` sem `href="#"`,
      `aria-label="Paginação"`, rótulos "Anterior"/"Próxima"; remover
      `TablePaginationControlled.tsx` e `TableRowNoResults.tsx`
- [ ] 1.5 Codemod: `TablePagination`/`TablePaginationControlled` → `Pagination`;
      `lastPage` calculado no navegador (`SuppliersData.tsx:61-65`,
      `QuotationsData.tsx:452`) → `lastPage` da API; `NfeAvulsaSection.tsx:234-235`
      com `paramName="avulsas"`
- [ ] 1.6 `<table>` crus → `Table`: `CfopListClient.tsx:220-236`,
      `NaturezaListClient.tsx:229-242`, `admin/sistema/cupons/page.tsx:329`
      e os outros 5 (`grep -rn "<table" src`); "tabelas" de div →
      `Table compact`: `CreditLimitTab.tsx:68-108`, `CreditLimit.tsx:209-213`,
      `Installments.tsx:111-147`, `InstallmentsForm.tsx:75-130`,
      `EditInstallments/index.tsx:361-388`
- [ ] 1.7 `colSpan` manual → contexto: `QuotationsData.tsx:215,410`,
      `OrdersData.tsx:155`, `DeliveryScheduleData.tsx:199-211`,
      `colaboradores/.../TableData.tsx:150-152`, `cargos/.../Main.tsx:110-111`,
      `PaymentConditionsData.tsx:113`, `Comparison.tsx:237`
- [ ] 1.8 `sticky`: `AdminExpensesData.tsx:63` (primeira coluna),
      `Permissions/index.tsx:384` (cabeçalho), listas longas de
      `telas-*` conforme decidirem
- [ ] 1.9 `common/TableHeader.tsx` → `common/ListToolbar.tsx`: busca com
      ícone dentro do campo, limpar, submit por Enter (sem botão primário
      verde), placeholder diz o que se busca; área de filtros com
      `DateRangePicker` e selects rotulados; "Limpar filtros" quando há
      filtro ativo; filtros sempre visíveis mesmo em aba vazia
      (`Quotations.tsx:331-345`)
- [ ] 1.10 Busca e paginação onde faltam (decisão de componente; a tela
      ajusta a consulta): `Projects.tsx:60-65`, `Stock.tsx:145,237`,
      `PricingList.tsx:91-97`, `AdminExpensesData.tsx:63`, `InvoiceEntry.tsx:97`,
      `CashControl.tsx:521`, `Categories/index.tsx` (busca), `ImportClientModal.tsx:422-466`
      (erros paginados + baixar CSV)

## 2. Formulário

- [ ] 2.1 `ui/form.tsx`: `FormField required|optional`; `FormLabel` com
      asterisco `aria-hidden` + `aria-required`; "(opcional)" em `helper`;
      `FormMessage` com ícone; rótulo não fica vermelho
- [ ] 2.2 `common/form/FormInput.tsx:73-74`: `placeholder` só explícito;
      `autoComplete` inferido do `name` (`email`, `tel`, `postal-code`,
      `given-name`, `organization`, `street-address`, `cc-*` nunca) com
      override; `off` só em busca e códigos
- [ ] 2.3 Codemod `placeholders`: remover `placeholder={label}` e os
      "Digite aqui"/"Digite" (`GeneralInfoTab.tsx:225-359`,
      `ResponsibilitiesTab.tsx:54-102`, `LoginForm.tsx:116,123` e demais
      `grep -rn "Digite aqui"`); manter apenas exemplos de formato
- [ ] 2.4 Um estilo de desabilitado (`bg-surface-subtle border text-disabled`)
      em `ui/input.tsx:63`, `ui/select.tsx:22`, `ui/textarea.tsx`,
      `FormDatePickerInput`, `Combobox`; dado somente leitura mostrado como
      texto (`dl`), não como input desabilitado (`Compensate/index.tsx:185-236`,
      `EditPriceModal.tsx:289-301`, `InvoiceTransport.tsx:304-307`)
- [ ] 2.5 `ui/date-picker.tsx` (`DatePicker`) a partir de `FormDatePickerInput`
      (campo mascarado + `Calendar` react-day-picker + presets) e
      `DateRangePicker` com presets (hoje, 7 dias, este mês, mês passado,
      personalizado); remover `common/date-picker.tsx`, `date-range-picker.tsx`,
      `DateRangePickerBasic.tsx`, `fluxo-financeiro/.../DatePicker.tsx`,
      `ui/calendar-rac.tsx`, `ui/datefield-rac.tsx`; `react-aria-components`
      sai do `package.json`
- [ ] 2.6 Codemod `date-fields`: `<Input type="date">` e `FormDatePickerInput`
      → `DatePicker` (`Summary.tsx:134-140`, `TaskDetailDialog.tsx:246-285`,
      `CashDayDialogs.tsx:192-197,662-667`, `InvoicePayment.tsx:451`,
      `agenda` Calendar); "Select de período + range" → `DateRangePicker`
      (`relatorios/vendas/components/FiltersBar.tsx:194-213`,
      `Comparison.tsx:95-120`, `SalesTable.tsx:210-218`)
- [ ] 2.7 `ui/money-input.tsx`: `MoneyInput`, `PercentInput`, `QuantityInput`
      (máscara pt-BR, `inputMode=decimal`, `numeric`); substituir
      `RateInput`, `FormBrlInput*`, `CashCountCheck.tsx:36-44`,
      `EditPriceModal.tsx:307-367`, `InvoicePayment.tsx:468-497`,
      `MatchItemModal.tsx:135-142`, `Stock.tsx:164-167,255` (exibição com
      `formatQuantity` pt-BR); `WorkloadModal.tsx:134-163` e
      `DistributionData.tsx:93-122` com um único campo (slider sai)
- [ ] 2.8 `ui/segmented-control.tsx` (`ToggleGroup single`, `role=radiogroup`);
      codemod `Select` de ≤ 4 opções → `SegmentedControl`:
      `NewItem/index.tsx:145-157` (Acréscimo/Desconto),
      `NewPaymentCondition/index.tsx:269-275` (% / R$; `PickValuePercentSelect`
      sai), `CfopFormModal.tsx:201`, `InvoiceEmissionConfigSection.tsx:248-249,407-408`
      (com rótulos "Entrada"/"Saída", "Sim"/"Não"), `PaymentConditions/index.tsx:265-272`
      (Entrada sim/não → `Checkbox`), `DashboardPeriodFilter.tsx:26-38`,
      `TopActions.tsx:56-99` (base de data), `FinancialFlow.tsx:238-247`,
      `CashDayDialogs.tsx:291-306`, `AssemblyEditor.tsx:2828-2843`
- [ ] 2.9 `common/radio-card.tsx`/`checkbox-card.tsx` revisados (tokens,
      `focus-ring`, descrição); substituir os cards-rádio à mão:
      `ProposalPrint.tsx:147-170`, `ItemForm.tsx:112-124`,
      `QuotationProdDetailModal.tsx:541-556`, `ModeSelector.tsx:41-80`,
      `QuickSaleSettingsForm.tsx:262-292`, `AccountDialog.tsx:212-239`,
      `CancelSubscriptionDialog.tsx:125-136`, `EditPriceModal.tsx:246-280`
      (usar `FormToggleCard` existente), `ProductionSettingsDialogs.tsx:160-180,487,507`,
      `AssemblyDialogs.tsx:173-183`, `NextStepDialog.tsx:86-90`,
      `PlanCard.tsx:128-180` (plano como card de rádio em colunas)
- [ ] 2.10 `Switch` em formulário → `Checkbox`: `NewTransaction/index.tsx:339-342`,
      `CreditLimitTab.tsx:94-101`, `ScheduleDate/index.tsx:155-173`,
      `LaunchMovementModal.tsx:175-184`; `Switch` de efeito imediato →
      `AutosaveSwitch` (`setores/.../Main.tsx:145-154` com `aria-label` por
      setor, `QuickSaleSettingsForm.tsx:151-155`)
- [ ] 2.11 `ui/combobox.tsx` sobre `cmdk` (busca, criar novo, assíncrono);
      aplicar em `MatchItemModal.tsx:120-129` e em selects de cliente/produto/
      material com mais de 50 itens (`ClientSelect`, `ProductSelector`,
      `SupplierSelect` — unificar as duas cópias de `ProductSelector`)
- [ ] 2.12 `common/ColorPicker.tsx` (paleta de 12 tons + texto por
      luminância); aplicar em `status-de-orcamento/.../NewItem/index.tsx:119,140-145`
      e `Main.tsx:93-101`, `QuotationTagDropdown.tsx:77-86`
- [ ] 2.13 Codemod `title-to-tooltip`: `title="…"` em botões, ícones e
      células → `Tooltip` (436; excluir `<img title>` e `<iframe>`); lint
      `jsx-a11y`/regra própria para `title=` em `button`/`Button`/`a`/`svg`
- [ ] 2.14 Rótulos crus `<label>` → `FormLabel`/`Label`: `MatchItemModal.tsx:132`,
      `CashDialogs.tsx:231,428,568`, `IssueNfseForm.tsx:877` (checkbox nativo
      → `Checkbox`), `admin/sistema/cupons/page.tsx:497-733`
- [ ] 2.15 Remover `common/form-input.tsx` (759 linhas), `ui/input-uncontrolled.tsx`
      (unificar em `Input`), o `ProductSelector` duplicado, `formatCurrency`/
      `formatDate` locais (`NfeAvulsaSection.tsx:110-131`, `InvoiceTotalsSection.tsx:24`)

## 3. Sobreposições

- [ ] 3.1 `ui/sheet.tsx`: `SheetHeader` (título, `StatusBadge`, ações),
      `SheetBody` com seções, pilha interna (`useSheetStack` com "Voltar"),
      `?painel=<id>` sincronizado com a URL e fechamento pelo voltar do
      navegador; `guardDirty`
- [ ] 3.2 `ui/stepper.tsx`: horizontal, `aria-current="step"`, etapas
      concluídas clicáveis; `WizardFooter` ("Voltar" terciário, "Avançar →"
      primário, "Concluir")
- [ ] 3.3 Aplicar `Stepper` onde há etapas sem indicador:
      `nota-fiscal/emitir/components/IssueInvoice.tsx:178-344` (ou remover o
      modal e usar a página `avulsa`), `QuotationCategorySelectorModal.tsx:104`
      + `QuotationItemsModal.tsx:166` (uma etapa com "Voltar"),
      `SearchClientModal` → `ClientDetailsModal` → `NewClientModal` (um
      fluxo em `Sheet` com etapas), `ActivationWizardModal.tsx`
- [ ] 3.4 Diálogo sobre diálogo → `Sheet`/substituição (decisão de
      componente; a tela aplica): `CompanyInfo/index.tsx` → `NewCompanyInfo.tsx:207-208`;
      `TransactionDetails/index.tsx:117,378-400`; `PaymentConditions/index.tsx`
      + `CommissionDialog`; lint/aviso em runtime quando `Dialog` abre com
      outro `Dialog` aberto
- [ ] 3.5 Remover `common/GenericDialog.tsx`; `ui/drawer.tsx` só para
      celular (menu lateral) ou removido

## 4. Feedback e status

- [ ] 4.1 `common/StatusBadge.tsx` (`status`, `size`) sobre `Badge` + dicionário;
      `Badge` reduzido a tons semânticos + `brand` + `neutral` (sem 40
      variantes de cor); remover `ui/status-tag.tsx`
- [ ] 4.2 Codemod `status-badges`: usos de `Badge variant={statusObj[x].variant}`
      e dos polegares/pontos → `StatusBadge`; casos: `receivables`,
      `TransactionsData.tsx:292-296,336-340`, `FinancialFlowData.tsx:282-286`,
      `PayrollMovement.tsx:102-104`, `InvoiceResultsTable.tsx:362,1066`,
      `NfeAvulsaSection.tsx:147`, `DeliveryScheduleData.tsx:241-245,264-282`,
      `Stock.tsx:188-199,243`, `PaymentConditionsData.tsx:131-140`,
      `IssueNfseForm.tsx:771-778`, `InvoiceFormHeader.tsx:116`,
      `ProductionSettings.tsx:239,357`, `BankAccounts.tsx:176-193`,
      `ImportClientModal.tsx:440`, `ImportSupplierModal.tsx:442`,
      `ImportProductModal.tsx:437`, `ImportFinancialModal.tsx:479`,
      `PaymentConditions.tsx:145`, `Delivery.tsx:394`, `CfopRow.tsx:51-58`
- [ ] 4.3 `ui/alert.tsx`: tons `info|success|warning|error`, título +
      descrição + ação, `role` só em erro/aviso dinâmico; `common/Banner.tsx`
      (topo da área de conteúdo) substitui `TrialExpiredAlert`,
      `PartialBlockAlert`, `DevEnvAlert`, `ui/alert-banner.tsx`
- [ ] 4.4 Caixas de aviso à mão → `Alert`: `IssueInvoiceForm.tsx:713-721`,
      `StandaloneNfeForm.tsx:745-792`, `DocumentosTabs.tsx:279`,
      `InutilizarNfceDialog.tsx:118-120`, `ContingenciaNfceDialog.tsx:127-129`,
      `CancelNfeDialog.tsx:142-143`, `InvoiceTransport.tsx:304-307`,
      `PricingSummaryView.tsx:119-131` (com "Ver quais" como link),
      `Step5.tsx:40-75`, `ImportClientModal.tsx:414` e `ImportFinancialModal.tsx:456`
      (`Alert` oculto → visível)
- [ ] 4.5 `ui/empty-state.tsx` único com `kind="empty|no-results|error|forbidden"`,
      `title`, `description`, `action`, `icon` por tipo; `common/TableEmptyState.tsx`
      vira wrapper e depois sai; `PermissionGate` usa `kind="forbidden"`
      (`clientes/page.tsx:22`, `gerenciador/page.tsx:18`, `estoque/page.tsx:21`,
      `base-de-custos/layout.tsx:40`, `precificacao/layout.tsx:32`,
      `orcamentos/page.tsx:22`, `relatorios/layout.tsx:14`, `Dashboard.tsx:103-113`,
      `controle-de-caixa/page.tsx:36`, `fluxo-financeiro/page.tsx:16-19`,
      `consolidado/.../IssueConsolidatedInvoiceForm.tsx:19,28`)
- [ ] 4.6 Codemod `empty-states`: `ListDataTotalEmpty`/`ListDataStatusEmpty`/
      `FilteredDataEmpty` → `EmptyState kind`; parágrafos cinzas e divs
      tracejadas → `EmptyState` (`InvoiceEntry.tsx:216-224`, `CashControl.tsx:658-666`,
      `FinancialTable.tsx:206`, `CommissionTable.tsx:224-227`,
      `series-de-venda/.../Main.tsx:231`, `SubscriptionManagementClient.tsx:166-173`,
      `EmissoresListClient.tsx:378-387`, `CfopListClient.tsx:206-216`,
      `NaturezaListClient.tsx:215-226`, `PDV.tsx:470-476,646-652`,
      `QuotationItems.tsx:758`, `SalesTable.tsx:286-367`, origin charts);
      textos coerentes com o tipo (`Stock.tsx:114-119`, `Comparison.tsx:126-131`,
      `ClientsData.tsx:265-276` "Limpar filtros", `Payroll.tsx:285-289`,
      `cargos/Main.tsx:81`, `setores/Main.tsx:105-109`, `Assets.tsx:132-138`,
      `Depreciation.tsx:99-103`, `FixedExpenses.tsx:490-493`, `Projects.tsx:88`,
      `PaymentConditionsData.tsx:186-190`, `BankAccounts.tsx:327`)
- [ ] 4.7 `ui/breadcrumb.tsx` (`nav aria-label="Caminho"`, `aria-current`);
      consumido pelo `PageHeader` em `navegacao-e-cabecalhos`
- [ ] 4.8 `ui/tabs.tsx` + `common/TabsNavigation.tsx`: `Tabs` de link com
      `count` (oculto no zero) para o cabeçalho; remover abas de `CardHeader`
      (`Stock.tsx:102-110`, `Depreciation.tsx:81-94`, `PricingList.tsx:105-113`,
      `FinancialReport.tsx:49-54`) e abas como filtro duplo (`Comparison.tsx:95-120`);
      contador "(n)" em texto (`Comparison.tsx:101-104`) → `count`

## 5. Camada Figma DS e código morto

- [ ] 5.1 Remover `ui/table-cells.tsx`, `ui/data-table.tsx`, `ui/status-tag.tsx`,
      `common/form-input.tsx`, `common/date-picker.tsx`, `common/nav-menu.tsx`
      e as páginas de sandbox correspondentes; `ui/resource-card.tsx` e
      `ui/list-item.tsx` migram para tokens e ficam só se `telas-configuracoes`
      adotar (senão saem)
- [ ] 5.2 Remover código morto listado em `sistema-visual.md` §2.7
      (`QuickAccess`, `Revenues`, `Expenses`, `PeriodFilter`, `FiscalSetupModal`,
      `OpenCashAction`, `EmitirTabsWrapper`, `ClientSearchSidebar`,
      `EmitNfeDialog`, `EmitNfseButton`, `GestaoNotasClient`, `ClientDetailsModal`
      duplicado, navegação comentada em `SidebarComponent.tsx:600-693`)
- [ ] 5.3 Unificar duplicados: `TransactionsData` × `FinancialFlowData`,
      `PayrollFilter` × `FixedExpensesFilter`, `CancelOrderButton` ×
      `CancelOrder`, `DuplicateQuotationButton` × `Duplicate`,
      `SummaryCards` × `DistributionSummaryCards` × `DepreciationSummaryCards`
      (`common/KpiCard`), `ImportClientModal` × `ImportSupplierModal`
      (`common/import/ImportModal` parametrizado), `PrintReceiptButton` ×
      `BulkPrintReceiptButton` × `PayrollActions` print (um `SplitButton`
      "Imprimir ▾ com assinatura"), `ProductPriceTiers` × `PriceTiersCard`,
      `NfcePaymentSection` × `PaymentSplit`, três listas de tipo de nota,
      `DetailCard` ×2

## 6. Fechamento

- [ ] 6.1 Vitrine `/sandbox/componentes`: tabela completa (numérico,
      ordenação, seleção, grupo, estados, paginação), formulário com todos os
      campos, `Sheet`, `Stepper`, `StatusBadge` para todos os estados,
      `Alert`/`Banner`, `EmptyState` nos quatro tipos, `Breadcrumb`, abas
- [ ] 6.2 Capturas: `nativeTitle` = 0; `tables` sem `<table>` cru; `e2e` de
      paginação (intervalo e tamanho) em clientes e orçamentos
- [ ] 6.3 `design.md` da raiz §3 reescrito com o catálogo final
