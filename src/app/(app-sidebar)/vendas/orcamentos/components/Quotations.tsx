'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { NewClientModal } from './NewClient'
import {
  NewQuickSaleTriggerButton,
  NewQuotationModal,
  NewQuotationTriggerButton,
} from './NewQuotation'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { QuotationsData } from './QuotationsTable/QuotationsData'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { QuotationsFilter } from './QuotationsTable/QuotationsFilter'
import { ExportDataButton } from '@/components/common/ExportDataButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { ExportColumn } from '@/lib/export-excel'
import type { QuotationType } from '@/types/sales/quotation'

// Actions
import { getData, getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconReportOff } from '@tabler/icons-react'
import { quotationsStatusObj } from '@/consts/quotations'
import { usePermissions } from '@/hooks/usePermissions'

type QuotationExportType = QuotationType & {
  groupDate?: string
}

function getQuotationReference(quotation: QuotationExportType) {
  const serie = quotation.serie?.quotation || ''
  const code = quotation.serie?.code || ''
  const reference = [serie, code].filter(Boolean).join('-')

  return [reference, quotation.description].filter(Boolean).join(' - ')
}

function getQuotationFinalValue(quotation: QuotationExportType) {
  const itemsValue = quotation.totalValue || 0
  const deliveryValue = quotation.deliveryInfo?.value ?? 0
  const payment = quotation.quotationPayment
  const commissionValue =
    payment?.commission?.type === 'ADD'
      ? (payment?.commission?.totalCommission ?? 0)
      : 0
  const installmentsAdditionalFee =
    payment?.quotationInstallment?.reduce(
      (acc, installment) => acc + (installment?.additionalFee ?? 0),
      0,
    ) ?? 0
  const downPaymentAdditionalFee = payment?.downPaymentAdditionalFee ?? 0
  const discountTotal = payment?.discountTotal ?? 0

  return (
    itemsValue +
    deliveryValue +
    commissionValue +
    installmentsAdditionalFee +
    downPaymentAdditionalFee -
    discountTotal
  )
}

const QUOTATION_BASE_EXPORT_COLUMNS: ExportColumn<QuotationExportType>[] = [
  {
    header: 'Referencia',
    getValue: getQuotationReference,
  },
  {
    header: 'Cliente',
    getValue: (quotation) => quotation.client?.name,
  },
  {
    header: 'Email do cliente',
    getValue: (quotation) => quotation.client?.email,
  },
  {
    header: 'Status',
    getValue: (quotation) =>
      quotationsStatusObj[quotation.status]?.text || quotation.status,
  },
  {
    header: 'Fase atual',
    getValue: (quotation) => quotation.tag?.text,
  },
  {
    header: 'Venda rapida',
    type: 'boolean',
    key: 'quickSale',
  },
  {
    header: 'Criado em',
    key: 'groupDate',
    type: 'date',
  },
  {
    header: 'Concluido em',
    key: 'finishedAt',
    type: 'date',
  },
  {
    header: 'Valido ate',
    key: 'dueDate',
    type: 'date',
  },
]

const QUOTATION_VALUE_EXPORT_COLUMNS: ExportColumn<QuotationExportType>[] = [
  {
    header: 'Valor itens',
    type: 'currency',
    getValue: (quotation) => (quotation.totalValue || 0) / 100,
  },
  {
    header: 'Valor entrega',
    type: 'currency',
    getValue: (quotation) => (quotation.deliveryInfo?.value ?? 0) / 100,
  },
  {
    header: 'Desconto',
    type: 'currency',
    getValue: (quotation) =>
      (quotation.quotationPayment?.discountTotal ?? 0) / 100,
  },
  {
    header: 'Comissao adicionada',
    type: 'currency',
    getValue: (quotation) =>
      quotation.quotationPayment?.commission?.type === 'ADD'
        ? (quotation.quotationPayment?.commission?.totalCommission ?? 0) / 100
        : 0,
  },
  {
    header: 'Valor final',
    type: 'currency',
    getValue: (quotation) => getQuotationFinalValue(quotation) / 100,
  },
]

export function Quotations({ searchParams }: SearchParamsType) {
  const [openDialog, setOpenDialog] = useState('')

  // "Nova venda rápida" no menu abre o formulário aqui.
  const router = useRouter()
  const pathname = usePathname()
  const quickSaleFromMenu = searchParams?.['venda-rapida'] === '1'
  useEffect(() => {
    if (!quickSaleFromMenu) return
    setOpenDialog('quick-sale')
    router.replace(pathname)
  }, [quickSaleFromMenu, router, pathname])
  const { hasAllPermissions } = usePermissions()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['quotation-totals'],
    queryFn: () => getDataOld({ route: 'quotationTotalsRoute' }),
  })

  const totals: { [key: string]: number } = {
    digitacao: data?.OPEN,
    concluido: data?.DONE,
    vencidos: data?.OVERDUE,
    rejeitados: data?.REJECTED,
    todos: data?.TOTAL,
  }

  const status = searchParams.status
  const statusEmpty = totals?.[status] === 0

  const tabs: TabNavType[] = [
    {
      value: 'OPEN',
      tab: 'digitacao',
      label: 'Digitação',
      count: totals?.digitacao,
    },
    {
      value: 'DONE',
      tab: 'concluido',
      label: 'Aguardando',
      count: totals?.concluido,
    },
    {
      value: 'OVERDUE',
      tab: 'vencidos',
      label: 'Vencidos',
      count: totals?.vencidos,
    },
    {
      value: 'REJECTED',
      tab: 'rejeitados',
      label: 'Rejeitados',
      count: totals?.rejeitados,
    },
    {
      value: '',
      tab: 'todos',
      label: 'Todos',
      count: totals?.todos,
    },
  ]

  const statusLabel = tabs?.find((tab) => tab.tab === status)?.label
  const canViewValues = hasAllPermissions(['values:values:view'])
  const exportColumns = canViewValues
    ? [...QUOTATION_BASE_EXPORT_COLUMNS, ...QUOTATION_VALUE_EXPORT_COLUMNS]
    : QUOTATION_BASE_EXPORT_COLUMNS

  const getExportQuotations = async () => {
    const exportStatus = tabs.find((tab) => tab.tab === status)?.value || ''
    const filters = { ...searchParams, status: exportStatus }
    const result = await getData({ route: '/sale/quotation/export', filters })

    if (!result.success) {
      throw new Error(result.message)
    }

    return (result.data || []) as QuotationExportType[]
  }

  return (
    <div className="space-y-5">
      <NewClientModal />

      <Topbar
        title="Orçamentos"
        tabs={tabs}
        activeTab={status}
        paramName="status"
        primaryCta={
          <TooltipProvider>
            <PermissionGate permissions={['sale:quotation:export']}>
              <ExportDataButton
                columns={exportColumns}
                fileName="orcamentos"
                getData={getExportQuotations}
                sheetName="Orcamentos"
                emptyMessage="Nenhum orcamento disponivel para exportacao"
              />
            </PermissionGate>
            <NewQuickSaleTriggerButton
              onOpenChange={() => setOpenDialog('quick-sale')}
            />
            <NewQuotationTriggerButton
              onOpenChange={() => {
                setOpenDialog('new-quotation')
              }}
            />
          </TooltipProvider>
        }
      />
      <div>
        <Card>
          {isLoading ? (
            <Skeleton className="h-[calc(100vh-150px)]" />
          ) : totals?.todos && totals?.todos > 0 ? (
            statusEmpty ? (
              <ListDataStatusEmpty
                title={`Nenhum orçamento para o status ${statusLabel ? `: ${statusLabel}` : 'selecionado'}`}
                icon={IconReportOff}
              />
            ) : (
              <>
                {/* Filters */}
                <TableFiltersHeader searchParams={searchParams}>
                  <QuotationsFilter searchParams={searchParams} />
                </TableFiltersHeader>
                {/* Table */}
                <QuotationsData searchParams={searchParams} tabs={tabs} />
              </>
            )
          ) : (
            <ListDataTotalEmpty
              icon={IconReportOff}
              title="Sem orçamentos cadastrados"
              description="Cadastre seu primeiro orçamento"
              cta={
                <NewQuotationTriggerButton
                  onOpenChange={() => setOpenDialog('new-quotation')}
                />
              }
            />
          )}
          <NewQuotationModal
            open={openDialog === 'new-quotation'}
            onOpenChange={() => setOpenDialog('')}
          />
          <NewQuotationModal
            quickSale
            open={openDialog === 'quick-sale'}
            onOpenChange={() => setOpenDialog('')}
          />
        </Card>
      </div>
    </div>
  )
}
