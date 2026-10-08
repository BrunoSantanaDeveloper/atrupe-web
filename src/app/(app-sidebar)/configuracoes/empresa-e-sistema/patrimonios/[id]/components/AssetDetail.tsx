'use client'

// React / Next
import Image from 'next/image'

// React / Next
import { useState } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { NewCostModal } from './NewCostModal'
import { NewSetupModal } from './NewSetupModal'
import { SellAssetModal } from './SellAssetModal'
import { EditAssetModal } from './EditAssetModal'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Hooks / Store
import { useAlertDialog } from '@/store/useAlertDialog'

// Actions
import { getAsset, setAssetActive } from '@/actions/assets'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import {
  costNatureObj,
  assetUnitShort,
  assetLifeStatusObj,
} from '@/consts/assets'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconBan,
  IconRestore,
  IconPencil,
  IconChartPie,
  IconCurrencyReal,
} from '@tabler/icons-react'

interface Props {
  id: string
}

// Sem valor calculado mostra `-`, nunca R$ 0,00 (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

const formatDate = (date: string | null) =>
  date ? new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR') : '-'

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)

  return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

export function AssetDetail({ id }: Props) {
  const [editing, setEditing] = useState(false)
  const alertDialog = useAlertDialog()
  const queryClient = useQueryClient()

  // Registro com histórico é inativado, não excluído: o patrimônio tem
  // depreciação, custos e configurações usadas em composições
  const toggleActive = () => {
    const isInactive = asset?.status === 'INACTIVE'

    alertDialog.open({
      title: isInactive ? 'Reativar patrimônio' : 'Inativar patrimônio',
      description: isInactive
        ? 'O bem volta a depreciar e a aparecer nas listas e composições.'
        : 'O bem para de depreciar e deixa de aparecer nas composições. O histórico é preservado, e ele pode ser reativado depois.',
      confirmLabel: isInactive ? 'Reativar' : 'Inativar',
      onConfirm: async () => {
        const response = await setAssetActive({ id, active: isInactive })

        if (!response.success) {
          toast.error(response.message)

          return
        }

        toast.success(
          isInactive ? 'Patrimônio reativado' : 'Patrimônio inativado',
        )
        queryClient.invalidateQueries({ queryKey: ['asset', id] })
        queryClient.invalidateQueries({ queryKey: ['assets'] })
      },
    })
  }
  const [selling, setSelling] = useState(false)

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['asset', id],
    queryFn: () => getAsset({ id }),
  })

  const asset = data?.data

  if (isLoading) {
    return <Skeleton className="h-[calc(100vh-150px)]" />
  }

  if (!asset) {
    return <div className="p-4">Patrimônio não encontrado.</div>
  }

  const summary = [
    { label: 'Data da aquisição', value: formatDate(asset.acquisitionDate) },
    {
      label: 'Valor da aquisição',
      value: formatCurrencyToBrl(asset.acquisitionValue),
    },
    {
      label: 'Vida útil',
      value: asset.usefulLifeMonths ? `${asset.usefulLifeMonths} meses` : '-',
    },
    { label: 'Valor residual', value: formatValue(asset.residualValue) },
    {
      label: 'Depreciação mensal',
      value:
        asset.monthlyDepreciation === null
          ? 'Não calculada'
          : formatCurrencyToBrl(asset.monthlyDepreciation),
    },
  ]

  const costsByNature = (
    ['FIXED', 'MACHINE_VARIABLE', 'SETUP_VARIABLE'] as const
  ).map((nature) => ({
    nature,
    costs: asset.costs.filter((cost) => cost.nature === nature),
  }))

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title={asset.name}
          previousPage="/configuracoes/empresa-e-sistema/patrimonios"
          badge={assetLifeStatusObj[asset.status]}
          supportText={`${asset.sector}${asset.detailed && asset.unit ? ` · ${assetUnitShort[asset.unit]}` : ' · cadastro simplificado'}`}
          primaryCta={
            <PermissionGate permissions={['cost:base:edit']}>
              <div className="flex gap-2">
                <ActionButton
                  Icon={IconCurrencyReal}
                  tooltip="Vender patrimônio"
                  onClick={() => setSelling(true)}
                />
                <ActionButton
                  Icon={IconPencil}
                  tooltip="Editar patrimônio"
                  onClick={() => setEditing(true)}
                />
                <ActionButton
                  Icon={asset.status === 'INACTIVE' ? IconRestore : IconBan}
                  tooltip={
                    asset.status === 'INACTIVE'
                      ? 'Reativar patrimônio'
                      : 'Inativar patrimônio'
                  }
                  onClick={() => toggleActive()}
                />
              </div>
            </PermissionGate>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
            <CardDescription>
              A depreciação vem de (aquisição − residual) ÷ vida útil.
              {asset.monthlyDepreciation === null &&
                ' Preencha vida útil e residual para calcular.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {asset.imageUrl && (
              <div className="relative mb-5 h-40 w-full max-w-[280px] overflow-hidden rounded-lg border border-gray-200">
                <Image
                  fill
                  unoptimized
                  src={asset.imageUrl}
                  alt={asset.name}
                  className="object-cover"
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {summary.map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {asset.detailed ? (
          <>
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>Centro de custos</CardTitle>
                  <CardDescription>
                    Cada custo aponta para uma conta do plano de contas, o que
                    permite comparar o estimado com o realizado.
                  </CardDescription>
                </div>
                <PermissionGate permissions={['cost:base:edit']}>
                  <NewCostModal asset={asset} />
                </PermissionGate>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                {costsByNature.map(({ nature, costs }) => (
                  <div key={nature} className="space-y-2">
                    <p className="text-sm font-medium">
                      {costNatureObj[nature]}
                    </p>
                    {costs.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-[30%]">Custo</TableHead>
                            <TableHead className="w-[22%]">Regra</TableHead>
                            <TableHead className="w-[26%]">
                              Plano de contas
                            </TableHead>
                            <TableHead className="w-[12%]">
                              Última ocorrência
                            </TableHead>
                            <TableHead className="w-[10%] text-right">
                              Por mês
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {costs.map((cost) => (
                            <TableRow key={cost.id}>
                              <TableCell className="font-medium">
                                {cost.name}
                              </TableCell>
                              <TableCell className="text-sm text-gray">
                                {formatCurrencyToBrl(cost.unitCost)} a cada{' '}
                                {cost.yieldAmount}{' '}
                                {cost.yieldUnit === 'MONTH'
                                  ? 'meses'
                                  : asset.unit
                                    ? assetUnitShort[asset.unit]
                                    : 'unidades'}
                              </TableCell>
                              <TableCell className="text-sm text-gray">
                                {cost.chartAccount}
                              </TableCell>
                              <TableCell className="text-sm text-gray">
                                {formatDate(cost.lastOccurrence)}
                              </TableCell>
                              <TableCell numeric>
                                {formatCurrencyToBrl(cost.monthlyCost)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-gray py-2">
                        Nenhum custo lançado.
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>Configurações produtivas</CardTitle>
                  <CardDescription>
                    A produtividade de referência do bem é a soma das
                    configurações. O custo da máquina é repartido entre elas
                    pelo tempo de atividade.
                  </CardDescription>
                </div>
                <PermissionGate permissions={['cost:base:edit']}>
                  <NewSetupModal asset={asset} />
                </PermissionGate>
              </CardHeader>
              <CardContent>
                {asset.setups.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[24%]">Configuração</TableHead>
                        <TableHead className="w-[16%]">
                          Tempo por unidade
                        </TableHead>
                        <TableHead className="w-[18%] text-right">
                          Produtividade
                        </TableHead>
                        <TableHead className="w-[14%] text-right">
                          Tempo em atividade
                        </TableHead>
                        <TableHead numeric className="w-[12%]">
                          Custo
                        </TableHead>
                        <TableHead numeric className="w-[12%]">
                          Preço de venda
                        </TableHead>
                        <TableHead className="w-[4%]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {asset.setups.map((setup) => (
                        <TableRow key={setup.id}>
                          <TableCell>
                            <p className="font-medium">{setup.name}</p>
                            <p className="text-sm text-gray">
                              {setup.abbreviation}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatTime(setup.timePerUnit)} por{' '}
                            {assetUnitShort[setup.unit]}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {setup.monthlyProductivity}{' '}
                            {assetUnitShort[setup.unit]}/mês
                          </TableCell>
                          <TableCell className="text-right text-sm text-gray">
                            {Math.round(
                              (setup.timePerUnit * setup.monthlyProductivity) /
                                60,
                            )}{' '}
                            h/mês
                          </TableCell>
                          <TableCell numeric>
                            {formatValue(setup.unitCost)}
                          </TableCell>
                          <TableCell numeric>
                            {formatValue(setup.salePrice)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <ActionButton
                                Icon={IconChartPie}
                                tooltip={`Configurar custos — ${setup.name}`}
                              />
                              <ActionButton
                                Icon={IconCurrencyReal}
                                tooltip={`Precificar ${setup.name}`}
                                link="/precificacao/maquinas"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-gray">
                    Nenhuma configuração produtiva cadastrada.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usado nos processos</CardTitle>
                <CardDescription>
                  Processos que usam este bem. O processo é criado na
                  composição, não aqui.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {asset.processes.length ? (
                  <ul className="space-y-2">
                    {asset.processes.map((process) => (
                      <li
                        key={process.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium">{process.name}</span>
                        <Badge variant="neutralLight">{process.taskType}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray">
                    Este bem ainda não é usado em nenhum processo.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Cadastro simplificado</CardTitle>
              <CardDescription>
                Este bem entra no custo do setor só pela depreciação. Para ter
                custo por unidade, configurações produtivas e preço, detalhe o
                cadastro na edição.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <EditAssetModal
          asset={asset}
          open={editing}
          onOpenChange={() => setEditing(false)}
        />
        <SellAssetModal
          asset={asset}
          open={selling}
          onOpenChange={() => setSelling(false)}
        />
      </div>
    </TooltipProvider>
  )
}
