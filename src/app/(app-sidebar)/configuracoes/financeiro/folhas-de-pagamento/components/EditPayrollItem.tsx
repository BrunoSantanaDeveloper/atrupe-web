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
  behaviorFields,
  behaviorOptions,
  isEditableCharge,
  payrollBehaviorLabel,
  type PayrollBehavior,
  type PayrollStructureItem,
} from '../types'

// Actions
import {
  updatePayrollItem,
  resetPayrollOverride,
} from '@/actions/payroll-structure'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Digitação como no FormBrlInput: os dígitos enchem os centavos da direita
// para a esquerda, e o valor guardado é sempre centavos inteiros
const toText = (value: number) =>
  (value / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
const fromText = (text: string) => parseInt(text.replace(/\D/g, ''), 10) || 0

function MoneyInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex-[1_0_180px] space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        inputMode="numeric"
        startAdornment={<span className="text-sm">R$</span>}
        value={toText(value)}
        onChange={(event) => onChange(fromText(event.target.value))}
      />
    </div>
  )
}

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

  const isBase = !!item?.isBase
  const charge = !!item && isEditableCharge(item)
  // O salário base é sempre acréscimo, e os encargos da CLT têm o
  // comportamento do sistema: o seletor só aparece nos outros itens
  const fixedBehavior = isBase || !!item?.derivedFromSalary
  const { showIncrease, showDiscount } = behaviorFields(behavior)

  // Prévia antes de salvar; o custo que vale é o que o servidor devolve
  const final =
    behavior === 'ADVANCE'
      ? 0
      : Math.max(
          0,
          (showIncrease ? increase : 0) - (showDiscount ? discount : 0),
        )

  // Vai só o que mudou. Para o INSS e o FGTS, qualquer valor enviado vira
  // valor à mão, e no salário base refaz os encargos: salvar sem mexer não
  // pode ter esse efeito
  const changes = () => {
    if (!item) return {}

    return {
      ...(behavior !== item.behavior && { behavior }),
      ...(showIncrease && increase !== item.increase && { increase }),
      ...(showDiscount && discount !== item.discount && { discount }),
    }
  }

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => updatePayrollItem(employeeId, item?.id || '', changes()),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Item atualizado')
      queryClient.invalidateQueries({ queryKey: ['payroll-structure'] })
      onOpenChange(false)
    },
    onError: () => toast.error('Erro ao salvar o item'),
  })

  // INSS ou FGTS com valor à mão voltam a sair do salário pela alíquota; o
  // que estiver digitado no diálogo é descartado
  const { mutate: reset, isPending: isResetting } = useMutation({
    mutationFn: () => resetPayrollOverride(item?.id || ''),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success(`O ${item?.name} voltou a acompanhar o salário`)
      queryClient.invalidateQueries({ queryKey: ['payroll-structure'] })
      onOpenChange(false)
    },
    onError: () => toast.error('Erro ao voltar a calcular pelo salário'),
  })

  const submit = () => {
    if (!Object.keys(changes()).length) return onOpenChange(false)

    save()
  }

  const increaseLabel = isBase
    ? 'Salário base'
    : behavior === 'ADVANCE'
      ? 'Valor do adiantamento'
      : 'Acréscimo'

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{item?.name}</DialogTitle>
          <DialogDescription>
            {isBase
              ? 'O salário base é sempre acréscimo. Mudar o valor muda o salário base do colaborador e refaz os encargos da CLT (INSS, FGTS, 13º e férias).'
              : 'O comportamento decide onde o item entra: a provisão custa no mês e não aparece na folha a pagar.'}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {fixedBehavior ? (
            <div className="text-sm">
              <p className="font-medium text-gray-700">
                Comportamento na folha
              </p>
              <p className="text-gray">{payrollBehaviorLabel[behavior]}</p>
            </div>
          ) : (
            <SelectBasic
              name="behavior"
              label="Comportamento na folha"
              value={behavior}
              options={behaviorOptions(item?.behavior)}
              className="flex-1"
              onChange={(value) => setBehavior(value as PayrollBehavior)}
            />
          )}

          <div className="flex flex-wrap gap-4">
            {showIncrease && (
              <MoneyInput
                id="increase"
                label={increaseLabel}
                value={increase}
                onChange={setIncrease}
              />
            )}
            {showDiscount && (
              <MoneyInput
                id="discount"
                label="Desconto"
                value={discount}
                onChange={setDiscount}
              />
            )}
          </div>

          {/* O INSS e o FGTS saem do salário pela alíquota do item de custo;
              o valor à mão para de acompanhar o salário (F-4) */}
          {charge && (
            <div className="space-y-2 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700">
              <p>
                {item?.manualOverride
                  ? `O valor do ${item?.name} foi informado à mão e não acompanha mais o salário base.`
                  : `O ${item?.name} acompanha o salário base pela alíquota do item de custo. Com um valor informado aqui, ele deixa de acompanhar o salário.`}
              </p>
              {item?.manualOverride && (
                <Button
                  type="button"
                  size="sm"
                  variant="neutralOutline"
                  isLoading={isResetting}
                  disabled={isPending}
                  onClick={() => reset()}
                >
                  Voltar a calcular pelo salário
                </Button>
              )}
            </div>
          )}

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
            {behavior === 'ADVANCE' && (
              <p className="mt-1 text-sm text-gray">
                O adiantamento é parte do salário paga antes: não é custo nem
                entra na folha a pagar.
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
          <Button
            type="button"
            isLoading={isPending}
            disabled={isResetting}
            onClick={submit}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
