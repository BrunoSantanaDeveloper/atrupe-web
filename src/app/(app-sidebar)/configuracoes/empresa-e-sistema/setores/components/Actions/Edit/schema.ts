import { z } from 'zod'

export const schema = z.object({
  name: z.string().min(1, { message: 'Campo obrigatório.' }),
  icon: z.string().min(1, { message: 'Campo obrigatório.' }),
  isProductionStage: z.boolean().optional(),
})

export type FormType = z.infer<typeof schema>

export const defaultValues = {
  name: '',
  icon: '',
  isProductionStage: false,
}
