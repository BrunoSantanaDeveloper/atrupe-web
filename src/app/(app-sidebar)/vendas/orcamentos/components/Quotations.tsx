'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/hooks/useRouter'

// UI
import { Card, CardHeader, CardContent } from '@/components/ui/card'
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
import { AwaitingFocus, focusParam } from './QuotationsTable/AwaitingFocus'
import { ExportDataButton } from '@/components/common/ExportDataButton'
import { AiQuotationDraftButton } from './AiQuotationDraftDialog'
import { PermissionGate } from '@/components/common/PermissionGate'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FEATURES } from '@/consts/features'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { TableSkeleton } from '@/components/common/TableSkeleton'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { ExportColumn } from '@/lib/export-excel'
import type { QuotationType } from '@/types/sales/quotation'

// Actions
import { createItemNew, getData, getDataOld, getItem } from '@/actions/_cruds'

// Third-party
import { toast } from 'sonner'
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

export function getQuotationFinalValue(quotation: QuotationExportType) {
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
    header: 'Etapa da venda',
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
  // O acompanhamento comercial é do LITE (CRM-7, 29/10/2026)
  const { hasFeature } = usePlanFeatures()
  const followUp = hasFeature(FEATURES.SALES.SALES_FOLLOW_UP)

  // "Venda rápida" no menu leva para cá com ?novo=venda-rapida (o link antigo,
  // ?venda-rapida=1, continua valendo)
  const quickSaleRequested =
    searchParams?.novo === 'venda-rapida' ||
    searchParams?.['venda-rapida'] === '1'
  // ALT-22 / VR-1: com a configuração completa, a venda rápida pula o modal
  // e o orçamento nasce direto, abrindo na tela dos itens
  const isQuickSale = quickSaleRequested
  const [creatingQuickSale, setCreatingQuickSale] = useState(false)

  // Fora da URL da venda rápida, a próxima entrada pelo menu tenta de novo
  useEffect(() => {
    if (!isQuickSale) setCreatingQuickSale(false)
  }, [isQuickSale])

  useEffect(() => {
    if (!isQuickSale || creatingQuickSale) return

    const createQuickSale = async () => {
      setCreatingQuickSale(true)

      // Abrir o menu criava uma venda vazia a cada visita e a lista enchia
      // de lixo (decisão do produto, 26/10/2026): a venda rápida vazia do
      // mesmo usuário é reaproveitada enquanto estiver em digitação e sem
      // item. A API ainda vai criar a venda só com o primeiro item (Bruno)
      const emptyKey = `atrupe:venda-rapida-vazia:${session?.user?.userId || ''}`
      const previous = window.localStorage.getItem(emptyKey)
      if (previous) {
        const current = await getItem({ route: `/sale/quotation/${previous}` })
        const sale = current.success ? current.data : null
        if (
          sale?.quickSale &&
          sale?.status === 'OPEN' &&
          !(sale?.quotationItems?.length > 0)
        ) {
          window.location.href = `/vendas/orcamentos/${previous}?adicionar=1`
          return
        }
        window.localStorage.removeItem(emptyKey)
      }

      // A API cria com os padrões da configuração e o vendedor da sessão
      const res = await createItemNew({ route: '/sale/quotation/quick-sale' })

      // Sem configuração completa (ou sem colaborador vinculado) não há como
      // criar sozinho. Em vez de falhar calado, a venda rápida cai no
      // formulário da venda rápida e diz o que falta — o vendedor termina a
      // venda e alguém ajusta a configuração depois
      if (!res.success || !res.data?.id) {
        toast.info(res.message || 'Erro ao abrir a venda rápida')
        setOpenDialog('quick-sale')
        // Sem o parâmetro, a lista volta quando o formulário fechar
        router.replace(pathname)
        return
      }

      window.localStorage.setItem(emptyKey, res.data.id)
      // Já com o modal "Qual item deseja adicionar?" aberto (VR-4)
      window.location.href = `/vendas/orcamentos/${res.data.id}?adicionar=1`
    }

    createQuickSale()
  }, [isQuickSale, creatingQuickSale, router, pathname, session?.user?.userId])
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
    // Acompanhamento (CRM-2, 27/10/2026): os focos da aba Aguardando
    retomar: data?.retomar,
    semContato: data?.semContato,
    vencendo: data?.vencendo,
    todos: data?.TOTAL,
  }

  const status = searchParams.status
  // "Para retomar" vazia é um bom sinal: mostra o estado vazio próprio, não
  // o "nenhum orçamento para o status"
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
    // "Para retomar" deixou de ser aba (CRM-2, 27/10/2026): é um foco da
    // aba Aguardando, que virou a visão do dia do vendedor
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
    // mesmo cuidado da listagem: `novo` e `foco` são da tela, a API recusa
    const { novo: _novo, foco: _foco, ...exportParams } = searchParams
    const filters = {
      ...exportParams,
      status: exportStatus,
      ...(followUp ? focusParam(searchParams?.foco) : {}),
    }
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
        {/* Mesma forma da tela de itens, que é o destino */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <TableSkeleton cols={6} rows={3} />
          </CardContent>
        </Card>
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
        countsLoading={isLoading}
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
            {/* O mesmo caminho do menu: a venda rápida nasce com os padrões e
                abre direto na escolha do item. O formulário "Nova venda
                rápida" fica só para quando falta configuração */}
            {/* "Montar com IA" (IA-1): o texto do cliente vira o rascunho,
                como proposta; só com o assistente no plano */}
            <AiQuotationDraftButton />
            <NewQuickSaleTriggerButton
              onOpenChange={() => router.push(`${pathname}?novo=venda-rapida`)}
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
            <ListSkeleton cols={7} filters={3} />
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
                {/* A visão do dia (CRM-2): os focos da aba Aguardando */}
                {status === 'concluido' && followUp && (
                  <AwaitingFocus
                    searchParams={searchParams}
                    counts={{
                      retomar: totals?.retomar,
                      semContato: totals?.semContato,
                      vencendo: totals?.vencendo,
                      todos: totals?.concluido,
                    }}
                  />
                )}
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
