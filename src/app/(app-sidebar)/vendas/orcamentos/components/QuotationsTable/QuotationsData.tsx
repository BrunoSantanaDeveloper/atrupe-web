'use client'

// React
import Link from 'next/link'
import { Fragment, useState } from 'react'

// Components
import { QuotationTagDropdown } from './QuotationTagDropdown'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
import { NewQuotationModal, NewQuotationTriggerButton } from '../NewQuotation'
import { QuotationHistoryDialog } from '../QuotationHistory/QuotationHistoryDialog'
import { DuplicateQuotationButton } from '@/components/common/DuplicateQuotationButton'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CardFooter, CardContent } from '@/components/ui/card'

// Types
import { SearchParamsType } from '@/types/coreTypes'
import type { TabNavType } from '@/components/common/Topbar'
import type {
  QuotationType,
  ListQuotationsDataType,
} from '@/types/sales/quotation'

// Actions
import { getData, deleteItemNew } from '@/actions/_cruds'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'
import { formatToLocaleDate, formatToWeekDate } from '@/lib/formatDate'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Store
import { useAlertDialog } from '@/store/useAlertDialog'

// Consts
import { FEATURES } from '@/consts/features'
import { quotationsStatusObj } from '@/consts/quotations'

// Icons
import {
  IconPencil,
  IconPrinter,
  IconHistory,
  IconTrash,
} from '@tabler/icons-react'
import { PrintQuotationDialog } from '@/components/common/PrintQuotation/PrintQuotationDialog'
import { useQuotationTag } from '@/hooks/queries/useQuotationTag'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useNotifyPlanErrorOnce } from '@/hooks/usePlanErrorToast'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
  searchDescription?: string
}

export function QuotationsData({
  searchParams,
  tabs,
  searchDescription,
}: Props) {
  const [openDialog, setOpenDialog] = useState(false)
  const [rowData, setRowData] = useState<QuotationType | null>(null)
  const [openPrintDialog, setOpenPrintDialog] = useState(false)
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false)
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([])

  const { open: openAlertDialog } = useAlertDialog()
  const queryClient = useQueryClient()

  const { hasFeature } = usePlanFeatures()
  // A coluna tem chave própria: com a da configuração dos status, desligar
  // quotation_status_column no painel não mudava a lista.
  const showStatusColumn = hasFeature(FEATURES.SALES.QUOTATION_STATUS_COLUMN)
  const isAllTab = searchParams?.status === 'todos'

  const status = tabs?.find((tab) => tab.tab === searchParams.status)?.value
  const filters = { ...searchParams, status }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['quotation-list', searchParams],
    queryFn: () => getData({ route: '/sale/quotation', filters }),
  })
  // Filtrada pelo cliente, a lista é a aba Orçamentos do cadastro, recurso
  // de plano: o servidor recusa sem ele.
  useNotifyPlanErrorOnce(data)

  const { data: tagsList } = useQuotationTag()

  const quotationArray: ListQuotationsDataType[] = data?.data || []
  const hasData = quotationArray.length

  const openQuotations = quotationArray
    .flatMap((group) => group.quotations || [])
    .filter((q) => q.status === 'OPEN')
  const isAllOpenSelected =
    openQuotations.length > 0 &&
    selectedQuotations.length === openQuotations.length

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuotations(openQuotations.map((q) => q.id))
    } else {
      setSelectedQuotations([])
    }
  }

  const handleDelete = (ids: string[]) => {
    openAlertDialog({
      title: ids.length > 1 ? 'Excluir orçamentos' : 'Excluir orçamento',
      description:
        'Tem certeza que deseja excluir? Esta ação não poderá ser desfeita.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      iconVariant: 'error',
      confirmVariant: 'error',
      onConfirm: async () => {
        try {
          let hasError = false
          for (const id of ids) {
            const res = await deleteItemNew({ route: `/sale/quotation/${id}` })
            if (!res.success) {
              hasError = true
              toast.error(res.message || 'Erro ao excluir orçamento(s)')
              break
            }
          }
          if (!hasError) {
            toast.success(
              ids.length > 1
                ? 'Orçamentos excluídos com sucesso'
                : 'Orçamento excluído com sucesso',
            )
          }
          queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
          queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
          setSelectedQuotations([])
        } catch (error) {
          toast.error('Erro ao excluir orçamento(s)')
        }
      },
    })
  }

  return (
    <>
      <CardContent>
        {selectedQuotations.length > 0 && (
          <div className="flex items-center justify-between bg-error-50 p-3 rounded-md mb-4 border border-error-100">
            <span className="text-sm text-error-700 font-medium">
              {selectedQuotations.length}{' '}
              {selectedQuotations.length === 1
                ? 'orçamento selecionado'
                : 'orçamentos selecionados'}
            </span>
            <Button
              variant="error"
              size="sm"
              LeftIcon={IconTrash}
              onClick={() => handleDelete(selectedQuotations)}
            >
              Excluir selecionados
            </Button>
          </div>
        )}
        {isLoading ? (
          <TableSkeleton cols={6} />
        ) : hasData ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[4%] pr-0">
                    <Checkbox
                      checked={isAllOpenSelected}
                      onCheckedChange={handleToggleSelectAll}
                      disabled={openQuotations.length === 0}
                      aria-label="Selecionar todos os orçamentos em digitação"
                    />
                  </TableHead>
                  <TableHead>Referência</TableHead>
                  <PermissionGate permissions={['values:values:view']}>
                    <TableHead>Valor</TableHead>
                  </PermissionGate>
                  {isAllTab && <TableHead>Fase atual</TableHead>}
                  {showStatusColumn && <TableHead>Status</TableHead>}
                  <TableHead>Concluído em</TableHead>
                  <TableHead>Válido até</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotationArray.map((group) => (
                  <Fragment key={group.date}>
                    <TableRow className="bg-gray-100">
                      <TableCell
                        colSpan={showStatusColumn ? 8 : 7}
                        className="text-gray font-medium text-xs py-3"
                      >
                        {formatToWeekDate(group?.date)}
                      </TableCell>
                    </TableRow>
                    {group?.quotations?.length
                      ? group?.quotations.map((quotation) => {
                          const link = `/vendas/orcamentos/${quotation?.id}`
                          const description = `${quotation?.serie?.quotation || ''}-${quotation?.serie?.code || ''} - ${quotation?.description}`

                          return (
                            <TableRow
                              key={quotation?.id}
                              data-state={
                                selectedQuotations.includes(quotation?.id)
                                  ? 'selected'
                                  : undefined
                              }
                            >
                              <TableCell className="pr-0">
                                {quotation?.status === 'OPEN' ? (
                                  <Checkbox
                                    checked={selectedQuotations.includes(
                                      quotation.id,
                                    )}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedQuotations([
                                          ...selectedQuotations,
                                          quotation.id,
                                        ])
                                      } else {
                                        setSelectedQuotations(
                                          selectedQuotations.filter(
                                            (id) => id !== quotation.id,
                                          ),
                                        )
                                      }
                                    }}
                                    aria-label={`Selecionar orçamento ${description}`}
                                  />
                                ) : null}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">
                                  {quotation?.client?.name ||
                                    'Cliente não informado'}
                                </p>

                                <PermissionGate
                                  permissions={['sale:quotation:edit']}
                                  fallback={
                                    <p className="text-gray truncate">
                                      {description}{' '}
                                      {quotation?.quickSale && '⚡'}
                                    </p>
                                  }
                                >
                                  <Link
                                    href={link}
                                    className="text-gray hover:opacity-80 active:opacity-95 transition-opacity truncate"
                                  >
                                    {description} {quotation?.quickSale && '⚡'}
                                  </Link>
                                </PermissionGate>
                              </TableCell>
                              <PermissionGate
                                permissions={['values:values:view']}
                              >
                                <TableCell className="text-success-700 text-nowrap">
                                  {formatCurrencyToBrl(
                                    (() => {
                                      // Cálculo igual ao PaymentConditions.tsx
                                      const itemsValue =
                                        quotation?.totalValue || 0
                                      const deliveryValue =
                                        quotation?.deliveryInfo?.value ?? 0
                                      const payment =
                                        quotation?.quotationPayment
                                      const commissionValue =
                                        payment?.commission?.type === 'ADD'
                                          ? (payment?.commission
                                              ?.totalCommission ?? 0)
                                          : 0
                                      const installmentsAdditionalFee =
                                        payment?.quotationInstallment?.reduce(
                                          (acc, inst) =>
                                            acc + (inst?.additionalFee ?? 0),
                                          0,
                                        ) ?? 0
                                      const downPaymentAdditionalFee =
                                        payment?.downPaymentAdditionalFee ?? 0
                                      const totalAdditionalFee =
                                        installmentsAdditionalFee +
                                        downPaymentAdditionalFee
                                      const discountTotal =
                                        payment?.discountTotal ?? 0

                                      return (
                                        itemsValue +
                                        deliveryValue +
                                        commissionValue +
                                        totalAdditionalFee -
                                        discountTotal
                                      )
                                    })(),
                                  )}
                                </TableCell>
                              </PermissionGate>
                              {isAllTab && (
                                <TableCell>
                                  {quotation?.status ? (
                                    <Badge
                                      status
                                      variant={
                                        quotationsStatusObj[quotation?.status]
                                          ?.variant || 'neutralLight'
                                      }
                                    >
                                      {quotationsStatusObj[quotation?.status]
                                        ?.text || 'Desconhecido'}
                                    </Badge>
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                              )}
                              {showStatusColumn && (
                                <TableCell>
                                  <QuotationTagDropdown
                                    quotation={quotation}
                                    tagsList={tagsList || []}
                                  />
                                </TableCell>
                              )}
                              <TableCell className="text-gray-600">
                                {formatToLocaleDate(quotation?.finishedAt)}
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {formatToLocaleDate(quotation?.dueDate)}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <TooltipProvider>
                                    <ActionButton
                                      Icon={IconPrinter}
                                      tooltip="Imprimir"
                                      onClick={() => {
                                        setRowData(quotation)
                                        setOpenPrintDialog(true)
                                      }}
                                    />
                                    <PermissionGate
                                      permissions={['sale:quotation:create']}
                                    >
                                      <DuplicateQuotationButton
                                        quotationId={quotation?.id}
                                        clientId={quotation?.client?.id}
                                        clientName={quotation?.client?.name}
                                        description={quotation?.description}
                                      />
                                    </PermissionGate>
                                    <ActionButton
                                      Icon={IconHistory}
                                      tooltip="Histórico"
                                      onClick={() => {
                                        setRowData(quotation)
                                        setOpenHistoryDialog(true)
                                      }}
                                    />
                                    <PermissionGate
                                      permissions={['sale:quotation:edit']}
                                    >
                                      <ActionButton
                                        link={link}
                                        Icon={IconPencil}
                                        tooltip="Editar"
                                      />
                                    </PermissionGate>
                                    {quotation?.status === 'OPEN' && (
                                      <PermissionGate
                                        permissions={['sale:quotation:delete']}
                                      >
                                        <ActionButton
                                          Icon={IconTrash}
                                          tooltip="Excluir"
                                          variant="errorGhost"
                                          onClick={() =>
                                            handleDelete([quotation.id])
                                          }
                                        />
                                      </PermissionGate>
                                    )}
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      : null}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
            {rowData && (
              <>
                <PrintQuotationDialog
                  type="quotation"
                  quotationId={rowData?.id}
                  open={openPrintDialog}
                  onOpenChange={setOpenPrintDialog}
                />
                <QuotationHistoryDialog
                  open={openHistoryDialog}
                  setOpen={setOpenHistoryDialog}
                  quotation={rowData}
                />
              </>
            )}
          </>
        ) : (
          <FilteredDataEmpty
            title="Orçamento não encontrado"
            description={
              searchDescription ||
              'Sua busca não encontrou nenhum resultado. Tente novamente ou crie um novo orçamento'
            }
            cta={<NewQuotationTriggerButton onOpenChange={setOpenDialog} />}
          />
        )}
      </CardContent>
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            // lastPage={data?.lastPage}
            lastPage={data?.total ? Math.ceil(data.total / 10) : 1}
          />
        </CardFooter>
      ) : null}

      <NewQuotationModal
        open={openDialog}
        onOpenChange={(open) => {
          setOpenDialog(open)
        }}
      />
    </>
  )
}
