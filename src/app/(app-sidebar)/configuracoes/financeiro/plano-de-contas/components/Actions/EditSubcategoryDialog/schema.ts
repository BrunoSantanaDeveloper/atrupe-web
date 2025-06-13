import { z } from 'zod'

export const schema = z.object({
  code: z.string().min(1, 'Digite o código').optional(),
  description: z.string().min(1, 'Digite a descrição da subcategoria'),
  finalCode: z.string().optional(),
  level1: z.string().optional().readonly(),
  level2: z.string().optional().readonly(),
  level3: z.string().min(1, 'Selecione a natureza'),
})

export type FormType = z.infer<typeof schema>
