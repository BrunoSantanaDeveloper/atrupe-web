// // Third-party Imports
import { z } from 'zod'

// Main schema
export const rowNotesSchema = z.object({
  notes: z.string().trim(),
})

export type RowNotesType = z.infer<typeof rowNotesSchema>
