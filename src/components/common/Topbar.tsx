'use client'

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

// Hooks
import { useHelpData } from '@/hooks/queries/useHelpData'

// Revisão (temporário)
import { reviewTextClass, REVIEW_LEGEND } from '@/consts/revisao'
import type { ReviewMarkKind } from '@/consts/revisao'

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
  classNames?: { title?: string; label?: string }
  // Marcação temporária da revisão: 'new' pinta o título de azul,
  // 'todo' de vermelho. Sai junto com src/consts/revisao.ts
  review?: ReviewMarkKind
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
  classNames,
  review,
}: Props) {
  const { helpData } = useHelpData()
  const hasHelpContent =
    helpData && (helpData.video || (helpData.files?.length ?? 0) > 0)

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'flex flex-wrap justify-between gap-2 rounded-lg min-h-10',
          label && 'bg-brand-200 px-6',
          classNames?.label,
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
              <h1
                title={review ? REVIEW_LEGEND[review] : undefined}
                className={cn(
                  'text-gray-900 font-semibold text-lg',
                  classNames?.title,
                  reviewTextClass(review),
                )}
              >
                {title}
              </h1>
            ) : (
              <Skeleton className="h-5 w-48" />
            )}
          </div>
          <h3 className="text-gray font-medium text-lg">{supportText}</h3>
          {badge ? (
            <Badge status variant={badge.variant || 'default'}>
              {badge.text || '-'}
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {label ? (
            <p className="font-semibold text-white opacity-60">{label}</p>
          ) : null}
          {hasHelpContent && !label ? <HelpButton data={helpData} /> : null}
          {secondaryCta || null}
          {primaryCta || null}
        </div>
      </div>
      {tabs?.length ? (
        <Tabs value={activeTab} variant="pill" className="overflow-x-auto">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.tab} asChild>
                <Link href={`?${paramName}=${tab.tab}`}>
                  <span>{tab.label}</span>
                  {tab?.count && tab?.count > 0 ? (
                    <Badge
                      variant={activeTab === tab.tab ? 'light' : 'neutralLight'}
                      className="ml-2 font-semibold"
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
