// Third-party Imports
import { z } from 'zod'

export const schema = z.object({
  cancelReason: z.string().min(1, 'Campo obrigatório'),
  cancelNotes: z.string().trim(),
})

export type FormType = z.infer<typeof schema>
