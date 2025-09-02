// UI
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'

// Components
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { TextSupportingText } from '@/components/common/TextSupportingText'
import { PaymentConditionsDialog } from './QuotationActions/PaymentConditions'

// Icons
import { IconCoin } from '@tabler/icons-react'

// Types
import { QuotationType } from '@/types/sales/quotation'

// Util
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Consts
import { paymentConditionsTypeObj } from '@/consts/quotations'
import { DetailCardRowItem } from '@/app/(app-sidebar)/cadastros/clientes/[id]/components/DetailCardRowItem'
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props {
  quotationData: QuotationType
}

export function QuotationPaymentConditions({ quotationData }: Props) {
  if (!quotationData) return

  const data = quotationData.paymentConditions

  // Somatório do valor total dos itens do orçamento (sem desconto)
  const totalValue = quotationData?.quotationItems?.reduce(
    (acc, item) => acc + item?.totalValue,
    0,
  )

  // Somatório do valor final dos itens do orçamento (já com desconto)
  const finalValue = quotationData?.totalValue
  // const finalValue = quotationData?.quotationItems?.reduce(
  //   (acc, item) => acc + item?.finalValue,
  //   0,
  // )

  // Desconto total aplicado aos itens do orçamento
  const discount = totalValue - finalValue

  const deliveryValue = quotationData?.deliveryInfo?.value

  const total = finalValue + deliveryValue

  // Accordion deve estar aberto por padrão se existe pelo menos um item no orçamento
  const quotationHasItems = !!quotationData.quotationItems.length

  return (
    <Card className="w-full">
      <Accordion
        type="single"
        collapsible
        defaultValue={quotationHasItems ? 'item-1' : undefined}
      >
        <AccordionItem value="item-1" className="p-0 m-0 border-0">
          <CardHeader>
            <div className="flex justify-between">
              <div className="flex gap-3 items-center">
                <FeaturedIcon variant="neutralOutline" Icon={IconCoin} />
                <CardTitle className="text-gray-700 font-semibold text-base">
                  Condições de pagamento
                </CardTitle>
              </div>
              <div className="flex gap-3">
                <PermissionGate permissions={['sale:quotation:edit']}>
                  <PaymentConditionsDialog quotationData={quotationData} />
                </PermissionGate>
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
              <DetailCardRowItem
                showSeparator={false}
                // showSeparator={!!data?.description}
                className="pb-4 lg:grid-cols-7"
              >
                <TextSupportingText
                  supporting="Tipo de nota"
                  text={paymentConditionsTypeObj[data?.type]?.text}
                />
                <TextSupportingText
                  supporting="Pagamento"
                  text={data?.paymentCondition?.name}
                />
                <TextSupportingText
                  supporting="Itens"
                  text={formatCurrencyToBrl(totalValue)}
                />
                <TextSupportingText
                  supporting="Desconto"
                  text={formatCurrencyToBrl(discount)}
                />
                <TextSupportingText
                  supporting="Subtotal"
                  text={formatCurrencyToBrl(finalValue)}
                />
                <TextSupportingText
                  supporting="Entrega"
                  text={formatCurrencyToBrl(deliveryValue)}
                />
                <TextSupportingText
                  supporting="Total"
                  text={formatCurrencyToBrl(total)}
                />
              </DetailCardRowItem>
              {/* {data?.description && (
                <DetailCardRowItem
                  showSeparator={false}
                  className="pb-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-1 whitespace-pre-line"
                >
                  <TextSupportingText
                    supporting="Observações"
                    text={data?.description}
                  />
                </DetailCardRowItem>
              )} */}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
