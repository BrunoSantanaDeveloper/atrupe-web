// React
import { useState, useEffect } from 'react'

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
import { IconCoin, IconFileInvoice } from '@tabler/icons-react'

// Types
import { QuotationType } from '@/types/sales/quotation'

// Util
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// Consts
import { paymentConditionsTypeObj } from '@/consts/quotations'
import { DetailCardRowItem } from '@/app/(app-sidebar)/cadastros/clientes/[id]/components/DetailCardRowItem'
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props {
  quotationData: QuotationType
}

export function QuotationPaymentConditions({ quotationData }: Props) {
  // Accordion deve estar aberto por padrão se existe pelo menos um item no orçamento
  const quotationHasItems = !!quotationData.quotationItems.length

  const [accordionValue, setAccordionValue] = useState<string | undefined>(
    quotationHasItems ? 'item-1' : undefined,
  )

  // Reage às mudanças do quotationHasItems
  useEffect(() => {
    setAccordionValue(quotationHasItems ? 'item-1' : undefined)
  }, [quotationHasItems])

  if (!quotationData) return

  const data = quotationData.paymentConditions

  // Somatório do valor final dos itens do orçamento (já com desconto)
  const finalValue = quotationData?.totalValue

  const deliveryValue = quotationData?.deliveryInfo?.value ?? 0

  // Comissão (se for do tipo ADD, soma no total)
  const commissionValue =
    data?.commission?.type === 'ADD'
      ? (data?.commission?.totalCommission ?? 0)
      : 0

  // Acréscimos das parcelas
  const installmentsAdditionalFee =
    data?.installments?.reduce(
      (acc, installment) => acc + (installment?.additionalFee ?? 0),
      0,
    ) ?? 0

  // Acréscimo da entrada
  const downPaymentAdditionalFee = data?.downPayment?.additionalFee ?? 0

  const totalAdditionalFee =
    installmentsAdditionalFee + downPaymentAdditionalFee

  // Desconto final configurado nas condições de pagamento
  const discountTotal = data?.discount?.discountTotal ?? 0

  // Cálculo do total final (igual ao do formulário)
  const total =
    finalValue +
    deliveryValue +
    commissionValue +
    totalAdditionalFee -
    discountTotal

  return (
    <Card className="w-full">
      <Accordion
        type="single"
        collapsible
        value={accordionValue}
        onValueChange={setAccordionValue}
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
                <div className="flex items-center gap-2">
                  <TextSupportingText
                    supporting="Pagamento"
                    text={data?.paymentCondition?.name}
                  />
                  {data?.paymentCondition?.generateInvoice && data?.paymentCondition?.invoiceType && (
                    <Badge variant="outline" className="text-xs font-medium border-blue-200 bg-blue-50 text-blue-700 gap-1 mt-1">
                      <IconFileInvoice className="h-3 w-3" />
                      Gera {data.paymentCondition.invoiceType === 'NFE' ? 'NF-e' : data.paymentCondition.invoiceType === 'NFSE' ? 'NFS-e' : 'NFC-e'}
                    </Badge>
                  )}
                </div>
                <PermissionGate permissions={['values:values:view']}>
                  <TextSupportingText
                    supporting="Itens"
                    text={formatCurrencyToBrl(finalValue)}
                  />
                  <TextSupportingText
                    supporting="Desconto"
                    text={formatCurrencyToBrl(discountTotal)}
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
                </PermissionGate>
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
