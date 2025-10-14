// Third-party Imports
import { z } from 'zod'

export const schema = z.object({
  clientId: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .transform((value) => value?.value)
    .nullable()
    .optional(),
  supplierId: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .transform((value) => value?.value)
    .nullable()
    .optional(),
  description: z.string().trim(),
  subCategoryId: z.string().optional(),
  natureId: z.string().optional(),
})

export type FormType = z.infer<typeof schema>
