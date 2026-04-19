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

interface Props {
  link?: string
  Icon: React.ElementType
  tooltip: string
  badge?: BadgeProps['variant']
  newTab?: boolean
}

export const ActionButton = forwardRef<HTMLButtonElement, ButtonProps & Props>(
  (props, ref) => {
    const {
      link,
      newTab,
      Icon,
      tooltip,
      badge,
      variant = 'neutralGhost',
      ...rest
    } = props

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
                <Link href={link} target={newTab ? '_blank' : ''}>
                  <Icon className="size-5" />
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
