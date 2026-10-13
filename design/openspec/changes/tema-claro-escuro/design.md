## Context

Motivação: ver `proposal.md`. Requisitos: `specs/preferencia-de-tema` e
`specs/tema-escuro`.

Estado atual que molda a solução:

- **Toda cor do design system é variável CSS.** `src/app/globals.css` define
  `--gray-*`, `--brand-*`, `--error-*`… (escala do Untitled UI, vinda do Figma)
  e `tailwind.config.ts` mapeia cada classe (`bg-gray-50`, `text-brand-700`)
  para `var(--…)`. As ~850 telas usam essas classes diretamente, sem camada
  semântica (`bg-white` = superfície, `text-gray-900` = texto principal).
- **`next-themes` está instalado sem provedor.** Só `ui/sonner.tsx` lê o tema;
  sem provedor recebe `'system'`, por isso os avisos já seguem o sistema
  operacional sozinhos.
- **26 componentes de `src/components/ui` têm classes `dark:`** geradas pelo
  shadcn contra a escala padrão do Tailwind. O projeto trocou essa escala; 16
  usam `gray-950`, que não existe aqui (não fazem nada).
- **Bibliotecas usadas e tema próprio:**

  | Biblioteca | Tema escuro próprio? | Tratamento |
  |---|---|---|
  | `next-themes` | é o mecanismo (Claro/Escuro/Sistema, salva, sem piscar) | adotar |
  | `sonner` (avisos) | sim, prop `theme` | ligar ao provedor |
  | `recharts` via `ui/chart.tsx` | sim, `ChartConfig.theme` com `light`/`dark` | usar onde a cor da série mudar |
  | Navegador (rolagem, `input[type=date]`, autopreenchimento) | sim, `color-scheme` | declarar `light`/`dark` |
  | Radix, react-aria, cmdk, vaul, input-otp, react-day-picker, react-select | não, sem cores próprias (estilizados por classes nossas) | tokens |
  | `@react-pdf/renderer` | não se aplica (não usa CSS) | nada; PDF continua claro |

- **Cores fora dos tokens:** 718 classes com hexadecimal (`text-[#667085]`),
  a maioria valor exato de token; 218 classes de paletas padrão do Tailwind
  (`bg-red-50`, `text-amber-600`, `bg-emerald-50`…).

## Goals / Non-Goals

**Goals:**
- Tema escuro inteiro a partir dos tokens, sem editar tela por tela.
- Bibliotecas com tema próprio seguem a escolha do usuário.
- Tema claro idêntico ao atual.
- Componente novo que usar os tokens já nasce com tema escuro.

**Non-Goals:**
- Camada de tokens semânticos (`bg-primary`, `text-secondary`) e migração das
  classes para ela. Fica para uma mudança futura; esta não a impede.
- Salvar a preferência no servidor (não há endpoint; ver Open Questions).
- Revisar o desenho de cada tela no escuro além dos tokens e das exceções
  listadas aqui.

## Decisions

### 1. Mecanismo: `next-themes` com classe `.dark` no `<html>`
`ThemeProvider` em `Providers.tsx` com `attribute="class"`,
`defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`,
`storageKey="atrupe-tema"`. O `next-themes` injeta um script antes da pintura
(sem piscar), salva em `localStorage`, sincroniza abas e acompanha
`prefers-color-scheme`. `<html suppressHydrationWarning>` no `layout.tsx`.
Tailwind já está em `darkMode: ['class']`.

*Alternativa descartada:* hook próprio com `matchMedia` + cookie. Refaz o que a
biblioteca instalada já faz, incluindo o script contra piscar.

### 2. Tema escuro = redefinir as variáveis sob `.dark`
Um bloco `.dark { … }` em `globals.css` redefine os tokens. As classes não
mudam; o valor da variável muda.

**Modelo de iluminação (revisão do usuário).** O escuro é o mesmo ambiente com
menos luz, não uma troca de cores. No claro, o que está acima é mais claro
(cartão branco sobre página `gray-100`); a primeira versão invertia isso
(cartões e barra lateral mais escuros que a página). A ordem de luminância dos
fundos do claro se mantém no escuro:

```
página (gray-100) < gray-50 < gray-25 < cartão (white) < camada sobreposta (surface-raised)
```

- A página é o fundo mais escuro; cartão, barra lateral e campos são mais
  claros; menus, modais e avisos (`--surface-raised`, via
  `dark:bg-surface-raised` nos componentes sobrepostos de `ui/`) são mais
  claros ainda.
- `gray-50` como hover de linha fica um pouco mais escuro que o cartão, a mesma
  relação do claro (sombra leve).
- Bordas e divisórias (`gray-60/200/300`) são mais claras que o cartão: com
  pouca luz a aresta é definida por luz, não por sombra.
- `gray-200/300` **como fundo** (trilho de aba segmentada, base de controle,
  divisória feita com `bg-`) ficam recuados: no claro estão abaixo do cartão e
  da página, então no escuro ficam abaixo da página (`--gray-200-bg` `#080C15`,
  `--gray-300-bg` `#05080F`, mapeados só em `backgroundColor`). A aba ativa
  (`bg-white`) fica iluminada sobre o trilho, como no claro.

**Neutros (`--gray-*`):**

| Token | Papel típico no claro | Claro | Escuro |
|---|---|---|---|
| `gray-100` | página, fundo terciário | `#F2F4F7` | `#0C111D` (mais escuro) |
| `gray-50` | hover, área sutil | `#F9FAFB` | `#12171F` |
| `gray-25` | fundo sutil | `#FCFCFD` | `#171C28` |
| superfície (`bg-white`) | cartão, barra lateral, campo | `#FFFFFF` | `#1B202C` |
| `surface-raised` (novo) | menu, modal, aviso | `#FFFFFF` | `#232937` |
| `gray-60` | divisórias da barra lateral | `#E9EBF0` | `#262C38` |
| `gray-200` | borda secundária | `#EAECF0` | `#2B3140` |
| `gray-300` | borda de campo | `#D0D5DD` | `#3A4152` |
| `gray-400` | ícone, texto de exemplo | `#98A2B3` | `#7D828C` |
| `gray-500` | texto de apoio | `#667085` | `#949AA4` |
| `gray-600` | texto terciário | `#475467` | `#A7ACB5` |
| `gray-700` | texto secundário | `#344054` | `#CFD2D7` |
| `gray-800` | texto forte | `#1D2939` | `#E4E6EA` |
| `gray-900` | texto principal | `#101828` | `#F5F6F8` |

`gray-950` **não** é criado: as classes do shadcn que o citam
(`focus:ring-gray-950`, `text-gray-950`, `bg-gray-950`) nunca geraram CSS
neste projeto; criar o token as ligaria também no tema claro.

Contraste no escuro (spec *Legibilidade*): texto 900/700 ≥ 9,5:1 em qualquer
superfície; 500 ≥ 5,1:1; 400 (texto de exemplo) ≥ 3,7:1. Cartão sobre página
1,16:1 e camada sobreposta sobre cartão 1,12:1, diferença perceptível entre
fundos escuros.

**Cores (marca, estado e demais escalas) — mesma regra para todas:**

| Faixa | Uso típico no claro | Escuro |
|---|---|---|
| 25, 50, 100, 200 | fundo claro colorido, borda clara | luz colorida sobre o cartão: 8% / 15% / 25% / 40% do tom 500 misturado ao cartão (mais claras que ele, cada vez mais coloridas) |
| 300, 400, 500 | borda de foco, ícone, ponto | iguais ao claro |
| 600, 700, 800, 900 | texto colorido | 400, 300, 200, 100 |

Contraste: texto 600 sobre o cartão ≥ 5,8:1; texto 700 sobre fundo 50 da mesma
cor ≥ 6,8:1; fundo 50 sobre o cartão ≥ 1,16:1 (tinta perceptível).

*Alternativa descartada:* classes `dark:` em cada tela (decisão do usuário:
~850 arquivos, e todo componente novo teria de repetir o par).

### 3. Fundo branco e cor sólida têm mapeamento próprio no Tailwind
Duas classes usam a mesma cor com papéis opostos:

- `bg-white` é superfície (escurece) e `text-white` é texto sobre cor sólida
  (continua branco). Nova variável `--surface` (branco no claro, `#1B202C` no
  escuro) e `tailwind.config.ts` mapeia `white` para ela **só** em
  `backgroundColor`, `borderColor`, `ringColor`, `ringOffsetColor`, `divideColor`
  e `gradientColorStops`. `--white` continua branco nos dois temas.
  `--surface-raised` (branco no claro, `#232937` no escuro) é a camada
  sobreposta, aplicada com `dark:bg-surface-raised` em dialog, alert-dialog,
  dropdown-menu, select, popover, sheet, drawer, hover-card, toast, sonner,
  command e tooltip claro.
- `bg-brand-600` é preenchimento sólido (botão, mantém a cor) e
  `text-brand-600` é texto (clareia). Em `backgroundColor`, os tons 600–900 de
  todas as escalas (inclusive cinza) apontam para
  `var(--<cor>-<tom>-fill, var(--<cor>-<tom>))`. As variáveis `-fill` só
  existem sob `.dark`, com o valor do claro; no claro cai no fallback, igual a
  hoje. Assim botões e marcações sólidas mantêm a cor (spec *Cores de marca e
  de estado*).

### 3a. Primária iluminada no tema escuro
Pedido do usuário: a primária segue o mesmo modelo de luz. O botão principal é
um elemento acima da superfície, então no escuro é **mais claro que o cartão**,
com uma variação própria do verde Atrupe (mesmo matiz do `brand-500`, 158°,
saturação 60%, menos saturada: menos luz) e **tinta escura** por cima
(`--on-primary` = cor da página, `#0C111D`). O mouse acrescenta luz: clareia.

| Estado | Claro (`primary`) | Escuro | Tinta escura | Sobre o cartão |
|---|---|---|---|---|
| normal | `brand-600` `#077550` | `--brand-primary` `#2AA87A` | 6,3:1 | 5,4:1 |
| mouse | `brand-700` `#085D40` (escurece) | `--brand-primary-hover` `#2EB785` (clareia) | 7,4:1 | 6,4:1 |
| pressionado | `brand-800` `#084C36` | `--brand-primary-active` `#279B70` | 5,4:1 | 4,7:1 |

- Entra pelas variáveis `-fill` (`--brand-500/600/700/800-fill`), então vale
  para `bg-brand` (botão `default`, etiqueta `default`) e `bg-brand-600…800`
  (botão `primary`, etiqueta `primary`, dia selecionado do calendário).
  `bg-brand` e `bg-gray` (botão `neutral`) usam `-fill` também.
- A tinta escura entra por uma regra global em `globals.css`: sob `.dark`, um
  elemento com `bg-brand`/`bg-brand-500…800` e `text-white`/`text-gray-50`, ou
  um descendente com essas classes, recebe `color: var(--on-primary)`. Ícones
  dentro do botão usam `currentColor` e acompanham. Onde o preenchimento vem de
  variante (`data-[selected]:bg-brand-600` no calendário), a exceção é
  explícita: `dark:data-[selected]:text-on-primary`.
- Os botões `default` e `primary` ganham `dark:border-transparent`: a borda
  `border-brand-600` viraria o verde claro de texto e desenharia um contorno.
- As demais cores sólidas (sucesso, alerta, erro, cinza) mantêm o valor do claro
  com texto branco; só a primária é repensada, como pedido.

*Alternativa descartada (primeira versão):* verde escuro dessaturado (`#157955`)
com texto branco. Mantinha a tinta branca, mas deixava o botão mais escuro que
o cartão, contra o modelo de luz.

### 4. Classes `dark:` do shadcn saem
Com o token já escuro, `dark:bg-gray-950`/`dark:text-gray-50` inverteriam de
novo (texto escuro em fundo escuro). As classes `dark:` dos 26 componentes são
removidas; o tema escuro deles vem dos tokens. Não afeta o claro.

### 5. Exceções usam `dark:` pontual
Onde a regra geral erra (texto claro fixo sobre preenchimento sólido, como o dia
selecionado do calendário com `bg-brand-600 text-gray-50`), entra `dark:` só
naquele ponto (`dark:data-[selected]:text-on-primary`). O claro não muda. Cada exceção é encontrada
pela vitrine e pela varredura de combinações sólido + texto claro.

### 6. Hexadecimal igual a token vira token; paletas padrão do Tailwind viram variáveis
- Troca mecânica, só em classes, só quando o hexadecimal é **exatamente** o
  valor de um token (`text-[#667085]` → `text-gray-500`). Mesmo valor, claro
  inalterado. Hexadecimal sem token equivalente fica e é revisado na vitrine.
- As famílias padrão do Tailwind em uso (`red`, `green`, `amber`, `emerald`,
  `yellow`, `neutral`, `slate`, `violet`) passam a ser variáveis com os
  **valores padrão do Tailwind** no claro (nada muda) e a mesma regra da
  Decisão 2 no escuro. Ficam em canais RGB (`--red-500: 239 68 68`, lidas como
  `rgb(var(--red-500) / <alpha-value>)`): com a cor inteira na variável, as
  classes com opacidade (`border-red-500/50`, `bg-amber-50/40`) deixariam de
  ser geradas e o claro mudaria.
- Hexadecimais sem token: os fundos claros de ícone do `status-tag` ganham
  `dark:bg-[<cor>]/20`; o realce de arrastar do `file-uploader` ganha
  `dark:bg-brand-25`. Ficam como estão, por serem arte com texto branco legível
  nos dois temas: o cartão `peach` do `bank-card` e o fundo lilás do avatar em
  `table-cells`.

### 7. Sombras, foco e rolagem
Sob `.dark`: sombras com preto em opacidade maior (a sombra cinza-azulada some
no fundo escuro); anéis de foco de 4 px (`--focus-ring-4px-*`,
`--shadow-*-focused-*`) com o tom escuro equivalente; cor da barra de rolagem em
`globals.css` passa a usar token. `color-scheme: light` em `:root` e `dark` em
`.dark`; `body` ganha `bg-white` (superfície), igual ao claro de hoje.

### 8. Seletor
- **Computador:** submenu **Tema** no `UserDropdown` (entre o perfil e
  **Sair**), com `DropdownMenuRadioGroup` de três `DropdownMenuRadioItem`
  (Claro / Escuro / Sistema), componentes Radix já existentes em
  `ui/dropdown-menu.tsx`, ícones `lucide-react` como os vizinhos (`Sun`,
  `Moon`, `Monitor`).
- **Celular:** linha **Tema** no `MobileSidebar`, no mesmo estilo de Perfil e
  Sair, com `ui/toggle-group.tsx` de três opções.
- As opções (valor, rótulo, ícone) ficam num único lugar, usado pelos dois.
- O estado marcado só é desenhado após montar no cliente (`useTheme` não sabe
  o tema no servidor).

### 9. Gráficos e avisos
- `sonner`: perde as classes `dark:` (Decisão 4); `theme` passa a vir do
  provedor.
- Gráficos: cores de eixo/grade/legenda escritas em hexadecimal nos 15
  gráficos passam para `var(--gray-*)`; cores de série continuam (legíveis nos
  dois temas) ou usam `ChartConfig.theme` quando a vitrine mostrar que não.

## Risks / Trade-offs

- [Inversão por papel erra onde a classe foi usada fora do papel típico (ex.:
  `bg-gray-900` como fundo de painel claro-escuro)] → os tons 600–900 de fundo
  são preenchimento sólido (Decisão 3); o resto aparece na vitrine e na
  revisão das telas principais e vira exceção `dark:` (Decisão 5).
- [Hexadecimal sem token e cores em estilo inline/TS não mudam] → varredura
  lista os que pintam fundo claro; tratados um a um.
- [Imagens e logos com fundo branco ou texto escuro] → conferidos na vitrine;
  troca de arte é outra mudança.
- [Opacidade em classes com variável (`bg-white/50`) já não funciona hoje] →
  comportamento inalterado; fora de escopo.
- [Preferência só no navegador] → outro computador começa em Sistema; aceito
  (spec *Escolha salva no navegador*).

## Migration Plan

Sem migração de dados. Entrega num PR; reverter o PR volta ao tema único. O
padrão Sistema faz quem usa o sistema operacional no escuro ver o escuro na
primeira visita após a entrega.

## Open Questions

- Salvar a preferência na conta do usuário (vale em qualquer computador)
  depende de endpoint no backend; pode entrar depois sem mudar estas specs além
  de *Escolha salva no navegador*.
