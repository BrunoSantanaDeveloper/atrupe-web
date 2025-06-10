// Third-party Imports
import { z } from 'zod'

export const schema = z.object({
  clientId: z.string().optional(),
  supplierId: z.string().optional(),
  description: z.string().trim(),
  subCategoryId: z.string().optional(),
  natureId: z.string().optional(),
})

export type FormType = z.infer<typeof schema>
