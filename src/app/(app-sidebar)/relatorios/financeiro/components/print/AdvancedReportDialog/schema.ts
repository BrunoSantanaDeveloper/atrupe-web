import { z } from 'zod'

export const advancedReportSchema = z.object({
  format: z.enum(['pdf', 'excel']).default('pdf'),
  status: z.string().default('all'),
  natureId: z.string().optional(),
  bankAccountId: z.string().optional(),
  paymentConditionId: z.string().optional(),
  clientId: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .transform((value) => value.value)
    .nullable()
    .optional(),
  includeTransfers: z.enum(['yes', 'no']).default('yes'),
  periodType: z
    .enum(['emission', 'dueDate', 'payment', 'cancel'])
    .default('dueDate'),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
  groupBy: z.enum(['none', 'client']).default('client'),
  orderBy: z
    .enum(['saleDate', 'dueDate', 'receivedDate', 'valueDesc', 'valueAsc'])
    .default('dueDate'),
})

export type AdvancedReportFormType = z.infer<typeof advancedReportSchema>
