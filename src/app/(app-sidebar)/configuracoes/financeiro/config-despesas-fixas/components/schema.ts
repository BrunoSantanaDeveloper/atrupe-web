import { z } from 'zod'

export const newFixedExpensesSchema = z.object({
  id: z.string().optional(),
  supplierId: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .nullable()
    .refine((value) => !!value, {
      message: 'Campo obrigatório',
    }),
  description: z
    .string({ required_error: 'Campo obrigatório' })
    .min(1, { message: 'Campo obrigatório' })
    .max(100, 'Máximo 100 caracteres'),
  categoryId: z
    .string({ required_error: 'Campo obrigatório' })
    .min(1, { message: 'Campo obrigatório' })
    .trim(),
  subCategoryId: z
    .string({ required_error: 'Campo obrigatório' })
    .min(1, { message: 'Campo obrigatório' })
    .trim(),
  recurringType: z
    .string({ required_error: 'Campo obrigatório' })
    .min(1, { message: 'Campo obrigatório' })
    .trim(),
  dueDay: z
    .number({ required_error: 'Campo obrigatório' })
    .min(1, { message: 'Deve ser entre 1 e 31' })
    .max(31, { message: 'Deve ser entre 1 e 31' }),
  amount: z.number().positive('Digite um valor'),
})

export type FixedExpensesFormType = z.infer<typeof newFixedExpensesSchema>

export const defaultFixedExpensesValues: FixedExpensesFormType = {
  // eslint-disable-next-line
  supplierId: null as any,
  description: '',
  categoryId: '',
  subCategoryId: '',
  recurringType: 'MONTHLY',
  dueDay: 1,
  amount: 0,
}
