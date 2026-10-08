# Design — telas de nota fiscal

Arquitetura compartilhada: `../../design/sistema-visual.md`.

## Context

Resumo do relatório de módulo:

- Lista (`nota-fiscal/emitir/components/InvoiceResultsTable.tsx`, 1 600
  linhas): checkboxes em Tooltip vazio (`:958-979,1022-1045`), tipo com cor
  de status (`:1066`), valores verdes à esquerda (`:983,1116`), `text-blue-700`
  (`:1097`), "ID: xxxx" (`:1106`), emitir como ícone (`:1500,1519`), ações
  por tipo de linha (⋯ / ícones / `IconBan` como status), mesmo refresh para
  duas ações (`:1355,1367`), rascunho sem confirmação (`:1416-1423`),
  "OS(s)" × "Pedido de Venda" (`:1541` vs `:1051`), verde como acento
  (`:848,1552,1568`), três filtros (`:843-881` + `InvoiceFilter.tsx:87-104`),
  esqueleto cru (`:893-896`); `NfeAvulsaSection.tsx` (mesma `?page`,
  "Autorizada" × "Emitida", some em erro); `IssueInvoice.tsx` (modal de dois
  passos sem indicador, `group-hover` sem `group`, ambiente só ≥ `xl`,
  `grid-cols-12` com um filho); `EmitirTabsWrapper`/`ClientSearchSidebar`
  mortos.
- Emissão (`nota-fiscal/emitir/[orderId]/components/*`): `InvoiceFormHeader.tsx:93-151`
  (h1 à mão, cliente gray-400, azulejos), `IssueInvoiceForm.tsx:724-810`
  (10 cards, totais por último, banner à mão `:713-721`),
  `InvoiceTotalsSection.tsx:54,79-136` (colapsável, caixa alta, "Outras
  desps."), `InvoiceRecipientSection.tsx:83-125`, `InvoiceItems.tsx:139-275`
  (checkboxes sem função, "Configurar" por linha, `text-[13px]`, remover
  gray-300 sem confirmação), `InvoicePayment.tsx:421-501` (botão cru, data
  nativa, máscara própria, parcelas em cards), `InvoiceEmissionConfigSection.tsx:126,206,248-249,407-408`
  ("1 - Saida"), `InvoiceTransport.tsx:170,304-307`; NFS-e
  (`IssueNfseForm.tsx:751-899`: cabeçalho copiado, Emitir diferente,
  checkbox nativo, badge de contagem em aviso, sair sem guarda); avulsas
  (`StandaloneNfeForm.tsx:690-792`, `NfcePaymentSection.tsx:203-250`,
  `NfceTotalsSection.tsx:45-80` paletas cruas; `avulsa/page.tsx:87`
  `primary-*`); `consolidado/page.tsx:34` (acentos, `history.back`).
- Bom: `InvoiceItems.tsx:223-248` (dinheiro tabular à direita), menu ⋯ da
  NFC-e (`:1270-1391`), estado de erro com retry (`:912-938`),
  `RejectionReasonAction`.

## Goals / Non-Goals

**Goals:**
- Emitir uma nota sem perder de vista o total, o ambiente e o que falta.
- Uma lista, um filtro, um menu de ações.

**Non-Goals:**
- Regras fiscais, validações da SEFAZ, campos obrigatórios por tipo.
- Layout dos PDFs/DANFE.

## Decisions

### 1. Página de emissão

`/nota-fiscal/emitir/[orderId]`, `/emitir-nfse/[orderId]`, `/emitir/avulsa/nfe|nfce|nfse`
compartilham `InvoicePageShell`: `PageHeader` (breadcrumb Nota fiscal ›
Emitir › #pedido; título "NF-e · Pedido #123" ou "NF-e avulsa"; subtítulo
cliente; `StatusBadge` Em digitação; ambiente como badge `tone-warning`
quando homologação, sempre visível); layout de duas colunas em ≥ `lg`:
`SectionNav` + seções abertas (sem accordion) à esquerda, `TotalsBlock`
fixo à direita (em `< lg` vira rodapé fixo); `SaveBar`: "Cancelar
digitação" (terciária, com guarda), "Salvar rascunho" (secundária), "Emitir
NF-e" (primária, `ConfirmDialog` padrão com resumo). `InvoiceFormHeader` e
as cópias saem.

### 2. Itens

`Table numeric compact` com `StatusBadge` "Pendente" nos itens sem
configuração fiscal e ação de seção "Configurar pendentes (n)" que abre
`Sheet lg` iterando pelos itens (pilha com "Próximo"); `RowActions` por item
(Editar; Remover com `ConfirmDialog`); sem checkboxes até existir ação em
massa.

### 3. Lista única

`InvoiceResultsTable` quebrado em `InvoiceList.tsx` (tabela) + `invoice-columns.tsx`
+ `invoice-actions.tsx` (menu por tipo/estado, um único padrão ⋯ com
"Emitir nota" com rótulo como ação em linha quando elegível). Colunas:
Documento (tipo como `Badge` neutro + número), Origem (pedido/avulsa),
Cliente, Data, Status (`StatusBadge`), Valor (`Money`), ações. Filtros:
`ListToolbar` com tipo (NF-e/NFS-e/NFC-e), origem, status, período, busca;
ambiente como badge no `PageHeader` com link para alternar (quando
permitido). Avulsas = filtro "Origem: avulsa"; `NfeAvulsaSection` sai.
Seleção com `SelectionBar` "Emitir selecionadas (n)".

### 4. Tipo de nota

`/nota-fiscal/emitir/nova`: `Stepper` (1 Tipo, 2 Dados); etapa 1 com
`RadioCard`s (NF-e, NFS-e, NFC-e, Consolidada) descrevendo quando usar;
etapa 2 redireciona para a página de emissão correspondente. Remove
`IssueInvoice` modal, `InvoiceTypeSelectModal` e a lista de `avulsa/page.tsx`.

### 5. Campos

Mapeamento: `"1 - Saida"/"0 - Nao"` → `SegmentedControl` "Entrada |
Saída", "Sim | Não"; `select` de finalidade/indicador com rótulos humanos
(código entre parênteses em `helper`); produto e cliente em `Combobox`;
`MoneyInput`; `DatePicker`; parcelas em `Table compact`; `Alert warning` de
homologação e `Alert info` de transporte; rótulos "Outras despesas",
"Total dos tributos", "Valor da nota" (`kpi-value`).

## Risks / Trade-offs

- [Página de duas colunas em telas de 1280 px] → `TotalsBlock` colapsa para
  rodapé fixo abaixo de `lg`; testar em 1280 e 1440.
- [Remover a seção de avulsas muda onde o usuário as encontra] → filtro
  "Avulsas" pré-aplicado via link do hub e nota de versão.
- [`InvoiceResultsTable` de 1 600 linhas] → quebrar em arquivos no mesmo
  PR; cobertura e2e existente em `e2e/fiscal/` como rede.

## Migration Plan

PRs: (1) lista única + ações + filtros; (2) `InvoicePageShell` + NF-e de
pedido; (3) NFS-e e avulsas no shell; (4) tipo de nota com stepper; (5)
diálogos fiscais e limpeza.

## Achados fora de escopo

- Avulsas na lista principal; rascunho ao cancelar digitação; "Consultar
  SEFAZ" × "Reprocessar"; "OS"/"Pedido de venda".

## Open Questions

Nenhuma.
