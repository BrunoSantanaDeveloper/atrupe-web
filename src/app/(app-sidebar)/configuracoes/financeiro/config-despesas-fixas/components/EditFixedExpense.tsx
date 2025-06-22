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
  IconCalendarPlus,
  IconCalendarMonth,
} from '@tabler/icons-react'

// Action
import {
  getItemOld,
  updateItem,
  createItemNew,
  updateItemNew,
} from '@/actions/_cruds'

// Libs
import { cn } from '@/lib/utils'
import { recurringTypeOptions } from '@/consts/fixedExpenses'

interface Props {
  editMode?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  fixedExpenseId?: string
}

async function getFixedExpense(fixedExpenseId: string) {
  if (!fixedExpenseId) return
  const fixedExpense = await getItemOld({
    route: 'fixedExpensesConfigRoute',
    id: fixedExpenseId ?? '',
  })
  return fixedExpense
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
    queryKey: ['fixedExpensesConfigRoute', fixedExpenseId],
    queryFn: () => getFixedExpense(fixedExpenseId ?? ''),
    enabled: !!fixedExpenseId,
  })

  const form = useForm<FixedExpensesFormType>({
    resolver: zodResolver(newFixedExpensesSchema),
    mode: 'onChange',
    values: !editMode
      ? defaultFixedExpensesValues
      : {
          supplierId: {
            label: data?.supplier?.name,
            value: data?.supplier?.id,
          },
          categoryId: data?.categoryId || '',
          subCategoryId: data?.subCategoryId || '',
          recurringType: data?.recurringType || 'MONTHLY',
          dueDay: data?.dueDay || 1,
          amount: data?.amount ?? 0,
          description: data?.description || '',
        },
  })

  const { handleSubmit, reset, watch, formState } = form

  if (editMode && isLoading) return <></>

  function handleToggleModal() {
    reset(defaultFixedExpensesValues)
    onOpenChange(false)
  }

  const onSubmit = async (data: FixedExpensesFormType) => {
    const body = {
      ...data,
      supplierId: data.supplierId?.value,
    }

    try {
      if (editMode) {
        await updateItemNew({
          route: `/financial/scheduled-expense/${fixedExpenseId}`,
          data: body,
        })
        await queryClient.invalidateQueries()
        toast.success('Despesa fixa atualizada com sucesso!')
      } else {
        const result = await createItemNew({
          route: '/financial/scheduled-expense',
          data: body,
        })
        if (result.success) {
          toast.success('Despesa fixa criada com sucesso!')
        } else {
          throw new Error(result.message)
        }
      }
      await queryClient.invalidateQueries()
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      toast.error(
        `Erro ao ${editMode ? 'editar' : 'cadastrar'} despesa fixa: ${errorMessage}`,
      )
    } finally {
      handleToggleModal()
    }
  }

  const handleInactivate = async (status: boolean) => {
    const newStatus = !status

    await alertDialog.open({
      title: `Deseja ${status ? 'inativar' : 'ativar'} esta despesa fixa?`,
      confirmLabel: status ? 'Inativar' : 'Ativar',
      onConfirm: () => {
        updateItem('fixedExpensesConfigRoute', `${fixedExpenseId}`, {
          isActive: newStatus,
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
                    <FeaturedIcon variant="error" Icon={IconCalendarPlus} />
                    <span>{editMode ? 'Editar' : 'Nova'} despesa fixa</span>
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
                    'border-0 focus-within:ring-0 rounded-sm border-b-2 text-5xl font-medium h-20 [&>input]:text-right px-3',
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
                      startAdornment={<IconCalendarMonth size={20} />}
                    />
                  </div>
                </DialogBody>
              </div>
              <DialogFooter className="sm:justify-between">
                <div>
                  {editMode && (
                    <Button
                      type="button"
                      variant={data?.isActive ? 'error' : 'default'}
                      onClick={() => handleInactivate(data?.isActive)}
                    >
                      {data?.isActive ? 'Inativar' : 'Ativar'}
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
      LeftIcon={editMode ? IconPencil : IconCalendarPlus}
      onClick={() => onOpenChange(true)}
    >
      {editMode ? '' : 'Nova despesa fixa'}
    </Button>
  )
}
