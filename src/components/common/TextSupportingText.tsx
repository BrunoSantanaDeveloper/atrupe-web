// UI
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

// Type
import { BadgeType } from '@/types/coreTypes'
import { cn } from '@/lib/utils'

interface Props {
  supporting: string
  text?: string
  badge?: BadgeType
  containerClassName?: string
}

export function TextSupportingText({
  text,
  supporting,
  badge,
  containerClassName,
}: Props) {
  return (
    <div className={cn('flex flex-col', containerClassName)}>
      <div className="flex items-center gap-1">
        <p className="text-xs text-gray">{supporting}</p>
        {badge ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-default">
                <Badge
                  status
                  size="roundXs"
                  variant={badge?.variant || 'default'}
                  className="mb-1"
                />
              </TooltipTrigger>
              <TooltipContent>{badge?.text || '-'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
      <p className="text-sm font-medium break-all max-w-full overflow-hidden">
        {text || '-'}
      </p>
    </div>
  )
}
