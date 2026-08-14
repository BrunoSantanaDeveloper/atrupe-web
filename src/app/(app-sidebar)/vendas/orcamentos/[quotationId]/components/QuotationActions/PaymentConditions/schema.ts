// Third-party Imports
import { z } from 'zod'

const quotationPaymentConditionsFields = z.object({
  type: z.string().min(1, 'Campo obrigatório'),
  billing: z.string(),
  paymentConditionId: z.string().min(1, 'Campo obrigatório'),
  installmentQty: z.string().optional(),
  hasDownPayment: z.string(),
  commission: z.any().optional().nullable(),

  discount: z
    .object({
      discountType: z.string(),
      discountValue: z.number().optional().nullable(),
      discountTotal: z.number().optional().nullable(),
    })
    .nullable()
    .optional(),

  totalValue: z.number(),

  downPayment: z
    .object({
      dueDate: z.date().optional(),
      paymentConditionId: z.string().optional(),
      additionalFee: z.any().optional(),
      amount: z.number().optional(),
    })
    .nullable()
    .optional(),

  installments: z.array(
    z
      .object({
        id: z.string().optional(),
        dueDate: z.date().optional(),
        paymentConditionId: z.string().optional(),
        additionalFee: z.number().optional(),
        amount: z.number().optional(),
      })
      .nullable()
      .optional(),
  ),
  description: z.string().trim(),
  finalValue: z.number().optional(),

  minInstallmentQty: z.number().optional(),
  maxInstallmentQty: z.number().optional(),
  mainAdditionalFee: z.number().optional(),
  additionalFeeType: z.enum(['PERCENT', 'VALUE']).optional(),
  paymentConditionsBaseValue: z.number().optional().nullable(),
  dayInterval: z.number().optional(),
})

// Os valores monetários deste formulário são armazenados em centavos.
export const quotationPaymentConditionsSchema =
  quotationPaymentConditionsFields.superRefine((data, ctx) => {
    const totalValue = data.totalValue || 0

    // Orçamento zerado não tem valor a distribuir, então não há o que validar
    if (totalValue <= 0) return

    const hasDownPayment = data.hasDownPayment === 'true'
    const downPaymentAmount = hasDownPayment ? data.downPayment?.amount || 0 : 0

    if (hasDownPayment) {
      if (downPaymentAmount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['downPayment', 'amount'],
          message: 'Informe o valor da entrada',
        })
      } else if (
        downPaymentAmount >= totalValue &&
        (data.installments?.length || 0) > 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['downPayment', 'amount'],
          message: 'A entrada não pode consumir todo o valor total',
        })
      }
    }

    // O valor das parcelas é calculado automaticamente (total - entrada), então
    // uma parcela zerada passa despercebida se o campo não for destacado
    data.installments?.forEach((installment, index) => {
      if ((installment?.amount || 0) > 0) return

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['installments', index, 'amount'],
        message: 'O valor da parcela deve ser maior que zero',
      })
    })
  })

export type QuotationPaymentConditionsType = z.infer<
  typeof quotationPaymentConditionsFields
>

export const quotationCommissionSchema = z.object({
  type: z
    .enum(['ADD', 'SUB'], {
      message: 'Selecione um tipo de comissão válido',
    })
    .optional()
    .nullable(),
  supplier: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .nullable(),
  baseValue: z.any().optional().nullable(),
  transferMethod: z.string().optional(),
  commissionType: z.string().optional(),
  commissionValue: z.number().optional().nullable(),
  totalCommission: z.number().optional().nullable(),
})

export type QuotationCommissionType = z.infer<typeof quotationCommissionSchema>
