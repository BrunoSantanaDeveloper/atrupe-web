'use client'

import { useState } from 'react'

// Components
import { EditItemDialog } from './EditItem'
import { NewSerieDialog } from './NewSerie'
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { TextSupportingText } from '@/components/common/TextSupportingText'
import { DetailCardRowItem } from '@/app/(app-sidebar)/cadastros/clientes/[id]/components/DetailCardRowItem'
import { PermissionGate } from '@/components/common/PermissionGate'

// UI
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Icons
import { IconSettings, IconPlus } from '@tabler/icons-react'

// Actions
import { getDataOld, updateItemNew } from '@/actions/_cruds'

// Third-party
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Types
import { SaleSeriesType } from '@/types/settings/saleSeries'
import { WipeTrainingDataAlertDialog } from './WipeTrainingData'

export function Main() {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<SaleSeriesType>()
  const [togglingId, setTogglingId] = useState<string>()

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['sale-series-list', {}],
    queryFn: () => getDataOld({ route: 'saleSeriesRoute' }),
  })

  const series: SaleSeriesType[] = data?.data || []
  const hasData = !!series

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateItemNew({ route: `/sale/series/${id}`, data: { isActive } }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Status alterado.')
      setTogglingId(undefined)
    },
    onError: () => {
      toast.error('Ocorreu um erro.')
      setTogglingId(undefined)
    },
  })

  return (
    <PermissionGate permissions={['sales_settings:series:view']}>
      <div className="space-y-5">
        <Topbar
          title="Série de vendas"
          previousPage="/configuracoes/vendas"
          primaryCta={
            <PermissionGate permissions={['sales_settings:series:edit']}>
              <Button
                variant="default"
                size="sm"
                LeftIcon={IconPlus}
                onClick={() => setOpenDialog('new')}
              >
                Nova série
              </Button>
            </PermissionGate>
          }
        />
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
                      <CardTitle>
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
                      {item?.isDefault && (
                        <Badge variant="blueLight">Padrão</Badge>
                      )}
                      {item?.allowedProfiles?.length > 0 && (
                        <Badge variant="neutralLight">
                          {`${item.allowedProfiles.length} perfil${item.allowedProfiles.length > 1 ? 'is' : ''} restrito${item.allowedProfiles.length > 1 ? 's' : ''}`}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <TooltipProvider>
                        {item?.isTraining && (
                          // A API exige editar séries para apagar os dados
                          // de treinamento; o botão ficava para quem só via
                          <PermissionGate
                            permissions={['sales_settings:series:edit']}
                          >
                            <ActionButton
                              variant="errorLight"
                              gesto="excluir"
                              tooltip="Apagar todos os orçamentos, O.S e movimentações."
                              onClick={() => {
                                setOpenDialog('wipe')
                                setRowData(item)
                              }}
                            />
                          </PermissionGate>
                        )}
                        <PermissionGate
                          permissions={['sales_settings:series:edit']}
                        >
                          <ActionButton
                            variant={
                              item?.isActive ? 'errorLight' : 'successLight'
                            }
                            gesto={item?.isActive ? 'inativar' : 'reativar'}
                            tooltip={
                              item?.isActive ? 'Inativar série' : 'Ativar série'
                            }
                            isLoading={
                              toggleActiveMutation.isPending &&
                              togglingId === item.id
                            }
                            onClick={() => {
                              setTogglingId(item.id)
                              toggleActiveMutation.mutate({
                                id: item.id,
                                isActive: !item.isActive,
                              })
                            }}
                          />
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
                  <DetailCardRowItem showSeparator={false} className="pb-4">
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
                    {item?.allowedProfiles?.length > 0 && (
                      <TextSupportingText
                        supporting="Perfis com acesso"
                        text={item.allowedProfiles
                          .map((p) => p.name)
                          .join(', ')}
                      />
                    )}
                  </DetailCardRowItem>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <div className="py-4 px-6 text-sm text-gray">
                Nenhuma série de venda encontrada
              </div>
            </Card>
          )}
        </div>
        <EditItemDialog
          open={openDialog === 'edit'}
          setOpen={setOpenDialog}
          rowData={rowData}
        />
        <NewSerieDialog open={openDialog === 'new'} setOpen={setOpenDialog} />
        <WipeTrainingDataAlertDialog
          open={openDialog === 'wipe'}
          setOpen={setOpenDialog}
          rowData={rowData}
        />
      </div>
    </PermissionGate>
  )
}
