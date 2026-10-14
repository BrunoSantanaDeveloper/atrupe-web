import plugin from 'tailwindcss/plugin'

import {
  TYPOGRAPHY_ROLES,
  type TypographyRoleSpec,
} from '../src/lib/typography-roles'

// Gera `.type-<papel>` na camada `components` a partir de
// src/lib/typography-roles.ts. Utilitários de cor (`text-error-600`) continuam
// vencendo, porque `utilities` vem depois de `components`.
// Numerais tabulares fora dos papéis: o utilitário `tabular-nums` do Tailwind.

type FontSizeEntry = [string, { lineHeight?: string; letterSpacing?: string }]

export const typographyRoles = plugin(({ addComponents, theme }) => {
  const components: Record<string, Record<string, string>> = {}
  const fontSizes = theme('fontSize') as Record<string, string | FontSizeEntry>

  for (const [name, spec] of Object.entries(TYPOGRAPHY_ROLES) as [
    string,
    TypographyRoleSpec,
  ][]) {
    // `theme('fontSize.x')` devolve só o tamanho; a tupla com a altura de
    // linha vem do objeto inteiro.
    const entry = fontSizes[spec.size]
    if (!entry)
      throw new Error(`typography-roles: fontSize.${spec.size} não existe`)
    const [size, options] = Array.isArray(entry) ? entry : [entry, {}]
    const rule: Record<string, string> = {
      fontSize: size,
      lineHeight: options.lineHeight ?? 'normal',
      letterSpacing: spec.eyebrow
        ? '0.04em'
        : (options.letterSpacing ?? 'normal'),
      fontWeight: String(spec.weight),
      color: String(theme(`colors.${spec.color}`)),
    }
    if (spec.tabular) rule.fontVariantNumeric = 'tabular-nums'
    if (spec.eyebrow) rule.textTransform = 'uppercase'
    components[`.type-${name}`] = rule
  }

  addComponents(components)
})
