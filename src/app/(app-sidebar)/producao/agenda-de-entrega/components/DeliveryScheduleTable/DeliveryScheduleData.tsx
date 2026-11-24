'use client'

// React
import Link from 'next/link'
import { Fragment, useState } from 'react'

// Components
import { useAlertDialog } from '@/store/useAlertDialog'
import { StageStatusDropdown } from './Stages/StageStatus'
import { BillServiceDialog } from '../Actions/BillService'
import { DeliveryScheduleNotesDialog } from '../Actions/Notes'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { FetchingRegion } from '@/components/common/FetchingRegion'
import { DeliveryScheduleDateDialog } from '../Actions/ScheduleDate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
import { EditInstallments } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/EditInstallments'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableGroupRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CardFooter, CardContent } from '@/components/ui/card'

// Types
import type {
  DeliveryScheduleType,
  ListDeliveryScheduleDataType,
} from '@/types/production/deliverySchedule'
import type { SearchParamsType } from '@/types/coreTypes'
import type { TabNavType } from '@/components/common/Topbar'

// Actions
import {
  getDataOld,
  getItem,
  updateItem,
  createItemNew,
} from '@/actions/_cruds'

// Libs
import { cn, truncateString } from '@/lib/utils'
import { formatToWeekDate } from '@/lib/formatDate'
import { getProductionCalendar } from '@/actions/production-manager'
import { dayOff } from '@/app/(app-sidebar)/producao/gerenciador/forecast'

// Third-party
// EC-3: o @react-pdf/renderer não entra no topo do arquivo. Os componentes
// dele chegam como undefined na renderização do servidor e derrubam a página
// com "Element type is invalid". Biblioteca e documento são carregados dentro
// do clique que gera o PDF
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'

// Icons
import {
  IconCircleCheck,
  IconQuestionMark,
  IconChevronDown,
  IconChevronRight,
  IconCalendarRepeat,
} from '@tabler/icons-react'
import { IconReceitaFederal } from '@/assets/icons/pictogramas'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { usePermissions } from '@/hooks/usePermissions'

// Consts
import { FEATURES } from '@/consts/features'
import { useSectorColor } from '@/hooks/useSectorColor'
import { sectorIcons } from '@/consts/sectors'
import { stageStatus, invoiceStatus } from '@/consts/deliverySchedule'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
}

export function DeliveryScheduleData({ searchParams, tabs }: Props) {
  const colorOf = useSectorColor()
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<DeliveryScheduleType>()
  // As ordens abertas no segundo nível (área 9 §4.7): os itens e as etapas
  // de cada um, sob a linha principal
  const [expanded, setExpanded] = useState<string[]>([])
  const toggleExpanded = (id: string) =>
    setExpanded((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  const [isLoadingPDF, setIsLoadingPDF] = useState<string[]>([])

  // Concluir tudo de uma vez (gerencial, §4.7): os pedidos marcados têm as
  // etapas finalizadas, para quem não usou a agenda limpar e recomeçar
  const { hasPermission } = usePermissions()
  const [selected, setSelected] = useState<string[]>([])
  const toggleSelected = (id: string) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )

  const { canManageDeliverySchedule, hasFeature } = usePlanFeatures()
  // As etapas na Agenda e a troca de status delas têm chaves próprias: a da
  // troca é a que o servidor exige (delivery_stage_status_change). Com a
  // chave das abas, desligar uma delas no painel não mudava a tela.
  const showProductionStages = hasFeature(
    FEATURES.PRODUCTS.DELIVERY_PRODUCTION_STAGES,
  )
  const canChangeStageStatus = hasFeature(
    FEATURES.PRODUCTS.DELIVERY_STAGE_STATUS_CHANGE,
  )

  // O feriado e o dia sem expediente ficam em vermelho; a agenda continua
  // editável (GP-49). O expediente é cadastrado do PRO em diante
  const hasCalendar =
    hasFeature(FEATURES.PRODUCTION.SECTOR_BOARD) ||
    hasFeature(FEATURES.PRODUCTION.PRODUCTION_MANAGER)
  const { data: calendar } = useQuery({
    staleTime: 5 * 60 * 1000,
    queryKey: ['production-calendar'],
    queryFn: getProductionCalendar,
    enabled: hasCalendar,
  })

  const alertDialog = useAlertDialog()

  const queryClient = useQueryClient()

  const status = (() => {
    const foundStatus =
      tabs?.find((tab) => tab.tab === searchParams.status)?.value || ''

    // Se não puder gerenciar agenda completa e status estiver vazio, usar 'DELIVERING'
    if (!canManageDeliverySchedule() && !foundStatus) {
      return 'DELIVERING'
    }

    return foundStatus
  })()

  const filters = { ...searchParams, status }

  const { data, isLoading, isPlaceholderData } = useQuery({
    staleTime: Infinity,
    // Filtro, busca e página mantêm a lista anterior até a nova chegar
    placeholderData: keepPreviousData,
    queryKey: ['delivery-schedule-list', searchParams],
    queryFn: () => getDataOld({ route: 'deliveryScheduleRoute', filters }),
  })

  const deliveryScheduleArray: ListDeliveryScheduleDataType[] = data?.data || []
  const hasData = deliveryScheduleArray.length

  // Finalizar serviço
  const mutation = useMutation({
    mutationFn: (id: string) =>
      updateItem('deliveryScheduleFinishRoute', id, {}),
    onSuccess: () => {
      toast.success('Serviço finalizado')
      queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
      queryClient.invalidateQueries({ queryKey: ['delivery-schedule-totals'] })
    },
    onError: () => toast.error('Ocorreu um erro'),
  })

  const handleFinishService = (id: string) => {
    alertDialog.open({
      title: 'Finalizar serviço',
      description: 'Tem certeza que deseja finalizar o serviço?',
      confirmLabel: 'Finalizar',
      onConfirm: () => {
        mutation.mutate(id)
      },
    })
  }

  const canFinishAll =
    showProductionStages &&
    canChangeStageStatus &&
    hasPermission('production:delivery_schedule_finish_all:edit')

  const finishAll = useMutation({
    mutationFn: (scheduleIds: string[]) =>
      createItemNew({
        route: '/sale/production-stage/finish-all',
        data: { scheduleIds },
      }),
    onSuccess: (res) => {
      if (!res?.success) {
        toast.error(res?.message || 'Ocorreu um erro')
        return
      }
      const {
        finished = 0,
        skipped = 0,
        closed = 0,
      } = (res.data || {}) as {
        finished?: number
        skipped?: number
        closed?: number
      }
      // Um aviso por chamada, para a extração de textos achar cada um (IN-7).
      // `closed`: agendas canceladas ou já entregues, que ficam como estão
      if (closed) {
        toast.success(
          `Etapas concluídas em ${finished} pedidos; ${closed} já estavam cancelados ou entregues e ficaram como estavam`,
        )
      } else if (skipped) {
        toast.success(
          `Etapas concluídas em ${finished} pedidos; ${skipped} seguem o gerenciador e ficaram como estavam`,
        )
      } else {
        toast.success(`Etapas concluídas em ${finished} pedidos`)
      }
      setSelected([])
      queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
      queryClient.invalidateQueries({ queryKey: ['delivery-schedule-totals'] })
    },
    onError: () => toast.error('Ocorreu um erro'),
  })

  const handleFinishAll = () => {
    alertDialog.open({
      title: 'Concluir as etapas',
      description: `Todas as etapas de produção dos ${selected.length} pedidos marcados, e as dos itens deles, ficam finalizadas. A entrega e o serviço continuam por finalizar. Use para limpar a agenda e começar de novo.`,
      confirmLabel: 'Concluir as etapas',
      onConfirm: () => finishAll.mutate(selected),
    })
  }

  const handleInvoice = () => {
    alertDialog.open({
      title: 'Nota Fiscal',
      description: 'Recurso indisponível no momento.',
    })
  }

  const handleGeneratePDF = async (data: DeliveryScheduleType) => {
    const formData = {
      showImages: true,
      showDimensions: true,
      showUnitValue: true,
      showFinalValue: true,
      showTotalValue: true,
      showPaymentDelivery: true,
      showItemsDetails: true,
    }

    setIsLoadingPDF((prev) => [...prev, data.id])
    try {
      // Buscar dados do PDF da API
      const result = await getItem({
        route: `sale/quotation/${data.order?.quotation?.id}/pdf-data`,
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      const pdfData = result.data

      const [{ pdf }, { GeneratePdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/common/PrintQuotation/GeneratePdf'),
      ])

      const blob = await pdf(
        <GeneratePdf
          data={pdfData}
          type="production"
          printOptions={formData}
        />,
      ).toBlob()

      const url = URL.createObjectURL(blob)

      window.open(url, '_blank')
    } catch (error) {
      toast.error('Erro ao gerar PDF')
      console.error('Erro ao gerar PDF:', error)
    } finally {
      setIsLoadingPDF((prev) => prev.filter((id) => id !== data?.id))
    }
  }

  return (
    <>
      <CardContent>
        <FetchingRegion isFetching={isPlaceholderData}>
          {isLoading || hasData ? (
            <>
              {canFinishAll && selected.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
                  <p className="text-sm text-gray-800">
                    {selected.length === 1
                      ? '1 pedido marcado'
                      : `${selected.length} pedidos marcados`}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="neutralOutline"
                      onClick={() => setSelected([])}
                    >
                      Desmarcar
                    </Button>
                    <Button
                      type="button"
                      variant="success"
                      LeftIcon={IconCircleCheck}
                      isLoading={finishAll.isPending}
                      onClick={handleFinishAll}
                    >
                      Concluir as etapas
                    </Button>
                  </div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Referência</TableHead>
                    <TableHead>Produção</TableHead>
                    <TableHead>Financeiro</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeletonRows cols={4} />
                  ) : (
                    deliveryScheduleArray.map((group) => (
                      <Fragment key={group.date}>
                        {(() => {
                          const off = dayOff(
                            String(group?.date || '').slice(0, 10),
                            calendar,
                          )
                          return (
                            <TableGroupRow
                              className={cn(
                                off && 'bg-error-50 text-error-700',
                              )}
                            >
                              {formatToWeekDate(group?.date)}
                              {off &&
                                (off === 'HOLIDAY'
                                  ? ' · feriado'
                                  : ' · dia sem expediente')}
                            </TableGroupRow>
                          )
                        })()}
                        {group?.deliveries?.length
                          ? group?.deliveries?.map((deliverySchedule) => {
                              const link = `/vendas/ordens-de-servico/${deliverySchedule?.order?.id}`
                              const quotation =
                                deliverySchedule?.order?.quotation
                              const description = `${quotation?.serie?.quotation || ''}-${quotation?.serie?.code || ''} - ${truncateString(80, quotation?.description)}`
                              const clientName = `${truncateString(50, quotation?.client?.name)}`

                              const items = deliverySchedule?.items || []
                              const isExpanded = expanded.includes(
                                deliverySchedule?.id,
                              )
                              // O ícone do setor da etapa do item vem da
                              // etapa da principal com o mesmo setor
                              const iconOfSector = (sectorId: string | null) =>
                                deliverySchedule?.productionStages?.find(
                                  (stage) => stage?.stage?.id === sectorId,
                                )?.stage?.icon

                              return (
                                <Fragment key={deliverySchedule?.id}>
                                  <TableRow>
                                    <TableCell>
                                      <div className="flex items-start gap-2">
                                        {canFinishAll &&
                                          !deliverySchedule?.managedByProduction &&
                                          !['DONE', 'FINISHED'].includes(
                                            deliverySchedule?.status,
                                          ) && (
                                            <Checkbox
                                              className="mt-2.5"
                                              aria-label="Marcar o pedido para concluir as etapas"
                                              checked={selected.includes(
                                                deliverySchedule?.id,
                                              )}
                                              onCheckedChange={() =>
                                                toggleSelected(
                                                  deliverySchedule?.id,
                                                )
                                              }
                                            />
                                          )}
                                        {items.length > 0 && (
                                          <TooltipProvider>
                                            <ActionButton
                                              Icon={
                                                isExpanded
                                                  ? IconChevronDown
                                                  : IconChevronRight
                                              }
                                              tooltip={
                                                isExpanded
                                                  ? 'Recolher os itens'
                                                  : `Ver os ${items.length} itens`
                                              }
                                              onClick={() =>
                                                toggleExpanded(
                                                  deliverySchedule?.id,
                                                )
                                              }
                                            />
                                          </TooltipProvider>
                                        )}
                                        <div>
                                          <p className="font-medium text-nowrap">
                                            {clientName || '-'}
                                          </p>
                                          <Link
                                            href={link}
                                            className="text-gray hover:opacity-80 active:opacity-95 transition-opacity text-nowrap"
                                          >
                                            {description}
                                          </Link>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="w-full">
                                      {deliverySchedule?.status === 'DONE' ||
                                      deliverySchedule?.status ===
                                        'FINISHED' ? (
                                        <div className="flex gap-2 items-center">
                                          <Badge status variant="successLight">
                                            {deliverySchedule?.status ===
                                            'FINISHED'
                                              ? 'Concluído'
                                              : 'Finalizado'}
                                          </Badge>
                                        </div>
                                      ) : (
                                        <div className="flex gap-2 items-center">
                                          {showProductionStages && (
                                            <div className="flex gap-2">
                                              <TooltipProvider>
                                                {deliverySchedule?.productionStages?.map(
                                                  (stage) => {
                                                    const tooltip = `${stage?.stage?.name || 'Etapa desconhecida'} ${stageStatus[stage?.status]?.tooltip || ''}`
                                                    return (
                                                      <StageStatusDropdown
                                                        key={stage?.id}
                                                        currentStage={
                                                          stage?.stage?.id
                                                        }
                                                        rowData={stage}
                                                        searchParams={
                                                          searchParams
                                                        }
                                                        canChangeStatus={
                                                          canChangeStageStatus
                                                        }
                                                        managedByProduction={
                                                          !!deliverySchedule?.managedByProduction
                                                        }
                                                        // No LITE, a ação no
                                                        // pedido vale para os
                                                        // itens do setor (§4.7)
                                                        confirmFor={(
                                                          _next,
                                                          label,
                                                        ) => {
                                                          const count =
                                                            items.filter(
                                                              (item) =>
                                                                item.stages.some(
                                                                  (itemStage) =>
                                                                    itemStage.editable &&
                                                                    itemStage.sectorId ===
                                                                      stage
                                                                        ?.stage
                                                                        ?.id,
                                                                ),
                                                            ).length
                                                          if (count <= 1)
                                                            return null
                                                          // Num objeto de mensagens, para a
                                                          // extração de textos achar (IN-7)
                                                          const confirm = {
                                                            message: `${label}: vale para ${stage?.stage?.name} nos ${count} itens deste pedido.`,
                                                          }
                                                          return confirm.message
                                                        }}
                                                      >
                                                        <ActionButton
                                                          Icon={
                                                            sectorIcons[
                                                              stage?.stage?.icon
                                                            ]?.icon ||
                                                            IconQuestionMark
                                                          }
                                                          tooltip={tooltip}
                                                          badge={
                                                            stageStatus[
                                                              stage?.status
                                                            ]?.badge
                                                          }
                                                          variant={
                                                            stage?.status ===
                                                            'DONE'
                                                              ? 'successLight'
                                                              : 'neutralLight'
                                                          }
                                                          className="p-2"
                                                          // A cor do setor no ícone
                                                          // da etapa (área 9 §4.14)
                                                          style={
                                                            stage?.status ===
                                                            'DONE'
                                                              ? undefined
                                                              : {
                                                                  color:
                                                                    colorOf({
                                                                      id: stage
                                                                        ?.stage
                                                                        ?.id,
                                                                      name: stage
                                                                        ?.stage
                                                                        ?.name,
                                                                      icon: stage
                                                                        ?.stage
                                                                        ?.icon,
                                                                    }),
                                                                }
                                                          }
                                                        />
                                                      </StageStatusDropdown>
                                                    )
                                                  },
                                                )}
                                              </TooltipProvider>
                                            </div>
                                          )}
                                          <div
                                            className={cn(
                                              'overflow-hidden transition-[width] duration-300 ease-in-out',
                                              // Sem etapas na tela (ou sem poder trocá-las), sempre mostrar o botão
                                              // Com elas, mostrar apenas quando etapas estão concluídas
                                              !showProductionStages ||
                                                !canChangeStageStatus ||
                                                !deliverySchedule
                                                  ?.productionStages?.length ||
                                                deliverySchedule?.productionStages?.every(
                                                  (stage) =>
                                                    stage.status === 'DONE' ||
                                                    stage.status === 'CANCELED',
                                                )
                                                ? 'w-[170px]'
                                                : 'w-0',
                                            )}
                                          >
                                            <PermissionGate
                                              permissions={[
                                                'production:delivery_schedule:edit',
                                              ]}
                                            >
                                              <Button
                                                type="button"
                                                variant="success"
                                                size="md"
                                                LeftIcon={IconCircleCheck}
                                                className="whitespace-nowrap"
                                                onClick={() =>
                                                  handleFinishService(
                                                    deliverySchedule?.id,
                                                  )
                                                }
                                              >
                                                Finalizar serviço
                                              </Button>
                                            </PermissionGate>
                                          </div>
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-gray-600 relative z-30">
                                      <div className="flex gap-2">
                                        <TooltipProvider>
                                          {deliverySchedule?.financial
                                            ?.billed ? (
                                            <PermissionGate
                                              permissions={[
                                                'financial:receivable:edit',
                                              ]}
                                            >
                                              <ActionButton
                                                variant="neutralLight"
                                                gesto="editarParcelas"
                                                tooltip="Editar parcelas"
                                                onClick={() => {
                                                  setRowData(deliverySchedule)
                                                  setOpenDialog(
                                                    'edit-installments',
                                                  )
                                                }}
                                                // disabled={
                                                //   item?.expenseSource === 'EMPLOYEE'
                                                // }
                                              />
                                            </PermissionGate>
                                          ) : (
                                            <PermissionGate
                                              permissions={[
                                                'production:delivery_schedule:edit',
                                              ]}
                                            >
                                              <ActionButton
                                                variant="neutralLight"
                                                gesto="faturar"
                                                badge="errorLight"
                                                tooltip="Faturar"
                                                onClick={() => {
                                                  setRowData(deliverySchedule)
                                                  setOpenDialog('billing')
                                                }}
                                              />
                                            </PermissionGate>
                                          )}
                                          <ActionButton
                                            Icon={IconReceitaFederal}
                                            tooltip={
                                              invoiceStatus[
                                                deliverySchedule?.financial
                                                  ?.invoiceStatus
                                              ]?.tooltip || 'NF'
                                            }
                                            badge={
                                              invoiceStatus[
                                                deliverySchedule?.financial
                                                  ?.invoiceStatus
                                              ]?.badge
                                            }
                                            variant={
                                              invoiceStatus[
                                                deliverySchedule?.financial
                                                  ?.invoiceStatus
                                              ]?.badge === 'successLight'
                                                ? 'successLight'
                                                : 'neutralLight'
                                            }
                                            onClick={handleInvoice}
                                          />
                                        </TooltipProvider>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex justify-end gap-1">
                                        <TooltipProvider>
                                          <PermissionGate
                                            permissions={[
                                              'production:delivery_schedule:edit',
                                            ]}
                                          >
                                            <ActionButton
                                              gesto="observacao"
                                              tooltip="Observações"
                                              onClick={() => {
                                                setRowData(deliverySchedule)
                                                setOpenDialog('notes')
                                              }}
                                              badge={
                                                deliverySchedule?.notes
                                                  ? 'warningLight'
                                                  : undefined
                                              }
                                            />
                                          </PermissionGate>
                                          <PermissionGate
                                            permissions={[
                                              'production:delivery_schedule:edit',
                                            ]}
                                          >
                                            <ActionButton
                                              Icon={IconCalendarRepeat}
                                              tooltip="Data"
                                              onClick={() => {
                                                setRowData(deliverySchedule)
                                                setOpenDialog('date')
                                              }}
                                            />
                                          </PermissionGate>
                                          <ActionButton
                                            gesto="imprimir"
                                            tooltip="Imprimir"
                                            onClick={() =>
                                              handleGeneratePDF(
                                                deliverySchedule,
                                              )
                                            }
                                            isLoading={isLoadingPDF.includes(
                                              deliverySchedule?.id,
                                            )}
                                          />
                                          <ActionButton
                                            link={link}
                                            gesto="ver"
                                            tooltip="Ver ordem de serviço"
                                          />
                                        </TooltipProvider>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                  {/* O segundo nível (área 9 §4.7): cada item
                                    pelo nome, com a medida e as suas etapas;
                                    a principal é a união dos setores */}
                                  {isExpanded &&
                                    items.map((item) => (
                                      <TableRow
                                        key={item.id}
                                        className="bg-gray-50 hover:bg-gray-50"
                                      >
                                        <TableCell className="pl-14">
                                          <p className="text-sm text-gray-800">
                                            {item.name || 'Item'}
                                          </p>
                                          <p className="text-xs text-gray">
                                            {item.measure}
                                          </p>
                                        </TableCell>
                                        <TableCell colSpan={3}>
                                          {item.stages.length ? (
                                            <div className="flex gap-2">
                                              <TooltipProvider>
                                                {item.stages.map((stage) => {
                                                  const button = (
                                                    <ActionButton
                                                      key={stage.id}
                                                      Icon={
                                                        sectorIcons[
                                                          iconOfSector(
                                                            stage.sectorId,
                                                          ) || ''
                                                        ]?.icon ||
                                                        IconQuestionMark
                                                      }
                                                      tooltip={`${stage.name} · ${stage.sector} ${stageStatus[stage.status]?.tooltip || ''}`}
                                                      badge={
                                                        stageStatus[
                                                          stage.status
                                                        ]?.badge
                                                      }
                                                      variant={
                                                        stage.status === 'DONE'
                                                          ? 'successLight'
                                                          : 'neutralLight'
                                                      }
                                                      className="p-2"
                                                      style={
                                                        stage.status === 'DONE'
                                                          ? undefined
                                                          : {
                                                              color: colorOf({
                                                                id: stage.sectorId,
                                                                name: stage.sector,
                                                                icon:
                                                                  iconOfSector(
                                                                    stage.sectorId,
                                                                  ) || null,
                                                              }),
                                                            }
                                                      }
                                                    />
                                                  )
                                                  // A etapa do item se troca
                                                  // aqui quando a venda não
                                                  // segue o gerenciador (§4.7)
                                                  return stage.editable ? (
                                                    <StageStatusDropdown
                                                      key={stage.id}
                                                      currentStage={
                                                        stage.sectorId || ''
                                                      }
                                                      rowData={{
                                                        id: stage.id,
                                                        stage: {
                                                          id:
                                                            stage.sectorId ||
                                                            '',
                                                          name: stage.sector,
                                                          icon:
                                                            iconOfSector(
                                                              stage.sectorId,
                                                            ) || '',
                                                        },
                                                        status: stage.status,
                                                        prevStatus:
                                                          stage.prevStatus ||
                                                          '',
                                                        notes:
                                                          stage.notes || '',
                                                      }}
                                                      searchParams={
                                                        searchParams
                                                      }
                                                      canChangeStatus={
                                                        canChangeStageStatus
                                                      }
                                                      route={`/sale/production-stage/item/${stage.id}`}
                                                    >
                                                      {button}
                                                    </StageStatusDropdown>
                                                  ) : (
                                                    button
                                                  )
                                                })}
                                              </TooltipProvider>
                                            </div>
                                          ) : (
                                            <span className="text-xs text-gray">
                                              {showProductionStages
                                                ? 'As etapas deste item seguem as da ordem.'
                                                : ''}
                                            </span>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </Fragment>
                              )
                            })
                          : null}
                      </Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
              <DeliveryScheduleNotesDialog
                open={openDialog === 'notes'}
                setOpen={setOpenDialog}
                rowData={rowData}
                searchParams={searchParams}
              />
              <DeliveryScheduleDateDialog
                open={openDialog === 'date'}
                setOpen={setOpenDialog}
                rowData={rowData}
                searchParams={searchParams}
              />
              <BillServiceDialog
                open={openDialog === 'billing'}
                setOpen={setOpenDialog}
                rowData={rowData}
                searchParams={searchParams}
              />
              {rowData?.financial?.data && (
                <EditInstallments
                  open={openDialog === 'edit-installments'}
                  setOpen={setOpenDialog}
                  rowData={rowData.financial.data}
                  type="receivable"
                />
              )}
            </>
          ) : (
            <FilteredDataEmpty
              title="Entrega não encontrada"
              description="Sua busca não encontrou nenhum resultado. Tente novamente."
            />
          )}
        </FetchingRegion>
      </CardContent>
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            lastPage={data?.lastPage}
            isLoading={isLoading}
          />
        </CardFooter>
      ) : null}
    </>
  )
}
