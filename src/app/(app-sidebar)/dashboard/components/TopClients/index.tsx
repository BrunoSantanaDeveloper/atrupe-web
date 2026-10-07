import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { TopClientsChart } from './Chart'

type DashboardFilters = {
  startDate?: string
  endDate?: string
}

interface DashboardTopClientsProps {
  filters: DashboardFilters
}

export function DashboardTopClients({ filters }: DashboardTopClientsProps) {
  return (
    <Card className="flex-[1_1_540px]">
      <CardHeader className="flex-row gap-4 justify-between">
        <CardTitle>Melhores clientes</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <TopClientsChart filters={filters} />
      </CardContent>
    </Card>
  )
}
