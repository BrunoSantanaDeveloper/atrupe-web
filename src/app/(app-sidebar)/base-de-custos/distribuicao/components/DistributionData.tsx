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
  // No setor administrativo é quanto ele distribui; no produtivo, quanto recebe (BC-6)
  isAdministrative: boolean
  distributedCost: number
  onChange: (id: string, percentage: number) => void
  disabled?: boolean
}

// Sem custo mostra `-`; valor não calculado nunca vira R$ 0,00 (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

export function DistributionData({
  sectors,
  percentages,
  isAdministrative,
  distributedCost,
  onChange,
  disabled,
}: Props) {
  const percentageLabel = isAdministrative
    ? 'Quanto distribuir'
    : 'Quanto recebe'
  const amountLabel = isAdministrative ? 'Valor distribuído' : 'Custo recebido'

  const amountOf = (sector: DistributionSector) => {
    const percentage = percentages[sector.id] ?? 0

    if (isAdministrative) {
      if (sector.directCost === null) return null

      return Math.round((sector.directCost * percentage) / 100)
    }

    return Math.round((distributedCost * percentage) / 100)
  }

  const totalOf = (sector: DistributionSector) => {
    const amount = amountOf(sector) || 0

    if (isAdministrative) return sector.directCost

    if (sector.directCost === null) return amount || null

    return sector.directCost + amount
  }

  return (
    <Table className="min-w-[760px]">
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead className="w-[28%] min-w-[180px]">
            {isAdministrative
              ? 'Setores administrativos'
              : 'Setores produtivos'}
          </TableHead>
          <TableHead className="w-[30%] min-w-[220px]">
            {percentageLabel}
          </TableHead>
          <TableHead className="w-[14%] text-right">Custo direto</TableHead>
          <TableHead className="w-[14%] text-right">{amountLabel}</TableHead>
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
                    aria-label={`${percentageLabel} — ${sector.name}`}
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
                    aria-label={`${percentageLabel} em porcentagem — ${sector.name}`}
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
                {percentage === 0 ? '-' : formatValue(amountOf(sector))}
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
