// UI
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'

// Component
import { DeliveryDialog } from './QuotationActions/Delivery'
import { TextSupportingText } from '@/components/common/TextSupportingText'

// Icon
import { IconPackage } from '@tabler/icons-react'

// Type
import { QuotationType } from '@/types/sales/quotation'

// Lib
import { cn, formatCurrencyToBrl } from '@/lib/utils'

import { ordersStatusObj } from '@/consts/orders'

import { deliveryType } from '@/consts/deliverySchedule'
import { DetailCardRowItem } from '@/app/(app-sidebar)/cadastros/clientes/[id]/components/DetailCardRowItem'

// Add import
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props {
  quotationData: QuotationType
}

export function QuotationDelivery({ quotationData }: Props) {
  const data = quotationData?.deliveryInfo

  return (
    <Card className="w-full">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="p-0 m-0 border-0">
          <CardHeader>
            <div className="flex justify-between">
              <div className="flex gap-3 items-center">
                <FeaturedIcon variant="neutralOutline" Icon={IconPackage} />
                <CardTitle className="text-gray-700 font-semibold text-base">
                  Entrega
                </CardTitle>
                {data?.status && (
                  <Badge
                    status
                    variant={ordersStatusObj[data?.status]?.variant}
                  >
                    {ordersStatusObj[data?.status]?.text}
                  </Badge>
                )}
              </div>
              <div className="flex gap-3">
                <TooltipProvider>
                  <PermissionGate permissions={['sale:quotation:edit']}>
                    <DeliveryDialog quotationData={quotationData} />
                  </PermissionGate>
                </TooltipProvider>
                <AccordionTrigger
                  className={cn(
                    buttonVariants({
                      variant: 'neutralLight',
                      size: 'icon',
                    }),
                    'mr-0 [&>svg]:text-gray [&>svg]:size-5',
                  )}
                ></AccordionTrigger>
              </div>
            </div>
          </CardHeader>
          <AccordionContent>
            <Separator className="mb-4" />
            <CardContent>
              <DetailCardRowItem>
                <TextSupportingText
                  supporting="Tipo"
                  text={deliveryType[data?.type]}
                />
                <TextSupportingText
                  supporting="Prazo"
                  text={`${data?.timeFrame || 0} dias`}
                />
                <TextSupportingText
                  supporting="Transportadora"
                  text={data?.supplier?.name}
                />
                <TextSupportingText
                  supporting="Valor"
                  text={formatCurrencyToBrl(Number(data?.value)) || 'R$ 0,00'}
                />
              </DetailCardRowItem>
              <DetailCardRowItem showSeparator={false}>
                <TextSupportingText
                  supporting="Observações"
                  text={data?.notes}
                />
              </DetailCardRowItem>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
