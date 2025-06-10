// UI
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'

// Icons
import {
  IconCoin,
  IconCheck,
  IconPencil,
  IconUrgent,
  IconClockHour4,
} from '@tabler/icons-react'

export function DashboardQuotations() {
  return (
    <Card className="flex flex-wrap justify-between items-center">
      <CardHeader>
        <div className="flex gap-3 items-center">
          <FeaturedIcon variant="indigoLight" Icon={IconCoin} />
          <CardTitle className="text-gray-700 font-semibold text-base">
            Orçamentos
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-2">
            <IconPencil size={20} className="text-gray" />
            <span className="text-sm text-gray">Em digitação</span>
            <span className="text-lg font-semibold">0</span>
          </div>
          <div className="flex items-center gap-2">
            <IconClockHour4 size={20} className="text-gray" />
            <span className="text-sm text-gray">Aguardando</span>
            <span className="text-lg font-semibold">0</span>
          </div>
          <div className="flex items-center gap-2">
            <IconUrgent size={20} className="text-gray" />
            <span className="text-sm text-gray">Vencidos</span>
            <span className="text-lg font-semibold">0</span>
          </div>
          <div className="flex items-center gap-2">
            <IconCheck size={20} className="text-gray" />
            <span className="text-sm text-gray">Aprovados</span>
            <span className="text-lg font-semibold">0</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
