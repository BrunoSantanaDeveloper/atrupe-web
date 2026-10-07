'use client'

// React / Next
import { useState } from 'react'

// UI
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'
import { SectorAllocationDialog } from './SectorAllocationDialog'

// Types
import type { SectorAllocation } from '../../types'

// Actions
import { getSectorAllocations } from '@/actions/sector-allocation'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { sectorAllocationObj } from '@/consts/cost-base'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconPencil, IconArrowsSplit2 } from '@tabler/icons-react'

// Critério do rateio de cada setor entre os seus equipamentos (BC-3, BC-3.1,
// BC-4). Só aparecem os setores produtivos com equipamento detalhado
export function SectorAllocations() {
  const [selected, setSelected] = useState<SectorAllocation>()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['sector-allocations'],
    queryFn: () => getSectorAllocations(),
  })

  const allocations = data?.data || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rateio entre os equipamentos do setor</CardTitle>
        <CardDescription>
          Dentro de cada setor, o custo que não é de um equipamento é repartido
          entre os equipamentos detalhados: pelo valor de aquisição (regra
          base), pelo tempo de atividade ou por percentual informado à mão.
        </CardDescription>
      </CardHeader>
      {isLoading ? (
        <TableSkeleton cols={5} rows={3} />
      ) : !allocations.length ? (
        <ListDataTotalEmpty
          icon={IconArrowsSplit2}
          title="Nenhum setor com equipamento detalhado"
          description="Cadastre os equipamentos com produtividade em Patrimônios para escolher como o custo do setor é repartido entre eles."
        />
      ) : (
        <CardContent className="px-6 pb-6">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[24%]">Setor</TableHead>
                <TableHead className="w-[30%]">Equipamentos</TableHead>
                <TableHead className="w-[22%]">Critério em uso</TableHead>
                <TableHead className="w-[18%] text-right">
                  Custo a repartir
                </TableHead>
                <TableHead className="w-[6%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((allocation) => {
                const single = allocation.equipment.length === 1

                return (
                  <TableRow key={allocation.sectorId}>
                    <TableCell className="font-medium">
                      {allocation.sectorName}
                    </TableCell>
                    <TableCell className="text-sm text-gray">
                      {allocation.equipment.map((item) => item.name).join(', ')}
                    </TableCell>
                    <TableCell>
                      {single ? (
                        <span className="text-sm text-gray">
                          Um equipamento só: recebe todo o custo
                        </span>
                      ) : (
                        <Badge variant="neutralLight">
                          {allocation.criterion === 'MANUAL'
                            ? 'Manual'
                            : `Por ${sectorAllocationObj[allocation.criterion]}`}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {allocation.pool
                        ? formatCurrencyToBrl(allocation.pool)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {single ? null : (
                        <ActionButton
                          Icon={IconPencil}
                          tooltip="Configurar o rateio"
                          onClick={() => setSelected(allocation)}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      )}
      <SectorAllocationDialog
        allocation={selected}
        open={!!selected}
        onOpenChange={() => setSelected(undefined)}
      />
    </Card>
  )
}
