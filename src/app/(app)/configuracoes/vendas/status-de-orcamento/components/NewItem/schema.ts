import { z } from 'zod'

export const schema = z.object({
  title: z.string().min(1, 'Informe o título do status de orçamento'),
  color: z.string().min(1, 'Informe a cor do status de orçamento'),
})

export type FormType = z.infer<typeof schema>

export const defaultValues = {
  title: '',
  color: '#000000',
}
