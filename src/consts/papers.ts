// Os formatos de folha dos papéis (GR-0): os padrões preenchem a medida da
// folha; o personalizado pede largura e altura. Em mm, em pé.

import type { SheetFormat } from '@/app/(app-sidebar)/cadastros/papeis/types'

export const sheetFormatObj: {
  [key in SheetFormat]: {
    text: string
    width: number | null
    height: number | null
  }
} = {
  A4: { text: 'A4', width: 210, height: 297 },
  A3: { text: 'A3', width: 297, height: 420 },
  SRA3: { text: 'SRA3', width: 320, height: 450 },
  A3_PLUS: { text: 'A3+', width: 329, height: 483 },
  CUSTOM: { text: 'Personalizado', width: null, height: null },
}

export const SHEET_FORMAT_ORDER: SheetFormat[] = [
  'A4',
  'A3',
  'SRA3',
  'A3_PLUS',
  'CUSTOM',
]

export const sheetFormatOptions = SHEET_FORMAT_ORDER.map((format) => {
  const item = sheetFormatObj[format]
  return {
    value: format,
    label: item.width
      ? `${item.text} (${item.width} × ${item.height} mm)`
      : item.text,
  }
})

// "320 × 450 mm"
export const mmSize = (
  width: number | null | undefined,
  height: number | null | undefined,
) =>
  width && height
    ? `${width.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} × ${height.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mm`
    : ''
