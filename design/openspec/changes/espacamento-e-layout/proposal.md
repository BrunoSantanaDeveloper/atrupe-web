# Espaçamento, layout e contêineres

## Why

O espaço não segue uma grade: linhas de tabela renderizam com 57 e 73 px
(`py-4 px-6` sem opção de densidade), a barra lateral tem 296 px com 224 px
de cromo antes do primeiro item e uma régua por módulo, um `scrollbar-gutter`
global força paddings assimétricos na página e nos diálogos, há 52 larguras
diferentes de diálogo escolhidas caso a caso (950 px para uma textarea, 886
para três selects, 855 que vira 1180 ao trocar de aba), tudo é diálogo
centralizado (Sheet e Drawer têm zero usos), formulários alinham campos com
`flex-[1_0_250px]` dentro de `grid`, `<div></div>` vazios e `leading-[44px]`,
estados vazios têm altura presa à janela, hubs usam um card por linha e seis
raios diferentes convivem em superfícies iguais. Evidência:
`design/openspec/design/sistema-visual.md` §2.4.

## What Changes

- **Grade de 4 px e tokens de espaço** com os valores por lugar (gutter 24,
  seções 24, card 20/16, pilha 16, grupos de campos 32, linha 8) — tabela §4.4.
- **Tabela com densidade:** linha 44 px (`py-2.5 px-4`) por padrão, `compact`
  36, cabeçalho 40; `scrollbar-gutter` só no `main`; `main` com gutter
  simétrico de 24.
- **Diálogo com `size`** (`sm` 400, `md` 560, `lg` 720, `xl` 960, `full`) e
  **Sheet com `size`** (`md` 480, `lg` 640, `xl` 800); `max-w-[…]` em
  `DialogContent` proibido por lint; cabeçalho de diálogo branco (título +
  descrição), rodapé com `gap-3`; corpo rolável sem `pr-2`. **BREAKING** para
  quem passa `className` de largura.
- **Raios por papel:** `control` 8, `container` 12, `pill` 9999; os demais
  saem por codemod.
- **`FormGrid`** de 12 colunas com `FormRow`/`FormField` (`span`), seções
  com `eyebrow` e 32 px entre grupos; ordem de endereço padronizada; sem
  remendos de alinhamento.
- **Sidebar 264/64**, item 36 px, logo 56 px, conta no rodapé, sem régua por
  item (a estrutura de navegação é de `navegacao-e-cabecalhos`; aqui só as
  medidas).
- **Hub como lista agrupada:** um card por grupo com divisórias (o componente
  `SettingsList` é de `componentes-adequados`; aqui a medida: linha 64 px,
  ícone 40, padding 16/20).
- **Estados vazios** dimensionados pelo conteúdo (`py-12`), não pela janela.
- **Cards:** padding único, `CardHeader` com ação à direita, sem `Separator`
  após cada linha de campos nos detalhes; KPIs em grade de 4/2/1.
- Limpeza de `!important` reais (40), `body { pointer-events: auto !important }`
  e `grid-cols-12` com um filho.

## Capabilities

### New Capabilities

- `escala-de-espaco`: grade, tokens e medidas por lugar (gutter, card,
  tabela, formulário, sidebar).
- `tamanhos-de-conteiner`: tamanhos fechados de diálogo e painel lateral,
  raios por papel, e a regra "o menor contêiner que cabe".

### Modified Capabilities

Nenhuma.

## Impact

- `tailwind.config.ts` (spacing, borderRadius), `src/app/globals.css`
  (`scrollbar-gutter`, `pointer-events`), `(app-sidebar)/layout.tsx`.
- `ui/table.tsx`, `ui/dialog.tsx`, `ui/sheet.tsx`, `ui/alert-dialog.tsx`,
  `ui/card.tsx`, `ui/dropdown-menu.tsx`, `common/TableEmptyState.tsx`,
  `ui/empty-state.tsx`, `common/form/FormGrid.tsx` (novo),
  `layout/SidebarComponent.tsx` (medidas), `configuracoes/components/CompanySettingsList.tsx`.
- Todos os `DialogContent` com `className` de largura (≈ 180), os formulários
  com `flex-[…]`/`<div></div>`/`leading-[44px]` (lista em `tasks.md` §5), os
  usos de `rounded`/`rounded-md`/`rounded-2xl`/`rounded-[10px]` (≈ 330).
- Depende de `tipografia-e-hierarquia` (alturas de linha dos papéis definem
  as alturas de linha/cabeçalho). As mudanças de tela decidem qual diálogo
  vira Sheet ou página; aqui só existem os tamanhos.
