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
import { LoadError } from '../../components/LoadError'
import { AdministrativeCostTable } from './AdministrativeCostTable'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'
import { DistributionSummaryCards } from './DistributionSummaryCards'
import { formatPercent } from '@/components/common/RateInput'

// Actions
import { getDistribution, updateDistribution } from '@/actions/cost-base'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { formatReferenceMonth } from '../../reference-month'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconArrowsSplit2 } from '@tabler/icons-react'

// O recebido de cada setor muda o Por setor, o Resumo, a Mão de obra e o
// rateio entre os equipamentos
const AFFECTED_QUERIES = [
  'sector-costs',
  'cost-summary',
  'labor-sectors',
  'sector-allocations',
]

export function Distribution() {
  const queryClient = useQueryClient()
  // O que foi mexido e ainda não foi salvo. Fica fora da leitura: quando
  // outra tela invalida a distribuição e ela é lida de novo, a edição continua
  const [edited, setEdited] = useState<Record<string, number>>()

  // Setores e totais vêm juntos na mesma resposta
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['cost-distribution'],
    queryFn: () => getDistribution(),
  })

  const sectors = useMemo(() => data?.data?.sectors || [], [data])
  const totals = data?.data?.totals
  const referenceMonth = formatReferenceMonth(data?.data?.referenceMonth)

  const administrative = sectors.filter(
    (sector) => sector.nature === 'ADMINISTRATIVE',
  )
  const productive = useMemo(
    () => sectors.filter((sector) => sector.nature === 'PRODUCTIVE'),
    [sectors],
  )

  // As barras partem do que está salvo; o que foi mexido vale por cima
  const saved = useMemo(
    () =>
      Object.fromEntries(
        productive.map((sector) => [sector.id, sector.percentage]),
      ),
    [productive],
  )
  const percentages = edited ?? saved

  const { mutate, isPending } = useMutation({
    // Só os produtivos: a API recusa setor administrativo na distribuição
    mutationFn: () =>
      updateDistribution({
        percentages: productive.map((sector) => ({
          id: sector.id,
          percentage: percentages[sector.id] ?? 0,
        })),
      }),
    onSuccess: (response) => {
      if (!response.success || !response.data) {
        return toast.error(response.message || 'Erro ao salvar a distribuição')
      }

      toast.success('Distribuição salva')
      // A resposta já é a distribuição recalculada: entra no lugar da que foi
      // lida, sem pedir de novo, e a edição volta a ser o que está salvo
      queryClient.setQueryData(['cost-distribution'], response)
      setEdited(undefined)
      AFFECTED_QUERIES.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      )
    },
    onError: () => toast.error('Erro ao salvar a distribuição'),
  })

  // Todos os administrativos formam um total único, que é o que pode ser
  // rateado entre os produtivos (BC-7)
  const administrativeCost = administrative.reduce(
    (sum, sector) => sum + (sector.directCost || 0),
    0,
  )

  // O fechamento é conferido pelo valor, em centavos, e não pelo percentual
  // exibido, com tolerância de 1 centavo (design.md §6.8 e §7). É simulação
  // com os números lidos: a API confere de novo ao salvar
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
    setEdited((current) => ({
      ...(current ?? saved),
      [id]: Math.min(Math.max(percentage || 0, 0), 100),
    }))

  return (
    <div className="space-y-5">
      <DistributionSummaryCards totals={totals} isLoading={isLoading} />
      <Card>
        <CardHeader>
          <CardTitle>Distribuição dos custos indiretos</CardTitle>
          <CardDescription>
            Escolha quanto do custo administrativo cada setor produtivo recebe.
            Distribuir é opcional: pelo método do custo puro, o padrão é deixar
            o administrativo fora do custo dos setores e cobri-lo com o
            resultado das vendas.
            {referenceMonth ? ` Mês de referência: ${referenceMonth}.` : ''}
          </CardDescription>
        </CardHeader>
        {isLoading ? (
          <TableSkeleton cols={5} rows={8} />
        ) : data && !data.success ? (
          <LoadError message={data.message} />
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
              {/* Rateio por item (BC-8): o que já foi para os setores como
                  custo próprio não entra no total a distribuir */}
              {totals?.allocatedByItem ? (
                <p className="-mt-5 text-sm text-gray">
                  Já sem{' '}
                  <span className="font-medium text-gray-900">
                    {formatCurrencyToBrl(totals.allocatedByItem)}
                  </span>{' '}
                  rateados por item em Despesas administrativas, que entraram
                  como custo próprio dos setores.
                </p>
              ) : null}
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
                  Salvar distribuição
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
