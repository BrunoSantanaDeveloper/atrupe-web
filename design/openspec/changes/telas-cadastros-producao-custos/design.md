# Design — telas de cadastros, produção, estoque, custos e precificação

Arquitetura compartilhada: `../../design/sistema-visual.md`.

## Context

Resumo do relatório de módulo (arquivos sob `src/app/(app-sidebar)/`):

- Clientes: `cadastros/clientes/components/ClientsTable/ClientsData.tsx`
  (lupa ×3 com `Clients.tsx:175-205` e `SearchClientModal.tsx:42`; ações
  variáveis por linha `:228-256`; linha não clicável `:176-204`; PF/PJ em
  coluna de 2 % `:166`; responsável sob o status `:199-224`; barra vermelha
  `:135-136`; checkboxes só em prospects `:158-197`; bulk sem progresso
  `:103-113`; sem-resultados oferece criar `:265-276`); `page.tsx:15` vs
  `Clients.tsx:172` (aba padrão); Title Case. Formulário `NewClient/index.tsx`
  (855 px + `h-[calc(100vh-200px)]` `:336-347`; submit pula para limite
  `:395-408`; vazio em edição `:218`; ícone de mais em edição `:340`),
  `NewClientForm.tsx:49-72` (toast genérico; `reset()` na troca PF/PJ),
  abas (`GeneralInfoTab.tsx:225-359` "Digite aqui", `:288-291` flex em
  grid; `AddressTab.tsx:85-131`; `ResponsibilitiesTab.tsx`;
  `CreditLimitTab.tsx:68-118` div-table, nome ×2, Switch, red-500);
  CNPJ: três diálogos em sequência. Detalhe `[id]/layout.tsx:94-114` (abas
  quebradas; cabeçalho pobre), `ClientActions.tsx:74-123`, `DetailCard.tsx`
  ×2, `DetailCardRowItem.tsx:17,23`, `ClientData.tsx:54,114-196`
  ("Grupo"), `orcamentos|ordens/page.tsx:35-38`. Fornecedores: espelho com
  drift (`SuppliersData.tsx:61-117`, `Suppliers.tsx:222`, `Summary.tsx:37,73,82`
  campos trocados). Categorias (`Categories/index.tsx:80-167`, `NewItem`).
  Import (`ImportClientModal.tsx:279-466`, cópia em fornecedores).
- Produção: `gerenciador/components/ManagerBoard.tsx` (`:55` UTC; `:89,262`
  esqueleto eterno; `:148-201` cartão; `:236-293,457` botões crus; `:353-361`;
  `:419-464`), `TaskDetailDialog.tsx` (`:66` gate; `:110` UTC; `:246-285`
  nativos; `:289-465` seis botões; `:323-334` label vazio; `:400-439`;
  `:452,461`); `projetos/components/Projects.tsx:60-152`, `[id]/components/ProjectDetail.tsx:80-384`,
  `ficha/components/ProductionSheet.tsx:40-99`; `produtividade/components/Productivity.tsx:34-175`;
  `agenda-de-entrega/**` (`DeliverySchedule.tsx:113-118` ReviewTodo;
  `DeliveryScheduleData.tsx:124-443`; `Stages/StageStatus.tsx:73-98`;
  `StagePendingDialog.tsx:84-124`; `Actions/Notes:80-113`, `ScheduleDate:137-188`,
  `BillService.tsx:62-86`).
- Estoque: `estoque/components/Stock.tsx:102-255`; `entrada-de-nota/components/InvoiceEntry.tsx:70-224`,
  `MatchItemModal.tsx:120-153`.
- Base de custos: `layout.tsx:40,65-70` + `consts/cost-base.ts:24-34`;
  `resumo/components/CostSummaryView.tsx:63-133`; `despesas-administrativas/**`
  (`SummaryCards.tsx:31-95`, `AdminExpensesData.tsx:63-84`, `AdminExpensesFilter.tsx:22-30`,
  `EditCriterion/index.tsx:161-163`); `mao-de-obra/**` (`LaborCosts.tsx:132-144`,
  `WorkloadModal.tsx:134-182`); `distribuicao/**` (`Distribution.tsx:57-70`,
  `DistributionData.tsx:93-122`, `DistributionSummaryCards.tsx`);
  `por-setor/**` (`SectorCosts.tsx:61-70`, `SectorCostsData.tsx:63-97`);
  `comparativo/components/Comparison.tsx:95-237`; `patrimonios/components/Depreciation.tsx:78-103`,
  `DepreciationData.tsx:108` (bom), `DepreciationSummaryCards`.
- Precificação: `resumo/components/PricingSummaryView.tsx:53-256`;
  `components/PricingList.tsx:91-203`; `components/EditPriceModal.tsx:224-464`.
- Bom: filtros na URL e três estados vazios distintos em clientes/fornecedores;
  `ActionButton` nomeando o objeto; `CostBySectorChart` com aria; badge de
  distribuição em palavras; `RateInput` com aria por linha; `useAlertDialog`;
  ficha com CSS de impressão; copy humana da produtividade.

## Goals / Non-Goals

**Goals:**
- Cadastro, produção e custos com o mesmo vocabulário de lista, detalhe e
  formulário do resto do sistema.
- Nenhum botão sem efeito; nenhum estado enganoso.

**Non-Goals:**
- Regras de produção (transições de tarefa), de custo e de precificação.
- Redesenhar o quadro Kanban além de controles, cores e estados.

## Decisions

### 1. Formulário de cliente/fornecedor

`Sheet lg` com `SectionNav` (Dados, Endereços, Contatos, Responsáveis,
Limite de crédito) — ou página `/cadastros/clientes/novo` se o `Sheet` não
comportar em 1280 px (decidir na implementação com captura); um componente
`PersonForm` parametrizado (cliente/fornecedor) acaba com o espelho
divergente. Consulta de CNPJ é um botão "Buscar dados pelo CNPJ" ao lado do
campo que preenche o formulário in loco. Troca PF/PJ com `ConfirmDialog` só
se há campos preenchidos.

### 2. Detalhe de cliente/fornecedor

`ObjectHeader` com Em aberto · Último pedido · Limite de crédito ·
Responsável (fornecedor: Em aberto · Última compra); abas Dados, Orçamentos,
Ordens, Financeiro por segmento; `DetailCard` único em `common/` com `dl`;
contatos e endereços como `Table compact` dentro de um card cada.

### 3. Tarefa de produção

`TaskDetailSheet` (`Sheet lg`): cabeçalho (tarefa, projeto, `StatusBadge`,
primária por estado: Iniciar / Concluir etapa / Retomar); campos que salvam
em linha (`AutosaveField` para quem faz, agenda, duração estimada) com
carimbo; transição de etapa só pela ação primária (o select livre sai —
regra a confirmar); motivo no botão desabilitado via Tooltip.

### 4. Agenda de entrega

`Table` com `TableGroupRow` por data; `RowActions` (Agendar em linha; menu:
Observações, Faturar `IconReceipt`, Editar parcelas `IconCalendarDollar`,
Entregar/Finalizar com confirmação); etapa como `StatusBadge` com texto
("Impressão · Em andamento") e ícone do setor; sem NF até existir.

### 5. KPIs

`common/KpiCard.tsx` (`label`, `value`, `delta?`, `href?`, `icon?` neutro,
`description?`) substitui `SummaryCards`, `DistributionSummaryCards`,
`DepreciationSummaryCards`, cards do resumo de custos e de precificação;
link → hover/foco/chevron; sem círculo colorido.

### 6. Listas longas

Estoque (materiais e movimentos), projetos, precificação (materiais,
produtos, máquinas), despesas administrativas, entrada de nota: `ListToolbar`
(busca, filtros, período) + `Pagination` server-side; onde a API não pagina
ainda, paginação no cliente com busca local e nota no `proposal` do OpenSpec
de regras para paginar na API.

### 7. Tempo e número

`lib/format.ts`: `formatDuration` ("1h 05min" único), `formatPercent`
(`Intl`), `formatQuantity` (pt-BR, unidade); `today()` no fuso do navegador
(`date-fns` `startOfDay`, sem `toISOString`).

## Risks / Trade-offs

- [Formulário de cliente em `Sheet` pode ficar apertado] → captura em 1280;
  fallback para página.
- [Tirar o select livre de status da tarefa remove um atalho usado] →
  confirmar com regras; manter como item do menu "Mover para…" com
  confirmação se for permitido.
- [Paginar no cliente é paliativo] → registrado como achado para a API.

## Migration Plan

PRs: (1) clientes/fornecedores lista + detalhe (inclui abas quebradas);
(2) formulário único `PersonForm`; (3) produção (gerenciador, tarefa,
projetos, produtividade); (4) agenda; (5) estoque; (6) base de custos;
(7) precificação.

## Achados fora de escopo

- Números-chave do cabeçalho; transições de tarefa pelo select; bulk delete
  parcial; paginação na API; "Precificar a hora"/"Ver origem do custo".

## Open Questions

- `Sheet` ou página para o formulário de cliente (decisão 1): resolve-se com
  captura na implementação; não muda a spec.
