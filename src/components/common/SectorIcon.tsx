'use client'

// O ícone do setor com a cor dele (área 9 §4.14): o quadrado de 32 px da
// Agenda de entrega (design.md da raiz §3.12) e o mesmo desenho em todo lugar
// em que o setor aparece. Estados: normal (fundo claro na cor do setor e o
// ícone na cor), concluído (fundo verde, como a agenda já fazia) e apagado.

import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'

// Hooks / Consts
import { useSectorColor } from '@/hooks/useSectorColor'
import { sectorIcons, sectorIconByName } from '@/consts/sectors'
import { sectorEdge, sectorTint } from '@/lib/sector-color'

// Icons
import { IconQuestionMark } from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'

export type SectorIconProps = HTMLAttributes<HTMLSpanElement> & {
  name?: string | null
  icon?: string | null
  sectorId?: string | null
  size?: 'sm' | 'md' | 'lg'
  state?: 'default' | 'done' | 'muted'
  // Só a figura, sem o quadrado
  bare?: boolean
}

const sizes = {
  sm: { box: 'size-6 rounded-md', icon: 'size-3.5' },
  md: { box: 'size-8 rounded-lg', icon: 'size-4' },
  lg: { box: 'size-10 rounded-10', icon: 'size-5' },
}

export const SectorIcon = forwardRef<HTMLSpanElement, SectorIconProps>(
  (
    {
      name,
      icon,
      sectorId,
      size = 'md',
      state = 'default',
      bare,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const colorOf = useSectorColor()
    const color = colorOf({ id: sectorId, name, icon })
    const Icon =
      (icon && sectorIcons[icon]?.icon) ||
      (name ? sectorIconByName(name) : IconQuestionMark)

    const boxStyle: CSSProperties =
      state === 'done'
        ? {}
        : state === 'muted'
          ? { color: '#98A2B3' }
          : {
              color,
              backgroundColor: sectorTint(color),
              borderColor: sectorEdge(color),
            }

    if (bare) {
      return (
        <span
          ref={ref}
          className={cn('inline-flex', className)}
          style={{ color: state === 'muted' ? '#98A2B3' : color, ...style }}
          {...rest}
        >
          <Icon className={sizes[size].icon} aria-hidden="true" />
        </span>
      )
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex shrink-0 items-center justify-center border',
          sizes[size].box,
          state === 'done' && 'border-success-500 bg-success-500 text-white',
          state === 'muted' && 'border-gray-200 bg-gray-50',
          className,
        )}
        style={{ ...boxStyle, ...style }}
        title={name || undefined}
        {...rest}
      >
        <Icon className={sizes[size].icon} aria-hidden="true" />
      </span>
    )
  },
)

SectorIcon.displayName = 'SectorIcon'
