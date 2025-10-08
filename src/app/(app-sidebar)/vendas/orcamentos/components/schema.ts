import { z } from 'zod'

export const quotationSchema = z.object({
  companyId: z.string(),
  clientId: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .nullable()
    .refine((value) => !!value && !!value.value, {
      message: 'Selecione um cliente',
    })
    .transform((value) => value!.value),
  contactId: z.string(),
  description: z.string(),
  contactSourceId: z.string(),
  seriesId: z.string().min(1, { message: 'Selecione uma série' }),
  sellerId: z.string().min(1, { message: 'Selecione um vendedor' }),
  quickSale: z.boolean().default(false),
})

export type QuotationFormType = z.infer<typeof quotationSchema>
