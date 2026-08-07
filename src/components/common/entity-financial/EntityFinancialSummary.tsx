'use client'

// Next
import Link from 'next/link'

// UI
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Icons
import { IconArrowRight } from '@tabler/icons-react'

// Reúso: dashboards de resumo (relatórios) e lista de movimentações (fluxo)
import { SummaryCards } from '@/app/(app-sidebar)/relatorios/financeiro/components/SummaryCards'
import { FinancialFlowData } from '@/app/(app-sidebar)/financeiro/fluxo-financeiro/components/FinancialFlowTable/FinancialFlowData'
import { EntityBalanceCards } from './EntityBalanceCards'

type EntityType = 'client' | 'supplier'

interface Props {
  entityId: string
  entityType: EntityType
}

// Visão "all-time" (como no legado). O endpoint de summary usa o mês atual
// quando não recebe datas, então passamos um intervalo amplo para consolidar
// todo o histórico da entidade.
const ALL_TIME_START = '2000-01-01'
const ALL_TIME_END = '2100-12-31'

export function EntityFinancialSummary({ entityId, entityType }: Props) {
  // Resumo (relatório): o parâmetro clientId é reinterpretado como supplierId
  // em despesas, então serve cliente e fornecedor com o mesmo id.
  const summaryParams = {
    clientId: entityId,
    startDate: ALL_TIME_START,
    endDate: ALL_TIME_END,
  }

  // Lista (fluxo): filtros clientId e supplierId são separados. As datas são
  // obrigatórias — sem elas o FinancialFlowData renderiza skeleton permanente.
  const listParams: Record<string, string> = {
    startDate: ALL_TIME_START,
    endDate: ALL_TIME_END,
    ...(entityType === 'client'
      ? { clientId: entityId }
      : { supplierId: entityId }),
  }

  const flowHref =
    entityType === 'client'
      ? `/financeiro/fluxo-financeiro?clientId=${entityId}`
      : `/financeiro/fluxo-financeiro?supplierId=${entityId}`

  return (
    <div className="my-6 space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Saldo</h3>
        <EntityBalanceCards
          entityId={entityId}
          startDate={ALL_TIME_START}
          endDate={ALL_TIME_END}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Contas a receber
        </h3>
        <SummaryCards searchParams={summaryParams} tab="receitas" />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Contas a pagar</h3>
        <SummaryCards searchParams={summaryParams} tab="despesas" />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Movimentações</h3>
          <Button
            asChild
            variant="neutralOutline"
            size="sm"
            RightIcon={IconArrowRight}
          >
            <Link href={flowHref}>Ver no fluxo financeiro</Link>
          </Button>
        </div>
        <Card>
          <FinancialFlowData searchParams={listParams} showTotals={false} />
        </Card>
      </section>
    </div>
  )
}
