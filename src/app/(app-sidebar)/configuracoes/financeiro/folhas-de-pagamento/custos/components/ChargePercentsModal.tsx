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

// Types
import type { PayrollChargeKey } from '../types'

// Actions
import { updateCompanyPercents } from '@/actions/payroll-costs'

// Hooks / Store / Consts
import { payrollChargeObj } from '@/consts/payroll-costs'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPercentage } from '@tabler/icons-react'

interface Props {
  percents?: { [key in PayrollChargeKey]: number }
}

// Percentuais da empresa, base do cálculo automático dos encargos (F-1)
export function ChargePercentsModal({ percents }: Props) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!percents) return

    setValues(
      Object.fromEntries(
        Object.entries(percents).map(([key, value]) => [
          key,
          (value / 10).toFixed(1),
        ]),
      ),
    )
  }, [percents])

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateCompanyPercents(
        Object.fromEntries(
          Object.entries(values).map(([key, value]) => [
            key,
            Math.round(Number(value || 0) * 10),
          ]),
        ),
      ),
    onSuccess: () => {
      toast.success('Percentuais atualizados')
      queryClient.invalidateQueries({ queryKey: ['payroll-costs'] })
      setOpen(false)
    },
    onError: () => toast.error('Erro ao atualizar os percentuais'),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="neutralOutline"
        LeftIcon={IconPercentage}
        onClick={() => setOpen(true)}
      >
        Percentuais dos encargos
      </Button>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPercentage} />
            <DialogTitle>Percentuais dos encargos</DialogTitle>
            <DialogDescription className="sr-only">
              Percentuais aplicados sobre o salário base dos colaboradores
              registrados.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <p className="text-sm text-gray">
            Aplicados sobre o salário base dos colaboradores registrados. Cada
            colaborador pode ter o valor alterado individualmente.
          </p>
          {(Object.keys(payrollChargeObj) as PayrollChargeKey[]).map((key) => (
            <div key={key} className="space-y-1.5">
              <label htmlFor={`percent-${key}`} className="text-sm font-medium">
                {payrollChargeObj[key]}
              </label>
              <Input
                id={`percent-${key}`}
                type="number"
                min={0}
                step="0.1"
                endAdornment={<span className="text-sm">%</span>}
                value={values[key] ?? ''}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
              />
            </div>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button isLoading={isPending} onClick={() => mutate()}>
            {isPending ? 'Salvando...' : 'Salvar percentuais'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
