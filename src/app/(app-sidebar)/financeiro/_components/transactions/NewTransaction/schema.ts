import { z } from 'zod'

export const MAX_INSTALLMENTS_ALLOWED = 120

export const schemas = z.any()

export const schema = z.object({
  totalValue: z.number().positive('Digite um valor').optional(),
  clientOrSupplierId: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .transform((value) => value.value)
    .nullable()
    .refine((value) => !!value, {
      message: 'Campo obrigatório',
    }),
  description: z.string(),
  natureId: z.string().min(1, 'Campo obrigatório'),
  subCategoryId: z.string().min(1, 'Campo obrigatório'),
  paymentConditionId: z.string().min(1, 'Campo obrigatório'),
  installmentQty: z
    .number()
    .min(1, 'Campo obrigatório')
    .max(
      MAX_INSTALLMENTS_ALLOWED,
      `Permitido até ${MAX_INSTALLMENTS_ALLOWED} parcelas`,
    ),
  referenceDate: z.date(),
  // ALT-9: a data de vencimento é obrigatória. z.date() sem .optional() já
  // garante isso — o TODO que ficava aqui não refletia mais o comportamento
  dueDate: z.date({ required_error: 'Campo obrigatório' }),
  notes: z.string(),
  paid: z.boolean().optional(),
  installments: z.array(
    z.object({
      // ALT-9: vale para o vencimento de cada parcela também
      dueDate: z.date({ required_error: 'Campo obrigatório' }),
      paymentConditionId: z.string().min(1, 'Campo obrigatório'),
      amount: z.number(),
      status: z.string().optional(),
      paidDate: z.date().optional(),
    }),
  ),
})

export type FormType = z.infer<typeof schema>

export const defaultValues = {
  totalValue: 0,
  clientOrSupplierId: null,
  description: '',
  natureId: '',
  subCategoryId: '',
  paymentConditionId: '',
  installmentQty: 1,
  referenceDate: new Date(),
  dueDate: new Date(),
  notes: '',
  paid: false,
  installments: [
    {
      dueDate: new Date(),
      paymentConditionId: '',
      amount: 0,
    },
  ],
}
