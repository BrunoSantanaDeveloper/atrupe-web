'use client'

// React
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

// UI
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'

// Components
import { TopActions } from './TopActions'
import { Topbar } from '@/components/common/Topbar'
import { TransactionsTotalsCard } from './TransactionsTotals'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { FinancialFlowData } from './FinancialFlowTable/FinancialFlowData'
import { NewTransaction } from '../../_components/transactions/NewTransaction'
import { FinancialFlowFilter } from './FinancialFlowTable/FinancialFlowFilter'
import { ExportDataButton } from '@/components/common/ExportDataButton'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { ExportColumn } from '@/lib/export-excel'
import type { TransactionListType } from '@/types/financial/financialFlow'

// Actions
import { getData } from '@/actions/_cruds'

// Utils
import { cn } from '@/lib/utils'

interface Props extends SearchParamsType {}

type FinancialFlowExportType = TransactionListType & {
  groupDate?: string
  nature?: {
    id: string
    name: string
  } | null
  subCategory?: {
    id: string
    name: string
  } | null
  period?: string | null
}

const FINANCIAL_FLOW_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Em aberto',
  PROVISIONED: 'Provisionado',
  PAID: 'Pago',
  OVERDUE: 'Atrasado',
  CANCELED: 'Cancelado',
}

function getTransactionPerson(transaction: FinancialFlowExportType) {
  return (
    transaction.client?.name ||
    transaction.supplier?.name ||
    transaction.employee?.name ||
    ''
  )
}

function getInstallmentExpectedValue(transaction: FinancialFlowExportType) {
  const installment = transaction.currentInstallment

  return ((installment?.value || 0) + (installment?.additionalFee || 0)) / 100
}

const FINANCIAL_FLOW_EXPORT_COLUMNS: ExportColumn<FinancialFlowExportType>[] = [
  {
    header: 'Tipo',
    getValue: (transaction) =>
      transaction.type === 'receivable' ? 'Receita' : 'Despesa',
  },
  {
    header: 'Pessoa',
    getValue: getTransactionPerson,
  },
  {
    header: 'Descricao',
    key: 'description',
  },
  {
    header: 'Natureza',
    getValue: (transaction) => transaction.nature?.name,
  },
  {
    header: 'Subcategoria',
    getValue: (transaction) => transaction.subCategory?.name,
  },
  {
    header: 'Status da movimentacao',
    getValue: (transaction) =>
      FINANCIAL_FLOW_STATUS_LABELS[transaction.status] || transaction.status,
  },
  {
    header: 'Status da parcela',
    getValue: (transaction) =>
      FINANCIAL_FLOW_STATUS_LABELS[
        transaction.currentInstallment?.status || ''
      ] ||
      transaction.currentInstallment?.status ||
      '',
  },
  {
    header: 'Parcela',
    getValue: (transaction) =>
      `${transaction.currentInstallment?.installmentNumber || 1} / ${
        transaction.installmentsQuantity || 1
      }`,
  },
  {
    header: 'Data agrupada',
    key: 'groupDate',
    type: 'date',
  },
  {
    header: 'Vencimento',
    getValue: (transaction) => transaction.currentInstallment?.dueDate,
    type: 'date',
  },
  {
    header: 'Data de pagamento',
    getValue: (transaction) => transaction.currentInstallment?.paymentDate,
    type: 'date',
  },
  {
    header: 'Data de compensacao',
    getValue: (transaction) => transaction.currentInstallment?.compensateDate,
    type: 'date',
  },
  {
    header: 'Forma de pagamento',
    getValue: (transaction) =>
      transaction.currentInstallment?.paymentCondition?.name,
  },
  {
    header: 'Conta bancaria',
    getValue: (transaction) =>
      transaction.currentInstallment?.bankAccount?.name,
  },
  {
    header: 'Banco',
    getValue: (transaction) => transaction.currentInstallment?.bank?.name,
  },
  {
    header: 'Valor parcela',
    type: 'currency',
    getValue: (transaction) =>
      (transaction.currentInstallment?.value || 0) / 100,
  },
  {
    header: 'Acrescimo',
    type: 'currency',
    getValue: (transaction) =>
      (transaction.currentInstallment?.additionalFee || 0) / 100,
  },
  {
    header: 'Valor previsto',
    type: 'currency',
    getValue: getInstallmentExpectedValue,
  },
  {
    header: 'Valor realizado',
    type: 'currency',
    getValue: (transaction) =>
      (transaction.currentInstallment?.paidValue || 0) / 100,
  },
  {
    header: 'Valor total',
    type: 'currency',
    getValue: (transaction) => (transaction.totalValue || 0) / 100,
  },
  {
    header: 'Total realizado',
    type: 'currency',
    getValue: (transaction) => (transaction.totalPaid || 0) / 100,
  },
  {
    header: 'Periodo de referencia',
    key: 'period',
    type: 'date',
  },
  {
    header: 'Observacoes',
    key: 'notes',
  },
]

export function FinancialFlow({ searchParams }: Props) {
  const [showTotals, setShowTotals] = useState(false)
  const router = useRouter()

  const hasUrlParams = searchParams?.startDate && searchParams?.endDate

  const getExportFinancialFlow = async () => {
    const result = await getData({
      route: '/financial/flow/export',
      filters: {
        ...searchParams,
        showValues: 'on',
      },
    })

    if (!result.success) {
      throw new Error(result.message)
    }

    return (result.data || []) as FinancialFlowExportType[]
  }

  const { data: overdueData } = useQuery({
    queryKey: ['financial-flow-overdue-last-7-days'],
    queryFn: () => getData({ route: '/financial/flow/overdue/last-7-days' }),
  })

  const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Define o período padrão na URL se não houver parâmetros
  useEffect(() => {
    if (!hasUrlParams && overdueData?.data) {
      const params = new URLSearchParams(searchParams as Record<string, string>)

      const today = new Date()
      today.setHours(12, 0, 0, 0)
      const sevenDaysFromNow = new Date(
        today.getTime() + 7 * 24 * 60 * 60 * 1000,
      )

      let startDate = today

      if (overdueData.data.hasOverdue) {
        const oldestOverdueDate = new Date(overdueData.data.oldestOverdueDate)
        oldestOverdueDate.setHours(12, 0, 0, 0)
        startDate = oldestOverdueDate
      }

      params.set('startDate', formatDateToISO(startDate))
      params.set('endDate', formatDateToISO(sevenDaysFromNow))
      router.replace(`?${params.toString()}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overdueData, hasUrlParams])

  return (
    <div className="space-y-5">
      <Topbar
        title="Fluxo financeiro"
        badge={{
          text:
            searchParams.dateType === 'paidDate'
              ? 'Data de pagamento'
              : 'Data de vencimento',
          variant:
            searchParams.dateType === 'paidDate'
              ? 'successLight'
              : 'warningLight',
        }}
        primaryCta={
          <>
            <PermissionGate
              permissions={[
                'financial:payable:create',
                'financial:flow:create',
              ]}
            >
              <NewTransaction type="payable" searchParams={searchParams} />
            </PermissionGate>
            <PermissionGate
              permissions={[
                'financial:receivable:create',
                'financial:flow:create',
              ]}
            >
              <NewTransaction type="receivable" searchParams={searchParams} />
            </PermissionGate>
          </>
        }
        secondaryCta={
          <div className="flex flex-wrap items-center gap-3">
            <PermissionGate permissions={['financial:flow:export']}>
              <ExportDataButton
                columns={FINANCIAL_FLOW_EXPORT_COLUMNS}
                fileName="fluxo-financeiro"
                getData={getExportFinancialFlow}
                sheetName="Fluxo financeiro"
                disabled={!hasUrlParams}
                emptyMessage="Nenhuma movimentacao financeira disponivel para exportacao"
              />
            </PermissionGate>
            <TopActions
              showTotals={showTotals}
              setShowTotals={setShowTotals}
              searchParams={searchParams}
            />
          </div>
        }
      />
      <div className="space-y-2.5">
        <Card>
          {/* FIlter */}
          <TableFiltersHeader searchParams={searchParams}>
            <FinancialFlowFilter searchParams={searchParams} />
          </TableFiltersHeader>

          {/* Totals */}
          <CardContent
            className={cn(
              'transition-all duration-300 pb-0',
              showTotals
                ? 'opacity-100 max-h-[300px] mb-4'
                : 'opacity-0 max-h-0 overflow-hidden',
            )}
          >
            <Separator />
            <TransactionsTotalsCard searchParams={searchParams} />
          </CardContent>
        </Card>
        {/* Table */}
        <Card>
          <FinancialFlowData
            searchParams={searchParams}
            showTotals={showTotals}
          />
        </Card>
      </div>
    </div>
  )
}
