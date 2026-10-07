'use client'

// React / Next
import { useMemo, useState } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { DistributionData } from './DistributionData'
import { SectorAllocations } from './SectorAllocations'
import { AdministrativeCostTable } from './AdministrativeCostTable'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'
import { DistributionSummaryCards } from './DistributionSummaryCards'
import { formatPercent } from '@/components/common/RateInput'

// Actions
import {
  getDistribution,
  updateDistribution,
  getDistributionTotals,
} from '@/actions/cost-base'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconArrowsSplit2 } from '@tabler/icons-react'

export function Distribution() {
  const queryClient = useQueryClient()
  const [percentages, setPercentages] = useState<Record<string, number>>({})

  const { data: totals, isLoading: isLoadingTotals } = useQuery({
    staleTime: Infinity,
    queryKey: ['cost-distribution-totals'],
    queryFn: () => getDistributionTotals(),
  })

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['cost-distribution'],
    queryFn: async () => {
      const response = await getDistribution()

      setPercentages(
        Object.fromEntries(
          (response.data?.sectors || []).map((sector) => [
            sector.id,
            sector.percentage,
          ]),
        ),
      )

      return response
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateDistribution({
        percentages: Object.entries(percentages).map(([id, percentage]) => ({
          id,
          percentage,
        })),
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Distribuição salva')
      queryClient.invalidateQueries({ queryKey: ['cost-distribution'] })
      queryClient.invalidateQueries({ queryKey: ['cost-distribution-totals'] })
    },
    onError: () => toast.error('Erro ao salvar a distribuição'),
  })

  const sectors = useMemo(() => data?.data?.sectors || [], [data])

  const administrative = sectors.filter(
    (sector) => sector.nature === 'ADMINISTRATIVE',
  )
  const productive = sectors.filter((sector) => sector.nature === 'PRODUCTIVE')

  // Todos os administrativos formam um total único, que é o que pode ser
  // rateado entre os produtivos (BC-7)
  const administrativeCost = administrative.reduce(
    (sum, sector) => sum + (sector.directCost || 0),
    0,
  )

  // O fechamento é conferido pelo valor, em centavos, e não pelo percentual
  // exibido, com tolerância de 1 centavo (design.md §6.8 e §7)
  const distributedCost = productive.reduce(
    (sum, sector) =>
      sum +
      Math.round((administrativeCost * (percentages[sector.id] ?? 0)) / 100),
    0,
  )
  const distributedPercentage = productive.reduce(
    (sum, sector) => sum + (percentages[sector.id] ?? 0),
    0,
  )
  const difference = administrativeCost - distributedCost
  const exceeded = administrativeCost
    ? difference < -1
    : distributedPercentage > 100
  const closed = administrativeCost
    ? Math.abs(difference) <= 1
    : distributedPercentage === 100

  const percentLabel = (value: number) => `${formatPercent(Math.abs(value))}%`
  const statusLabel = exceeded
    ? `Passou ${percentLabel(distributedPercentage - 100)} · ${formatCurrencyToBrl(-difference)}`
    : closed
      ? '100% distribuído'
      : `Faltam ${percentLabel(100 - distributedPercentage)}${administrativeCost ? ` · ${formatCurrencyToBrl(difference)}` : ''}`

  const handleChange = (id: string, percentage: number) =>
    setPercentages((current) => ({
      ...current,
      [id]: Math.min(Math.max(percentage || 0, 0), 100),
    }))

  return (
    <div className="space-y-5">
      <DistributionSummaryCards
        totals={totals?.data}
        isLoading={isLoadingTotals}
      />
      <Card>
        <CardHeader>
          <CardTitle>Distribuição dos custos indiretos</CardTitle>
          <CardDescription>
            Escolha quanto do custo administrativo cada setor produtivo recebe.
            Distribuir é opcional: pelo método do custo puro, o padrão é deixar
            o administrativo fora do custo dos setores e cobri-lo com o
            resultado das vendas.
          </CardDescription>
        </CardHeader>
        {isLoading ? (
          <TableSkeleton cols={5} rows={8} />
        ) : !sectors.length ? (
          <ListDataTotalEmpty
            icon={IconArrowsSplit2}
            title="Nenhum setor cadastrado"
            description="Cadastre os setores da empresa para distribuir o custo administrativo."
          />
        ) : (
          <>
            <CardContent className="space-y-8 px-6 pb-6">
              <AdministrativeCostTable
                sectors={administrative}
                total={administrativeCost}
              />
              <DistributionData
                sectors={productive}
                percentages={percentages}
                administrativeCost={administrativeCost}
                onChange={handleChange}
              />
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    exceeded
                      ? 'errorLight'
                      : closed
                        ? 'successLight'
                        : 'neutralLight'
                  }
                >
                  {statusLabel}
                </Badge>
                <span className="text-sm text-gray">
                  {distributedPercentage === 0
                    ? 'Nenhum custo administrativo está sendo distribuído.'
                    : 'O que não for distribuído fica fora do custo dos setores.'}
                </span>
              </div>
              <PermissionGate permissions={['cost:base:edit']}>
                <Button
                  disabled={exceeded}
                  isLoading={isPending}
                  onClick={() => mutate()}
                >
                  {isPending ? 'Salvando...' : 'Salvar distribuição'}
                </Button>
              </PermissionGate>
            </CardFooter>
          </>
        )}
      </Card>
      <SectorAllocations />
    </div>
  )
}
