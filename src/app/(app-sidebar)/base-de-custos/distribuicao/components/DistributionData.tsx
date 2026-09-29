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
import { Slider } from '@/components/ui/slider'

// Components
import {
  RateInput,
  parseDecimal,
  formatPercent,
  parseCentsInput,
  formatCentsInput,
} from '@/components/common/RateInput'

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

// Percentual digitado fica com duas casas (design.md §6.8)
const parsePercent = (text: string) => {
  const value = parseDecimal(text)

  return value === null ? null : Math.round(value * 100) / 100
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

  // O valor digitado vira o percentual exato, para o setor receber o que foi
  // arredondado à mão (design.md §6.8)
  const handleValue = (id: string, cents: number) =>
    onChange(id, administrativeCost ? (cents / administrativeCost) * 100 : 0)

  return (
    <Table className="min-w-[860px]">
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead className="w-[24%] min-w-[180px]">
            Setores produtivos
          </TableHead>
          <TableHead className="w-[46%] min-w-[400px]">Quanto recebe</TableHead>
          <TableHead className="w-[15%] text-right">Custo direto</TableHead>
          <TableHead className="w-[15%] text-right">Custo total</TableHead>
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
                    className="w-full max-w-[140px]"
                    min={0}
                    max={100}
                    step={1}
                    value={[percentage]}
                    disabled={disabled}
                    aria-label={`Quanto recebe — ${sector.name}`}
                    onValueChange={([value]) => onChange(sector.id, value)}
                  />
                  <RateInput
                    className="h-10 w-[104px] shrink-0"
                    value={percentage}
                    format={formatPercent}
                    parse={parsePercent}
                    onCommit={(value) => onChange(sector.id, value)}
                    disabled={disabled}
                    endAdornment={<span className="text-sm">%</span>}
                    aria-label={`Quanto recebe em porcentagem — ${sector.name}`}
                  />
                  <RateInput
                    className="h-10 w-[148px] shrink-0"
                    value={receivedBy(sector)}
                    format={formatCentsInput}
                    parse={parseCentsInput}
                    onCommit={(cents) => handleValue(sector.id, cents)}
                    disabled={disabled || !administrativeCost}
                    startAdornment={<span className="text-sm">R$</span>}
                    aria-label={`Quanto recebe em reais — ${sector.name}`}
                  />
                </div>
              </TableCell>
              <TableCell className="text-right">
                {formatValue(sector.directCost)}
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
