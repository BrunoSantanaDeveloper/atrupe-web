import { z } from 'zod'

export const schema = z.object({
  code: z.string().min(1, 'Digite o código'),
  finalCode: z.string().optional(),
  description: z.string().min(1, 'Digite a descrição da subcategoria'),
})

export type FormType = z.infer<typeof schema>
