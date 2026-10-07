import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { SalesBySellerChart } from './Chart'

type DashboardFilters = {
  startDate?: string
  endDate?: string
}

interface DashboardSalesBySellerProps {
  filters: DashboardFilters
}

export function DashboardSalesBySeller({
  filters,
}: DashboardSalesBySellerProps) {
  return (
    <Card className="flex-[1_1_540px]">
      <CardHeader className="flex-row gap-4 justify-between">
        <CardTitle>Vendas por vendedor</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <SalesBySellerChart filters={filters} />
      </CardContent>
    </Card>
  )
}
