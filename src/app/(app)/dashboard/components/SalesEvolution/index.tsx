// UI
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'
import { PeriodFilter } from '../PeriodFilter'

// Components
import { SalesEvolutionChart } from './Chart'

export function DashboardSalesEvolution() {
  return (
    <Card className="flex-[1_1_540px]">
      <CardHeader className="flex-row gap-4 justify-between">
        <CardTitle className="text-gray-700 font-semibold text-base">
          Evolução de vendas
        </CardTitle>
        <PeriodFilter />
      </CardHeader>
      <CardContent className="p-6">
        <SalesEvolutionChart />
      </CardContent>
    </Card>
  )
}
