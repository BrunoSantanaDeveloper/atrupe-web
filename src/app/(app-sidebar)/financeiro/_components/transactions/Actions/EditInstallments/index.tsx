'use client'

// React
import { Fragment, useEffect, useState } from 'react'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { ChangeTotalValueAlertDialog } from './ChangeValue/ChangeValueAlert'
import { FormDatePickerSingle } from '@/components/common/form/FormDatePicker'
import { PaymentConditionsSelectField } from '@/components/common/form/global-inputs/PaymentConditionsSelectField'

// Icons
import {
  IconTrash,
  IconPencil,
  IconCirclePlus,
  IconRefreshDot,
  IconCircleCheck,
  IconCornerRightDown,
} from '@tabler/icons-react'

// Form Imports
import { schema, type FormType } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'

// Lib
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Types
import {
  TransactionListType,
  TransactionDetailsType,
} from '@/types/financial/financialFlow'

// Actions
import { getItem, updateItemNew } from '@/actions/_cruds'

// import { addMonths } from 'date-fns'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  rowData?: TransactionListType
  type?: 'receivable' | 'payable'
}

export function EditInstallments({ open, rowData, setOpen, type }: Props) {
  const [openAlert, setOpenAlert] = useState(false)
  const [balance, setBalance] = useState(0)
  const [newInstallmentData, setNewInstallmentData] = useState<FormType>({
    installments: [],
  })

  const queryClient = useQueryClient()

  const { data: transactionData, isLoading } = useQuery({
    queryKey: ['transaction-details', rowData?.id],
    queryFn: () =>
      getItem({
        route: `/financial/${type}/${rowData?.id}`,
      }),
    enabled: !!rowData?.id && open,
  })

  const data: TransactionDetailsType = transactionData?.data

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
  })

  const { watch, reset, control, setValue, handleSubmit, formState } = form

  const { append, fields, remove } = useFieldArray({
    name: 'installments',
    control,
  })

  const installments = watch('installments')

  useEffect(() => {
    if (!open || !data) {
      reset({ installments: [] })
      return
    }

    const defaultValues = data?.installments?.map((item) => {
      return {
        id: item.id,
        originalId: item.id,
        amount: item?.amount || 0,
        additionalFee: item?.additionalFee || 0,
        dueDate: item?.dueDate
          ? new Date(item?.dueDate)
          : (null as unknown as Date),
        paymentCondition: item?.paymentCondition?.id || '',
      }
    })

    reset({ installments: defaultValues || [] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, open])

  // Atualiza o balance automaticamente quando as parcelas mudarem
  useEffect(() => {
    if (!data?.totalAmount || !installments) return

    const installmentsTotalValue = installments.reduce(
      (acc, field) => acc + field.amount,
      0,
    )

    const newBalance = data?.totalAmount - installmentsTotalValue
    setBalance(newBalance)
  }, [installments, data?.totalAmount])

  // Set remaining balance
  const handleRefreshBalance = () => {
    if (!data?.totalAmount) return

    const installmentsTotalValue = installments.reduce(
      (acc, field) => acc + field.amount,
      0,
    )

    const newBalance = data?.totalAmount - installmentsTotalValue

    setBalance(newBalance)

    return newBalance
  }

  const handleOpenChange = (openDialog: boolean) => {
    if (!openDialog) {
      setBalance(0)
      setOpen('')
      return
    }
    setOpen('edit-installments')
  }

  const onSubmit = async (data: FormType) => {
    if (handleRefreshBalance() !== 0) {
      setNewInstallmentData(data)
      setOpenAlert(true)
      return
    }

    const result = await updateItemNew({
      route: `financial/${type}/${rowData?.id}/upsert-installments`,
      data,
    })

    if (result.success) {
      queryClient.invalidateQueries()
      toast.success('Parcelas salvas!')
      handleOpenChange(false)
    } else {
      toast.error('Ocorreu um erro!')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[950px]">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconPencil} />
              <div className="min-w-0">
                <DialogTitle className="mb-1">Editar parcelas</DialogTitle>
                <DialogDescription className="truncate">
                  {`${rowData?.client?.name || rowData?.supplier?.name || rowData?.employee?.name || ''} - ${rowData?.description}`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="flex flex-wrap">
                <DialogBody className="w-full">
                  {isLoading ? (
                    <div className="bg-white rounded-xl border border-gray-300 space-y-6 p-6">
                      <p className="text-center text-gray-500">Carregando...</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-300 space-y-6 p-6">
                      <div
                        className={cn(
                          'flex justify-between gap-5 bg-gray-200 rounded-lg p-3',
                          balance < 0
                            ? 'bg-error-200 text-error-900'
                            : balance > 0 && 'bg-success-200 text-success-900',
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <FeaturedIcon
                            variant={
                              balance < 0
                                ? 'errorLight'
                                : balance > 0
                                  ? 'successLight'
                                  : 'neutralLight'
                            }
                            size="xs"
                            Icon={IconCornerRightDown}
                          />
                          <p className="text-sm font-medium">
                            Saldo a repassar
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatCurrencyToBrl(balance)}
                        </p>
                      </div>
                      <Separator />
                      {fields.map((field, index) => {
                        const currentInstallment = data?.installments?.find(
                          (item) => item.id === field.originalId,
                        )

                        const isCurrent =
                          field.originalId === rowData?.currentInstallment?.id

                        const canEdit =
                          currentInstallment?.status === 'PENDING' || // Para parcelas ainda não pagas
                          currentInstallment?.status === 'OVERDUE' || // Para parcelas vencidas não pagas
                          !currentInstallment?.status // Para parcelas que acabaram de ser adicionadas

                        const canRemove = fields.length > 1 && canEdit

                        return (
                          <Fragment key={field.id + index}>
                            <div
                              className={cn(
                                !canEdit && 'opacity-50 pointer-events-none',
                                'flex flex-wrap gap-3',
                              )}
                            >
                              <p
                                className={cn(
                                  'text-sm font-medium text-gray-700 leading-[44px] mt-5',
                                  isCurrent && 'font-bold',
                                )}
                              >
                                {`${currentInstallment?.installmentNumber || index + 1}/${fields.length}`}
                              </p>
                              <FormDatePickerSingle
                                name={`installments.${index}.dueDate`}
                                label="Vencimento"
                                width="flex-[1_0_130px]"
                              />
                              <PaymentConditionsSelectField
                                name={`installments.${index}.paymentConditionId`}
                                label="Condição de pagamento"
                                width="flex-[1_0_200px]"
                              />
                              <FormBrlInput
                                name={`installments.${index}.additionalFee`}
                                placeholder="0,00"
                                label="Acréscimo"
                                startAdornment={<>R$</>}
                                disabled
                              />
                              <FormBrlInput
                                name={`installments.${index}.amount`}
                                placeholder="0,00"
                                label="Valor da parcela"
                                startAdornment={<>R$</>}
                                additionalOnChange={handleRefreshBalance}
                              />
                              <div className="mt-6">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        LeftIcon={IconRefreshDot}
                                        size="icon"
                                        variant="neutralGhost"
                                        className={cn(
                                          !canEdit &&
                                            'opacity-0 pointer-events-none',
                                        )}
                                        onClick={() => {
                                          const newValue =
                                            installments[index].amount + balance
                                          if (newValue < 0) {
                                            setValue(
                                              `installments.${index}.amount`,
                                              0,
                                            )
                                            setBalance(newValue)
                                          } else {
                                            setValue(
                                              `installments.${index}.amount`,
                                              newValue,
                                            )
                                            setBalance(0)
                                          }
                                        }}
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Repassar saldo para esta parcela</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        LeftIcon={IconTrash}
                                        size="icon"
                                        variant="neutralGhost"
                                        onClick={() =>
                                          canRemove && remove(index)
                                        }
                                        className={cn(
                                          !canRemove &&
                                            'opacity-0 pointer-events-none',
                                        )}
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Remover parcela</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                            <Separator />
                          </Fragment>
                        )
                      })}
                      <Button
                        type="button"
                        variant="none"
                        className="flex justify-center items-center mx-auto gap-3 py-8"
                        onClick={() => {
                          // const lastIndex = data?.installments?.length - 1 // TODO: Add nova data

                          // const nextMonth = addMonths(
                          // new Date(data?.installments[lastIndex]?.dueDate),
                          // )

                          append({
                            dueDate: null as unknown as Date,
                            paymentConditionId: '',
                            amount: 0,
                            additionalFee: 0,
                          })
                        }}
                      >
                        <FeaturedIcon
                          variant="light"
                          Icon={IconCirclePlus}
                          rounded
                        />
                        <p className="text-sm text-gray-600 font-medium">
                          Adicionar parcela
                        </p>
                      </Button>
                    </div>
                  )}
                </DialogBody>
              </div>
              <DialogFooter className="sm:justify-between">
                <div className="flex gap-6">
                  <div>
                    <p className="text-lg font-semibold">
                      {formatCurrencyToBrl(data?.totalAmount)}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      Valor do título
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {formatCurrencyToBrl(data?.totalPaid)}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {type === 'payable' ? 'Valor pago' : 'Valor recebido'}
                    </p>
                  </div>
                </div>
                <div className="space-x-4">
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
      <ChangeTotalValueAlertDialog
        open={openAlert}
        setOpen={setOpenAlert}
        rowData={data}
        submitData={newInstallmentData}
        type={type}
        onCloseParentDialog={() => handleOpenChange(false)}
      />
    </>
  )
}
