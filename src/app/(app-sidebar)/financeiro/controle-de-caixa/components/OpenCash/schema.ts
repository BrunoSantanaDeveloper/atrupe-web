import { z } from 'zod'

export const schema = z.object({
  bankAccountId: z.string().min(1, 'Selecione uma conta bancária'),
  openingDate: z.date({
    required_error: 'Selecione uma data',
    invalid_type_error: 'Data inválida',
  }),
})

export type FormType = z.infer<typeof schema>

export const defaultValues: FormType = {
  bankAccountId: '',
  openingDate: new Date(),
}
