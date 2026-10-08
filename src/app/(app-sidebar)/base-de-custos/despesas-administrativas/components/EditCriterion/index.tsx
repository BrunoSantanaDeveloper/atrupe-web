'use client'

// React / Next
import { useEffect } from 'react'

// UI
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
import { Button } from '@/components/ui/button'

// Components
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { FormToggleCard } from '@/components/common/form/FormToggleCard'

// Types
import type { AdminExpenseAccount, CostCriterion } from '../../../types'

// Actions
import { updateAdminExpenseCriterion } from '@/actions/cost-base'

// Hooks / Store / Consts
import { costCriterionObj } from '@/consts/cost-base'
import { formatCurrencyToBrl } from '@/lib/utils'
import { editCriterionSchema, type EditCriterionFormType } from './schema'

// Third-party
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'

// Icons

interface Props {
  account?: AdminExpenseAccount
  open: boolean
  onOpenChange: () => void
}

const averageFields: {
  criterion: CostCriterion
  key: keyof AdminExpenseAccount
}[] = [
  { criterion: 'LAST_MONTH', key: 'lastMonth' },
  { criterion: 'AVG_3', key: 'avg3' },
  { criterion: 'AVG_6', key: 'avg6' },
  { criterion: 'AVG_12', key: 'avg12' },
]

export function EditCriterionModal({ account, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<EditCriterionFormType>({
    resolver: zodResolver(editCriterionSchema),
    defaultValues: { criterion: 'LAST_MONTH', manualValue: null },
  })

  const {
    watch,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  useEffect(() => {
    if (account && open) {
      reset({ criterion: account.criterion, manualValue: account.manualValue })
    }
  }, [account, open, reset])

  // Critério sem histórico suficiente não é oferecido: não há valor a adotar.
  const options = [
    ...averageFields
      .filter(({ key }) => account?.[key] !== null)
      .map(({ criterion, key }) => ({
        value: criterion,
        label: costCriterionObj[criterion].text,
        description: formatCurrencyToBrl(account?.[key] as number),
      })),
    {
      value: 'MANUAL',
      label: costCriterionObj.MANUAL.text,
      description: 'Informar o valor mensal',
    },
  ]

  const handleFormSubmit = handleSubmit(async (values) => {
    if (!account) return

    const res = await updateAdminExpenseCriterion({
      id: account.id,
      criterion: values.criterion,
      manualValue: values.manualValue,
    })

    if (!res.success) {
      toast.error(res.message || 'Erro ao atualizar o critério')
      return
    }

    toast.success('Critério atualizado')
    queryClient.invalidateQueries({ queryKey: ['admin-expense-list'] })
    queryClient.invalidateQueries({ queryKey: ['admin-expense-totals'] })
    onOpenChange()
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle>Editar critério</DialogTitle>
              <DialogDescription>{account?.name}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <FormProvider {...form}>
            <form
              id="edit-criterion-form"
              onSubmit={handleFormSubmit}
              noValidate
              className="space-y-6"
            >
              <FormToggleCard
                name="criterion"
                options={options}
                groupClassName="flex-col gap-2"
              />
              {watch('criterion') === 'MANUAL' ? (
                <FormBrlInput<EditCriterionFormType>
                  name="manualValue"
                  label="Valor mensal"
                  startAdornment={<span className="text-gray">R$</span>}
                />
              ) : null}
            </form>
          </FormProvider>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="edit-criterion-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar critério'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
