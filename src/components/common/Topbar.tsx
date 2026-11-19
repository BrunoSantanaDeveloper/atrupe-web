'use client'

// React
import { useEffect, useState, type ReactNode } from 'react'

// Next
import Link from 'next/link'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Icon
import { IconArrowLeft } from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Type
import { BadgeType } from '@/types/coreTypes'
import { cn } from '@/lib/utils'
import { Skeleton } from '../ui/skeleton'

// Components
import { HelpButton } from './HelpButton'
import { ReleaseNotesBell } from './ReleaseNotes/ReleaseNotesBell'

// Hooks
import { useHelpData } from '@/hooks/queries/useHelpData'

// Revisão (temporário)

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
  // Selos ao lado do status, como o da venda rápida. Diferencia a tela sem
  // mudar a diagramação, que a faixa do `label` muda (11/11/2026)
  tags?: ReactNode
  supportText?: string
  classNames?: { title?: string; label?: string }
  // Marcação temporária da revisão: 'new' pinta o título de azul,
  // 'todo' de vermelho. Sai junto com src/consts/revisao.ts
  // Contadores das abas ainda carregando: reserva o lugar do número
  countsLoading?: boolean
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
  tags,
  supportText,
  classNames,
  countsLoading,
}: Props) {
  const { helpData } = useHelpData()
  const hasHelpContent =
    helpData && (helpData.video || (helpData.files?.length ?? 0) > 0)

  // Aba marcada no clique, antes de a página nova chegar
  // (design/openspec/changes/archive/2026-10-07-microinteracoes, Decisão 5)
  const [selectedTab, setSelectedTab] = useState(activeTab)
  useEffect(() => {
    setSelectedTab(activeTab)
  }, [activeTab])

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
                <IconArrowLeft aria-hidden size={ICON_SIZE.md} />
              </Link>
            </Button>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {title ? (
                <h1 className={cn('type-page-title', classNames?.title)}>
                  {title}
                </h1>
              ) : (
                <Skeleton className="h-8 w-56" />
              )}
              {badge ? (
                <Badge status variant={badge.variant || 'default'}>
                  {badge.text || '-'}
                </Badge>
              ) : null}
              {tags || null}
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
          {/* As novidades do sistema (19/11/2026), no topo de toda tela */}
          {!label ? <ReleaseNotesBell /> : null}
        </div>
      </div>
      {tabs?.length ? (
        <Tabs value={selectedTab} variant="pill" className="overflow-x-auto">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.tab} asChild>
                <Link
                  href={`?${paramName}=${tab.tab}`}
                  onClick={(event) => {
                    if (
                      !event.metaKey &&
                      !event.ctrlKey &&
                      !event.shiftKey &&
                      !event.altKey
                    ) {
                      setSelectedTab(tab.tab)
                    }
                  }}
                >
                  <span>{tab.label}</span>
                  {countsLoading ? (
                    <Skeleton className="ml-2 h-5 w-6 rounded-full" />
                  ) : tab?.count && tab?.count > 0 ? (
                    <Badge
                      variant={
                        selectedTab === tab.tab ? 'light' : 'neutralLight'
                      }
                      className="ml-2 font-semibold animate-in fade-in-0 duration-base"
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
