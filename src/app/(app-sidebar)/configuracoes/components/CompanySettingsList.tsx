'use client'

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
import { PermissionGate } from '@/components/common/PermissionGate'
import { reviewTextClass } from '@/consts/revisao'
import type { ReviewMarkKind } from '@/consts/revisao'

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
    permission?: string | string[]
    // Marcação temporária da revisão (src/consts/revisao.ts)
    review?: ReviewMarkKind
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
            <h1 className="type-page-title">{setting.category}</h1>
          ) : null}
          {setting.items.map((item, itemIndex) => (
            <PermissionGate
              key={itemIndex}
              requireAll
              permissions={
                item.permission
                  ? Array.isArray(item.permission)
                    ? item.permission
                    : [item.permission]
                  : []
              }
            >
              <div
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
                    <FeaturedIcon tone="neutral" Icon={item.icon} />
                  )}
                  <div className="w-full sm:w-auto">
                    <p
                      className={cn(
                        'font-semibold mb-2 relative pr-20 sm:pr-0',
                        reviewTextClass(item.review),
                      )}
                    >
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
                      {/* O link costuma ser relativo a /configuracoes, mas
                          alguns itens apontam para telas fora dela (Base de
                          custos, Precificação): aí vem com a barra na frente */}
                      <Link
                        href={
                          item.link.startsWith('/')
                            ? item.link
                            : `/configuracoes/${item.link}`
                        }
                      >
                        Configurar
                      </Link>
                    </Button>
                  ) : null}
                  {item.cta || null}
                </div>
              </div>
            </PermissionGate>
          ))}
        </div>
      ))}
    </div>
  )
}
