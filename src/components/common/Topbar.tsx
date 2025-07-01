// Next
import Link from 'next/link'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Icon
import { IconArrowLeft } from '@tabler/icons-react'

// Type
import { BadgeType } from '@/types/coreTypes'
import { cn } from '@/lib/utils'
import { Skeleton } from '../ui/skeleton'

// Components
import { HelpButton } from './HelpButton'

export type TabNavType = {
  value: string
  tab: string
  label: string
  count?: number
}

interface Props {
  title: string
  tabs?: TabNavType[]
  activeTab?: string
  paramName?: string
  primaryCta?: JSX.Element
  secondaryCta?: JSX.Element
  label?: string
  previousPage?: string
  badge?: BadgeType
  supportText?: string
}

const exampleHelpData = {
  files: [
    '/docs/atrupe-manual-completo-start.pdf',
    '/docs/atrupe-manual-completo-start.xlsx',
  ],
  video: 'https://vimeo.com/495579294',
}

export function Topbar({
  tabs,
  title,
  primaryCta,
  secondaryCta,
  label,
  activeTab = 'todos',
  paramName = 'status',
  previousPage,
  badge,
  supportText,
}: Props) {
  const helpData = exampleHelpData

  return (
    <div className="space-y-3">
      <div
        className={cn(
          label && 'bg-brand-200',
          'flex flex-wrap justify-between gap-2 rounded-lg min-h-11',
        )}
      >
        <div className="flex justify-center items-center gap-2">
          <div className="flex justify-center items-center gap-1">
            {previousPage ? (
              <Button
                asChild
                type="button"
                size="icon"
                variant="neutralLight"
                className="bg-transparent"
              >
                <Link href={previousPage}>
                  <IconArrowLeft />
                </Link>
              </Button>
            ) : null}
            {title ? (
              <h1 className="text-gray-800 font-semibold text-lg">{title}</h1>
            ) : (
              <Skeleton className="h-5 w-48 bg-gray-300" />
            )}
          </div>
          <h3 className="text-gray font-medium text-lg">{supportText}</h3>
          {badge ? (
            <Badge status variant={badge.variant || 'default'}>
              {badge.text || '-'}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {label ? <p className="font-semibold pr-4">{label}</p> : null}
          {helpData ? <HelpButton data={helpData} /> : null}
          {secondaryCta || null}
          {primaryCta || null}
        </div>
      </div>
      {tabs?.length ? (
        <Tabs value={activeTab}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.tab} asChild>
                <Link href={`?${paramName}=${tab.tab}`}>
                  <span>{tab.label}</span>
                  {tab?.count && tab?.count > 0 ? (
                    <Badge
                      variant={activeTab === tab.tab ? 'light' : 'neutralLight'}
                      className="ml-2"
                    >
                      {tab.count}
                    </Badge>
                  ) : null}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : null}
    </div>
  )
}
