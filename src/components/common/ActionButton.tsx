// Next Imports
import Link from 'next/link'
import { forwardRef } from 'react'

// UI component Imports
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge, BadgeProps } from '@/components/ui/badge'
import { Button, ButtonProps } from '@/components/ui/button'

// Consts
import { ICONE, type Gesto } from '@/consts/icones'

// O ícone vem do dicionário de glifos (`gesto`) ou, para ícones ilustrativos
// fora do dicionário, de `Icon`
type Glyph =
  | { gesto: Gesto; Icon?: never }
  | { Icon: React.ElementType; gesto?: never }

type Props = Glyph & {
  link?: string
  tooltip: string
  badge?: BadgeProps['variant']
  newTab?: boolean
}

export const ActionButton = forwardRef<HTMLButtonElement, ButtonProps & Props>(
  (props, ref) => {
    const {
      link,
      newTab,
      Icon: iconProp,
      gesto,
      tooltip,
      badge,
      variant = 'neutralGhost',
      ...rest
    } = props
    const Icon = iconProp ?? ICONE[gesto as Gesto]

    return (
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={ref}
              type="button"
              asChild={!!link}
              size="icon"
              variant={variant}
              aria-label={tooltip}
              RightIcon={!link ? Icon : undefined}
              {...rest}
            >
              {link ? (
                <Link
                  href={link}
                  target={newTab ? '_blank' : undefined}
                  rel={newTab ? 'noopener noreferrer' : undefined}
                >
                  <Icon aria-hidden="true" className="size-5" />
                </Link>
              ) : undefined}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
        {badge ? (
          <Badge
            status
            size="roundXs"
            variant={badge}
            className="absolute -top-px -right-px"
          />
        ) : null}
      </div>
    )
  },
)

ActionButton.displayName = 'ActionButton'
