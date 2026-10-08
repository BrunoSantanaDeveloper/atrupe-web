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
import { reviewTextClass } from '@/consts/revisao'
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
          'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg min-h-12',
          label && 'bg-brand-200 px-6',
          classNames?.label,
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {previousPage ? (
            <Button
              asChild
              type="button"
              size="icon"
              variant="neutralLight"
              className="bg-transparent"
            >
              <Link href={previousPage} aria-label="Voltar">
                <IconArrowLeft />
              </Link>
            </Button>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {title ? (
                <h1
                  className={cn(
                    'type-page-title',
                    classNames?.title,
                    reviewTextClass(review),
                  )}
                >
                  {title}
                </h1>
              ) : (
                <Skeleton className="h-8 w-56 bg-gray-300" />
              )}
              {badge ? (
                <Badge status variant={badge.variant || 'default'}>
                  {badge.text || '-'}
                </Badge>
              ) : null}
            </div>
            {supportText ? (
              <p className="type-page-subtitle truncate">{supportText}</p>
            ) : null}
          </div>
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
