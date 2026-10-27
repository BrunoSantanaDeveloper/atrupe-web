'use client'

// O acompanhamento de hoje no início (CRM-3, 27/10/2026): quantos
// orçamentos pedem contato, quantos estão atrasados, quantas propostas
// vencem e quantas negociações estão sem próximo contato. Cada número leva
// ao foco certo da aba Aguardando. Mostra; quem age é a lista.

import Link from 'next/link'
import {
  IconCalendarEvent,
  IconAlarm,
  IconHourglassLow,
  IconMessageOff,
} from '@tabler/icons-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { useFollowUpSummary } from '@/hooks/queries/useFollowUp'
import { cn } from '@/lib/utils'

const base = '/vendas/orcamentos?status=concluido'

export function FollowUpToday() {
  const { data, isLoading } = useFollowUpSummary()

  const items = [
    {
      label: 'Para retomar hoje',
      value: data?.due ?? 0,
      icon: IconCalendarEvent,
      href: `${base}&foco=retomar`,
      tone: 'brand',
    },
    {
      label: 'Atrasados',
      value: data?.overdue ?? 0,
      icon: IconAlarm,
      href: `${base}&foco=retomar`,
      tone: 'error',
    },
    {
      label: 'Propostas vencendo',
      value: data?.expiring ?? 0,
      icon: IconHourglassLow,
      href: `${base}&foco=vencendo`,
      tone: 'warning',
    },
    {
      label: 'Sem próximo contato',
      value: data?.noContact ?? 0,
      icon: IconMessageOff,
      href: `${base}&foco=sem-contato`,
      tone: 'warning',
    },
  ] as const

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3 items-center">
          <Icon icon={IconCalendarEvent} size="md" className="text-gray-600" />
          <CardTitle>Acompanhamento de hoje</CardTitle>
        </div>
        <Button asChild type="button" size="sm" variant="neutralOutline">
          <Link href={`${base}&foco=retomar`}>Ver a lista do dia</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-8">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))
            : items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 hover:opacity-80"
                >
                  <Icon
                    icon={item.icon}
                    size="md"
                    className={cn(
                      item.value > 0 &&
                        item.tone === 'error' &&
                        'text-error-600',
                      item.value > 0 &&
                        item.tone === 'warning' &&
                        'text-warning-600',
                      (item.value === 0 || item.tone === 'brand') &&
                        'text-gray-600',
                    )}
                  />
                  <span className="text-2xl font-semibold text-gray-900">
                    {item.value}
                  </span>
                  <span className="text-sm text-gray">{item.label}</span>
                </Link>
              ))}
        </div>
      </CardContent>
    </Card>
  )
}
