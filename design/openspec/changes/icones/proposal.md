# Ícones

## Why

Duas bibliotecas convivem (Tabler em 458 arquivos, Lucide em 35 — 16 deles
dentro dos primitivos do kit), um wrapper importa o mapa inteiro do Lucide
para um único consumidor, 32 ícones customizados têm tamanho e cor cravados, e
não há tokens de tamanho: ícones de 24 px dentro de botões de 32 e 40 px,
`size={13|14|16|18|20|22}` e `h-4…h-7` misturados, traço 1, 1,5 e 2. Pior: o
mesmo glifo significa coisas diferentes (lupa = consultar, ver e buscar;
impressora = imprimir e navegar; `IconFileInvoice` = ver DANFE e emitir;
`IconRefreshDot` = faturar e editar parcelas; lixeira = excluir e inativar),
ícones decorativos não têm `aria-hidden`, e `FeaturedIcon` tem 48 variantes
usadas sobretudo como decoração de cabeçalho de diálogo. Evidência:
`design/openspec/design/sistema-visual.md` §2.5.

## What Changes

- **Uma biblioteca:** Tabler Icons. Os primitivos do kit que usam Lucide
  (`button.tsx` spinner, `select.tsx`, `accordion.tsx`, `dropdown-menu.tsx`,
  `checkbox.tsx`, `calendar.tsx`, `sheet.tsx`, `command.tsx`, `pagination.tsx`,
  `UserDropdown.tsx`, `TabsNavigation.tsx`…) migram; `components/LucideIcon.tsx`
  sai e `lucide-react` deixa de ser dependência. **BREAKING** para
  `TabNavType.icon` (string do Lucide) → componente Tabler.
- **Tokens de tamanho:** `icon-sm` 16, `icon-md` 20, `icon-lg` 24; traço 2 até
  20 e 1,5 em 24+. Componente `Icon` (`ui/icon.tsx`) aplica tamanho por
  contexto (`size="sm|md|lg"`), `aria-hidden` quando decorativo e `aria-label`
  quando informativo. `Button` passa o tamanho certo ao ícone pelo seu `size`
  (16 em `sm`, 20 nos demais) — os `leftIconSize`/`rightIconSize` saem.
- **Dicionário de glifos** (`src/consts/icones.ts`): um gesto, um ícone
  (tabela §4.5 do `sistema-visual.md`); componentes de ação importam do
  dicionário, não do Tabler diretamente, para rotas de aplicação.
- **Ícones customizados:** `assets/icons/CustomIcons.tsx` se divide em
  `assets/icons/pictogramas/` (domínio: setores, tipos de recurso; tamanho
  fluido, `currentColor`, traço do Tabler) e `assets/logos/` (bancos, meios de
  pagamento; imagens, nunca "ícone"); exports com os mesmos nomes para não
  quebrar importações.
- **`FeaturedIcon`:** 3 tamanhos (`sm` 32 / `md` 40 / `lg` 48) × 6 tons
  (`brand`, `neutral`, `success`, `warning`, `error`, `info`), estilo único
  (círculo claro com ícone no tom); reservado a estado vazio, confirmação e
  onboarding; sai dos cabeçalhos de diálogo (168 usos) e dos cards de KPI.
- Emoji "⚡" de venda rápida vira `Badge` com ícone; SVGs escritos à mão
  (`CfopFormModal`) viram Tabler; `IconXboxXFilled` sai dos avisos.
- Lint: importação de `lucide-react` proibida; `size={N}` literal em ícone
  proibido fora de `ui/icon.tsx`.

## Capabilities

### New Capabilities

- `biblioteca-e-tamanhos-de-icone`: uma biblioteca, três tamanhos por
  contexto, traço por tamanho, acessibilidade do ícone.
- `dicionario-de-glifos`: um gesto, um ícone; ícones de ação só pelo
  dicionário.

### Modified Capabilities

Nenhuma.

## Impact

- `package.json` (remove `lucide-react`), `src/components/ui/*` (16 arquivos),
  `src/components/common/*`, `layout/UserDropdown.tsx`, `common/TabsNavigation.tsx`
  e seus consumidores (tipo `TabNavType`).
- `src/components/ui/icon.tsx` (novo), `src/consts/icones.ts` (novo),
  `assets/icons/**`, `assets/logos/**` (novo), `ui/featured-icon.tsx`,
  `ui/button.tsx` (tamanho do ícone por `size`), `common/ActionButton.tsx`.
- Todas as telas que passam `size={…}` a ícones (≈ 200) e as 315 chamadas de
  `FeaturedIcon`; as telas em que um glifo troca de significado (listadas em
  `tasks.md` §4).
- Não altera cores (tons vêm de `cores-e-contraste`) nem a hierarquia de
  botões (`botoes-e-acoes`), mas estas dependem daqui para o tamanho de ícone.
