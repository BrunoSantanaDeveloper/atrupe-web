import { z } from 'zod'

export const MAX_INSTALLMENTS_ALLOWED = 240

export const schema = z.object({
  name: z.string().min(1, 'Campo obrigatório.'),
  paymentMethodId: z.string().min(1, 'Campo obrigatório.'),
  acceptInstallments: z.boolean(),
  costType: z.string().min(1, 'Campo obrigatório.'),
  minInstallments: z.number().min(1, 'Campo obrigatório.').optional(),
  maxInstallments: z
    .number({
      invalid_type_error: 'Campo obrigatório.',
    })
    .min(1, 'Campo obrigatório.')
    .max(
      MAX_INSTALLMENTS_ALLOWED,
      `Permitido até ${MAX_INSTALLMENTS_ALLOWED} parcelas`,
    )
    .optional(),
  installments: z
    .array(
      z.object({
        operatorFeeRate: z.number(),
        operatorFeeTransfer: z.number(),
      }),
    )
    .optional(),
  receivingType: z.string().min(1, 'Campo obrigatório.'),
  dayInterval: z.number().min(0, 'Deve ser maior que 0'),
})

export type FormType = z.infer<typeof schema>
