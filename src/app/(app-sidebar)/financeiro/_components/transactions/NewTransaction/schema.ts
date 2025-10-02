import { z } from 'zod'

export const MAX_INSTALLMENTS_ALLOWED = 120

export const schemas = z.any()

export const schema = z.object({
  totalValue: z.number().min(1, 'Digite um valor').optional(),
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
  dueDate: z.date(), // TODO : Colocar como obrigatório
  notes: z.string(),
  received: z.boolean().optional(),
  installments: z.array(
    z.object({
      dueDate: z.date(),
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
  received: false,
  installments: [
    {
      dueDate: new Date(),
      paymentConditionId: '',
      amount: 0,
    },
  ],
}
