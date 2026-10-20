// UI
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'

// Icons
import { IconTrendingDown } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

export function DashboardExpenses() {
  return (
    <Card className="flex-[1_1_540px]">
      <CardHeader>
        <div className="flex gap-3 items-center">
          <Icon icon={IconTrendingDown} size="md" className="text-gray-600" />
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
