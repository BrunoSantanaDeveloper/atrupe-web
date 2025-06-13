import { z } from 'zod'

export const schema = z.object({
  employeeId: z.string().min(1, 'Selecione um vendedor'),
})

export type FormType = z.infer<typeof schema>

export const defaultValues: FormType = {
  employeeId: '',
}
