// Papéis (GR-0, decisão de 13/10/2026): no LITE, o papel é um material com
// menos campos: nome, gramatura, formato da folha e a área útil, que o
// aproveitamento lê (GR-2). Sem custo nem preço. No PRO os mesmos registros
// aparecem em Materiais, com a forma "folha". Medidas em milímetros.

export type SheetFormat = 'A4' | 'A3' | 'SRA3' | 'A3_PLUS' | 'CUSTOM'

export type Paper = {
  id: string
  code: string
  name: string
  sectorId: string
  sector: string
  grammage: number | null
  sheetFormat: SheetFormat | null
  sheetWidth: number | null
  sheetHeight: number | null
  // Vazia = a folha inteira
  usableWidth: number | null
  usableHeight: number | null
  active: boolean
}

export type PaperValues = {
  name: string
  sectorId: string
  grammage: number | null
  sheetFormat: SheetFormat
  // Só no formato personalizado; nos padrões a API preenche
  sheetWidth: number | null
  sheetHeight: number | null
  usableWidth: number | null
  usableHeight: number | null
  active?: boolean
}
