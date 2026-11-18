import { InfoHint } from '@/components/common/InfoHint'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { Switch } from '@/components/ui/switch'
import { NewClientFormType } from '../schema'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'

export function CreditLimitTab() {
  const { control, watch, setValue, trigger } =
    useFormContext<NewClientFormType>()

  const paymentMethods = useFieldArray({
    name: 'creditLimit.paymentMethods',
    control,
  })

  const creditLimit = watch('creditLimit')

  useEffect(() => {
    paymentMethods.replace(creditLimit.paymentMethods)

    // Conversão dos valores minValue e maxValue para BRL
    if (creditLimit.minValue > 0) {
      setValue('creditLimit.minValue', creditLimit.minValue)
      trigger('creditLimit.minValue')
    }
    if (creditLimit.maxValue > 0) {
      setValue('creditLimit.maxValue', creditLimit.maxValue || 0)
      trigger('creditLimit.maxValue')
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditLimit])

  return (
    <PermissionGate
      permissions={['register:credit_limit:view']}
      fallback={
        <div className="text-center p-4">
          Você não tem permissão para gerenciar limites de crédito
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormBrlInput
              name="creditLimit.minValue"
              label="Valor mínimo para venda"
              placeholder="0,00"
              startAdornment={<>R$</>}
              width="flex-[1_0_200px]"
            />
          </div>
          <div>
            <FormBrlInput
              name="creditLimit.maxValue"
              label="Valor máximo para venda"
              placeholder="0,00"
              startAdornment={<>R$</>}
              width="flex-[1_0_200px]"
            />
          </div>
        </div>

        <div className="space-y-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between py-2 border-b h-11 bg-white cursor px-6 border-gray-50 text-gray-500 text-xs rounded-t-lg">
            <p>Forma de pagamento</p>
            <p>Parcelamento</p>
            <p></p>
          </div>
          {paymentMethods.fields.map((method, methodIndex) => (
            <div key={method.id}>
              <div className="w-full bg-gray-100 h-11 px-6 border-gray-200 flex items-center">
                <h3 className="type-body-strong">{method.name}</h3>
              </div>

              <div className="">
                {method.conditions.map((condition, conditionIndex) => (
                  <div
                    key={`${methodIndex}-${conditionIndex}`}
                    className={cn(
                      'flex items-center justify-between py-2 border-b h-[72px] bg-white cursor px-6 border-gray-200 text-gray-900 text-sm',
                      conditionIndex === method.conditions.length - 1 &&
                        'border-y border-gray-200 rounded-b-lg',
                    )}
                  >
                    <p>{condition.name}</p>
                    <p>{condition.name}</p>
                    <Switch
                      defaultChecked={condition.isActive}
                      onCheckedChange={(checked) => {
                        setValue(
                          `creditLimit.paymentMethods.${methodIndex}.conditions.${conditionIndex}.isActive`,
                          checked,
                        )
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <div className="flex items-center space-x-4 bg-white border border-gray-200 rounded-lg p-6">
            <Switch
              id="blockClient"
              checked={watch('creditLimit.blockClient')}
              onCheckedChange={(checked) => {
                setValue('creditLimit.blockClient', checked)
              }}
              className="data-[state=checked]:bg-red-500"
            />
            <label
              htmlFor="blockClient"
              className="type-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Bloquear cliente
            </label>
          </div>
        </div>

        {/* Pagamento antes da produção (PA-1, 12/11/2026): para quem já deu
            problema, vender sem recusar e sem gastar material antes */}
        <div className="flex items-start space-x-4 bg-white border border-gray-200 rounded-lg p-6">
          <Switch
            id="requirePrepayment"
            checked={!!watch('creditLimit.requirePrepayment')}
            onCheckedChange={(checked) => {
              setValue('creditLimit.requirePrepayment', checked)
            }}
          />
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="requirePrepayment"
              className="type-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Exigir pagamento antecipado
            </label>
            <InfoHint title="Exigir pagamento antecipado">
              <p>
                Para o cliente que precisa pagar antes. A venda pode ser
                aprovada, mas só vai para a produção depois do pagamento.
              </p>
              <p>
                Aprovada, ela espera em Orçamentos, na aba ⚠️ Pendente, e o
                financeiro recebe o total num título marcado ⚠️ Pendência.
              </p>
              <p>
                Quando o título é baixado, a venda segue sozinha para a
                produção.
              </p>
            </InfoHint>
          </div>
        </div>
      </div>
    </PermissionGate>
  )
}
