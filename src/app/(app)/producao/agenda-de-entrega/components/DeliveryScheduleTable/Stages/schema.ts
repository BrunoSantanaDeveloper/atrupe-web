// // Third-party Imports
import { z } from 'zod'

// Main schema
export const stagePendingSchema = z.object({
  pendingDescription: z.string().trim().optional(),
})

export type StagePendingType = z.infer<typeof stagePendingSchema>
