# Navegação e cabeçalhos de página

## Why

Não há um padrão de cabeçalho de página: zero breadcrumbs, voltar só por um
link opcional, 79 das 112 páginas usam o `Topbar` e o resto monta o cabeçalho
à mão, o painel não tem título. Páginas de detalhe escondem o que importa
(total, status, validade) em accordions fechados e não têm ação primária. O
rótulo do item de navegação, o título da página e a URL discordam
("Pagamentos" → "Condições de pagamento" em `configuracoes-de-pagamento/condicoes-de-pagamento`;
"Bancos e contas" → "Contas bancárias"; Materiais sob "Cadastros" mas em
`/configuracoes/produtos`). As abas de detalhe de cliente e fornecedor
apontam para uma rota que não existe e nunca marcam a ativa. A barra lateral
tem 296 px, 224 px de cromo, ativo por substring, lógica de permissão
duplicada e divergente do celular, e o menu do celular não é um diálogo
acessível. A marcação interna de revisão pinta títulos de azul e vermelho em
produção. Três telas diferentes de "sem permissão" e páginas em branco.
Evidência: `design/openspec/design/sistema-visual.md` §2.8.

## What Changes

- **`PageHeader`** obrigatório em toda página: breadcrumb (quando há mais de
  um nível) ou voltar, título (`page-title`), subtítulo, badge de status e
  metadados (detalhe), ações (uma primária, duas secundárias, "Mais ações"),
  abas de sub-rota; substitui `Topbar` (com `tone="admin"` no lugar do
  `classNames`/`label`) e os cabeçalhos à mão. **BREAKING** para a API
  `Topbar` (`label`, `classNames`, `review` saem).
- **`ObjectHeader`** para páginas de detalhe: nome (`object-title`), status,
  3–5 números-chave sempre visíveis (total, saldo, validade, progresso),
  ações; os cards abaixo abrem expandidos por padrão.
- **Barra lateral:** 264/64 px, seções com rótulo, ativo por segmento de
  rota com `aria-current`, grupo pai marcado quando contém a rota ativa,
  chevron neutro, recolhida com flyouts, conta no rodapé, uma única lógica
  de permissão (`lib/navigation.ts`) compartilhada com o celular, sem
  navegação comentada nem legenda de revisão.
- **Celular:** menu em `Sheet` (`role=dialog`, foco preso, Esc, rolagem
  bloqueada) e cabeçalho móvel com título da página e voltar.
- **Rótulo = título = URL:** tabela de renomeações (hub, `metadata.title`,
  `PageHeader`, segmento), Cargos e Produtos como entradas próprias,
  Materiais/Processos/Produtos no módulo em que aparecem na navegação.
- **Abas de detalhe** por `useSelectedLayoutSegment` (corrige a rota
  `cadastro`→`dados` e a aba ativa); abas de status no `PageHeader` com
  contador só > 0; uma convenção de aba padrão por lista.
- **Sem permissão / não encontrado / erro:** `EmptyState kind="forbidden"`
  com o `PageHeader` da página; `not-found.tsx` e `error.tsx` por módulo;
  nenhuma página em branco; filtros visíveis para quem só visualiza.
- **Marcação de revisão** (`review`, `ReviewTodo`, legenda, `consts/revisao.ts`)
  sai do produto.

## Capabilities

### New Capabilities

- `cabecalho-de-pagina`: anatomia e obrigatoriedade do cabeçalho de página e
  do cabeçalho de objeto.
- `navegacao-lateral`: estrutura, estado ativo, recolhimento, celular e
  permissões da navegação.
- `consistencia-de-rotulos`: rótulo de navegação = título = URL = título do
  documento; abas de sub-rota; páginas de erro e sem permissão.

### Modified Capabilities

Nenhuma.

## Impact

- `common/Topbar.tsx` → `common/PageHeader.tsx`, `common/ObjectHeader.tsx`
  (novo), `layout/SidebarComponent.tsx`, `layout/MobileSidebar.tsx`,
  `layout/MobileHeader.tsx`, `layout/UserDropdown.tsx`, `common/HelpButton.tsx`,
  `consts/nav.ts`, `lib/navigation.ts` (novo), `consts/revisao.ts` (sai),
  `common/ReviewTodo.tsx` (sai), `(app-sidebar)/layout.tsx`.
- Todas as páginas (112) para `PageHeader`; os layouts de detalhe
  (`cadastros/*/[id]/layout.tsx`, `base-de-custos/layout.tsx`,
  `precificacao/layout.tsx`); as páginas de detalhe (orçamento, OS, cliente,
  fornecedor, projeto, folha, patrimônio, nota) para `ObjectHeader`.
- Renomeações de rota: `configuracoes/financeiro/configuracoes-de-pagamento/condicoes-de-pagamento`
  → `configuracoes/financeiro/condicoes-de-pagamento`; `configuracoes/produtos/{materiais,processos}`
  → `cadastros/{materiais,processos}` (com redirecionamentos).
- Depende de `tipografia-e-hierarquia` (papéis) e `componentes-adequados`
  (`Breadcrumb`, `StatusBadge`, `EmptyState`, `Sheet`, `Tabs`).
- Achados fora de escopo (regras): quais números-chave cada detalhe mostra é
  decisão de produto; aqui a proposta inicial por tela fica em `tasks.md`
  para o OpenSpec de regras confirmar.
