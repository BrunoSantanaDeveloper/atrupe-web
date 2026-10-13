# Telas de cadastros, produção, estoque, base de custos e precificação

## Why

Nestes módulos a mesma coisa aparece de três jeitos e várias telas
prometem o que não fazem: as abas do detalhe de cliente e fornecedor apontam
para uma rota que não existe e nunca marcam a ativa; o cabeçalho do cliente
só mostra nome e status enquanto "Inativar cadastro" é o botão mais
chamativo e não há "Editar"; o formulário de cliente salta para a aba de
limite de crédito a cada envio, apaga tudo ao trocar PF/PJ e tem "Digite
aqui" em todo campo; a lupa significa consultar CNPJ, ver e buscar; botões
sem efeito em todas as linhas ("Precificar a hora", "Ver origem do custo",
NF "recurso indisponível"); o diálogo de tarefa tem seis botões de salvar;
a agenda tem seis ícones por linha com dois iguais e um botão invisível mas
focável; produtividade pinta de vermelho o que o rodapé diz não ser erro;
estoque, projetos, precificação e despesas administrativas carregam tudo no
navegador sem busca; esqueletos ficam para sempre quando a API falha; KPIs
têm círculos coloridos decorativos e cards copiados três vezes; a ordem das
abas de base de custos ignora a dependência entre elas. Evidência:
`design/openspec/design/sistema-visual.md` §2 e o relatório de módulo
resumido em `design.md`.

## What Changes

- **Clientes e fornecedores:** listas com linha clicável e `RowActions`
  (ícones distintos; consultar CNPJ como etapa do formulário), PF/PJ como
  texto de apoio, responsável em coluna própria, seleção neutra com
  progresso em massa, "Limpar filtros" no sem-resultados, mesma ordem de
  colunas e mesmos pesos nos dois cadastros; detalhe com `ObjectHeader`
  (em aberto, último pedido, limite, responsável; "Editar" primária;
  inativar e "Tornar fornecedor" no menu), abas por segmento (corrige
  `/cadastro`), contatos e endereços em listas compactas, `DetailCard`
  único; formulário em `Sheet lg` (ou página) com seções, `FormGrid`,
  endereço em ordem, `FormRepeater`, erro por aba, guarda de não salvo e na
  troca PF/PJ, placeholders de exemplo, limite de crédito em tabela com
  `Checkbox`; categorias/grupos com um nome ("Grupo"), renomear em linha,
  contagem de uso e confirmação com consequência; importação pelo modal
  parametrizado único com erros visíveis.
- **Produção:** gerenciador com `ToggleGroup`/`Badge` em vez de botões
  crus, cartão com tipo em texto, uma cor de texto, nota em `Popover`,
  "Parar" confirmando e usando o resultado, estado vazio quando não há
  gerente, concluídas expansíveis; detalhe de tarefa em `Sheet lg` com
  campos que salvam em linha e uma ação primária por estado, `DatePicker`,
  select com nome, motivo no botão desabilitado; projetos com busca,
  paginação, linha clicável, badge só onde varia, barra de progresso com
  `aria`, `ObjectHeader` (status, progresso, entrega), "Cancelar projeto" no
  menu com "Manter projeto", estimado e realizado em colunas, nomes
  "Projeto"/"Ficha de produção" únicos; produtividade com cores neutras e
  seta, filtro de período, estado vazio; agenda com `RowActions` (Agendar em
  linha; resto no menu), ícones distintos, "Entregue" ≠ "Concluído", nada
  invisível focável, etapa com texto, diálogos `md` com `DatePicker` e
  `Checkbox`, feedback em todo salvar, `BillService` pelo store.
- **Estoque:** abas no cabeçalho, busca/paginação/ordenação, movimentos com
  período e estado vazio, quantidades pt-BR, saídas com sinal e tom,
  linha abre o histórico do material; entrada de nota como fila (lista com
  filtro + `Sheet` por nota), loading por nota, "Confirmar" com motivo,
  vínculo por `Combobox`.
- **Base de custos:** ordem das abas pela dependência (Resumo, Despesas,
  Distribuição, Por setor, Mão de obra, Patrimônios, Comparativo), `KpiCard`
  único neutro com link e hover, `IconCurrencyReal`, despesas com primeira
  coluna fixa e paginação, filtros que zeram a página, salvar uniforme,
  "Definir carga horária" com rótulo e um campo, distribuição sem
  sobrescrever edição e com `SaveBar`, por setor expansível pela linha e
  um cabeçalho, comparativo com status nas abas e período em `DateRangePicker`,
  "acima do previsto" em aviso, números alinhados, contador padrão,
  depreciação com abas no cabeçalho e estado vazio com link.
- **Precificação:** contagens coerentes com o destino, `Alert` do kit,
  cards não aninhados, "Ver origem do custo" só se existir, busca e
  paginação, abas com contador, metadados sem " · " sobrando, editor de
  preço em `Sheet lg` com `RadioCard`, somente leitura como `dl`,
  `MoneyInput`/`PercentInput`, cores neutras.
- **Transversal:** `EmptyState` com altura por conteúdo, `kind="forbidden"`
  padrão, títulos de documento por sub-página, "hoje" no fuso do usuário,
  formatos de duração e percentual por `Intl`.

## Capabilities

### New Capabilities

- `telas-de-cadastros-producao-e-custos`: o que as telas desses módulos
  exibem e como se comportam.

### Modified Capabilities

Nenhuma.

## Impact

- `src/app/(app-sidebar)/cadastros/**`, `producao/**`, `estoque/**`,
  `base-de-custos/**`, `precificacao/**` (≈ 200 arquivos), `consts/cost-base.ts`,
  `lib/formatHistoryEvent.ts` (durações), `common/KpiCard.tsx` (novo),
  `common/import/ImportModal.tsx` (de `componentes-adequados`).
- Depende de `navegacao-e-cabecalhos` e `componentes-adequados`.
- Achados fora de escopo (regras): quais números-chave no cabeçalho do
  cliente; "hoje" em UTC (`ManagerBoard.tsx:55`, `TaskDetailDialog.tsx:110`)
  é defeito de lógica — corrigido aqui por ser de apresentação de data;
  edição de tarefa gated por permissão de visualização; bulk delete parcial;
  "Precificar a hora" e "Ver origem do custo" só existem se a regra existir.
