import { z } from 'zod'

export const schema = z.object({
  name: z.string().min(1, { message: 'Campo obrigatório.' }),
})

export type FormType = z.infer<typeof schema>

export const defaultValues: FormType = {
  name: '',
}
