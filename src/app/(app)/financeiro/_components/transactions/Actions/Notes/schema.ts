// // Third-party Imports
import { z } from 'zod'

// Main schema
export const schema = z.object({
  notes: z.string().trim(),
})

export type FormType = z.infer<typeof schema>
