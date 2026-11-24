'use client'

// Melhores clientes no dashboard: o mesmo gráfico de ranking do relatório de
// vendas (nome numa linha só, cortado pela largura, valor na ponta da barra).
// O gráfico antigo tinha o eixo fixo em 110px e quebrava o nome em três
// linhas. Os valores seguem o olho do dashboard (EC-24): escondidos, a ponta
// mostra a máscara e imprimir e expandir somem.

import { useQuery } from '@tanstack/react-query'

import { getDashboardTopClients } from '@/actions/dashboard'
import { RankingBarChart } from '@/app/(app-sidebar)/relatorios/vendas/components/RankingBarChart'
import { formatCompactBrl } from '@/app/(app-sidebar)/relatorios/vendas/components/ranking-chart-layout'

import { useDashboardValues } from '../DashboardValuesContext'

type DashboardFilters = {
  startDate?: string
  endDate?: string
}

interface DashboardTopClientsProps {
  filters: DashboardFilters
}

export function DashboardTopClients({ filters }: DashboardTopClientsProps) {
  const { showValues, formatValue, maskText } = useDashboardValues()

  const { data = [], isLoading } = useQuery({
    queryKey: ['dashboard-top-clients', filters],
    queryFn: () => getDashboardTopClients(filters),
  })

  return (
    <RankingBarChart
      title="Melhores clientes"
      nameLabel="Cliente"
      items={data}
      isLoading={isLoading}
      formatValue={(value) => maskText(formatCompactBrl(value))}
      formatTooltip={formatValue}
      hideActions={!showValues}
      emptyText="Nenhum cliente com venda aprovada no período."
    />
  )
}
