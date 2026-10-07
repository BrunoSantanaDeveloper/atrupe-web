# Componentes adequados à tarefa

## Why

O kit tem o componente certo e a tela usa o errado, ou o componente certo
não existe e cada tela reinventa: tabelas sem API numérica, de ordenação, de
cabeçalho fixo ou de densidade (298 `text-right` ad hoc, duas paginações sem
"1–20 de 340", `<table>` cru, "tabelas" de `div`, `colSpan` errado em sete
lugares); formulários com placeholder igual ao rótulo, "Digite aqui",
`autoComplete="off"`, sem marcador de obrigatório, três estilos de
desabilitado, dois motores de calendário e quatro seletores de data, três
máscaras de dinheiro e `type="number"` com ponto decimal, `Switch` em
formulário salvo depois, `Select` de duas opções, cards-rádio reinventados
seis vezes, `title=` nativo em 436 lugares; sobreposições só com diálogo
(Sheet e Drawer com zero usos), diálogo sobre diálogo, wizard sem indicador;
status por polegar, ponto ou enum cru; alertas amarelos feitos à mão; três
padrões de estado vazio; zero breadcrumbs; abas em três lugares; uma camada
"Figma DS" de 2 000 linhas usada só no sandbox. Evidência:
`design/openspec/design/sistema-visual.md` §2.7 e §4.7.

## What Changes

- **`Table` com API:** `density`, `numeric` em cabeçalho e célula (direita +
  tabular), `sticky` (cabeçalho e primeira coluna), `sortable` com
  `aria-sort`, `selectable` com `SelectionBar`, `TableGroupRow`, estados
  embutidos (`loading`, `error`, `empty`, `noResults`) e `colSpan` por
  contexto. **`Pagination` única** (URL ou controlada) com "1–20 de 340",
  tamanho de página, rótulos em português e sem `href="#"`. `TablePaginationControlled`
  e `<table>` crus saem.
- **Formulário:** `FormField` com `required` (asterisco e `aria-required`),
  `optional` ("opcional"), placeholder só como exemplo de formato (nunca o
  rótulo, nunca "Digite aqui"), `autoComplete` por tipo de campo, um estilo
  de desabilitado, rótulo que não fica vermelho; **`DatePicker`** e
  **`DateRangePicker`** únicos (react-day-picker, campo digitável, presets;
  react-aria sai); **`MoneyInput`** e **`PercentInput`** únicos (máscara
  pt-BR, `inputMode=decimal`); **`SegmentedControl`** para 2–4 opções;
  **`RadioCard`**/**`CheckboxCard`** (os existentes) como únicos cards de
  escolha; `Switch` só para efeito imediato (`AutosaveSwitch`), `Checkbox`
  dentro de formulário; **`ColorPicker`** com paleta e texto por contraste;
  `Combobox` pesquisável para listas longas.
- **Sobreposições:** `Sheet` como padrão para ver/editar a partir de lista;
  `Stepper` para fluxos de etapas; regra "diálogo não abre diálogo"
  (navegação entre painéis via substituição); `Tooltip` em vez de `title`
  (lint).
- **Feedback e status:** `StatusBadge status="…"` lendo o dicionário de
  `cores-e-contraste`; `Alert` com `info|success|warning|error` e `Banner`
  de topo (`TrialExpiredAlert`/`PartialBlockAlert`/homologação viram
  `Banner`); **`EmptyState`** único com `kind="empty|no-results|error|forbidden"`
  e ação; `Breadcrumb`; `Tabs` de link só no cabeçalho de página, contador
  só > 0.
- **Camada Figma DS:** `table-cells`, `data-table`, `status-tag`,
  `resource-card`, `list-item`, `form-input` (759 linhas), `date-picker`,
  `nav-menu` — o que tem par no kit é removido; o que é útil (`resource-card`,
  `list-item`) migra para tokens e entra no kit com um consumidor real.
- Código morto removido (lista em `tasks.md` §7).

## Capabilities

### New Capabilities

- `tabelas-e-paginacao`: a API de tabela e a paginação única.
- `campos-de-formulario`: obrigatório/opcional, placeholders, data, dinheiro,
  escolha entre opções, switch versus checkbox, listas longas.
- `sobreposicoes-feedback-e-status`: painel lateral, stepper, tooltip, status
  badge, alertas, estados vazios, breadcrumb, abas.

### Modified Capabilities

Nenhuma.

## Impact

- `ui/table.tsx`, `ui/pagination.tsx`, `common/TablePagination*.tsx`,
  `common/TableSkeleton.tsx`, `common/TableEmptyState.tsx`, `ui/empty-state.tsx`,
  `ui/form.tsx`, `common/form/**`, `ui/calendar*.tsx`, `ui/datefield-rac.tsx`,
  `common/date-picker.tsx`, `common/date-range-picker.tsx`, `common/DateRangePickerBasic.tsx`,
  `common/form/FormDatePickerInput.tsx`, `common/RateInput.tsx`, `common/form/FormBrlInput*`,
  `ui/switch.tsx`, `ui/select.tsx`, `ui/sheet.tsx`, `ui/alert.tsx`,
  `ui/alert-banner.tsx`, `ui/badge.tsx`, `ui/status-tag.tsx`, `ui/tabs.tsx`,
  `common/TabsNavigation.tsx`, `ui/breadcrumb.tsx` (novo), `ui/stepper.tsx`
  (novo), `ui/segmented-control.tsx` (novo), `ui/combobox.tsx` (novo),
  `common/StatusBadge.tsx` (novo), `common/Banner.tsx` (novo),
  `common/ColorPicker.tsx` (novo).
- `package.json`: `react-aria-components` sai se não restar consumidor.
- Consumidores: todas as tabelas (≈ 60 arquivos), formulários com data,
  dinheiro e escolha (≈ 80), status (≈ 40), estados vazios (≈ 70).
- Depende de `botoes-e-acoes` (`RowActions`, `SelectionBar`, `ConfirmDialog`)
  e `espacamento-e-layout` (`size` de Dialog/Sheet, densidade). As mudanças
  de tela aplicam os componentes por módulo; aqui ficam os componentes, os
  codemods mecânicos e os consumidores do kit.
