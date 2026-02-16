// Types for Sector Report (Resultado por Setor)

export interface SectorResult {
  id: string
  name: string
  icon: string
  value: number
  isGeneral?: boolean
}

export interface SectorReportData {
  sectors: SectorResult[]
  generalTotal: number
}
