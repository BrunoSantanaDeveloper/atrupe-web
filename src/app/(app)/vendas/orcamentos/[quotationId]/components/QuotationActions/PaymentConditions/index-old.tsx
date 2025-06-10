// import { Fragment, useEffect, useState } from 'react'

// // UI
// import { toast } from 'sonner'
// import {
//   Dialog,
//   DialogBody,
//   DialogTitle,
//   DialogFooter,
//   DialogHeader,
//   DialogContent,
//   DialogTrigger,
//   DialogDescription,
// } from '@/components/ui/dialog'
// import {
//   HoverCard,
//   HoverCardTrigger,
//   HoverCardContent,
// } from '@/components/ui/hover-card'
// import { Form } from '@/components/ui/form'
// import { Separator } from '@/components/ui/separator'
// import { FeaturedIcon } from '@/components/ui/featured-icon'
// import { Button, buttonVariants } from '@/components/ui/button'

// // Components
// import { CommissionDialog } from './Commission'
// import { ActionButton } from '@/components/common/ActionButton'
// import { FormSelect } from '@/components/common/form/FormSelect'
// import { FormTextarea } from '@/components/common/form/FormTextarea'
// import { FormDatePickerSingle } from '@/components/common/form/FormDatePicker'
// import { FormCurrencyInput } from '@/components/common/form/FormCurrencyInput'
// import { SelectPaymentMethodField } from '@/components/common/form/global-inputs/PaymentMethodsSelectField'
// import { PaymentConditionsSelectField } from '@/components/common/form/global-inputs/PaymentConditionsSelectField'
// import { AllPaymentConditionsSelectField } from '@/components/common/form/global-inputs/AllPaymentConditionsSelectField'

// // Form
// import {
//   quotationPaymentConditionsSchema,
//   type QuotationPaymentConditionsType,
// } from './schema'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useFieldArray, useForm } from 'react-hook-form'
// import { usePaymentConditionById } from '@/hooks/queries/usePaymentConditionById'

// // Icons
// import { IconCoin, IconPencil, IconCircleCheck } from '@tabler/icons-react'

// // Third-party
// import {
//   useMutation,
//   useIsFetching,
//   useQueryClient,
// } from '@tanstack/react-query'
// import { addMonths } from 'date-fns'

// // Actions
// import { updateItem } from '@/actions/_cruds'

// // Libs
// import { actionDisabled } from '@/lib/quotation'
// import { cn, brlToFloat, floatToBrl, formatCurrencyToBrl } from '@/lib/utils'

// // Types
// import { QuotationType } from '@/types/sales/quotation'
// import { billingOptions } from '@/app/(app)/configuracoes/vendas/series-de-venda/components/EditItem'

// // Third-party

// const typeOptions = [
//   { value: 'NFE', label: 'NF-e' },
//   { value: 'NFSE', label: 'NFS-e' },
//   { value: 'OTHER', label: 'A definir' },
// ]

// const dueDate = new Date()

// interface Props {
//   quotationData: QuotationType
// }

// export function PaymentConditionsDialog({ quotationData }: Props) {
//   const [open, setOpen] = useState(false)
//   const [balance, setBalance] = useState(0)
//   const [commissionValue, setCommissionValue] = useState(
//     quotationData?.paymentConditions?.commission?.totalCommission || 0,
//   )

//   const isFetching = useIsFetching()

//   const queryClient = useQueryClient()

//   const form = useForm<QuotationPaymentConditionsType>({
//     resolver: zodResolver(quotationPaymentConditionsSchema),
//   })

//   const {
//     watch,
//     reset,
//     control,
//     setValue,
//     setError,
//     getValues,
//     clearErrors,
//     handleSubmit,
//   } = form

//   const paymentConditions = quotationData?.paymentConditions

//   useEffect(() => {
//     if (open) {
//       reset({
//         type: paymentConditions?.type || 'NFE',
//         billing: paymentConditions?.billing || 'ON_ORDER',
//         discount: floatToBrl(
//           paymentConditions?.discount || 0,
//         ) as unknown as number,
//         discountType: paymentConditions?.discountType || 'VALUE',

//         hasDownPayment:
//           paymentConditions?.downPayment?.amount > 0 ? 'true' : 'false',
//         downPayment: {
//           paymentConditionId:
//             paymentConditions?.downPayment?.paymentConditionId || '',
//           dueDate: new Date(),
//           additionalFee: floatToBrl(
//             paymentConditions?.downPayment?.additionalFee || 0,
//           ) as unknown as number,
//           amount: floatToBrl(
//             paymentConditions?.downPayment?.amount || 0,
//           ) as unknown as number,
//         },
//         paymentMethodId: paymentConditions?.paymentMethod?.id || '',
//         paymentConditionId: paymentConditions?.paymentCondition?.id || '',
//         commission: {
//           type: paymentConditions?.commission?.type,
//           supplierId: paymentConditions?.commission?.supplier?.id,
//           transferMethod: paymentConditions?.commission?.transferMethod,
//           commissionType: paymentConditions?.commission?.commissionType,
//           commissionValue: paymentConditions?.commission?.commissionValue,
//         },
//         totalValue: floatToBrl(
//           paymentConditions?.totalValue || 0,
//         ) as unknown as number,
//         // installmentQty: paymentConditions?.installments?.length || 1,
//         installments:
//           paymentConditions?.installments?.map((installment) => ({
//             id: installment.id,
//             dueDate: installment.dueDate,
//             paymentMethodId: installment.paymentMethodId,
//             additionalFee: installment.additionalFee,
//             amount: installment.amount,
//           })) || [],
//         description: paymentConditions?.description || '',
//         finalValue: floatToBrl(
//           paymentConditions?.finalValue || 0,
//         ) as unknown as number,
//       })
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [open])

//   const { fields, replace } = useFieldArray({
//     name: 'installments',
//     control,
//   })

//   const deliveryValue = quotationData?.deliveryInfo?.value ?? 0

//   const paymentMethodId = watch('paymentMethodId')
//   const paymentConditionId = watch('paymentConditionId')
//   const downPaymentPaymentConditionId = watch('downPayment.paymentConditionId')
//   const installments = watch('installments')
//   // const installmentQty = watch('installmentQty')
//   const hasDownPayment = watch('hasDownPayment')
//   const totalValue = brlToFloat(watch('totalValue') as unknown as string)
//   const finalValue = brlToFloat(watch('finalValue') as unknown as string)
//   const commissionType = watch('commission.type')
//   const downPaymentAmount =
//     hasDownPayment === 'true'
//       ? brlToFloat(watch('downPayment.amount') as unknown as string)
//       : 0

//   const { data: paymentCondition, isLoading: isLoadingPaymentCondition } =
//     usePaymentConditionById({
//       id: paymentConditionId,
//     })

//   const { data: downPaymentPaymentCondition } = usePaymentConditionById({
//     id: downPaymentPaymentConditionId,
//   })

//   const installmentsAdditionalFee =
//     paymentCondition?.installments?.reduce(
//       (acc, field) => acc + field.operatorFeeTransfer,
//       0,
//     ) || 0

//   const downPaymentAdditionalFee =
//     downPaymentPaymentCondition?.installments?.[0]?.operatorFeeTransfer || 0

//   // Atualizar quantidade de parcelas e criar novas parcelas
//   useEffect(() => {
//     if (isLoadingPaymentCondition) return

//     const quantity = paymentCondition?.installments?.length || 1
//     // setValue('installmentQty', quantity)

//     const newInstallments = Array.from({ length: quantity }, (_, i) => ({
//       dueDate: addMonths(new Date(dueDate), i),
//       paymentMethodId: paymentMethodId || '',
//       additionalFee: floatToBrl(
//         paymentCondition?.installments?.[i]?.operatorFeeTransfer || 0,
//       ) as unknown as number,
//       amount: 0,
//     }))

//     replace(newInstallments)

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [paymentCondition, isLoadingPaymentCondition, paymentMethodId])

//   // Setar valor final
//   useEffect(() => {
//     const baseFinalValue =
//       commissionType === 'ADD' ? totalValue + commissionValue : totalValue

//     const finalValuePlusDelivery = baseFinalValue + deliveryValue

//     const finalValue =
//       finalValuePlusDelivery +
//       installmentsAdditionalFee +
//       downPaymentAdditionalFee

//     setValue('finalValue', floatToBrl(finalValue) as unknown as number)
//   }, [
//     setValue,
//     totalValue,
//     deliveryValue,
//     commissionType,
//     commissionValue,
//     installmentsAdditionalFee,
//     downPaymentAdditionalFee,
//   ])

//   // Setar valores das parcelas baseado na quantidade de parcelas
//   useEffect(() => {
//     if (finalValue) {
//       // Calcular valor total a ser dividido nas parcelas (valor final menos entrada)
//       const valueToInstallments = finalValue - downPaymentAmount

//       // Calcular valor base de cada parcela
//       const baseInstallmentValue = valueToInstallments / fields.length
//       const adjustedInstallmentValue =
//         Math.floor(baseInstallmentValue * 100) / 100

//       // Ajustar diferenÃ§a de centavos na primeira parcela
//       const difference =
//         valueToInstallments - adjustedInstallmentValue * fields.length

//       fields.forEach((_, index) => {
//         const installmentValue =
//           index === 0
//             ? adjustedInstallmentValue + difference
//             : adjustedInstallmentValue

//         setValue(
//           `installments.${index}.amount`,
//           floatToBrl(installmentValue) as unknown as number,
//         )
//       })
//       handleRefreshBalance()
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [finalValue, downPaymentAmount])

//   // Setar saldo a repassar
//   const handleRefreshBalance = () => {
//     const installmentsTotalValue = installments.reduce(
//       (acc, field) => acc + brlToFloat(String(field.amount)),
//       0,
//     )

//     const newBalance = finalValue - installmentsTotalValue

//     setBalance(newBalance)

//     clearErrors('finalValue')

//     return newBalance
//   }

//   // Adicionar após o useEffect do paymentCondition
//   useEffect(() => {
//     if (downPaymentPaymentCondition) {
//       setValue(
//         'downPayment.additionalFee',
//         floatToBrl(
//           downPaymentPaymentCondition?.installments?.[0]?.operatorFeeTransfer ||
//             0,
//         ) as unknown as number,
//       )
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [downPaymentPaymentCondition])

//   const mutation = useMutation({
//     mutationFn: (body: QuotationPaymentConditionsType) =>
//       updateItem('paymentConditionsRoute', quotationData.id, body),
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ['quotation-data', quotationData.id],
//       })
//     },
//   })

//   const onSubmit = async (data: QuotationPaymentConditionsType) => {
//     // Se há entrada, o campo condição de pagamento da entrada é obrigatório
//     if (
//       data.hasDownPayment === 'true' &&
//       !data.downPayment?.paymentConditionId
//     ) {
//       setError('downPayment.paymentConditionId', {
//         message: 'Campo obrigatório',
//       })
//       return
//     }

//     // Se não há entrada, o campo valor da entrada é 0
//     if (data.hasDownPayment === 'false' && data.downPayment) {
//       data.downPayment.additionalFee = 0
//       data.downPayment.amount = 0
//     }

//     // Excluir campos que não são enviados
//     delete data.hasDownPayment
//     delete data.totalCommission
//     // delete data.installmentQty

//     console.info('Saldo a repassar: ', balance)

//     data.paymentConditionId = data.paymentConditionId.split('#')[0]

//     // Salvar alterações
//     try {
//       await mutation.mutateAsync(data)
//       toast.success('Informações de condições de pagamento salvas!')
//       setOpen(false)
//     } catch (error) {
//       toast.error('Erro ao salvar informações de condições de pagamento!')
//     }
//   }

//   const handleTest = async () => {
//     const data = form.getValues()

//     form.trigger()
//     console.info(data)
//     console.info(form.formState.errors)
//   }

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <ActionButton
//           Icon={IconPencil}
//           tooltip="Editar condições de pagamento"
//           className={cn(
//             buttonVariants({ variant: 'neutralLight', size: 'icon' }),
//           )}
//           disabled={actionDisabled('paymentConditions', quotationData?.status)}
//         />
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[950px]">
//         <DialogHeader>
//           <div className="flex items-center gap-4">
//             <FeaturedIcon variant="neutralOutline" Icon={IconCoin} />
//             <DialogTitle>Editar condições de pagamento</DialogTitle>
//           </div>
//           <DialogDescription hidden></DialogDescription>
//         </DialogHeader>
//         <DialogBody>
//           <Form {...form}>
//             <form
//               id="quotation-payment-conditions"
//               onSubmit={handleSubmit(onSubmit)}
//               noValidate
//               className="flex flex-wrap gap-4"
//             >
//               <FormSelect<QuotationPaymentConditionsType>
//                 name="type"
//                 label="Nota"
//                 options={typeOptions}
//                 width="flex-[1_0_200px]"
//               />

//               <FormSelect<QuotationPaymentConditionsType>
//                 name="billing"
//                 label="Faturamento"
//                 options={billingOptions}
//                 width="flex-[1_0_200px]"
//               />

//               <SelectPaymentMethodField<QuotationPaymentConditionsType>
//                 name="paymentMethodId"
//                 label="Forma de pagamento"
//                 width="flex-[1_0_200px]"
//                 onChange={(value) => {
//                   setValue('paymentMethodId', value)
//                   setValue('paymentConditionId', '')
//                   // setValue('installmentQty', 1)
//                 }}
//               />

//               <PaymentConditionsSelectField<QuotationPaymentConditionsType>
//                 name="paymentConditionId"
//                 label="Condição de Pagamento"
//                 width="flex-[1_0_200px]"
//                 paymentMethodId={paymentMethodId}
//               />

//               <Separator className="my-2 bg-gray-300" />

//               <FormSelect<QuotationPaymentConditionsType>
//                 name="hasDownPayment"
//                 label="Entrada"
//                 options={[
//                   { value: 'true', label: 'Sim' },
//                   { value: 'false', label: 'Não' },
//                 ]}
//                 width="flex-[1_0_200px]"
//               />

//               <FormCurrencyInput<QuotationPaymentConditionsType>
//                 control={control}
//                 name="totalCommission"
//                 label="Valor Comissão"
//                 startAdornment={<>R$</>}
//                 width="flex-[1_0_200px]"
//                 value={floatToBrl(commissionValue)}
//                 disabled
//               />

//               {/* TODO : Limitar desconto máximo, pra evitar valor total negativo */}
//               <FormCurrencyInput<QuotationPaymentConditionsType>
//                 control={control}
//                 name="discount"
//                 label="Desconto"
//                 width="flex-[1_0_200px]"
//                 className="[&>input]:-ml-1"
//                 startAdornment={
//                   <FormSelect<QuotationPaymentConditionsType>
//                     name="discountType"
//                     options={[
//                       { value: 'VALUE', label: 'R$' },
//                       { value: 'PERCENT', label: '%' },
//                     ]}
//                     width="w-[60px]"
//                     className="border-0 -ml-3.5 pr-1 text-gray-900"
//                   />
//                 }
//                 onBlur={(e) => {
//                   const inputDiscount = brlToFloat(e.target.value)

//                   const baseValue = quotationData.totalValue
//                   const discountType = getValues('discountType')

//                   let newTotalValue = baseValue

//                   if (discountType === 'VALUE') {
//                     newTotalValue = Math.max(baseValue - inputDiscount, 0)
//                   } else if (discountType === 'PERCENT') {
//                     const discountPercentage = inputDiscount / 100
//                     newTotalValue = Math.max(
//                       baseValue - baseValue * discountPercentage,
//                       0,
//                     )
//                   }

//                   setValue(
//                     'totalValue',
//                     floatToBrl(newTotalValue) as unknown as number,
//                   )
//                 }}
//               />

//               <FormCurrencyInput<QuotationPaymentConditionsType>
//                 control={control}
//                 name="totalValue"
//                 label="Valor Total"
//                 startAdornment={<>R$</>}
//                 width="flex-[1_0_200px]"
//                 onBlur={(e) => {
//                   // TODO : Limitar valor total máximo, pra eviar desconto negativo

//                   const inputTotalValue = brlToFloat(e.target.value)

//                   const discountType = getValues('discountType')

//                   let newDiscount = 0

//                   if (discountType === 'VALUE') {
//                     newDiscount = Math.max(
//                       quotationData.totalValue - inputTotalValue,
//                       0,
//                     )
//                   } else if (discountType === 'PERCENT') {
//                     newDiscount = Math.max(
//                       ((quotationData.totalValue - inputTotalValue) /
//                         quotationData.totalValue) *
//                         100,
//                       0,
//                     )
//                   }

//                   setValue(
//                     'discount',
//                     floatToBrl(newDiscount) as unknown as number,
//                   )
//                 }}
//               />

//               <Separator className="my-2 bg-gray-300" />

//               {hasDownPayment === 'true' && (
//                 <div className="flex flex-wrap items-end gap-3 p-6 bg-blue-light-50 rounded-xl border border-blue-light-300">
//                   <p className="text-sm font-medium text-gray-700 leading-[44px]">
//                     Entrada
//                   </p>
//                   <FormDatePickerSingle<QuotationPaymentConditionsType>
//                     name={`downPayment.dueDate`}
//                     label="Vencimento"
//                     width="flex-[1_0_130px]"
//                   />
//                   {/* TODO : Filtrar condições de pagamento permitidas para a entrada */}
//                   <AllPaymentConditionsSelectField<QuotationPaymentConditionsType>
//                     name={`downPayment.paymentConditionId`}
//                     label="Forma de pagamento"
//                     width="flex-[1_0_200px]"
//                   />
//                   <FormCurrencyInput<QuotationPaymentConditionsType>
//                     control={control}
//                     name={`downPayment.additionalFee`}
//                     placeholder="0,00"
//                     label="Acréscimo"
//                     startAdornment={<>R$</>}
//                     value={floatToBrl(downPaymentAdditionalFee)}
//                     disabled
//                   />
//                   {/* TODO : Ao adicionar valor de entrada, subtrair do valor a repassar pras parcelas */}
//                   <FormCurrencyInput<QuotationPaymentConditionsType>
//                     control={control}
//                     name={`downPayment.amount`}
//                     placeholder="0,00"
//                     label="Valor da entrada"
//                     startAdornment={<>R$</>}
//                     onBlur={handleRefreshBalance}
//                   />
//                 </div>
//               )}

//               <div className="bg-white rounded-xl border border-gray-300 w-full">
//                 <div
//                   className={cn(
//                     'space-y-6 p-6 pb-0',
//                     isLoadingPaymentCondition && 'opacity-40',
//                   )}
//                 >
//                   {fields.map((field, index) => (
//                     <Fragment key={field.id}>
//                       <div className="flex flex-wrap items-end gap-3">
//                         <p className="text-sm font-medium text-gray-700 leading-[44px]">
//                           {`${index + 1}/${fields.length}`}
//                         </p>
//                         <FormDatePickerSingle<QuotationPaymentConditionsType>
//                           name={`installments.${index}.dueDate`}
//                           label="Vencimento"
//                           width="flex-[1_0_130px]"
//                         />
//                         <SelectPaymentMethodField<QuotationPaymentConditionsType>
//                           name={`installments.${index}.paymentMethodId`}
//                           label="Forma de pagamento"
//                           width="flex-[1_0_200px]"
//                           disabled
//                         />
//                         <FormCurrencyInput<QuotationPaymentConditionsType>
//                           control={control}
//                           name={`installments.${index}.additionalFee`}
//                           placeholder="0,00"
//                           label="Acréscimo"
//                           startAdornment={<>R$</>}
//                           disabled
//                         />
//                         <FormCurrencyInput<QuotationPaymentConditionsType>
//                           control={control}
//                           name={`installments.${index}.amount`}
//                           placeholder="0,00"
//                           label="Valor da parcela"
//                           startAdornment={<>R$</>}
//                           onBlur={handleRefreshBalance}
//                         />
//                       </div>
//                       <Separator />
//                     </Fragment>
//                   ))}
//                 </div>
//               </div>
//               <FormTextarea<QuotationPaymentConditionsType>
//                 name="description"
//                 label="Descrição auxiliar"
//                 width="w-full"
//               />
//             </form>
//           </Form>
//         </DialogBody>
//         <DialogFooter className="sm:justify-between">
//           <div className="flex gap-6">
//             <div>
//               <p className="text-lg font-semibold text-gray-500 text-nowrap">
//                 {formatCurrencyToBrl(quotationData?.totalValue)}
//               </p>
//               <p className="text-sm font-medium text-gray-400">Valor base</p>
//             </div>
//             <HoverCard>
//               <HoverCardTrigger>
//                 <p className="text-lg font-semibold text-nowrap">
//                   R$ {watch('finalValue')}
//                 </p>
//                 <p className="text-sm font-medium text-gray-700">Valor final</p>
//               </HoverCardTrigger>
//               <HoverCardContent className="max-w-56">
//                 <div className="text-xs grid grid-cols-2 gap-1">
//                   <p className="text-gray-500">Valor base:</p>
//                   <p
//                     className={cn(
//                       'text-right',
//                       quotationData?.totalValue > 0
//                         ? 'text-success-800'
//                         : 'text-gray-400',
//                     )}
//                   >
//                     + {formatCurrencyToBrl(quotationData?.totalValue)}
//                   </p>
//                   <p className="text-gray-500">Frete:</p>
//                   <p
//                     className={cn(
//                       'text-right',
//                       deliveryValue > 0 ? 'text-success-800' : 'text-gray-400',
//                     )}
//                   >
//                     + {formatCurrencyToBrl(deliveryValue)}
//                   </p>
//                   <p className="text-gray-500">Comissão:</p>
//                   <p
//                     className={cn(
//                       'text-right',
//                       commissionType === 'ADD' && commissionValue > 0
//                         ? 'text-success-800'
//                         : 'text-gray-400',
//                     )}
//                   >
//                     +{' '}
//                     {formatCurrencyToBrl(
//                       commissionType === 'ADD' ? commissionValue : 0,
//                     )}
//                   </p>
//                   <p className="text-gray-500">Acréscimos:</p>
//                   <p
//                     className={cn(
//                       'text-right',
//                       installmentsAdditionalFee + downPaymentAdditionalFee > 0
//                         ? 'text-success-800'
//                         : 'text-gray-400',
//                     )}
//                   >
//                     +{' '}
//                     {formatCurrencyToBrl(
//                       installmentsAdditionalFee + downPaymentAdditionalFee,
//                     )}
//                   </p>
//                   <p className="text-gray-500">Desconto:</p>
//                   <p
//                     className={cn(
//                       'text-right',
//                       brlToFloat(watch('discount') as unknown as string) > 0
//                         ? 'text-error-800'
//                         : 'text-gray-400',
//                     )}
//                   >
//                     -{' '}
//                     {formatCurrencyToBrl(
//                       brlToFloat(watch('discount') as unknown as string),
//                     )}
//                   </p>
//                 </div>
//               </HoverCardContent>
//             </HoverCard>

//             <CommissionDialog
//               quotationData={quotationData}
//               commissionBaseValue={totalValue}
//               commissionValue={commissionValue}
//               setCommissionValue={setCommissionValue}
//               paymentConditionsForm={form}
//             />
//           </div>
//           <div className="space-x-4">
//             {process.env.NODE_ENV === 'development' && (
//               <Button type="button" variant="neutral" onClick={handleTest}>
//                 Teste
//               </Button>
//             )}
//             <DialogTrigger asChild>
//               <Button type="button" variant="neutralOutline">
//                 Cancelar
//               </Button>
//             </DialogTrigger>
//             <Button
//               type="submit"
//               form="quotation-payment-conditions"
//               RightIcon={IconCircleCheck}
//               isLoading={mutation.isPending}
//               disabled={isFetching > 0}
//             >
//               Salvar
//             </Button>
//           </div>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }
