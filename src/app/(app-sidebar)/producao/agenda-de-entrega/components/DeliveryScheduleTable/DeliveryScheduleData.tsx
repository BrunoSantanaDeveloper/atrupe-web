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
import { getDataOld, getItem, updateItem } from '@/actions/_cruds'

// Libs
import { cn, truncateString } from '@/lib/utils'
import { formatToWeekDate } from '@/lib/formatDate'

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
  IconSearch,
  IconPrinter,
  IconRefreshDot,
  IconMessage,
  IconCircleCheck,
  IconQuestionMark,
  IconCalendarRepeat,
} from '@tabler/icons-react'
import { IconReceitaFederal } from '@/assets/icons/CustomIcons'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

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
  const [isLoadingPDF, setIsLoadingPDF] = useState<string[]>([])

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
      queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
      queryClient.invalidateQueries({ queryKey: ['delivery-schedule-totals'] })
    },
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
                        <TableGroupRow>
                          {formatToWeekDate(group?.date)}
                        </TableGroupRow>
                        {group?.deliveries?.length
                          ? group?.deliveries?.map((deliverySchedule) => {
                              const link = `/vendas/ordens-de-servico/${deliverySchedule?.order?.id}`
                              const quotation =
                                deliverySchedule?.order?.quotation
                              const description = `${quotation?.serie?.quotation || ''}-${quotation?.serie?.code || ''} - ${truncateString(80, quotation?.description)}`
                              const clientName = `${truncateString(50, quotation?.client?.name)}`

                              return (
                                <TableRow key={deliverySchedule?.id}>
                                  <TableCell>
                                    <p className="font-medium text-nowrap">
                                      {clientName || '-'}
                                    </p>
                                    <Link
                                      href={link}
                                      className="text-gray hover:opacity-80 active:opacity-95 transition-opacity text-nowrap"
                                    >
                                      {description}
                                    </Link>
                                  </TableCell>
                                  <TableCell className="w-full">
                                    {deliverySchedule?.status === 'DONE' ||
                                    deliverySchedule?.status === 'FINISHED' ? (
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
                                                                color: colorOf({
                                                                  id: stage
                                                                    ?.stage?.id,
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
                                        </div>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-gray-600 relative z-30">
                                    <div className="flex gap-2">
                                      <TooltipProvider>
                                        {deliverySchedule?.financial?.billed ? (
                                          <PermissionGate
                                            permissions={[
                                              'financial:receivable:edit',
                                            ]}
                                          >
                                            <ActionButton
                                              variant="neutralLight"
                                              Icon={IconRefreshDot}
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
                                              Icon={IconRefreshDot}
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
                                            Icon={IconMessage}
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
                                          Icon={IconPrinter}
                                          tooltip="Imprimir"
                                          onClick={() =>
                                            handleGeneratePDF(deliverySchedule)
                                          }
                                          isLoading={isLoadingPDF.includes(
                                            deliverySchedule?.id,
                                          )}
                                        />
                                        <ActionButton
                                          link={link}
                                          Icon={IconSearch}
                                          tooltip="Ver ordem de serviço"
                                        />
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
