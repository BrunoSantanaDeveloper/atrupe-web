# Design — ícones

Arquitetura compartilhada: `../../design/sistema-visual.md` (§2.5, §4.5).

## Context

- Tabler (`@tabler/icons-react`) é a biblioteca do Figma (design.md §2.6,
  "estilo contorno") e a dominante no código; Lucide entrou pelo shadcn nos
  primitivos e por `LucideIcon.tsx`, que faz `import { icons } from 'lucide-react'`
  (mapa completo no bundle).
- `ui/button.tsx:157-158` dá 24 px ao ícone por padrão; `ActionButton.tsx:45,50`
  usa 24 em botão e `size-5` em link; `AlertDialogAction` usa 20.
- `CustomIcons.tsx` tem 32 exports de 34×34 com `fill` fixos; 10 consumidores.
- `FeaturedIcon` (`ui/featured-icon.tsx`) tem 8 tons × 6 estilos, `shadow-sm`
  até no ghost, `bg-blue-light` inexistente, `lg` sem tamanho de SVG.

## Goals / Non-Goals

**Goals:**
- Ícone certo no tamanho certo sem o autor da tela decidir nada: o contexto
  (botão `sm`, célula, sidebar) define.
- Um glifo = um gesto em todas as telas.
- Bundle menor (sem Lucide inteiro).

**Non-Goals:**
- Redesenhar ícones; escolher novos pictogramas de setor (ficam os atuais).
- Decidir onde ícones aparecem (ação em linha, menus) — `botoes-e-acoes`.

## Decisions

### 1. `Icon` como wrapper fino do Tabler

```tsx
<Icon icon={IconPencil} size="md" label="Editar" />   // informativo
<Icon icon={IconPencil} size="sm" />                  // decorativo: aria-hidden
```

Mapeia `size` → `{ size: 16|20|24, stroke: 2|2|1.5 }`. `Button` e
`ActionButton` envolvem `LeftIcon`/`RightIcon` com `Icon` usando o próprio
`size`. Alternativa rejeitada: configurar `IconContext` global do Tabler —
não cobre tamanho por contexto.

### 2. Dicionário como objeto tipado

`consts/icones.ts` exporta `ICONE = { ver: IconEye, editar: IconPencil, … }`
e o tipo `Gesto = keyof typeof ICONE`. `ActionButton` e `RowActions`
(`botoes-e-acoes`) aceitam `gesto="editar"` além de `icon`. Páginas podem
importar do Tabler para ícones ilustrativos (setores, tipos), nunca para
ações.

### 3. Lupa é só busca

"Ver/abrir" vira `IconEye`; onde a linha inteira passa a abrir o registro
(`botoes-e-acoes`), o ícone de ver some. "Consultar CNPJ" vira
`IconId` com rótulo.

### 4. Pictogramas × logos

Pictogramas de domínio (setores, `ResourceKindIcon`) ficam como SVGs
`currentColor` sem `width/height` fixos, renderizados por `Icon`. Logos de
bancos e meios de pagamento viram `<Image>` em `assets/logos/` com `alt`;
`BankCard` e `member-select` passam a usá-los.

### 5. `FeaturedIcon` enxuto

API `tone` + `size`; estilo único (fundo `tone-*-bg`, ícone `tone-*-text`,
círculo). Os 168 usos em cabeçalho de diálogo são removidos por codemod
(cabeçalho de diálogo vira só título + descrição em `espacamento-e-layout`);
os usos em estado vazio/confirmação migram para a API nova.

## Risks / Trade-offs

- [Trocar o ícone de "ver" (lupa → olho) confunde usuários acostumados] →
  mudança acompanhada de dica com rótulo e, nas listas, da linha clicável;
  nota de versão.
- [Alguns pictogramas customizados dependem de cor fixa (ícones de setor
  coloridos)] → cor vem do `tone`/`style` do consumidor; os 13 fills viram
  `currentColor`; conferir na vitrine.
- [`TabNavType.icon` muda de string para componente] → 6 consumidores;
  codemod simples.

## Migration Plan

1. `Icon`, tokens, `consts/icones.ts`, vitrine `/sandbox/icones`.
2. Kit migra do Lucide; `Button`/`ActionButton` com tamanho por contexto.
3. Codemod `size={N}`/`h-N w-N` em ícones → `size="sm|md|lg"` por heurística
   de contexto (dentro de `Button size=sm` → sm; célula/menu → md; sidebar →
   lg) e revisão nas capturas.
4. Dicionário aplicado às ações com glifo ambíguo (lista em `tasks.md` §4).
5. `CustomIcons` dividido; `FeaturedIcon` enxuto; `lucide-react` removido.

## Open Questions

Nenhuma.
