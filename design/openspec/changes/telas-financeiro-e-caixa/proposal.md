# Telas de financeiro e caixa

## Why

No financeiro a cor e o ícone substituem o texto onde ele era essencial: o
status de uma movimentação é um polegar cujo sentido depende da cor, três
dicionários discordam sobre "pendente", atrasado é indistinguível de
pendente e enums crus vazam; dinheiro é verde ou vermelho por linha, à
esquerda e sem numeral tabular; a lista "A pagar/A receber" tem cinco ícones
por linha, duas colunas sem cabeçalho e nenhuma coluna de vencimento ou
status; a ação principal do PDV ("Receber") é um polegar fantasma e o
primário da página é um contorno; o fluxo financeiro esconde os totais por
padrão, perde os filtros para quem só visualiza e tem os KPIs quebrados por
uma classe com erro de digitação; o detalhe é um diálogo de 900 px que abre
outros diálogos; excluir despesa fixa não confirma; "Cancelar" senta ao lado
de "Cancelar movimentação"; "Fechado" é amarelo; imprimir chama
`window.print()` na página inteira; a folha usa azulejos de 70 px sem hover
como ações. Evidência: `design/openspec/design/sistema-visual.md` §2 e o
relatório de módulo resumido em `design.md`.

## What Changes

- **Status único** pelo dicionário: `StatusBadge` em listas, detalhes e
  filtros; polegares e pontos saem; "Atrasada" ≠ "Pendente"; "Fechado" é
  sucesso; nada de enum cru.
- **Dinheiro:** `Money` neutro à direita em todas as tabelas e KPIs;
  negativo com sinal; `MoneyInput` único (conferência de caixa, lançamentos,
  parcelas).
- **Movimentações (a pagar, a receber, fluxo):** uma tabela compartilhada
  (`TransactionsData` e `FinancialFlowData` unificados) com colunas
  Descrição, Pessoa, Vencimento, Status, Valor, Conta/forma, ações; linha
  abre o `Sheet` de detalhe; `RowActions` com "Receber"/"Pagar" com rótulo e
  o resto no menu; cancelado e observações como badge; busca, status e
  período no `ListToolbar` para todo perfil; totais sempre visíveis
  (ocultar valores é uma preferência, não o padrão); uma primária "Novo
  lançamento" com tipo; detalhe em `Sheet lg` com seções (dados,
  parcelas, pagamentos, histórico) que não abre diálogos por cima; pagar,
  compensar, cancelar como `ConfirmDialog`/`Sheet` encadeado; parcelas como
  tabela compacta.
- **Despesas fixas e folha:** "Lançar" com rótulo; confirmação ao excluir;
  bulk em `SelectionBar`; folha com `ObjectHeader` (colaborador como título),
  ações primária/secundária/menu, itens em tabela com ações nomeadas,
  "Reabrir" visível desabilitado com motivo; filtros de mês compartilhados.
- **Controle de caixa e PDV:** uma primária por página; ação por conta
  secundária; "Receber" com rótulo e tamanho grande; histórico paginado;
  relatório do dia como página de impressão (não `window.print` da app);
  entrada/saída em `SegmentedControl`; datas no `DatePicker`; "Concluir"
  no lugar de "Fechar"; descartar venda com confirmação destrutiva;
  "Comprovante" removido até existir.
- **Correções pontuais** (`tasks.md`): `text-lG`, `emptyData=false`,
  "Teste", "Fornecedor" para colaborador, acentos em exportações, `OpenCashAction`
  morto, `DatePicker` morto, `PaymentSplit` × `NfcePaymentSection`.

## Capabilities

### New Capabilities

- `telas-de-financeiro-e-caixa`: o que as listas de movimentação, o fluxo,
  as despesas fixas, a folha, o controle de caixa e o PDV exibem e como se
  comportam.

### Modified Capabilities

Nenhuma.

## Impact

- `src/app/(app-sidebar)/financeiro/**` (≈ 110 arquivos), `consts/receivables.ts`,
  `consts/financial.ts`, `consts/payroll.ts`, `consts/cashControl.ts`,
  `consts/cashAccounts.ts`, `common/charts/**` (totais).
- Depende de `navegacao-e-cabecalhos` e `componentes-adequados`.
- Achados fora de escopo (regras): rótulo final de PENDING em recebíveis
  ("Não realizado" × "Pendente"); se totais podem ser ocultos por
  permissão; Banco/Conta desabilitados por `canCreateBankAccount` (motivo a
  exibir); o que "Compensar" significa para o usuário (título do diálogo).
