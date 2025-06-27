import { z } from 'zod'

export const schema = z.object({
  name: z.string().min(1, 'Informe o nome da categoria'),
})

export type FormType = z.infer<typeof schema>

export const defaultValues = {
  name: '',
}
