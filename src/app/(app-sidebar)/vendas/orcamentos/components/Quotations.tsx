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
import { createItemNew, getData, getDataOld } from '@/actions/_cruds'
import { getQuickSaleSettings } from '@/actions/quick-sale'

// Third-party
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconReportOff } from '@tabler/icons-react'
import { quotationsStatusObj } from '@/consts/quotations'
import { usePermissions } from '@/hooks/usePermissions'

type QuotationExportType = QuotationType & {
  groupDate?: string
}

// VR-4 do fork: a venda rápida que cria o orçamento direto com a configuração
// de src/actions/quick-sale.ts (dado de demonstração) e cobra pelo checkout
// em memória. Desligado: a etapa da fronteira do mock troca esta constante
// pela flag de demonstração. Até lá vale o formulário da venda rápida, que
// segue Concluir/Aprovar e Informar cliente.
const QUICK_SALE_DIRECT = false as boolean

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
    header: 'Referência',
    getValue: getQuotationReference,
  },
  {
    header: 'Cliente',
    getValue: (quotation) => quotation.client?.name,
  },
  {
    header: 'E-mail do cliente',
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
    header: 'Venda rápida',
    type: 'boolean',
    key: 'quickSale',
  },
  {
    header: 'Criado em',
    key: 'groupDate',
    type: 'date',
  },
  {
    header: 'Concluído em',
    key: 'finishedAt',
    type: 'date',
  },
  {
    header: 'Válido até',
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
    header: 'Comissão adicionada',
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
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()

  // "Venda rápida" no menu leva para cá com ?novo=venda-rapida (o link antigo,
  // ?venda-rapida=1, continua valendo)
  const quickSaleRequested =
    searchParams?.novo === 'venda-rapida' ||
    searchParams?.['venda-rapida'] === '1'
  // ALT-22 / VR-1 (fork): com a configuração completa, a venda rápida pula o
  // modal e o orçamento nasce direto, abrindo na tela dos itens. A
  // configuração ainda vem de dado de demonstração, por isso o caminho fica
  // desligado (QUICK_SALE_DIRECT) e o menu abre o formulário da venda rápida
  const isQuickSale = QUICK_SALE_DIRECT && quickSaleRequested
  const [creatingQuickSale, setCreatingQuickSale] = useState(false)

  // Caminho padrão: o formulário da venda rápida, com cliente opcional
  useEffect(() => {
    if (!quickSaleRequested || isQuickSale) return
    setOpenDialog('quick-sale')
    router.replace(pathname)
  }, [quickSaleRequested, isQuickSale, router, pathname])

  useEffect(() => {
    if (!isQuickSale || creatingQuickSale) return

    const createQuickSale = async () => {
      setCreatingQuickSale(true)

      const config = await getQuickSaleSettings()
      const settings = config?.data

      // Sem configuração completa não há como criar sozinho. Em vez de falhar
      // calado, a venda rápida cai no formulário da venda rápida e diz o que
      // falta — o vendedor termina a venda e alguém ajusta a configuração
      // depois
      if (!settings?.enabled || !settings?.clientId || !settings?.seriesId) {
        toast.info(
          'Venda rápida ainda não configurada: escolha o cliente padrão e a série em Configurações › Vendas › Venda rápida',
        )
        setOpenDialog('quick-sale')
        return
      }

      const res = await createItemNew({
        route: '/sale/quotation',
        data: {
          companyId: session?.company?.id,
          clientId: settings.clientId,
          contactId: '',
          description: settings.description,
          contactSourceId: settings.serviceTypeId,
          seriesId: settings.seriesId,
          sellerId: session?.user?.employeeId,
          quickSale: true,
        },
      })

      if (!res.success || !res.data?.id) {
        toast.error(res.message || 'Erro ao abrir a venda rápida')
        setOpenDialog('quick-sale')
        return
      }

      // Já com o modal "Qual item deseja adicionar?" aberto (VR-4)
      window.location.href = `/vendas/orcamentos/${res.data.id}?adicionar=1`
    }

    createQuickSale()
  }, [isQuickSale, creatingQuickSale, session])
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
    // mesmo cuidado da listagem: `novo` é da tela, a API recusa
    const { novo: _novo, ...exportParams } = searchParams
    const filters = { ...exportParams, status: exportStatus }
    const result = await getData({ route: '/sale/quotation/export', filters })

    if (!result.success) {
      throw new Error(result.message)
    }

    return (result.data || []) as QuotationExportType[]
  }

  // Enquanto a venda rápida cria o orçamento, não faz sentido piscar a lista:
  // o destino é a tela dos itens, não esta
  if (isQuickSale && openDialog !== 'quick-sale') {
    return (
      <div className="space-y-5">
        <Topbar title="Venda rápida" />
        <Skeleton className="h-[calc(100vh-150px)]" />
      </div>
    )
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
                sheetName="Orçamentos"
                emptyMessage="Nenhum orçamento disponível para exportação"
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
                title={`Nenhum orçamento para o status: ${statusLabel || 'selecionado'}`}
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
              title="Nenhum orçamento cadastrado"
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
