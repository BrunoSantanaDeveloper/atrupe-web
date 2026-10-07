# Design — telas de financeiro e caixa

Arquitetura compartilhada: `../../design/sistema-visual.md`.

## Context

Resumo do relatório de módulo:

- Status: `consts/receivables.ts:23-56` (polegares; PENDING = OVERDUE);
  `consts/financial.ts:7-12`; `FinancialFlowFilter.tsx:139`; `PayrollMovement.tsx:102-104`
  (sem OVERDUE/PROVISIONED); `consts/payroll.ts:7-8`, `cashControl.ts:18-19`,
  `cashAccounts.ts:17-18` ("Fechado" amarelo).
- Movimentações: `TransactionsData.tsx:162-165` (colunas sem cabeçalho,
  sem status/vencimento), `:259-266` (valor à esquerda, colorido),
  `:281-406` (5 ícones), `:292-296,336-340` (pontos); `Transactions.tsx:33,49-51`
  (`emptyData=false`); `TransactionsFilter.tsx:40-55` (só forma de
  pagamento); `TransactionDetails/index.tsx:117,378-400` (900 px + diálogos
  por cima), `:312-315` (rótulo sob valor, cinza-claro), `:193`
  ("Carregando…"); `CancelTransaction/Alert.tsx:127-131,159,167`;
  `Notes/index.tsx:79` (950 px); `Compensate/index.tsx:168-236` (título
  errado, 5/7 campos desabilitados, sem Cancelar); `Payment/index.tsx:332-341`;
  `ViewPayment/index.tsx:83`; `EditInstallments/index.tsx:262-388`
  (opacity, hand-aligned); `NewTransaction/index.tsx:208-214` (vermelho),
  `:339-342` (Switch), `:346-357` ("Teste"); `PrintReceiptButton` ×3.
- Fluxo: `FinancialFlowFilter.tsx:102` (gate), `TransactionsTotals.tsx:120-163`
  (`text-lG`), `FinancialFlow.tsx:196,238-266` (totais ocultos, badge como
  modo, duas primárias), `TopActions.tsx:56-99`, `FinancialFlowData.tsx`
  (cópia divergente de `TransactionsData`, `:457` loading compartilhado,
  `:550-553`), filtros sem rótulo, strings sem acento, `DatePicker.tsx`
  morto, `ImportFinancialModal.tsx:456,479`.
- Despesas fixas: `FixedExpenses.tsx:165-180` (sem confirmação + 600 ms),
  `:368,396`, `:449-478`, `:490-493`; `FixedExpensesFilter.tsx:171-206`;
  `LaunchMovementModal.tsx:151,175-184`; `OpenCashAction.tsx` morto.
- Folha: `Payroll.tsx:253-256,285-289`; `PayrollFilter.tsx` (cópia);
  `PayrollDetail.tsx:93-94`; `PayrollActions.tsx:65,130-202`;
  `PayrollItems.tsx:182-189,282-356`; `PayrollMovement.tsx:76,107-113`;
  `NewItem/index.tsx:145-157`.
- Caixa: `CashControl.tsx:284-343,386-403,468-471,521,610-666`;
  `CashDayDetail.tsx:158,227,283,287-289`; `CashDayDialogs.tsx:115,192-197,280,291-306,623,662-667`;
  `CashCountCheck.tsx:36-44`.
- PDV: `PDV.tsx:195,238-300,383-476,553-557,646-660`; `CashDialogs.tsx:231,428,555-600`;
  `ReceiveSaleDialog.tsx:217-232`; `PaymentSplit.tsx`.
- Bom: caixa/PDV com `Topbar` e abas com contador, aviso de caixa travado
  antes do bloqueio, dinheiro à direita; `CashCountCheck` (cego/simples com
  explicação); barras de seleção; `RejectionReasonAction`.

## Goals / Non-Goals

**Goals:**
- Qualquer movimentação se lê numa linha: o que, quem, quando, status, quanto.
- Receber/pagar é a ação mais óbvia de cada tela.
- O caixa e o PDV têm uma ação primária clara e sem surpresas.

**Non-Goals:**
- Regras de compensação, estorno, fechamento de caixa e folha.
- Relatórios financeiros (`telas-dashboard-e-relatorios`).

## Decisions

### 1. Uma tabela de movimentações

`financeiro/_components/transactions/TransactionsTable.tsx` única,
parametrizada por contexto (`payable | receivable | flow`), colunas
Descrição (+ pessoa como `secondary`), Vencimento, Status (`StatusBadge`;
cancelado e "tem observação" como badges), Valor (`Money numeric`), Conta ·
Forma, ações. `FinancialFlowData` sai. Linha abre `Sheet lg` de detalhe
(`?painel=`).

### 2. Detalhe em `Sheet`

Seções: resumo (`dl`: valor total, pago, restante, vencimento, pessoa,
categoria), parcelas (`Table compact`, parcelas pagas com badge "Paga" e sem
controles), pagamentos, observações, histórico. Ações no cabeçalho do
sheet: primária "Receber"/"Pagar" (abre o formulário de pagamento no mesmo
sheet via pilha), secundária "Editar parcelas"; menu: Compensar, Imprimir
recibo (split: com/sem assinatura), Cancelar movimentação (destrutivo,
desabilitado com motivo quando não pode).

### 3. Novo lançamento

Uma primária "Novo lançamento" que abre `Sheet lg` com `SegmentedControl`
Receita/Despesa no topo (cor da marca; o tipo aparece como badge), `FormGrid`,
parcelas em tabela compacta, "Marcar como pago" `Checkbox`. Nas páginas
"A pagar"/"A receber" o tipo vem pré-selecionado.

### 4. Fluxo financeiro

`PageHeader` com KPIs (`kpi-*`) sempre visíveis (ocultar valores é um
toggle persistido na preferência do usuário, com ícone de olho e rótulo);
`ListToolbar` com período (`DateRangePicker`), status, conta, forma, busca —
todos rotulados e visíveis para quem visualiza; base de data (vencimento ×
pagamento) como `SegmentedControl` rotulado; ordenação na coluna.

### 5. Caixa e PDV

Controle de caixa: primária "Abrir caixa de hoje"/"Fechar caixa" conforme
estado; ação por conta `secondary`; "Transferir entre caixas" secundária;
histórico com `Pagination`; relatório do dia em `Sheet` com botão "Imprimir"
que abre `/financeiro/controle-de-caixa/[dia]/imprimir` (view de impressão
com CSS próprio). PDV: "Receber" `primary lg` por venda; "Fechar caixa"
primária da página; sangria/suprimento secundárias; filas com `EmptyState`;
textos longos em `Popover` de ajuda; descarte com `ConfirmDialog`
destrutivo; `PaymentSplit` como componente único (também para NFC-e).

### 6. Folha

Lista: linha abre a folha; filtro de mês em `MonthPicker` compartilhado
(`common/MonthFilter.tsx`, também para despesas fixas). Detalhe: `ObjectHeader`
(colaborador, período, total, status); "Fechar folha" primária, "Imprimir"
split secundária, "Reabrir" no menu (visível, desabilitado com motivo);
itens em `Table` com "Adicionar acréscimo/desconto" secundário no cabeçalho
(`SegmentedControl` de tipo); movimentação com colunas corretas e status do
dicionário.

## Risks / Trade-offs

- [Unificar as duas tabelas pode perder colunas específicas do fluxo] →
  colunas por contexto (`flow` mostra "Realizado" e conta); testes e2e dos
  dois cenários.
- [Totais sempre visíveis expõem valores em tela compartilhada] → toggle
  persistido por usuário; padrão visível (como Stripe/QuickBooks).
- [Página de impressão nova] → mesmo conteúdo do `CashDayDetail`, só layout
  de impressão.

## Migration Plan

PRs: (1) dicionário de status aplicado + `Money` + tabela única; (2) detalhe
em sheet + novo lançamento; (3) fluxo (KPIs, filtros, totais); (4) despesas
fixas + folha; (5) caixa + PDV.

## Achados fora de escopo

- Rótulo de PENDING em recebíveis; permissão para ocultar totais; motivo de
  Banco/Conta desabilitados; significado de "Compensar".

## Open Questions

Nenhuma que bloqueie; os rótulos pendentes usam os atuais até resposta.
