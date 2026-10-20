// UI
import { Separator } from '@/components/ui/separator'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'

// Components
import { FeaturedIcon } from '@/components/ui/featured-icon'
import type { IconComponentType } from '@/components/ui/icon'

// types

export function DetailCard({
  title,
  children,
  icon,
}: {
  title: string
  children: React.ReactNode
  icon: IconComponentType
}) {
  return (
    <Card className="w-full pb-4">
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex gap-3 items-center">
            <FeaturedIcon tone="neutral" Icon={icon} />
            <CardTitle>{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <Separator className="my-4" />
      <CardContent>{children}</CardContent>
    </Card>
  )
}
