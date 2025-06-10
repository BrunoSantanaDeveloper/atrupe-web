// Icon Imports
import { LoaderCircle } from 'lucide-react'

// Lib Imports
import { cn } from '@/lib/utils'

export function Spinner({ classname }: { classname?: string }) {
  return <LoaderCircle className={cn('mr-2 animate-spin', classname)} />
}
