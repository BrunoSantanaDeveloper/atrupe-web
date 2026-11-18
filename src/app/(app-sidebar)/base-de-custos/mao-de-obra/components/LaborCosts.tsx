'use client'

// React / Next
import { InfoHint } from '@/components/common/InfoHint'
import Link from 'next/link'
import { useState } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import { formatHoursLabel } from '@/components/common/RateInput'
import { WorkloadModal } from './WorkloadModal'
import { LoadError } from '../../components/LoadError'
import { FeatureGate } from '@/components/common/FeatureGate'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { LaborSector } from '../../types'

// Actions
import { getLaborSectors } from '@/actions/cost-base'

// Hooks / Store / Consts
import { FEATURES } from '@/consts/features'
import { formatCurrencyToBrl } from '@/lib/utils'
import { formatReferenceMonth } from '../../reference-month'
import { pricingGroupPath } from '@/consts/pricing'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconClock, IconUsers } from '@tabler/icons-react'

// Sem número mostra `-`; valor não calculado nunca vira R$ 0,00 (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

export function LaborCosts() {
  const [workload, setWorkload] = useState<LaborSector>()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['labor-sectors'],
    queryFn: () => getLaborSectors(),
  })

  const sectors = data?.data?.sectors || []
  const referenceMonth = formatReferenceMonth(data?.data?.referenceMonth)

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>Mão de obra por setor</CardTitle>
            <InfoHint title="Mão de obra por setor">
              <p>
                O custo hora sai do custo do setor dividido pela carga de
                produção.{' '}
                {referenceMonth ? ` Mês de referência: ${referenceMonth}.` : ''}{' '}
                {/* Custo aqui, preço na Precificação (decisão de 17/11/2026): a Base de custos para no custo, para não repetir o legado */}{' '}
                <FeatureGate features={[FEATURES.COSTS.PRICING_CENTER]}>
                  {' '}
                  O preço da hora fica na{' '}
                  <Link
                    href={pricingGroupPath.labor}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    {' '}
                    Precificação{' '}
                  </Link>{' '}
                  .{' '}
                </FeatureGate>
              </p>
            </InfoHint>
          </div>
        </CardHeader>
        {isLoading ? (
          <TableSkeleton cols={5} rows={6} />
        ) : data && !data.success ? (
          <LoadError message={data.message} />
        ) : !sectors.length ? (
          <ListDataTotalEmpty
            icon={IconUsers}
            title="Nenhum setor produtivo cadastrado"
            description="Cadastre os setores da empresa para calcular o custo da hora de mão de obra."
          />
        ) : (
          <CardContent>
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[34%] min-w-[160px]">Setor</TableHead>
                  <TableHead numeric className="w-[22%]">
                    Custo distribuído
                  </TableHead>
                  <TableHead numeric className="w-[18%]">
                    Carga de produção
                  </TableHead>
                  <TableHead numeric className="w-[20%]">
                    Custo hora
                  </TableHead>
                  <TableHead className="w-[6%]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectors.map((sector) => (
                  <TableRow key={sector.id}>
                    <TableCell className="font-medium">{sector.name}</TableCell>
                    <TableCell numeric>
                      {formatValue(sector.distributedCost)}
                    </TableCell>
                    <TableCell className="text-right">
                      {sector.hours === null
                        ? '-'
                        : formatHoursLabel(sector.hours)}
                    </TableCell>
                    <TableCell numeric>
                      {formatValue(sector.costPerHour)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <ActionButton
                          Icon={IconClock}
                          tooltip={`Carga de produção — ${sector.name}`}
                          onClick={() => setWorkload(sector)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
      <WorkloadModal
        sector={workload}
        open={!!workload}
        onOpenChange={() => setWorkload(undefined)}
      />
    </TooltipProvider>
  )
}
