## 1. Botão novo

- [ ] 1.1 `ui/button.tsx`: `variant` (`primary|secondary|tertiary|link`) ×
      `tone` (`default|destructive`) via `compoundVariants`; `size`
      (`sm|md|lg|xl`) × `icon` (booleano, quadrado); `rounded` (`default|full`);
      foco `focus-ring`; desabilitado por variante; hover/active na ordem
      certa (active mais escuro)
- [ ] 1.2 `isLoading`: conteúdo `invisible`, spinner `absolute` centralizado
      (`IconLoader2` via `Icon`), `aria-busy`, `disabled`; sem troca de texto
- [ ] 1.3 Ícone à esquerda por padrão (`icon` prop) e `iconRight` só para
      "Avançar"; tamanho pelo `size` (de `icones`)
- [ ] 1.4 Aliases `@deprecated` para as variantes legadas apontando para a
      equivalência da tabela do `design.md` (mantém o build verde durante a
      migração); aviso de lint ao usá-los
- [ ] 1.5 Vitrine `/sandbox/botoes`: 4 níveis × 2 tons × 4 tamanhos × estados
      (normal, hover, active, foco, desabilitado, carregando), só-ícone,
      grupos (`ButtonGroup`) e exemplos de região (cabeçalho, rodapé, linha)

## 2. Componentes de ação

- [ ] 2.1 `src/consts/acoes.ts`: rótulos padronizados (`novo(objeto)`,
      `adicionar(objeto)`, `salvar`, `cancelar`, `fechar`, `voltar`,
      `excluir(objeto)`, `remover`, `inativar`, `reativar`, `importar(objeto)`,
      `exportar`, `manter(objeto)`) com concordância de gênero por objeto
- [ ] 2.2 `common/ConfirmDialog.tsx` + `useAlertDialog` com `tone`,
      `confirmLabel`, `cancelLabel` (padrão "Voltar" quando confirmar começa
      com "Cancelar"), `description` obrigatória, promessa em `onConfirm`
      (fecha só no sucesso, erro inline); substitui `GlobalAlertDialog`
- [ ] 2.3 `ui/alert-dialog.tsx`: `AlertDialogAction` deixa de ser verde por
      padrão (recebe `variant`/`tone`); `AlertDialogContent` sem
      `min-w-96` (usa `size="sm"` de `espacamento-e-layout`); título e
      descrição alinhados à esquerda
- [ ] 2.4 `common/RowActions.tsx`: `primary` (uma, opcional) + `items`
      (menu "⋯" com `gesto`, `label`, `tone`, `disabled`+`reason`, `'-'`
      separador); `TableRow` ganha `href`/`onSelect` com hover, `cursor-pointer`,
      `tabIndex=0`, Enter e `stopPropagation` nas ações e no checkbox
- [ ] 2.5 `common/ChoiceCard.tsx`: ícone + título + legenda, `role="radio"`
      em grupo ou `asChild` link; substitui `CustomButton` nas escolhas
      (tipo de nota em `IssueInvoice`/`InvoiceTypeSelectModal`/`avulsa/page`,
      modo de contagem em `CashCountCheck`)
- [ ] 2.6 `common/ActionButton.tsx`: vira wrapper de `Button tertiary icon sm`
      com Tooltip + `aria-label` obrigatórios; `target` sem `rel` corrigido
- [ ] 2.7 `common/SelectionBar.tsx`: barra neutra (`bg-surface-subtle`,
      `border`) com contador e ações; usada por `ClientsData.tsx:135-136,167-181`,
      `QuotationsData.tsx:167-181`, `TransactionsData.tsx:420`,
      `InvoiceResultsTable.tsx:1538`, `FixedExpensesFilter.tsx:197-206`

## 3. Codemod de variantes

- [ ] 3.1 Codemod `button-variants` com a tabela do `design.md` §2 aplicado a
      856 `<Button>` e aos `buttonVariants()` diretos (`alert-dialog`,
      `pagination`, `calendar`, `sidebar`)
- [ ] 3.2 Codemod `button-sizes` (`default|md`→`md`; `icon*`→`size`+`icon`;
      `none`→`tertiary` sem padding)
- [ ] 3.3 `<button>` crus (127) → `Button` ou `ChoiceCard`/`SegmentedControl`
      (os de rádio e chip ficam para `componentes-adequados`); lista:
      `producao/gerenciador/components/ManagerBoard.tsx:236,271,293,457`,
      `relatorios/dfc/components/DfcTable.tsx:165-174`,
      `dashboard/components/FiscalOnboardingBanner.tsx:44-47`,
      `nota-fiscal/emitir/components/IssueInvoice.tsx:201`,
      `nota-fiscal/.../InvoicePayment.tsx:427-433` (com `type="button"`),
      `nota-fiscal/.../NfcePaymentSection.tsx:203-209`,
      `layout/MobileSidebar.tsx:404-428`, `AssemblyEditor.tsx:2828-2843`
- [ ] 3.4 Relatório do codemod: arquivos com mais de uma `primary` na mesma
      região; revisar à mão (lista inicial: `FinancialFlow.tsx:249-266`,
      `QuickSaleQuotation.tsx:107`+`QuickSaleCheckout.tsx:402`,
      `QuickSaleSettingsForm.tsx:244-246,368-370`, `CfopListClient.tsx:194`+
      `NaturezaListClient.tsx:203`, `TableHeader.tsx:69-75` (busca primária),
      `Quotations.tsx:306-322`, `CashControl.tsx:284-343,386-403`,
      `PDV.tsx:238-300`)
- [ ] 3.5 `outline` verde como secundária (65): vira `secondary`; conferir
      `TablePaginationControlled.tsx:36,70`, `NewClientTriggerButton.tsx:10`,
      `CashDayDialogs.tsx:115`, `ContractModal.tsx:97`, `TaskDetailDialog.tsx:452`,
      `ProjectDetail.tsx:384`, `AssemblyEditor.tsx:2952-2956`,
      `AssemblyDialogs.tsx:193-198`, `NewPaymentCondition/index.tsx:488-494`,
      `ReceiveSaleDialog.tsx:219,232`

## 4. Hubs e botões repetidos

- [ ] 4.1 `configuracoes/components/CompanySettingsList.tsx:97-116`: remover
      o `Button` "Configurar →" e o `cta`; linha = `Link` (ou `onClick` para
      os que ainda abrem diálogo) com chevron, hover, foco; inativo só por
      badge (sem `!bg-gray-200`+`opacity-50`); mesmo para
      `importacoes/components/ImportSettingsClient.tsx:24-65` ("Importar →" ×6
      → linhas; página única de importação fica em `telas-configuracoes`)
- [ ] 4.2 `configuracoes/.../NewCompanyInfo.tsx:328-336`,
      `.../EmissorListItem.tsx:457-479,712-716`, `.../FiscalPendenciasAlert.tsx:171-178`:
      item = linha com chevron; "Configurar"/"Corrigir" saem
- [ ] 4.3 `nota-fiscal/emitir/[orderId]/components/InvoiceItems.tsx:199-209`:
      badge "Pendente" por item + "Configurar pendentes (n)" no cabeçalho da
      seção
- [ ] 4.4 `financeiro/controle-de-caixa/components/CashControl.tsx:284-306,318-343,386-403`:
      ação por conta `secondary`; primária única "Abrir caixa de hoje" (ou
      "Fechar caixa" quando aberto); "Transferência" vira `secondary` com
      verbo "Transferir entre caixas"
- [ ] 4.5 `configuracoes/vendas/series-de-venda/components/Main.tsx:133-176`,
      `perfil-de-vendedor/components/Main.tsx:146-169`,
      `motivos-de-rejeicao-e-cancelamento/components/Main.tsx:97`,
      `producao/components/ProductionSettings.tsx:252-290`: ações por item via
      `RowActions`; "+" por grupo vira uma ação de página

## 5. Ações de linha (listas)

- [ ] 5.1 Aplicar `RowActions` + linha clicável em:
      `vendas/orcamentos/.../QuotationsData.tsx:227-279,357-410` (primária:
      Imprimir; menu: Duplicar, Histórico, Excluir); `vendas/ordens-de-servico/.../OrdersData.tsx:333-470`
      (primária: Imprimir via do cliente; menu: Ficha, Emitir nota, Ver DANFE,
      Histórico, Cancelar venda); `financeiro/.../TransactionsData.tsx:281-406`
      e `FinancialFlowData.tsx` (primária com rótulo "Receber"/"Pagar";
      menu: Parcelas, Observações, Histórico, Cancelar movimentação);
      `producao/agenda-de-entrega/.../DeliveryScheduleData.tsx:325-443`
      (primária: Agendar; menu: Observações, Faturar, Editar parcelas,
      Finalizar serviço; o botão NF "recurso indisponível" sai);
      `cadastros/clientes/.../ClientsData.tsx:228-256`,
      `cadastros/fornecedores/.../SuppliersData.tsx`,
      `configuracoes/produtos/.../ProductsData.tsx:425-461`,
      `configuracoes/.../colaboradores-e-usuarios/components/TableData.tsx:216-242`
      (um lápis "Editar" + menu "Editar usuário"), `configuracoes/financeiro/despesas-fixas/.../FixedExpenses.tsx:449-478`
      ("Lançar" com rótulo), `financeiro/folha-de-pagamento/components/Payroll.tsx:253-256`
      (linha abre; lápis sai), `producao/projetos/components/Projects.tsx:108`,
      `configuracoes/produtos/processos/components/Processes.tsx:144-203`,
      `estoque/components/Stock.tsx:149`, `configuracoes/.../ProductionSettings.tsx`
- [ ] 5.2 Ícones sem nome: adicionar `aria-label`+Tooltip ou migrar para
      `RowActions` em `NewClient/index.tsx:433-441`, `NewSupplier.tsx:253-261`,
      `AddressTab.tsx:52-60`, `ResponsibilitiesTab.tsx:38-46`,
      `ImportClientModal.tsx:339-346`, `NewProduct.tsx:842-855`,
      `NewProductGroup.tsx:210-218`, `SubscriptionSummaryCards.tsx:125-132`,
      `InvoiceItems.tsx:263,275`, `InvoiceRecipientSection.tsx:83-100`,
      `CfopRow.tsx:76-79`, `AssetDetail.tsx:171-190`,
      `SidebarComponent.tsx:260`, `UserDropdown.tsx:56`, `HelpButton.tsx:34-40`,
      `Topbar.tsx:83-93`, `ExportDataButton.tsx:125-132`, `FormInput.tsx:122-131`
      (mostrar senha com `aria-pressed`, sem `tabIndex=-1`), acordeões
      (`Summary.tsx:197-205`, `Delivery.tsx:79-87`, `PaymentConditions.tsx:111-119`,
      `IssueInvoiceForm.tsx:777-785`)
- [ ] 5.3 Lint em erro: `jsx-a11y/control-has-associated-label`; regra própria
      para `title=` em `Button`/`button`

## 6. Ação principal com rótulo e detalhes

- [ ] 6.1 `financeiro/frente-de-caixa/components/PDV.tsx:383-403`: "Receber"
      `primary lg` com rótulo por venda; `:238-300` "Fechar caixa" primária,
      Sangria/Suprimento secundárias
- [ ] 6.2 `nota-fiscal/emitir/components/InvoiceResultsTable.tsx:1500,1519`:
      "Emitir nota" com rótulo (`secondary` na linha; primária da página é
      "Emitir nota" em massa quando há seleção)
- [ ] 6.3 `base-de-custos/mao-de-obra/components/LaborCosts.tsx:136-144`:
      "Definir carga horária" com rótulo; "Precificar a hora" sem handler sai
- [ ] 6.4 Cabeçalhos de detalhe (forma; o layout vem de `ObjectHeader` em
      `navegacao-e-cabecalhos`): `QuotationActions/index.tsx:47-85` (primária
      por estado: Aprovar em digitação, Concluir em aprovado; Prévia
      secundária; Rejeitar/Reabrir no menu), `OrderActions/index.tsx:101-117`
      (primária Imprimir via do cliente; Ficha secundária; Cancelar venda no
      menu), `ClientActions.tsx:106-123` (Editar primária; Inativar e "Tornar
      fornecedor" no menu), `InvoiceFormHeader.tsx:125-151` e
      `IssueNfseForm.tsx:751-814` (Emitir primária em rodapé fixo; Cancelar
      digitação terciária), `PayrollActions.tsx:177-202` (Fechar folha
      primária; Imprimir secundária; Reabrir no menu, visível desabilitado com
      motivo), `AssetDetail.tsx:171-190` (Editar primária; Vender/Inativar no
      menu), `ProjectDetail.tsx:227-234` (Alterar entrega secundária; Cancelar
      projeto no menu)
- [ ] 6.5 Remover `common/CustomButton.tsx` depois de migrar os usos
      (`QuotationActions`, `OrderActions`, `PayrollActions`, `InvoiceFormHeader`,
      `QuotationItems.tsx:763-780` "Adicionar item" vira `secondary` no
      cabeçalho do card, `PayrollItems.tsx:312-356`)

## 7. Confirmações

- [ ] 7.1 Migrar para `ConfirmDialog`: os 14 usos de `GlobalAlertDialog`, os
      16 `AlertDialog` avulsos e os rodapés com `error` (lista por `grep -rl
      "AlertDialog\|alertDialog.open" src`)
- [ ] 7.2 Confirmação onde não há: `RejectQuotation.tsx:91-99`,
      `QuotationComposition.tsx:451-455,533-540`, `FixedExpenses.tsx:165-180`
      (sem os 600 ms), `InvoiceResultsTable.tsx:1416-1423,1504-1512`,
      `InvoiceItems.tsx:275`, `series-de-venda/components/Main.tsx:148-166`
      (usar `DisableSerie.tsx`), `ManagerBoard.tsx:460-464` ("Parar relógio"),
      `IssueNfseForm.tsx:784-789`/`StandaloneNfeForm.tsx:710-715` ("Cancelar
      digitação" com guarda de não salvo)
- [ ] 7.3 Tom certo: destrutivo em `status-de-orcamento/.../Delete/index.tsx:85-89`,
      `motivos/.../Delete:91-94`, `origens/.../Delete:77,Hide:81`,
      `EmissoresListClient.tsx:445`, `CfopListClient.tsx:284`,
      `NaturezaListClient.tsx:287`, `CancelSubscriptionDialog.tsx:230-237`
      (sem check); padrão (sem triângulo) em `ApproveQuotation.tsx:131-137`,
      `OpenQuotation.tsx:80-86`, `FinishQuotation.tsx:157-164`,
      `PayrollActions.tsx:65` ("Sim" → "Fechar folha")
- [ ] 7.4 Rótulos ambíguos: `CancelTransaction/Alert.tsx:159,167`,
      `TransactionDetails/index.tsx:97-98`, `CancelOrderButton.tsx:233-243`,
      `CancelOrder.tsx`, `ProjectDetail.tsx:134-135`, `CashDayDetail.tsx:287-289`
      ("Fechar" → "Concluir"/terciário "Voltar"), `BillService.tsx:62-86`
      (usar o store)
- [ ] 7.5 Descrições vazias ou genéricas: `ClientActions.tsx:74`,
      `Categories/index.tsx:80-82` (quantos registros usam o grupo),
      `ItemActions/Delete/index.tsx:71-74` (nomear o item),
      `status-de-orcamento/.../Delete/index.tsx:79-80` (sr-only "motivo")

## 8. Vocabulário

- [ ] 8.1 Codemod de rótulos por `consts/acoes.ts`: "Cadastrar <x>"/"Criar
      <x>"/"Acrescentar <x>" (botão de página) → "Novo <x>"; "Acrescentar"
      dentro de formulário → "Adicionar"; "Retirar"/"Apagar" → "Remover"/
      "Excluir" conforme o efeito; "Fechar" em formulário → "Cancelar";
      "Voltar" em diálogo não-wizard → "Cancelar"; "Desativar" → "Inativar";
      remover `RightIcon={IconCircleCheck}` de "Salvar" (11) e `IconArrowRight`
      fora de wizard
- [ ] 8.2 Casos nomeados: `NewQuotation.tsx:302,349`, `NewClientTriggerButton.tsx:14`
      ("Pré-cadastro de cliente" → "Novo cliente"), `QuotationItems.tsx:157-159,395,482,778`,
      `QuotationComposition.tsx:304,453,535,581`, `SearchClientModal.tsx:114`,
      `ClientDetailsModal.tsx:321`, `ImportClientModal.tsx:279,375-385,475`,
      `ImportProductModal.tsx:266-269,380,389`, `CfopListClient.tsx:195,215`,
      `CfopRow.tsx:91`/`NaturezaRow.tsx:130`, `EditSubcategoryDialog/index.tsx:225-226`,
      `ConfigureProfile/index.tsx:151`, `EditItem/index.tsx:179,310`,
      `NewSerie/index.tsx:216`, `AssemblyEditor.tsx:2856,2965`,
      `ProductFields.tsx:214`, `ProductionSettingsDialogs.tsx:722`,
      `NextStepDialog.tsx:318`, `PaymentConditionsData.tsx:158-166`,
      `DocumentosTabs.tsx:393` ("Gerenciar" → "Gerenciar documentos"),
      `BankAccounts.tsx:275-277` (ícone de mais), `NewProduct.tsx:846-855`
      (ícone à esquerda)
- [ ] 8.3 Remover botões de desenvolvimento e sem efeito: `NewTransaction/index.tsx:346-357`,
      `NewPaymentCondition/index.tsx:476-487`, `EditFixedExpense.tsx:261-270`,
      `NewProduct.tsx:807-817`, `OrderItems.tsx:259-266,402-430,537-547`
      (desabilitados permanentes → removidos ou com motivo),
      `SubscriptionSummaryCards.tsx:176-182`, `ReceiveSaleDialog.tsx:217-229`,
      `PricingList.tsx:200-203`, `LaborCosts.tsx:141-144`,
      `DeliveryScheduleData.tsx:135-140,365-388`, `ClientDetailsModal.tsx:56-157`
      (modal duplicado)

## 9. Fechamento

- [ ] 9.1 Remover aliases legados de `button.tsx`; lint em erro para variantes
      desconhecidas; sandbox atualizado
- [ ] 9.2 Capturas: `buttons` repetidos ≥ 3 por rota = 0 (fora "Cancelar"/
      "Salvar" em diálogos fechados); `iconOnlyNoLabel` = 0
- [ ] 9.3 `design.md` da raiz §3.1 com o sistema de 4 níveis e o vocabulário
