import { z } from 'zod'

export const advancedSalesReportSchema = z.object({
  format: z.enum(['pdf', 'excel']).default('pdf'),
  sellerId: z.string().optional(),
  originId: z.string().optional(),
  serieId: z.string().optional(),
  clientId: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .transform((value) => value.value)
    .nullable()
    .optional(),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
  groupBy: z.enum(['none', 'client', 'seller']).default('client'),
  orderBy: z
    .enum(['approvedDate', 'valueDesc', 'valueAsc'])
    .default('approvedDate'),
})

export type AdvancedSalesReportFormType = z.infer<
  typeof advancedSalesReportSchema
>
