// Third-party Imports
import { z } from 'zod'

export const verifyEmailSchema = z.object({
  otp: z.string().min(4, ''),
})

export type VerifyEmailType = z.infer<typeof verifyEmailSchema>
