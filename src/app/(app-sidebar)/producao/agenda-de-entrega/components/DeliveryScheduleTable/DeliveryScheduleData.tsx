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
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { DeliveryScheduleDateDialog } from '../Actions/ScheduleDate'
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
} from '@/components/ui/table'
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
import { getDataOld, updateItem } from '@/actions/_cruds'

// Libs
import { cn, truncateString } from '@/lib/utils'
import { formatToWeekDate } from '@/lib/formatDate'

// Third-party
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'

// Icons
import {
  // IconUserUp,
  IconSearch,
  IconPrinter,
  IconMoneybag,
  IconMessage,
  IconRefreshDot,
  IconCircleCheck,
  IconQuestionMark,
  // IconPackageExport,
  IconCalendarRepeat,
} from '@tabler/icons-react'
import { IconReceitaFederal } from '@/assets/icons/CustomIcons'

// Consts
import { sectorIcons } from '@/consts/sectors'
import { stageStatus, invoiceStatus } from '@/consts/deliverySchedule'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
}

export function DeliveryScheduleData({ searchParams, tabs }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<DeliveryScheduleType>()

  const alertDialog = useAlertDialog()

  const queryClient = useQueryClient()

  const status =
    tabs?.find((tab) => tab.tab === searchParams.status)?.value || ''

  const filters = { ...searchParams, status }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
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
      queryClient.invalidateQueries()
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

  return (
    <>
      <CardContent>
        {isLoading ? (
          <TableSkeleton cols={6} />
        ) : hasData ? (
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
                {deliveryScheduleArray.map((group) => (
                  <Fragment key={group.date}>
                    <TableRow className="bg-gray-100">
                      <TableCell
                        colSpan={6}
                        className="text-gray font-medium text-xs py-3"
                      >
                        {formatToWeekDate(group?.date)}
                      </TableCell>
                    </TableRow>
                    {group?.deliveries?.length
                      ? group?.deliveries?.map((deliverySchedule) => {
                          const link = `/vendas/ordens-de-servico/${deliverySchedule?.order?.id}`
                          const quotation = deliverySchedule?.order?.quotation
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
                                      {deliverySchedule?.status === 'FINISHED'
                                        ? 'Concluído'
                                        : 'Finalizado'}
                                    </Badge>
                                  </div>
                                ) : (
                                  <div className="flex gap-2 items-center">
                                    <div className="flex gap-2">
                                      <TooltipProvider>
                                        {deliverySchedule?.productionStages?.map(
                                          (stage) => {
                                            const tooltip = `${stage?.stage?.name || 'Etapa desconhecida'} ${stageStatus[stage?.status]?.tooltip || ''}`
                                            return (
                                              <StageStatusDropdown
                                                key={stage?.id}
                                                currentStage={stage?.stage?.id}
                                                rowData={stage}
                                                searchParams={searchParams}
                                              >
                                                <ActionButton
                                                  Icon={
                                                    sectorIcons[
                                                      stage?.stage?.icon
                                                    ] || IconQuestionMark
                                                  }
                                                  tooltip={tooltip}
                                                  badge={
                                                    stageStatus[stage?.status]
                                                      ?.badge
                                                  }
                                                  variant={
                                                    stage?.status === 'DONE'
                                                      ? 'successLight'
                                                      : 'neutralLight'
                                                  }
                                                  className="p-2"
                                                />
                                              </StageStatusDropdown>
                                            )
                                          },
                                        )}
                                      </TooltipProvider>
                                    </div>
                                    <div
                                      className={cn(
                                        'overflow-hidden transition-[width] duration-300 ease-in-out',
                                        !deliverySchedule?.productionStages
                                          ?.length ||
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
                                      <ActionButton
                                        variant="neutralLight"
                                        Icon={IconRefreshDot}
                                        tooltip="Editar parcelas"
                                        onClick={() => {
                                          setRowData(deliverySchedule)
                                          setOpenDialog('edit-installments')
                                        }}
                                      />
                                    ) : (
                                      <ActionButton
                                        variant="neutralLight"
                                        Icon={IconMoneybag}
                                        badge="errorLight"
                                        tooltip="Faturar"
                                        onClick={() => {
                                          setRowData(deliverySchedule)
                                          setOpenDialog('billing')
                                        }}
                                      />
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
                                    <ActionButton
                                      Icon={IconCalendarRepeat}
                                      tooltip="Data"
                                      onClick={() => {
                                        setRowData(deliverySchedule)
                                        setOpenDialog('date')
                                      }}
                                    />
                                    <ActionButton
                                      Icon={IconPrinter}
                                      tooltip="Imprimir"
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
                ))}
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
      </CardContent>
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            lastPage={data?.lastPage}
          />
        </CardFooter>
      ) : null}
    </>
  )
}
