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
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'

// Types
import type { DistributionSector } from '../../types'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'

interface Props {
  sectors: DistributionSector[]
  percentages: Record<string, number>
  // Total administrativo que os setores produtivos repartem entre si (BC-7)
  administrativeCost: number
  onChange: (id: string, percentage: number) => void
  disabled?: boolean
}

// Sem custo mostra `-`; valor não calculado nunca vira R$ 0,00 (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

export function DistributionData({
  sectors,
  percentages,
  administrativeCost,
  onChange,
  disabled,
}: Props) {
  const receivedBy = (sector: DistributionSector) =>
    Math.round((administrativeCost * (percentages[sector.id] ?? 0)) / 100)

  const totalOf = (sector: DistributionSector) => {
    const received = receivedBy(sector)

    if (sector.directCost === null) return received || null

    return sector.directCost + received
  }

  return (
    <Table className="min-w-[760px]">
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead className="w-[28%] min-w-[180px]">
            Setores produtivos
          </TableHead>
          <TableHead className="w-[30%] min-w-[220px]">Quanto recebe</TableHead>
          <TableHead className="w-[14%] text-right">Custo direto</TableHead>
          <TableHead className="w-[14%] text-right">Custo recebido</TableHead>
          <TableHead className="w-[14%] text-right">Custo total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sectors.map((sector) => {
          const percentage = percentages[sector.id] ?? 0

          return (
            <TableRow key={sector.id}>
              <TableCell className="font-medium">{sector.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Slider
                    className="w-full max-w-[160px]"
                    min={0}
                    max={100}
                    step={1}
                    value={[percentage]}
                    disabled={disabled}
                    aria-label={`Quanto recebe — ${sector.name}`}
                    onValueChange={([value]) => onChange(sector.id, value)}
                  />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="h-10 w-[92px]"
                    value={String(percentage)}
                    disabled={disabled}
                    endAdornment={<span className="text-sm">%</span>}
                    aria-label={`Quanto recebe em porcentagem — ${sector.name}`}
                    onChange={(event) =>
                      onChange(sector.id, Number(event.target.value || 0))
                    }
                  />
                </div>
              </TableCell>
              <TableCell className="text-right">
                {formatValue(sector.directCost)}
              </TableCell>
              <TableCell className="text-right">
                {percentage === 0
                  ? '-'
                  : formatCurrencyToBrl(receivedBy(sector))}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatValue(totalOf(sector))}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
