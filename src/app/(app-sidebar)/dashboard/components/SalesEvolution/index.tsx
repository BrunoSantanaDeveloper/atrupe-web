import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { SalesEvolutionChart } from './Chart'

type DashboardFilters = {
  startDate?: string
  endDate?: string
}

interface DashboardSalesEvolutionProps {
  filters: DashboardFilters
}

export function DashboardSalesEvolution({
  filters,
}: DashboardSalesEvolutionProps) {
  return (
    <Card className="flex-[1_1_540px]">
      <CardHeader className="flex-row gap-4 justify-between">
        <CardTitle className="text-gray-700 font-semibold text-base">
          Evolução de vendas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <SalesEvolutionChart filters={filters} />
      </CardContent>
    </Card>
  )
}
