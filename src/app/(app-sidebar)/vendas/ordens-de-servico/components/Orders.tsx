'use client'

// React
import { useState } from 'react'

// UI
import { Card } from '@/components/ui/card'

// Components
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { OrdersData } from './OrdersTable/OrdersData'
import { OrdersFilter } from './OrdersTable/OrdersFilter'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import {
  NewQuotationModal,
  NewQuotationTriggerButton,
} from '../../orcamentos/components/NewQuotation'
import { NewClientModal } from '../../orcamentos/components/NewClient'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ExportDataButton } from '@/components/common/ExportDataButton'
import { ListSkeleton } from '@/components/common/ListSkeleton'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { ExportColumn } from '@/lib/export-excel'
import type { OrderType } from '@/types/sales/order'

// Actions
import { getData, getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconNewsOff } from '@tabler/icons-react'

import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { usePermissions } from '@/hooks/usePermissions'
import { ordersStatusObj } from '@/consts/orders'

type OrderExportType = OrderType & {
  groupDate?: string
}

function getOrderReference(order: OrderExportType) {
  const quotation = order.quotation
  const serie = quotation?.serie?.quotation || ''
  const code = quotation?.serie?.code || ''
  const reference = [serie, code].filter(Boolean).join('-')

  return [reference, quotation?.description].filter(Boolean).join(' - ')
}

function getOrderFinalValue(order: OrderExportType) {
  const quotation = order.quotation
  const itemsValue = quotation?.totalValue || 0
  const deliveryValue = quotation?.deliveryInfo?.value ?? 0
  const payment = quotation?.quotationPayment
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

function getMainNfe(order: OrderExportType) {
  return order.nfes?.[0]
}

const ORDER_BASE_EXPORT_COLUMNS: ExportColumn<OrderExportType>[] = [
  {
    header: 'Referência',
    getValue: getOrderReference,
  },
  {
    header: 'Cliente',
    getValue: (order) => order.quotation?.client?.name,
  },
  {
    header: 'E-mail do cliente',
    getValue: (order) => order.quotation?.client?.email,
  },
  {
    header: 'Vendedor',
    getValue: (order) => order.quotation?.seller?.name,
  },
  {
    header: 'Status',
    getValue: (order) => ordersStatusObj[order.status]?.text || order.status,
  },
  {
    header: 'Etapa da venda',
    getValue: (order) => order.quotation?.tag?.text,
  },
  {
    header: 'Venda rápida',
    type: 'boolean',
    getValue: (order) => order.quotation?.quickSale,
  },
  {
    header: 'Criado em',
    key: 'groupDate',
    type: 'date',
  },
  {
    header: 'Aprovado em',
    getValue: (order) => order.quotation?.approvedAt,
    type: 'date',
  },
  {
    header: 'NF-e status',
    getValue: (order) => getMainNfe(order)?.status,
  },
  {
    header: 'NF-e número',
    getValue: (order) => getMainNfe(order)?.numero,
  },
  {
    header: 'NF-e série',
    getValue: (order) => getMainNfe(order)?.serie,
  },
  {
    header: 'NF-e emissão',
    getValue: (order) => getMainNfe(order)?.dataEmissao,
    type: 'date',
  },
]

const ORDER_VALUE_EXPORT_COLUMNS: ExportColumn<OrderExportType>[] = [
  {
    header: 'Valor itens',
    type: 'currency',
    getValue: (order) => (order.quotation?.totalValue || 0) / 100,
  },
  {
    header: 'Valor entrega',
    type: 'currency',
    getValue: (order) => (order.quotation?.deliveryInfo?.value ?? 0) / 100,
  },
  {
    header: 'Desconto',
    type: 'currency',
    getValue: (order) =>
      (order.quotation?.quotationPayment?.discountTotal ?? 0) / 100,
  },
  {
    header: 'Comissão adicionada',
    type: 'currency',
    getValue: (order) =>
      order.quotation?.quotationPayment?.commission?.type === 'ADD'
        ? (order.quotation?.quotationPayment?.commission?.totalCommission ??
            0) / 100
        : 0,
  },
  {
    header: 'Valor final',
    type: 'currency',
    getValue: (order) => getOrderFinalValue(order) / 100,
  },
]

export function Orders({ searchParams }: SearchParamsType) {
  const [openDialog, setOpenDialog] = useState<string>('')

  const { canManageDeliverySchedule } = usePlanFeatures()
  const { hasAllPermissions } = usePermissions()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['order-totals'],
    queryFn: () => getDataOld({ route: 'orderTotalsRoute' }),
  })

  const totals: { [key: string]: number } = {
    aguardando: data?.PENDING,
    producao: data?.IN_PRODUCTION,
    finalizadas: data?.FINISHED,
    canceladas: data?.CANCELED,
    todas: data?.TOTAL,
  }

  const status = searchParams.status
  const statusEmpty = totals?.[status] === 0

  const allTabs: TabNavType[] = [
    {
      value: 'PENDING',
      tab: 'aguardando',
      label: 'Aguardando',
      count: totals?.aguardando,
    },
    {
      value: 'IN_PRODUCTION',
      tab: 'producao',
      label: 'Produção / Entrega',
      count: totals?.producao,
    },
    {
      value: 'FINISHED',
      tab: 'finalizadas',
      // O mesmo nome da fase na Agenda de entrega (ALT-10, D-prod-1): a
      // ordem que saiu da produção está em Faturamento, não "finalizada"
      label: canManageDeliverySchedule() ? 'Faturamento' : 'Aprovadas',
      count: totals?.finalizadas,
    },
    {
      value: 'CANCELED',
      tab: 'canceladas',
      label: 'Canceladas',
      count: totals?.canceladas,
    },
    {
      value: '',
      tab: 'todas',
      label: 'Todas',
      count: totals?.todas,
    },
  ]

  const tabs = canManageDeliverySchedule()
    ? allTabs
    : allTabs.filter(
        (tab) => tab.value !== 'PENDING' && tab.value !== 'IN_PRODUCTION',
      )

  const statusLabel = tabs?.find((tab) => tab.tab === status)?.label
  const canViewValues = hasAllPermissions(['values:values:view'])
  const exportColumns = canViewValues
    ? [...ORDER_BASE_EXPORT_COLUMNS, ...ORDER_VALUE_EXPORT_COLUMNS]
    : ORDER_BASE_EXPORT_COLUMNS

  const getExportOrders = async () => {
    const exportStatus = tabs.find((tab) => tab.tab === status)?.value || ''
    const filters = { ...searchParams, status: exportStatus }
    const result = await getData({ route: '/sale/order/export', filters })

    if (!result.success) {
      throw new Error(result.message)
    }

    return (result.data || []) as OrderExportType[]
  }

  return (
    <PermissionGate permissions={['sale:order:view']}>
      <div className="space-y-5">
        <Topbar
          title="Ordens de serviço"
          tabs={tabs}
          activeTab={status}
          paramName="status"
          countsLoading={isLoading}
          primaryCta={
            <TooltipProvider>
              <div className="flex gap-3">
                <PermissionGate permissions={['sale:order:export']}>
                  <ExportDataButton
                    columns={exportColumns}
                    fileName="ordens-de-servico"
                    getData={getExportOrders}
                    sheetName="Ordens"
                    emptyMessage="Nenhuma ordem de serviço disponível para exportação"
                  />
                </PermissionGate>
                <NewQuotationTriggerButton
                  onOpenChange={(open) => setOpenDialog(open ? 'new' : '')}
                />
              </div>
            </TooltipProvider>
          }
        />
        <div>
          <Card>
            {isLoading ? (
              <ListSkeleton cols={5} filters={2} />
            ) : totals?.todas && totals?.todas > 0 ? (
              statusEmpty ? (
                <ListDataStatusEmpty
                  title={`Nenhuma ordem de serviço para o status: ${statusLabel || 'selecionado'}`}
                  icon={IconNewsOff}
                />
              ) : (
                <>
                  {/* Filters */}
                  <TableFiltersHeader searchParams={searchParams}>
                    <OrdersFilter searchParams={searchParams} />
                  </TableFiltersHeader>
                  {/* Table */}
                  <OrdersData searchParams={searchParams} tabs={tabs} />
                </>
              )
            ) : (
              <ListDataTotalEmpty
                icon={IconNewsOff}
                title="Nenhuma ordem de serviço cadastrada"
                description="Cadastre um orçamento"
                cta={
                  <NewQuotationTriggerButton
                    onOpenChange={(open) => setOpenDialog(open ? 'new' : '')}
                  />
                }
              />
            )}
          </Card>
          <NewClientModal />
          <NewQuotationModal
            open={openDialog === 'new'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'new' : '')
            }}
          />
        </div>
      </div>
    </PermissionGate>
  )
}
