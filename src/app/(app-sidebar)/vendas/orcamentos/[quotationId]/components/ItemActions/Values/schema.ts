import { z } from 'zod'

export const itemValuesSchemas = z.any()

export const itemValuesSchema = z.object({
  totalValue: z.number().readonly().optional(),
  discountType: z.string(),
  discount: z.number().nullable(),
  finalValue: z.number().optional(),
})

export type FormType = z.infer<typeof itemValuesSchema>
