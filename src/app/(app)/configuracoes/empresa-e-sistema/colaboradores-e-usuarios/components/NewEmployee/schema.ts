import { z } from 'zod'

export const schema = z.object({
  name: z.string().min(1, { message: 'Campo obrigatório.' }),
  sectorId: z.string().min(1, { message: 'Campo obrigatório.' }),
  roleId: z.string().min(1, { message: 'Campo obrigatório.' }),
})

export type FormType = z.infer<typeof schema>

export const defaultValues = {
  name: '',
  sectorId: '',
  roleId: '',
}
