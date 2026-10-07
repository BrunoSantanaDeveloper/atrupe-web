// Papéis tipográficos (design/openspec/design/sistema-visual.md §4.1).
// Fonte única: o plugin do Tailwind (tailwind/typography-roles.ts) gera as
// classes `type-<papel>` a partir desta tabela, e os primitivos `Heading`/
// `Text` (components/ui/typography.tsx) usam o mesmo tipo.
//
// As cores apontam para as rampas até a camada semântica de
// `cores-e-contraste` existir; só esta tabela muda quando ela chegar.

export type TypographyRoleSpec = {
  /** Chave de `theme.fontSize` (já traz a altura de linha). */
  size: string
  weight: number
  /** Chave de `theme.colors`. */
  color: string
  tabular?: boolean
  eyebrow?: boolean
}

const PRIMARY = 'gray-900'
const SECONDARY = 'gray-700'
const TERTIARY = 'gray-600'

export const TYPOGRAPHY_ROLES = {
  'page-title': { size: 'display-xs', weight: 600, color: PRIMARY },
  'page-subtitle': { size: 'sm', weight: 400, color: TERTIARY },
  'section-title': { size: 'lg', weight: 600, color: PRIMARY },
  'card-title': { size: 'md', weight: 600, color: PRIMARY },
  'dialog-title': { size: 'lg', weight: 600, color: PRIMARY },
  'object-title': { size: 'display-xs', weight: 600, color: PRIMARY },
  'kpi-value': {
    size: 'display-xs',
    weight: 600,
    color: PRIMARY,
    tabular: true,
  },
  'kpi-hero': {
    size: 'display-sm',
    weight: 600,
    color: PRIMARY,
    tabular: true,
  },
  'kpi-label': { size: 'sm', weight: 500, color: TERTIARY },
  body: { size: 'sm', weight: 400, color: SECONDARY },
  'body-strong': { size: 'sm', weight: 600, color: PRIMARY },
  secondary: { size: 'sm', weight: 400, color: TERTIARY },
  caption: { size: 'xs', weight: 400, color: TERTIARY },
  label: { size: 'sm', weight: 500, color: SECONDARY },
  helper: { size: 'sm', weight: 400, color: TERTIARY },
  eyebrow: { size: 'xs', weight: 600, color: TERTIARY, eyebrow: true },
  'table-header': { size: 'xs', weight: 500, color: TERTIARY },
  'nav-item': { size: 'sm', weight: 500, color: SECONDARY },
  'nav-group': { size: 'xs', weight: 600, color: TERTIARY, eyebrow: true },
} as const satisfies Record<string, TypographyRoleSpec>

export type TypographyRole = keyof typeof TYPOGRAPHY_ROLES
