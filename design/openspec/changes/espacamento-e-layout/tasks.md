## 1. Tokens e base

- [ ] 1.1 `tailwind.config.ts`: `borderRadius` = `none`, `control` 8,
      `container` 12, `pill` 9999 (+ aliases `lg`/`xl`/`full` marcados para
      remoção); remover `md`, `sm`, `2xl`, `3xl`
- [ ] 1.2 `globals.css`: remover `div { scrollbar-gutter: stable }` e as três
      exceções; `main { scrollbar-gutter: stable; overflow-y: auto }`;
      remover `body { pointer-events: auto !important }` com issue vinculada
      à eliminação dos modais empilhados
- [ ] 1.3 `(app-sidebar)/layout.tsx:19`: `main` `p-6` simétrico
      (`max-lg:p-4`), `pb-24` só se o chat flutuante exigir
- [ ] 1.4 Lint: `no-restricted-syntax` para valores arbitrários de espaço
      (`(p|m|gap|space)-[xy]?-\[\d+px\]`), para `max-w-\[` em
      `DialogContent`/`SheetContent`/`AlertDialogContent`, para
      `rounded(-md|-sm|-2xl|-3xl|-\[)` e `rounded\b` nu
- [ ] 1.5 Vitrine `/sandbox/layout`: gutters, card, tabela nas duas
      densidades, diálogo nos cinco tamanhos, sheet nos três, grade de
      formulário

## 2. Kit

- [ ] 2.1 `ui/table.tsx`: `Table density="default|compact"` via variável
      CSS; `TableHead` `h-10 px-4 type-table-header`; `TableCell` `px-4`
      com `py` da densidade e `align-middle`; `rowHeight="auto"` para
      colunas de duas linhas; `TableRow` sem padding próprio
- [ ] 2.2 `ui/dialog.tsx`: `DialogContent size="sm|md|lg|xl|full"`;
      `DialogHeader` branco (`px-6 pt-6 pb-4`, título + descrição, sem
      `bg-gray-100`/`border-gray-300`/`FeaturedIcon`); `DialogBody`
      `px-6 py-2 overflow-y-auto` sem `pr-2`; `DialogFooter` `px-6 pb-6
      pt-4 gap-3` com `border-t` condicional; botão fechar 36 px no canto
      sem quadrado permanente; `rounded-container`
- [ ] 2.3 `ui/sheet.tsx`: `SheetContent size="md|lg|xl"`, mesma anatomia
      de cabeçalho/corpo/rodapé, X com rótulo "Fechar", `side="right"` padrão
- [ ] 2.4 `ui/alert-dialog.tsx`: `size="sm"` fixo (400), sem `min-w-96`,
      texto à esquerda, rodapé igual ao do diálogo
- [ ] 2.5 `ui/card.tsx`: `rounded-container`; `CardHeader px-5 pt-5 pb-3
      flex justify-between gap-4` com `action` à direita; `CardContent px-5
      pb-5`; `CardFooter px-5 pb-5`
- [ ] 2.6 `ui/dropdown-menu.tsx:50,68`, `ui/popover.tsx`, `ui/command.tsx`,
      `ui/select.tsx` (conteúdo), `ui/tooltip.tsx`: `rounded-container`;
      item `rounded-control`
- [ ] 2.7 `ui/empty-state.tsx` e `common/TableEmptyState.tsx:30,71,94`:
      `py-12 px-6` sem `h-[calc(100vh-…)]`; unificação dos componentes em
      `componentes-adequados`
- [ ] 2.8 `common/form/FormGrid.tsx` (novo): `FormGrid`, `FormField span`,
      `FormSection title description`, `FormRepeater` (cabeçalho de item,
      "Remover" terciário, "Adicionar <item>" secundário)
- [ ] 2.9 `common/DetailCard.tsx` (unificado de `cadastros/clientes/[id]` e
      `fornecedores/[id]`): `dl` em grade 4/2/1 sem `Separator` entre linhas

## 3. Codemods

- [ ] 3.1 `dialog-size`: `className` com `max-w-[N]`/`max-w-*`/`w-[N]` em
      `DialogContent` → `size` por faixa (≤450 sm, ≤600 md, ≤760 lg, ≤1000
      xl, >1000 full); relatório para as mudanças de tela revisarem
- [ ] 3.2 `radius`: `rounded`→`rounded-control`, `rounded-md`→`control`,
      `rounded-lg`→`control` (botão/input) ou `container` (card/menu, por
      elemento), `rounded-xl`→`container`, `rounded-2xl`→`container`,
      `rounded-[10px]`→`container`, `rounded-[2px]`→`control`,
      `rounded-full` em badge/avatar→`pill`
- [ ] 3.3 `table-cell-padding`: remover `p-*`/`px-*`/`py-*`/`h-[44px]` de
      `TableCell`/`TableHead`/`TableRow` (a densidade decide)
- [ ] 3.4 `space-scale`: `space-y-1.5|2.5|5`, `gap-1.5|2.5|5`, `p-3.5`,
      `py-2.5` fora do kit → token vizinho (4/8/12/16/20/24); `space-y-5`
      vs `space-y-4` de página → `space-y-6` (24)
- [ ] 3.5 `dialog-header`: remover `FeaturedIcon` e `div.flex.items-center.gap-4`
      de `DialogHeader` (168), mantendo título e descrição; `DialogDescription
      hidden` (27) vira descrição real ou é removida

## 4. Diálogos redimensionados (casos nomeados)

- [ ] 4.1 `md`: `ItemActions/Notes/index.tsx:80-84`,
      `transactions/Actions/Notes/index.tsx:79`,
      `producao/.../Actions/Notes/index.tsx:80`, `MeasureDefaultsDialog.tsx:145`,
      `EditFixedExpense.tsx:180`, `Categories/NewItem/index.tsx:118-163`,
      `ScheduleDate/index.tsx:137` (com título visível e fechar),
      `NewProductGroup.tsx:121`, `NewItem` de status/motivo/origem
- [ ] 4.2 `lg`: `NewEmployee/index.tsx:98` e `EditEmployee/index.tsx:132`
      (iguais), `NewSerie/index.tsx:120` e `EditItem/index.tsx:171`
      (iguais), `AccountDialog.tsx:195`, `NewPaymentCondition`,
      `NewCategoryDialog`/`EditSubcategoryDialog` (grade igual),
      `NewMaterial.tsx:247`, `NewAsset`, `WorkloadModal`, `LaunchMovementModal`
- [ ] 4.3 `xl` ou Sheet/página (decisão nas mudanças de tela, registrar
      aqui o tamanho provisório): `NewClient/index.tsx:336-347`,
      `NewSupplier.tsx`, `NewProduct.tsx:463-468` (largura fixa, sem salto),
      `PaymentConditions/index.tsx:245-345`, `Delivery/index.tsx:238-433`,
      `QuotationComposeModal.tsx:386-406`, `QuotationProdDetailModal.tsx:487`,
      `Permissions/index.tsx:384`, `EmissorFormModal.tsx:393`,
      `NewCompanyInfo.tsx:207-208`, `CreditLimit.tsx:171,177`,
      `TransactionDetails/index.tsx:117`, `EditPriceModal.tsx:224`,
      `NaturezaFormModal.tsx:138` (sem `h-[90vh]`), `ImportQuotationModal.tsx:294,403`
- [ ] 4.4 Rodapés com `<div></div>` espaçador: `Notes:104`, `Delivery/index.tsx:419`,
      `QuickSaleCheckout.tsx:250`, `ScheduleDate:179`, `StagePending:109`,
      `MeasureDefaultsDialog.tsx:208`, `transactions/Notes:122` → `DialogFooter`
      com `justify-between` quando há conteúdo à esquerda

## 5. Formulários remendados

- [ ] 5.1 `cadastros/clientes/.../NewClient/tabs/GeneralInfoTab.tsx:288-291`,
      `CreditLimitTab.tsx:54,63`, `AddressTab.tsx:85-131`,
      `ResponsibilitiesTab.tsx`, `NewSupplier`: `FormGrid`; endereço na ordem
      padrão; `FormRepeater` para endereços e contatos
- [ ] 5.2 `vendas/.../Delivery/index.tsx:357-366`, `EditOrderInfo/index.tsx:313-322`,
      `configuracoes/.../Steps/Step2/index.tsx:58-80`: endereço na ordem
      padrão em `FormGrid`
- [ ] 5.3 `financeiro/.../InstallmentsForm.tsx:75-130`, `EditInstallments/index.tsx:361-388`,
      `vendas/.../PaymentConditions/Installments.tsx:111-147`,
      `nota-fiscal/.../InvoicePayment.tsx:421-501`: parcelas como tabela
      compacta com um cabeçalho (sem rótulo por linha, sem `leading-[44px]`)
- [ ] 5.4 `configuracoes/.../NewProduct.tsx:564,649`, `ProductFiscalTab.tsx:59`
      (`grid-cols-3` responsivo), `LaunchMovementModal.tsx:151`,
      `NewCategoryDialog/index.tsx:173-208`, `EditSubcategoryDialog/index.tsx:158-203`,
      `NewSerie`/`EditItem` (bases 200/250 → `span`), `NewAsset/index.tsx:153`
      (um sistema de layout)
- [ ] 5.5 `nota-fiscal/emitir/components/IssueInvoice.tsx:161-170`
      (`grid-cols-12` com um filho), `setores/components/Main.tsx:117`
      (`pr-20`), `Permissions/index.tsx:406-434` (cabeçalhos e células com o
      mesmo alinhamento), `ProjectDetail.tsx:239-253` (Entrega em uma coluna)
- [ ] 5.6 Campos de formulário no rodapé do diálogo
      (`setores/.../Actions/Edit/index.tsx:142-152`) → corpo

## 6. Cards, hubs, sidebar

- [ ] 6.1 `cadastros/clientes/[id]/components/DetailCardRowItem.tsx:17,23`:
      sem `Separator` por linha; `DetailCard` unificado (2.9)
- [ ] 6.2 `cadastros/clientes/[id]/dados/components/ClientData.tsx:114-196`:
      contatos e endereços em lista compacta (um card por tipo), não um card
      por item
- [ ] 6.3 `dashboard/components/Dashboard.tsx:128-132`: grade de KPIs 4/2/1
      e de rankings 3/1 (sem card órfão); remover `flex-[1_1_540px]` dos
      cards de gráfico
- [ ] 6.4 `configuracoes/components/CompanySettingsList.tsx:44-46,83`: um
      card por grupo, linhas de 64 px com divisórias, título e descrição com
      4 px entre si (o `SettingsList` chega em `componentes-adequados`;
      aqui as medidas)
- [ ] 6.5 `layout/SidebarComponent.tsx:212,219,287,337,427` e
      `MobileSidebar.tsx`: medidas §4.4 (264/64, logo 56, item 36, subitem
      32, sem `border-b` por item, conta no rodapé)
- [ ] 6.6 `CompanyInfo/index.tsx:57-63`: avatar de empresa 40 px (não 86)
- [ ] 6.7 `relatorios/**`: `space-y-6` uniforme (`SalesReport.tsx:49`,
      `CashFlowReport.tsx:35` vs demais); `CommissionTable.tsx:291-299`
      paginação em `CardFooter`; `nota-fiscal/.../emissores/page.tsx:15-22`,
      `cfop/page.tsx:15-22` sem `div p-6` extra
- [ ] 6.8 `!important` reais (`configuracoes/**` 28, `ProductImageUpload.tsx:72`):
      remover ou justificar em comentário

## 7. Fechamento

- [ ] 7.1 Capturas: `rowHeights` = {44} (ou ≤ 56 em duas linhas) nas listas;
      diff de largura de diálogos no relatório do codemod
- [ ] 7.2 `design.md` da raiz §2.3, §2.4, §3.11 atualizados com tokens,
      tamanhos de diálogo e anatomia
