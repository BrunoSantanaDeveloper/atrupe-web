'use client'

// React
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

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
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

// Components
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { FormDatePickerInput } from '@/components/common/form/FormDatePickerInput'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Lib
import { formatCurrencyToBrl } from '@/lib/utils'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Types
import type { FixedExpenseItemType } from '@/types/financial/fixedExpenses'

const schema = z.object({
  competenceDate: z.date({
    required_error: 'Data de competência é obrigatória',
  }),
  dueDate: z.date({
    required_error: 'Data de vencimento é obrigatória',
  }),
  amount: z.number().min(0.01, 'Digite um valor'),
  notes: z.string().optional(),
  markAsPaid: z.boolean().default(false),
  paidDate: z.date().optional(),
})

type FormType = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FixedExpenseItemType | null
  month: number
  year: number
  onSuccess?: () => void
}

export function LaunchMovementModal({
  open,
  onOpenChange,
  item,
  month,
  year,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
  })

  const { handleSubmit, reset, watch, setValue, formState } = form
  const markAsPaid = watch('markAsPaid')

  useEffect(() => {
    if (item && open) {
      form.reset({
        competenceDate: item ? new Date(year, month, item.dueDay) : new Date(),
        dueDate: item ? new Date(year, month, item.dueDay) : new Date(),
        amount: item.amount || 0,
        notes: '',
        markAsPaid: false,
        paidDate: new Date(),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, open])

  const onSubmit = async (data: FormType) => {
    if (!item) return

    const payload = {
      scheduledExpenseIds: [item.id],
      competenceDate: data.competenceDate,
      dueDate: data.dueDate,
      amount: data.amount,
      notes: data.notes,
      markAsPaid: data.markAsPaid,
      paidDate: data.markAsPaid && data.paidDate ? data.paidDate : undefined,
    }

    const res = await createItemNew({
      route: '/financial/scheduled-expense/launch',
      data: payload,
    })

    if (!res.success) {
      toast.error('Erro ao lançar despesa fixa')
      return
    }

    toast.success('Lançamento realizado')
    queryClient.invalidateQueries()
    reset()
    onOpenChange(false)
    onSuccess?.()
  }

  const handleOpenChange = (openDialog: boolean) => {
    if (!openDialog) {
      reset()
    }
    onOpenChange(openDialog)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[644px]">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <DialogHeader>
              <div className="flex items-center gap-4">
                <DialogTitle>Lançar movimentação</DialogTitle>
              </div>
              <DialogDescription hidden></DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
                <FormDatePickerInput
                  name="competenceDate"
                  label="Data da competência"
                />
                <FormDatePickerInput
                  name="dueDate"
                  label="Data de vencimento"
                />
                <FormBrlInput
                  name="amount"
                  label="Valor"
                  placeholder="0,00"
                  startAdornment={<>R$</>}
                />
              </div>
              <FormTextarea
                name="notes"
                label="Observação da movimentação"
                placeholder="Digite aqui"
                rows={4}
              />
              <div className="flex flex-wrap items-center gap-6 pt-1">
                <div className="flex items-center gap-3">
                  <Switch
                    id="markAsPaid"
                    checked={markAsPaid}
                    onCheckedChange={(checked) =>
                      setValue('markAsPaid', checked)
                    }
                  />
                  <Label htmlFor="markAsPaid" className="cursor-pointer">
                    Marcar como pago
                  </Label>
                </div>
                {markAsPaid && (
                  <FormDatePickerInput
                    name="paidDate"
                    label="Data de pagamento"
                  />
                )}
              </div>
            </DialogBody>
            <DialogFooter className="sm:justify-between">
              <div>
                <p className="text-lg font-semibold">
                  {formatCurrencyToBrl(item?.amount || 0)}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  Valor padrão
                </p>
              </div>
              <div className="space-x-4">
                <Button
                  type="button"
                  variant="neutralOutline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  RightIcon={IconCircleCheck}
                  isLoading={formState.isSubmitting}
                >
                  Lançar
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
