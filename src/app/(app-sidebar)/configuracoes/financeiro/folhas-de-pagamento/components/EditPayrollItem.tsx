'use client'

// React
import { useEffect, useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import {
  payrollBehaviorLabel,
  type PayrollBehavior,
  type PayrollStructureItem,
} from '../types'

// Actions
import { updatePayrollItem } from '@/actions/payroll-structure'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

const behaviorOptions = (
  Object.keys(payrollBehaviorLabel) as PayrollBehavior[]
).map((value) => ({ value, label: payrollBehaviorLabel[value] }))

interface Props {
  employeeId: string
  item?: PayrollStructureItem
  onOpenChange: (open: boolean) => void
}

export function EditPayrollItem({ employeeId, item, onOpenChange }: Props) {
  const queryClient = useQueryClient()

  const [behavior, setBehavior] = useState<PayrollBehavior>('ONLY_INCREASE')
  const [increase, setIncrease] = useState(0)
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    if (!item) return

    setBehavior(item.behavior)
    setIncrease(item.increase)
    setDiscount(item.discount)
  }, [item])

  // O comportamento manda nos campos: quem só acrescenta não tem desconto a
  // preencher, e o contrário também. Em vez de aceitar um valor que será
  // ignorado, o campo some
  const showIncrease = behavior !== 'ONLY_DISCOUNT'
  const showDiscount =
    behavior === 'ONLY_DISCOUNT' || behavior === 'INCREASE_AND_DISCOUNT'

  const final = Math.max(
    0,
    (showIncrease ? increase : 0) - (showDiscount ? discount : 0),
  )

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      updatePayrollItem(employeeId, item?.id || '', {
        behavior,
        increase: showIncrease ? increase : 0,
        discount: showDiscount ? discount : 0,
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Item atualizado')
      queryClient.invalidateQueries({ queryKey: ['payroll-structure'] })
      onOpenChange(false)
    },
    onError: () => toast.error('Erro ao salvar o item'),
  })

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{item?.name}</DialogTitle>
          <DialogDescription>
            O comportamento decide onde o item entra: a provisão custa no mês e
            não aparece na folha a pagar.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <SelectBasic
            name="behavior"
            label="Comportamento na folha"
            value={behavior}
            options={behaviorOptions}
            className="flex-1"
            onChange={(value) => setBehavior(value as PayrollBehavior)}
          />

          <div className="flex flex-wrap gap-4">
            {showIncrease && (
              <div className="flex-[1_0_180px] space-y-1.5">
                <label htmlFor="increase" className="text-sm font-medium">
                  Acréscimo
                </label>
                <Input
                  id="increase"
                  type="number"
                  min={0}
                  step="0.01"
                  startAdornment={<span className="text-sm">R$</span>}
                  value={(increase / 100).toFixed(2)}
                  onChange={(event) =>
                    setIncrease(
                      Math.round(Number(event.target.value || 0) * 100),
                    )
                  }
                />
              </div>
            )}
            {showDiscount && (
              <div className="flex-[1_0_180px] space-y-1.5">
                <label htmlFor="discount" className="text-sm font-medium">
                  Desconto
                </label>
                <Input
                  id="discount"
                  type="number"
                  min={0}
                  step="0.01"
                  startAdornment={<span className="text-sm">R$</span>}
                  value={(discount / 100).toFixed(2)}
                  onChange={(event) =>
                    setDiscount(
                      Math.round(Number(event.target.value || 0) * 100),
                    )
                  }
                />
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-sm text-gray">Custo final para a empresa</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrencyToBrl(final)}
            </p>
            {behavior === 'INCREASE_AND_DISCOUNT' && discount >= increase && (
              <p className="mt-1 text-sm text-gray">
                O desconto cobre o acréscimo: este item não custa nada à
                empresa, como acontece com o INSS e o vale transporte.
              </p>
            )}
            {behavior === 'PROVISION' && (
              <p className="mt-1 text-sm text-gray">
                Entra no custo do mês e não sai na folha a pagar.
              </p>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" isLoading={isPending} onClick={() => save()}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
