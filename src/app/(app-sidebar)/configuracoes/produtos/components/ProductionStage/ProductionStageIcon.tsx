import { cn } from '@/lib/utils'
import { sectorIcons } from '@/consts/sectors'
import { IconQuestionMark } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

export function ProductionStageIcon({
  icon,
  isActive = false,
}: {
  icon?: string

  isActive?: boolean
}) {
  return (
    <div
      className={cn(
        'w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center',
        isActive === true && 'bg-green-200',
      )}
    >
      <div className="w-6 h-6 p-1 gap-1 flex items-center justify-center relative">
        <Button
          type="button"
          size="icon"
          variant={isActive ? 'successLight' : 'neutralLight'}
          RightIcon={sectorIcons[icon ?? '']?.icon || IconQuestionMark}
          className="p-2 [&>svg]:stroke-2 pointer-events-none"
        />
      </div>
    </div>
  )
}
