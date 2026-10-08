'use client'

// React
import { memo } from 'react'

// UI
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogBody,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { useAlertDialog } from '@/store/useAlertDialog'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { SupplierSelector } from '@/components/common/form/global-inputs/SupplierAsyncSelect'
import { SelectTransactionNatureField } from '@/components/common/form/global-inputs/TransactionNatureSelectField'
import { SelectTransactionCategoryField } from '@/components/common/form/global-inputs/TransactionCategorySelectField'

// Form
import {
  FixedExpensesFormType,
  newFixedExpensesSchema,
  defaultFixedExpensesValues,
} from './schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconPencil,
  IconCircleCheck,
  IconPlus,
  IconCalendarMonth,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Action
import { getItem, createItemNew, updateItemNew } from '@/actions/_cruds'

// Libs
import { cn } from '@/lib/utils'
import { recurringTypeOptions } from '@/consts/fixedExpenses'

interface Props {
  editMode?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  fixedExpenseId?: string
}

function NewFixedExpenseModal({
  editMode,
  fixedExpenseId,
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient()

  const alertDialog = useAlertDialog()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['fixedExpensesConfig', fixedExpenseId],
    queryFn: () =>
      getItem({
        route: `/financial/scheduled-expense/${fixedExpenseId}`,
      }),
    enabled: !!fixedExpenseId,
  })

  const fixedExpense = data?.data

  const form = useForm<FixedExpensesFormType>({
    resolver: zodResolver(newFixedExpensesSchema),
    mode: 'onChange',
    values: !editMode
      ? defaultFixedExpensesValues
      : {
          supplierId: {
            label: fixedExpense?.supplier?.name,
            value: fixedExpense?.supplier?.id,
          },
          categoryId: fixedExpense?.categoryId || '',
          subCategoryId: fixedExpense?.subCategoryId || '',
          recurringType: fixedExpense?.recurringType || 'MONTHLY',
          dueDay: fixedExpense?.dueDay || 1,
          amount: fixedExpense?.amount ?? 0,
          description: fixedExpense?.description || '',
        },
  })

  const { handleSubmit, reset, watch, formState } = form

  if (editMode && (isLoading || !fixedExpense || !data.success)) return null

  function handleToggleModal() {
    onOpenChange(false)
    reset(defaultFixedExpensesValues)
  }

  const onSubmit = async (data: FixedExpensesFormType) => {
    const body = {
      ...data,
      supplierId: data.supplierId?.value,
    }

    const res = editMode
      ? await updateItemNew({
          route: `/financial/scheduled-expense/${fixedExpenseId}`,
          data: body,
        })
      : await createItemNew({
          route: '/financial/scheduled-expense',
          data: body,
        })

    if (!res.success) {
      toast.error(
        res.message ||
          `${editMode ? 'Erro ao editar' : 'Erro ao cadastrar'} despesa fixa.`,
      )
      return
    }

    handleToggleModal()

    toast.success('Despesa fixa salva')

    queryClient.invalidateQueries()
  }

  const handleInactivate = async (status: boolean) => {
    const newStatus = !status

    await alertDialog.open({
      title: `Deseja ${status ? 'inativar' : 'ativar'} esta despesa fixa?`,
      confirmLabel: status ? 'Inativar' : 'Ativar',
      onConfirm: async () => {
        await updateItemNew({
          route: `/financial/scheduled-expense/${fixedExpenseId}`,
          data: {
            isActive: newStatus,
          },
        })
        queryClient.invalidateQueries()
        handleToggleModal()
      },
      toastMsg: {
        loading: `${newStatus ? 'Ativando' : 'Inativando'} despesa fixa...`,
        success: `Despesa fixa ${newStatus ? 'ativada' : 'inativada'} com sucesso!`,
        error: `Erro ao ${newStatus ? 'ativar' : 'inativar'} despesa fixa`,
      },
    })
  }

  return (
    <PermissionGate
      permissions={[
        'financial_settings:fixed_expenses:view',
        editMode
          ? 'financial_settings:fixed_expenses:edit'
          : 'financial_settings:fixed_expenses:create',
      ]}
      requireAll={true}
    >
      <Dialog open={open} onOpenChange={handleToggleModal}>
        <DialogContent className="sm:max-w-[950px]">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <DialogHeader>
                <DialogTitle>
                  <div className="flex items-center gap-4">
                    <FeaturedIcon variant="error" Icon={IconPlus} />
                    <span>
                      {editMode ? 'Editar despesa fixa' : 'Nova despesa fixa'}
                    </span>
                  </div>
                </DialogTitle>
                <DialogDescription hidden></DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap">
                <FormBrlInput
                  name="amount"
                  placeholder="0,00"
                  startAdornment={<span className="text-2xl">R$</span>}
                  width="w-full [&_.form-message]:ml-auto [&_.form-message]:mr-6 [&_.form-message]:pb-2"
                  className={cn(
                    'border-0 focus-within:ring-0 rounded-sm border-b-2 h-20 [&>input]:text-2xl [&>input]:font-medium [&>input]:text-right px-3',
                    'text-error-700 border-error-600 focus-within:border-error-600 bg-error-25 [&>input]:placeholder:text-error-800',
                  )}
                />
                <DialogBody className="max-h-[calc(100vh-320px)]">
                  <div className="flex flex-wrap gap-5">
                    <SupplierSelector
                      name="supplierId"
                      label="Fornecedor"
                      width="flex-[1_0_300px]"
                    />
                    <FormInput
                      name="description"
                      label="Descrição"
                      width="flex-[1_0_300px]"
                    />
                    <SelectTransactionNatureField
                      name="categoryId"
                      label="Categoria"
                      width="flex-[1_0_300px]"
                      type="payable"
                    />
                    <SelectTransactionCategoryField
                      name="subCategoryId"
                      label="Subcategoria"
                      width="flex-[1_0_300px]"
                      natureId={watch('categoryId')}
                    />
                    <FormSelect<FixedExpensesFormType>
                      name="recurringType"
                      label="Se repete"
                      width="flex-[1_0_300px]"
                      options={recurringTypeOptions}
                    />
                    <FormInput
                      name="dueDay"
                      label="Dia do vencimento"
                      type="number"
                      min={1}
                      max={31}
                      width="flex-[1_0_300px]"
                      startAdornment={<IconCalendarMonth size={ICON_SIZE.md} />}
                    />
                  </div>
                </DialogBody>
              </div>
              <DialogFooter className="sm:justify-between">
                <div>
                  {editMode && (
                    <Button
                      type="button"
                      variant={fixedExpense?.isActive ? 'error' : 'default'}
                      onClick={() => handleInactivate(fixedExpense?.isActive)}
                    >
                      {fixedExpense?.isActive ? 'Inativar' : 'Ativar'}
                    </Button>
                  )}
                </div>
                <div className="space-x-4">
                  {process.env.NODE_ENV === 'development' && (
                    <Button
                      type="button"
                      variant="neutralOutline"
                      onClick={() => {
                        form.trigger()
                        console.info(form.getValues())
                        console.info(form.formState.errors)
                      }}
                    >
                      Teste
                    </Button>
                  )}
                  <DialogTrigger asChild>
                    <Button type="button" variant="neutralOutline">
                      Cancelar
                    </Button>
                  </DialogTrigger>
                  <Button
                    type="submit"
                    RightIcon={IconCircleCheck}
                    isLoading={formState.isSubmitting}
                  >
                    Salvar
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  )
}

export const NewFixedExpense = memo(NewFixedExpenseModal)

export function NewFixedExpenseTriggerButton({
  editMode,
  onOpenChange,
}: {
  editMode?: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Button
      type="button"
      variant={editMode ? 'neutralGhost' : 'error'}
      size={editMode ? 'icon' : 'default'}
      LeftIcon={editMode ? IconPencil : IconPlus}
      onClick={() => onOpenChange(true)}
    >
      {editMode ? '' : 'Nova despesa fixa'}
    </Button>
  )
}
