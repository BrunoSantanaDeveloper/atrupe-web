## Context

Motivação: ver `proposal.md`. Requisitos: `specs/movimento` e
`specs/estados-de-carregamento`.

Estado atual que molda a solução:

- **Só existe `src/app/loading.tsx`** (logo quicando em tela cheia). Ele envolve
  o layout `(app-sidebar)` inteiro; numa navegação entre módulos o segmento
  `(app-sidebar)` não muda, então nenhum fallback aparece e a página antiga
  fica parada até a nova chegar.
- **O item ativo da barra lateral e a aba ativa do Topbar** saem do `pathname`
  / dos `searchParams`, que só mudam quando a página nova já chegou.
- **112 `page.tsx`, 9 client.** As páginas são invólucros de servidor sem
  `await`; cada tela é um componente client que faz `useQuery`.
- **Listagens:** a chave da query inclui os `searchParams`; sem
  `keepPreviousData`, toda troca de filtro/página zera os dados (`isLoading`)
  e a tabela vira `TableSkeleton` (5 colunas genéricas, sem cabeçalho real).
  Um segundo query (totais) mostra antes um `Skeleton` de
  `h-[calc(100vh-150px)]`.
- **`ui/skeleton.tsx`:** `bg-gray-100 mix-blend-multiply` — igual ao fundo da
  `<main>` (`bg-gray-100`) no claro; quase preto no escuro.
- **`ui/button.tsx` com `isLoading`:** aplica `disabled`, e o estilo
  `disabled:` pinta o botão de cinza; o spinner de 24 px entra à direita e muda
  a largura.
- **Overlays:** `dialog` e `alert-dialog` usam o padrão antigo do shadcn
  (`slide-in-from-left-1/2` + `slide-in-from-top-[48%]`), que desloca na
  diagonal; `sheet` abre em 500 ms.
- **Barra lateral:** dezenas de elementos com `transition-all duration-500`
  animando largura, gap, padding e margem.

## Goals / Non-Goals

**Goals:** retorno imediato no clique; nenhuma piscada em espera curta; nenhum
salto de layout quando os dados chegam; transições curtas e consistentes.

**Non-Goals:** transições entre páginas (View Transitions); trocar React Query
por Suspense; refazer o layout das telas.

## Decisions

### 1. Tokens de movimento no Tailwind
`transitionDuration` ganha `fast` 150 ms, `base` 200 ms, `slow` 300 ms;
`transitionTimingFunction` ganha `out` = `cubic-bezier(0.16, 1, 0.3, 1)` e
`in-out` = `cubic-bezier(0.65, 0, 0.35, 1)`. O `tailwindcss-animate` lê
`transitionDuration` para `duration-*` das animações, então `duration-fast`
serve aos dois.

### 2. Esqueleto
`bg-gray-200` (o token inverte no escuro) sem blend. Animação `skeleton`:
fade-in de 300 ms com 150 ms de atraso (`both`) seguido de pulso suave
infinito (opacidade 1 ↔ 0,55). Duas animações em sequência na mesma
propriedade: o pulso começa quando o fade termina. Overrides de cor existentes
(`bg-gray-300` do Topbar etc.) continuam valendo pelo `cn`.

### 3. Botão em progresso
- Variante Tailwind `disabled-idle` = `&:disabled:not([data-loading])`; o
  estilo cinza de desabilitado passa a usá-la. Em progresso o botão continua
  `disabled` (bloqueia clique e Enter) mas mantém a cor da variante.
- Sem `asChild`, ícones e texto ficam dentro de um `<span class="contents">`
  que recebe `invisible` em progresso; `visibility` é herdada, então o
  conteúdo some mas ocupa o espaço — a largura não muda. O spinner fica
  centralizado num `<span>` absoluto. Com `asChild` (link estilizado de botão)
  o comportamento antigo (spinner à direita) fica, porque o filho único não
  pode ser embrulhado.
- Tamanho do spinner pelo `size`: 16 px em `sm`/`iconSm`/`iconXs`/`iconXxs`,
  20 px nos demais.
- `aria-busy` em progresso.

### 4. Overlays
- `dialog` / `alert-dialog`: `fade` + `zoom-in-95`, entrada `duration-base`
  `ease-out`, saída `duration-fast`; removidos os `slide-*`.
- `sheet`: entrada `duration-slow ease-out`, saída `duration-base`.
- `TabsContent`: `animate-in fade-in-0 duration-base`.

### 5. Retorno de navegação
- `NavigationProgress` (client, no layout raiz): escuta cliques (fase de
  captura) em `<a>` internos sem modificador/`target`/`download`, cujo destino
  (caminho + busca) difere do atual → inicia. Termina quando `usePathname` ou
  `useSearchParams` mudam. Barra de 2 px na cor da marca, visível só após
  150 ms, progresso assintótico, completa e some ao terminar; trava de
  segurança de 10 s.
- Exporta `startNavigationProgress()` para navegações por `router.push` em
  código (linha de tabela clicável, busca).
- Barra lateral (desktop e celular): `pendingHref` no clique; o ativo usa
  `pendingHref ?? pathname` e zera quando o `pathname` muda.
- Topbar: aba otimista (`useState` sincronizado com `activeTab`).
- `src/app/loading.tsx`: logo com fade e pulso suave, aparecendo após 200 ms.

Alternativa descartada: `loading.tsx` em `(app-sidebar)`. Só apareceria entre
módulos (o segmento do módulo não muda dentro dele), dando dois
comportamentos diferentes para a mesma ação.

### 6. Listagens
- `placeholderData: keepPreviousData` nas queries de lista; `isPlaceholderData`
  liga o `FetchingRegion` (novo, `components/common`): conteúdo com opacidade
  60% e barra fina indeterminada no topo, ambos com 150 ms de atraso.
- `TableSkeleton` vira `TableSkeletonRows` (só linhas, larguras variadas,
  `cols`/`rows`), usado dentro do `<TableBody>` da tabela real — o cabeçalho é
  o real. A estrutura passa a ser `isLoading || hasData ? <Table>…` com o corpo
  alternando entre linhas de esqueleto e dados.
- `ListSkeleton` (novo): barra de filtros + tabela de esqueleto, para o lugar
  do `Skeleton h-[calc(100vh-150px)]` enquanto os totais carregam.
- `TablePagination` com `isLoading`: reserva a altura.
- Topbar com `countsLoading`: badge de esqueleto em cada aba.
- Early returns que trocam a tela inteira por esqueleto passam a manter o
  Topbar.

### 7. Barra lateral
Só o `aside` anima largura (`duration-slow ease-out`); rótulos e logos animam
opacidade/transform (`duration-base`). Fim do `transition-all duration-500`.

### 8. Redução de movimento
Em `globals.css`, sob `prefers-reduced-motion: reduce`: animações e transições
em `0.01ms` e uma iteração, exceto `.animate-spin`.

## Risks / Trade-offs

- **Cliques em `<a>` interceptados na captura:** só observa, nunca chama
  `preventDefault`. Navegações por `router.push` sem
  `startNavigationProgress()` ficam sem barra (mas a página antiga continua
  funcional).
- **`keepPreviousData` mostra dados de outro filtro por um instante** —
  mitigado pelo esmaecimento e pela barra.
- **`<span class="contents">` no botão:** filhos que dependem de ser filhos
  diretos do `<button>` (ex.: `ml-auto` no ícone direito) continuam
  funcionando porque `display: contents` não cria caixa.
