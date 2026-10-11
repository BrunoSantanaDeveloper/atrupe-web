# Design — componentes adequados à tarefa

Arquitetura compartilhada: `../../design/sistema-visual.md` (§2.7, §4.7).

## Context

- `ui/table.tsx` é o shadcn puro (sem estado, sem API); `common/TableHeader.tsx`
  (busca + filtros), `TablePagination.tsx` (URL, 28 arquivos),
  `TablePaginationControlled.tsx` (1 arquivo), `TableSkeleton.tsx`,
  `TableEmptyState.tsx` (`ListDataTotalEmpty`, `ListDataStatusEmpty`,
  `FilteredDataEmpty`) orbitam em volta sem contrato comum.
- `ui/data-table.tsx` (TanStack) e `ui/table-cells.tsx` existem só no
  sandbox.
- Formulário: `ui/form.tsx` (react-hook-form + Radix Label) com
  `aria-invalid`/`describedby` corretos; `common/form/FormInput.tsx`
  (`placeholder={label}`, `autoComplete="off"`), `FormSelect`, `FormTextarea`,
  `FormDatePickerInput` (react-day-picker), `DateRangePickerBasic`,
  `RateInput`, `FormBrlInput`; `common/form-input.tsx` é a cópia visual do
  Figma, sem comportamento.
- Calendários: `ui/calendar.tsx` (react-day-picker, 6 usos) e
  `ui/calendar-rac.tsx`/`datefield-rac.tsx` (react-aria, usados por
  `common/date-picker.tsx` no sandbox e por `DatePicker.tsx` morto).
- Status: `Badge` com 40 variantes de cor + `dot`; `ui/status-tag.tsx` (hex,
  inglês); `consts/*` com `statusObj` por domínio.
- Sem `Breadcrumb`, `Stepper`, `SegmentedControl`, `Combobox` (há
  `ui/command.tsx`), `Banner` (há `ui/alert-banner.tsx` sem uso).

## Goals / Non-Goals

**Goals:**
- Para cada tarefa recorrente (listar, filtrar, paginar, escolher data,
  digitar dinheiro, escolher entre opções, mostrar status, avisar, estado
  vazio, caminho, etapas) existe um componente e só um.
- Os componentes trazem acessibilidade e estados prontos; a tela só compõe.

**Non-Goals:**
- Migrar todas as tabelas para TanStack (`data-table.tsx`): a API de
  `Table` cobre ordenação e seleção sem trocar o modelo de dados das telas.
- Redesenhar formulários por módulo (mudanças de tela).

## Decisions

### 1. `Table` composta, com contexto

Mantém a composição (`Table > TableHeader > TableRow > TableHead`) e
acrescenta um `TableContext` que carrega `density`, `columns` (contado pelos
`TableHead` renderizados), `sort`, `selection`. `TableHead sortable`
renderiza botão com `aria-sort` e ícone; `TableGroupRow` e `TableEmptyRow`
usam `columns` para `colSpan`. `<Table state={{ loading, error, empty,
noResults }} skeletonRows={5} emptyState={…}>` resolve os estados no corpo.
Alternativa rejeitada: componente monolítico `DataTable` com `columns` —
exige reescrever 60 tabelas; a composição permite codemod.

### 2. Uma `Pagination`

`<Pagination total page pageSize onPageChange onPageSizeChange />` com
variante `mode="url"` (lê/escreve `?page&size`); janela 1 … n−1 n; "1–20 de
340"; seletor 10/20/50; botões como `Button tertiary` (sem `href="#"`).
`TablePaginationControlled` e o `lastPage = total/10` saem.

### 3. `FormField` com `required`/`optional`

`FormLabel` mostra "*" (`aria-hidden`) e `aria-required`; `optional` mostra
"(opcional)" em `helper`. Regra: formulário com maioria obrigatória marca os
opcionais; maioria opcional marca os obrigatórios — decidido por formulário,
mas sempre um dos dois. `placeholder` só via prop explícita com exemplo
("00.000.000/0000-00"); `autoComplete` inferido do `name` (email, tel,
postal-code, given-name…) com override.

### 4. Datas e dinheiro: um componente cada

`DatePicker` = `FormDatePickerInput` promovido (campo digitável com máscara +
popover `Calendar` react-day-picker + presets opcionais); `DateRangePicker`
sobre o mesmo `Calendar` com presets (hoje, 7 dias, mês, personalizado) —
substitui `DateRangePickerBasic` e o par "Select de período + range".
react-aria sai. `MoneyInput`/`PercentInput`: `inputMode="decimal"`, máscara
pt-BR, valor numérico no `onChange`, `numeric` no texto — substituem
`RateInput`, `FormBrlInput`, `MoneyInput` do caixa e as máscaras locais.

### 5. Escolha entre opções

`SegmentedControl` (Radix `ToggleGroup type="single"`, `role="radiogroup"`)
para 2–4 opções curtas sem descrição; `RadioCard` (existente, revisado) para
opções com título e descrição; `Select` só a partir de 5 opções;
`Combobox` (sobre `cmdk`) para listas longas com busca e "criar novo".
`Switch` só com efeito imediato (`AutosaveSwitch`); em formulário salvo
depois, `Checkbox`.

### 6. `Sheet` como padrão de detalhe

`Sheet size` (de `espacamento-e-layout`) com `SheetHeader` (título, status,
ações) e `SheetBody` em seções; "abrir outro registro" substitui o conteúdo
do mesmo sheet (pilha interna com "Voltar"), nunca abre diálogo por cima.
Diálogo que precisa de uma sub-tarefa (ex.: criar cliente a partir do
orçamento) usa `Sheet` sobre a página, não sobre o diálogo — o diálogo fecha
e reabre com o valor.

### 7. `StatusBadge`

`<StatusBadge status="OVERDUE" />` → `Badge` com `dot`, tom, rótulo e ícone
do dicionário; `Badge` continua para contagens e etiquetas livres (tons
semânticos apenas); `status-tag.tsx` sai. Etiquetas de cor definida pelo
usuário (status de orçamento) usam `ColorPicker` com paleta de 12 cores do
sistema e o texto é calculado (`tone` claro/escuro por luminância).

### 8. `EmptyState` único

`kind` define ícone e textos padrão: `empty` ("Nenhum X ainda" + ação de
criar), `no-results` ("Nada encontrado para os filtros" + "Limpar filtros"),
`error` (mensagem + "Tentar de novo"), `forbidden` ("Você não tem acesso a
X" + quem pedir). `TableEmptyState` vira wrapper fino e depois sai.

### 9. `Breadcrumb`, `Stepper`, `Banner`, `Alert`

`Breadcrumb` (Radix-less, `nav aria-label="Caminho"`, último item
`aria-current`); `Stepper` horizontal com `aria-current="step"`; `Banner`
(topo da área de conteúdo, tons, ação, fechar) substitui os banners à mão;
`Alert` com quatro tons e `role` só em `error`/`warning` dinâmicos.

### 10. Camada Figma DS

`form-input.tsx`, `table-cells.tsx`, `data-table.tsx`, `status-tag.tsx`,
`date-picker.tsx`, `nav-menu.tsx` saem (o que tinham de bom — especificação
visual — já está nos papéis e tokens). `resource-card.tsx` e `list-item.tsx`
migram para tokens e ficam no kit só se `telas-configuracoes` os adotar
(hub); senão saem também.

## Risks / Trade-offs

- [Codemod de tabela não consegue inferir `numeric`/`sortable`] → `numeric`
  já vem de `text-right` (`tipografia-e-hierarquia` 4.6); `sortable` é opt-in
  por tela.
- [Trocar o seletor de data muda o teclado de quem digita datas] → o campo
  continua digitável com máscara; presets são adição.
- [Remover react-aria quebra `calendar-rac`/`datefield-rac` usados no
  sandbox] → sandbox atualizado no mesmo PR.
- [`Sheet` em listas muda a URL?] → `?painel=<id>` para deep link e voltar do
  navegador fechar o painel.

## Migration Plan

1. Componentes novos e APIs no kit (sem remover os antigos).
2. Codemods mecânicos (paginação, `title=`→Tooltip, `Select` 2 opções →
   `SegmentedControl`, `Switch` em formulário → `Checkbox`, status →
   `StatusBadge`, estado vazio → `EmptyState`).
3. Consumidores do kit (TableHeader, TableSkeleton, TableEmptyState).
4. Remoção da camada Figma DS e de react-aria; lint em erro.
5. As mudanças de tela adotam `Sheet`, `Stepper`, `Combobox`, `Breadcrumb`.

## Open Questions

- `resource-card`/`list-item`: manter para o hub? Decide `telas-configuracoes`
  ao adotar `SettingsList` (que pode ser construído sobre `list-item`).
