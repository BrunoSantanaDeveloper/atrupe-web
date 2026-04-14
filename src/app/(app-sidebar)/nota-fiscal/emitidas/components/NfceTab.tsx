'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'

// UI
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import {
  IconReceipt,
  IconCalendar,
  IconCurrencyReal,
  IconPlus,
} from '@tabler/icons-react'

// Components
import { InvoiceTable } from './InvoiceTable'

// Types
import type { Nfce } from '@/types/fiscal/nfe'

interface NfceTabProps {
  items: Nfce[]
  isLoading: boolean
}

function NfceSummaryCards({ items }: { items: Nfce[] }) {
  const summary = useMemo(() => {
    const now = new Date()
    const todayStr = format(now, 'yyyy-MM-dd')
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let countToday = 0
    let totalToday = 0
    let countMonth = 0
    let totalMonth = 0

    items.forEach((item) => {
      if (item.status !== 'AUTHORIZED') return
      const emDate = item.dataEmissao ? new Date(item.dataEmissao) : null
      if (!emDate) return

      const itemDateStr = format(emDate, 'yyyy-MM-dd')
      if (itemDateStr === todayStr) {
        countToday++
        totalToday += item.valorTotal || 0
      }
      if (
        emDate.getMonth() === currentMonth &&
        emDate.getFullYear() === currentYear
      ) {
        countMonth++
        totalMonth += item.valorTotal || 0
      }
    })

    return { countToday, totalToday, countMonth, totalMonth }
  }, [items])

  const formatBRL = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Vendas Hoje
          </CardTitle>
          <IconReceipt className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.countToday}</div>
          <p className="text-xs text-gray-500 mt-1">
            {formatBRL(summary.totalToday)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Vendas no Mês
          </CardTitle>
          <IconCalendar className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.countMonth}</div>
          <p className="text-xs text-gray-500 mt-1">
            {formatBRL(summary.totalMonth)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Ticket Médio (Mês)
          </CardTitle>
          <IconCurrencyReal className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.countMonth > 0
              ? formatBRL(summary.totalMonth / summary.countMonth)
              : 'R$ 0,00'}
          </div>
          <p className="text-xs text-gray-500 mt-1">Valor médio por venda</p>
        </CardContent>
      </Card>
      <Card className="bg-brand-25 border-brand-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-brand-700">
            Nova Venda
          </CardTitle>
          <IconPlus className="h-4 w-4 text-brand-500" />
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full mt-1">
            <Link href="/nota-fiscal/emitir-nfce">
              <IconReceipt className="h-4 w-4 mr-2" />
              Abrir PDV
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function NfceTab({ items, isLoading }: NfceTabProps) {
  return (
    <div className="space-y-4">
      <NfceSummaryCards items={items || []} />

      <Card>
        <CardHeader>
          <CardTitle>NFC-e Emitidas</CardTitle>
          <CardDescription>
            Lista de notas fiscais de consumidor modelo 65.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <InvoiceTable items={items || []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
