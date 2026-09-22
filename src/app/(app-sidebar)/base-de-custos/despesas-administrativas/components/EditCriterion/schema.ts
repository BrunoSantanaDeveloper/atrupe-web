import { z } from 'zod'

export const editCriterionSchema = z
  .object({
    criterion: z.enum(['LAST_MONTH', 'AVG_3', 'AVG_6', 'AVG_12', 'MANUAL']),
    manualValue: z.number().nullable(),
  })
  .refine(
    (data) => data.criterion !== 'MANUAL' || (data.manualValue ?? 0) > 0,
    {
      path: ['manualValue'],
      message: 'Informe o valor mensal desta conta',
    },
  )

export type EditCriterionFormType = z.infer<typeof editCriterionSchema>
