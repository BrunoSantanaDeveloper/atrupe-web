// Next Imports
import Link from 'next/link'

// UI component Imports
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Icon Imports
import { IconArrowRight } from '@tabler/icons-react'

// Type Imports
import type { IconProps } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export type CompanySettingsType = {
  category?: string
  items: {
    title: string
    icon?: React.ElementType<IconProps>
    iconImage?: JSX.Element
    description: string
    link?: string
    cta?: JSX.Element
    showPrimaryElement?: boolean
    isInactive?: boolean
  }[]
}

export function CompanySettingsList({
  settings,
}: {
  settings: CompanySettingsType[]
}) {
  return (
    <div className="space-y-8">
      {settings.map((setting, index) => (
        <div key={index} className="space-y-4">
          {setting.category ? (
            <h1 className="text-gray-800 font-semibold text-lg">
              {setting.category}
            </h1>
          ) : null}
          {setting.items.map((item, index) => (
            <div
              key={index}
              className={cn(
                'flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-lg bg-white py-4 px-4 sm:px-6 gap-4',
                item.isInactive && '!bg-gray-200',
              )}
            >
              <div
                className={cn(
                  'flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto',
                  item?.isInactive && 'opacity-50',
                )}
              >
                {item?.iconImage || null}
                {item?.icon && (
                  <FeaturedIcon variant="neutralOutline" Icon={item.icon} />
                )}
                <div className="w-full sm:w-auto">
                  <p className="font-semibold mb-2 relative pr-20 sm:pr-0">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray">{item.description}</p>
                </div>
                {item.showPrimaryElement && (
                  <Badge variant="light">Principal</Badge>
                )}
                {item.isInactive && <Badge variant="neutral">Inativo</Badge>}
              </div>
              <div className="self-end sm:self-center w-full sm:w-auto">
                {item.link ? (
                  <Button
                    asChild
                    type="button"
                    RightIcon={IconArrowRight}
                    className="w-full sm:w-auto"
                  >
                    <Link href={`/configuracoes/${item.link}`}>Configurar</Link>
                  </Button>
                ) : null}
                {item.cta || null}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
