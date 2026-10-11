# Interação: hover, foco, movimento e feedback

## Why

A interface não responde ao usuário de forma previsível: linhas e cards com
link não mudam ao pairar nem mostram cursor; mais de 50 botões crus,
cards-rádio, chips e abas não têm foco visível (0 `focus-visible` nos
módulos; abas sublinhadas removem o outline sem repor anel); affordances só
aparecem no hover (lápis de renomear) ou ficam invisíveis mas focáveis
(`opacity-0`, `w-0`); a barra lateral e o painel abrem em 500 ms com
`transition-all`, nada respeita `prefers-reduced-motion`, há esperas
artificiais de 600 ms e erro de validação piscando; o carregamento é ora
esqueleto, ora spinner, ora "Carregando…", ora um esqueleto que nunca sai
quando a requisição falha, ora um estado compartilhado que gira todos os
botões da lista; dois sistemas de aviso convivem e um deles não está montado
(quatro avisos nunca aparecem); erros somem sozinhos; nenhum formulário
avisa antes de descartar alterações. Evidência: `design/openspec/design/sistema-visual.md`
§2.6 e §2.7 (feedback).

## What Changes

- **Hover em tudo que é clicável:** linha (`bg-surface-subtle`), card-link
  (`border-strong` + `shadow-sm` + chevron), link (sublinhado), botão por
  variante; `cursor-pointer` só e sempre em interativo.
- **Foco único** com `focus-ring` (de `cores-e-contraste`) via
  `focus-visible:` em todo interativo, inclusive abas, cards-rádio, chips,
  linhas, itens de menu; `focus:` e `outline-none` sem anel proibidos por
  lint; elementos ocultos saem do DOM ou ganham `inert`.
- **Affordance sempre visível:** nada só no hover.
- **Tokens de movimento** (`fast` 100, `base` 150, `slow` 250 ms; `ease-out`
  entrada, `ease-in` saída); animar só cor, opacidade, transformação e
  sombra (`transition-all` proibido); `prefers-reduced-motion` zera durações
  e pausa o pulso do esqueleto; barra lateral 150 ms; sheet/diálogo 250 ms;
  sem esperas artificiais nem `animate-pulse` em erro.
- **Política de carregamento:** esqueleto com a forma do conteúdo
  (`aria-busy`) para página, tabela e cards; spinner só em botão ou junto de
  texto curto; "Carregando…" sozinho sai; erro de carregamento mostra
  estado de erro com "Tentar de novo" (nunca esqueleto eterno nem "nenhum
  dado"); carregamento por item, não por lista.
- **Um sistema de aviso:** sonner; `use-toast`, `toaster.tsx` e
  `ToastVariant` saem; sucesso 4 s, erro 8 s com fechar; erro que bloqueia a
  tarefa vira `Alert` na tela; ícones do dicionário.
- **Guarda de alterações não salvas:** diálogos e sheets com formulário
  `isDirty` confirmam antes de fechar (Esc, X, clique fora); páginas de
  edição longa usam barra de salvar fixa ou autosave com carimbo — nunca
  ambos; "Cancelar digitação" e navegação com formulário sujo passam pela
  guarda.
- **Feedback de salvar:** toda gravação (inclusive switches de efeito
  imediato) confirma com aviso ou carimbo "Salvo".

## Capabilities

### New Capabilities

- `estados-interativos`: hover, foco, cursor e affordance visível.
- `movimento`: tokens de duração, propriedades animáveis, movimento reduzido.
- `carregamento-e-avisos`: política de esqueleto/spinner/erro e o sistema
  único de avisos com durações.
- `alteracoes-nao-salvas`: guarda ao fechar/navegar e modelo de salvar.

### Modified Capabilities

Nenhuma.

## Impact

- `tailwind.config.ts` (transitionDuration, transitionTimingFunction,
  keyframes), `globals.css` (`@media (prefers-reduced-motion)`),
  `src/components/ui/*` (foco e transição em todos os primitivos),
  `ui/skeleton.tsx`, `ui/spinner.tsx`, `ui/sonner.tsx`, remoção de
  `ui/toast.tsx`, `ui/toaster.tsx`, `ui/use-toast.ts`, `common/ToastVariant.tsx`.
- `common/UnsavedChangesGuard.tsx` (novo), `common/SaveBar.tsx` (novo),
  `ui/dialog.tsx`/`sheet.tsx` (`onInterceptClose`), `lib/useDirtyForm.ts`.
- `layout/SidebarComponent.tsx`, `MobileSidebar.tsx`, `ui/sheet.tsx`
  (durações), todos os `<button>` crus e cards-rádio (lista em `tasks.md`),
  `producao/gerenciador/**`, `configuracoes/produtos/**` (`ProductStRules`),
  estados de carregamento de ~30 telas (lista em `tasks.md` §4).
- Depende de `cores-e-contraste` (`ring-focus`, `scrim`). As mudanças de
  tela aplicam a política por tela; aqui ficam os componentes e as telas em
  que o defeito é do kit ou é sistêmico.
