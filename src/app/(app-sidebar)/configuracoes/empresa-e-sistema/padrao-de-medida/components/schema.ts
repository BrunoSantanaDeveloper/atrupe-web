import { z } from 'zod'

export const schema = z.object({
  length: z.string().min(1, 'Selecione uma unidade de comprimento'),
  weight: z.string().min(1, 'Selecione uma unidade de peso'),
  capacity: z.string().min(1, 'Selecione uma unidade de capacidade'),
})

export type FormType = z.infer<typeof schema>

export const defaultValues: FormType = {
  length: '',
  weight: '',
  capacity: '',
}
