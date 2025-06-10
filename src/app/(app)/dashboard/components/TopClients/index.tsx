// UI
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'
import { PeriodFilter } from '../PeriodFilter'

// Components
import { TopClientsChart } from './Chart'

export function DashboardTopClients() {
  return (
    <Card className="flex-[1_1_540px]">
      <CardHeader className="flex-row gap-4 justify-between">
        <CardTitle className="text-gray-700 font-semibold text-base">
          Melhores clientes
        </CardTitle>
        <PeriodFilter />
      </CardHeader>
      <CardContent className="p-6">
        <TopClientsChart />
      </CardContent>
    </Card>
  )
}
