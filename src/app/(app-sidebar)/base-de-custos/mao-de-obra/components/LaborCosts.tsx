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
import { LoadError } from '../../components/LoadError'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { LaborSector } from '../../types'

// Actions
import { getLaborSectors } from '@/actions/cost-base'

// Hooks / Store / Consts
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { formatReferenceMonth } from '../../reference-month'

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

  const sectors = data?.data?.sectors || []
  const referenceMonth = formatReferenceMonth(data?.data?.referenceMonth)

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Mão de obra por setor</CardTitle>
          <CardDescription>
            O custo hora sai do custo do setor dividido pela carga horária dos
            colaboradores. A margem mostra o resultado do preço praticado sobre
            esse custo.
            {referenceMonth ? ` Mês de referência: ${referenceMonth}.` : ''}
          </CardDescription>
        </CardHeader>
        {isLoading ? (
          <TableSkeleton cols={6} rows={6} />
        ) : data && !data.success ? (
          <LoadError message={data.message} />
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
                  <TableHead numeric className="w-[16%]">
                    Custo distribuído
                  </TableHead>
                  <TableHead numeric className="w-[14%]">
                    Carga horária
                  </TableHead>
                  <TableHead numeric className="w-[14%]">
                    Custo hora
                  </TableHead>
                  <TableHead numeric className="w-[14%]">
                    Preço hora
                  </TableHead>
                  <TableHead numeric className="w-[12%]">
                    Margem atual
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
                    <TableCell numeric>
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
                        {/* O preço da hora se define na Precificação, que ainda
                            não está ligada à API: o botão fica apagado, com a
                            dica, até a próxima etapa. Não é `disabled` porque o
                            botão desabilitado não mostra a dica */}
                        <ActionButton
                          Icon={IconCurrencyReal}
                          tooltip="Precificar a hora: chega na próxima etapa"
                          aria-disabled
                          className="cursor-not-allowed opacity-40"
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
