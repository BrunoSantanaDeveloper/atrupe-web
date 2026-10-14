# Design — cores e contraste

Arquitetura compartilhada: `../../design/sistema-visual.md` (§2.2, §4.2, §6).

## Context

- `globals.css:140-289` define `--gray-25…900`, `--brand-*`, `--error-*`,
  `--warning-*`, `--success-*`, `--blue-*`, `--purple-*`, `--orange-*`,
  `--rose-*`, etc. como `rgba(r, g, b, 1)`; `tailwind.config.ts:122-314` mapeia
  cada classe para `var(--x)`. Sem `<alpha-value>`, o Tailwind não gera
  `bg-gray-900/80`. As paletas padrão (`red`, `green`…) seguem sendo canais e
  por isso `bg-amber-50/40` funciona — o que explica parte da fuga para elas.
- O tema escuro (`tema-claro-escuro`) redefine as rampas sob `.dark`
  ("25–200 viram fundo, 600–900 viram texto") e cria `-fill` para sólidos.
  Qualquer camada semântica tem de nascer com os dois valores.
- `borderColor.DEFAULT = var(--gray-500)` (`tailwind.config.ts:112`).
- Status: `consts/receivables.ts:23-56` (polegares), `consts/financial.ts:7-12`,
  `consts/payroll.ts:7-8`, `consts/cashControl.ts:18-19`, `consts/cashAccounts.ts:17-18`,
  `ordersStatusObj`, mapas locais em `Delivery.tsx:62-67`, `PayrollMovement.tsx:102-104`
  (sem OVERDUE/PROVISIONED), `InvoiceResultsTable.tsx:362` vs `NfeAvulsaSection.tsx:147`.
- Gráficos: `ui/chart.tsx` lê `var(--chart-brand)` no dashboard; relatórios
  usam hex por arquivo.

## Goals / Non-Goals

**Goals:**
- Qualquer cor da interface vem de um token semântico; o token tem valor claro
  e escuro; opacidade funciona.
- Um estado de domínio tem um único rótulo, tom e ícone em todo o sistema.
- Nenhum texto ou controle abaixo de 4,5:1 / 3:1.

**Non-Goals:**
- Mudar a paleta do Figma (rampas continuam as mesmas).
- Trocar componentes (badge continua `Badge`; vira `StatusBadge` em
  `componentes-adequados`, já consumindo o dicionário daqui).
- Definir o tema escuro em si — só expressá-lo nos tokens semânticos.

## Decisions

### 1. Canais + `<alpha-value>`, não `color-mix`

`--gray-500: 102 112 133;` e `'gray-500': 'rgb(var(--gray-500) / <alpha-value>)'`.
É o padrão do Tailwind 3 e do shadcn; `color-mix()` resolveria sem tocar nas
variáveis, mas exige `@supports` e não é lido pelo `@react-pdf`. Os poucos
`var(--gray-x)` usados diretamente em CSS/JS (`globals.css` scrollbar,
`chart.tsx`, `TrialExpiredAlert`) passam a `rgb(var(--gray-x))`. O tema escuro
já está em `.dark { --gray-500: … }` — só muda a forma do valor.

### 2. Semântica como variáveis que apontam para rampas

```css
:root { --text-primary: var(--gray-900); --bg-surface: 255 255 255; … }
.dark { --text-primary: var(--gray-900); /* rampa invertida já resolve */ --bg-surface: var(--gray-50); … }
```

Alternativa rejeitada: semântica só no Tailwind (`textColor.primary =
theme('colors.gray.900')`) — não permite valor escuro diferente sem `dark:`.
Com variáveis, `.dark` escolhe outra rampa onde a inversão não basta (scrim,
surface-selected, tons `-solid`).

### 3. Nomes

`text-primary`, `bg-surface`, `border-default`, `ring-focus`, `tone-error-bg`.
Colidem com `bg-primary`/`text-muted-foreground` do shadcn em intenção, não em
nome — os nomes shadcn são removidos (hoje não existem). `brand` fica para a
rampa; `text-brand` é o semântico.

### 4. Dicionário de estados

`src/consts/status.ts` exporta `STATUS: Record<StatusKey, { label; tone; icon }>`
com as chaves de domínio existentes (`PAID`, `OVERDUE`, `PROVISIONED`, `OPEN`,
`DRAFT`, `APPROVED`, `REJECTED`, `CANCELED`, `DONE`, `FINISHED`, `AUTHORIZED`,
`ACTIVE`, `INACTIVE`, `CLOSED`, `REOPENED`, `IN_PROGRESS`, `PENDING`,
`PARTIAL`, `WAITING_APPROVAL`, `SENT`, `PROCESSING`, `BLOCKED`, `VOIDED`…).
Os `consts/*` atuais passam a `pick`/`extends` do dicionário, mantendo os
nomes de export para não quebrar importações. "Concluído" e "Finalizado"
(DONE/FINISHED) ganham rótulos distintos — "Concluído" (etapa) e "Entregue"
(serviço) — a confirmar com o OpenSpec de regras; até lá, ambos `success` com
rótulo diferente.

### 5. Dinheiro

Utilitário `Money` (`common/Money.tsx`): formata pt-BR, `numeric`, cor
primária; `negative` → `tone-error-text` com "−"; `variant="delta"` para
variação (verde/vermelho pareados com seta). Codemod troca
`text-success-700`/`text-green-*`/`text-red-*` em `formatCurrency(...)` por
`<Money>`.

### 6. Contraste por token, não por exceção

Os papéis tipográficos (`tipografia-e-hierarquia`) já fixam as cores de texto;
aqui entram os tokens que eles referenciam e os controles: switch desligado
`bg-gray-200` com borda `border-strong`; aba ativa `text-brand` (brand-700);
desabilitado por variante (§4.2); link `text-brand`; placeholder gray-500
nunca em texto informativo. Faixa admin: `tone="admin"` = `orange-600` fundo,
branco texto (5,0:1); o `#FF4201` sai.

### 7. Anel de foco único

`--ring-focus: var(--brand-100)` (escuro: `--brand-800`), classe
`focus-ring` = `focus-visible:outline-none focus-visible:ring-4
focus-visible:ring-focus focus-visible:border-focus`. `tema-claro-escuro`
criou `--focus-ring` cinza para o escuro; o token semântico o absorve. Os
`focus-ring-4px-*`/`shadow-*-focused-*` roxos saem.

### 8. Gráficos

`--chart-1…6`, `--chart-positive`, `--chart-negative`, `--chart-grid`,
`--chart-axis` em `globals.css` com `.dark`; `ChartConfig` do `ui/chart.tsx`
usa `var(--chart-n)`; legenda renderiza com a mesma `config`, nunca um swatch
manual. Verificar contraste de cada `--chart-n` sobre `bg-surface` ≥ 3:1.

### 9. Lint e teste de classe desconhecida

ESLint `no-restricted-syntax` em `className` para `#[0-9a-fA-F]{3,8}` e para
`\b(bg|text|border|ring|fill|stroke)-(red|green|blue|amber|yellow|emerald|
indigo|purple|violet|sky|cyan|teal|lime|rose|pink|orange|slate|zinc|neutral|
stone)-\d+`. Teste `scripts/check-unknown-classes.mjs`: extrai classes de
`src/**/*.tsx`, compila o CSS com o Tailwind e falha em classe não gerada
(cobre `text-muted-foreground`, `bg-blue-light`, `text-lG`).

## Risks / Trade-offs

- [Mudar o formato das variáveis quebra quem lê `var(--x)` como cor] →
  `grep "var(--"` fora de `tailwind.config.ts` lista os pontos (scrollbar,
  `chart.tsx`, alertas de trial, PDFs); todos migram no mesmo PR; teste
  visual nas capturas.
- [Codemod hex → token escolher um tom errado quando o hex não é exato] →
  tabela de mapeamento explícita para os 30 hex mais frequentes; os demais
  (≈ 60) à mão, listados na tarefa 5.3.
- [Dicionário de estados mudar o rótulo que o usuário conhece] → rótulos
  atuais mantidos onde não há conflito; conflitos (PENDING ×3, DONE/FINISHED,
  AUTHORIZED ×2) decididos na tarefa 4.2 e registrados em `design.md` da raiz.
- [Tons do escuro ainda em ajuste] → esta mudança espera `tema-claro-escuro`
  arquivar; os valores escuros dos semânticos partem dos já definidos lá.

## Migration Plan

1. Canais + `<alpha-value>` + migração dos `var(--x)` diretos (um commit;
   visualmente nulo exceto onde `/NN` passa a funcionar — véus).
2. Camada semântica (sem consumidores) + `borderColor.DEFAULT`.
3. Kit (foco, desabilitado, switch, abas, scrim, tooltip, skeleton).
4. Dicionário de estados + `Money`.
5. Codemods (hex, paleta, classes inexistentes, dinheiro).
6. Gráficos.
7. Lint em erro + teste de classe desconhecida no CI.
Reversão por commit; o passo 1 é o único com risco de regressão ampla e tem
as capturas como rede.

## Open Questions

- Rótulos finais de DONE/FINISHED e de PENDING em recebíveis dependem do
  OpenSpec de regras; não bloqueiam (ficam `success`/`neutral` com os rótulos
  atuais até a resposta).
