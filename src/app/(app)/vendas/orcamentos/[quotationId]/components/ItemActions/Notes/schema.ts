// // Third-party Imports
import { z } from 'zod'

// Main schema
export const itemNotesSchema = z.object({
  notes: z.string().trim(),
})

export type ItemNotesType = z.infer<typeof itemNotesSchema>
