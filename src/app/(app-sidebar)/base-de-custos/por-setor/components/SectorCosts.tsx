'use client'

// UI
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card'

// Components
import { SectorCostsData } from './SectorCostsData'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Actions
import { getSectorCosts } from '@/actions/cost-base'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconBuildingFactory } from '@tabler/icons-react'

export function SectorCosts() {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['sector-costs'],
    queryFn: () => getSectorCosts(),
  })

  const sectors = data?.data?.sectors || []
  const isDistributing = data?.data?.isDistributing ?? false

  const productive = sectors.filter((sector) => sector.nature === 'PRODUCTIVE')
  const administrative = sectors.filter(
    (sector) => sector.nature === 'ADMINISTRATIVE',
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custo por setor</CardTitle>
        <CardDescription>
          Quanto custa cada setor por mês e de onde veio cada valor. Abra a
          linha para ver os colaboradores, os bens e os lançamentos que formam o
          número.
        </CardDescription>
      </CardHeader>
      {isLoading ? (
        <TableSkeleton cols={8} rows={8} />
      ) : !sectors.length ? (
        <ListDataTotalEmpty
          icon={IconBuildingFactory}
          title="Nenhum setor cadastrado"
          description="Cadastre os setores da empresa para acompanhar o custo de cada um."
        />
      ) : (
        <>
          <SectorCostsData
            title="Setores produtivos"
            sectors={productive}
            isDistributing={isDistributing}
          />
          <SectorCostsData
            title="Setores administrativos"
            sectors={administrative}
            isDistributing={false}
          />
          <CardFooter>
            <p className="text-sm text-gray">
              {isDistributing
                ? 'O administrativo distribuído aparece em coluna própria, separado do custo próprio do setor.'
                : 'O custo administrativo não está dentro do custo dos setores: ele precisa ser coberto pelo resultado combinado das vendas.'}
            </p>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
