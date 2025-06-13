import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function DetailCardRowItem({
  children,
  showSeparator = true,
  className,
}: {
  children: React.ReactNode
  showSeparator?: boolean
  className?: string
}) {
  return (
    <>
      <div
        className={cn(
          'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-6',
          className,
        )}
      >
        {children}
      </div>
      {showSeparator && <Separator className="my-4" />}
    </>
  )
}
