import * as React from 'react'

import { cn } from '@/lib/utils'

import { ICON_SIZE, ICON_STROKE, type IconSize } from '@/lib/icon-sizes'

// Ícones (design/openspec/changes/icones): uma biblioteca (Tabler), três
// tamanhos. O tamanho vem do contexto — botão pequeno, célula, barra lateral —
// e não de um número escolhido em cada tela. Valores em src/lib/icon-sizes.ts.
export { ICON_SIZE, ICON_STROKE, type IconSize }

/** Classe Tailwind do mesmo tamanho, para SVG que não aceita `size`. */
export const ICON_SIZE_CLASS: Record<IconSize, string> = {
  sm: 'size-icon-sm',
  md: 'size-icon-md',
  lg: 'size-icon-lg',
}

/** Qualquer componente de ícone que aceite o contrato do Tabler. */
export type IconComponentType = React.ComponentType<{
  size?: number | string
  stroke?: number | string
  className?: string
  'aria-hidden'?: boolean | 'true' | 'false'
  'aria-label'?: string
  role?: string
}>

export interface IconProps {
  icon: IconComponentType
  size?: IconSize
  /**
   * Nome para leitor de tela quando o ícone aparece sozinho. Sem `label` o
   * ícone é decorativo e fica `aria-hidden`.
   */
  label?: string
  className?: string
}

export function Icon({
  icon: Glyph,
  size = 'md',
  label,
  className,
}: IconProps) {
  return (
    <Glyph
      size={ICON_SIZE[size]}
      stroke={ICON_STROKE[size]}
      className={cn('shrink-0', className)}
      {...(label
        ? { role: 'img', 'aria-label': label }
        : { 'aria-hidden': true as const })}
    />
  )
}
