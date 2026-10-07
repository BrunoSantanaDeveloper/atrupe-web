## Why

Carregar e navegar no Atrupe parece estranho. Ao clicar num link nada acontece
até a página nova estar pronta e então tudo troca de uma vez; as telas carregam
em cascata com blocos que mudam de forma (bloco cinza gigante → esqueleto de
tabela genérico → tabela real com colunas, paginação e contadores diferentes);
cada filtro, busca ou página apaga a tabela inteira; e as transições são lentas
ou desencontradas (barra lateral e painel lateral em 500 ms, modal entrando na
diagonal, botão primário ficando cinza ao salvar). O esqueleto de carregamento
quase some no tema claro e vira mancha escura no escuro.

## What Changes

- **Base de movimento:** durações (`fast` 150 ms, `base` 200 ms, `slow` 300 ms)
  e curvas (`out`, `in-out`) nomeadas no Tailwind; `prefers-reduced-motion`
  respeitado em todo o sistema.
- **Esqueleto:** visível nos dois temas, sem `mix-blend-multiply`, com pulso
  suave e entrada atrasada (cargas rápidas não piscam).
- **Botão com `isLoading`:** mantém a cor da variante e a largura; o indicador
  de progresso fica centralizado no lugar do conteúdo, proporcional ao tamanho.
  Botões que trocavam o texto por "Salvando..." e os que não davam retorno
  passam a usar `isLoading`.
- **Modais e painéis:** modal e diálogo de confirmação entram do centro (fade +
  zoom), sem o deslize na diagonal; painel lateral mais rápido; saída mais
  rápida que entrada.
- **Navegação:** barra de progresso no topo durante a troca de página (só
  aparece se a troca demorar); item da barra lateral e aba do Topbar marcados
  no clique, antes da página nova chegar; carregamento inicial com o logo
  aparecendo suave, sem quicar.
- **Recolher a barra lateral:** mais rápido e animando só largura e opacidade.
- **Listagens:** filtro, busca, aba e página mantêm os dados anteriores
  esmaecidos com uma barra fina enquanto os novos chegam; o esqueleto da tabela
  usa o cabeçalho real; paginação e contadores das abas reservam o espaço; a
  primeira carga tem um único esqueleto com o formato final, com o Topbar
  sempre visível.
- **Conteúdo que aparece do nada:** conteúdo de abas entra com fade; avisos
  (banners) entram suaves; mensagens de "nenhum resultado" não aparecem antes
  dos dados.

## Capabilities

### New Capabilities
- `movimento`: durações, curvas, transições de modais/painéis/abas/barra
  lateral e redução de movimento.
- `estados-de-carregamento`: esqueletos, botão em progresso, retorno de
  navegação e carregamento/recarga de listagens.

### Modified Capabilities
<!-- Nenhuma: as specs de design ainda não foram arquivadas. -->

## Impact

- `tailwind.config.ts` (durações, curvas, keyframes), `src/app/globals.css`
  (redução de movimento).
- `src/components/ui`: `skeleton`, `button`, `dialog`, `alert-dialog`,
  `sheet`, `tabs`.
- `src/components/layout`: `SidebarComponent`, `MobileSidebar`; novo
  `NavigationProgress`; `src/app/loading.tsx`.
- `src/components/common`: `TableSkeleton`, `TablePagination`, `Topbar`; novo
  `FetchingRegion`.
- Listagens e telas com carregamento em `src/app/(app-sidebar)` (cerca de 90
  arquivos).
- Sem dependência nova. Não depende de `tema-claro-escuro`; quando ele
  entrar, o esqueleto acompanha porque usa um token de cinza.
