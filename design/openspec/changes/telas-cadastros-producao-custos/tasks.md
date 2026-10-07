## 1. Clientes e fornecedores — listas

- [ ] 1.1 `cadastros/clientes/components/ClientsTable/ClientsData.tsx` e
      `fornecedores/.../SuppliersData.tsx` → `PersonTable` parametrizado:
      colunas Nome (+ PF/PJ e responsável como `secondary`), Grupo, Contato,
      Status (`StatusBadge`); linha clicável; `RowActions` (Editar em linha;
      Inativar/Excluir prospect no menu); `SelectionBar` neutra com
      progresso e resultado parcial no bulk (`ClientsData.tsx:103-113`);
      checkbox em todas as linhas com inelegíveis explicadas; `lastPage`
      da API; `EmptyState kind="no-results"` com "Limpar filtros"
- [ ] 1.2 `Clients.tsx`/`Suppliers.tsx`: abas no `PageHeader` (Ativos,
      Inativos, Pré-cadastros, Todos; primeira padrão; caixa de frase);
      "Consultar dados de cliente" sai do cabeçalho (vira busca por CNPJ no
      formulário); `ListToolbar` com placeholder "Nome, CPF/CNPJ ou e-mail";
      copy "status: Ativos" sem espaço
- [ ] 1.3 Categorias (`cadastros/components/Categories/**`): nome único
      "Grupo"; `Table` com contagem de uso e busca; renomear em linha
      (Enter/Esc); criar com `md`; confirmação com consequência ("3
      clientes usam este grupo"); ícone destrutivo consistente

## 2. Clientes e fornecedores — detalhe

- [ ] 2.1 `clientes/[id]/layout.tsx` e `fornecedores/[id]/layout.tsx`:
      `ObjectHeader` (Em aberto, Último pedido/compra, Limite de crédito,
      Responsável — a confirmar), "Editar" primária, menu (Inativar, Tornar
      fornecedor/cliente), abas por `useSelectedLayoutSegment` (`dados`,
      `orcamentos`, `ordens`, `financeiro`)
- [ ] 2.2 `ClientActions.tsx`: `ConfirmDialog` de inativar com descrição;
      ações conforme 2.1
- [ ] 2.3 `common/DetailCard.tsx` único (`dl` 4/2/1, sem separadores por
      linha); `ClientData.tsx:114-196` contatos e endereços em `Table
      compact` por card; `Summary.tsx:73,82` (fornecedor) com cargo e
      celular corretos; "Grupo" em ambos
- [ ] 2.4 `orcamentos|ordens/page.tsx:35-38`: sem `my-6`; esqueleto de
      tabela

## 3. Formulário de pessoa

- [ ] 3.1 `cadastros/components/PersonForm/**` (substitui `NewClient/**`,
      `NewSupplier.tsx`, `NewSuppilerForm.tsx`): `Sheet lg` (ou página)
      com `SectionNav` (Dados, Endereços, Contatos, Responsáveis, Limite de
      crédito), `FormGrid`, endereço em ordem padrão, `FormRepeater` com
      "Remover endereço/contato" nomeado, `required` marcados, placeholders
      de exemplo, erro por seção (sem toast genérico), submit sem pular de
      seção (`NewClient/index.tsx:395-408`), esqueleto em edição, ícone de
      lápis em edição, guarda de não salvo, troca PF/PJ com confirmação
      quando há dados, um rótulo de salvar ("Salvar") e um aviso ("Cliente
      salvo"), rodapé `gap-3`
- [ ] 3.2 Consulta de CNPJ: botão "Buscar dados pelo CNPJ" ao lado do campo
      (`IconId`), preenche in loco, "Nenhum cadastro encontrado" inline;
      remover `SearchClientModal.tsx`, `ClientDetailsModal.tsx` (ambos) e o
      modal em cadeia
- [ ] 3.3 Limite de crédito como `Table compact` (condição × `Checkbox`
      "Permitido"), tokens
- [ ] 3.4 Importação: `common/import/ImportModal.tsx` parametrizado
      (clientes, fornecedores, produtos, financeiro) com `Stepper`, `Alert`
      de erros visível, tabela de erros paginada + "Baixar erros (CSV)",
      rótulos "Importar <objeto>"/"Cancelar", lixeira nomeada; apagar as
      cópias

## 4. Produção

- [ ] 4.1 `gerenciador/components/ManagerBoard.tsx`: `ToggleGroup`/`Badge`
      nos filtros e chips; cartão com `focus-ring`, tipo em texto
      (`caption`), uma cor de texto + `caption`, nota em `Popover`
      (`IconNote`), handle de arrastar (`IconGripVertical`) e alternativa
      por menu "Mover para…"; drop target só nos válidos; "Parar" com
      `ConfirmDialog` e resultado real; `EmptyState` quando não há gerente
      (`QueryState`); concluídas em accordion expansível; `today()` no fuso
      local
- [ ] 4.2 `TaskDetailDialog.tsx` → `TaskDetailSheet` (`Sheet lg`): cabeçalho
      (tarefa, projeto, `StatusBadge`, primária por estado), `AutosaveField`
      para Quem faz (select com rótulo), Agenda (`DatePicker` + hora),
      Duração estimada; "Concluir" desabilitado com Tooltip de motivo;
      select livre de status sai (ou "Mover para…" com confirmação, se
      permitido); `secondary` em Cancelar
- [ ] 4.3 `projetos/components/Projects.tsx`: `ListToolbar` (busca,
      cliente, período) + `Pagination` (cliente até a API paginar); linha
      clicável; badge de status só na aba "Todos"; `Progress` com `aria`;
      título "Projetos" em tudo; `EmptyState` por tipo
- [ ] 4.4 `projetos/[id]/components/ProjectDetail.tsx`: `ObjectHeader`
      (status, progresso n/m, entrega, venda); "Alterar entrega" secundária,
      "Cancelar projeto" no menu com "Manter projeto"; "Ficha de produção"
      com `IconFileText` + chevron; tabela de tarefas com Estimado e
      Realizado em colunas numéricas + variação; Entrega em uma coluna;
      `QueryState` (erro ≠ esqueleto); gate de edição correto
- [ ] 4.5 `ficha/components/ProductionSheet.tsx`: `QueryState`; rótulos sem
      caixa alta (eyebrow só em seção); "Projeto"
- [ ] 4.6 `produtividade/components/Productivity.tsx`: eficiência em
      `Money`-like neutro com seta; `DateRangePicker` de período;
      `EmptyState` na tabela de setores; `formatDuration`/`formatPercent`
      de `lib/format.ts` (também `LaborCosts.tsx:132`, `PricingList.tsx:188`,
      `Comparison.tsx:216`, `TaskDetailDialog.tsx:72`)

## 5. Agenda de entrega

- [ ] 5.1 `DeliverySchedule.tsx`: remover `ReviewTodo`; `PageHeader`
- [ ] 5.2 `DeliveryScheduleTable/DeliveryScheduleData.tsx`: `TableGroupRow`
      por data (eyebrow); `RowActions` (Agendar em linha; menu: Observações,
      Faturar `IconReceipt`, Editar parcelas `IconCalendarDollar`, Entregar
      com `ConfirmDialog` e feedback); NF sem função removida; nada
      `w-0`/invisível; etapa como `StatusBadge` com texto + ícone do setor;
      DONE "Concluído" × FINISHED "Entregue"; texto longo com `truncate` +
      Tooltip; sem `relative z-30`; `colSpan` por contexto; dica "Data" →
      "Alterar data"
- [ ] 5.3 `Stages/StageStatus.tsx`: tom do dicionário (sem classe
      dinâmica); erro com mensagem real; `StagePendingDialog.tsx` `md`,
      "Remover pendência" secundária sem check
- [ ] 5.4 `Actions/Notes/index.tsx` (`md`, feedback de salvar, erro),
      `Actions/ScheduleDate/index.tsx` (`md`, título visível, `DatePicker` +
      campo de hora, `Checkbox` "Adicionar horário", `isLoading`),
      `Actions/BillService.tsx` (`ConfirmDialog` pelo store); rodapés sem
      `<div/>`

## 6. Estoque

- [ ] 6.1 `estoque/components/Stock.tsx`: abas no `PageHeader` (Todos,
      Zerados, Abaixo do mínimo) com `EmptyState` coerente por aba;
      `ListToolbar` (busca) + `Pagination` + ordenação; `formatQuantity`;
      saídas com sinal e `tone-error-text`; `StatusBadge` com ponto em ambas
      as tabelas; movimentos com `DateRangePicker`, `EmptyState` e
      paginação; linha do material abre `Sheet` com histórico
- [ ] 6.2 `entrada-de-nota/components/InvoiceEntry.tsx`: fila (`Table`:
      fornecedor, data, itens, status; filtro por fornecedor/período) e
      `Sheet lg` por nota com itens; loading por nota (`mutation.variables`);
      "Confirmar entrada" desabilitado com Tooltip do motivo; `EmptyState`
      com explicação; `MatchItemModal.tsx` com `Combobox` (criar material),
      `FormLabel`, `QuantityInput`, quantidade convertida formatada; dica
      "Alterar vínculo" quando já vinculado

## 7. Base de custos

- [ ] 7.1 `consts/cost-base.ts:24-34` + `layout.tsx`: ordem Resumo,
      Despesas administrativas, Distribuição, Por setor, Mão de obra,
      Patrimônios, Comparativo; `EmptyState kind="forbidden"`; `metadata`
      por sub-página
- [ ] 7.2 `common/KpiCard.tsx` e substituição de `SummaryCards.tsx`,
      `DistributionSummaryCards.tsx`, `DepreciationSummaryCards.tsx`,
      cards de `CostSummaryView.tsx` (links distintos; hover/foco/chevron;
      `IconCurrencyReal`; sem círculo colorido)
- [ ] 7.3 `despesas-administrativas/**`: `Table sticky="first-column"` +
      `Pagination`; `AdminExpensesFilter` zera `page`; info icon legível;
      `EditCriterion` com `isLoading` (sem "Salvando…")
- [ ] 7.4 `mao-de-obra/**`: "Definir carga horária" secundária com rótulo;
      "Precificar a hora" removido até existir; `WorkloadModal` `md` com um
      campo (`QuantityInput` horas), `EmptyState` do kit
- [ ] 7.5 `distribuicao/**`: `Distribution.tsx` sem sobrescrever edição
      (`QueryState` + estado local), `SaveBar` com "Descartar"; um campo por
      valor (`PercentInput`), total ao vivo
- [ ] 7.6 `por-setor/components/SectorCostsData.tsx:63,88-97` e
      `SectorCosts.tsx:61-70`: linha expansível pela linha inteira
      (`TableRow expandable`, hoje só o chevron); uma tabela com
      `TableGroupRow` por seção em vez de duas tabelas empilhadas com o
      cabeçalho repetido; primeira coluna com "Setor", não o nome da seção
- [ ] 7.7 `comparativo/components/Comparison.tsx`: status nas abas do
      `PageHeader` com `count`; período em `DateRangePicker`; "acima do
      previsto" aviso / "abaixo" neutro com ícone; fontes expandidas com
      colunas alinhadas (sem `colSpan=2`); `EmptyState` por aba
- [ ] 7.8 `patrimonios/components/Depreciation.tsx`: abas no cabeçalho com
      `count` oculto no zero; `EmptyState` com link "Cadastrar patrimônios"

## 8. Precificação

- [ ] 8.1 `resumo/components/PricingSummaryView.tsx`: `QueryState`;
      contagens por grupo com links para o grupo certo (ou lista "Todos
      abaixo do custo"); `Alert warning` com "Ver quais" link; `KpiCard`;
      sem card em card; "Ver detalhes ›" mantido como padrão de link
- [ ] 8.2 `components/PricingList.tsx`: `ListToolbar` + `Pagination`; abas
      com `count`; "Ver origem do custo" removido até existir; metadados sem
      " · " sobrando; `Money`
- [ ] 8.3 `components/EditPriceModal.tsx` → `Sheet lg`: `RadioCard`
      (`FormToggleCard`), somente leitura como `dl`, `MoneyInput`/
      `PercentInput`, valores neutros, `isLoading` no salvar, `secondary`
      em Cancelar

## 9. Fechamento

- [ ] 9.1 `lib/format.ts` (`formatDuration`, `formatPercent`, `formatQuantity`,
      `today`) e remoção dos `toString().replace` e `toISOString` de "hoje"
- [ ] 9.2 Capturas antes/depois das listas e detalhes dos cinco módulos;
      `audit.json` sem botão sem nome e sem botão repetido
- [ ] 9.3 `e2e/clients`, `e2e/production`, `e2e/stock`, `e2e/cost-base`,
      `e2e/pricing` atualizados (abas de cliente, formulário único, tarefa
      em painel, agenda com menu, estoque paginado, ordem das abas de custos)
