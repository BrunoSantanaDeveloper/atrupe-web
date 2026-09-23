'use client'

// React / Next
import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { ContractType, PayrollEmployee, PayrollChargeKey } from '../types'

// Actions
import { updateEmployeePayroll } from '@/actions/payroll-costs'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { payrollChargeObj, contractTypeOptions } from '@/consts/payroll-costs'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPencil } from '@tabler/icons-react'

interface Props {
  employee?: PayrollEmployee
  open: boolean
  onOpenChange: () => void
}

// Encargos calculados com edição por colaborador (F-1 e F-4): a empresa pode,
// por exemplo, não descontar o INSS.
export function EmployeeCostModal({ employee, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const [contract, setContract] = useState<ContractType>('EMPLOYEE')
  const [salary, setSalary] = useState('')
  const [overrides, setOverrides] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!employee) return

    setContract(employee.contract)
    setSalary((employee.baseSalary / 100).toFixed(2))
    setOverrides(
      Object.fromEntries(
        employee.charges
          .filter((charge) => charge.override !== null)
          .map((charge) => [
            charge.key,
            ((charge.override || 0) / 100).toFixed(2),
          ]),
      ),
    )
  }, [employee])

  const baseSalary = Math.round(Number(salary || 0) * 100)
  const hasCharges = contract === 'EMPLOYEE'

  const chargeValue = (key: PayrollChargeKey, percent: number) =>
    overrides[key] !== undefined
      ? Math.round(Number(overrides[key] || 0) * 100)
      : Math.round((baseSalary * percent) / 1000)

  const total =
    baseSalary +
    (hasCharges && employee
      ? employee.charges.reduce(
          (sum, charge) => sum + chargeValue(charge.key, charge.percent),
          0,
        )
      : 0) +
    (employee?.benefits.reduce((sum, benefit) => sum + benefit.value, 0) || 0)

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateEmployeePayroll({
        id: employee?.id || '',
        contract,
        baseSalary,
        overrides: Object.fromEntries(
          (employee?.charges || []).map((charge) => [
            charge.key,
            overrides[charge.key] === undefined
              ? null
              : Math.round(Number(overrides[charge.key] || 0) * 100),
          ]),
        ),
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Custo do colaborador atualizado')
      queryClient.invalidateQueries({ queryKey: ['payroll-costs'] })
      onOpenChange()
    },
    onError: () => toast.error('Erro ao atualizar o custo'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPencil} />
            <DialogTitle>Custo de {employee?.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Salário base, forma de contratação e encargos do colaborador.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectBasic
              name="contract"
              label="Forma de contratação"
              value={contract}
              onChange={(value) => setContract(value as ContractType)}
              options={contractTypeOptions}
            />
            <div className="space-y-1.5">
              <label htmlFor="salary" className="text-sm font-medium">
                {contract === 'EMPLOYEE' ? 'Salário base' : 'Valor mensal'}
              </label>
              <Input
                id="salary"
                type="number"
                min={0}
                step="0.01"
                startAdornment={<span className="text-sm">R$</span>}
                value={salary}
                onChange={(event) => setSalary(event.target.value)}
              />
            </div>
          </div>

          {hasCharges ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Encargos</p>
              {(employee?.charges || []).map((charge) => {
                const isOverride = overrides[charge.key] !== undefined

                return (
                  <div
                    key={charge.key}
                    className="flex flex-wrap items-end gap-3"
                  >
                    <div className="space-y-1.5 flex-1 min-w-[180px]">
                      <label
                        htmlFor={`charge-${charge.key}`}
                        className="text-sm"
                      >
                        {payrollChargeObj[charge.key]}{' '}
                        <span className="text-gray">
                          ({(charge.percent / 10).toFixed(1).replace('.', ',')}
                          %)
                        </span>
                      </label>
                      <Input
                        id={`charge-${charge.key}`}
                        type="number"
                        min={0}
                        step="0.01"
                        startAdornment={<span className="text-sm">R$</span>}
                        value={
                          isOverride
                            ? overrides[charge.key]
                            : (
                                chargeValue(charge.key, charge.percent) / 100
                              ).toFixed(2)
                        }
                        onChange={(event) =>
                          setOverrides((current) => ({
                            ...current,
                            [charge.key]: event.target.value,
                          }))
                        }
                      />
                    </div>
                    {isOverride && (
                      <Button
                        type="button"
                        size="sm"
                        variant="neutralGhost"
                        onClick={() =>
                          setOverrides((current) => {
                            const next = { ...current }
                            delete next[charge.key]

                            return next
                          })
                        }
                      >
                        Voltar ao cálculo
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray">
              Esta forma de contratação não tem encargos calculados sobre o
              salário: o custo é o valor contratado.
            </p>
          )}

          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-sm text-gray">Custo total do colaborador</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrencyToBrl(total)}
            </p>
            <p className="text-sm text-gray">
              Vai para o custo do setor {employee?.sector}.
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button isLoading={isPending} onClick={() => mutate()}>
            {isPending ? 'Salvando...' : 'Salvar custo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
