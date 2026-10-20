# Em andamento — OpenSpec de design

Quadro das mudanças de design que existem agora em `design/openspec/changes/`.
Só estado presente e ordem próxima: sem datas, sem números de PR, sem
histórico (o histórico está no Git e em `changes/archive/`).

Regras de manutenção:

- **Mudança nova** → acrescentar a entrada, anotar as dependências, pôr numa onda.
- **Mudança de status** → atualizar a entrada.
- **Arquivamento** → apagar a entrada **e** toda dependência que aponte para ela.
- **Renomeação** → varrer este arquivo junto com as outras referências.
- **Inserir ou tirar da ordem** → mover a linha. A ordem é pela posição, não
  numerada; referências citam a mudança pelo nome, nunca pela posição.
- Status é uma palavra de estado: `spec-only` | `in progress` | `blocked: <o quê>`.
- Mudanças do OpenSpec de regras (`openspec/`, repositório `atrupe-regras`)
  não entram aqui.
- Design compartilhado entre várias mudanças vive em `design/openspec/design/<slug>.md`
  e morre quando a última mudança que o cita arquivar.

## Mudanças pendentes

- `tema-claro-escuro` — tema · `in progress`. Tema escuro pelos tokens de cor e
  seletor Claro / Escuro / Sistema no menu do usuário e no menu do celular;
  toca `globals.css`, `tailwind.config.ts`, `Providers`, `src/components/ui` e
  as classes com hexadecimal.
- `cores-e-contraste` — cor · `spec-only`. Tokens em canais com opacidade,
  camada semântica de cor, dicionário único de estados, dinheiro neutro,
  contraste mínimo, anel de foco único, gráficos por token, lint de hex e
  paleta; toca `globals.css`, `tailwind.config.ts`, `consts/*status*`,
  `ui/*`, gráficos e os 67 arquivos com hexadecimal. Design: `design/sistema-visual.md`.
- `botoes-e-acoes` — botões · `spec-only`. Sistema de 4 níveis × 2 tons com
  codemod das 31 variantes, uma primária por região, `RowActions` (linha
  clicável + menu), `ConfirmDialog` com tom, vocabulário de rótulos, fim do
  "Configurar" repetido nos hubs; toca `button.tsx`, `alert-dialog.tsx`,
  `ActionButton`, `CustomButton`, hubs, todas as tabelas com ações por linha
  e os cabeçalhos de detalhe. Design: `design/sistema-visual.md`.
- `espacamento-e-layout` — layout · `spec-only`. Grade de 4 px, densidade
  de tabela (44/36 px), `size` em Dialog/Sheet, raios por papel, `FormGrid`,
  gutter simétrico, medidas da sidebar e do hub, estados vazios por conteúdo;
  toca `table.tsx`, `dialog.tsx`, `sheet.tsx`, `card.tsx`, `globals.css`,
  `layout.tsx` e os formulários remendados. Design: `design/sistema-visual.md`.
- `interacao-e-movimento` — interação · `spec-only`. Hover e foco em todo
  interativo, tokens de movimento e movimento reduzido, política de
  carregamento (esqueleto/erro/por item), sonner único com durações, guarda
  de alterações não salvas e `SaveBar`; toca `ui/*`, `sonner.tsx`, remoção
  do `use-toast`, `QueryState`, `UnsavedChangesGuard` e as telas com
  esqueleto eterno ou botões invisíveis. Design: `design/sistema-visual.md`.
- `componentes-adequados` — componentes · `spec-only`. `Table` com API
  (numérico, ordenação, fixo, estados), paginação única, campos de
  formulário (obrigatório, placeholder, data, dinheiro, segmentado, cards de
  rádio, combobox), `Sheet` como padrão de detalhe, `Stepper`, `StatusBadge`,
  `Alert`/`Banner`, `EmptyState` único, `Breadcrumb`, Tooltip em vez de
  `title`, remoção da camada Figma DS e do código morto; toca `ui/*`,
  `common/*` e os consumidores mecânicos. Design: `design/sistema-visual.md`.
- `navegacao-e-cabecalhos` — navegação · `spec-only`. `PageHeader` e
  `ObjectHeader` em toda página, sidebar 264/64 com seções, ativo por
  segmento, flyouts e menu móvel em `Sheet`, rótulo = título = URL com
  redirects, abas de detalhe por segmento, estados sem permissão/404/erro,
  fim da marcação de revisão; toca `Topbar`, `SidebarComponent`,
  `MobileSidebar`, `consts/nav.ts`, layouts de detalhe e todas as páginas.
  Design: `design/sistema-visual.md`.
- `telas-configuracoes` — configurações · `spec-only`. Hubs como lista,
  empresa/emissor/permissões/limite de crédito como páginas, `SettingsSection`
  com um modelo de salvar, listas padronizadas, árvore no plano de contas,
  nota fiscal no kit, hub de produtos; toca `configuracoes/**`. Design:
  `design/sistema-visual.md`.
- `telas-vendas` — vendas · `spec-only`. Listas com linha clicável e menu,
  detalhe com `ObjectHeader` e bloco de totais, itens com tabela numérica,
  fluxos em `Sheet`/página, confirmações no tom certo, venda rápida com uma
  ação; toca `vendas/**`. Design: `design/sistema-visual.md`.
- `telas-financeiro-e-caixa` — financeiro · `spec-only`. Status único,
  dinheiro neutro, tabela de movimentações única com detalhe em `Sheet`,
  "Novo lançamento" único, fluxo com KPIs e filtros visíveis, despesas
  fixas e folha padronizadas, caixa com uma primária e view de impressão,
  PDV com "Receber" rotulado; toca `financeiro/**` e `consts/*`. Design:
  `design/sistema-visual.md`.
- `telas-nota-fiscal` — nota fiscal · `spec-only`. Lista única com menu e
  filtros, escolha de tipo em etapas, página de emissão com seções e totais
  fixos compartilhada por NF-e/NFS-e/NFC-e/avulsas, itens pendentes com uma
  ação, campos humanos, diálogos fiscais pelo kit; toca `nota-fiscal/**`.
  Design: `design/sistema-visual.md`.
- `telas-cadastros-producao-custos` — cadastros/produção/custos · `spec-only`.
  Clientes e fornecedores (listas, detalhe com abas corrigidas, formulário
  único), gerenciador e tarefa em painel, projetos, produtividade, agenda,
  estoque, entrada de nota, base de custos (ordem das abas, KPIs, distribuição,
  comparativo), precificação; toca `cadastros/**`, `producao/**`, `estoque/**`,
  `base-de-custos/**`, `precificacao/**`. Design: `design/sistema-visual.md`.
- `telas-dashboard-e-relatorios` — painel/relatórios · `spec-only`. Painel
  com título, heróis e variação, esqueleto único de relatório (período,
  exportar, KPIs, gráficos por token, tabelas numéricas), filtros na URL,
  estados vazio/erro; toca `dashboard/**`, `relatorios/**`, `common/charts/**`.
  Design: `design/sistema-visual.md`.

## Dependências

Arestas duras (A não termina antes de B):

- `cores-e-contraste` → `tema-claro-escuro`: os dois reescrevem as mesmas
  variáveis em `globals.css` e o mapeamento em `tailwind.config.ts`; a
  camada semântica nasce com os valores escuros já decididos lá.
- `botoes-e-acoes` → `cores-e-contraste` (tons, foco e desabilitado do
  botão vêm dos tokens semânticos).
- `interacao-e-movimento` → `cores-e-contraste` (`ring-focus`, `scrim`).
- `componentes-adequados` → `botoes-e-acoes` (`RowActions`, `SelectionBar`,
  `ConfirmDialog`) e `espacamento-e-layout` (`size` de Dialog/Sheet,
  densidade).
- `navegacao-e-cabecalhos` → `componentes-adequados` (`Breadcrumb`,
  `StatusBadge`, `EmptyState`, `Sheet`, `Tabs`).
- `telas-configuracoes`, `telas-vendas`, `telas-financeiro-e-caixa`,
  `telas-nota-fiscal`, `telas-cadastros-producao-custos`,
  `telas-dashboard-e-relatorios` → `navegacao-e-cabecalhos` e
  `componentes-adequados` (consomem `PageHeader`/`ObjectHeader` e os
  componentes novos).
- `telas-dashboard-e-relatorios` → `cores-e-contraste` (tokens de gráfico).

Arestas suaves (preferência de ordem, não bloqueio):

- `telas-vendas` antes de `telas-nota-fiscal`: `TotalsBlock` nasce em vendas
  e a nota o reutiliza.
- `telas-cadastros-producao-custos` antes de `telas-dashboard-e-relatorios`:
  `KpiCard` nasce em custos e o painel o reutiliza (quem vier primeiro cria).

## Ondas

1. Base do tema — fundação de cor de todas as telas; qualquer mudança visual
   futura depende dos tokens escuros.
   - `tema-claro-escuro` — em andamento; única da onda.
2. Fundação visual — muda o que toda tela herda sem tocar nas telas
   (`design/sistema-visual.md` §5). Os papéis
   tipográficos (`src/lib/typography-roles.ts`) apontam para as rampas; quando
   a camada semântica de cor existir, só aquela tabela muda.
   - `cores-e-contraste` — espera `tema-claro-escuro` arquivar; contende
     `globals.css`/`tailwind.config.ts`.
3. Componentes — cria o que a onda seguinte usa. `botoes-e-acoes` e
   `espacamento-e-layout` primeiro (os outros três dependem deles).
   - `botoes-e-acoes` — espera cores.
   - `espacamento-e-layout` — contende `dialog.tsx`/`table.tsx` com
     `componentes-adequados` (por isso vem antes).
   - `interacao-e-movimento` — espera cores; toca `ui/*` inteiro (foco), por
     isso depois de botões.
   - `componentes-adequados` — maior da onda; espera botões e layout.
   - `navegacao-e-cabecalhos` — última da onda: `PageHeader` só fecha com
     `Breadcrumb` e `StatusBadge`.
4. Telas — por módulo, para caber em PRs revisáveis e correr em paralelo
   entre pessoas. Ordem sugerida pela dor do usuário e pela reutilização.
   - `telas-configuracoes` — origem das duas queixas ("Configurar" ×6 e
     fontes iguais); primeira.
   - `telas-vendas` — mais usada; cria `TotalsBlock`.
   - `telas-financeiro-e-caixa` — status e dinheiro.
   - `telas-nota-fiscal` — reutiliza `TotalsBlock` e `PaymentSplit`.
   - `telas-cadastros-producao-custos` — maior; cria `KpiCard`.
   - `telas-dashboard-e-relatorios` — reutiliza `KpiCard` e os tokens de
     gráfico; fecha a jornada.
