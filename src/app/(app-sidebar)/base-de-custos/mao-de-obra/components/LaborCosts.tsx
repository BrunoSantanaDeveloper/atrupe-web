'use client'

// React / Next
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import { formatHoursLabel } from '@/components/common/RateInput'
import { WorkloadModal } from './WorkloadModal'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { LaborSector } from '../../types'

// Actions
import { getLaborSectors } from '@/actions/cost-base'

// Hooks / Store / Consts
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconClock, IconUsers, IconCurrencyReal } from '@tabler/icons-react'

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

  const sectors = data?.data || []

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Mão de obra por setor</CardTitle>
          <CardDescription>
            O custo hora sai do custo do setor dividido pela carga horária dos
            colaboradores. A margem mostra o resultado do preço praticado sobre
            esse custo.
          </CardDescription>
        </CardHeader>
        {isLoading ? (
          <TableSkeleton cols={7} rows={6} />
        ) : !sectors.length ? (
          <ListDataTotalEmpty
            icon={IconUsers}
            title="Nenhum setor produtivo cadastrado"
            description="Cadastre os setores da empresa para precificar a hora de mão de obra."
          />
        ) : (
          <CardContent>
            <Table className="min-w-[860px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[24%] min-w-[160px]">Setor</TableHead>
                  <TableHead className="w-[16%] text-right">
                    Custo distribuído
                  </TableHead>
                  <TableHead className="w-[14%] text-right">
                    Carga horária
                  </TableHead>
                  <TableHead className="w-[14%] text-right">
                    Custo hora
                  </TableHead>
                  <TableHead className="w-[14%] text-right">
                    Preço hora
                  </TableHead>
                  <TableHead className="w-[12%] text-right">
                    Margem atual
                  </TableHead>
                  <TableHead className="w-[6%]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectors.map((sector) => (
                  <TableRow key={sector.id}>
                    <TableCell className="font-medium">{sector.name}</TableCell>
                    <TableCell className="text-right">
                      {formatValue(sector.distributedCost)}
                    </TableCell>
                    <TableCell className="text-right">
                      {sector.hours === null
                        ? '-'
                        : formatHoursLabel(sector.hours)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatValue(sector.costPerHour)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatValue(sector.salePrice)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium',
                        sector.margin !== null &&
                          sector.margin < 0 &&
                          'text-error-700',
                      )}
                    >
                      {sector.margin === null
                        ? '-'
                        : `${sector.margin.toString().replace('.', ',')}%`}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <ActionButton
                          Icon={IconClock}
                          tooltip={`Carga de produção — ${sector.name}`}
                          onClick={() => setWorkload(sector)}
                        />
                        <ActionButton
                          Icon={IconCurrencyReal}
                          tooltip={`Precificar a hora de ${sector.name}`}
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
