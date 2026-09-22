'use client'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'

// Types
import type { DistributionSector } from '../../types'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'

interface Props {
  sectors: DistributionSector[]
  total: number
}

// Sem custo mostra `-`; valor não calculado nunca vira R$ 0,00 (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

// Todos os setores administrativos formam um total único, que é o que pode ser
// rateado entre os produtivos (BC-7). Por isso aqui não há percentual por setor.
export function AdministrativeCostTable({ sectors, total }: Props) {
  return (
    <Table className="min-w-[560px]">
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead className="w-[70%] min-w-[220px]">
            Setores administrativos
          </TableHead>
          <TableHead className="w-[30%] text-right">Custo mensal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sectors.map((sector) => (
          <TableRow key={sector.id}>
            <TableCell className="font-medium">{sector.name}</TableCell>
            <TableCell className="text-right">
              {formatValue(sector.directCost)}
            </TableCell>
          </TableRow>
        ))}
        <TableRow className="bg-gray-50 hover:bg-gray-50">
          <TableCell className="font-medium">
            Total administrativo a distribuir
          </TableCell>
          <TableCell className="text-right font-semibold">
            {formatCurrencyToBrl(total)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
