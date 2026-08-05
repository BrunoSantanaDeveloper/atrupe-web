'use client'

// Next
import Link from 'next/link'

// UI
import { Button } from '@/components/ui/button'

// Icons
import { IconArrowRight } from '@tabler/icons-react'

// Reúso do resumo financeiro dos relatórios (agrega por clientId)
import { SummaryCards } from '@/app/(app-sidebar)/relatorios/financeiro/components/SummaryCards'
import { ClientBalanceCards } from './ClientBalanceCards'

interface Props {
  clientId: string
}

// Resumo do cliente é uma visão "all-time" (como no legado). O endpoint de
// summary usa o mês atual quando não recebe datas, então passamos um intervalo
// amplo para consolidar todo o histórico do cliente.
const ALL_TIME_START = '2000-01-01'
const ALL_TIME_END = '2100-12-31'

export function ClientFinancialSummary({ clientId }: Props) {
  const searchParams = {
    clientId,
    startDate: ALL_TIME_START,
    endDate: ALL_TIME_END,
  }

  return (
    <div className="my-6 space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Saldo</h3>
        <ClientBalanceCards
          clientId={clientId}
          startDate={ALL_TIME_START}
          endDate={ALL_TIME_END}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Contas a receber
        </h3>
        <SummaryCards searchParams={searchParams} tab="receitas" />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Contas a pagar</h3>
        <SummaryCards searchParams={searchParams} tab="despesas" />
      </section>

      <div>
        <Button asChild variant="neutralOutline" RightIcon={IconArrowRight}>
          <Link href={`/financeiro/fluxo-financeiro?clientId=${clientId}`}>
            Ver movimentações no fluxo financeiro
          </Link>
        </Button>
      </div>
    </div>
  )
}
