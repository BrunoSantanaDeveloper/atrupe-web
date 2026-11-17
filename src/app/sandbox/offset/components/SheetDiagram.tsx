'use client'

// O desenho do aproveitamento da offset (OF-2): à esquerda, a folha inteira
// cortada em folhas de máquina; à direita, a folha de máquina com a pinça e
// as peças. No tira e retira (OF-6), metade das peças é frente e metade verso.

import { formatCm, type OffsetResult, type Paper } from '../calc'

const SCALE = 3.2

export function SheetDiagram({
  result,
  paper,
}: {
  result: OffsetResult
  paper: Paper
}) {
  const { sheet, layout, machine } = result

  // Folha inteira, em pé
  const fullW = paper.width * SCALE
  const fullH = paper.height * SCALE
  const cellW =
    sheet.cut === 'EXACT'
      ? paper.width / sheet.across
      : sheet.rotatedInFull
        ? sheet.long
        : sheet.short
  const cellH =
    sheet.cut === 'EXACT'
      ? paper.height / sheet.down
      : sheet.rotatedInFull
        ? sheet.short
        : sheet.long
  const cells = []
  for (let col = 0; col < sheet.across; col++)
    for (let row = 0; row < sheet.down; row++) cells.push({ col, row })

  // Folha de máquina, deitada: o lado maior na horizontal, a pinça em cima
  const machW = sheet.long * SCALE * 1.6
  const machH = sheet.short * SCALE * 1.6
  const k = SCALE * 1.6
  const gripper = (machine.gripperMm / 10) * k
  // As colunas do encaixe correm no lado menor; as linhas, no lado maior
  const alongShort = layout.rotated ? result.pieceHeight : result.pieceWidth
  const alongLong = layout.rotated ? result.pieceWidth : result.pieceHeight
  const pieces = []
  for (let row = 0; row < layout.rows; row++)
    for (let col = 0; col < layout.cols; col++) pieces.push({ row, col })
  // Peças que ficam de fora quando o tira e retira pede número par
  const used = result.piecesPerSheet
  // No tira e retira, metade da folha é frente e metade é verso: divide pelo
  // lado que tem número par de peças
  const isBack = (row: number, col: number, index: number) => {
    if (!result.workAndTurn || index >= used) return false
    if (layout.rows % 2 === 0) return row >= layout.rows / 2
    if (layout.cols % 2 === 0) return col >= layout.cols / 2
    return index >= used / 2
  }

  return (
    <div className="flex flex-wrap items-end gap-8">
      <figure className="space-y-2">
        <svg
          width={fullW + 2}
          height={fullH + 2}
          role="img"
          aria-label="Folha inteira cortada em folhas de máquina"
        >
          <rect
            x={1}
            y={1}
            width={fullW}
            height={fullH}
            className="fill-gray-200 stroke-gray-400"
          />
          {cells.map(({ col, row }) => (
            <rect
              key={`${col}-${row}`}
              x={1 + col * cellW * SCALE}
              y={1 + row * cellH * SCALE}
              width={cellW * SCALE}
              height={cellH * SCALE}
              className="fill-white stroke-gray-500"
              strokeDasharray="4 3"
            />
          ))}
        </svg>
        <figcaption className="text-xs text-gray">
          Folha inteira {formatCm(paper.width)} × {formatCm(paper.height)} cm:{' '}
          {sheet.perFullSheet} {sheet.perFullSheet === 1 ? 'folha' : 'folhas'}{' '}
          de máquina
          {sheet.cut === 'TRIMMED' ? ', com apara (em cinza)' : ''}
        </figcaption>
      </figure>

      <figure className="space-y-2">
        <svg
          width={machW + 2}
          height={machH + 2}
          role="img"
          aria-label="Folha de máquina com as peças"
        >
          <rect
            x={1}
            y={1}
            width={machW}
            height={machH}
            className="fill-white stroke-gray-500"
          />
          {gripper > 0 && (
            <rect
              x={1}
              y={1}
              width={machW}
              height={gripper}
              className="fill-warning-200"
            />
          )}
          {pieces.map(({ row, col }, index) => (
            <rect
              key={index}
              x={1 + row * alongLong * k}
              y={1 + gripper + col * alongShort * k}
              width={alongLong * k}
              height={alongShort * k}
              className={
                index >= used
                  ? 'fill-gray-100 stroke-gray-300'
                  : isBack(row, col, index)
                    ? 'fill-blue-100 stroke-blue-500'
                    : 'fill-brand-100 stroke-brand-500'
              }
            />
          ))}
        </svg>
        <figcaption className="text-xs text-gray">
          Folha de máquina {formatCm(sheet.short)} × {formatCm(sheet.long)} cm:{' '}
          {result.piecesPerSheet} peças de {formatCm(result.pieceWidth)} ×{' '}
          {formatCm(result.pieceHeight)} cm
          {machine.gripperMm > 0
            ? `; pinça de ${machine.gripperMm} mm em amarelo`
            : ''}
          {result.workAndTurn ? '; verde é frente e azul é verso' : ''}
        </figcaption>
      </figure>
    </div>
  )
}
