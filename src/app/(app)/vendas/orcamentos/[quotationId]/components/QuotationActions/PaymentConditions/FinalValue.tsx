import React from 'react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

import { cn, formatCurrencyToBrl } from '@/lib/utils'

import { QuotationType } from '@/types/sales/quotation'
import { QuotationPaymentConditionsType } from './schema'
import { UseFormReturn } from 'react-hook-form'

interface Props {
  form: UseFormReturn<QuotationPaymentConditionsType>
  quotationData: QuotationType
  addComissionValue: number
}

export default function FinalValue({
  form,
  quotationData,
  addComissionValue,
}: Props) {
  const { watch } = form

  const deliveryValue = quotationData?.deliveryInfo?.value ?? 0

  const installmentsAdditionalFee = watch('mainAdditionalFee')
  const downPaymentAdditionalFee = watch('downPayment.additionalFee')
  const discountTotal = watch('discount.discountTotal') || 0

  const totalAdditionalFee =
    installmentsAdditionalFee + downPaymentAdditionalFee

  // Somatório do valor total dos itens do orçamento (sem desconto)
  const itemsValue = quotationData?.quotationItems?.reduce(
    (acc, item) => acc + item?.totalValue,
    0,
  )

  // Somatório do valor final dos itens do orçamento (já com desconto)
  const itemsValueWithDiscount = quotationData?.totalValue

  const itemsDiscount = itemsValue - itemsValueWithDiscount

  const finalValue =
    itemsValueWithDiscount +
    deliveryValue +
    addComissionValue +
    totalAdditionalFee -
    discountTotal

  return (
    <HoverCard>
      <HoverCardTrigger>
        <p className="text-lg font-semibold text-nowrap">
          {formatCurrencyToBrl(finalValue)}
        </p>
        <p className="text-sm font-medium text-gray-700">Valor final</p>
      </HoverCardTrigger>
      <HoverCardContent className="max-w-56">
        <div className="text-xs grid grid-cols-2 gap-1">
          <p className="text-gray-500">Valor dos itens:</p>
          <p
            className={cn(
              'text-right',
              itemsValue > 0 ? 'text-success-800' : 'text-gray-400',
            )}
          >
            + {formatCurrencyToBrl(itemsValue)}
          </p>
          <p className="text-gray-500">Desc. dos itens:</p>
          <p
            className={cn(
              'text-right',
              itemsDiscount > 0 ? 'text-error-800' : 'text-gray-400',
            )}
          >
            - {formatCurrencyToBrl(itemsDiscount)}
          </p>
          <p className="text-gray-500">Frete:</p>
          <p
            className={cn(
              'text-right',
              deliveryValue > 0 ? 'text-success-800' : 'text-gray-400',
            )}
          >
            + {formatCurrencyToBrl(deliveryValue)}
          </p>
          <p className="text-gray-500">Comissão:</p>
          <p
            className={cn(
              'text-right',
              addComissionValue > 0 ? 'text-success-800' : 'text-gray-400',
            )}
          >
            + {formatCurrencyToBrl(addComissionValue)}
          </p>
          <p className="text-gray-500">Acréscimos:</p>
          <p
            className={cn(
              'text-right',
              totalAdditionalFee > 0 ? 'text-success-800' : 'text-gray-400',
            )}
          >
            + {formatCurrencyToBrl(totalAdditionalFee)}
          </p>
          <p className="text-gray-500">Desconto final:</p>
          <p
            className={cn(
              'text-right',
              discountTotal > 0 ? 'text-error-800' : 'text-gray-400',
            )}
          >
            - {formatCurrencyToBrl(discountTotal)}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
