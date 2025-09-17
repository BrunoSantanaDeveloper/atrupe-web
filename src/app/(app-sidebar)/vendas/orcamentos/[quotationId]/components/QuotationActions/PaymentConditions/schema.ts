// Third-party Imports
import { z } from 'zod'

export const quotationPaymentConditionsSchema = z.object({
  type: z.string().min(1, 'Campo obrigatório'),
  billing: z.string(),
  paymentMethodId: z.string(),
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
        additionalFee: z.number().optional(),
        amount: z.number().optional(),
      })
      .nullable()
      .optional(),
  ),
  description: z.string().trim(),
  // finalValue: z.number().optional(),

  minInstallmentQty: z.number().optional(),
  maxInstallmentQty: z.number().optional(),
  mainAdditionalFee: z.number().optional(),
  additionalFeeType: z.enum(['PERCENT', 'VALUE']).optional(),
  paymentConditionsBaseValue: z.number().optional().nullable(),
})

export type QuotationPaymentConditionsType = z.infer<
  typeof quotationPaymentConditionsSchema
>

export const quotationCommissionSchema = z.object({
  type: z
    .enum(['ADD', 'SUB'], {
      message: 'Selecione um tipo de comissão válido',
    })
    .optional()
    .nullable(),
  supplier: z.object({
    label: z.string(),
    value: z.string(),
  }),
  baseValue: z.any().optional().nullable(),
  transferMethod: z.string().optional(),
  commissionType: z.string().optional(),
  commissionValue: z.number().optional().nullable(),
  totalCommission: z.number().optional().nullable(),
})

export type QuotationCommissionType = z.infer<typeof quotationCommissionSchema>
