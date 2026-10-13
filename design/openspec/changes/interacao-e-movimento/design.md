# Design — interação, movimento e feedback

Arquitetura compartilhada: `../../design/sistema-visual.md` (§2.6, §2.7, §4.6).

## Context

- `tailwind.config.ts:471-489` só tem keyframes de accordion e caret; durações
  usadas: 200 (botão, input), 300 (menu móvel), 500 ×25 (sidebar, sheet).
  `transition-all` ×79.
- Foco: `ui/button.tsx:10` (4 px gray-600 offset), `input.tsx:63` (brand-50),
  `tabs.tsx:131,154` (outline removido / gray-400), `badge.tsx:7`,
  `dialog.tsx:50`; `select.tsx:22` usa `focus:`.
- Avisos: sonner montado em `app/layout.tsx:83` (249 importadores, 480
  `toast.error`, 267 `toast.success`); `ui/toaster.tsx` nunca montado;
  `ProductStRules.tsx` chama `useToast()`.
- Carregamento: `TableSkeleton` (50 arquivos), `Skeleton` (92), 43 spinners
  em linha, 21 "Carregando…"; `isLoading || !data` → esqueleto eterno;
  `isLoadingPayment` compartilhado.
- Formulários: react-hook-form em quase todos (`formState.isDirty`
  disponível); `AssemblyEditor` já tem autosave com carimbo e aviso ao
  fechar — é o modelo.

## Goals / Non-Goals

**Goals:**
- Tudo que é clicável parece clicável, responde ao pairar e ao focar, e
  nunca é invisível.
- Movimento curto, consistente e desligável.
- Um único caminho para "está carregando", "deu erro", "salvou", "vai perder
  o que digitou".

**Non-Goals:**
- Animações de entrada de página, microinterações decorativas (há um
  worktree `feat/microinteracoes` em andamento; esta mudança define os tokens
  que ele deve usar, não os efeitos).
- Conteúdo dos estados de erro por tela (mudanças de tela).

## Decisions

### 1. Tokens de movimento como `transitionDuration`/`TimingFunction`

`duration-fast` 100, `duration-base` 150, `duration-slow` 250; `ease-enter`
(`cubic-bezier(0, 0, 0.2, 1)`), `ease-exit` (`cubic-bezier(0.4, 0, 1, 1)`).
Utilitário `transition-ui` = `transition-[color,background-color,border-color,
box-shadow,opacity,transform] duration-base ease-enter`. `transition-all`
proibido por lint. Radix `data-[state]` animations usam `duration-slow`.
`globals.css`: `@media (prefers-reduced-motion: reduce) { *, ::before, ::after
{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important } }`
(a única exceção aceita de `!important`).

### 2. Foco por utilitário em todos os primitivos

`focus-ring` (de `cores-e-contraste`) aplicado em cada primitivo Radix
(`TabsTrigger`, `DropdownMenuItem`, `SelectTrigger`, `Checkbox`, `Switch`,
`AccordionTrigger`, `PaginationLink`, `Toggle`) e nos componentes de linha e
card clicáveis. Lint: `focus:` só acompanhado de `focus-visible:`;
`outline-none` só acompanhado de `focus-ring`.

### 3. Oculto é `inert` ou ausente

`opacity-0`/`w-0 overflow-hidden` em controle interativo: trocar por
renderização condicional ou `inert`+`aria-hidden`. Regra de lint para
`opacity-0` em `Button`/`button`/`a`.

### 4. Carregamento por `QueryState`

`common/QueryState.tsx`: `<QueryState query={q} skeleton={<TableSkeleton/>}
error={<EmptyState kind="error" onRetry/>} empty={…}>{data => …}</QueryState>`
— resolve `isLoading`, `isError`, `data vazio` numa ordem única. Alternativa
rejeitada: deixar cada tela compor `isLoading || !data` — é a origem do
esqueleto eterno. Mutations por item: `useMutation` com `variables` para
`isPending` do item (`mutation.variables?.id === row.id`).

### 5. Avisos

`ui/sonner.tsx`: `duration` por tipo (success 4000, info 5000, warning 6000,
error 8000 + `closeButton`), ícones do dicionário, `richColors` desligado
(tons do sistema via classes). `toast.error` com `{ persistent: true }` para
erros bloqueantes → recomendação: usar `Alert` na tela. `use-toast`,
`toaster.tsx`, `toast.tsx`, `ToastVariant.tsx` removidos; `ProductStRules`
migra para sonner.

### 6. Guarda de não salvo

`useDirtyForm(form)` registra o formulário num contexto; `Dialog`/`Sheet`
com `guardDirty` interceptam `onOpenChange(false)`, Esc e clique fora e
abrem `ConfirmDialog` ("Descartar alterações?" / "Continuar editando" /
"Descartar"). Para navegação (`Link`, `router.push`, "Cancelar digitação"),
`UnsavedChangesGuard` no layout de app usa `beforeunload` + interceptação de
`Link` por contexto. `SaveBar` (fixa no rodapé da área de conteúdo: "Você
tem alterações não salvas" · Descartar · Salvar) para páginas de edição
longa; autosave com carimbo (`AssemblyEditor`) como alternativa — a página
escolhe uma.

### 7. Switch de efeito imediato confirma

`Switch` com `onCheckedChange` assíncrono: estado `pending` (desabilitado
com spinner pequeno) e, ao resolver, `toast.success("Salvo")` ou reverte com
erro. Encapsulado em `common/AutosaveSwitch.tsx`.

## Risks / Trade-offs

- [Guarda de não salvo em todos os diálogos pode irritar em formulários
  triviais] → só dispara com `isDirty` real (react-hook-form) e nunca em
  diálogos de leitura.
- [Reduzir sidebar para 150 ms muda a sensação a que o usuário se acostumou]
  → é o padrão de mercado (Polaris 100–200 ms); conferir em revisão visual.
- [`QueryState` exige refatorar o fetch de ~30 telas] → adoção incremental:
  primeiro onde há esqueleto eterno ou "nenhum dado" em erro (lista §4),
  depois o resto nas mudanças de tela.
- [Remover `use-toast` quebra importações ocultas] → `grep -rl useToast src`
  tem 2 arquivos; `tsc` garante.

## Migration Plan

1. Tokens de movimento, utilitários, reduced-motion, lint em aviso.
2. Foco e hover nos primitivos; `inert` nos ocultos.
3. Sonner único; remoção do shadcn toast.
4. `QueryState`, `EmptyState kind="error"`, mutação por item; aplicar na
   lista §4.
5. `useDirtyForm`, guarda em Dialog/Sheet, `SaveBar`, `AutosaveSwitch`;
   aplicar na lista §5.
6. Codemods (`transition-all`, `duration-500`, `focus:`), lint em erro.

## Open Questions

- O worktree `feat/microinteracoes` deve ser rebaseado sobre os tokens daqui
  ou absorvido por esta mudança? Decisão do autor; não altera as specs.
