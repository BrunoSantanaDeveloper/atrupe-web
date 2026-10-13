import { z } from 'zod'

// Types
import { behaviorFields } from '../../types'

// O adiantamento não se cria por aqui (vem da folha de antes)
const CREATABLE = [
  'ONLY_INCREASE',
  'ONLY_DISCOUNT',
  'INCREASE_AND_DISCOUNT',
  'PROVISION',
] as const

export const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Referência é obrigatória')
      .max(100, 'Referência deve ter no máximo 100 caracteres'),
    behavior: z.enum(CREATABLE),
    // Centavos, como o FormBrlInput guarda
    defaultIncrease: z.number().int().min(0, 'O valor não pode ser negativo'),
    defaultDiscount: z.number().int().min(0, 'O valor não pode ser negativo'),
  })
  // O item entra na folha de todos com o valor padrão: como o valor único de
  // antes, ele precisa existir no lado que o comportamento usa
  .superRefine((values, ctx) => {
    const { showIncrease, showDiscount } = behaviorFields(values.behavior)
    const total =
      (showIncrease ? values.defaultIncrease : 0) +
      (showDiscount ? values.defaultDiscount : 0)

    if (total > 0) return

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [showIncrease ? 'defaultIncrease' : 'defaultDiscount'],
      message: 'Informe o valor padrão',
    })
  })

export type FormType = z.infer<typeof schema>

export const defaultValues: FormType = {
  name: '',
  behavior: 'ONLY_INCREASE',
  defaultIncrease: 0,
  defaultDiscount: 0,
}
