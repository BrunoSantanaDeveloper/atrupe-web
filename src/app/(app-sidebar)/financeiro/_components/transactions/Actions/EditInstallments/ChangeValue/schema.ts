import { z } from 'zod'

export const schema = z.object({
  changeReason: z.string().min(1, 'Campo obrigatório'),
  changeNotes: z.string(),
})

export type FormType = z.infer<typeof schema>
