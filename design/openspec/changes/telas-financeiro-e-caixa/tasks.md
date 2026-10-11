## 1. Status e dinheiro

- [ ] 1.1 `consts/receivables.ts`, `financial.ts`, `payroll.ts`,
      `cashControl.ts`, `cashAccounts.ts`: derivar do dicionário
      (`cores-e-contraste` 4.x); sem polegares; PENDING ≠ OVERDUE; CLOSED
      sucesso; REOPENED aviso; `PayrollMovement.tsx:102-104` via dicionário
- [ ] 1.2 `Money` em todas as tabelas e KPIs do módulo (`TransactionsData`,
      `FinancialFlowData`, `FixedExpenses.tsx:368,396`, `Main.tsx:463-466`,
      `CashControl.tsx:241-270,570-594`, `PayrollMovement.tsx:76,107-113`,
      `PDV`); "–" único para ausente
- [ ] 1.3 `MoneyInput` em `CashCountCheck.tsx:36-44`, `NewTransaction`,
      `InstallmentsForm`, `EditInstallments`, `LaunchMovementModal`,
      `CashDayDialogs`, `CashDialogs`, `PaymentSplit`; `DatePicker` em
      `CashDayDialogs.tsx:192-197,662-667` e demais nativos

## 2. Movimentações (a pagar, a receber, fluxo)

- [ ] 2.1 `_components/transactions/TransactionsTable.tsx` única
      (`context="payable|receivable|flow"`): colunas Descrição (+ pessoa),
      Vencimento, Status (`StatusBadge` + badges Cancelada/Observação),
      Valor (`Money numeric`), Conta · Forma (+ Realizado em `flow`), ações;
      linha abre `Sheet` (`?painel=`); `RowActions` ("Receber"/"Pagar" com
      rótulo; menu: Editar parcelas, Observações, Imprimir recibo (split),
      Compensar, Histórico, Cancelar movimentação com `disabled`+motivo);
      `SelectionBar` neutra; `Pagination`; `TableGroupRow` por dia no fluxo;
      loading por item; apagar `FinancialFlowData.tsx`
- [ ] 2.2 `Transactions.tsx:33,49-51`: `QueryState` real (remover
      `emptyData=false`); `TransactionsFilter.tsx` → `ListToolbar` (busca,
      status, período, forma, conta) rotulado
- [ ] 2.3 Detalhe → `Sheet lg` (`TransactionDetails/index.tsx`): seções
      resumo (`dl` rótulo acima do valor, cores legíveis), parcelas
      (`Table compact`; pagas com badge "Paga" sem controles —
      `EditInstallments/index.tsx:262-388`), pagamentos, observações
      (`md`, não 950 px), histórico (esqueleto, não "Carregando…"); ações
      no cabeçalho; pagar/compensar/cancelar via pilha do sheet ou
      `ConfirmDialog` — nunca diálogo sobre o sheet
- [ ] 2.4 `Payment/index.tsx:332-341` (Banco/Conta desabilitados com motivo
      em Tooltip + link), `Compensate/index.tsx:168-236` (título "Compensar
      movimentação", dados somente leitura como `dl`, "Cancelar"),
      `ViewPayment/index.tsx:83` (rótulo pela pessoa: Fornecedor/Colaborador/
      Cliente), `CancelTransaction/Alert.tsx` (`ConfirmDialog` destrutivo,
      gatilho desabilitado com motivo quando não pode)
- [ ] 2.5 `NewTransaction/index.tsx` → `Sheet lg`: `SegmentedControl`
      Receita/Despesa no topo, `FormGrid`, parcelas em `Table compact`
      (`InstallmentsForm.tsx` sem `leading-[44px]`), "Marcar como pago"
      `Checkbox`, sem "Teste"; botão de página "Novo lançamento" (marca);
      em A pagar/A receber tipo pré-selecionado
- [ ] 2.6 Fluxo (`FinancialFlow.tsx`, `TransactionsTotals.tsx`, `TopActions.tsx`,
      `FinancialFlowFilter.tsx`): KPIs `kpi-*` (corrige `text-lG`) sempre
      visíveis + toggle "Ocultar valores" rotulado e persistido; filtros
      fora do gate de edição, com rótulos; base de data em `SegmentedControl`;
      ordenação na coluna; modo de visão sem badge colorido; `EmptyState`
      com "Limpar filtros"; exportação com acentos; remover `DatePicker.tsx`
      morto; `ImportFinancialModal` com `Alert` visível e `StatusBadge`
- [ ] 2.7 `PrintReceiptButton.tsx` × `BulkPrintReceiptButton.tsx` ×
      `PayrollActions` print → `common/PrintSplitButton.tsx` ("Imprimir ▾
      · Com assinatura"); sem modal de um checkbox

## 3. Despesas fixas e folha

- [ ] 3.1 `FixedExpenses.tsx`: "Lançar" com rótulo em linha; menu com
      Editar/Remover (Remover desabilitado com motivo quando pago; vocábulo
      único "Excluir"/"Remover" alinhado com folha); excluir com
      `ConfirmDialog` e sem 600 ms; `StatusBadge` Lançada/Pendente; `Money`;
      `EmptyState` com "Nova despesa fixa"; bulk "Lançar selecionadas" em
      `SelectionBar`; `FixedExpensesFilter` → `ListToolbar` + `MonthFilter`
      (ícones à esquerda); `LaunchMovementModal` `md` responsivo com
      `Checkbox`; apagar `OpenCashAction.tsx`
- [ ] 3.2 `Payroll.tsx`: linha abre a folha (lápis sai); `EmptyState
      kind="no-results"` quando o mês filtrado não tem dados; `PayrollFilter`
      → `MonthFilter`
- [ ] 3.3 `PayrollDetail.tsx` + `PayrollActions.tsx`: `ObjectHeader`
      (colaborador, período, total, status); "Fechar folha" primária
      (`ConfirmDialog` padrão com "Fechar folha"), "Imprimir" split
      secundária, "Reabrir folha" no menu visível/desabilitado com motivo;
      sem `CustomButton`
- [ ] 3.4 `PayrollItems.tsx`: `Table` com `RowActions` (ícones distintos
      para "Cancelar adiantamento" e "Excluir item"); "Adicionar acréscimo
      ou desconto" secundário no `CardHeader` (sem azulejos); remover olho
      oculto e máscara morta; `NewItem` com `SegmentedControl`
- [ ] 3.5 `PayrollMovement.tsx`: colunas Vencimento (data) e Valor
      separadas; status pelo dicionário

## 4. Controle de caixa

- [ ] 4.1 `CashControl.tsx`: `PageHeader` com primária por estado ("Abrir
      caixa de hoje"/"Fechar caixa"), "Transferir entre caixas" secundária,
      "Abrir caixa de outro dia" no menu; ação por conta `secondary`;
      ícones do dicionário (fechar `IconLock`, ajuste `IconAdjustments`,
      ver dia `IconEye` ou linha clicável — remover a frase "abre na lupa");
      histórico com `Pagination` e `EmptyState`; `Money numeric`; "–" único;
      esqueleto com forma
- [ ] 4.2 `CashDayDetail.tsx` → `Sheet lg` com `ObjectHeader` compacto
      (dia, status, saldo), ícone de relatório, status em caixa de frase,
      botão "Imprimir" abrindo `/financeiro/controle-de-caixa/[dia]/imprimir`
      (view de impressão com CSS próprio); botão de fechar "Concluir"/
      terciário "Fechar painel"
- [ ] 4.3 `CashDayDialogs.tsx`: `DatePicker`; entrada/saída em
      `SegmentedControl`; submit habilitado com erros inline (ou disabled
      com Tooltip do que falta); `Cancelar` terciário; `BillService`-like
      confirmações via store
- [ ] 4.4 `CashCountCheck.tsx`: `MoneyInput`; status words com `StatusBadge`

## 5. PDV

- [ ] 5.1 `PDV.tsx`: "Receber R$ X" `primary lg` por venda; "Fechar caixa"
      primária da página; Sangria/Suprimento secundárias; ícones do
      dicionário (faturar `IconReceipt`, cancelar venda `IconBan`, descartar
      `IconTrash`); filas com `EmptyState` (sem cabeçalho de tabela vazio) e
      busca na fila "A receber"; parágrafos explicativos em `Popover` de
      ajuda; esqueleto com forma
- [ ] 5.2 `CashDialogs.tsx`: `FormLabel`; "Descartar e lançar perda" como
      `ConfirmDialog` destrutivo; `MoneyInput`
- [ ] 5.3 `ReceiveSaleDialog.tsx`: remover "Comprovante" sem efeito (ou
      implementar); rodapé com `secondary` + `primary`; `PaymentSplit`
      único (também usado pela NFC-e)

## 6. Fechamento

- [ ] 6.1 Capturas antes/depois de a pagar, a receber, fluxo, despesas
      fixas, folha (lista e detalhe), caixa e PDV
- [ ] 6.2 `e2e/financial/*.spec.ts`, `e2e/bank/*.spec.ts` atualizados:
      receber a partir da linha, painel de detalhe, novo lançamento, filtros
      visíveis para visualizador, primária única no caixa, PDV receber
