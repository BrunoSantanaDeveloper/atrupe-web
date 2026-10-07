# Design — espaçamento, layout e contêineres

Arquitetura compartilhada: `../../design/sistema-visual.md` (§2.4, §4.4).

## Context

- `globals.css:17-21`: `div { scrollbar-gutter: stable }` com três exceções
  por classe; `main` usa `pl-6 pr-2` e `DialogBody` `p-6 pr-2` para
  compensar. `globals.css:10`: `body { pointer-events: auto !important }`
  (remendo para Radix com modais empilhados).
- `ui/table.tsx:98`: `TableCell` `p-4`/`px-6`; `TableHead` `h-12 px-6`.
- `ui/dialog.tsx`: `DialogContent` `max-w-lg` sobrescrito por `className`
  em quase todo uso; cabeçalho `bg-gray-100 border-gray-300 p-6`; rodapé
  `border-gray-300`; `DialogBody` `max-h-[calc(100vh-200px)]`.
- `ui/sheet.tsx` (sem usos) tem `side` e larguras `sm:max-w-sm`.
- Raios: `rounded-lg` (8) em botão/input, `rounded-xl` (12) em `Card`,
  `rounded-md` em menu, `rounded` (4) em 247 lugares (badges, chips, células).
- Sidebar: `w-[296px]`/`w-24`, `h-28` logo e `h-28` bloco do usuário.

## Goals / Non-Goals

**Goals:**
- Todo espaço vem de um token; alturas de linha, padding de card e tamanhos
  de diálogo são escolhidos de um conjunto fechado.
- Formulário sem remendo: grade, `span`, grupos.
- Diálogo tem o tamanho da tarefa; Sheet existe para detalhe e edição.

**Non-Goals:**
- Decidir qual tela usa Sheet, página ou diálogo (mudanças de tela, com a
  regra §3.9 do `sistema-visual.md`).
- Estrutura da sidebar (seções, flyouts): `navegacao-e-cabecalhos`.
- Componentes novos de tabela/paginação: `componentes-adequados`.

## Decisions

### 1. `scrollbar-gutter` só em `main`

Remover a regra global; `main { scrollbar-gutter: stable }` e `overflow-y:
auto`; `DialogBody` usa `overflow-y: auto` sem gutter (barra aparece quando
precisa, padding simétrico). Alternativa rejeitada: manter global e
compensar — é a origem dos `pr-2`.

### 2. Densidade na tabela, não na célula

`<Table density="default|compact">` seta uma variável CSS (`--row-py`) lida
por `TableCell`/`TableHead`; páginas não passam padding a células. Linha
44 px = 20 px de linha de texto + 2×12 px; compact 36 = 20 + 2×8. Cabeçalho
40 px. Alturas renderizadas conferidas pelo `audit.json` (`rowHeights`).

### 3. `size` em `DialogContent` e `SheetContent`

`size` → `max-w` via `cva`; `className` continua para outras coisas; lint
proíbe `max-w-` em `className` de `DialogContent`/`SheetContent`. Em telas
< `sm`, diálogo ocupa a largura inteira com margem 16; `full` ocupa a tela.
Cabeçalho: `px-6 pt-6 pb-4`, título + descrição (sem faixa cinza, sem
`FeaturedIcon`); corpo `px-6 py-2` rolável; rodapé `px-6 pb-6 pt-4` com
`border-t` só quando o corpo rola, botões à direita com `gap-3`.

### 4. Raios em três papéis

`borderRadius`: `control` 8, `container` 12, `pill` 9999 (e `none`). Mantém
`lg`/`xl`/`full` como aliases nomeados para o codemod; `rounded` (4),
`-sm`, `-md`, `-2xl`, `-[10px]`, `-[2px]` saem. Badge e chip usam `pill`;
célula de cor/imagem usa `control`.

### 5. `FormGrid`

`FormGrid` = `grid grid-cols-12 gap-x-4 gap-y-4`; `FormField span={6}`
(padrão 12; `sm:` breakpoint colapsa para 12); `FormSection title` com
`eyebrow` e `mt-8`. Grupos de campos repetíveis (endereços, contatos) viram
`FormRepeater` com cabeçalho de item e ação "Remover" em `tertiary`.
Alinhamento de índice de parcela por `items-end` na linha, sem `leading-[44px]`.

### 6. Sidebar: medidas

`w-[264px]`/`w-16`, logo `h-14`, item `h-9` com `px-3 gap-3`, subitem `h-8`,
seção com `eyebrow` e `mt-4`, conta do usuário `h-14` no rodapé, sem
`border-b` por item. Transição 150 ms (`interacao-e-movimento`).

### 7. Card

`Card` `rounded-container border bg-surface`; `CardHeader` `px-5 pt-5 pb-3
flex items-start justify-between gap-4` (ação à direita); `CardContent`
`px-5 pb-5`; `CardFooter` `px-5 pb-5 pt-0`. `DetailCard` (cliente/fornecedor)
usa `dl` em grade de 4/2 colunas sem separadores entre linhas.

### 8. Estado vazio

`py-12 px-6` centrado, largura máxima 360 do texto; sem `h-[calc(100vh-…)]`.
Dentro de card com abas/KPIs acima, isso evita a rolagem forçada.

## Risks / Trade-offs

- [Linha de 44 px exige revisar colunas com duas linhas de texto (nome +
  e-mail)] → duas linhas de `text-sm` cabem em 44 com `py-1.5`; a tabela
  aceita `rowHeight="auto"` nessas colunas (altura mínima 44).
- [Codemod de raio trocar `rounded` em elementos que precisam de 4 px
  (cantos de célula de cor)] → `rounded` → `rounded-control` por padrão;
  lista de exceções revisada (status-tag, chips de cor).
- [`DialogContent` com `className` de largura em 180 lugares] → codemod mapeia
  por faixa (≤ 450 → `sm`, ≤ 600 → `md`, ≤ 760 → `lg`, ≤ 1000 → `xl`, maior →
  `full`) e registra para revisão; as mudanças de tela ajustam.
- [Remover `pointer-events: auto !important` reabre bug de modal sobre modal]
  → modais empilhados deixam de existir (`componentes-adequados`/telas);
  até lá a regra fica com comentário e issue.

## Migration Plan

1. Tokens de espaço e raio; `scrollbar-gutter`; `main`.
2. `Table` com densidade; `Dialog`/`Sheet` com `size`; `Card`; estado vazio;
   `FormGrid`.
3. Codemods (largura de diálogo, raios, `TableCell` padding, `space-y`
   irregulares).
4. Formulários remendados à mão (lista §5 de `tasks.md`).
5. Sidebar (medidas) e hub (medidas).
6. Lint em erro.

## Open Questions

Nenhuma.
