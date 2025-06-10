'use client'

import { useState } from 'react'

// Components
import { EditItemDialog } from './EditItem'
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { TextSupportingText } from '@/components/common/TextSupportingText'
import { DetailCardRowItem } from '@/app/(app)/cadastros/clientes/[id]/components/DetailCardRowItem'
import { PermissionGate } from '@/components/common/PermissionGate'

// UI
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Icons
import { IconEraser, IconSettings } from '@tabler/icons-react'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Types
import { SaleSeriesType } from '@/types/settings/saleSeries'
import { WipeTrainingDataAlertDialog } from './WipeTrainingData'

export function Main() {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<SaleSeriesType>()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['sale-series-list', {}],
    queryFn: () => getDataOld({ route: 'saleSeriesRoute' }),
  })

  const series: SaleSeriesType[] = data?.data || []
  const hasData = !!series

  return (
    <PermissionGate permissions={['sales_settings:series:view']}>
      <div className="space-y-5">
        <Topbar title="Série de vendas" previousPage="/configuracoes/vendas" />
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="w-full">
                <CardHeader>
                  <div className="flex gap-3 items-center">
                    <Skeleton className="h-6 w-5" />
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="size-[38px] ml-auto" />
                  </div>
                </CardHeader>
                <Separator className="mb-2" />
                <CardContent className="h-32"></CardContent>
              </Card>
            ))
          ) : hasData ? (
            series.map((item) => (
              <Card key={item.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between">
                    <div className="flex gap-3 items-center">
                      <CardTitle className="text-gray-700 font-semibold">
                        {`${item?.code || ''} - ${item?.description || ''}`}
                      </CardTitle>
                      <Badge
                        status
                        variant={
                          item?.isActive ? 'successLight' : 'neutralLight'
                        }
                      >
                        {item?.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex gap-3">
                      <TooltipProvider>
                        {item?.isTraining && (
                          <ActionButton
                            variant="neutralLight"
                            Icon={IconEraser}
                            tooltip="Apagar todos os orçamentos, O.S e movimentações."
                            onClick={() => {
                              setOpenDialog('wipe')
                              setRowData(item)
                            }}
                          />
                        )}
                        <TooltipProvider>
                          <PermissionGate
                            permissions={['sales_settings:series:edit']}
                          >
                            <ActionButton
                              variant="neutralLight"
                              Icon={IconSettings}
                              tooltip="Configurar"
                              onClick={() => {
                                setOpenDialog('edit')
                                setRowData(item)
                              }}
                            />
                          </PermissionGate>
                        </TooltipProvider>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardHeader>
                <Separator className="mb-4" />
                <CardContent>
                  <DetailCardRowItem>
                    <TextSupportingText
                      supporting="Número orçamento atual"
                      text={String(item?.currentBudgetNumber || '-')}
                    />
                    <TextSupportingText
                      supporting="Nomenclatura"
                      text={item?.title || '-'}
                    />
                    <TextSupportingText
                      supporting="Validade da proposta"
                      text={`${item?.proposalValidity || '0'} dias`}
                    />
                    <TextSupportingText
                      supporting="Prazo de entrega"
                      text={`${item?.deliveryDeadline || '0'} dias`}
                    />
                  </DetailCardRowItem>
                  <DetailCardRowItem showSeparator={false}>
                    <TextSupportingText
                      supporting="Faturamento"
                      text={item?.billing?.label || '-'}
                    />
                    <TextSupportingText
                      supporting="Envio para produção"
                      text={item?.sendToProduction?.label || '-'}
                    />
                    <TextSupportingText
                      supporting="Status de produção"
                      text={item?.productionStatus?.label || '-'}
                    />
                  </DetailCardRowItem>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <div className="py-4 px-6 text-sm text-gray">
                Nenhuma serie de venda encontrada
              </div>
            </Card>
          )}
        </div>
        <EditItemDialog
          open={openDialog === 'edit'}
          setOpen={setOpenDialog}
          rowData={rowData}
        />
        <WipeTrainingDataAlertDialog
          open={openDialog === 'wipe'}
          setOpen={setOpenDialog}
          rowData={rowData}
        />
      </div>
    </PermissionGate>
  )
}
