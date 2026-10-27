'use client'

// React
import Link from 'next/link'
import { Fragment, useState } from 'react'

// Components
import { QuotationTagDropdown } from './QuotationTagDropdown'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { FetchingRegion } from '@/components/common/FetchingRegion'
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
import { Icon } from '@/components/ui/icon'
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
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { formatToLocaleDate, formatToWeekDate } from '@/lib/formatDate'
import { nextContactLabel, nextContactState } from '@/lib/nextContact'
import { contactOutcomeLabel } from '@/types/sales/followUp'
import { focusParam } from './AwaitingFocus'
import { ContactDialog } from '../FollowUp/ContactDialog'
import { WhatsAppButton } from '../FollowUp/WhatsAppButton'

// Third-party
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
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
  IconBolt,
  IconMessageCircle,
} from '@tabler/icons-react'
import { PrintQuotationDialog } from '@/components/common/PrintQuotation/PrintQuotationDialog'
import { useQuotationTag } from '@/hooks/queries/useQuotationTag'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useNotifyPlanErrorOnce } from '@/hooks/usePlanErrorToast'
import { usePermissions } from '@/hooks/usePermissions'

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
  // A aba Aguardando é a visão do dia (CRM-2, 27/10/2026): mostra o próximo
  // contato e o último registrado no lugar da conclusão, a validade com os
  // dias que faltam, e as ações de registrar contato e chamar no WhatsApp.
  // O foco (`foco=`) vira o parâmetro nextContact da API
  const isAwaitingTab = searchParams?.status === 'concluido'
  const isResumeTab = isAwaitingTab
  const [contacting, setContacting] = useState<QuotationType | null>(null)
  const { hasAllPermissions } = usePermissions()
  const canViewValues = hasAllPermissions(['values:values:view'])

  const status = tabs?.find((tab) => tab.tab === searchParams.status)?.value
  // `novo` é da tela, não da consulta: ele liga a venda rápida (ALT-22). A API
  // recusa propriedade que não conhece e devolve 400, derrubando a lista
  const { novo: _novo, foco, ...listParams } = searchParams
  const filters = {
    ...listParams,
    status,
    ...(isAwaitingTab ? focusParam(foco as string) : {}),
  }

  const { data, isLoading, isPlaceholderData } = useQuery({
    staleTime: Infinity,
    // Filtro, busca e página mantêm a lista anterior até a nova chegar
    placeholderData: keepPreviousData,
    queryKey: ['quotation-list', searchParams],
    queryFn: () => getData({ route: '/sale/quotation', filters }),
  })
  // Filtrada pelo cliente, a lista é a aba Orçamentos do cadastro, recurso
  // de plano: o servidor recusa sem ele.
  useNotifyPlanErrorOnce(data)

  const { data: tagsList } = useQuotationTag()

  const quotationArray: ListQuotationsDataType[] = data?.data || []
  const hasData = quotationArray.length
  // Mesmas colunas condicionais do cabeçalho real
  const skeletonCols =
    5 + Number(canViewValues) + Number(isAllTab) + Number(showStatusColumn)

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
      iconTone: 'error',
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
              ids.length > 1 ? 'Orçamentos excluídos' : 'Orçamento excluído',
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
        <FetchingRegion isFetching={isPlaceholderData}>
          {isLoading || hasData ? (
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
                    <TableHead>
                      {isResumeTab ? 'Próximo contato' : 'Concluído em'}
                    </TableHead>
                    <TableHead>Válido até</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeletonRows cols={skeletonCols} />
                  ) : (
                    quotationArray.map((group) => (
                      <Fragment key={group.date}>
                        <TableRow className="bg-gray-100">
                          <TableCell
                            colSpan={
                              6 +
                              Number(canViewValues) +
                              Number(isAllTab) +
                              Number(showStatusColumn)
                            }
                            className="text-gray font-medium text-xs py-3"
                          >
                            {formatToWeekDate(group?.date)}
                          </TableCell>
                        </TableRow>
                        {group?.quotations?.length
                          ? group?.quotations.map((quotation) => {
                              const link = `/vendas/orcamentos/${quotation?.id}`
                              // Sem descrição (a venda rápida pode não ter), só a referência: antes
                              // aparecia "6-T1 - null"
                              const reference = `${quotation?.serie?.quotation || ''}-${quotation?.serie?.code || ''}`
                              const description = quotation?.description
                                ? `${reference} - ${quotation.description}`
                                : reference

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
                                        <p className="flex min-w-0 items-center gap-2 text-gray">
                                          <span className="truncate">
                                            {description}
                                          </span>
                                          {quotation?.quickSale && (
                                            <QuickSaleBadge />
                                          )}
                                        </p>
                                      }
                                    >
                                      <Link
                                        href={link}
                                        className="flex min-w-0 items-center gap-2 text-gray hover:opacity-80 active:opacity-95 transition-opacity"
                                      >
                                        <span className="truncate">
                                          {description}
                                        </span>
                                        {quotation?.quickSale && (
                                          <QuickSaleBadge />
                                        )}
                                      </Link>
                                    </PermissionGate>
                                    {quotation?.status === 'REJECTED' &&
                                    quotation?.rejectionReason ? (
                                      <p className="text-xs text-error-700">
                                        Motivo:{' '}
                                        {quotation.rejectionReason.reason}
                                      </p>
                                    ) : null}
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
                                                acc +
                                                (inst?.additionalFee ?? 0),
                                              0,
                                            ) ?? 0
                                          const downPaymentAdditionalFee =
                                            payment?.downPaymentAdditionalFee ??
                                            0
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
                                            quotationsStatusObj[
                                              quotation?.status
                                            ]?.variant || 'neutralLight'
                                          }
                                        >
                                          {quotationsStatusObj[
                                            quotation?.status
                                          ]?.text || 'Desconhecido'}
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
                                  {isResumeTab ? (
                                    <TableCell className="text-gray-600">
                                      <NextContactCell quotation={quotation} />
                                    </TableCell>
                                  ) : (
                                    <TableCell className="text-gray-600">
                                      {formatToLocaleDate(
                                        quotation?.finishedAt,
                                      )}
                                    </TableCell>
                                  )}
                                  <TableCell className="text-gray-600">
                                    {isAwaitingTab ? (
                                      <DueDateCell quotation={quotation} />
                                    ) : (
                                      formatToLocaleDate(quotation?.dueDate)
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex justify-end gap-1">
                                      <TooltipProvider>
                                        {isAwaitingTab && (
                                          <PermissionGate
                                            permissions={[
                                              'sale:quotation:edit',
                                            ]}
                                          >
                                            <ActionButton
                                              Icon={IconMessageCircle}
                                              tooltip="Registrar contato"
                                              onClick={() =>
                                                setContacting(quotation)
                                              }
                                            />
                                            <WhatsAppButton
                                              phone={
                                                quotation?.client?.phoneNumber
                                              }
                                              template={
                                                dueSoon(quotation?.dueDate)
                                                  ? 'validity'
                                                  : 'resume'
                                              }
                                              vars={{
                                                cliente:
                                                  quotation?.client?.name,
                                                numero: reference,
                                                valor: formatCurrencyToBrl(
                                                  quotation?.totalValue || 0,
                                                ),
                                                validade: formatToLocaleDate(
                                                  quotation?.dueDate,
                                                ),
                                              }}
                                            />
                                          </PermissionGate>
                                        )}
                                        <ActionButton
                                          Icon={IconPrinter}
                                          tooltip="Imprimir"
                                          onClick={() => {
                                            setRowData(quotation)
                                            setOpenPrintDialog(true)
                                          }}
                                        />
                                        <PermissionGate
                                          permissions={[
                                            'sale:quotation:create',
                                          ]}
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
                                            permissions={[
                                              'sale:quotation:delete',
                                            ]}
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
                    ))
                  )}
                </TableBody>
              </Table>
              <ContactDialog
                open={!!contacting}
                onOpenChange={(open) => !open && setContacting(null)}
                quotation={
                  contacting
                    ? {
                        id: contacting.id,
                        reference: `${contacting?.serie?.quotation || ''}-${contacting?.serie?.code || ''}`,
                        clientName:
                          contacting?.client?.name || 'Cliente não informado',
                        nextContactAt: contacting.nextContactAt,
                        nextContactNote: contacting.nextContactNote,
                        tagId: contacting.tag?.id,
                      }
                    : null
                }
              />
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
        </FetchingRegion>
      </CardContent>
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            // lastPage={data?.lastPage}
            lastPage={data?.total ? Math.ceil(data.total / 10) : 1}
            isLoading={isLoading}
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

function QuickSaleBadge() {
  return (
    <Badge variant="warningLight" size="sm" className="shrink-0">
      <Icon icon={IconBolt} size="sm" />
      Venda rápida
    </Badge>
  )
}

// Data do próximo contato na aba "Para retomar": atrasado em vermelho, hoje
// em destaque, e o lembrete logo abaixo
function NextContactCell({ quotation }: { quotation: QuotationType }) {
  const state = nextContactState(quotation?.nextContactAt)
  if (!state)
    return (
      <div className="space-y-0.5">
        <p className="text-warning-700">Sem próximo contato</p>
        {quotation?.lastContact ? (
          <p className="text-xs text-gray-500">
            Último: {formatToLocaleDate(quotation.lastContact.at)} ·{' '}
            {contactOutcomeLabel[quotation.lastContact.outcome]}
          </p>
        ) : null}
      </div>
    )
  return (
    <div className="space-y-0.5">
      <p
        className={cn(
          'text-nowrap',
          state === 'overdue' && 'text-error-700 font-medium',
          state === 'today' && 'text-gray-900 font-medium',
        )}
      >
        {formatToLocaleDate(quotation?.nextContactAt ?? undefined)}
        {state !== 'upcoming' ? ` · ${nextContactLabel[state]}` : ''}
      </p>
      {quotation?.nextContactNote ? (
        <p className="text-xs text-gray max-w-[260px] truncate">
          {quotation.nextContactNote}
        </p>
      ) : null}
      {quotation?.lastContact ? (
        <p className="text-xs text-gray-500">
          Último: {formatToLocaleDate(quotation.lastContact.at)} ·{' '}
          {contactOutcomeLabel[quotation.lastContact.outcome]}
        </p>
      ) : null}
    </div>
  )
}

// Proposta vencendo em até 2 dias (CRM-2): a validade é um gatilho
const EXPIRING_DAYS = 2
function daysToDue(dueDate?: string | Date | null): number | null {
  if (!dueDate) return null
  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86400000)
}
function dueSoon(dueDate?: string | Date | null) {
  const days = daysToDue(dueDate)
  return days !== null && days >= 0 && days <= EXPIRING_DAYS
}

// A validade com os dias que faltam: vermelho vencida, laranja vencendo
function DueDateCell({ quotation }: { quotation: QuotationType }) {
  const days = daysToDue(quotation?.dueDate)
  if (days === null) return <>{formatToLocaleDate(quotation?.dueDate)}</>
  const label =
    days < 0
      ? `vencida há ${-days} ${-days === 1 ? 'dia' : 'dias'}`
      : days === 0
        ? 'vence hoje'
        : days <= EXPIRING_DAYS
          ? `vence em ${days} ${days === 1 ? 'dia' : 'dias'}`
          : null
  return (
    <div className="space-y-0.5">
      <p
        className={cn(
          'text-nowrap',
          days < 0 && 'text-error-700 font-medium',
          days >= 0 && days <= EXPIRING_DAYS && 'text-warning-700 font-medium',
        )}
      >
        {formatToLocaleDate(quotation?.dueDate)}
      </p>
      {label ? <p className="text-xs text-gray-500">{label}</p> : null}
    </div>
  )
}
