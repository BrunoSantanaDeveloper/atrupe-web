import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md mix-blend-multiply dark:mix-blend-normal bg-gray-100',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
