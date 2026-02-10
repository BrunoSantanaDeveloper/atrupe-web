'use server'

import type { SectorReportData } from '@/app/(app-sidebar)/relatorios/resultado-por-setor/types'

interface SectorReportFilters {
  startDate?: string
  endDate?: string
}

// ============================================
// MOCK DATA - Remover quando backend estiver pronto
// ============================================

const MOCK_DATA: SectorReportData = {
  sectors: [
    {
      id: 'almoxarifado',
      name: 'Almoxarifado',
      icon: 'clipboard',
      value: 500000,
    },
    { id: 'cnc', name: 'CNC', icon: 'cpu', value: 500000 },
    { id: 'confeccao', name: 'Confecção', icon: 'shirt', value: 500000 },
    { id: 'criacao', name: 'Criação', icon: 'sparkles', value: 500000 },
    { id: 'frota', name: 'Frota', icon: 'truck', value: 500000 },
    { id: 'grafica', name: 'Gráfica', icon: 'printer', value: 500000 },
    { id: 'impressao', name: 'Impressão', icon: 'photo', value: 500000 },
    { id: 'instalacao', name: 'Instalação', icon: 'tool', value: 500000 },
    {
      id: 'locacao-paineis',
      name: 'Locação de Painéis',
      icon: 'layout',
      value: 500000,
    },
    { id: 'marcenaria', name: 'Marcenaria', icon: 'pencil', value: 500000 },
    { id: 'producao', name: 'Produção', icon: 'settings', value: 500000 },
    { id: 'serralheria', name: 'Serralheria', icon: 'shield', value: 500000 },
    { id: 'serigrafia', name: 'Serigrafia', icon: 'layers', value: 500000 },
  ],
  generalTotal: 4500000,
}

// ============================================
// SERVER ACTIONS
// ============================================

export async function getSectorResults(
  _filters?: SectorReportFilters,
): Promise<SectorReportData> {
  // TODO: Replace with real API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  return MOCK_DATA
}
