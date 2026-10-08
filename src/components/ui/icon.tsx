import * as React from 'react'

import { cn } from '@/lib/utils'

// Ícones (design/openspec/changes/icones): uma biblioteca (Tabler), três
// tamanhos. O tamanho vem do contexto — botão pequeno, célula, barra lateral —
// e não de um número escolhido em cada tela.
//
//   sm 16: texto em linha, botão pequeno, chip, badge
//   md 20: botão médio e grande, ação de linha, campo, item de menu
//   lg 24: barra lateral, cabeçalho, estado vazio

export const ICON_SIZE = { sm: 16, md: 20, lg: 24 } as const
export type IconSize = keyof typeof ICON_SIZE

// Traço do Tabler: 2 até 20 px, 1,5 a partir de 24 px (o desenho fica leve
// demais com 2 no tamanho grande)
export const ICON_STROKE: Record<IconSize, number> = { sm: 2, md: 2, lg: 1.5 }

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
