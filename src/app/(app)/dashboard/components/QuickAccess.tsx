// React
import { Fragment } from 'react'

// UI
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'

// Icons
import {
  IconCoin,
  IconChartBar,
  IconChartDots,
  IconChartDonut,
  IconChevronRight,
  IconTruckLoading,
} from '@tabler/icons-react'

const quickAccessMenu = [
  {
    label: 'Dashboard itens de venda',
    icon: IconChartDonut,
  },
  {
    label: 'Orçamentos',
    icon: IconCoin,
  },
  {
    label: 'Agenda de entrega',
    icon: IconTruckLoading,
  },
  {
    label: 'Relatórios',
    icon: IconChartBar,
  },
  {
    label: 'Relatório de vendas',
    icon: IconChartDots,
  },
]

export function DashboardQuickAccess() {
  return (
    <Card className="flex-[1_1_265px]">
      <CardHeader>
        <CardTitle className="text-gray-700 font-semibold text-base">
          Acesso rápido
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <ul>
          {quickAccessMenu.map((item) => (
            <Fragment key={item.label}>
              <li>
                <Button
                  type="button"
                  variant="neutralGhost"
                  LeftIcon={item.icon}
                  RightIcon={IconChevronRight}
                  className="w-full"
                >
                  {item.label}
                </Button>
              </li>
              <Separator className="my-2" />
            </Fragment>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
