// Icon Imports
import { IconLoader2 as LoaderCircle } from '@tabler/icons-react'

// Lib Imports
import { cn } from '@/lib/utils'

export function Spinner({ classname }: { classname?: string }) {
  return (
    <LoaderCircle aria-hidden className={cn('mr-2 animate-spin', classname)} />
  )
}
