// Icon Imports

// Type Imports
import type { PropsWithChildren } from 'react'
import { IconCircleCheck } from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

export function SuccessToast({ children }: PropsWithChildren) {
  return (
    <div className="flex items-center gap-2">
      <IconCircleCheck size={ICON_SIZE.md} className="text-success" />
      <span className="font-medium">{children}</span>
    </div>
  )
}
