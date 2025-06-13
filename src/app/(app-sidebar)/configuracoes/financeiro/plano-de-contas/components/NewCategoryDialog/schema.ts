import { z } from 'zod'

export const schema = z.object({
  level1: z.string().min(1, 'Selecione o nível 1'),
  level2: z.string().min(1, 'Selecione o nível 2'),
  code: z.string().min(1, 'Digite o código'),
  finalCode: z.string().optional().readonly(),
  description: z.string().min(1, 'Digite a descrição da categoria'),
})

export type FormType = z.infer<typeof schema>
