'use client'

// React
import { useEffect, useMemo, useState } from 'react'

// UI
import { toast } from 'sonner'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormSwitch } from '@/components/common/form/FormSwitch'
import { SelectBankField } from '@/components/common/form/global-inputs/BanksSelectField'

// Icons
import {
  IconCirclePlus,
  IconCircleCheck,
  IconBuildingBank,
} from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { schema, type FormType } from './schema'
import { useQueryClient } from '@tanstack/react-query'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { BankAccountsType } from '@/types/financial/bank'

// Hooks
import { usePaymentConditions } from '@/hooks/queries/usePaymentConditions'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

// Actions
import { createItemNew, updateItemNew } from '@/actions/_cruds'

import { PermissionGate } from '@/components/common/PermissionGate'

const paymentOptions = [
  { value: 'PAYSOFF', label: 'Compensar na baixa' },
  { value: 'PROVISION', label: 'Provisionar na baixa' },
]

interface Props extends SearchParamsType {
  editMode?: boolean
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: BankAccountsType
}

export function NewBankAccountDialog({
  open,
  setOpen,
  rowData,
  editMode,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const queryClient = useQueryClient()
  const { hasFinancialModule, canProvision } = usePlanFeatures()

  const paymentConditions = usePaymentConditions({ listAll: true })

  const bankAccountCashControl = useMemo(
    () =>
      paymentConditions.data?.flatMap((paymentMethodGroup) =>
        paymentMethodGroup.conditions.map((condition) => ({
          acceptIncomes: false,
          incomeType: 'PAYSOFF',
          acceptPayments: false,
          paymentType: 'PAYSOFF',
          paymentConditionId: condition.id,
        })),
      ) || [],
    [paymentConditions.data],
  )

  const formValues = useMemo(() => {
    return {
      name: rowData?.name || '',
      bankId: rowData?.bankId || '',
      description: rowData?.description || '',
      cashControl: !!rowData?.cashControl || true,
      bankAccountCashControl: editMode
        ? (rowData?.bankAccountCashControl || []).map((item) => ({
            ...item,
            acceptPayments: item.acceptPayments || false,
            acceptIncomes: item.acceptIncomes || false,
            paymentType: item.paymentType || 'PAYSOFF',
            incomeType: item.incomeType || 'PAYSOFF',
            paymentConditionId: item.paymentCondition?.id || '',
          }))
        : bankAccountCashControl,
    }
  }, [rowData, bankAccountCashControl, editMode])

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: formValues,
  })

  const { handleSubmit, control, watch, reset } = form

  const { fields } = useFieldArray({
    name: 'bankAccountCashControl',
    control,
  })

  useEffect(() => setDialogOpen(open ?? false), [open])

  const onSubmit = async (data: FormType) => {
    const res = editMode
      ? await updateItemNew({ route: `/bank/account/${rowData?.id}`, data })
      : await createItemNew({ route: '/bank/account', data })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    queryClient.invalidateQueries()
    toast.success('Sucesso!')
    handleOpenChange(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => reset(formValues), 300)
    }
    setOpen?.(open ? 'edit' : '')
    setDialogOpen(open)
  }

  return (
    <PermissionGate
      permissions={[
        'financial_settings:bank_accounts:view',
        editMode
          ? 'financial_settings:bank_accounts:edit'
          : 'financial_settings:bank_accounts:create',
      ]}
      requireAll={true}
    >
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        {!editMode && (
          <DialogTrigger asChild>
            <Button type="button" LeftIcon={IconCirclePlus}>
              Nova conta
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[855px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <FeaturedIcon
                  variant="neutralOutline"
                  Icon={IconBuildingBank}
                />
                <span>{editMode ? 'Editar conta' : 'Nova conta'}</span>
              </div>
            </DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Form {...form}>
              <form
                id="new-bank-account"
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-wrap gap-5"
                noValidate
              >
                <FormInput<FormType>
                  name="name"
                  label="Referência da conta"
                  placeholder="Conta principal"
                  width="flex-[1_0_200px]"
                />
                <FormInput<FormType>
                  name="description"
                  label="Descrição"
                  placeholder="Conta para as principais transações da empresa"
                  width="flex-[1_0_400px]"
                />
                <SelectBankField<FormType>
                  name="bankId"
                  label="Banco"
                  width="flex-[1_0_600px]"
                />
                {hasFinancialModule('cash') && (
                  <FormSwitch<FormType>
                    name="cashControl"
                    label="Controle de Caixa"
                    className="w-full"
                  />
                )}
                <div className="w-full border rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[33%]">
                          Forma de pagamento
                        </TableHead>
                        <TableHead className="w-[33%]">
                          Recebimento (Receitas)
                        </TableHead>
                        <TableHead className="w-[33%]">
                          Pagamentos (Despesas)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields?.map((field, index) => {
                        // Buscar condição de pagamento pelo ID
                        const condition = paymentConditions.data
                          ?.flatMap((group) => group.conditions)
                          .find((cond) => cond.id === field.paymentConditionId)

                        const displayName = condition?.name || 'Desconhecido'

                        return (
                          <TableRow key={field.id}>
                            <TableCell className="font-semibold text-gray-700">
                              {displayName}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <FormSwitch<FormType>
                                  name={`bankAccountCashControl.${index}.acceptIncomes`}
                                  label="Aceita recebimento"
                                  className="w-full"
                                />
                                {canProvision() && (
                                  <FormSelect<FormType>
                                    name={`bankAccountCashControl.${index}.incomeType`}
                                    options={paymentOptions}
                                    placeholder="Selecione"
                                    width="flex-[1_0_200px]"
                                    disabled={
                                      !watch(
                                        `bankAccountCashControl.${index}.acceptIncomes`,
                                      )
                                    }
                                  />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <FormSwitch<FormType>
                                  name={`bankAccountCashControl.${index}.acceptPayments`}
                                  label="Aceita pagamento"
                                  className="w-full"
                                />
                                {canProvision() && (
                                  <FormSelect<FormType>
                                    name={`bankAccountCashControl.${index}.paymentType`}
                                    options={paymentOptions}
                                    placeholder="Selecione"
                                    width="flex-[1_0_200px]"
                                    disabled={
                                      !watch(
                                        `bankAccountCashControl.${index}.acceptPayments`,
                                      )
                                    }
                                  />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </form>
            </Form>
          </DialogBody>
          <DialogFooter>
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              form="new-bank-account"
              isLoading={form.formState.isSubmitting}
              RightIcon={IconCircleCheck}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  )
}
