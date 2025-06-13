// UI
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'
import { PeriodFilter } from '../PeriodFilter'

// Components
import { SalesBySellerChart } from './Chart'

export function DashboardSalesBySeller() {
  return (
    <Card className="flex-[1_1_540px]">
      <CardHeader className="flex-row gap-4 justify-between">
        <CardTitle className="text-gray-700 font-semibold text-base">
          Vendas por vendedor
        </CardTitle>
        <PeriodFilter />
      </CardHeader>
      <CardContent className="p-6">
        <SalesBySellerChart />
      </CardContent>
    </Card>
  )
}
