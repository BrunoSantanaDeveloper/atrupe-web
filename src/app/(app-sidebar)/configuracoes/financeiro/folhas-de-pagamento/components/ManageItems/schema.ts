import { z } from 'zod'

// Types
import { PAYROLL_BEHAVIORS } from '../../types'

export const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Referência é obrigatória')
    .max(100, 'Referência deve ter no máximo 100 caracteres'),
  behavior: z.enum(PAYROLL_BEHAVIORS),
  // Centavos, como o FormBrlInput guarda
  defaultIncrease: z.number().int().min(0, 'O valor não pode ser negativo'),
  defaultDiscount: z.number().int().min(0, 'O valor não pode ser negativo'),
  // Só INSS e FGTS: percentual com até duas casas (arredondado no envio)
  rate: z
    .number({ invalid_type_error: 'Informe a alíquota' })
    .min(0, 'A alíquota precisa ficar entre 0 e 100%')
    .max(100, 'A alíquota precisa ficar entre 0 e 100%')
    .nullable(),
})

export type FormType = z.infer<typeof schema>

export const defaultValues: FormType = {
  name: '',
  behavior: 'ONLY_INCREASE',
  defaultIncrease: 0,
  defaultDiscount: 0,
  rate: null,
}
