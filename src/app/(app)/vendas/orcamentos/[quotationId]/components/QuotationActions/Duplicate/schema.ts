// Third-party Imports
import { z } from 'zod'

export const duplicateSchemas = z.any()

export const duplicateSchema = z.object({
  clientId: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .transform((value) => value.value)
    .nullable(),
  description: z.string().trim(),
})

export type DuplicateType = z.infer<typeof duplicateSchema>

export const defaultValues = { clientId: null, description: '' }
