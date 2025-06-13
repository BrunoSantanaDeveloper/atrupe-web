// UI
import { Separator } from '@/components/ui/separator'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'

// Components
import { FeaturedIcon } from '@/components/ui/featured-icon'

// types
import { IconProps } from '@tabler/icons-react'
import { SVGProps } from 'react'

export function DetailCard({
  title,
  children,
  icon,
}: {
  title: string
  children: React.ReactNode
  icon:
    | React.ComponentType<IconProps>
    | React.ComponentType<SVGProps<SVGSVGElement>>
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex gap-3 items-center">
            <FeaturedIcon variant="neutralOutline" Icon={icon} />
            <CardTitle className="text-gray-700 font-semibold text-base">
              {title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <Separator className="my-4" />
      <CardContent>{children}</CardContent>
    </Card>
  )
}
