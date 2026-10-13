# Design — telas de vendas

Arquitetura compartilhada: `../../design/sistema-visual.md`.

## Context

Resumo do relatório de módulo:

- `vendas/orcamentos/components/QuotationsTable/QuotationsData.tsx`: 5 ícones
  por linha (`:357-410`), linha não clicável (`:227-279`, só a descrição é
  link), "Editar" duplica o link, valor verde à esquerda (`:285`), `colSpan`
  errado (`:215,410`), `lastPage = total/10` (`:452`), "⚡" (`:270,278`), duas
  colunas de status (`:203-204`), barra de seleção vermelha (`:167-181`).
- `Quotations.tsx`: aba DONE "Aguardando" (`:244`), filtros somem em aba
  vazia (`:331-345`), busca como primária (`:306-322`).
- Detalhe: `Quotation.tsx:203-238` + `Summary.tsx:164` (fechado) +
  `PaymentConditions.tsx:155-178` (total em grade de 7, subtotal = itens);
  `QuotationActions/index.tsx:47-85` azulejos; `RejectQuotation.tsx:91-99`
  sem confirmação; `Summary.tsx:134-151,177-195` data nativa e `title=`;
  `:257` "Data de rejeição: –"; `:230` vs `:296-298` mascaramento;
  `Delivery.tsx:62-67,98`.
- Itens: `QuotationItems.tsx:247-358` números à esquerda, `:295-313` expand
  cru, `:758` só `Separator` quando vazio, `:763-780` azulejo "Adicionar
  item"; `OrderItems.tsx:259-266` "Editar item" sem handler, `:402-430,537-547`
  desabilitados permanentes, `:350-357` "-R$ 0,00".
- Diálogos: 12 larguras; `PaymentConditions/index.tsx:245-345` (15 campos +
  `CommissionDialog`), `Delivery/index.tsx:238-433` (Número antes de Rua),
  `QuotationComposeModal.tsx:386-406` (1040 px, sem validação),
  `QuotationItemsModal.tsx:196-256` (sem loading, sem cabeçalho),
  `QuotationCategorySelectorModal.tsx:104` (mesmo título duas vezes),
  `ItemActions/Notes/index.tsx:80-84`.
- Ordens: `OrdersData.tsx:333-470` (8 ícones, duas impressoras,
  `IconFileInvoice` ver/emitir), `:231-243` sem data/NF, `:168-174` badges
  de ambiente soltos; `CancelOrderButton.tsx:192,233-243`; `OrderActions/index.tsx:101-117`;
  `Financial.tsx:168-302` (cores, botões invisíveis).
- Composição/resultado: `review="new"`, voltar para a lista, "--"/"—"/"-",
  `Math.abs` (`QuotationResult.tsx:108`), `toString().replace` (`:122,245`),
  quatro cards-rádio crus.
- Venda rápida: "Cobrar" duas vezes (`QuickSaleQuotation.tsx:107`,
  `QuickSaleCheckout.tsx:402`), faixa ilegível, link para a lista (`:383`).
- Bom: card de status da venda rápida (`QuickSaleCheckout.tsx:497-622`),
  composição e resultado alinham números, `useAlertDialog` em cancelar
  ordem.

## Goals / Non-Goals

**Goals:**
- Abrir, entender e agir num orçamento ou ordem sem clicar em accordion.
- Lista com uma ação visível, resto no menu; dinheiro neutro.

**Non-Goals:**
- Regras de cálculo, estados do orçamento e permissões.
- Reescrever o editor de composição de item além de contêiner e controles.

## Decisions

### 1. `ObjectHeader` por estado

Orçamento: título "Orçamento #1234", subtítulo cliente, `StatusBadge`,
meta Total · Validade · Vendedor · Itens. Primária por estado: em digitação
→ "Enviar"/"Aprovar" (conforme regra), aprovado → "Concluir", concluído →
"Imprimir"; secundárias: "Prévia", "Duplicar"; menu: Rejeitar, Reabrir,
Histórico, Excluir. OS: título "Ordem #", meta Total · Recebido · Entrega ·
NF; primária "Imprimir via do cliente"; secundária "Ficha de produção";
menu: Emitir nota, Ver DANFE, Histórico, Cancelar venda.

### 2. Resumo financeiro como bloco

`common/TotalsBlock.tsx`: lista `dl` alinhada à direita (Itens, Desconto,
Frete, **Total** em `kpi-value`), usado no detalhe, na venda rápida e na
NF. Substitui a grade de sete colunas.

### 3. Itens

`Table numeric` com expansão de linha única (`TableRow expandable` com
chevron `tertiary icon sm`, usado também na composição); `RowActions`
(Editar em linha; Valores, Observações, Imagem, Retirar no menu);
`EmptyState kind="empty"` com "Adicionar item"; "Adicionar item" secundário
no `CardHeader`.

### 4. Contêineres

| Fluxo | Hoje | Alvo |
|---|---|---|
| Condições de pagamento | Dialog 950 | `Sheet lg` com `FormGrid`, parcelas em `Table compact`, comissão como seção |
| Entrega | Dialog 695 | `Sheet lg`, endereço em ordem padrão |
| Compor item (fluxo de produção) | Dialog 1040 | página `/orcamentos/[id]/itens/[itemId]/compor` ou `Sheet xl` com validação |
| Detalhe de produto | Dialog 950 | `Sheet lg` responsivo |
| Escolher item | 2 dialogs | um `Sheet md` com busca (`Combobox`) e "Voltar" |
| Observações / Imagem / Valores | 950 / 400 / 800 | `md` / `md` / `md` |
| Novo cliente a partir do orçamento | Dialog sobre dialog | `Sheet lg` sobre a página; o orçamento recebe o cliente ao fechar |
| Histórico | 692 | `Sheet md` com `Timeline` |

### 5. Lista

Colunas: número/descrição, cliente (link), status (`StatusBadge` com a
etiqueta do usuário ao lado como `Badge` neutro de cor calculada), data,
validade/entrega, valor (`numeric`), NF (na OS), ações. Seleção só com ação
em massa (excluir rascunhos, imprimir). Abas no `PageHeader`: Todos,
Em digitação, Aprovados, Concluídos, Rejeitados (ordem e padrão a confirmar
com regras; a primeira é a padrão).

## Risks / Trade-offs

- [Mudar a primária por estado exige conhecer as transições] → tabela de
  estados do dicionário + confirmação com o OpenSpec de regras antes de
  implementar 3.x; até lá, "Editar"/"Imprimir" como primária neutra.
- [Compor item como página muda a URL] → deep link ganha; voltar leva ao
  orçamento.

## Migration Plan

PRs: (1) listas de orçamentos e ordens; (2) detalhe de orçamento (cabeçalho,
totais, itens, ações); (3) detalhe de OS + financeiro; (4) diálogos →
sheets/páginas; (5) composição/resultado/venda rápida.

## Achados fora de escopo

- Regra do subtotal (`PaymentConditions.tsx:155-178`).
- Rejeitar sem motivos cadastrados (`RejectQuotation.tsx:91-99`).
- Semântica de "Fase atual" × "Status" (etiqueta).
- Mascaramento de CPF/CNPJ do cliente (`Summary.tsx:296-298`).

## Open Questions

- Primária por estado do orçamento (decisão 1): confirmar.
