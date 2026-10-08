## 1. Lista única

- [ ] 1.1 Quebrar `InvoiceResultsTable.tsx` em `InvoiceList.tsx`,
      `invoice-columns.tsx`, `invoice-actions.tsx`, `invoice-filters.tsx`;
      `Table` do kit com `TableSkeleton`, `EmptyState` (`error` com retry
      mantido), `Pagination`
- [ ] 1.2 Colunas: Documento (`Badge` neutro de tipo + número), Origem,
      Cliente, Data, Status (`StatusBadge`: AUTHORIZED "Autorizada" em todo
      lugar), Valor (`Money numeric`), ações; remover "ID: xxxx",
      `text-blue-700`, verde como acento (`:848,1552,1568` → marca)
- [ ] 1.3 `RowActions`: "Emitir nota" com rótulo em linha quando elegível;
      menu ⋯ (Ver DANFE `IconFileInvoice`, Consultar status `IconRefresh`,
      Reprocessar `IconRepeat`, Cancelar nota, Inutilizar, Excluir rascunho
      com `ConfirmDialog` e aviso "Rascunho excluído"); `IconBan` deixa de
      ser "status"; checkbox com Tooltip real explicando inelegibilidade
- [ ] 1.4 `ListToolbar`: tipo, origem (Pedido/Avulsa), status, período
      (`DateRangePicker`), busca; remover os três mecanismos sobrepostos
      (`:843-881`, `InvoiceFilter.tsx:87-104`, pílulas de ambiente);
      ambiente no `PageHeader` como badge sempre visível
- [ ] 1.5 `SelectionBar` "Emitir selecionadas (n)"; rótulo "Pedidos de venda"
      único (sem "OS(s)")
- [ ] 1.6 Remover `NfeAvulsaSection.tsx` (vira filtro), `EmitirTabsWrapper.tsx`,
      `ClientSearchSidebar.tsx`, `formatCurrency`/`formatDate` locais

## 2. Escolha do tipo

- [ ] 2.1 `/nota-fiscal/emitir/nova/page.tsx` com `Stepper` (Tipo → Dados)
      e `RadioCard`s (NF-e, NFS-e, NFC-e, Consolidada) com descrição de uso
- [ ] 2.2 Remover `IssueInvoice.tsx` (modal), `InvoiceTypeSelectModal.tsx`
      e a lista de `avulsa/page.tsx`; "Nova nota" no `PageHeader` da lista
      aponta para `/nova`

## 3. Página de emissão

- [ ] 3.1 `nota-fiscal/components/InvoicePageShell.tsx`: `PageHeader`
      (breadcrumb, título por tipo, cliente, `StatusBadge`, badge de
      ambiente), `SectionNav`, coluna de `TotalsBlock` fixa (rodapé fixo
      < `lg`), `SaveBar` (Cancelar digitação terciária com guarda; Salvar
      rascunho secundária; Emitir primária com `ConfirmDialog` de resumo e
      `isLoading`)
- [ ] 3.2 NF-e de pedido (`IssueInvoiceForm.tsx`, `InvoiceFormHeader.tsx`):
      migrar para o shell; seções abertas (sem accordion) na ordem Emitente,
      Destinatário, Itens, Transporte, Pagamento, Informações adicionais;
      `Alert warning` de homologação; apagar `InvoiceFormHeader.tsx`
- [ ] 3.3 `InvoiceTotalsSection.tsx` → `TotalsBlock` (não colapsável;
      rótulos completos; "Valor da nota" em `kpi-value`); rótulos de
      seção em caixa de frase (`InvoiceRecipientSection.tsx:125`,
      `InvoiceEmissionConfigSection.tsx:126`)
- [ ] 3.4 `InvoiceItems.tsx`: `Table numeric compact` (manter `:223-248`);
      `StatusBadge` "Pendente" + "Configurar pendentes (n)" abrindo `Sheet lg`
      em pilha; `RowActions` (Editar; Remover com confirmação, ícone
      legível); sem checkboxes sem função; `type-body`
- [ ] 3.5 `InvoiceRecipientSection.tsx:83-100`, `InvoiceTransport.tsx:170,304-307`:
      `RowActions`/Tooltip, `Alert info`, somente leitura como `dl`
- [ ] 3.6 `InvoicePayment.tsx`: `Button` com `type`, `DatePicker`,
      `MoneyInput`, parcelas em `Table compact` (igual ao financeiro)
- [ ] 3.7 `InvoiceEmissionConfigSection.tsx`: `SegmentedControl` Entrada/
      Saída e Sim/Não; selects com rótulos humanos + código em `helper`;
      "Próximo documento" com acento
- [ ] 3.8 NFS-e (`IssueNfseForm.tsx`): shell; `Checkbox` do kit; badge de
      contagem neutro; `StatusBadge`; sem navegação sem guarda (`:890-899`)
- [ ] 3.9 Avulsas (`StandaloneNfeForm.tsx`, `StandaloneNfseForm.tsx`,
      `nfce/*`): shell; `Alert` do kit; `NfcePaymentSection` → `PaymentSplit`
      único; `NfceTotalsSection` → `TotalsBlock`; tons em vez de paletas;
      "Devolução" com o tom do dicionário
- [ ] 3.10 `consolidado/page.tsx` e `IssueConsolidatedInvoiceForm.tsx`:
      shell; acentos; voltar pelo breadcrumb; `EmptyState kind="forbidden"`
- [ ] 3.11 `Combobox` em `ProductSelector` (único), `ClientSelect`,
      `SupplierSelect`

## 4. Diálogos fiscais

- [ ] 4.1 `CancelNfeDialog.tsx`, `InutilizarNfceDialog.tsx`,
      `ContingenciaNfceDialog.tsx`: `ConfirmDialog` destrutivo/atenção com
      `Alert` do kit, motivo em `FormTextarea` com `required`, rótulos verbo
      + objeto; `RejectionReasonAction` mantido com `Alert error` + "Reemitir"
- [ ] 4.2 `InvoiceRecipientEditDialog.tsx`, `InvoiceItemEditDialog.tsx`:
      `Sheet lg` com `FormGrid`, guarda de não salvo

## 5. Fechamento

- [ ] 5.1 Capturas antes/depois da lista, de `/nova`, da emissão NF-e, NFS-e,
      NFC-e e avulsa em 1280 e 1440
- [ ] 5.2 `e2e/fiscal/*.spec.ts` atualizados: lista única com filtro de
      origem, stepper, emissão com totais fixos, confirmação de emissão,
      excluir rascunho com confirmação, guarda ao cancelar digitação
