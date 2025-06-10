import { z } from 'zod'

export const schema = z.object({
  sourceBankAccountId: z.string().min(1, 'Selecione a conta de origem'),
  targetBankAccountId: z.string().min(1, 'Selecione a conta de destino'),
  transferMethod: z.string({
    required_error: 'Selecione a forma de transferência',
  }),
  transferDate: z.date({
    required_error: 'Selecione a data',
  }),
  amount: z.number().min(1, 'Campo obrigatório'),
})

export type FormType = z.infer<typeof schema>

export const defaultValues: FormType = {
  sourceBankAccountId: '',
  targetBankAccountId: '',
  transferMethod: 'option1',
  transferDate: new Date(),
  amount: 0,
}
