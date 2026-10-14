# Cores e contraste

## Why

A cor hoje não carrega significado nem compila: os tokens de cor são strings
`rgba()` mapeadas sem `<alpha-value>`, então todo `/NN` em cor do sistema é
descartado pelo Tailwind — os véus de diálogo, sheet e drawer não escurecem;
88 usos de `text-muted-foreground` e outras classes inexistentes não fazem
nada; 481 hexadecimais e 218 classes das paletas padrão do Tailwind convivem
com os tokens; dinheiro é verde por padrão (inclusive em valores rejeitados e
negativos), "Fechado" é amarelo de aviso, três dicionários discordam sobre o
que é "pendente", e links, textos de apoio, trilhos de switch, abas ativas e
botões desabilitados reprovam em contraste. Cinco anéis de foco diferentes
convivem. Evidência: `design/openspec/design/sistema-visual.md` §2.2.

## What Changes

- **Tokens em canais** (`--gray-500: 102 112 133`) e mapeamento com
  `rgb(var(--…) / <alpha-value>)`, devolvendo opacidade a todas as cores do
  sistema. **BREAKING** para quem lia `var(--gray-500)` como cor pronta em CSS
  (`globals.css`, `chart.tsx`, PDFs): esses pontos migram para
  `rgb(var(--gray-500))`.
- **Camada semântica** (`text-primary|secondary|tertiary|placeholder|disabled|brand|on-brand`,
  `bg-page|surface|surface-subtle|surface-selected`, `border-default|strong|focus`,
  `ring-focus`, `scrim`, `tone-{success,warning,error,info,neutral,brand}-{bg,border,text,solid}`,
  `chart-1…6`, `chart-positive|negative`) com valores claro e escuro, única
  camada que componentes e páginas usam a partir daqui.
- `borderColor.DEFAULT` passa a `border-default` (gray-200).
- **Dicionário de estados** em `src/consts/status.ts` (rótulo, tom, ícone por
  estado de domínio) consumido por badge, aba e filtro; `receivables.ts`,
  `financial.ts`, `payroll.ts`, `cashControl.ts`, `cashAccounts.ts`,
  `ordersStatusObj` e os mapas locais passam a derivar dele.
- **Dinheiro neutro:** valores monetários em cor primária; negativo em tom de
  erro com sinal; verde só em variação positiva pareada com a negativa;
  desconto não é aviso; resultado negativo nunca é verde.
- **Contraste:** texto ≥ 4,5:1, ícones e bordas de controle ≥ 3:1; corrigir
  links do login, `text-gray-300/400` em texto, switch, abas, faixa do Topbar,
  desabilitado, faixa admin (`tone="admin"` em orange-600), `#6CE9A6` dos
  gráficos.
- **Um anel de foco** (`ring-focus`: 4 px brand-100 + `border-focus`) em
  botão, input, select, aba, checkbox, badge interativo, item de menu, linha e
  card-link; os tokens roxos `focus-ring-4px-primary-*` saem.
- **Gráficos por token:** `--chart-*` com valores claro e escuro; legendas
  leem o mesmo token da série; `#6CE9A6`, `#3b82f6`, `#FEC84B`, `#F97066`,
  `#888`, `#d1d5db`, `#E4E4E7` saem.
- **Migração mecânica:** hex → token equivalente (tabela de 481 ocorrências);
  paleta padrão → tom semântico (`red-*` → `tone-error-*`, `amber/yellow-*` →
  `tone-warning-*`, `green/emerald-*` → `tone-success-*`, `blue/indigo-*` →
  `tone-info-*`, `neutral/slate-*` → `gray-*`); classes inexistentes → papel.
- **Lint e teste:** regra para hex e paleta padrão em `className`; teste que
  compara classes usadas com classes geradas e falha em classe desconhecida.
- Limpeza: aliases de sombra duplicados, sombras `portfolio-mockup`, `logo`
  hex, `#7b61ff` (moldura do Figma) em switch e gráficos.

## Capabilities

### New Capabilities

- `tokens-semanticos`: a camada semântica de cor, sua obrigatoriedade e a
  proibição de hexadecimal, paleta padrão e classe inexistente.
- `cores-de-estado`: o dicionário de estados (tom por estado de domínio),
  a regra de dinheiro neutro e "nunca só a cor".
- `contraste-e-foco`: limites de contraste e o anel de foco único.

### Modified Capabilities

Nenhuma por enquanto. Quando `tema-claro-escuro` arquivar e `tema-escuro`
existir em `design/openspec/specs/`, esta mudança passa a declarar um delta
MODIFIED nela: os valores escuros passam a ser expressos nos tokens
semânticos, não só nas rampas (ver `in-flight.md`, aresta dura).

## Impact

- `src/app/globals.css` (todas as variáveis de cor, `:root` e `.dark`),
  `tailwind.config.ts` (`colors`, `borderColor`, `ringColor`, `boxShadow` de
  foco), `src/components/ui/chart.tsx`, `src/components/common/charts/**`,
  `relatorios/**/components/*Chart*.tsx`, `dashboard/**`.
- `src/consts/status.ts` (novo) e os `consts/*.ts` de status existentes;
  todo componente que lê um `statusObj`.
- `src/components/ui/button.tsx` (foco e desabilitado), `input.tsx`,
  `select.tsx`, `tabs.tsx`, `badge.tsx`, `switch.tsx`, `dialog.tsx`,
  `sheet.tsx`, `drawer.tsx`, `alert-dialog.tsx`, `tooltip.tsx`, `skeleton.tsx`.
- 67 arquivos com hex, ~120 com paleta padrão, 88 com `text-muted-foreground`;
  `admin/**` (faixa e cupons), `(auth)/**` (links), `common/Topbar.tsx`.
- Depende de `tema-claro-escuro` arquivado (mesmos arquivos). Não altera
  tamanhos, espaçamentos nem componentes — só cor, foco e tokens.
- Achados fora de escopo (para o OpenSpec de regras): o estado PENDING ser
  mostrado como "Não realizado" em recebíveis é decisão de negócio; aqui só se
  unifica o rótulo escolhido.
