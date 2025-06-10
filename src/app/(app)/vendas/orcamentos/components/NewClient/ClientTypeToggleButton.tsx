import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { cn } from '@/lib/utils'
import {
  IconProps,
  IconCircle,
  IconCircleCheckFilled,
} from '@tabler/icons-react'

interface Props {
  title: string
  isActive: boolean
  onClick: () => void
  Icon: React.ComponentType<IconProps>
}
const activeButtonStyle =
  'bg-brand-50 border border-brand-300 hover:bg-brand-100'
const defaultButtonStyle =
  'w-full minW-[316px] h-full text-brand-800 font-semibold flex justify-between items-center'

export function ClientTypeToggleButton({
  title,
  Icon,
  isActive,
  onClick,
}: Props) {
  return (
    <Button
      type="button"
      variant={isActive ? 'default' : 'outline'}
      className={cn(defaultButtonStyle, isActive ? activeButtonStyle : null)}
      onClick={onClick}
    >
      <div className="flex w-full items-center justify-between gap-4">
        <div>
          <FeaturedIcon
            variant="successOutline"
            className="border-[4px] border-brand-50 bg-brand-100 w-9 h-w-9"
            rounded
            Icon={Icon}
          />
          <span className="ml-4">{title}</span>
        </div>
        {isActive ? (
          <IconCircleCheckFilled
            className="color-brand-500"
            size={20}
            color="#099260"
          />
        ) : (
          <IconCircle className="color-gray-300" size={20} color="#D0D5DD" />
        )}
      </div>
    </Button>
  )
}
