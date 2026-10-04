// Icon Imports

// Type Imports
import type { PropsWithChildren } from 'react'
import { IconCircleCheck } from '@tabler/icons-react'

export function SuccessToast({ children }: PropsWithChildren) {
  return (
    <div className="flex items-center gap-2">
      <IconCircleCheck size={18} className="text-success" />
      <span className="font-medium">{children}</span>
    </div>
  )
}
