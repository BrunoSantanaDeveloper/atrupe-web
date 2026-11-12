// A contagem de folhas do item gravado (gráfica rápida, 12/11/2026): uma
// marca por parte impressa, na linha do item do orçamento e na O.S. Sem
// custo. O texto é o mesmo do painel do item

// UI
import { Badge } from '@/components/ui/badge'

// Types
import type { PrintCount } from '@/actions/print'

/** "21 por folha · 48 folhas + 3 de acerto = 51 folhas" */
export function printCountText(count: PrintCount) {
  if (count.warning || !count.piecesPerSheet) {
    return count.warning || 'Não dá para contar as folhas'
  }
  const sheets = `${count.sheets} ${count.sheets === 1 ? 'folha' : 'folhas'}`
  const total =
    count.setupSheets > 0
      ? `${sheets} + ${count.setupSheets} de acerto = ${count.totalSheets} folhas`
      : sheets
  return `${count.piecesPerSheet} por folha · ${total}`
}

/** A parte e o papel: "Miolo · Sulfite 75 A4" */
export function printCountTitle(count: PrintCount) {
  return `${count.label ? `${count.label} · ` : ''}${count.paperName}`
}

export function SheetCountBadges({ counts }: { counts?: PrintCount[] }) {
  if (!counts?.length) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      {counts.map((count, index) => (
        <Badge
          key={`${count.label}-${index}`}
          variant={count.warning ? 'warningLight' : 'blueLight'}
        >
          {`${printCountTitle(count)}: ${printCountText(count)}`}
        </Badge>
      ))}
    </div>
  )
}
