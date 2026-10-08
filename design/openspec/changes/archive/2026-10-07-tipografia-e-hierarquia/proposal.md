# Tipografia e hierarquia visual

## Why

Nas telas reais, 14 px e 12 px respondem por mais de 90 % do texto visível; o
título da página tem 18 px, o mesmo tamanho do seu subtítulo e do título de
diálogo, e os títulos de card têm 16 px. KPIs e nomes de pessoa ficam maiores
que o título da página. O usuário não consegue distinguir, de relance, o que é
título, o que é seção, o que é dado e o que é apoio — a queixa "fontes do mesmo
tamanho, sem hierarquia". A escala tipográfica do kit existe no Tailwind
(`display-*`, `xl…xs`) mas tem 8 usos em 887 arquivos; cada tela escolhe
`text-sm`/`text-lg` por conta própria, inclusive abaixo de 12 px (60 usos) e
em caixa alta com oito combinações de classe diferentes.

Evidência completa: `design/openspec/design/sistema-visual.md` §2.1.

## What Changes

- Definir **papéis tipográficos** (título de página, subtítulo, título de seção,
  de card, de diálogo, de objeto, KPI, corpo, apoio, legenda, rótulo, ajuda,
  eyebrow, cabeçalho de tabela, navegação) com tamanho, altura de linha, peso e
  cor fixos (tabela em `sistema-visual.md` §4.1).
- Criar os primitivos `Heading` e `Text` (`src/components/ui/typography.tsx`)
  que encapsulam os papéis, e fazer `Topbar`, `CardTitle`/`CardDescription`,
  `DialogTitle`/`DialogDescription`, `SheetTitle`, `AlertDialogTitle`,
  `TableHead`, `FormLabel`, `FormDescription`, `FormMessage`, `EmptyState` e
  os KPIs usarem os papéis em vez de classes soltas.
- Título da página sobe para 24/32 semibold; subtítulo desce para 14/20 em cor
  terciária e deixa de ser `<h3>`; título de diálogo e de seção 18/28; de card
  16/24; KPI 24/32 tabular (herói 30/38).
- **Eyebrow** passa a ser o único papel em caixa alta (12 px, 600,
  `tracking 0.04em`), usado em cabeçalho de grupo de tabela e de seção de
  formulário; as demais 93 combinações de `uppercase tracking-*` são migradas.
- Nenhum texto abaixo de 12 px: `text-[10px]` e `text-[11px]` migram para
  `caption` (12/18).
- Cinzas de texto passam a ser os papéis (primário/secundário/terciário); o uso
  de `text-gray-300`/`-400` em texto informativo acaba.
- Hierarquia em tabelas agrupadas: linha de grupo em `eyebrow`, linha de dado em
  `body`, identificador em `body-strong`; profundidade de árvore reduz peso, não
  aumenta.
- Numerais tabulares em toda célula numérica, KPI e total.
- `<h1>` único por página (do `Topbar`/`PageHeader`); `h2` para seções; `h3`
  para cards; a sidebar deixa de usar `<h3>` em rótulos de módulo.
- Título do documento (`metadata.title`) no formato "Página · Módulo · Atrupe".
- Limpeza: 72 chaves `fontFamily` mortas, `text-md` duplicado de `text-base`
  (fica `text-md` por alinhar com o Figma; `text-base` vira alias com aviso de
  lint), `leading-none` em títulos que quebram.
- Lint: `text-[Npx]` proibido; `uppercase` só via `eyebrow`; `font-bold` só em
  KPI herói.
- Capturas de verificação: `e2e/ui/capturas.spec.ts` com `audit.json`
  (tamanhos de fonte por página, cabeçalhos, botões repetidos e sem nome).

## Capabilities

### New Capabilities

- `papeis-tipograficos`: a escala de papéis tipográficos, seus primitivos e
  onde cada papel é obrigatório.
- `hierarquia-de-pagina`: como uma página, um card, um diálogo e uma tabela
  agrupada ordenam seus textos (um título, subtítulo menor que o corpo, KPI
  maior que o rótulo, grupo menor que o dado).

### Modified Capabilities

Nenhuma (primeiras specs de tipografia deste OpenSpec).

## Impact

- `tailwind.config.ts` (fontSize, fontFamily, plugin de utilitários de papel),
  `src/app/globals.css` (`font-feature-settings`).
- `src/components/ui/typography.tsx` (novo), `card.tsx`, `dialog.tsx`,
  `sheet.tsx`, `alert-dialog.tsx`, `table.tsx`, `form.tsx`, `label.tsx`,
  `empty-state.tsx`, `badge.tsx` (tamanho mínimo), `status-tag.tsx`.
- `src/components/common/Topbar.tsx`, `TableHeader.tsx`, `TableEmptyState.tsx`,
  `CustomButton.tsx`, `layout/SidebarComponent.tsx`, `MobileSidebar.tsx`.
- Todas as páginas que sobrescrevem `CardTitle` com `text-base text-gray-700`
  (43 + 14 ocorrências) e os `h1`/`h2`/`h3` soltos (197 ocorrências); os
  arquivos com `text-[10px]`/`[11px]` (60) e `uppercase` (176).
- `metadata.title` em `src/app/**/page.tsx` e `layout.tsx`.
- `.eslintrc.json` (regras novas), `e2e/ui/capturas.spec.ts` (novo).
- Não muda cor de token nem tema; `cores-e-contraste` define os tokens
  semânticos de texto que os papéis referenciam — até lá os papéis usam as
  classes de rampa equivalentes (`text-gray-900`/`-700`/`-600`).
