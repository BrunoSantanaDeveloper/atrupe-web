// UI
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'

// Icons
import { IconTrendingDown } from '@tabler/icons-react'

export function DashboardExpenses() {
  return (
    <Card className="flex-[1_1_540px]">
      <CardHeader>
        <div className="flex gap-3 items-center">
          <FeaturedIcon variant="errorLight" Icon={IconTrendingDown} />
          <CardTitle>Despesa</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-[1_0_100px] flex-col gap-1">
            <span className="type-kpi-label">Hoje</span>
            <span className="type-kpi-value">R$ 0,00</span>
            <span className="text-xs text-error"> -0% ↓</span>
          </div>
          <div className="flex flex-[1_0_100px] flex-col gap-1">
            <span className="type-kpi-label">Semana</span>
            <span className="type-kpi-value">R$ 0,00</span>
            <span className="text-xs text-error"> -0% ↓</span>
          </div>
          <div className="flex flex-[1_0_100px] flex-col gap-1">
            <span className="type-kpi-label">Mês</span>
            <span className="type-kpi-value">R$ 0,00</span>
            <span className="text-xs text-error"> -0% ↓</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
