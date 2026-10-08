# Design — botões e hierarquia de ação

Arquitetura compartilhada: `../../design/sistema-visual.md` (§2.3, §4.3).

## Context

- `ui/button.tsx` é `cva` com `variant` (31), `size` (11) e `rounded`;
  `LeftIcon`/`RightIcon`/`isLoading` próprios; `asChild` via Radix `Slot`.
  Uso: padrão implícito 284, `neutralOutline` 277, `outline` 65, `neutralGhost`
  45, `ghost` 39, `error` 18, `neutralLight` 17, `none` 16, `link` 13; sizes
  `sm` 128, `md` 7, `lg` 0, `icon*` 116.
- `common/ActionButton.tsx` já faz Tooltip + `aria-label` por ação de linha —
  é a base certa; `common/CustomButton.tsx` é o azulejo de 70 px usado como
  ação em detalhes de orçamento/OS/folha/NF.
- Confirmações: `useAlertDialog` (store) + `GlobalAlertDialog` (14 arquivos),
  `AlertDialog` direto (16 arquivos), botões `error` em rodapé; `AlertDialogAction`
  usa `buttonVariants()` padrão (verde).
- Hubs: `CompanySettingsList` renderiza card por linha com `Button` primário
  "Configurar →" (`:97-116`).

## Goals / Non-Goals

**Goals:**
- Em qualquer tela, a ação principal é a única sólida; o resto é
  visivelmente secundário.
- Linha de lista abre o registro; ações de linha cabem em um ícone + menu.
- Nenhum destrutivo sem confirmação no tom certo; nenhum "Cancelar" ambíguo.

**Non-Goals:**
- Layout dos cabeçalhos de página e de detalhe (`navegacao-e-cabecalhos`
  define `PageHeader`/`ObjectHeader`; aqui só a regra de hierarquia que eles
  obedecem).
- `SettingsList` como componente (`componentes-adequados`); aqui se decide
  que o hub não tem botão.
- Reorganizar ações por módulo (mudanças de tela).

## Decisions

### 1. `variant` × `tone` em vez de 31 nomes

```tsx
<Button variant="primary|secondary|tertiary|link" tone="default|destructive" size="sm|md|lg|xl" icon? />
```

`cva` com `compoundVariants` para os 8 cruzamentos. Alternativa rejeitada:
manter nomes compostos (`destructiveSecondary`) — foi o que gerou as três
gerações. `rounded="full"` continua para avatar/chip.

### 2. Codemod com tabela de equivalência

| Legado | Novo |
|---|---|
| `default`, `primary`, `success` (quando é a ação principal) | `primary` |
| `neutralOutline`, `outline`, `secondary`, `secondaryOutline`, `*Outline`, `*BorderedLight`, `*Light`, `light`, `white` | `secondary` |
| `neutralGhost`, `ghost`, `*Ghost`, `none`/`raw` em ação, `link` em ação | `tertiary` |
| `link`, `underline` em navegação | `link` |
| `error`, `destructive` | `primary` + `tone="destructive"` |
| `errorOutline`, `errorLight`, `errorBorderedLight`, `destructiveOutline` | `secondary` + `tone="destructive"` |
| `errorGhost`, `destructiveGhost` | `tertiary` + `tone="destructive"` |
| `success*`, `warning*`, `blue*`, `indigo*`, `purple*`, `orange*` em contexto de tom | `secondary` + ícone do tom (o tom some do botão) |
| `glassDark`, `glassLight`, `semi`, `pill`, `blocked`, `draft`… (sandbox/status) | removidos; sandbox atualizado |

`size`: `default`/`md` → `md`; `sm` → `sm`; `lg`/`xl`/`xxl` → `lg`/`xl`;
`icon`/`iconMd` → `md` + `icon`; `iconSm`/`iconXs`/`iconXxs`/`roundXs` →
`sm` + `icon`; `iconLg` → `lg` + `icon`; `none` → `tertiary` sem padding
(`asChild`). O codemod registra os arquivos em que a escolha foi heurística
(mais de uma `primary` no mesmo componente) para revisão manual (tarefa 3.4).

### 3. Secundária leve

1 px `border-strong`, `bg-surface`, `text-secondary`, `shadow-xs`, hover
`bg-surface-subtle` — a do Untitled/Polaris. A borda de 2 px e o rótulo
gray-500 saem. Terciária = secundária sem borda e sem sombra.

### 4. Carregando sem pular

`isLoading` renderiza o conteúdo com `invisible` e um spinner `absolute`
centralizado; `aria-busy="true"`, `disabled`. Texto não troca ("Salvando…"
sai; o spinner já diz).

### 5. `RowActions`

```tsx
<RowActions
  primary={{ gesto: 'editar', label: 'Editar cliente', onClick }}      // opcional, 1
  items={[{ gesto: 'duplicar', label: 'Duplicar' }, '-', { gesto: 'excluir', label: 'Excluir', tone: 'destructive' }]}
/>
```

Renderiza `tertiary icon sm` + `DropdownMenu` (`IconDotsVertical`). A linha
(`TableRow onClick`/`href`) ganha `cursor-pointer`, hover, foco e Enter; o
clique nas ações não propaga. Sem ações além da primária, o menu não aparece;
sem nenhuma, a linha ainda abre.

### 6. Hub sem botão

Decisão de hierarquia: a linha de hub é um link (chevron, hover, foco); a
linha que abre modal passa a abrir página ou sheet (`telas-configuracoes`).
Enquanto a página não existe, a linha abre o diálogo mas sem botão.
"Importar <objeto>" idem: uma página "Importações" com seletor de tipo.

### 7. `ConfirmDialog`

Substitui `GlobalAlertDialog` e os `AlertDialog` avulsos; mantém o store
`useAlertDialog` como API (`alertDialog.confirm({ tone, title, description,
confirmLabel, cancelLabel, onConfirm })`). `tone="destructive"`: ícone
`IconAlertTriangle` em `tone-error`, botão `primary` destrutivo; `default`:
sem ícone de aviso, botão `primary`. `isLoading` funciona porque o diálogo
não fecha no clique — fecha depois da promessa. Rótulo de desistir padrão
"Voltar" quando o de confirmar começa com "Cancelar", senão "Cancelar".

### 8. `ChoiceCard`

O azulejo de `CustomButton` (ícone + legenda + título) é útil como escolha
(tipo de nota, modo de contagem) — vira `ChoiceCard` com `role="radio"` ou
link, e sai de todo lugar em que é ação (Aprovar, Imprimir, Emitir).

## Risks / Trade-offs

- [Codemod escolhe `primary` para mais de um botão numa região] → relatório do
  codemod + revisão manual nos 40 arquivos com múltiplas primárias; a regra de
  lint `one-primary-per-region` é heurística (mesmo `DialogFooter`/`PageHeader`)
  e fica como aviso.
- [Linha clicável conflita com seleção por checkbox e com texto selecionável] →
  clique no checkbox e nas ações não propaga; `user-select` mantido; teste e2e
  em orçamentos e clientes.
- [Remover o botão "Ver" das linhas tira uma pista visível] → chevron à
  direita em linhas de hub e hover em todas; nota de versão.
- [Tela sem `primary` óbvia (configurações com vários salvar)] → decidido em
  `telas-configuracoes` (barra de salvar única); até lá, codemod mantém a
  primeira como `primary`.

## Migration Plan

1. `button.tsx` novo com as variantes legadas ainda aceitas por alias
   (`@deprecated`) → zero quebra.
2. `ConfirmDialog`, `RowActions`, `ChoiceCard`, `consts/acoes.ts`, vitrine.
3. Codemod de variantes + revisão manual das regiões com múltiplas primárias.
4. Hubs, linhas de lista, cabeçalhos de detalhe, confirmações (por módulo,
   em commits separados).
5. Remover aliases e `CustomButton`; lint em erro.

## Open Questions

- Quais telas de detalhe têm "Editar" como primária e quais têm uma ação de
  domínio (Aprovar, Emitir)? Decide-se por módulo nas mudanças de tela; a regra
  aqui é só "uma".
