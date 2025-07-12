import { z } from 'zod'

export const schema = z.object({
  length: z.string().min(1, 'Selecione uma unidade de comprimento'),
  weight: z.string().min(1, 'Selecione uma unidade de peso'),
  capacity: z.string().min(1, 'Selecione uma unidade de capacidade'), // Corrigido: era 'volume', agora é 'capacity'
})

export type FormType = z.infer<typeof schema>

export const defaultValues: FormType = {
  length: 'MM',
  weight: 'MG',
  capacity: 'ML', // Corrigido: era 'volume', agora é 'capacity'
}
