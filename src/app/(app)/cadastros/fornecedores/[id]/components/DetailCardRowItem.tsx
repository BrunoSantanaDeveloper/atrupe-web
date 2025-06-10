import { Separator } from '@/components/ui/separator'

export function DetailCardRowItem({
  children,
  showSeparator = true,
}: {
  children: React.ReactNode
  showSeparator?: boolean
}) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-11 px-6">
        {children}
      </div>
      {showSeparator && <Separator className="my-4" />}
    </>
  )
}
