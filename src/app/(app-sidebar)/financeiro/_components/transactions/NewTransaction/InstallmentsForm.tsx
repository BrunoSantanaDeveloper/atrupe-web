'use client'

import { Fragment } from 'react'
import { useFormContext } from 'react-hook-form'
import { IconCornerRightDown, IconRefreshDot } from '@tabler/icons-react'

// UI
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { FormDatePickerSingle } from '@/components/common/form/FormDatePicker'
import { PaymentConditionsSelectField } from '@/components/common/form/global-inputs/PaymentConditionsSelectField'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'

interface InstallmentsFormProps {
  fields: Record<'id', string>[]
  balance: number
  setBalance: (balance: number) => void
  handleRefreshBalance: () => void
}

export function InstallmentsForm({
  fields,
  balance,
  setBalance,
  handleRefreshBalance,
}: InstallmentsFormProps) {
  const form = useFormContext()

  const { setValue, clearErrors, watch } = form

  const installments = watch('installments')

  return (
    <div
      className="bg-white rounded-xl border border-gray-300 w-full space-y-6 p-6"
      id="installments"
    >
      <div
        className={cn(
          'flex justify-between gap-5 bg-gray-200 rounded-lg p-3',
          balance < 0
            ? 'bg-error-200 text-error-900'
            : balance > 0 && 'bg-success-200 text-success-900',
        )}
      >
        <div className="flex items-center gap-2">
          <FeaturedIcon
            variant={
              balance < 0
                ? 'errorLight'
                : balance > 0
                  ? 'successLight'
                  : 'neutralLight'
            }
            size="xs"
            Icon={IconCornerRightDown}
          />
          <p className="text-sm font-medium">Saldo a repassar</p>
        </div>
        <p className="text-sm font-semibold">{formatCurrencyToBrl(balance)}</p>
      </div>
      <Separator />
      {fields.map((field, index) => (
        <Fragment key={field.id}>
          <div className="flex flex-wrap gap-3">
            <p className="text-sm font-medium text-gray-700 leading-[44px] mt-5">
              {`${index + 1}/${fields.length}`}
            </p>
            <FormDatePickerSingle
              name={`installments.${index}.dueDate`}
              label="Vencimento"
              width="flex-[1_0_130px]"
            />
            <PaymentConditionsSelectField
              name={`installments.${index}.paymentConditionId`}
              label="Condição de pagamento"
              width="flex-[1_0_200px]"
            />
            <FormBrlInput
              name={`installments.${index}.amount`}
              placeholder="0,00"
              label="Valor da parcela"
              startAdornment={<>R$</>}
              width="flex-[1_0_140px]"
              additionalOnChange={handleRefreshBalance}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    LeftIcon={IconRefreshDot}
                    size="icon"
                    variant="neutralGhost"
                    className="mt-6"
                    onClick={() => {
                      const newValue = installments[index].amount + balance

                      if (newValue < 0) {
                        setValue(`installments.${index}.amount`, 0)
                        setBalance(newValue)
                      } else {
                        setValue(`installments.${index}.amount`, newValue)
                        setBalance(0)
                      }
                      clearErrors('totalValue')
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Repassar saldo para esta parcela</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Separator />
        </Fragment>
      ))}
    </div>
  )
}
