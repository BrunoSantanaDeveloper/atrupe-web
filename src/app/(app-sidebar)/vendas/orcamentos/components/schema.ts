import { z } from 'zod'

export const quotationSchema = z.object({
  companyId: z.string(),
  clientId: z.string(),
  description: z.string(),
  contactType: z.string(),
  seriesId: z.string().min(1, { message: 'Selecione uma série' }),
  sellerId: z.string().min(1, { message: 'Selecione um vendedor' }),
  quickSale: z.boolean().default(false),
})

export type QuotationFormType = z.infer<typeof quotationSchema>

export const quotationDefaultValues: QuotationFormType = {
  companyId: '',
  clientId: '',
  description: '',
  contactType: '',
  seriesId: '',
  sellerId: '',
  quickSale: false,
}
