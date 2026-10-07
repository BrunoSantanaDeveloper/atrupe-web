# Design — tipografia e hierarquia

Arquitetura compartilhada: `../../design/sistema-visual.md` (§2.1 diagnóstico,
§4.1 papéis, §6 verificação). Este arquivo cobre só o que é desta fatia.

## Context

- A escala do Untitled está em `tailwind.config.ts:440-464` com alturas de linha
  corretas e nomes `display-2xl…xs`, `xl`, `lg`, `md`, `sm`, `xs`. `md` (16/24)
  coexiste com o `base` padrão do Tailwind (também 16/24); `text-2xl` do
  Tailwind coincide com `display-xs`.
- `Topbar` (79 páginas) renderiza `<h1 class="text-gray-900 font-semibold text-lg">`
  e `<h3 class="text-gray font-medium text-lg">` para o subtítulo, sempre.
- `CardTitle` é `<h3 class="text-base font-semibold leading-none tracking-tight">`
  e 57 páginas o sobrescrevem para `text-gray-700`.
- Não há primitivo de texto; o projeto usa `cn()` em 633 lugares, então um
  componente com `className` passthrough se encaixa.
- A sidebar usa `<h3>` de 16/400 para os módulos, o que polui o outline de
  títulos de todas as páginas.

## Goals / Non-Goals

**Goals:**
- Qualquer página mostra, de relance, uma ordem: título › seção › card/dado ›
  apoio. O título é o maior texto da área de conteúdo; só o KPI herói do
  dashboard pode ser maior.
- Uma classe por papel; migração mecânica (codemod) do que é mecânico.
- Verificável por métrica renderizada (`audit.json`), não só por olho.

**Non-Goals:**
- Cores dos tokens (fica em `cores-e-contraste`); até lá os papéis apontam para
  as classes de rampa equivalentes.
- Reorganizar o conteúdo das páginas (ordem de seções, o que vai no cabeçalho):
  `navegacao-e-cabecalhos` e as mudanças de tela.
- Trocar a fonte ou a escala numérica em si.

## Decisions

### 1. Papéis como utilitários Tailwind + primitivos React

Um plugin em `tailwind.config.ts` registra utilitários `.type-page-title`,
`.type-body`, etc. (tamanho, linha, peso, `letter-spacing`, `font-variant-numeric`
quando tabular). Os primitivos `Heading` e `Text` só escolhem a tag e o
utilitário:

```tsx
<Heading as="h1" role="page-title">Orçamentos</Heading>
<Text role="page-subtitle">Propostas enviadas e em digitação</Text>
```

Alternativa rejeitada: só componentes (sem utilitários) — as 2 000+ células de
tabela e rótulos não vão virar `<Text>`; o utilitário cobre o JSX existente com
uma classe. Alternativa rejeitada: só utilitários — sem componente, a tag
semântica (`h1`/`h2`) continua à escolha de cada tela.

### 2. Cor do papel entra no utilitário

`.type-page-title` inclui `color: var(--text-primary)` (em `cores-e-contraste`)
— até lá, `theme('colors.gray.900')`. Assim a página não precisa (nem deve)
pôr `text-gray-700` ao lado do papel; quem precisar de cor diferente (KPI
negativo) sobrepõe com um token semântico, nunca com rampa.

### 3. `Topbar` ganha o papel sem mudar a API

`title` → `type-page-title`; `supportText` → `<p class="type-page-subtitle">`
(sai o `<h3>`); `classNames.title` continua aceito mas é marcado `@deprecated`
porque a faixa admin passa a ser `tone` em `navegacao-e-cabecalhos`. O `h1`
cresce 6 px; o `min-h-10` do contêiner vira `min-h-12` para não quebrar
alinhamento com os botões da direita.

### 4. Cabeçalhos de card e de diálogo

`CardTitle` = `type-card-title` (16/24 600), `CardDescription` = `type-secondary`;
`DialogTitle`/`SheetTitle`/`AlertDialogTitle` = `type-dialog-title` (18/28 600).
As 57 sobrescritas `text-base font-semibold text-gray-700` em `CardTitle` são
removidas por codemod (viram o padrão). `leading-none` sai de todos os títulos.

### 5. Eyebrow é o único uppercase

Codemod: toda `className` com `uppercase` vira `type-eyebrow` (removendo
`text-xs|[10px]|[11px]`, `tracking-*`, `font-*`, `text-gray-*` da mesma string).
Exceções mantidas à mão: siglas que já são maiúsculas no texto (CNPJ, NF-e) não
usam a classe.

### 6. Mínimo 12 px por codemod + lint

`text-[10px]`/`text-[11px]`/`text-[13px]` → `type-caption`/`type-body`. Regra
ESLint `no-restricted-syntax` com seletor em `JSXAttribute[name.name="className"]`
e regex `text-\[\d+px\]`.

### 7. Tabelas agrupadas

`TableGroupRow` (novo, em `ui/table.tsx`): `<tr>` com `bg-surface-subtle`, uma
célula `colSpan` calculada pelo número de `TableHead` do mesmo `Table` (via
contexto), texto em `type-eyebrow`. Substitui as quatro variações manuais e
corrige os `colSpan` errados de passagem.

### 8. `metadata.title`

Função `pageTitle(parts: string[])` em `lib/metadata.ts` → "Mão de obra ·
Base de custos · Atrupe". Layouts de módulo passam o nome do módulo via
`metadata.title.template`.

### 9. Capturas como instrumento

`e2e/ui/capturas.spec.ts` reutiliza o `global-setup` existente, percorre as
rotas estáticas de `src/app/(app-sidebar)` e grava `test-results/ui/*.png` +
`audit.json`. Não falha sozinho; é o "antes/depois" que o PR anexa.

## Risks / Trade-offs

- [Título maior desloca layouts justos (ex.: Topbar com três botões à direita
  em 1280 px)] → `flex-wrap` já existe no Topbar; conferir nas capturas as 12
  páginas com mais ações.
- [Codemod de `uppercase` apagar uma classe necessária na mesma string] →
  codemod só remove classes da lista fechada; rodar `tsc` e as capturas antes
  e depois; revisar o diff dos 176 arquivos por amostragem.
- [`text-base` ainda usado (164 vezes) após adotar `text-md`] → alias com
  aviso de lint, não erro; remoção em `espacamento-e-layout` quando as páginas
  forem revisadas.
- [Papéis sem os tokens semânticos ainda] → os utilitários apontam para a
  rampa; quando `cores-e-contraste` entrar, só o plugin muda.

## Migration Plan

1. Plugin de utilitários + primitivos (sem consumidores): zero impacto visual.
2. Kit (`Topbar`, `Card`, `Dialog`, `Table`, `Form`): impacto em todas as
   páginas de uma vez, revisado com as capturas.
3. Codemods (uppercase, px, `CardTitle` sobrescrito, `h1/h2/h3` soltos).
4. Lint em `error` só depois dos codemods.
Reversão: cada passo é um commit; o plugin pode ficar sem os consumidores.

## Open Questions

- O KPI herói do dashboard usa `display-sm` (30) ou `display-md` (36)? Decide-se
  em `telas-dashboard-e-relatorios` olhando a captura; os papéis permitem ambos.
