// Icon Imports
import { CheckCircle } from 'lucide-react'

// Type Imports
import type { PropsWithChildren } from 'react'

export function SuccessToast({ children }: PropsWithChildren) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle size={18} className="text-success" />
      <span className="font-medium">{children}</span>
    </div>
  )
}
