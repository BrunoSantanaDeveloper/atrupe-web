import { z } from 'zod'

export const schema = z.object({
  name: z.string().min(1, 'Informe o nome do perfil'),
  commission: z.number(),
  maxDiscount: z.number(),
  minValue: z.number(),
  canApprovePreRegistration: z.boolean(),
  canCancelSale: z.boolean(),
})

export type FormType = z.infer<typeof schema>
